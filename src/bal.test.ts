import { makeAmountOutFunction } from "./make";

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
 * 
 */

describe("Balancer Stable", () => {
  const fromValToRate = (val) => (val * 1124504367992424664) / 1e18;
  const reserves = [
    fromValToRate(1063322810377902132666),
    1063322810377902132666,
  ];

  const getAmountOut = makeAmountOutFunction("Balancer", reserves, true);

  // TODO: RATE
  // TODO: Fix Math
  // Prob pool settings or something

  describe("Balancer USDC WETH", () => {
    it("Velo 1", () => {
      expect(getAmountOut(fromValToRate(1000000000000000000))).toBe(
        1124945242199231826
      );
    });
    it("Velo 2", () => {
      expect(getAmountOut(fromValToRate(10000000000000000000))).toBe(
        11249251086187577318
      );
    });
    it("Velo 3", () => {
      expect(getAmountOut(fromValToRate(50000000000000000000))).toBe(
        56241757344862105392
      );
    });
  });
});
