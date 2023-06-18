// 2 and 3 (and 4) token pool, this works with all of them
// Only missing MetaStable Pools

/**
 * Since 99% of the math is the same we combine it here
 * TODO: Meta Stable Pool, which requires further work / porting over of more logic
 */

import BigNumber from "bignumber.js";

// NOTE: Dirty hack, we edit this value in `getAmountOut`
let N_COINS = 2;
let FEE = BigNumber(4000000);
let A = BigNumber(50000);
// NOTE: Because these globally scoped variables are set at each call of `getAmountOut` this ends up being fine
// IMO not worth fixing due to additional complexities in interface

const PRECISION = BigNumber(1e18);
const FEE_DENOMINATOR = BigNumber(1e10);

const A_PRECISION = BigNumber(100);

const MARGIN_OF_ERROR_FOR_CONVERGENCE = BigNumber(1e10);

const two_pool_rates = [
  BigNumber(1000000000000000000000000000000),
  BigNumber(1000000000000000000000000000000),
];
const three_pool_rates = [
  1000000000000000000,
  1000000000000000000000000000000,
  1000000000000000000000000000000,
];

export function getAmountOut(
  tokenIn: BigNumber,
  reserves: BigNumber[],
  stable = true,
  override_rates: BigNumber[] = [],
  override_fee: BigNumber = FEE,
  override_a: BigNumber = A
) {
  if (stable != true) {
    throw Error("This is curve ser");
  }
  let rates = override_rates;
  if (rates.length == 0) {
    // We auto add a default, but you should always pass a value imo

    if (reserves.length == 2) {
      rates = two_pool_rates;
    }

    if (reserves.length == 3) {
      rates = three_pool_rates;
    }

    if (reserves.length > 3) {
      throw Error("MUST ADD RATES PLS");
    }
  }
  N_COINS = reserves.length;

  FEE = override_fee;
  A = override_a;
  return Math.floor(get_dy(0, 1, tokenIn, reserves, rates));
}

export function get_D(_xp: BigNumber[], _amp: BigNumber) {
  // def get_D(_xp: uint256[N_COINS], _amp: uint256) -> uint256:
  //   """
  //   D invariant calculation in non-overflowing integer operations
  //   iteratively
  //   A * sum(x_i) * n**n + D = A * D * n**n + D**(n+1) / (n**n * prod(x_i))
  //   Converging solution:
  //   D[j+1] = (A * n**n * sum(x_i) - D[j]**(n+1) / (n**n prod(x_i))) / (A * n**n - 1)
  //   """

  //   S: uint256 = 0
  const S = BigNumber(0);

  //   for x in _xp:
  for (const x of _xp) {
    // S += x
    S.plus(x);
  }

  if (S.eq(0)) {
    return BigNumber(0);
  }

  //
  //   D: uint256 = S
  let D = S;
  //   Ann: uint256 = _amp * N_COINS
  const Ann = _amp.multipliedBy(N_COINS);

  // NOTE: THIS IS DIFFERENT FOR 3 POOL
  //   for i in range(255):
  for (let i = 0; i < 255; i++) {
    // D_P: uint256 = D
    let D_P = D;

    // for x in _xp:
    for (const x of _xp) {
      if (x == 0) {
        throw Error("zero div");
      }

      D_P = D_P.multipliedBy(D).div(x.multipliedBy(N_COINS));
    }

    // Dprev: uint256 = D
    const Dprev = D;
    D =
      (((Ann.multipliedBy(S)).div(A_PRECISION).plus(D_P.multipliedBy(N_COINS)).multipliedBy(D).div(
        (((Ann.minus(A_PRECISION.multipliedBy(D))).div(A_PRECISION).plus((N_COINS + 1).mul * D_P);
      )
      

    //       # Equality with the precision of 1
    //       if D > Dprev:
    //           if D - Dprev <= 1:
    //               return D
    //       else:
    //           if Dprev - D <= 1:
    //               return D
    // NOTE: IN TS we have more margin of error, for now
    if (D > Dprev) {
      if (D - Dprev <= MARGIN_OF_ERROR_FOR_CONVERGENCE) {
        return D;
      }
    } else if (Dprev - D <= MARGIN_OF_ERROR_FOR_CONVERGENCE) {
      return D;
    }
  }

  //
  //       # Equality with the precision of 1
  //       if D > Dprev:
  //           if D - Dprev <= 1:
  //               return D
  //       else:
  //           if Dprev - D <= 1:
  //               return D
  //   # convergence typically occurs in 4 rounds or less, this should be unreachable!
  //   # if it does happen the pool is borked and LPs can withdraw via `remove_liquidity`
  //   raise
  throw Error("D not converged");
}

export function get_y(i, j, x, xp) {
  // def get_y(i: int128, j: int128, x: uint256, xp: uint256[N_COINS]) -> uint256:
  //   """
  //   Calculate x[j] if one makes x[i] = x
  //   Done by solving quadratic equation iteratively.
  //   x_1**2 + x_1 * (sum' - (A*n**n - 1) * D / (A * n**n)) = D ** (n + 1) / (n ** (2 * n) * prod' * A)
  //   x_1**2 + b*x_1 = c
  //   x_1 = (x_1**2 + c) / (2*x_1 + b)
  //   """
  //   # x in the input is converted to the same price/precision
  //   assert i != j       # dev: same coin
  //   assert j >= 0       # dev: j below zero
  //   assert j < N_COINS  # dev: j above N_COINS
  //   # should be unreachable, but good for safety
  //   assert i >= 0
  //   assert i < N_COINS

  if (i == j) {
    throw Error("Same Token");
  }

  if (j < 0) {
    throw Error("j 0");
  }

  if (j >= N_COINS) {
    throw Error("j");
  }

  if (i < 0) {
    throw Error("i");
  }

  if (i >= N_COINS) {
    throw Error("i");
  }

  //   amp: uint256 = self._A()
  const amp = A;
  //   D: uint256 = self.get_D(xp, amp)
  const D = get_D(xp, amp);

  //   S_: uint256 = 0
  //   _x: uint256 = 0
  //   y_prev: uint256 = 0
  //   c: uint256 = D
  //   Ann: uint256 = amp * N_COINS
  let S_ = 0;
  let _x = 0;
  let y_prev = 0;
  let c = D;
  const Ann = amp * N_COINS;

  //   for _i in range(N_COINS):
  //       if _i == i:
  //           _x = x
  //       elif _i != j:
  //           _x = xp[_i]
  //       else:
  //           continue
  //       S_ += _x
  //       c = c * D / (_x * N_COINS)
  for (let _i = 0; _i < N_COINS; _i++) {
    if (_i == i) {
      _x = x;
    } else if (_i != j) {
      _x = xp[_i];
    } else {
      continue;
    }

    S_ += _x;
    c = (c * D) / (_x * N_COINS);
  }

  //   c = c * D * A_PRECISION / (Ann * N_COINS)
  //   b: uint256 = S_ + D * A_PRECISION / Ann  # - D
  //   y: uint256 = D

  c = (c * D * A_PRECISION) / (Ann * N_COINS);
  const b = S_ + (D * A_PRECISION) / Ann;
  let y = D;

  //   for _i in range(255):
  //       y_prev = y
  //       y = (y*y + c) / (2 * y + b - D)
  //       # Equality with the precision of 1
  //       if y > y_prev:
  //           if y - y_prev <= 1:
  //               return y
  //       else:
  //           if y_prev - y <= 1:
  //               return y
  //   raise
  for (let _i = 0; _i < 255; _i++) {
    y_prev = y;
    y = (y * y + c) / (2 * y + b - D);

    // NOTE: IN TS we have more margin for error
    if (Math.abs(y - y_prev) < MARGIN_OF_ERROR_FOR_CONVERGENCE) {
      return y;
    }
  }

  throw Error("Y not converged");
}

export function _xp_mem(_rates, _balances) {
  // def _xp_mem(_rates: uint256[N_COINS], _balances: uint256[N_COINS]) -> uint256[N_COINS]:
  //   result: uint256[N_COINS] = empty(uint256[N_COINS])
  //   for i in range(N_COINS):
  //       result[i] = _rates[i] * _balances[i] / PRECISION
  //   return result

  const result: number[] = [];
  for (let i = 0; i < N_COINS; i++) {
    result[i] = (_rates[i] * _balances[i]) / PRECISION;
  }

  return result;
}

export function get_dy(i, j, dx, balances, rates) {
  // xp: uint256[N_COINS] = self._xp_mem(rates, self._balances())
  const xp: number[] = _xp_mem(rates, balances); // Given balances we get the adjusted balances here

  // x: uint256 = xp[i] + (dx * rates[i] / PRECISION)
  const x = xp[i] + (dx * rates[i]) / PRECISION;

  // y: uint256 = self.get_y(i, j, x, xp)
  const y = get_y(i, j, x, xp);

  // dy: uint256 = xp[j] - y - 1
  const dy = xp[j] - y - 1;

  // fee: uint256 = self.fee * dy / FEE_DENOMINATOR
  const fee = (FEE * dy) / FEE_DENOMINATOR;

  return ((dy - fee) * PRECISION) / rates[j];
}

// def calc_token_amount(amounts: uint256[N_COINS], is_deposit: bool) -> uint256:
//     """
//     @notice Calculate addition or reduction in token supply from a deposit or withdrawal
//     @dev This calculation accounts for slippage, but not fees.
//          Needed to prevent front-running, not for precise calculations!
//     @param amounts Amount of each coin being deposited
//     @param is_deposit set True for deposits, False for withdrawals
//     @return Expected amount of LP tokens received
//     """
//     amp: uint256 = self._A()
//     rates: uint256[N_COINS] = self._stored_rates()
//     _balances: uint256[N_COINS] = self.balances
//     D0: uint256 = self.get_D_mem(rates, _balances, amp)
//     for i in range(N_COINS):
//         _amount: uint256 = amounts[i]
//         if is_deposit:
//             _balances[i] += _amount
//         else:
//             _balances[i] -= _amount
//     D1: uint256 = self.get_D_mem(rates, _balances, amp)
//     token_amount: uint256 = ERC20(self.lp_token).totalSupply()
//     diff: uint256 = 0
//     if is_deposit:
//         diff = D1 - D0
//     else:
//         diff = D0 - D1
//     return diff * token_amount / D0
export function calc_token_amount(
  amounts,
  is_deposit,
  amp,
  rates,
  _balances,
  totalSupply
) {
  const N_COINS = _balances.length; // TODO: Fix globals
  //     amp: uint256 = self._A()
  //     rates: uint256[N_COINS] = self._stored_rates()
  //     _balances: uint256[N_COINS] = self.balances
  //     D0: uint256 = self.get_D_mem(rates, _balances, amp)
  const D0 = get_D_mem(rates, _balances, amp);

  // for i in range(N_COINS):
  //         _amount: uint256 = amounts[i]
  //         if is_deposit:
  //             _balances[i] += _amount
  //         else:
  //             _balances[i] -= _amount
  for (let i = 0; i < N_COINS; i++) {
    const _amount = amounts[i];
    // TODO: pretty sure this breaks CANNOT MODIFY FUN PARAM
    if (is_deposit) {
      _balances[i] += _amount;
    } else {
      _balances[i] -= _amount;
    }
  }

  //     D1: uint256 = self.get_D_mem(rates, _balances, amp)
  //     token_amount: uint256 = ERC20(self.lp_token).totalSupply()
  //     diff: uint256 = 0
  //     if is_deposit:
  //         diff = D1 - D0
  //     else:
  //         diff = D0 - D1
  //     return diff * token_amount / D0
  const D1 = get_D_mem(rates, _balances, amp);
  const token_amount = totalSupply;
  let diff = 0;
  if (is_deposit) {
    diff = D1 - D0;
  } else {
    diff = D0 - 1;
  }

  return (diff * token_amount) / D0;
}

// NOTE: If you need to calculate returns from withdrawing, it's that simple
export function calc_remove_liquidity(burn_amount, balances, total_supply) {
  const return_amounts = balances.map((old_balance) =>
    Math.floor((old_balance * burn_amount) / total_supply)
  ); // 0 values array of N_COINS

  /**
   * value: uint256 = old_balance * _burn_amount / total_supply
   */
  return return_amounts;
}

/**
 * NOTE
 * @view
@internal
Just a way to convert to adjusted balances
def get_D_mem(rates: uint256[N_COINS], _balances: uint256[N_COINS], amp: uint256) -> uint256:
    result: uint256[N_COINS] = rates
    for i in range(N_COINS):
        result[i] = result[i] * _balances[i] / PRECISION
    return self.get_D(result, amp)
 */

function get_D_mem(rates, balances, amp) {
  const result = rates;
  for (let i = 0; i < result.length; i++) {
    result[i] = (result[i] * balances[i]) / PRECISION;
  }

  return get_D(result, amp);
}

export function calc_withdraw_one_coin(
  _burn_amount,
  i,
  amp,
  rates,
  balances,
  totalSupply,
  fee // TODO: Figure out FEE vs fee, esp in context of it being injected as global
) {
  // TODO: FIX GLOBALS
  FEE = fee;
  A = amp;
  N_COINS = balances.length;

  //   amp: uint256 = self._A() // NOTE: it's a param
  //   rates: uint256[N_COINS] = self.rate_multipliers
  //   xp: uint256[N_COINS] = self._xp_mem(rates, self._balances())
  //   D0: uint256 = self.get_D(xp, amp)
  const xp = _xp_mem(rates, balances);
  const D0 = get_D(xp, amp);

  //   total_supply: uint256 = self.totalSupply // NOTE: it's a param
  //   D1: uint256 = D0 - _burn_amount * D0 / total_supply
  //   new_y: uint256 = self.get_y_D(amp, i, xp, D1)
  const D1 = D0 - Math.floor((_burn_amount * D0) / totalSupply);

  const new_y = get_y_D(amp, i, xp, D1);

  //   base_fee: uint256 = self.fee * N_COINS / (4 * (N_COINS - 1))
  const base_fee = (fee * N_COINS) / (4 * (N_COINS - 1));
  //   xp_reduced: uint256[N_COINS] = empty(uint256[N_COINS])
  const xp_reduced = rates.map((r) => r - r); // 0 array

  //   for j in range(N_COINS):
  //       dx_expected: uint256 = 0
  //       xp_j: uint256 = xp[j]
  //       if j == i:
  //           dx_expected = xp_j * D1 / D0 - new_y
  //       else:
  //           dx_expected = xp_j - xp_j * D1 / D0
  //       xp_reduced[j] = xp_j - base_fee * dx_expected / FEE_DENOMINATOR
  for (let j = 0; j < N_COINS; j++) {
    let dx_expected = 0;
    const xp_j = xp[j];

    if (j == i) {
      dx_expected = (xp_j * D1) / D0 - new_y;
    } else {
      dx_expected = xp_j - (xp_j * D1) / D0;
    }
    xp_reduced[j] = xp_j - (base_fee * dx_expected) / FEE_DENOMINATOR;
  }

  //   dy: uint256 = xp_reduced[i] - self.get_y_D(amp, i, xp_reduced, D1)
  //   dy_0: uint256 = (xp[i] - new_y) * PRECISION / rates[i]  # w/o fees
  //   dy = (dy - 1) * PRECISION / rates[i]  # Withdraw less to account for rounding errors
  let dy = xp_reduced[i] - get_y_D(amp, i, xp_reduced, D1);
  const dy_0 = ((xp[i] - new_y) * PRECISION) / rates[i]; // NOTE: unused
  dy = ((dy - 1) * PRECISION) / rates[i];

  return dy;
}

// def _calc_withdraw_one_coin(_burn_amount: uint256, i: int128) -> uint256[2]:
//   # First, need to calculate
//   # * Get current D
//   # * Solve Eqn against y_i for D - _token_amount
//   amp: uint256 = self._A()
//   rates: uint256[N_COINS] = self.rate_multipliers
//   xp: uint256[N_COINS] = self._xp_mem(rates, self._balances())
//   D0: uint256 = self.get_D(xp, amp)

//   total_supply: uint256 = self.totalSupply
//   D1: uint256 = D0 - _burn_amount * D0 / total_supply
//   new_y: uint256 = self.get_y_D(amp, i, xp, D1)

//   base_fee: uint256 = self.fee * N_COINS / (4 * (N_COINS - 1))
//   xp_reduced: uint256[N_COINS] = empty(uint256[N_COINS])

//   for j in range(N_COINS):
//       dx_expected: uint256 = 0
//       xp_j: uint256 = xp[j]
//       if j == i:
//           dx_expected = xp_j * D1 / D0 - new_y
//       else:
//           dx_expected = xp_j - xp_j * D1 / D0
//       xp_reduced[j] = xp_j - base_fee * dx_expected / FEE_DENOMINATOR

//   dy: uint256 = xp_reduced[i] - self.get_y_D(amp, i, xp_reduced, D1)
//   dy_0: uint256 = (xp[i] - new_y) * PRECISION / rates[i]  # w/o fees
//   dy = (dy - 1) * PRECISION / rates[i]  # Withdraw less to account for rounding errors

//   return [dy, dy_0 - dy]

function get_y_D(A, i, xp, D) {
  const N_COINS = xp.length;
  // A
  //     assert i >= 0  # dev: i below zero
  //     assert i < N_COINS  # dev: i above N_COINS
  if (i < 0) {
    throw Error("i");
  }

  if (i >= N_COINS) {
    throw Error("i");
  }
  // B
  //     S_: uint256 = 0
  //     _x: uint256 = 0
  //     y_prev: uint256 = 0
  //     c: uint256 = D
  //     Ann: uint256 = A * N_COINS

  let S_ = 0;
  let _x = 0;
  let y_prev = 0;
  let c = D;
  const Ann = A * N_COINS;
  // C
  //     for _i in range(N_COINS):
  //         if _i != i:
  //             _x = xp[_i]
  //         else:
  //             continue
  //         S_ += _x
  //         c = c * D / (_x * N_COINS)
  for (let _i = 0; _i < N_COINS; _i++) {
    if (_i !== i) {
      _x = xp[_i];
    } else {
      continue;
    }

    S_ += _x;
    c = Math.floor((c * D) / (_x * N_COINS));
  }
  // D
  //     c = c * D * A_PRECISION / (Ann * N_COINS)
  //     b: uint256 = S_ + D * A_PRECISION / Ann
  //     y: uint256 = D
  c = Math.floor((c * D * A_PRECISION) / (Ann * N_COINS));
  const b = S_ + Math.floor((D * A_PRECISION) / Ann);
  let y = D;
  // E
  for (let _i = 0; _i < 255; _i++) {
    y_prev = y;
    y = (y * y + c) / (2 * y + b - D);

    // NOTE: IN TS we have more margin for error
    if (Math.abs(y - y_prev) < MARGIN_OF_ERROR_FOR_CONVERGENCE) {
      return y;
    }
  }

  throw Error("Y not converged");
}
// def get_y_D(A: uint256, i: int128, xp: uint256[N_COINS], D: uint256) -> uint256:
//     """
//     Calculate x[i] if one reduces D from being calculated for xp to D

//     Done by solving quadratic equation iteratively.
//     x_1**2 + x_1 * (sum' - (A*n**n - 1) * D / (A * n**n)) = D ** (n + 1) / (n ** (2 * n) * prod' * A)
//     x_1**2 + b*x_1 = c

//     x_1 = (x_1**2 + c) / (2*x_1 + b)
//     """
//     # x in the input is converted to the same price/precision
// A
//     assert i >= 0  # dev: i below zero
//     assert i < N_COINS  # dev: i above N_COINS
// B
//     S_: uint256 = 0
//     _x: uint256 = 0
//     y_prev: uint256 = 0
//     c: uint256 = D
//     Ann: uint256 = A * N_COINS
// C
//     for _i in range(N_COINS):
//         if _i != i:
//             _x = xp[_i]
//         else:
//             continue
//         S_ += _x
//         c = c * D / (_x * N_COINS)
// D
//     c = c * D * A_PRECISION / (Ann * N_COINS)
//     b: uint256 = S_ + D * A_PRECISION / Ann
//     y: uint256 = D
// E
//     for _i in range(255):
//         y_prev = y
//         y = (y*y + c) / (2 * y + b - D)
//         # Equality with the precision of 1
//         if y > y_prev:
//             if y - y_prev <= 1:
//                 return y
//         else:
//             if y_prev - y <= 1:
//                 return y
//     raise
