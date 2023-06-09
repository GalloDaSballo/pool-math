/**
 * Function Equivalence
 */

import {
  makeAmountOutFunction,
  makeAmountOutGivenReservesFunction,
} from "./make";

describe("makeAmountOutGivenReservesFunction and makeAmountOutFunction are the same", () => {
  const reserves = [Math.random() * 1e18, Math.random() * 1e18];
  const amountIn = Math.random() * 1e15;

  it("velo volatile", () => {
    const getAmountOut = makeAmountOutFunction("Velo", reserves, false);
    const getAmountOutGivenReserves = makeAmountOutGivenReservesFunction(
      "Velo",
      false
    );

    const out = getAmountOut(amountIn);
    const outWithReserves = getAmountOutGivenReserves(amountIn, reserves);

    expect(out).toBe(outWithReserves);
  });
});

// TODO: Could add more, but this is enforced by TS
