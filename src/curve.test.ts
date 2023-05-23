import { makeAmountOutFunction } from "./make";

const comparable = (val) => Math.floor(val / 1e8);

/**
 * 
 Logs:
  Creating 3 Pool
  DAI i 0
  DAI amountIn (normalized) 100000000
  DAI amountIn real 100000000000000000000
  dAI amountOut of USDC 99927932
  DAI amountOut of USDC adjusted for fees 99957910
  DAI i 1
  DAI amountIn (normalized) 10000000000
  DAI amountIn real 10000000000000000000000
  dAI amountOut of USDC 9992774130
  DAI amountOut of USDC adjusted for fees 9995771962
  DAI i 2
  DAI amountIn (normalized) 150000000000
  DAI amountIn real 150000000000000000000000
  dAI amountOut of USDC 149887378636
  DAI amountOut of USDC adjusted for fees 149932344849

  uint256 DAI_IN = 5105490430369593570566334;
  uint8 DAI_DECIMALS = 18;

  uint256 USDC_IN = 2899439195495;
  uint8 USDC_DECIMALS = 6;

  uint256 USDT_IN = 1759099131964;
  uint8 USDT_DECIMALS = 6;

 * 
 */

describe("Curve Stable 3Pool", () => {
  const reserve_DAI_TO_USDC = [
    4933747819370411623659827, // DAI
    2298852718764, // USDC
    1816054842841, // USDT
  ];
  // const reserve_USDC_TO_USDT = [
  //   2899439195495, // USDC
  //   1759099131964, // USDT
  //   5105490430369593570566334, // DAI
  // ];

  const getAmountOut = makeAmountOutFunction(
    "Curve",
    reserve_DAI_TO_USDC,
    true,
    {
      customA: 200000,
      customFees: 1000000,
    }
  );

  describe("Curve 3 Pool", () => {
    it("Curve 1", () => {
      expect(getAmountOut(1000000000000000000)).toBe(999433);
    });
    it("Curve 2", () => {
      expect(getAmountOut(10000000000000000000)).toBe(9994338);
    });
  });
});

/**
 * Logs:
  Creating wstETH-ETH Pool
  NOTE: These values are wrong vs the real pool
  TODO: Investigate
  WSTETH i 0
  WSTETH amountIn 1000000000000000000
  WSTETH amountOut 999623733535533091
  WSTETH amountOut adjusted 1124694218915872695
  WSTETH i 1
  WSTETH amountIn 10000000000000000000
  WSTETH amountOut 9996233530454748428
  WSTETH amountOut adjusted 11246937908198256426
  WSTETH i 2
  WSTETH amountIn 1000000000000000000000
  WSTETH amountOut 999581723655376037910
  WSTETH amountOut adjusted 1124646952861891688490
 */
describe("Curve Stable 2Pool ETH - stETH, 8 digits of imprecision", () => {
  const reserves = [4576897448219168017515, 5130495130522892129902];

  const getAmountOut = makeAmountOutFunction("Curve", reserves, true, {
    customA: 5000,
    customFees: 4000000,
    customRates: [1125263028751930526, 1e18],
  });

  describe("Curve ETH stETH", () => {
    it("Curve 1", () => {
      expect(comparable(getAmountOut(1000000000000000000))).toBe(
        comparable(1124723495148900646)
      );
    });
    it("Curve 2", () => {
      expect(comparable(getAmountOut(10000000000000000000))).toBe(
        comparable(11246800477998450192)
      );
    });
    it("Curve 3", () => {
      expect(comparable(getAmountOut(1000000000000000000000))).toBe(
        comparable(1119683366864771305894)
      );
    });
  });
});
