import { makeAmountOutFunction } from "./make";

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
  DAI i 3
  DAI amountIn (normalized) 2000000000000
  DAI amountIn real 2000000000000000000000000
  dAI amountOut of USDC 1996381386093
  DAI amountOut of USDC adjusted for fees 1996980300508
  DAI i 4
  DAI amountIn (normalized) 15000000000000
  DAI amountIn real 15000000000000000000000000
  dAI amountOut of USDC 2898148428893
  DAI amountOut of USDC adjusted for fees 2899017873421
  USDC i 0
  USDC amountIn 100000000
  USDC amountOut of USDT 99911911
  USDC amountOut of USDT adjusted for fees 99941884
  USDC i 1
  USDC amountIn 10000000000
  USDC amountOut of USDT 9991138629
  USDC amountOut of USDT adjusted for fees 9994135970
  USDC i 2
  USDC amountIn 150000000000
  USDC amountOut of USDT 149855183431
  USDC amountOut of USDT adjusted for fees 149900139986
  USDC i 3
  USDC amountIn 2000000000000
  USDC amountOut of USDT 1749498841040
  USDC amountOut of USDT adjusted for fees 1750023690692
  USDC i 4
  USDC amountIn 15000000000000
  USDC amountOut of USDT 1758349161798
  USDC amountOut of USDT adjusted for fees 1758876666546

  uint256 DAI_IN = 5105490430369593570566334;
  uint8 DAI_DECIMALS = 18;

  uint256 USDC_IN = 2899439195495;
  uint8 USDC_DECIMALS = 6;

  uint256 USDT_IN = 1759099131964;
  uint8 USDT_DECIMALS = 6;

 * 
 */

// describe("Curve Stable 3Pool", () => {
//   const reserve_DAI_TO_USDC = [
//     5105490430369593570566334,
//     2899439195495,
//     1759099131964,
//   ];
//   const reserve_USDC_TO_USDT = [
//     2899439195495,
//     1759099131964,
//     5105490430369593570566334,
//   ];

//   const getAmountOut = makeAmountOutFunction(
//     "Curve",
//     reserve_DAI_TO_USDC,
//     true
//   );

// TODO: RATE
// TODO: Fix Math
// Prob pool settings or something

//   describe("Curve 3 Pool", () => {
//     it("Curve 1", () => {
//       expect(getAmountOut(1000000000000000000)).toBe(1124945242199231826);
//     });
//     it("Curve 2", () => {
//       expect(getAmountOut(10000000000000000000)).toBe(11249251086187577318);
//     });
//     it("Curve 3", () => {
//       expect(getAmountOut(150000000000)).toBe(56241757344862105392);
//     });
//   });
// });

/**
 * Logs:
  Creating wstETH-ETH Pool
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
  WSTETH i 3
  WSTETH amountIn 10000000000000000000000
  WSTETH amountOut 5107910343084679597205
  WSTETH amountOut adjusted 5746999636842578408457
  WSTETH i 4
  WSTETH amountIn 100000000000000000000000
  WSTETH amountOut 5108223908387662007404
  WSTETH amountOut adjusted 5747352434672087310177

  uint256 WSTETH_IN = 4540302536030246428213;
  uint8 WSTETH_DECIMALS = 18;

  uint256 WETH_IN = 5110270280714989617844;
  uint8 WETH_DECIMALS = 18;
 */
describe("Curve Stable 2Pool ETH - stETH", () => {
  const reserves = [5110270280714989617844, 4540302536030246428213];

  // TODO: rate
  const getAmountOut = makeAmountOutFunction("Curve", reserves, true, {
    customA: 5000,
    customFees: 4000000,
    customRates: [1e18, 1e18],
  });

  // TODO: RATE
  // TODO: Fix Math
  // Prob pool settings or something

  describe("Curve ETH stETH", () => {
    it("Curve 1", () => {
      expect(getAmountOut(1000000000000000000)).toBe(999623733535533091);
    });
    it("Curve 2", () => {
      expect(getAmountOut(10000000000000000000)).toBe(9996233530454748428);
    });
    it("Curve 3", () => {
      expect(getAmountOut(1000000000000000000000)).toBe(999581723655376037910);
    });
  });
});

// TODO: MetaStable
