import { getAmountOut } from "./curve/omni_pool";

// https://optimistic.etherscan.io/address/0xB90B9B1F91a01Ea22A182CD84C1E22222e39B415
// wstETH / ETH
// 5173363528549454579773
// 4548413514356884148139
// 1e18, Virtual Price of 3crv

const sUSD_3CRV_rates = [1e18, 1018060725039318419];

const wstETHRates = [1124666417311180217, 1e18];

const two_pool_rates = [
  1000000000000000000000000000000,
  1000000000000000000000000000000,
];
const three_pool_rates = [
  1000000000000000000,
  1000000000000000000000000000000,
  1000000000000000000000000000000,
];
const wstETH_A = 5000;
const wstETH_FEE = 4000000;

function unitToEth(num) {
  return num * 1e18;
}
const amtWstETH = getAmountOut(
  unitToEth(100),
  [4553549671510521193697, 5165758101183488254085],
  true,
  wstETHRates,
  wstETH_FEE,
  wstETH_A
);
console.log("getAmountOut amtWstETH", amtWstETH);

// TODO: Balances
// Rates
// Exchange of non-standard
// Rates must be sorted with balances
// Once we do that we, good I think

// ALSO:
// A
// Fee

const amtTriPoolDai = getAmountOut(
  unitToEth(100),
  [4576218006957960181806950, 2531054804331, 2244739756319],
  true,
  three_pool_rates,
  1000000,
  200000
);
console.log("getAmountOut amtTriPoolDai", amtTriPoolDai);

const three_pool_rates_usdc_to_dai = [
  1000000000000000000000000000000,
  1000000000000000000,
  1000000000000000000000000000000,
];

const amtTriPoolUsdc = getAmountOut(
  100 * 1e6,
  [2531054804331, 4576218006957960181806950, 2244739756319],
  true,
  three_pool_rates_usdc_to_dai,
  1000000,
  200000
);
console.log("getAmountOut amtTriPoolUsdc", amtTriPoolUsdc);
