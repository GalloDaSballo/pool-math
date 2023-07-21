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

/**
 * Given reserves and indexes
 * Return a List such that
 * @param reserves will be swapped
 * @param tokenInIndex will be put at 0
 * @param tokenOutIndex will be put at 1
 * @returns The extra token (if any) will be put at 2
 */
const sortReserves = (
  reserves: number[],
  tokenInIndex = 0,
  tokenOutIndex = 1
): number[] => {
  // Skip if already set
  if (tokenInIndex === 0 && tokenOutIndex === 1) {
    return reserves;
  }

  if (tokenInIndex === tokenOutIndex) {
    throw Error("Same index swap, impossible");
  }

  // New array with tokenIn, tokenOut
  const newReserves = [reserves[tokenInIndex], reserves[tokenOutIndex]];

  // If length is 3 let's add last token
  if (reserves.length > 2) {
    for (let i = 0; i < reserves.length; i++) {
      if (i !== tokenInIndex && i !== tokenOutIndex) {
        newReserves.push(reserves[i]); // Find last one and push at last position
      }
    }
  }

  return newReserves;
};

/**
 * Given reserves and tokenOutIndex, let's swap 0 with tokenOut
 * @param reserves
 * @param tokenOutIndex
 */
const swapReserves = (reserves: number[], tokenOutIndex = 0): number[] => {
  if (tokenOutIndex === 0) {
    return reserves;
  }

  const copiedReserves = JSON.parse(JSON.stringify(reserves));
  const copiedZero = reserves[0];
  copiedReserves[0] = copiedReserves[tokenOutIndex];
  copiedReserves[tokenOutIndex] = copiedZero;

  return copiedReserves;
};

const getCurveRates = (length: number, customRates?: number[]): number[] => {
  if (customRates) {
    return customRates;
  }

  return length === 2
    ? NORMALIZED_CURVE_RATES_TWO
    : NORMALIZED_CURVE_RATES_THREE; // RATES
};

// TODO: tokenIn, tokenOut
export const makeAmountOutGivenReservesFunction = (
  type: string,
  stable: boolean,
  extraSettings?: ExtraSettings,
  tokenInIndex = 0,
  tokenOutIndex = 1
) => {
  // hack to bypass the type check
  if (type !== "Velo" && type !== "Curve" && type !== "Balancer") {
    throw Error("Wrong Type");
  }

  if (type === "Velo") {
    return (amountIn, reserves) => {
      const sortedReserves = sortReserves(
        reserves,
        tokenInIndex,
        tokenOutIndex
      );
      return veloGetAmountOut(
        amountIn,
        sortedReserves[0],
        sortedReserves[1],
        stable,
        extraSettings?.customDecimals
      );
    };
  }

  if (type === "Curve") {
    return (amountIn, reserves) => {
      const sortedReserves = sortReserves(
        reserves,
        tokenInIndex,
        tokenOutIndex
      );
      return curveGetAmountOut(
        amountIn,
        sortedReserves,
        true,
        getCurveRates(sortedReserves.length, extraSettings?.customRates),
        extraSettings?.customFees ? extraSettings?.customFees : 1000000, // FEES
        extraSettings?.customA ? extraSettings?.customA : 200000 // A
      );
    };
  }

  if (type === "Balancer") {
    return (amountIn, reserves) => {
      const sortedReserves = sortReserves(
        reserves,
        tokenInIndex,
        tokenOutIndex
      );
      return balGetAmountOut(
        amountIn,
        sortedReserves[0],
        sortedReserves[1],
        stable,
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
  extraSettings?: ExtraSettings,
  tokenInIndex = 0,
  tokenOutIndex = 1
) => {
  // hack to bypass the type check
  if (type !== "Velo" && type !== "Curve" && type !== "Balancer") {
    throw Error("Wrong Type");
  }
  const fn = makeAmountOutGivenReservesFunction(
    type,
    stable,
    extraSettings,
    tokenInIndex,
    tokenOutIndex
  );
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

export const makeSingleSidedWithdrawalGivenReserves = (
  type: string,
  stable: boolean,
  totalSupply: number,
  extraSettings?: ExtraSettings,
  tokenOutIndex = 0
) => {
  // hack to bypass the type check
  if (type !== "Velo" && type !== "Curve" && type !== "Balancer") {
    throw Error("Wrong Type");
  }
  if (type === "Velo") {
    return (amountIn, reserves) => {
      const sortedReserves = swapReserves(reserves, tokenOutIndex);
      return veloWithdrawSingleSided(
        amountIn,
        sortedReserves,
        totalSupply,
        stable,
        extraSettings?.customDecimals
      );
    };
  }

  if (type === "Curve") {
    return (amountIn, reserves) => {
      const sortedReserves = swapReserves(reserves, tokenOutIndex);
      return curveWithdrawSingleSided(
        amountIn,
        sortedReserves,
        0, // NOTE: 0 since we swap above
        totalSupply,
        true,
        extraSettings?.customRates,
        extraSettings?.customFees,
        extraSettings?.customA
      );
    };
  }

  if (type === "Balancer") {
    return (amountIn, reserves) => {
      const sortedReserves = swapReserves(reserves, tokenOutIndex);
      return balWithdrawSingleSided(
        amountIn,
        sortedReserves[0], // TODO: Figure out the reserves stuff cause it's pretty sus
        sortedReserves[1],
        extraSettings?.customA,
        extraSettings?.customFees,
        extraSettings?.customRates,
        totalSupply,
        stable
      );
    };
  }
};

export const makeSingleSidedWithdrawalFunctionAfterProvidingReserves = (
  makeSingleSidedWithdrawalGivenReservesFunction,
  reserves
) => {
  return (lpAmountIn) =>
    makeSingleSidedWithdrawalGivenReservesFunction(lpAmountIn, reserves);
};

export const makeSingleSidedWithdrawalFunction = (
  type: string,
  reserves: number[],
  stable: boolean,
  totalSupply: number,
  extraSettings?: ExtraSettings,
  tokenOutIndex = 0
) => {
  // hack to bypass the type check
  if (type !== "Velo" && type !== "Curve" && type !== "Balancer") {
    throw Error("Wrong Type");
  }
  const fn = makeSingleSidedWithdrawalGivenReserves(
    type,
    stable,
    totalSupply,
    extraSettings,
    tokenOutIndex
  );
  const adjusted = (amountIn) => {
    return fn(amountIn, reserves);
  };

  return adjusted;
};
