import { makeAmountOutFunction } from "./make";

const comparable = (val) => Math.floor(val / 1e8);

/**
 * 
  Creating wstETH WETH Pool
  wstETH i 0
  wstETH amountIn (raw) 1000000000000000000
  WETH amountOut (raw) 1124945242199231826
  wstETH i 1
  wstETH amountIn (raw) 10000000000000000000
  WETH amountOut (raw) 11249251086187577318
  wstETH i 2
  wstETH amountIn (raw) 50000000000000000000
  WETH amountOut (raw) 56241757344862105392

  // Rest
  wstETH i 3
  wstETH amountIn (raw) 100000000000000000000
  WETH amountOut (raw) 112472058193466122052
  wstETH i 4
  wstETH amountIn (raw) 150000000000000000000
  WETH amountOut (raw) 168690298114089190014

  uint256 WST_ETH_BAL = 1063322810377902132666;
  uint256 WST_ETH_RATE = 1124504367992424664;

  uint256 WETH_BAL = 1063322810377902132666;
  uint8 DECIMALS = 18;

  https://optimistic.etherscan.io/address/0xBA12222222228d8Ba445958a75a0704d566BF2C8#code
  0x7b50775383d3d6f0215a8f290f2c9e2eebbeceb200020000000000000000008b
  https://optimistic.etherscan.io/address/0x9aa3cd420f830E049e2b223D0b07D8c809C94d15
 * 
 */

describe("Balancer Stable, 8 digits of imprecision", () => {
  const fromValToRate = (val) => (val * 1125263028751930526) / 1e18;
  const reserves = [
    fromValToRate(1103816941445067400656),
    1020049918708824070182,
  ];

  const getAmountOut = makeAmountOutFunction("Balancer", reserves, true);

  // TODO: RATE
  // TODO: Fix Math
  // Prob pool settings or something

  describe("Balancer wstETH WETH", () => {
    it("Velo 1", () => {
      expect(comparable(getAmountOut(fromValToRate(1000000000000000000)))).toBe(
        comparable(1124698774312831587)
      );
    });
    it("Velo 2", () => {
      expect(
        comparable(getAmountOut(fromValToRate(10000000000000000000)))
      ).toBe(comparable(11246774022270881393));
    });
    it("Velo 3", () => {
      expect(
        comparable(getAmountOut(fromValToRate(50000000000000000000)))
      ).toBe(comparable(56229016387923591565));
    });
  });
});
