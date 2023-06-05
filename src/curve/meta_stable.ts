// // Curve 2 Tokens
// // https://optimistic.etherscan.io/address/0x16a7DA911A4DD1d83F3fF066fE28F3C792C50d90#code

import { get_D } from "./omni_pool";

// https://optimistic.etherscan.io/address/0x2db0e83599a91b508ac268a6197b8b14f5e72840#code#L645
// RATE 10** (36 - decimals) = 10**18


// @view
// @external
// def get_dy(i: int128, j: int128, dx: uint256) -> uint256:
//     """
//     @notice Calculate the current output dy given input dx
//     @dev Index values can be found via the `coins` public getter method
//     @param i Index value for the coin to send
//     @param j Index valie of the coin to recieve
//     @param dx Amount of `i` being exchanged
//     @return Amount of `j` predicted
//     """
//     rates: uint256[N_COINS] = [self.rate_multiplier, Curve(BASE_POOL).get_virtual_price()]
//     xp: uint256[N_COINS] = self._xp_mem(rates, self.balances)

//     x: uint256 = xp[i] + (dx * rates[i] / PRECISION)
//     y: uint256 = self.get_y(i, j, x, xp)
//     dy: uint256 = xp[j] - y - 1
//     fee: uint256 = self.fee * dy / FEE_DENOMINATOR
//     return (dy - fee) * PRECISION / rates[j]


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