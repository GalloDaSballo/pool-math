const VELO_FEES = 5; // 30 bps for fees
const MAX_BPS = 10_000;

// NOTE: Assumes all values are normalized to 18 decimals
function k(x, y, stable, decimals: number[]) {
  if (stable) {
    /**
     * uint _x = x * 1e18 / decimals0;
      uint _y = y * 1e18 / decimals1;
      uint _a = (_x * _y) / 1e18;
      uint _b = ((_x * _x) / 1e18 + (_y * _y) / 1e18);
      return _a * _b / 1e18;  // x3y+y3x >= k
     */
    const _x = (x * 1e18) / decimals[0];
    const _y = (y * 1e18) / decimals[1];
    const _a = (_x * _y) / 1e18;
    const _b = (_x * _x) / 1e18 + (_y * _y) / 1e18;
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

export function getAmountOut(
  amountIn,
  reserveIn,
  reserveOut,
  stable,
  customDecimals: number[] = [1e18, 1e18]
): number {
  const updatedAmountIn = amountIn - (amountIn * VELO_FEES) / MAX_BPS;
  return Math.floor(
    getAmountOutInternal(
      updatedAmountIn,
      reserveIn,
      reserveOut,
      stable,
      customDecimals
    )
  );
}

function getAmountOutInternal(
  amountIn,
  reserveIn,
  reserveOut,
  stable,
  customDecimals
): number {
  if (stable) {
    /**
     *       
      uint xy =  _k(_reserve0, _reserve1);
      _reserve0 = _reserve0 * 1e18 / decimals0;
      _reserve1 = _reserve1 * 1e18 / decimals1;
      (uint reserveA, uint reserveB) = tokenIn == token0 ? (_reserve0, _reserve1) : (_reserve1, _reserve0);
      amountIn = tokenIn == token0 ? amountIn * 1e18 / decimals0 : amountIn * 1e18 / decimals1;
      uint y = reserveB - _get_y(amountIn+reserveA, xy, reserveB);
      return y * (tokenIn == token0 ? decimals1 : decimals0) / 1e18;
     */
    const xy = k(reserveIn, reserveOut, stable, customDecimals);

    const _reserve0 = (reserveIn * 1e18) / customDecimals[0];
    const _reserve1 = (reserveOut * 1e18) / customDecimals[1];

    const normalizedAmountIn = (amountIn * 1e18) / customDecimals[0];

    const y = _reserve1 - get_y(normalizedAmountIn + _reserve0, xy, _reserve1);
    return Math.floor((y * customDecimals[1]) / 1e18); // NOTE: We floor here, we could floor everywhere
  }

  return (amountIn * reserveOut) / (reserveIn + amountIn);
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

// TODO: DEPRECATE - OLD
// console.log(
//   "getAmountOutInternal(12000000000, 1859798333449789481797, 3403973201396, false)",
//   getAmountOut(testAmountIn, USDC_RESERVE, WETH_RESERVE, false)
// );

// console.log(
//   "maxInBeforePriceLimit",
//   maxInBeforePriceLimit(
//     getPrice(
//       testAmountIn,
//       getAmountOut(testAmountIn, USDC_RESERVE, WETH_RESERVE, false)
//     ) / 0.9, // 10% Increase of price, // You need to divide by 100 - PERCENT_IMPACT to get the accurate value
//     USDC_RESERVE,
//     WETH_RESERVE,
//     false
//   )
// );
