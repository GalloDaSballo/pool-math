export const getPrice = (amountIn, amountOut) => {
  return amountIn / amountOut;
};

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
    console.log("tempMin", tempMin);
    console.log("tempMax", tempMax);
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
