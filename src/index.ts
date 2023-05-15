const VELO_FEES = 5; // 30 bps for fees
const MAX_BPS = 10_000;

// NOTE: Assumes all values are normalized to 18 decimals
function k(x, y, stable) {
  if (stable) {
    const _a = (x * y) / 1e18;
    const _b = (x * y) / 1e18 + (x * y) / 1e18;
    return (_a * _b) / 1e18; // x3y+y3x >= k
  }
  return x * y; // xy >= k
}

function f(x0, y): number {
  return (
    (x0 * ((((y * y) / 1e18) * y) / 1e18)) / 1e18 +
    (((((x0 * x0) / 1e18) * x0) / 1e18) * y) / 1e18
  );
}

function d(x0, y): number {
  return (3 * x0 * ((y * y) / 1e18)) / 1e18 + (((x0 * x0) / 1e18) * x0) / 1e18;
}

function get_y(x0: number, xy: number, y: number): number {
  for (let i = 0; i < 255; i++) {
    const y_prev = y;
    const k = f(x0, y);
    if (k < xy) {
      const dy = ((xy - k) * 1e18) / d(x0, y);
      y += dy;
    } else {
      const dy = ((k - xy) * 1e18) / d(x0, y);
      y -= dy;
    }
    if (y > y_prev) {
      if (y - y_prev <= 1) {
        return y;
      }
    } else if (y_prev - y <= 1) {
      return y;
    }
  }
  return y;
}

function getAmountOut(amountIn, reserveIn, reserveOut, stable): number {
  const updatedAmountIn = amountIn - (amountIn * VELO_FEES) / MAX_BPS;
  return getAmountOutInternal(updatedAmountIn, reserveIn, reserveOut, stable);
}

function getAmountOutInternal(amountIn, reserveIn, reserveOut, stable): number {
  if (stable) {
    const xy = k(reserveIn, reserveOut, stable);

    const y = reserveOut - get_y(amountIn + reserveIn, xy, reserveOut);
    return y;
  }

  console.log("amountIn", amountIn);
  console.log("reserveOut", reserveOut);
  console.log("reserveIn", reserveIn);
  console.log("amountIn", amountIn);
  return (amountIn * reserveOut) / (reserveIn + amountIn);
}

const getPrice = (amountIn, amountOut) => {
  return amountIn / amountOut;
};

// Loop where amount is i * delta_frac
// Binary Search
// Redo this N times (I think 9 or 10) for higher accuracy // 128 ^ 9 => 1e18 // 128 ^ 10 => 1e21
// Or stop early if value is 1

// TODO: write tests for it
// NOTE: priceLimit is a ratio between amountIn and amountOut
function maxInBeforePriceLimit(
  priceLimit,
  reserveIn,
  reserveOut,
  divisor = 100000000,
  iterations = 10
) {
  let foundMax = 2 ** 256 - 1;
  let foundMin = 0;
  for (let i = 0; i < iterations; i++) {
    const res = maxInBeforePriceLimitIteration(
      priceLimit,
      reserveIn,
      reserveOut,
      divisor,
      foundMax,
      foundMin
    );

    foundMax = res.max;
    foundMin = res.min;
  }

  return foundMin;
}

function maxInBeforePriceLimitIteration(
  priceLimit,
  reserveIn,
  reserveOut,
  divisor,
  max,
  min
) {
  if (min > max) {
    // Stop, found or something
    throw Error("ya ya ya ya ya");
  }

  const stepSize = (max - min) / divisor;
  console.log("max", max);
  console.log("min", min);
  console.log("divisor", divisor);
  if (Number.isNaN(stepSize)) {
    console.log("stepSize");
  }

  // TODO: Binary search if you want optimal
  for (let i = 0; i < divisor; i++) {
    const amountIn = min + stepSize * i;
    console.log("amountIn", amountIn);
    if (Number.isNaN(amountIn)) {
      console.log("AmountIN NAN");
    }
    const amountOut = getAmountOutInternal(
      amountIn,
      reserveIn,
      reserveOut,
      false
    );

    // Check if price is too high
    const spotPrice = getPrice(amountIn, amountOut);
    if (spotPrice > priceLimit) {
      console.log("FOUND");
      return {
        min: min + stepSize * (i - 1), // NOTE: We throw on odd values, check if issue in prod
        max: amountIn,
      };
    }
  }
}

/**
 * Velo Factory: https://optimistic.etherscan.io/address/0x25cbddb98b35ab1ff77413456b31ec81a6b6b746#readContract
 * USDC / WETH Pool
 * https://optimistic.etherscan.io/address/0x79c912FEF520be002c2B6e57EC4324e260f38E50
 * _reserve0   uint256 :  1859798333449789481797
 * _reserve1   uint256 :  3403973201396
 *
 *
 * getAmountOut(12000000000, 0x7F5c764cBc14f9669B88837ca1490cCa17c31607) = 6529579300413839767
 *
 * Brute force amount for a 10% increase
 * 1.8377906826615076e-9 * 1.1
 */

const USDC_RESERVE = 3403973201396;
const WETH_RESERVE = 1859798333449789481797;

console.log(
  "getAmountOutInternal(12000000000, 1859798333449789481797, 3403973201396, false)",
  getAmountOut(12000000000, USDC_RESERVE, WETH_RESERVE, false)
);

console.log(
  "maxInBeforePriceLimit",
  maxInBeforePriceLimit(
    getAmountOut(12000000000, USDC_RESERVE, WETH_RESERVE, false) / 1.1, // 10% Increase of price,
    USDC_RESERVE,
    WETH_RESERVE
  )
);
