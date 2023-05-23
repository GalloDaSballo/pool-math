/**
 * Function Equivalence
 */

import {
  makeAmountOutFunction,
  makeAmountOutFunctionAfterProvidingReserves,
  makeAmountOutGivenReservesFunction,
} from "./make";

import {
  getPoolDiscreteRepetitionsUntilFullLiquidatedAmount,
  getPrice,
  maxInBeforePriceLimit,
} from "./optimizer";

// TODO: Tests for Time to Recovery
/**
 * Proper way to test this is:
 * Prove mathematically
 * Each swap is maximal amount
 * Time is proportional to reserve changes
 * TBH if maxImpact works, then all we can mess up is the proportion
 * LOW PRIO
 */

const ONE_HOUR = 60 * 60;

describe("Find Min Multiplier Necessary to allow Price Impact to be below %", () => {
  it("If You can Swap profitably, return 0", () => {
    // if maxInBeforePriceLimit > amountIn
    // expect a 0

    const VELO_USDC_RESERVE = 3524722936840;
    const VELO_WETH_RESERVE = 1946696842079975062335;
    const RESERVES = [VELO_USDC_RESERVE, VELO_WETH_RESERVE];
    const testAmountIn = 10 ** 18;

    const getAmountVeloGivenReserve = makeAmountOutGivenReservesFunction(
      "Velo",
      false
    );

    const getAmountOutVelo = makeAmountOutFunctionAfterProvidingReserves(
      getAmountVeloGivenReserve,
      RESERVES
    );

    const veloOut = getAmountOutVelo(testAmountIn);

    const veloPriceOut = getPrice(testAmountIn, veloOut);

    const PRICE_AFTER_IMPACT = veloPriceOut / 0.95;

    const maxUSDCInBeforePriceChange = maxInBeforePriceLimit(
      PRICE_AFTER_IMPACT,
      getAmountOutVelo
    );

    const poolMul = getPoolDiscreteRepetitionsUntilFullLiquidatedAmount(
      PRICE_AFTER_IMPACT,
      testAmountIn,
      RESERVES,
      getAmountVeloGivenReserve,
      ONE_HOUR
    );

    // Since test amount in < maxUSDCInBeforePriceChange
    expect(maxUSDCInBeforePriceChange).toBeGreaterThan(testAmountIn);
    // Time is 0
    expect(poolMul).toBe(0);
  });

  it("If You need to wait one loop, return 1/Ratio", () => {
    // if maxInBeforePriceLimit > amountIn
    // expect a 0

    const VELO_USDC_RESERVE = 3524722936840;
    const VELO_WETH_RESERVE = 1946696842079975062335;
    const RESERVES = [VELO_USDC_RESERVE, VELO_WETH_RESERVE];
    const testAmountIn = 10 ** 18;

    const getAmountVeloGivenReserve = makeAmountOutGivenReservesFunction(
      "Velo",
      false
    );

    const getAmountOutVelo = makeAmountOutFunctionAfterProvidingReserves(
      getAmountVeloGivenReserve,
      RESERVES
    );

    const veloOut = getAmountOutVelo(testAmountIn);

    const veloPriceOut = getPrice(testAmountIn, veloOut);

    const PRICE_AFTER_IMPACT = veloPriceOut / 0.95;

    const maxUSDCInBeforePriceChange = maxInBeforePriceLimit(
      PRICE_AFTER_IMPACT,
      getAmountOutVelo
    );

    // We force a loop by adding one
    const updatedAmountIn = maxUSDCInBeforePriceChange + 1e6;

    const poolMul = getPoolDiscreteRepetitionsUntilFullLiquidatedAmount(
      PRICE_AFTER_IMPACT,
      updatedAmountIn,
      RESERVES,
      getAmountVeloGivenReserve,
      ONE_HOUR
    );

    // Since test amount in < maxUSDCInBeforePriceChange
    expect(maxUSDCInBeforePriceChange).toBeLessThan(updatedAmountIn);
    // Time is > 0
    expect(poolMul).toBeGreaterThan(0);

    // More than one hour since we add one hour each time
    expect(poolMul).toBe(ONE_HOUR);
  });

  it("If You need to wait N loops, return 1/Ratio * N", () => {
    // TODO: Figure out generalized formula
  });
});
