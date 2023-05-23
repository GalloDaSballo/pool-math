import { makeAmountOutFunctionAfterProvidingReserves } from "./make";

/**
 * Price is a ration between `amountIn` and `amountOut`
 * The higher the price, the more `amountIn` you need to pass for `amountOut`
 */
export function getPrice(amountIn, amountOut) {
  return amountIn / amountOut;
}

// Loop where amount is i * delta_frac
// Binary Search
// Redo this N times (I think 9 or 10) for higher accuracy // 128 ^ 9 => 1e18 // 128 ^ 10 => 1e21
// Or stop early if value is 1
function maxInBeforePriceLimitIteration(
  priceLimit,
  getAmountOutFunction, // We want to receive this as a function so we can make it re-usable
  max,
  min
) {
  if (min > max) {
    // Stop, found or something
    throw Error("ya ya ya ya ya");
  }

  // TODO: Binary search if you want optimal
  let tempMin = min;
  let tempMax = max;
  let counter = 0;

  while (tempMin < tempMax) {
    counter++;
    if (counter > 1000) {
      throw Error("DONE");
    }

    // This effetively travels at log_2 of size
    // We could log again but I believe it's equivalent
    // And empirically this is faster

    const delta = (tempMax - tempMin) / 2;
    const amountIn = tempMin + delta;
    if (Number.isNaN(amountIn)) {
      throw Error("AmountIN NAN");
    }
    const amountOut = getAmountOutFunction(amountIn);

    // Check if price is too high
    const spotPrice = getPrice(amountIn, amountOut);

    if (amountIn === tempMin || amountIn === tempMax) {
      break; // We have reached a loop
    }

    if (spotPrice <= priceLimit) {
      tempMin = amountIn;
    } else {
      tempMax = amountIn;
    }
  }

  return {
    min: tempMin,
    max: tempMax,
  };
}

/**
 * Given a monotonically increasing `getAmountOutFunction` and a `priceLimit`
 * Returns the maximum `amountIn` you can pass to `getAmountOutFunction` before `price` becomes bigger than `priceLimit`
 * NOTE: See `getPrice`
 * @param priceLimit
 * @param getAmountOutFunction
 * @returns
 */
export function maxInBeforePriceLimit(priceLimit, getAmountOutFunction) {
  let foundMax = 2 ** 256 - 1;
  let foundMin = 0;
  const res = maxInBeforePriceLimitIteration(
    priceLimit,
    getAmountOutFunction,
    foundMax,
    foundMin
  );

  foundMax = res.max;
  foundMin = res.min;

  return foundMin;
}

const DIVISOR = 10000;
const MAX_MULTIPLIER = 1024 * DIVISOR;

// TODO: NOT FINISHED YET
export function getPoolReserveMultiplierToAllowPriceImpactBelow(
  priceLimit,
  amountIn,
  initialReserves,
  getAmountOutGivenReservesFunction
) {
  if (amountIn === 0) {
    return 1;
  }

  // Starting from a swap that has higher price impact
  const initialImpact = getPrice(
    amountIn,
    getAmountOutGivenReservesFunction(amountIn, initialReserves)
  );

  if (initialImpact < priceLimit) {
    return 1;
  }

  // We iteratively try for a lower multiplier, until we find the classic binary overalp
  let iterations = 0; // TODO: Consider using

  let tempMin = 1;
  let tempMax = MAX_MULTIPLIER;

  // NOTE: Add +1 to avoid loop in which both values are the same
  while (tempMin < tempMax) {
    iterations += 1;
    if (iterations > 10000) {
      throw Error("Too Many Iterations");
    }
    const delta = (tempMax + tempMin) / 2;
    const newMultiplier = tempMin + delta / DIVISOR;

    if (newMultiplier < 1) {
      throw Error("Multiplier below 1, big issue");
    }
    const newReserves = initialReserves.map((val) => val * newMultiplier);
    const amountOut = getAmountOutGivenReservesFunction(amountIn, newReserves);
    const newPrice = getPrice(amountIn, amountOut);

    // TODO: There's a case in which we never found and we must revert
    // TODO: Add that case
    if (newPrice < priceLimit) {
      if (tempMax === newMultiplier) {
        return tempMax; // TODO: Weird case
      }
      tempMax = newMultiplier;
    } else {
      tempMin = newMultiplier;
    }

    // console.log("priceLimit", priceLimit);
    // console.log("newPrice", newPrice);
    // console.log("newMultiplier", newMultiplier);
    // console.log("tempMax", tempMax);
    // console.log("tempMin", tempMin);
  }

  return tempMax;

  // Find a > 1 multiplier, within RANGE precision
  // Than once added to the pool
  // Will cause the priceOut to have an impact that is below the current one (obv)
  // and that is below the max impact
}

// NOTE: Linear interpolation of time to replenishment
// This should be used with a +- accuracy value as in reality replenishment is the sum of discrete arbitrages
export function getPoolDiscreteRepetitionsUntilFullLiquidatedAmount(
  priceLimit, // Price at which you stop buying
  amountIn, // Total Amount you sell into the Pool
  initialReserves, // Reserves for fn
  getAmountOutGivenReservesFunction, // Fn that given amountIn and Reserves, returns the amount out
  timeForReplenishmentInSeconds
) {
  // Given Pool Reserve
  // And a time for replenishment (where we assume it takes X time to get up to 100%)
  // Meaning that using 5% will take 5% time to replenish
  // Find the time necessary to replenish the TVL, assuming liquidations happen
  // And must be profitable (meaning the amount is always capped and we iterate over it)
  const newReserves = initialReserves;
  let amountLeft = amountIn;
  let timeSpent = 0;

  // NOTE: We use the same fn and accept the accuracy loss
  const newAmountOutFunction = makeAmountOutFunctionAfterProvidingReserves(
    getAmountOutGivenReservesFunction,
    newReserves
  );

  // timeForReplenishmentInSeconds
  // Need to do a proportion since we double the tokens in timeForReplenishmentInSeconds
  // But we cap it at current liquidity
  // And we want to see the impact
  // Then compute the time it takes to recharge

  while (amountLeft > 0) {
    // Get max before price limit (optimizer)

    const limit = maxInBeforePriceLimit(priceLimit, newAmountOutFunction);

    if (limit > amountLeft) {
      amountLeft = 0;
      // We done
      break;
    } else {
      // We need to reduce
      amountLeft -= limit;

      // We need to change the reserves or just compute time until reserves replenish
      const proportion = limit / newReserves[0];
      // This is the percentage of time

      // Simulate passing of time
      timeSpent += timeForReplenishmentInSeconds; // TODO: Can be fined tuned as proportion of Liquidity, but some AMMs will be off due to scaling
      // This allows us to "wait" without needing to change reserves
      // The downside is that there is no simming of price movement <- basically impossible for this project (unless you sim 100% of liquidity everywhere)
    }
  }

  return timeSpent;
}
