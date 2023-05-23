// // Basically a stable pool
// // where rate is `get_virtual_price` of the other pool

// // A 0 -> 1 swap is from 0 (new coin) to 1(other curve LP token)
// // A 1 -> 1+COINS is a swap in the base pool

// // So a 0 -> 1+COINS is a 0 -> LP -> 1

// // TODO: Extra for Meta Stable are:
// // TOTAL SUPPLY OF BASE POOL
// // BALANCES OF BASE POOL

// const N_COINS = 2;
// const MAX_COIN = N_COINS - 1;
// const PRECISION = 1e18;
// const FEE_DENOMINATOR = 1e10;
// const FEE = 4000000;
// const A_PRECISION = 100;

// // 1e18, Virtual Price of 3crv
// const rates = [1e18, 1018060725039318419];
// const A = 50000;

// // TODO: FIND MORE ACCURACY
// const MARGIN_OF_ERROR_FOR_CONVERGENCE = 1e12;

// // Curve 2 Tokens
// // https://optimistic.etherscan.io/address/0x16a7DA911A4DD1d83F3fF066fE28F3C792C50d90#code

// // TODO: Unit test
// // TODO: Add N_COINS since this just uses them and is basically pure
// function get_D(_xp, _amp) {
//   // def get_D(_xp: uint256[N_COINS], _amp: uint256) -> uint256:
//   //   """
//   //   D invariant calculation in non-overflowing integer operations
//   //   iteratively
//   //   A * sum(x_i) * n**n + D = A * D * n**n + D**(n+1) / (n**n * prod(x_i))
//   //   Converging solution:
//   //   D[j+1] = (A * n**n * sum(x_i) - D[j]**(n+1) / (n**n prod(x_i))) / (A * n**n - 1)
//   //   """

//   //   S: uint256 = 0
//   let S = 0;

//   //   for x in _xp:
//   for (const x of _xp) {
//     // S += x
//     S += x;
//   }

//   if (S == 0) {
//     return 0;
//   }

//   //
//   //   D: uint256 = S
//   let D = S;
//   //   Ann: uint256 = _amp * N_COINS
//   const Ann = _amp * N_COINS;

//   // NOTE: THIS IS DIFFERENT FOR 3 POOL
//   //   for i in range(255):
//   for (let i = 0; i < 255; i++) {
//     // D_P: uint256 = D
//     let D_P = D;

//     // for x in _xp:
//     for (const x of _xp) {
//       if (x == 0) {
//         throw Error("zero div");
//       }

//       D_P = (D_P * D) / (x * N_COINS); // # If division by 0, this will be borked: only withdrawal will work. And that is good
//     }

//     // Dprev: uint256 = D
//     const Dprev = D;
//     D =
//       (((Ann * S) / A_PRECISION + D_P * N_COINS) * D) /
//       (((Ann - A_PRECISION) * D) / A_PRECISION + (N_COINS + 1) * D_P);

//     //       # Equality with the precision of 1
//     //       if D > Dprev:
//     //           if D - Dprev <= 1:
//     //               return D
//     //       else:
//     //           if Dprev - D <= 1:
//     //               return D
//     // NOTE: IN TS we have more margin of error, for now
//     console.log("D", D);
//     console.log("Dprev", Dprev);
//     if (D > Dprev) {
//       if (D - Dprev <= MARGIN_OF_ERROR_FOR_CONVERGENCE) {
//         return D;
//       }
//     } else if (Dprev - D <= MARGIN_OF_ERROR_FOR_CONVERGENCE) {
//       return D;
//     }
//   }

//   //
//   //       # Equality with the precision of 1
//   //       if D > Dprev:
//   //           if D - Dprev <= 1:
//   //               return D
//   //       else:
//   //           if Dprev - D <= 1:
//   //               return D
//   //   # convergence typically occurs in 4 rounds or less, this should be unreachable!
//   //   # if it does happen the pool is borked and LPs can withdraw via `remove_liquidity`
//   //   raise
//   throw Error("D not converged");
// }

// function get_y(i, j, x, xp) {
//   // def get_y(i: int128, j: int128, x: uint256, xp: uint256[N_COINS]) -> uint256:
//   //   """
//   //   Calculate x[j] if one makes x[i] = x
//   //   Done by solving quadratic equation iteratively.
//   //   x_1**2 + x_1 * (sum' - (A*n**n - 1) * D / (A * n**n)) = D ** (n + 1) / (n ** (2 * n) * prod' * A)
//   //   x_1**2 + b*x_1 = c
//   //   x_1 = (x_1**2 + c) / (2*x_1 + b)
//   //   """
//   //   # x in the input is converted to the same price/precision
//   //   assert i != j       # dev: same coin
//   //   assert j >= 0       # dev: j below zero
//   //   assert j < N_COINS  # dev: j above N_COINS
//   //   # should be unreachable, but good for safety
//   //   assert i >= 0
//   //   assert i < N_COINS

//   if (i == j) {
//     throw Error("Same Token");
//   }

//   if (j < 0) {
//     throw Error("j 0");
//   }

//   if (j >= N_COINS) {
//     throw Error("j");
//   }

//   if (i < 0) {
//     throw Error("i");
//   }

//   if (i >= N_COINS) {
//     throw Error("i");
//   }

//   //   amp: uint256 = self._A()
//   const amp = A;
//   //   D: uint256 = self.get_D(xp, amp)
//   const D = get_D(xp, amp);

//   //   S_: uint256 = 0
//   //   _x: uint256 = 0
//   //   y_prev: uint256 = 0
//   //   c: uint256 = D
//   //   Ann: uint256 = amp * N_COINS
//   let S_ = 0;
//   let _x = 0;
//   let y_prev = 0;
//   let c = D;
//   const Ann = amp * N_COINS;

//   //   for _i in range(N_COINS):
//   //       if _i == i:
//   //           _x = x
//   //       elif _i != j:
//   //           _x = xp[_i]
//   //       else:
//   //           continue
//   //       S_ += _x
//   //       c = c * D / (_x * N_COINS)
//   for (let _i = 0; _i < N_COINS; _i++) {
//     if (_i == i) {
//       _x = x;
//     } else if (_i != j) {
//       _x = xp[_i];
//     } else {
//       continue;
//     }

//     S_ += _x;
//     c = (c * D) / (_x * N_COINS);
//   }

//   //   c = c * D * A_PRECISION / (Ann * N_COINS)
//   //   b: uint256 = S_ + D * A_PRECISION / Ann  # - D
//   //   y: uint256 = D

//   c = (c * D * A_PRECISION) / (Ann * N_COINS);
//   const b = S_ + (D * A_PRECISION) / Ann;
//   let y = D;

//   //   for _i in range(255):
//   //       y_prev = y
//   //       y = (y*y + c) / (2 * y + b - D)
//   //       # Equality with the precision of 1
//   //       if y > y_prev:
//   //           if y - y_prev <= 1:
//   //               return y
//   //       else:
//   //           if y_prev - y <= 1:
//   //               return y
//   //   raise
//   for (let _i = 0; _i < 255; _i++) {
//     y_prev = y;
//     y = (y * y + c) / (2 * y + b - D);

//     // NOTE: IN TS we have more margin for error
//     if (Math.abs(y - y_prev) < MARGIN_OF_ERROR_FOR_CONVERGENCE) {
//       return y;
//     }

//     console.log("y", y);
//     console.log("y_prev", y_prev);
//   }

//   throw Error("Y not converged");
// }

// function _xp_mem(_rates, _balances) {
//   // def _xp_mem(_rates: uint256[N_COINS], _balances: uint256[N_COINS]) -> uint256[N_COINS]:
//   //   result: uint256[N_COINS] = empty(uint256[N_COINS])
//   //   for i in range(N_COINS):
//   //       result[i] = _rates[i] * _balances[i] / PRECISION
//   //   return result

//   const result: number[] = [];
//   for (let i = 0; i < N_COINS; i++) {
//     result[i] = (_rates[i] * _balances[i]) / PRECISION;
//   }

//   return result;
// }

// function get_dy(i, j, dx, balances) {
//   // xp: uint256[N_COINS] = self._xp_mem(rates, self._balances())
//   const xp: number[] = _xp_mem(rates, balances); // Given balances we get the adjusted balances here
//   console.log("get_dy xp", xp);

//   // x: uint256 = xp[i] + (dx * rates[i] / PRECISION)
//   const x = xp[i] + (dx * rates[i]) / PRECISION;
//   console.log("get_dy x ", x);

//   // y: uint256 = self.get_y(i, j, x, xp)
//   const y = get_y(i, j, x, xp);
//   console.log("get_dy y ", y);

//   // dy: uint256 = xp[j] - y - 1
//   const dy = xp[j] - y - 1;

//   // fee: uint256 = self.fee * dy / FEE_DENOMINATOR
//   const fee = (FEE * dy) / FEE_DENOMINATOR;

//   return ((dy - fee) * PRECISION) / rates[j];
// }

// export function getAmountOut(
//   amountIn,
//   reserveIn,
//   reserveOut,
//   stable = true
// ): number {
//   if (stable != true) {
//     throw Error("This is curve ser");
//   }

//   return get_dy(0, 1, amountIn, [reserveIn, reserveOut]);
// }

// function get_dy_underlying(i, j, dx, balances) {
//   // Already declared above
//   // rates: uint256[N_COINS] = [self.rate_multiplier, Curve(BASE_POOL).get_virtual_price()]
//   // xp: uint256[N_COINS] = self._xp_mem(rates, self.balances)
//   const xp: number[] = _xp_mem(rates, balances);

//   // x: uint256 = 0
//   // base_i: int128 = 0
//   // base_j: int128 = 0
//   // meta_i: int128 = 0
//   // meta_j: int128 = 0
//   let x = 0;
//   let base_i = 0;
//   let base_j = 0;
//   let meta_i = 0;
//   let meta_j = 0;

//   // if i != 0:
//   //   base_i = i - MAX_COIN
//   //   meta_i = 1
//   // if j != 0:
//   //   base_j = j - MAX_COIN
//   //   meta_j = 1
//   if (i != 0) {
//     base_i = i - MAX_COIN;
//     meta_i = 1;
//   }

//   if (j != 0) {
//     base_j = j - MAX_COIN;
//     meta_j = 1;
//   }

//   /**
//    * if i == 0:
//         x = xp[i] + dx * (rates[0] / 10**18)
//     else:
//         if j == 0:
//             # i is from BasePool
//             # At first, get the amount of pool tokens
//             base_inputs: uint256[BASE_N_COINS] = empty(uint256[BASE_N_COINS])
//             base_inputs[base_i] = dx
//             # Token amount transformed to underlying "dollars"
//             x = Curve(BASE_POOL).calc_token_amount(base_inputs, True) * rates[1] / PRECISION
//             # Accounting for deposit/withdraw fees approximately
//             x -= x * Curve(BASE_POOL).fee() / (2 * FEE_DENOMINATOR)
//             # Adding number of pool tokens
//             x += xp[MAX_COIN]
//         else:
//             # If both are from the base pool
//             return Curve(BASE_POOL).get_dy(base_i, base_j, dx)
//    */

//   if (i == 0) {
//     x = xp[i] + dx * (rates[0] / 10 ** 18);
//   } else {
//     throw Error("NOT IMPLEMENTED");
//     // IF YOU WANT TO DO AN INTERNAL META SWAP, JUST DO TWO SWAPS AND BE DONE WITH IT
//     // THE EXTRA CODE HERE IS NOT WORTH MAINTAINING
//     // if(j == 0) {
//     //   /**
//     //       * # i is from BasePool
//     //         # At first, get the amount of pool tokens
//     //         base_inputs: uint256[BASE_N_COINS] = empty(uint256[BASE_N_COINS])
//     //         base_inputs[base_i] = dx
//     //         # Token amount transformed to underlying "dollars"
//     //         x = Curve(BASE_POOL).calc_token_amount(base_inputs, True) * rates[1] / PRECISION
//     //         # Accounting for deposit/withdraw fees approximately
//     //         x -= x * Curve(BASE_POOL).fee() / (2 * FEE_DENOMINATOR)
//     //         # Adding number of pool tokens
//     //    */
//     //   let base_inputs = []
//     //   base_inputs[base_i] = dx
//     //   // x = Curve(BASE_POOL).calc_token_amount(base_inputs, True) * rates[1] / PRECISION
//     //   x =
//     //   // x -= x * Curve(BASE_POOL).fee() / (2 * FEE_DENOMINATOR)

//     // } else {
//     //   // Basically we just run the normal getAmountOut, given the balances and rates of the base pool
//     //   return Curve(BASE_POOL).get_dy(base_i, base_j, dx)
//     // }
//   }

//   // # This pool is involved only when in-pool assets are used
//   // y: uint256 = self.get_y(meta_i, meta_j, x, xp)
//   // dy: uint256 = xp[meta_j] - y - 1
//   // dy = (dy - self.fee * dy / FEE_DENOMINATOR)
//   const y = get_y(meta_i, meta_j, x, xp);
//   let dy = xp[meta_j] - y - 1;
//   dy -= (FEE * dy) / FEE_DENOMINATOR;

//   if (j == 0) {
//     throw Error("NOT IMPLEMENTED");
//   } else {
//     // TODO: We need to impleemnt the withdraw one coin for base pool
//     dy = calc_withdraw_one_coin((dy * PRECISION) / rates[1], base_j);
//   }

//   return dy;

//   // # If output is going via the metapool
//   // if j == 0:
//   //     dy /= (rates[0] / 10**18)
//   // else:
//   //     # j is from BasePool
//   //     # The fee is already accounted for
//   //     dy = Curve(BASE_POOL).calc_withdraw_one_coin(dy * PRECISION / rates[1], base_j)

//   // return dy
// }

// /**
//  *
//  * @view
// @external
// def get_dy_underlying(i: int128, j: int128, dx: uint256) -> uint256:
//     """
//     @notice Calculate the current output dy given input dx on underlying
//     @dev Index values can be found via the `coins` public getter method
//     @param i Index value for the coin to send
//     @param j Index valie of the coin to recieve
//     @param dx Amount of `i` being exchanged
//     @return Amount of `j` predicted
//     """
//     rates: uint256[N_COINS] = [self.rate_multiplier, Curve(BASE_POOL).get_virtual_price()]
//     xp: uint256[N_COINS] = self._xp_mem(rates, self.balances)

//     x: uint256 = 0
//     base_i: int128 = 0
//     base_j: int128 = 0
//     meta_i: int128 = 0
//     meta_j: int128 = 0

//     if i != 0:
//         base_i = i - MAX_COIN
//         meta_i = 1
//     if j != 0:
//         base_j = j - MAX_COIN
//         meta_j = 1

//     if i == 0:
//         x = xp[i] + dx * (rates[0] / 10**18)
//     else:
//         if j == 0:
//             # i is from BasePool
//             # At first, get the amount of pool tokens
//             base_inputs: uint256[BASE_N_COINS] = empty(uint256[BASE_N_COINS])
//             base_inputs[base_i] = dx
//             # Token amount transformed to underlying "dollars"
//             x = Curve(BASE_POOL).calc_token_amount(base_inputs, True) * rates[1] / PRECISION
//             # Accounting for deposit/withdraw fees approximately
//             x -= x * Curve(BASE_POOL).fee() / (2 * FEE_DENOMINATOR)
//             # Adding number of pool tokens
//             x += xp[MAX_COIN]
//         else:
//             # If both are from the base pool
//             return Curve(BASE_POOL).get_dy(base_i, base_j, dx)

//     # This pool is involved only when in-pool assets are used
//     y: uint256 = self.get_y(meta_i, meta_j, x, xp)
//     dy: uint256 = xp[meta_j] - y - 1
//     dy = (dy - self.fee * dy / FEE_DENOMINATOR)

//     # If output is going via the metapool
//     if j == 0:
//         dy /= (rates[0] / 10**18)
//     else:
//         # j is from BasePool
//         # The fee is already accounted for
//         dy = Curve(BASE_POOL).calc_withdraw_one_coin(dy * PRECISION / rates[1], base_j)

//     return dy
//  */

// //

// export function getAmountOut(
//   amountIn,
//   reserveIn,
//   reserveOut,
//   thirdReserve,
//   stable = true
// ): number {
//   if (stable != true) {
//     throw Error("This is curve ser");
//   }

//   return get_dy(0, 1, amountIn, [reserveIn, reserveOut, thirdReserve]);
// }

// // getAmountOut
// // Is it for the extraToken -> Still need base pool
// // Is it for the rest of the tokens? -> Always need basePool [extra, [BASE_POOL]], [rates, [BASE_POOL_RATES]]

// /**
//  *
//  * def _calc_withdraw_one_coin(_burn_amount: uint256, i: int128) -> uint256[2]:
//     # First, need to calculate
//     # * Get current D
//     # * Solve Eqn against y_i for D - _token_amount
//     amp: uint256 = self._A()
//     rates: uint256[N_COINS] = RATE_MULTIPLIERS
//     xp: uint256[N_COINS] = self._xp_mem(self.balances)
//     D0: uint256 = self.get_D(xp, amp)

//     total_supply: uint256 = self.totalSupply
//     D1: uint256 = D0 - _burn_amount * D0 / total_supply
//     new_y: uint256 = self.get_y_D(amp, i, xp, D1)

//     base_fee: uint256 = self.fee * N_COINS / (4 * (N_COINS - 1))
//     xp_reduced: uint256[N_COINS] = empty(uint256[N_COINS])

//     for j in range(N_COINS):
//         dx_expected: uint256 = 0
//         xp_j: uint256 = xp[j]
//         if j == i:
//             dx_expected = xp_j * D1 / D0 - new_y
//         else:
//             dx_expected = xp_j - xp_j * D1 / D0
//         xp_reduced[j] = xp_j - base_fee * dx_expected / FEE_DENOMINATOR

//     dy: uint256 = xp_reduced[i] - self.get_y_D(amp, i, xp_reduced, D1)
//     dy_0: uint256 = (xp[i] - new_y) * PRECISION / rates[i]  # w/o fees
//     dy = (dy - 1) * PRECISION / rates[i]  # Withdraw less to account for rounding errors

//     return [dy, dy_0 - dy]

//  */

// // NOTE: Called as
// // dy = Curve(BASE_POOL).calc_withdraw_one_coin(dy * PRECISION / rates[1], base_j)

// // function _calc_withdraw_one_coin(
// //   _burn_amount,
// //   i,
// //   // TODO: We can just default to three pool here
// //   rates = [], // Default to three_pool
// //   balances = [], // Default to three pool
// //   total_supply,
// //   fee
// // ) {
// //   const amp = A;
// //   // const rates = RATE_MULTIPLIERS // rates
// //   const xp = _xp_mem(balances);

// //   // TODO: Needs coins because we are going to read from global and it will be a mess
// //   const D0 = get_D(xp, amp);

// //   // total_supply: uint256 = self.totalSupply
// //   const D1 = D0 - (_burn_amount * D0) / total_supply;

// //   // new_y: uint256 = self.get_y_D(amp, i, xp, D1)
// //   const new_y = get_y_D(amp, i, xp, D1);

// //   // base_fee: uint256 = self.fee * N_COINS / (4 * (N_COINS - 1))
// //   // xp_reduced: uint256[N_COINS] = empty(uint256[N_COINS])
// //   const base_fee = (fee * N_COINS) / (4 * (N_COINS - 1));
// //   const xp_reduced = [];

// //   // for j in range(N_COINS):
// //   //     dx_expected: uint256 = 0
// //   //     xp_j: uint256 = xp[j]
// //   //     if j == i:
// //   //         dx_expected = xp_j * D1 / D0 - new_y
// //   //     else:
// //   //         dx_expected = xp_j - xp_j * D1 / D0
// //   //     xp_reduced[j] = xp_j - base_fee * dx_expected / FEE_DENOMINATOR

// //   for (let j = 0; j < N_COINS; j++) {
// //     let dx_expected = 0;
// //     const xp_j = xp[j];

// //     if (j == i) {
// //       dx_expected = (xp_j * D1) / D0 - new_y;
// //     } else {
// //       dx_expected = xp_j - (xp_j * D1) / D0;
// //     }
// //     xp_reduced[j] = xp_j - (base_fee * dx_expected) / FEE_DENOMINATOR;
// //   }

// //   // dy: uint256 = xp_reduced[i] - self.get_y_D(amp, i, xp_reduced, D1)
// //   let dy = xp_reduced[i] - get_y_D(amp, i, xp_reduced, D1);

// //   // dy_0: uint256 = (xp[i] - new_y) * PRECISION / rates[i]  # w/o fees
// //   const dy_0 = ((xp[i] - new_y) * PRECISION) / rates[i];

// //   // dy = (dy - 1) * PRECISION / rates[i]  # Withdraw less to account for rounding errors
// //   dy = ((dy - 1) * PRECISION) / rates[i];
// //   // return [dy, dy_0 - dy]

// //   return [dy, dy_0 - dy];
// // }

// function get_y_D(A, i, xp, D) {
//   // assert i >= 0  # dev: i below zero
//   // assert i < N_COINS  # dev: i above N_COINS
//   if (i < 0) {
//     throw Error("I >= 0");
//   }

//   if (i > N_COINS) {
//     throw Error("i < N_COINS");
//   }

//   // S_: uint256 = 0
//   // _x: uint256 = 0
//   // y_prev: uint256 = 0
//   // c: uint256 = D
//   // Ann: uint256 = A * N_COINS

//   let S_ = 0;
//   let _x = 0;
//   let y_prev = 0;
//   let c = D;
//   const Ann = A * N_COINS;

//   // for _i in range(N_COINS):
//   //       if _i != i:
//   //           _x = xp[_i]
//   //       else:
//   //           continue
//   //       S_ += _x
//   //       c = c * D / (_x * N_COINS)

//   for (let _i = 0; _i < N_COINS; _i++) {
//     if (_i != i) {
//       _x = xp[_i];
//     } else {
//       continue;
//     }

//     S_ += _x;
//     c = (c * D) / (_x * N_COINS);
//   }

//   // c = c * D * A_PRECISION / (Ann * N_COINS)
//   // b: uint256 = S_ + D * A_PRECISION / Ann
//   // y: uint256 = D
//   c = (c * D * A_PRECISION) / (Ann * N_COINS);
//   const b = S_ + (D * A_PRECISION) / Ann;
//   let y = D;

//   for (let _i = 0; _i < 255; _i++) {
//     y_prev = y;
//     y = (y * y + c) / (2 * y + b - D);

//     // NOTE: IN TS we have more margin for error
//     if (Math.abs(y - y_prev) < MARGIN_OF_ERROR_FOR_CONVERGENCE) {
//       return y;
//     }
//   }

//   // for _i in range(255):
//   //       y_prev = y
//   //       y = (y*y + c) / (2 * y + b - D)
//   //       # Equality with the precision of 1
//   //       if y > y_prev:
//   //           if y - y_prev <= 1:
//   //               return y
//   //       else:
//   //           if y_prev - y <= 1:
//   //               return y
//   // raise

//   throw "get_y_D Did not converge";
// }
