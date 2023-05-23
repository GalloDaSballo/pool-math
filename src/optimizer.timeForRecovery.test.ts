/**
 * Function Equivalence
 */

import { makeAmountOutFunction } from "./make";

import { getPrice, maxInBeforePriceLimit } from "./optimizer";

// TODO: Tests for Time to Recovery
/**
 * Proper way to test this is:
 * Prove mathematically
 * Each swap is maximal amount
 * Time is proportional to reserve changes
 * TBH if maxImpact works, then all we can mess up is the proportion
 * LOW PRIO
 */

describe("Find Min Multiplier Necessary to allow Price Impact to be below %", () => {
  it("Find Min Multiplier Amount In Velo Volatile", () => {
    expect(0).toBe(1);

    // TODO: ALL OF THESE
    const VELO_USDC_RESERVE = 3524722936840;
    const VELO_WETH_RESERVE = 1946696842079975062335;
    const RESERVES = [VELO_USDC_RESERVE, VELO_WETH_RESERVE];
    const testAmountIn = 10 ** 18;

    const getAmountOutVelo = makeAmountOutFunction("Velo", RESERVES, false);

    const veloOut = getAmountOutVelo(testAmountIn);

    const veloPriceOut = getPrice(testAmountIn, veloOut);

    const PRICE_AFTER_IMPACT = veloPriceOut / 0.95;

    const maxUSDCInBeforePriceChange = maxInBeforePriceLimit(
      PRICE_AFTER_IMPACT,
      getAmountOutVelo
    );

    const veloWethOut = getAmountOutVelo(maxUSDCInBeforePriceChange);

    const priceOutCheck = getPrice(maxUSDCInBeforePriceChange, veloWethOut);

    expect(priceOutCheck).toBe(PRICE_AFTER_IMPACT);
  });

  it("Find Min Multiplier Amount In Curve", () => {
    const three_pool_rates_usdc_to_dai = [
      1000000000000000000000000000000,
      1000000000000000000,
      1000000000000000000000000000000,
    ];

    const CURVE_RESERVES = [
      2738401408546,
      4700881625647576767752533,
      1926446313194,
    ]; // USDC, DAI, USDT

    const curveAmountOutFunction = makeAmountOutFunction(
      "Curve",
      CURVE_RESERVES,
      true,
      {
        customRates: three_pool_rates_usdc_to_dai,
        customFees: 1000000,
        customA: 200000,
      }
    );

    const INITIAL_AMOUNT_IN_USDC = 100 * 1e6;

    const amtTriPoolUsdc = curveAmountOutFunction(INITIAL_AMOUNT_IN_USDC);

    // It's dai now
    const startPrice = getPrice(INITIAL_AMOUNT_IN_USDC, amtTriPoolUsdc);

    const PRICE_AFTER_IMPACT = startPrice / 0.95;

    // 5% of price impact on 3pool
    const maxUSDCInBeforeOut = maxInBeforePriceLimit(
      PRICE_AFTER_IMPACT,
      curveAmountOutFunction
    );

    const amtDAI = curveAmountOutFunction(maxUSDCInBeforeOut);

    const priceOutCheck = getPrice(maxUSDCInBeforeOut, amtDAI);

    expect(priceOutCheck).toBe(PRICE_AFTER_IMPACT);
  });

  it("Find Min Multiplier Amount In Curve", () => {
    const WSTETH_WETH_RESERVES = [
      976887777960310392675,
      1197212307200625709466,
    ];

    const balancerRateProvidedAmountOutFunction = makeAmountOutFunction(
      "Balancer",
      WSTETH_WETH_RESERVES,
      true,
      {
        customRates: [1124977908697709180, 1e18],
      }
    );

    const oneStEthBal = balancerRateProvidedAmountOutFunction(1e18);

    const oneStEthPrice = getPrice(1e18, oneStEthBal);

    const PRICE_AFTER_IMPACT = oneStEthPrice / 0.95;

    const maxStEthBeforeImpact = maxInBeforePriceLimit(
      PRICE_AFTER_IMPACT,
      balancerRateProvidedAmountOutFunction
    );
    const amtWETH = balancerRateProvidedAmountOutFunction(maxStEthBeforeImpact);

    const priceOutCheck = getPrice(maxStEthBeforeImpact, amtWETH);

    expect(priceOutCheck).toBe(PRICE_AFTER_IMPACT);
  });
});
