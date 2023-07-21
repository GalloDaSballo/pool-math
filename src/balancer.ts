import { BigNumber } from "bignumber.js";
import { _calcOutGivenIn, _calcTokenOutGivenExactBptIn } from "./bal/bal-math";
import { _calcOutGivenIn as _weightedOutGivenIn, _calcTokenOutGivenExactBptIn as _weightedTokenOutGivenExactBptIn } from "./bal/weighted/weighted-math";

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
  weightIn,
  weightOut,
  amplificationParameter, // BN
  swapFeePercentage, // BN
  tokenInDecimals
): number {
  const tokenBalances = [BigNumber(reserveIn), BigNumber(reserveOut)]; // BN
  const tokenIndexIn = 0;
  const tokenIndexOut = 1;

  const tokenAmountIn = amountIn;

  const options = {
    swapFeePercentage: BigNumber(swapFeePercentage),
    tokenInDecimals,
  };

  // amplification parameter
  let _stablePool = (weightIn == 0 && weightOut == 0)? true : false;
  let out;
  if (_stablePool){
    out = _calcOutGivenIn(
             BigNumber(amplificationParameter), // A from curve
             tokenBalances, // Index in (prob 0) // TODO: See if rates are used to influence balances, if they are we adjust here and take the precision loss
             tokenIndexIn, // this._tokens.map((t) => this._upScale(t.balance, t.decimals)),
             tokenIndexOut,
             BigNumber(tokenAmountIn), // this._upScale(amountIn, tokenIn.decimals),
             options
    );
  }else {
    out = _weightedOutGivenIn(
             BigNumber(reserveIn),
             BigNumber(weightIn),
             BigNumber(reserveOut),
             BigNumber(weightOut),
             BigNumber(tokenAmountIn),
             options
    );
  }

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
  tokenInDecimals: number = DEFAULT_TOKEN_DECIMALS,
  customRates: number[] = [1e18, 1e18]
) {
  
  if (stable !== true) {
    // get weighted pool output
    // we use customRates as token weights for weighted pool
    return Math.floor(
            getAmountOutInternal(
                  amountIn,
                  reserveIn,
                  reserveOut,
                  customRates[0], customRates[1],
                  amplificationParameter,
                  swapFeePercentage,
                  tokenInDecimals
            )
    );  
  } 
  
  if (customRates[0] != 1e18 || customRates[1] != 1e18) {
    amountIn = (amountIn * customRates[0]) / 1e18;
    reserveIn = (reserveIn * customRates[0]) / 1e18;
    reserveOut = (reserveOut * customRates[1]) / 1e18;
  }

  return Math.floor(
    getAmountOutInternal(
      amountIn,
      reserveIn,
      reserveOut,
      0, 0,
      amplificationParameter,
      swapFeePercentage,
      tokenInDecimals
    )
  );
}

/**
 * Given params returns the amount of single token you'd get if performing a single-sided withdrawal
 */
export function getSingleSidedWithdrawalOut(
  amountIn: number,
  reserveIn: number, // NOTE: These should be called reserve0 and 1 since we always get 0 out
  reserveOut: number,
  amplificationParameter: number = DEFAUT_A,
  swapFeePercentage: number = DEFAUT_FEE,
  customRates: number[] = [1e18, 1e18],
  totalSupply: number,
  stable
): number {	
  
  if (stable !== true) {
    // get weighted pool output
    // we use customRates as token weights for weighted pool
    const out = _weightedTokenOutGivenExactBptIn(
                     BigNumber(reserveIn),
                     BigNumber(customRates[0]),
                     BigNumber(amountIn),
                     BigNumber(totalSupply),
                     BigNumber(swapFeePercentage)
    );
    return parseInt(out.toString(), 10);  
  }
  
  if (customRates[0] != 1e18 || customRates[1] != 1e18) {
    amountIn = (amountIn * customRates[0]) / 1e18;
    reserveIn = (reserveIn * customRates[0]) / 1e18;
    reserveOut = (reserveOut * customRates[1]) / 1e18;
  }

  const out = _calcTokenOutGivenExactBptIn(
    BigNumber(amplificationParameter),
    [BigNumber(reserveIn), BigNumber(reserveOut)],
    0, // NOTE: Hardcoded 0 index, we sort in make
    BigNumber(amountIn),
    BigNumber(totalSupply),
    BigNumber(swapFeePercentage)
  );

  return parseInt(out.toString(), 10);
}
