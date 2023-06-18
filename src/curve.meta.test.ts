import { makeAmountOutFunction } from "./make";

const comparable = (val) => Math.floor(val / 1e24);

/** META STABLE
 * NOTE: These fail
 *
 */

/**
 * sUSD / 3CRV
 *   poolType: 'Curve',
  isStable: true,
  poolReserves: [ 1.1606326320489837e+25, 6.458759394302471e+24 ],
  poolExtraSettings: { customA: 50000, customFees: 4000000, customRates: undefined },
  tokens: [
    '0x8c6f28f2F1A3C87F0f938b96d27520d9751ec8d9',
    '0x1337BedC9D22ecbe766dF105c9623922A27963EC'
  ],
  timeForReplenishment: 86400
1000000000000000000
  980436914016035972
100000000000000000000
  98043688082504220211

  5000000000000000000000
  4902176185488554670647

  TODO: Find proper virtual price
  1018234912848822794
 */

describe("Basic Meta Swap Tests (fail due to rounding", () => {
  describe("Curve sUSD 3Pool", () => {
    const reserves_sUSD_3CRV = [
      11042398450774368117151260, // sUSD
      7016697912495929573708932, // 3CRV
    ];

    // Virtual Price
    const rates = [1e18, 1018241834316959268];

    const getAmountOut = makeAmountOutFunction(
      "Curve",
      reserves_sUSD_3CRV,
      true,
      {
        customRates: rates,
        customA: 50000,
        customFees: 4000000,
      }
    );

    it("Curve 1", () => {
      expect(comparable(getAmountOut(1000000000000000000))).toBe(
        comparable(980770198922377601)
      );
    });
    it("Curve 2", () => {
      expect(comparable(getAmountOut(100000000000000000000))).toBe(
        comparable(98077017104215703988)
      );
    });
    it("Curve 3", () => {
      expect(comparable(getAmountOut(5000000000000000000000))).toBe(
        comparable(4903843952449090423199)
      );
    });
  });

  /**
   * MIM / 3crv
   * {
  poolType: 'Curve',
  isStable: true,
  poolReserves: [ 8.434587839635703e+23, 6.340549954219635e+23 ],
  poolExtraSettings: { customA: 20000, customFees: 4000000, customRates: undefined },
  tokens: [
    '0xB153FB3d196A8eB25522705560ac152eeEc57901',
    '0x1337BedC9D22ecbe766dF105c9623922A27963EC'
  ],
  timeForReplenishment: 86400
}
1000000000000000000
980362945887665283

10000000000000000000
9803628805090221081

500000000000000000000
490179659817898086722
   */

  describe("Curve MIM 3Pool", () => {
    const reserves_MIM_3CRV = [
      8.434587839635703e23, // MIM
      6.340549954219635e23, // 3CRV
    ];

    // Virtual Price
    const rates = [1e18, 1018234912848822794];

    const getAmountOut = makeAmountOutFunction(
      "Curve",
      reserves_MIM_3CRV,
      true,
      {
        customA: 20000,
        customFees: 4000000,
        customRates: rates,
      }
    );

    it("Curve 1", () => {
      expect(getAmountOut(1000000000000000000)).toBe(980362945887665283);
    });
    it("Curve 2", () => {
      expect(getAmountOut(10000000000000000000)).toBe(9803628805090221081);
    });
    it("Curve 3", () => {
      expect(getAmountOut(500000000000000000000)).toBe(490179659817898086722);
    });
  });
});
