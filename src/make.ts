import { getAmountOut as CurveGetAmoutOut } from "./curve/omni_pool";
import { getAmountOut as balGetAmountOut } from "./balancer";
import { getAmountOut as veloGetAmountOut } from "./velo";

const NORMALIZED_CURVE_RATES_TWO = [10 ** 18, 10 ** 18, 10 ** 18];
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
      return CurveGetAmoutOut(
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
        extraSettings?.customDecimals?.[0] // Balancer only looks at amt in
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
