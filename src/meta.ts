import { getAmountOut } from "./curve/meta_stable";

// https://optimistic.etherscan.io/address/0xB90B9B1F91a01Ea22A182CD84C1E22222e39B415
// sUSD / 3crv
// 10379311861475671007197154
// 8084300023269454218086167

function unitToEth(num) {
  return num * 1e18;
}
const amt = getAmountOut(
  unitToEth(100),
  10379311861475671007197154,
  8084300023269454218086167
);
console.log("getAmountOut", amt);
