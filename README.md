# Pool Math

Use `makeAmountOutGivenReservesFunction` and `makeAmountOutFunction` to make functions for you

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
) {
```

Implementations are manuallly rewritten (with exception of Balancer which already had an implementation)


## Credits

### Original Math and Code
Balancer + George Roman
https://github.com/georgeroman/balancer-v2-pools/blob/main/src/pools/stable/math.ts

Curve
The Curve team

Velo
Velodrome

### Grind to code this

Alex The Entreprenerd 