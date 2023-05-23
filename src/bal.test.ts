import { makeAmountOutFunction } from "./make";

const comparable = (val) => Math.floor(val / 1e8);

/**
 * 
  NOTE: Foundry tests for this pool are forked
  So values change all the time
  You could change the foundry code to scrape all values and then use those

  https://optimistic.etherscan.io/address/0xBA12222222228d8Ba445958a75a0704d566BF2C8#code
  0x7b50775383d3d6f0215a8f290f2c9e2eebbeceb200020000000000000000008b
  https://optimistic.etherscan.io/address/0x9aa3cd420f830E049e2b223D0b07D8c809C94d15
 * 
 */

describe("Balancer Stable, 8 digits of imprecision", () => {
  const rates = [1125263028751930526, 1e18];

  const reserves = [1103816941445067400656, 1020049918708824070182];

  const getAmountOut = makeAmountOutFunction("Balancer", reserves, true, {
    customRates: rates,
  });

  // TODO: RATE -> Rate is applied before
  // TODO: Fix Math
  // Prob pool settings or something

  describe("Balancer wstETH WETH", () => {
    it("Velo 1", () => {
      expect(comparable(getAmountOut(1000000000000000000))).toBe(
        comparable(1124698774312831587)
      );
    });
    it("Velo 2", () => {
      expect(comparable(getAmountOut(10000000000000000000))).toBe(
        comparable(11246774022270881393)
      );
    });
    it("Velo 3", () => {
      expect(comparable(getAmountOut(50000000000000000000))).toBe(
        comparable(56229016387923591565)
      );
    });
  });
});
