import { BigNumber } from "bignumber.js";
import { _calcOutGivenIn } from "./bal/bal-math";

// NOTE: This is for stable math

const DEFAUT_A = BigNumber("500000");
const DEFAUT_FEE = BigNumber("100000000000000");
const DEFAULT_TOKEN_DECIMALS = 18;

/**
 * Basic version of getAmountOutInternal, with safe defaults
 * Use `getAdvancedOut` if you need more fine tuning
 * @param amountIn
 * @param reserveIn
 * @param reserveOut
 * @param stable
 * @param amplificationParameter
 * @param swapFeePercentage
 * @param tokenInDecimals
 * @returns
 */
function getAmountOutInternal(
  amountIn,
  reserveIn,
  reserveOut,
  stable,
  amplificationParameter = DEFAUT_A, // BN
  swapFeePercentage = DEFAUT_FEE, // BN
  tokenInDecimals = DEFAULT_TOKEN_DECIMALS
): number {
  if (stable !== true) {
    throw Error("Not implemented, balancer is only for stable");
  }

  const tokenBalances = [reserveIn, reserveOut]; // BN
  const tokenIndexIn = 0; // BN
  const tokenIndexOut = 1;

  const tokenAmountIn = amountIn;

  const options = {
    swapFeePercentage,
    tokenInDecimals,
  };

  // amplification parameter
  const out = _calcOutGivenIn(
    amplificationParameter, // A from curve
    tokenBalances, // Index in (prob 0) // TODO: See if rates are used to influence balances, if they are we adjust here and take the precision loss
    tokenIndexIn, //       this._tokens.map((t) => this._upScale(t.balance, t.decimals)),
    tokenIndexOut,
    tokenAmountIn, //       this._upScale(amountIn, tokenIn.decimals),
    options
  );

  return parseInt(out.toString(), 10);
}

function getAdvancedOut(
  amountIn,
  reserveIn,
  reserveOut,
  stable,
  amplificationParameter,
  swapFeePercentage,
  tokenInDecimals
) {
  return getAmountOutInternal(
    amountIn,
    reserveIn,
    reserveOut,
    stable,
    amplificationParameter,
    swapFeePercentage,
    tokenInDecimals
  );
}

// From ETH to wstETH -> Add the rate from oracle, then go for it

// wstETH - ETH Pool
// https://etherscan.io/address/0x32296969ef14eb0c6d29669c550d4a0449130230

/**
 * [ getPoolTokens(bytes32) method Response ]
  tokens   address[] :  
[[0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0] wstETH
[0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2]] WETH
  balances   uint256[] :  44927367147069128886805,50584780108934902640531
  lastChangeBlock   uint256 :  17277491
 */
const RATE = 1124349506893718109;
const DIVISOR = 1e18;
function adjustForWstEth(amountIn) {
  return (amountIn * RATE) / DIVISOR;
}

// console.log(
//   "getAmountOutInternal()",
//   getAmountOutInternal(
//     adjustForWstEth(1e18),
//     BigNumber(adjustForWstEth(44927367147069128886805)),
//     BigNumber(50584780108934902640531),
//     true
//   )
// );

// console.log(
//   "getAmountOutInternal() 19500",
//   getAmountOutInternal(
//     adjustForWstEth(19500e18),
//     BigNumber(adjustForWstEth(44927367147069128886805)),
//     BigNumber(50584780108934902640531),
//     true
//   )
// );

// 1147236160660854395722,1305533994569826426151
console.log(
  "getAmountOutInternal() 1",
  getAmountOutInternal(
    adjustForWstEth(1e18),
    BigNumber(adjustForWstEth(1147236160660854395722)),
    BigNumber(1305533994569826426151),
    true
  )
);

console.log(
  "getAmountOutInternal() 110e18",
  getAmountOutInternal(
    adjustForWstEth(110e18),
    BigNumber(adjustForWstEth(1147236160660854395722)),
    BigNumber(1305533994569826426151),
    true
  )
);

export function getAmountOut(amountIn, reserveIn, reserveOut, stable) {
  return getAmountOutInternal(
    BigNumber(amountIn),
    BigNumber(reserveIn),
    BigNumber(reserveOut),
    stable
  );
}
