/**
 * 
 * Logs:
  Creating USDC-ETH Pool
  USDC i 0
  USDC amountIn 100000000
  WETH amountOut 55117020950555282
  USDC i 1
  USDC amountIn 10000000000
  WETH amountOut 5495206151677287377
  USDC i 2
  USDC amountIn 1000000000000
  WETH amountOut 422939331486138747104

  // NOTE: These last 2 are accurate up to 6 digits
  USDC i 3
  USDC amountIn 5000000000000
  WETH amountOut 1095299774782376576231
  USDC i 4
  USDC amountIn 25000000000000
  WETH amountOut 1605885472415214981926
 */
import { makeAmountOutFunction } from "./make";

describe("Velo Volatile", () => {
  const reserves = [3296185590291, 1817723253459044368326];

  const getAmountOut = makeAmountOutFunction("Velo", reserves, false);

  describe("Velo USDC WETH", () => {
    it("Velo 1", () => {
      expect(getAmountOut(100000000)).toBe(55117020950555282);
    });
    it("Velo 2", () => {
      expect(getAmountOut(10000000000)).toBe(5495206151677287377);
    });
    it("Velo 3", () => {
      expect(getAmountOut(1000000000000)).toBe(422939331486138747104);
    });
  });
});

/**
 *         uint256 USDC_IN = 1378798585397;
        uint8 USDC_DECIMALS = 6;
        uint256 USDT_IN = 1204218837708;
          Creating USDC-USDT Pool
  USDC i 0
  USDC amountIn 100000000
  USDT amountOut 99888194
  USDC i 1
  USDC amountIn 10000000000
  USDT amountOut 9987688072
  USDC i 2
  USDC amountIn 1000000000000
  USDT amountOut 802086402141

  // TODO: Rounding?
  USDC i 3
  USDC amountIn 5000000000000
  USDT amountOut 1182755392469
  USDC i 4
  USDC amountIn 25000000000000
  USDT amountOut 1203915264950
 */
describe("Velo Stable", () => {
  //
  const reserves = [1378798585397, 1204218837708];

  const getAmountOut = makeAmountOutFunction("Velo", reserves, true, {
    customDecimals: [1e6, 1e6],
  });

  describe("Velo USDC USDT", () => {
    it("Velo 1", () => {
      expect(getAmountOut(100000000)).toBe(99888194);
    });
    it("Velo 2", () => {
      expect(getAmountOut(10000000000)).toBe(9987688072);
    });
    it("Velo 3", () => {
      expect(getAmountOut(1000000000000)).toBe(802086402141);
    });
  });
});
