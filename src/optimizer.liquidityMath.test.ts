/**
 * Function Equivalence
 */

import {
  makeAmountOutFunctionAfterProvidingReserves,
  makeAmountOutGivenReservesFunction,
} from "./make";

import {
  getPoolReserveMultiplierToAllowPriceImpactBelow,
  getPrice,
  maxInBeforePriceLimit,
} from "./optimizer";

// TODO: Test for Liquidity Math
/**
 * Proper way to test this is:
 * - Compute value
 * - Compute new reserves
 * - Go on foundry
 * - Compare the out you get
 * - Verify they are same / close within error value (satisfactory check)
 * - Verify that changing the multiplier by another error value will not offer a similar price (optimality check)
 */

describe("Find Min Multiplier Necessary to allow Price Impact to be below %", () => {
  it("If swap is already profitable, return 1", () => {
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

    const poolMul = getPoolReserveMultiplierToAllowPriceImpactBelow(
      PRICE_AFTER_IMPACT,
      testAmountIn,
      RESERVES,
      getAmountVeloGivenReserve
    );

    // Since test amount in < maxUSDCInBeforePriceChange
    expect(maxUSDCInBeforePriceChange).toBeGreaterThan(testAmountIn);
    // Multiplier is 1
    expect(poolMul).toBe(1);
  });

  it("If swap is not profitable, find the value, the check that the impact is valid, and that if we reduce the reserves by ROUNDING_ERROR, then the swap is no longer profitable", () => {
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
    const PRICE_AFTER_IMPACT_TO_FIND = veloPriceOut / 0.99;

    // Max amount before 5% impact
    const maxUSDCInBeforePriceChange = maxInBeforePriceLimit(
      PRICE_AFTER_IMPACT,
      getAmountOutVelo
    );

    // Let's say we want to swap that, but with 1% impact
    const poolMul = getPoolReserveMultiplierToAllowPriceImpactBelow(
      PRICE_AFTER_IMPACT_TO_FIND,
      maxUSDCInBeforePriceChange,
      RESERVES,
      getAmountVeloGivenReserve
    );

    // Since test amount in < maxUSDCInBeforePriceChange
    expect(maxUSDCInBeforePriceChange).toBeGreaterThan(testAmountIn);
    // Obv > 1
    expect(poolMul).toBeGreaterThan(1);

    // Back test that this makes sense
    const updatedRes = RESERVES.map((res) => res * poolMul);

    // Compute price impact on update reserves
    const newPrice = getPrice(
      maxUSDCInBeforePriceChange,
      getAmountVeloGivenReserve(maxUSDCInBeforePriceChange, updatedRes)
    );

    // Verify it's below 1% impact (satisfiability verified)
    expect(newPrice).toBeLessThan(PRICE_AFTER_IMPACT_TO_FIND);

    // Verify Optimality, if we reduce reserves by PRECISION %
    // We get that the impact is bigger
    const DRIFT_VALUE = 0.0001; // 1.1 BPS, maybe 1 but let's be safe
    const driftedReserves = RESERVES.map(
      (res) => res * (poolMul - DRIFT_VALUE)
    );

    const driftedPrice = getPrice(
      maxUSDCInBeforePriceChange,
      getAmountVeloGivenReserve(maxUSDCInBeforePriceChange, driftedReserves)
    );

    expect(driftedPrice).toBeGreaterThan(PRICE_AFTER_IMPACT_TO_FIND);
  });

  it("If swap is not profitable BAL", () => {
    // Data from 0x32296969ef14eb0c6d29669c550d4a0449130230000200000000000000000080
    const wstETH_RES = 3.6998514304359667e22;
    const WETH_RES = 4.102865823704856e22;
    const RESERVES = [wstETH_RES, WETH_RES];
    const testAmountIn = 10 ** 18;

    const getAmountBalGivenReserve = makeAmountOutGivenReservesFunction(
      "Balancer",
      true, // Needs to be stable
      {
        customRates: [1125573684330119600, 1000000000000000000],
        customA: 50000,
        customFees: 400000000000000,
      }
    );

    const getAmountOutBal = makeAmountOutFunctionAfterProvidingReserves(
      getAmountBalGivenReserve,
      RESERVES
    );

    const balOut = getAmountOutBal(testAmountIn);

    const balPriceOut = getPrice(testAmountIn, balOut);

    const PRICE_AFTER_IMPACT = balPriceOut / 0.95;
    const PRICE_AFTER_IMPACT_TO_FIND = balPriceOut / 0.99;

    // Max amount before 5% impact
    const maxUSDCInBeforePriceChange = maxInBeforePriceLimit(
      PRICE_AFTER_IMPACT,
      getAmountOutBal
    );

    // Let's say we want to swap that, but with 1% impact
    const poolMul = getPoolReserveMultiplierToAllowPriceImpactBelow(
      PRICE_AFTER_IMPACT_TO_FIND,
      maxUSDCInBeforePriceChange,
      RESERVES,
      getAmountBalGivenReserve
    );

    // Since test amount in < maxUSDCInBeforePriceChange
    expect(maxUSDCInBeforePriceChange).toBeGreaterThan(testAmountIn);
    // Obv > 1
    expect(poolMul).toBeGreaterThan(1);

    // Back test that this makes sense
    const updatedRes = RESERVES.map((res) => res * poolMul);

    // Compute price impact on update reserves
    const newPrice = getPrice(
      maxUSDCInBeforePriceChange,
      getAmountBalGivenReserve(maxUSDCInBeforePriceChange, updatedRes)
    );

    // Verify it's below 1% impact (satisfiability verified)
    expect(newPrice).toBeLessThan(PRICE_AFTER_IMPACT_TO_FIND);

    // Verify Optimality, if we reduce reserves by PRECISION %
    // We get that the impact is bigger
    const DRIFT_VALUE = 0.0002; // 2 BPS, maybe 2 but let's be safe
    const driftedReserves = RESERVES.map(
      (res) => res * (poolMul - DRIFT_VALUE)
    );

    const driftedPrice = getPrice(
      maxUSDCInBeforePriceChange,
      getAmountBalGivenReserve(maxUSDCInBeforePriceChange, driftedReserves)
    );

    expect(driftedPrice).toBeGreaterThan(PRICE_AFTER_IMPACT_TO_FIND);
  });
});
