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
  it("If You can Swap profitably, return 0", () => {
    // if maxInBeforePriceLimit > amountIn
    // expect a 0
  });

  it("If You need to wait one loop, return 1/Ratio", () => {});

  it("If You need to wait N loops, return 1/Ratio * N", () => {});
});
