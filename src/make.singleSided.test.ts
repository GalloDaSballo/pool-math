/**
 * Function Equivalence
 */

import { calc_withdraw_one_coin } from "./curve/omni_pool";
import {
  makeSingleSidedWithdrawalFunctionAfterProvidingReserves,
  makeSingleSidedWithdrawalFunction,
  makeSingleSidedWithdrawalGivenReserves,
} from "./make";

describe("makeSingleSidedWithdrawalFunction and makeSingleSidedWithdrawalFunctionAfterProvidingReserves are the same and they are as accurate", () => {
  const STABLE_FEES = 4000000;
  const A = 5000;
  const totalSupply = 9650569439382636853079;
  const balances = [4540302536030246428213, 5110270280714989617844];
  const rates = [1e18, 1e18];

  const AMT_IN = 128674259191768491374;

  const referenceGetAmountOut = (amtIn, i) => {
    return calc_withdraw_one_coin(
      amtIn,
      i,
      A,
      rates,
      balances,
      totalSupply,
      STABLE_FEES
    );
  };

  it("Curve 2 Pool makeSingleSidedWithdrawalFunction vs reference data from - LP -> 0 C", () => {
    const getAmountOutFunction = makeSingleSidedWithdrawalFunction(
      "Curve",
      balances,
      true,
      totalSupply,
      {
        customRates: rates,
        customA: A,
        customFees: STABLE_FEES,
      }
    );

    const amountOutFromReference = referenceGetAmountOut(AMT_IN, 0);
    const amountOutFromMake = getAmountOutFunction(AMT_IN);

    expect(amountOutFromReference).toBe(amountOutFromMake);
  });

  it("Curve 2 Pool makeSingleSidedWithdrawalFunctionAfterProvidingReserves vs reference data from - LP -> 0 C", () => {
    const getAmountFirstFunction = makeSingleSidedWithdrawalGivenReserves(
      "Curve",
      true,
      totalSupply,
      {
        customRates: rates,
        customA: A,
        customFees: STABLE_FEES,
      }
    );
    const amountOutMakeFunction = makeSingleSidedWithdrawalFunctionAfterProvidingReserves(
      getAmountFirstFunction,
      balances
    );

    const amountOutFromReference = referenceGetAmountOut(AMT_IN, 0);
    const amountOutFromMake = amountOutMakeFunction(AMT_IN);

    expect(amountOutFromReference).toBe(amountOutFromMake);
  });
});
