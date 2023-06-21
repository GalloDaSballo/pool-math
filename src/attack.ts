/** NOTE: Collection of funtions around oracle drift */
/**
 * Untested, although fairly straightforward
 */
const MAX_BPS = 10_000;

export function applyDrift(
  price: number,
  driftBPS: number,
  isUp: boolean
): number {
  let newPrice = price;
  if (isUp) {
    newPrice = (price * (MAX_BPS + driftBPS - 1 / 1e18)) / MAX_BPS;
  } else {
    newPrice = (price * (MAX_BPS - driftBPS + 1 / 1e18)) / MAX_BPS;
  }

  return newPrice;
}

// TODO: Figure out if tokenOutPrice can impact in some way
// I think it should
// Like we should get X borrow power
// But then the drift should be proportional to the Feed and the Drift
// Perhaps best to look at Borrow Power
// And at Borrowable asset?
function isDriftAttackFeasible(
  tokenInPrice,
  tokenInDrift, // as bps
  tokenOutPrice, // NOTE: Turns out it's unused
  tokenOutDrift, // as bps
  tokenInLTV, // as bps
  tokenOutBorrowFactor // as float
) {
  // Oracle Drift in
  // Oracle Drift out
  // LTV
  // Borrow Factor
  // Collateral Price goes down via negative drift (It's cheaper than what the protocol things)
  // Debt Price goes up via positive drift (it's more valuable than what we pay for it)
  // Drift are %, but because prices are relative to each other, the impact is different
  // So you don't just need to check the drift as % but the absolute values
  // or technically the weighted %

  // Fair value borrowable
  // Actual borrowable
  const valueOfCollateral = tokenInPrice;
  console.log("valueOfCollateral", valueOfCollateral);

  const valueOfBorrowable =
    (valueOfCollateral * tokenInLTV) / MAX_BPS / tokenOutBorrowFactor;
  // const borrowableAmount = valueOfBorrowable / tokenOutPrice;
  console.log("valueOfBorrowable", valueOfBorrowable);

  // TODO: Consider case in which price of asset is higher (but statistically in same Drift range)
  const driftedBorrowableValue = applyDrift(
    valueOfBorrowable,
    tokenOutDrift,
    true
  );
  console.log("driftedBorrowableValue", driftedBorrowableValue);

  if (driftedBorrowableValue > valueOfCollateral) {
    return true;
  }

  const driftedValueOfCollateral = applyDrift(tokenInPrice, tokenInDrift, true);
  console.log("driftedValueOfCollateral", driftedValueOfCollateral);

  const optimisticValueOfBorrowable =
    (driftedValueOfCollateral * tokenInLTV) / MAX_BPS / tokenOutBorrowFactor;
  console.log("optimisticValueOfBorrowable", optimisticValueOfBorrowable);

  const driftedOptimisticBorrowableValue = applyDrift(
    optimisticValueOfBorrowable,
    tokenOutDrift,
    true
  );

  console.log(
    "driftedOptimisticBorrowableValue",
    driftedOptimisticBorrowableValue
  );

  if (driftedOptimisticBorrowableValue > tokenInPrice) {
    return true;
  }

  // For drift attack to be feasible
  // Fair value of Coll < Fair Vault of Borrowed
  // Meaning the protocol is already in bad debt as they are offering more borrowable than intended
  // And borrow value must be greater than the collateral value

  // Actual value
  return false;
}

// True
console.log(
  "First Attack",
  isDriftAttackFeasible(1800, 100, 1800, 100, 9990, 1)
);

console.log(
  "First Drift",
  driftNecessaryForAttack(1800, 100, 1800, 100, 9990, 1)
);

// EXPECT False
console.log(isDriftAttackFeasible(1800, 100, 1800, 100, 9000, 1.01));

console.log(
  "Second Drift",
  driftNecessaryForAttack(1800, 100, 1800, 100, 9000, 1.01)
);

const tvlForAttack = tvlNecessaryForAttack(1800, 100, 1800, 100, 9000, 1.01);
console.log("tvlNecessaryForAttack", tvlForAttack);
console.log(
  "Proof",
  isDriftAttackFeasible(1800, 100, 1800, 100, tvlForAttack, 1.01)
);
console.log(
  "Proof Optimality",
  !isDriftAttackFeasible(1800, 100, 1800, 100, tvlForAttack - 1, 1.01)
);

// Given price in
// LTV
// Borrow Factor
// Get me the drift I'd need for this to ever be profitable
// NOTE: Set drift at 0 to find the minimum BPS values that would work
function driftNecessaryForAttack(
  tokenInPrice,
  tokenInDrift,
  tokenOutPrice,
  tokenOutDrift,
  tokenInLTV,
  tokenOutBorrowFactor
): { tokenInDrift: number; tokenOutDrift: number } {
  // Given current drifts
  // Increase them by multiplying them
  // See what happens

  let tempTokenInDrift = tokenInDrift;
  let tempTokenOutDrift = tokenOutDrift;
  while (
    !isDriftAttackFeasible(
      tokenInPrice,
      tempTokenInDrift,
      tokenOutPrice,
      tempTokenOutDrift,
      tokenInLTV,
      tokenOutBorrowFactor
    )
  ) {
    tempTokenInDrift += 1;
    tempTokenOutDrift += 1;
  }

  return {
    tokenInDrift: tempTokenInDrift,
    tokenOutDrift: tempTokenOutDrift,
  };
}
/**
 * If you pass maxBorrowable, uses that, else it returns the profit ratio
 * @param borrowTokenValue
 * @param collateralValue
 * @param maxBorrowable
 * @returns
 */
function computeDriftProfit(
  borrowTokenValue,
  collateralValue,
  maxBorrowable = 1
) {
  /**
   * Identical as above, but use the % difference to compute profit
   */
  const profitRatio = collateralValue / borrowTokenValue;
  if (profitRatio < 1) {
    return 0; // Loss
  }

  return profitRatio * maxBorrowable;
}

// Given max drift possible
// And available drift
// Show the profit of it
function tvlNecessaryForAttack(
  tokenInPrice,
  tokenInDrift,
  tokenOutPrice,
  tokenOutDrift,
  tokenInLTV,
  tokenOutBorrowFactor
) {
  let tempTokenInLTV = tokenInLTV;
  while (
    !isDriftAttackFeasible(
      tokenInPrice,
      tokenInDrift,
      tokenOutPrice,
      tokenOutDrift,
      tempTokenInLTV,
      tokenOutBorrowFactor
    )
  ) {
    tempTokenInLTV += 1;
  }

  return tempTokenInLTV;
}
