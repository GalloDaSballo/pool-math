# Pool Math

## NOTE
To publish bump the version then copy paste README and package.json
There's probably a better way

## Usage

### Use the `amountOut` functions
Use `makeAmountOutGivenReservesFunction` and `makeAmountOutFunction` to make functions for you

### Get the price for a swap
Given an amount in, use `getPrice(amountIn, getAmountOut(amountIn))` to get a quote
You have to decide the amountIn as a price is not easy to define
I'd recommend 10 ** decimals

### Optimizer

The optimizer file contains ways to compute:
- Max amount in before the price changes too much, see: `maxInBeforePriceLimit`
- Multiplier by which to multiply the reserves to allow the swap you want, see: `getPoolReserveMultiplierToAllowPriceImpactBelow`
- The time it would take to profitably sell into a pool given the liquidity and the amount, see: `getPoolDiscreteRepetitionsUntilFullLiquidatedAmount`



## Contributing

All functions have this signature 
```ts
export function getAmountOut(
  // Self describing params
  amountIn: number,
  reserveIn: number,
  reserveOut: number,

  stable: boolean, // Is it for stableswap invariant? MUST be true for Bal and Curve

  // EXTRA PARAMS, all extra always have defaults
  amplificationParameter: number = DEFAUT_A,
  swapFeePercentage: number = DEFAUT_FEE,
  tokenInDecimals: number = DEFAULT_TOKEN_DECIMALS
  customRates: number[] = [1e18, 1e18] // Rates, Bal multiplies all values by it, curve uses it in it's logic
) {
```

Implementations are manuallly rewritten (with exception of Balancer which already had an implementation)



## Credits

### Original Math and Code
Balancer + George Roman
https://github.com/georgeroman/balancer-v2-pools/blob/main/src/pools/stable/math.ts

Curve
The Curve team

Velo
Velodrome

### Grind to code this

Alex The Entreprenerd 


## TODO
OPTIMIZER
// TODO: Test for Max Amount In

// TODO: Test for Pool Time for Recovery

// TODO: Test for Liquidity Math


CURVE
// TODO: Metastable Pool

ALL POOLS
// Cost of LPing In

// Cost of LPing Out