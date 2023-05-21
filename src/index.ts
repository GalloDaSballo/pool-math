import { getAmountOut as CurveGetAmoutOut } from "./curve/omni_pool";
import { getAmountOut as balGetAmountOut } from "./balancer";
import { getAmountOut as veloGetAmountOut } from "./velo";
import { maxInBeforePriceLimit, getPrice } from "./optimizer";

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
// NOTE: This looks off

const USDC_RESERVE = 3522525561456;
const WETH_RESERVE = 1947911204797905328312;
const testAmountIn = 10 ** 6;

const veloAmountOutFunction = (amountIn) => {
  return veloGetAmountOut(amountIn, USDC_RESERVE, WETH_RESERVE, false);
};

const veloOut = veloAmountOutFunction(testAmountIn);

console.log(
  "veloAmountOutFunction(12000000000, 1859798333449789481797, 3403973201396, false)",
  veloOut
);

// const veloPriceOut = getPrice(testAmountIn, veloOut);

// const maxUSDCInBeforePriceChange = maxInBeforePriceLimit(
//   veloPriceOut / 0.95,
//   veloAmountOutFunction
// );
// console.log("Found Velo Max", maxUSDCInBeforePriceChange);
// const veloWethOut = veloAmountOutFunction(maxUSDCInBeforePriceChange);
// console.log("Whi results in  veloWethOut,", veloWethOut);
