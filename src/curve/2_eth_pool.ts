// 2 tokens pool is optimized for gas but you can just use N_COINS (see with_generic_d versin)

const N_COINS = 2;
const PRECISION = 1e18;
const FEE_DENOMINATOR = 1e10;
const FEE = 4000000;
const A_PRECISION = 100;

// TODO: CUSTOMIZE TO INJECT
const rates = [1124666417311180217, 1e18];
const A = 5000;

// TODO: FIND MORE ACCURACY
const MARGIN_OF_ERROR_FOR_CONVERGENCE = 1e5;

// Curve 2 Tokens
// https://optimistic.etherscan.io/address/0x16a7DA911A4DD1d83F3fF066fE28F3C792C50d90#code

// TODO: Unit test
// TODO: Add N_COINS since this just uses them and is basically pure
function get_D(_xp, _amp) {
  // def get_D(_xp: uint256[N_COINS], _amp: uint256) -> uint256:
  //   """
  //   D invariant calculation in non-overflowing integer operations
  //   iteratively
  //   A * sum(x_i) * n**n + D = A * D * n**n + D**(n+1) / (n**n * prod(x_i))
  //   Converging solution:
  //   D[j+1] = (A * n**n * sum(x_i) - D[j]**(n+1) / (n**n prod(x_i))) / (A * n**n - 1)
  //   """

  //   S: uint256 = 0
  let S = 0;

  //   for x in _xp:
  for (const x of _xp) {
    // S += x
    S += x;
  }

  if (S == 0) {
    return 0;
  }

  //
  //   D: uint256 = S
  let D = S;
  //   Ann: uint256 = _amp * N_COINS
  const Ann = _amp * N_COINS;

  //   for i in range(255):
  for (let i = 0; i < 255; i++) {
    // D_P: uint256 = D * D / _xp[0] * D / _xp[1] / (N_COINS)**2
    const D_P = (((D * D) / _xp[0]) * D) / _xp[1] / N_COINS ** 2;

    // Dprev: uint256 = D
    const Dprev = D;

    // D = (Ann * S / A_PRECISION + D_P * N_COINS) * D / ((Ann - A_PRECISION) * D / A_PRECISION + (N_COINS + 1) * D_P)
    D =
      (((Ann * S) / A_PRECISION + D_P * N_COINS) * D) /
      (((Ann - A_PRECISION) * D) / A_PRECISION + (N_COINS + 1) * D_P);

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

function get_y(i, j, x, xp) {
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

    console.log("y", y);
    console.log("y_prev", y_prev);
  }

  throw Error("Y not converged");
}

function _xp_mem(_rates, _balances) {
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

function get_dy(i, j, dx, balances) {
  // xp: uint256[N_COINS] = self._xp_mem(rates, self._balances())
  const xp: number[] = _xp_mem(rates, balances); // Given balances we get the adjusted balances here
  console.log("get_dy xp", xp);

  // x: uint256 = xp[i] + (dx * rates[i] / PRECISION)
  const x = xp[i] + (dx * rates[i]) / PRECISION;
  console.log("get_dy x ", x);

  // y: uint256 = self.get_y(i, j, x, xp)
  const y = get_y(i, j, x, xp);
  console.log("get_dy y ", y);

  // dy: uint256 = xp[j] - y - 1
  const dy = xp[j] - y - 1;

  // fee: uint256 = self.fee * dy / FEE_DENOMINATOR
  const fee = (FEE * dy) / FEE_DENOMINATOR;

  return ((dy - fee) * PRECISION) / rates[j];
}

export function getAmountOut(
  amountIn,
  reserveIn,
  reserveOut,
  stable = true
): number {
  if (stable != true) {
    throw Error("This is curve ser");
  }

  return get_dy(0, 1, amountIn, [reserveIn, reserveOut]);
}
