/**
 * Function Equivalence
 */

import {
  makeSingleSidedWithdrawalFunction,
  makeSingleSidedWithdrawalGivenReserves,
} from "./make";

import {
  getPoolDiscreteRepetitionsUntilFullLiquidatedAmount,
  getPoolReserveMultiplierToAllowPriceImpactBelow,
  getPrice,
  maxInBeforePriceLimit,
} from "./optimizer";

const LIQUIDATION_PREMIUM = 1000;
const DECIMALS = 18;

export interface LiquidationData {
  sellUpTo: number;
  liquidityMultiple: number;
  timeToFullLiquidation: number;
  error?: string;
}

export interface ExtraSettings {
  customA?: number;
  customFees?: number;
  customRates?: number[];
  customDecimals?: number[];
}

export interface PoolData {
  poolType: string;
  isStable: boolean;
  poolReserves: number[];
  poolExtraSettings?: ExtraSettings;
  timeForReplenishment: number;
}

const MAX_BPS = 10_000;

// Internal function to chunk up
function internalProcessValues(
  amountOutFn,
  amountOutGivenReservesFn,

  amountToDump: number,
  liquidationPremium: number,
  decimals: number,
  poolData: PoolData,
  totalSupply?: number
): LiquidationData {
  try {
    const spotAmountOut = amountOutFn(amountToDump);

    const spotPrice = getPrice(amountToDump, spotAmountOut);

    if (spotPrice === Infinity) {
      throw Error("Spot is infinity, increase reserves");
    }

    const maxSpot = (spotPrice * MAX_BPS) / (MAX_BPS - liquidationPremium);

    const amountBeforePriceLimit = maxInBeforePriceLimit(
      maxSpot,
      amountOutFn,
      totalSupply
    );

    const poolReserveMultiplierForLiquidation = getPoolReserveMultiplierToAllowPriceImpactBelow(
      (spotPrice * MAX_BPS) / (MAX_BPS - liquidationPremium),
      amountToDump,
      poolData.poolReserves,
      amountOutGivenReservesFn
    );

    const discreteTimeForFullLiquidation = getPoolDiscreteRepetitionsUntilFullLiquidatedAmount(
      (spotPrice * MAX_BPS) / (MAX_BPS - liquidationPremium),
      amountToDump,
      poolData.poolReserves,
      amountOutGivenReservesFn,
      poolData.timeForReplenishment,
      totalSupply
    );

    return {
      sellUpTo: amountBeforePriceLimit,
      liquidityMultiple: poolReserveMultiplierForLiquidation,
      timeToFullLiquidation: discreteTimeForFullLiquidation,
    };
  } catch (err) {
    console.log("internalProcessValues, Exception", err);
    return {
      sellUpTo: 0,
      liquidityMultiple: 1,
      timeToFullLiquidation: 0,
      error: err.toString(),
    };
  }
}

export function computeLiquidationDataSingleSided(
  amountToDump: number,
  liquidationPremium: number,
  decimals: number,
  poolData: PoolData,
  inputOut = 1,
  totalSupply: number
): LiquidationData {
  const getAmountOut = makeSingleSidedWithdrawalFunction(
    poolData.poolType,
    poolData.poolReserves,
    poolData.isStable,
    totalSupply,
    poolData.poolExtraSettings,
    inputOut
  );

  const getAmoutOutGivenReserves = makeSingleSidedWithdrawalGivenReserves(
    poolData.poolType,
    poolData.isStable,
    totalSupply,
    poolData.poolExtraSettings,
    inputOut
  );

  return internalProcessValues(
    getAmountOut,
    getAmoutOutGivenReserves,
    amountToDump,
    liquidationPremium,
    decimals,
    poolData,
    totalSupply
  );
}

describe("Optimizer Single Sided for Velo volatile", () => {
  const VELO_USDC_RESERVE = 1920557974492294193723;
  const VELO_WETH_RESERVE = 3647798832073;
  const RESERVES = [VELO_WETH_RESERVE, VELO_USDC_RESERVE];

  const TOTAL_SUPPLY = 83681795687342788; // TODO

  const amountToDump = TOTAL_SUPPLY / 10;

  /**
   * https://optimistic.etherscan.io/address/0x9c12939390052919af3155f41bf4160fd3666a6f#readContract ROUTER
   * https://optimistic.etherscan.io/token/0x4200000000000000000000000000000000000006 WETH
   * https://optimistic.etherscan.io/token/0x7f5c764cbc14f9669b88837ca1490cca17c31607 USDC
   */

  it("Velo 1", () => {
    const result = computeLiquidationDataSingleSided(
      amountToDump,
      LIQUIDATION_PREMIUM,
      DECIMALS,
      {
        poolType: "Velo",
        isStable: false,
        poolReserves: RESERVES,
        timeForReplenishment: 60 * 60 * 24,
      },
      0,
      TOTAL_SUPPLY
    );

    // The more you withdraw, the more you receive

    // If you withdraw too much, you lose value
    // TODO: WRITE PROPER TEST
    console.log("velo result", result);
    console.log("Velo result as % total suply", result.sellUpTo / TOTAL_SUPPLY);
  });
});

describe("Optimizer Single Sided for Curve Stable", () => {
  const TOTAL_SUPPLY = 7609418922129149432647337;
  const amountToDump = 7609418922129149432647337 / 100000;

  const reserve_DAI_TO_USDC = [
    4933747819370411623659827, // DAI
    2298852718764, // USDC
    1816054842841, // USDT
  ];

  it("Curve 1", () => {
    const result = computeLiquidationDataSingleSided(
      amountToDump,
      LIQUIDATION_PREMIUM,
      DECIMALS,
      {
        poolType: "Curve",
        isStable: true,
        poolReserves: reserve_DAI_TO_USDC,
        timeForReplenishment: 60 * 60 * 24,
        poolExtraSettings: {
          customA: 200000,
          customFees: 1000000,
          customRates: [1e18, 1e24, 1e24],
        },
      },
      0,
      TOTAL_SUPPLY
    );
    console.log("curve result", result);
    console.log(
      "curve result as % total suply",
      result.sellUpTo / TOTAL_SUPPLY
    );
  });
});

describe("Optimizer Single Sided for Balancer Stable", () => {
  const TOTAL_SUPPLY = 1839433247628600388466;
  const amountToDump = TOTAL_SUPPLY / 100000;

  const RESERVES_STETH_ETH = [844534103996536233482, 901666547718167241484];

  it("Bal 1", () => {
    const result = computeLiquidationDataSingleSided(
      amountToDump,
      LIQUIDATION_PREMIUM,
      DECIMALS,
      {
        poolType: "Balancer",
        isStable: true,
        poolReserves: RESERVES_STETH_ETH,
        timeForReplenishment: 60 * 60 * 24,
        poolExtraSettings: {
          customA: 500000,
          customFees: 100000000000000,
          customRates: [1129216270658668106, 1e18],
        },
      },
      0,
      TOTAL_SUPPLY
    );

    console.log("bal result", result);
    console.log("bal result as % total suply", result.sellUpTo / TOTAL_SUPPLY);
  });
});
