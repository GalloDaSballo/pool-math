import { getAmountOut as CurveGetAmoutOut } from "./curve/omni_pool";
import { getAmountOut as balGetAmountOut } from "./balancer";
import { getAmountOut as veloGetAmountOut } from "./velo";

const NORMALIZED_CURVE_RATES_TWO = [10 ** 18, 10 ** 18, 10 ** 18];
const NORMALIZED_CURVE_RATES_THREE = [10 ** 18, 10 ** 18, 10 ** 18];

export const makeAmountOutGivenReservesFunction = (type: string, stable) => {
  // hack to bypass the type check
  if (type !== "Velo" && type !== "Curve" && type !== "Balancer") {
    throw Error("Wrong Type");
  }
  if (type === "Velo") {
    return (amountIn, reserves) => {
      return veloGetAmountOut(amountIn, reserves[0], reserves[1], stable);
    };
  }

  if (type === "Curve") {
    return (amountIn, reserves) => {
      console.log("Curve", amountIn, reserves);
      return CurveGetAmoutOut(
        amountIn,
        reserves,
        true,
        reserves.length === 2
          ? NORMALIZED_CURVE_RATES_TWO
          : NORMALIZED_CURVE_RATES_THREE, // RATES
        1000000, // FEES
        200000 // A
      );
    };
  }

  if (type === "Balancer") {
    return (amountIn, reserves) => {
      console.log("Balancer", amountIn, reserves);
      // TODO: Rate providers here as well (technically also fees and A)
      return balGetAmountOut(amountIn, reserves[0], reserves[1], true);
    };
  }
};

export const makeAmountOutFunction = (type: string, reserves, stable) => {
  // hack to bypass the type check
  if (type !== "Velo" && type !== "Curve" && type !== "Balancer") {
    throw Error("Wrong Type");
  }
  const fn = makeAmountOutGivenReservesFunction(type, stable);
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
