import { makeAmountOutFunction, makeSingleSidedWithdrawalFunction } from "./make";

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

  describe("Balancer wstETH WETH", () => {
    it("Balancer 1", () => {
      expect(comparable(getAmountOut(1000000000000000000))).toBe(
        comparable(1124698774312831587)
      );
    });
    it("Balancer 2", () => {
      expect(comparable(getAmountOut(10000000000000000000))).toBe(
        comparable(11246774022270881393)
      );
    });
    it("Balancer 3", () => {
      expect(comparable(getAmountOut(50000000000000000000))).toBe(
        comparable(56229016387923591565)
      );
    });
  });
});

describe("Balancer Weighted pool", () => {
  // example https://arbiscan.io/address/0xc9f52540976385a84bf416903e1ca3983c539e34#readContract
  const weights = [500000000000000000, 500000000000000000];
  const reserves = [32623483934735535598, 513793797226418089934];
  const getAmountOut = makeAmountOutFunction("Balancer", reserves, false, {
    customRates: weights,
  });  
  const _bptTotalSupply = 258758795898650464713;
  const _bptOutIdx = 1;
  const getSingleOutGivenBpt = makeSingleSidedWithdrawalFunction("Balancer", reserves, false, _bptTotalSupply, {
    customRates: weights,
  }, _bptOutIdx);

  describe("Balancer tBTC wETH", () => {
    it("Balancer weighted 1", () => {
      let _out = getAmountOut(100000000000000000);
      expect(_out).toBe(1569950729771657700);
    });
    it("Balancer weighted 2", () => {
      let _out = getAmountOut(1000000000000000000);
      expect(_out).toBe(15279319263156986000);
    });
    it("Balancer weighted 3", () => {
      let _out = getAmountOut(5000000000000000000);
      expect(_out).toBe(68275076046313760000);
    });
    it("Balancer weighted single-sided withdrawal 1", () => {
      // example https://arbiscan.io/tx/0x4c74a2d56a0fd561c41806d6fe66ffab87eae5d8a4407f34d993ba7f664c4fcc
      let _out = getSingleOutGivenBpt(7138911896188764);
      expect(_out).toBe(28348367030779050);
    });
  });
});
