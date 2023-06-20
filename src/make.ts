import {
  getAmountOut as curveGetAmountOut,
  getWithdrawOneCoin as curveWithdrawSingleSided,
} from "./curve/omni_pool";
// import { getAmountOut as curveMetaAmountOut } from "./curve/meta_stable"; // TODO: Need to figure this out
import {
  getAmountOut as balGetAmountOut,
  getSingleSidedWithdrawalOut as balWithdrawSingleSided,
} from "./balancer";
import {
  getAmountOut as veloGetAmountOut,
  withdrawSingleSided as veloWithdrawSingleSided,
} from "./velo";

const NORMALIZED_CURVE_RATES_TWO = [10 ** 18, 10 ** 18];
const NORMALIZED_CURVE_RATES_THREE = [
  1000000000000000000,
  1000000000000000000000000000000,
  1000000000000000000000000000000,
];

interface ExtraSettings {
  customA?: number;
  customFees?: number;
  customRates?: number[];
  customDecimals?: number[];
}

const getCurveRates = (length: number, customRates?: number[]): number[] => {
  if (customRates) {
    return customRates;
  }

  return length === 2
    ? NORMALIZED_CURVE_RATES_TWO
    : NORMALIZED_CURVE_RATES_THREE; // RATES
};

export const makeAmountOutGivenReservesFunction = (
  type: string,
  stable: boolean,
  extraSettings?: ExtraSettings
) => {
  // hack to bypass the type check
  if (type !== "Velo" && type !== "Curve" && type !== "Balancer") {
    throw Error("Wrong Type");
  }
  if (type === "Velo") {
    return (amountIn, reserves) => {
      return veloGetAmountOut(
        amountIn,
        reserves[0],
        reserves[1],
        stable,
        extraSettings?.customDecimals
      );
    };
  }

  if (type === "Curve") {
    return (amountIn, reserves) => {
      return curveGetAmountOut(
        amountIn,
        reserves,
        true,
        getCurveRates(reserves.length, extraSettings?.customRates),
        extraSettings?.customFees ? extraSettings?.customFees : 1000000, // FEES
        extraSettings?.customA ? extraSettings?.customA : 200000 // A
      );
    };
  }

  if (type === "Balancer") {
    return (amountIn, reserves) => {
      // TODO: Rate providers here as well (technically also fees and A)
      return balGetAmountOut(
        amountIn,
        reserves[0],
        reserves[1],
        true,
        extraSettings?.customA,
        extraSettings?.customFees,
        extraSettings?.customDecimals?.[0], // Balancer only looks at amt in
        extraSettings?.customRates
      );
    };
  }
};

export const makeAmountOutFunction = (
  type: string,
  reserves,
  stable,
  extraSettings?: ExtraSettings
) => {
  // hack to bypass the type check
  if (type !== "Velo" && type !== "Curve" && type !== "Balancer") {
    throw Error("Wrong Type");
  }
  const fn = makeAmountOutGivenReservesFunction(type, stable, extraSettings);
  const adjusted = (amountIn) => {
    return fn(amountIn, reserves);
  };

  return adjusted;
};

export const makeAmountOutFunctionAfterProvidingReserves = (
  makeAmountOutGivenReserves,
  reserves
) => {
  return (amountIn) => makeAmountOutGivenReserves(amountIn, reserves);
};

export const makeSingleSidedWithdrawalGivenReservesAndTotalSupplyFunction = (
  type: string,
  stable: boolean,
  extraSettings?: ExtraSettings
) => {
  // hack to bypass the type check
  if (type !== "Velo" && type !== "Curve" && type !== "Balancer") {
    throw Error("Wrong Type");
  }
  if (type === "Velo") {
    return (amountIn, reserves, totalSupply) => {
      return veloWithdrawSingleSided(
        amountIn,
        reserves,
        totalSupply,
        stable,
        extraSettings?.customDecimals
      );
    };
  }

  if (type === "Curve") {
    return (amountIn, reserve, totalSupply) => {
      return curveWithdrawSingleSided(
        amountIn,
        reserve,
        0, // TODO: We could refactor everything to use indexIn, out and sort stuff
        totalSupply,
        true,
        extraSettings?.customRates,
        extraSettings?.customFees,
        extraSettings?.customA
      );
    };
  }

  if (type === "Balancer") {
    return (amountIn, reserves, totalSupply) => {
      return balWithdrawSingleSided(
        amountIn,
        reserves[0], // TODO: Figure out the reserves stuff cause it's pretty sus
        reserves[1],
        extraSettings?.customA,
        extraSettings?.customFees,
        extraSettings?.customRates,
        totalSupply
      );
    };
  }
};

export const makeSingleSidedWithdrawalFunctionAfterProvidingReserves = (
  makeSingleSidedWithdrawalGivenReservesAndTotalSupply,
  reserves,
  totalSupply
) => {
  return (lpAmountIn) =>
    makeSingleSidedWithdrawalGivenReservesAndTotalSupply(
      lpAmountIn,
      reserves,
      totalSupply
    );
};

export const makeSingleSidedWithdrawalFunction = (
  type: string,
  reserves,
  stable,
  totalSupply,
  extraSettings?: ExtraSettings
) => {
  // hack to bypass the type check
  if (type !== "Velo" && type !== "Curve" && type !== "Balancer") {
    throw Error("Wrong Type");
  }
  const fn = makeSingleSidedWithdrawalGivenReservesAndTotalSupplyFunction(
    type,
    stable,
    extraSettings
  );
  const adjusted = (amountIn) => {
    return fn(amountIn, reserves, totalSupply);
  };

  return adjusted;
};
