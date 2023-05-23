import { BigNumber } from "bignumber.js";
import { _calcOutGivenIn } from "./bal/bal-math";

// NOTE: This is for stable math

const DEFAUT_A = 500000;
const DEFAUT_FEE = 100000000000000;
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
  amplificationParameter, // BN
  swapFeePercentage, // BN
  tokenInDecimals
): number {
  if (stable !== true) {
    throw Error("Not implemented, balancer is only for stable");
  }

  const tokenBalances = [BigNumber(reserveIn), BigNumber(reserveOut)]; // BN
  const tokenIndexIn = 0;
  const tokenIndexOut = 1;

  const tokenAmountIn = amountIn;

  const options = {
    swapFeePercentage: BigNumber(swapFeePercentage),
    tokenInDecimals,
  };

  // amplification parameter
  const out = _calcOutGivenIn(
    BigNumber(amplificationParameter), // A from curve
    tokenBalances, // Index in (prob 0) // TODO: See if rates are used to influence balances, if they are we adjust here and take the precision loss
    tokenIndexIn, //       this._tokens.map((t) => this._upScale(t.balance, t.decimals)),
    tokenIndexOut,
    BigNumber(tokenAmountIn), //       this._upScale(amountIn, tokenIn.decimals),
    options
  );

  return parseInt(out.toString(), 10);
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
export function getAmountOut(
  amountIn: number,
  reserveIn: number,
  reserveOut: number,
  stable: boolean,
  amplificationParameter: number = DEFAUT_A,
  swapFeePercentage: number = DEFAUT_FEE,
  tokenInDecimals: number = DEFAULT_TOKEN_DECIMALS
) {
  return Math.floor(
    getAmountOutInternal(
      amountIn,
      reserveIn,
      reserveOut,
      stable,
      amplificationParameter,
      swapFeePercentage,
      tokenInDecimals
    )
  );
}
