// // Curve Meta Pool
// E.g. https://optimistic.etherscan.io/address/0x061b87122Ed14b9526A813209C8a59a633257bAb

// https://optimistic.etherscan.io/token/0x8c6f28f2f1a3c87f0f938b96d27520d9751ec8d9
// 3 CRV: https://optimistic.etherscan.io/address/0x1337BedC9D22ecbe766dF105c9623922A27963EC#readContract

import {
  _xp_mem,
  calc_token_amount,
  calc_withdraw_one_coin,
  get_D,
  get_dy,
  get_y,
} from "./omni_pool";

const FEE_DENOMINATOR = 1e10;
const PRECISION = 1e18;
// https://optimistic.etherscan.io/address/0x2db0e83599a91b508ac268a6197b8b14f5e72840#code#L645
// RATE 10** (36 - decimals) = 10**18

// Rate 1 is basically that
// Rate 2 is get_virtual_price() // from 3crv

// 0 -> 1
// Swap + Cost of Withdraw One Coin

// 1 -> 0
// Cost of Deposit One Coin -> Swap
// Deposit one coin = calc_token_amount
// TODO: Why no custom A?
function get_dy_underlying(
  i,
  j,
  dx,
  reserves,
  rates,
  fee,
  base_amp,
  base_rates,
  _base_balances,
  _base_totalSupply,
  _base_fee
) {
  const xp = _xp_mem(rates, reserves);
  const MAX_COIN = rates.length - 1;

  let x = 0;
  let base_i = 0;
  let base_j = 0;
  let meta_i = 0;
  let meta_j = 0;

  if (i != 0) {
    base_i = i - MAX_COIN;
    meta_i = 1;
  }
  if (j != 0) {
    base_j = j - MAX_COIN;
    meta_j = 1;
  }

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

  if (i == 0) {
    x = xp[i] + dx * (rates[0] / 10 ** 18); // TODO: This may be different per impl, due to hardcoded 10e18
  } else if (j == 0) {
    const base_inputs = rates.map((r) => r - r); // 0s with length of rates
    base_inputs[base_i] = dx;
    x =
      (calc_token_amount(
        base_inputs,
        true,
        base_amp,
        base_rates,
        _base_balances,
        _base_totalSupply
      ) *
        rates[1]) /
      PRECISION;
    x -= (x * _base_fee) / (2 * FEE_DENOMINATOR);
    x += xp[MAX_COIN];
  } else {
    throw Error("Base Swap not supported"); // If you want to do base swap, just use the omni_pool
  }

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
  const y = get_y(meta_i, meta_j, x, xp);
  let dy = xp[meta_j] - y - 1;
  dy -= (fee * dy) / FEE_DENOMINATOR;

  if (j === 0) {
    dy /= rates[0] / 10 ** 18;
  } else {
    dy = calc_withdraw_one_coin(
      (dy * PRECISION) / rates[1],
      base_j,
      base_amp,
      base_rates,
      _base_balances,
      _base_totalSupply,
      _base_fee
    );
  }

  return dy;
}

// @view
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
export default get_dy_underlying;
