import { getAmountOut as CurveGetAmoutOut } from "./curve/omni_pool";
import { getAmountOut as balGetAmountOut } from "./balancer";
import { getAmountOut as veloGetAmountOut } from "./velo";
import {
  maxInBeforePriceLimit,
  getPrice,
  getPoolReserveMultiplierToAllowPriceImpactBelow,
  getPoolDiscreteRepetitionsUntilFullLiquidatedAmount,
} from "./optimizer";
import { makeAmountOutGivenReservesFunction } from "./make";
/**
 * TVL Library
 */

export interface SystemState {
  // AMT of tokens, either use or ignore decimals, it's fine
  deposited: number;
  borrowed: number;

  // In BPS
  ltv: number;
  borrowFactor: number;
  liquidationThreshold: number;
}

// TODO: Pool tokenA, tokenB, Liquidity?

/** CURVE EXAMPLES */

const three_pool_rates_usdc_to_dai = [
  1000000000000000000000000000000,
  1000000000000000000,
  1000000000000000000000000000000,
];

const amtTriPoolUsdc = CurveGetAmoutOut(
  100 * 1e6,
  [2738401408546, 4700881625647576767752533, 1926446313194],
  true,
  three_pool_rates_usdc_to_dai,
  1000000,
  200000
);
console.log("getAmountOut amtTriPoolUsdc", amtTriPoolUsdc);

// It's dai now
const startPrice = getPrice(100 * 1e6, amtTriPoolUsdc);

const curveAmountOutFunction = (amountIn) => {
  return CurveGetAmoutOut(
    amountIn,
    [2738401408546, 4700881625647576767752533, 1926446313194],
    true,
    three_pool_rates_usdc_to_dai,
    1000000,
    200000
  );
};

// 5% of price impact on 3pool
const maxUSDCInBeforeOut = maxInBeforePriceLimit(
  startPrice / 0.95,
  curveAmountOutFunction
);
console.log("Found Curve Max", maxUSDCInBeforeOut);

const amtDAI = curveAmountOutFunction(maxUSDCInBeforeOut);
console.log("Whi results in DAI,", amtDAI);

/** BALANCER EXAMPLES */

const RATE = 1124977908697709180;
const DIVISOR = 1e18;
function adjustForWstEth(amountIn) {
  return (amountIn * RATE) / DIVISOR;
}

const balancerRateProvidedAmountOutFunction = (amountIn) => {
  // NOTE: Because we use rateProvider for token0, we apply it here
  const providedAmountIn = adjustForWstEth(amountIn);
  return balGetAmountOut(
    providedAmountIn,
    adjustForWstEth(976887777960310392675),
    1197212307200625709466,
    true
  );
};

const oneStEthBal = balancerRateProvidedAmountOutFunction(1e18);

const oneStEthPrice = getPrice(1e18, oneStEthBal);

console.log("getAmountOut() 1 stETH Bal", oneStEthBal);
const maxStEthBeforeImpact = maxInBeforePriceLimit(
  oneStEthPrice / 0.99,
  balancerRateProvidedAmountOutFunction
);
console.log("Found Bal Max", maxStEthBeforeImpact);
const amtWETH = balancerRateProvidedAmountOutFunction(maxStEthBeforeImpact);
console.log("Whi results in  amtWETH,", amtWETH);
// NOTE: This looks off, mostly because Beets website will not allow any slippage
// TODO: Test vs Code

/** VELODROME */

const USDC_RESERVE = 3524722936840;
const WETH_RESERVE = 1946696842079975062335;
const testAmountIn = 10 ** 6;

const veloAmountOutFunction = (amountIn) => {
  return veloGetAmountOut(amountIn, USDC_RESERVE, WETH_RESERVE, false);
};

const veloOut = veloAmountOutFunction(testAmountIn);

console.log(
  "veloAmountOutFunction(12000000000, 1859798333449789481797, 3403973201396, false)",
  veloOut
);

const veloPriceOut = getPrice(testAmountIn, veloOut);
console.log("veloPriceOut", veloPriceOut);
const veloPriceOutWithSlippage = veloPriceOut / 0.95;
console.log("veloPriceOutWithSlippage", veloPriceOutWithSlippage);

const maxUSDCInBeforePriceChange = maxInBeforePriceLimit(
  veloPriceOutWithSlippage,
  veloAmountOutFunction
);
console.log("Found Velo Max", maxUSDCInBeforePriceChange);
const veloWethOut = veloAmountOutFunction(maxUSDCInBeforePriceChange);
console.log("Whi results in  veloWethOut,", veloWethOut);

/** * TODO: NEW CODE */

// We know 5% impact happens at
const veloGetAmoutOutGivenReserves = makeAmountOutGivenReservesFunction(
  "Velo",
  false
);

const spotAmount = 1e6;
const spotPrice = getPrice(spotAmount, veloAmountOutFunction(spotAmount));
console.log("spotPrice", spotPrice);
const ninetyNine = spotPrice / 0.99;
console.log("ninetyNine", ninetyNine);

const res = getPoolReserveMultiplierToAllowPriceImpactBelow(
  ninetyNine,
  testAmountIn * 100000,
  [USDC_RESERVE, WETH_RESERVE],
  veloGetAmoutOutGivenReserves
);

console.log("multiplier", res);

const amountOutWithNewRes = veloGetAmoutOutGivenReserves(
  testAmountIn * 100000,
  [USDC_RESERVE, WETH_RESERVE].map((val) => val * res)
);
const newPrice = getPrice(testAmountIn * 100000, amountOutWithNewRes);
console.log("newPrice", newPrice);
console.log("ninetyNine", newPrice);
console.log("spotPrice", spotPrice);

// TODO: Write a test for this pls ser
const ONE_HOUR = 60 * 60;

const timeToSellTotalAmountWithoutMultiplier = getPoolDiscreteRepetitionsUntilFullLiquidatedAmount(
  ninetyNine,
  testAmountIn * 100000,
  [USDC_RESERVE, WETH_RESERVE],
  veloGetAmoutOutGivenReserves,
  ONE_HOUR
);

console.log(
  "To dump we need (in seconds)",
  timeToSellTotalAmountWithoutMultiplier
);

console.log(
  "To dump we need (in hours)",
  timeToSellTotalAmountWithoutMultiplier / ONE_HOUR
);
