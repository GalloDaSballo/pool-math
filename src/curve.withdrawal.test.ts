import { calc_token_amount, calc_withdraw_one_coin } from "./curve/omni_pool";
import { makeAmountOutFunction } from "./make";

// 15 bps of inaccuracy
const PRECISION = 0.15;
// 2.3 % Inaccurate
const THREE_POOL_PRECISIONS = 2.3;
/**
 *  
  SEE Curve-SingleTokenWithdraw

  NOTE: Technically not exactly correct as we are not using rates here

  uint256 WSTETH_IN = 4540302536030246428213;
  uint8 WSTETH_DECIMALS = 18;

  uint256 WETH_IN = 5110270280714989617844;
  uint8 WETH_DECIMALS = 18;
 */

// // TODO: Calc Withdraw One Coin
describe("Omni Pool Calc Token Amount Withdrawal", () => {
  describe("Curve 2 Pool", () => {
    const STABLE_FEES = 4000000;
    const A = 5000;
    const totalSupply = 9650569439382636853079;

    const getAmountOut = (amtIn, i) => {
      return calc_withdraw_one_coin(
        amtIn,
        i,
        A,
        [1e18, 1e18],
        [4540302536030246428213, 5110270280714989617844],
        totalSupply,
        STABLE_FEES
      );
    };

    /**
     * 
      From LP to 0
      amountIn 96505694393826368530
      amountOut 96483960262950243950

      amountIn 193011388787652737061
      amountOut 192967690952906704288

      amountIn 128674259191768491374
      amountOut 128645229783171744729

      amountIn 113536111051560433565
      amountOut 113510517912803266948

      amountIn 101584941467185651085
      amountOut 101562057154335624551
     */

    it("LP -> 0 A", () => {
      const result = getAmountOut(96505694393826368530, 0);
      const expected = 96483960262950243950;
      const ratio = (result / expected) * 100;

      const absDelta = Math.abs(100 - ratio);
      expect(absDelta).toBeLessThan(PRECISION);
    });
    it("LP -> 0 B", () => {
      const result = getAmountOut(193011388787652737061, 0);
      const expected = 192967690952906704288;
      const ratio = (result / expected) * 100;
      const absDelta = Math.abs(100 - ratio);
      expect(absDelta).toBeLessThan(PRECISION);
    });
    it("LP -> 0 C", () => {
      const result = getAmountOut(128674259191768491374, 0);
      const expected = 128645229783171744729;
      const ratio = (result / expected) * 100;

      const absDelta = Math.abs(100 - ratio);
      expect(absDelta).toBeLessThan(PRECISION);
    });
    it("LP -> 0 D", () => {
      const result = getAmountOut(113536111051560433565, 0);
      const expected = 113510517912803266948;
      const ratio = (result / expected) * 100;

      const absDelta = Math.abs(100 - ratio);
      expect(absDelta).toBeLessThan(PRECISION);
    });
    it("LP -> 0 E", () => {
      const result = getAmountOut(101584941467185651085, 0);
      const expected = 101562057154335624551;
      const ratio = (result / expected) * 100;

      const absDelta = Math.abs(100 - ratio);
      expect(absDelta).toBeLessThan(PRECISION);
    });

    /**
     *   
      From LP to 1
      amountIn 96505694393826368530
      amountOut 96488558580817580174

      amountIn 193011388787652737061
      amountOut 192976938543951493898

      amountIn 128674259191768491374
      amountOut 128651371966750963107

      amountIn 113536111051560433565
      amountOut 113515932855611736572

      amountIn 101584941467185651085
      amountOut 101566898859915508486
     */
    it("LP -> 1 A", () => {
      const result = getAmountOut(96505694393826368530, 1);
      const expected = 96488558580817580174;
      const ratio = (result / expected) * 100;

      const absDelta = Math.abs(100 - ratio);
      expect(absDelta).toBeLessThan(PRECISION);
    });
    it("LP -> 1 B", () => {
      const result = getAmountOut(193011388787652737061, 1);
      const expected = 192976938543951493898;
      const ratio = (result / expected) * 100;

      const absDelta = Math.abs(100 - ratio);
      expect(absDelta).toBeLessThan(PRECISION);
    });
    it("LP -> 1 C", () => {
      const result = getAmountOut(128674259191768491374, 1);
      const expected = 128651371966750963107;
      const ratio = (result / expected) * 100;

      const absDelta = Math.abs(100 - ratio);
      expect(absDelta).toBeLessThan(PRECISION);
    });
    it("LP -> 1 D", () => {
      const result = getAmountOut(113536111051560433565, 1);
      const expected = 113515932855611736572;
      const ratio = (result / expected) * 100;

      const absDelta = Math.abs(100 - ratio);
      expect(absDelta).toBeLessThan(PRECISION);
    });
    it("LP -> 1 E", () => {
      const result = getAmountOut(101584941467185651085, 1);
      const expected = 101566898859915508486;
      const ratio = (result / expected) * 100;

      const absDelta = Math.abs(100 - ratio);
      expect(absDelta).toBeLessThan(PRECISION);
    });
  });
});

describe("Omni Pool Calc Token Amount Withdrawal", () => {
  describe("Curve 3 Pool", () => {
    const STABLE_FEES = 4000000;
    const A = 2000;
    const totalSupply = 9763501909135846099651064;

    // uint256 DAI_IN = 5105490430369593570566334;
    // uint8 DAI_DECIMALS = 18;

    // uint256 USDC_IN = 2899439195495;
    // uint8 USDC_DECIMALS = 6;

    // uint256 USDT_IN = 1759099131964;
    // uint8 USDT_DECIMALS = 6;
    // ADJUSTED_DAI 5105490430369

    const getAmountOut = (amtIn, i) => {
      return calc_withdraw_one_coin(
        amtIn,
        i,
        A,
        [1e30, 1e30, 1e30],
        [5105490430369, 2899439195495, 1759099131964],
        totalSupply,
        STABLE_FEES
      );
    };

    /**
    Logs:
      Creating 3 Pool
      ADJUSTED_DAI 5105490430369

      lpTokenSupply 9763501909135846099651064

      From LP to 0
      amountIn 97635019091358460996510
      amountOut 97649290071

      amountIn 195270038182716921993021
      amountOut 195297717827

      amountIn 130180025455144614662014
      amountOut 130198861721

      amountIn 114864728342774659995894
      amountOut 114881428169

      amountIn 102773704306693116838432
      amountOut 102788702489
     */

    it("LP -> 0 A", () => {
      const result = getAmountOut(97635019091358460996510, 0);
      const expected = 97649290071;
      const ratio = (result / expected) * 100;

      const absDelta = Math.abs(100 - ratio);
      expect(absDelta).toBeLessThan(THREE_POOL_PRECISIONS);
    });
    it("LP -> 0 B", () => {
      const result = getAmountOut(195270038182716921993021, 0);
      const expected = 195297717827;
      const ratio = (result / expected) * 100;

      const absDelta = Math.abs(100 - ratio);
      expect(absDelta).toBeLessThan(THREE_POOL_PRECISIONS);
    });
    it("LP -> 0 C", () => {
      const result = getAmountOut(130180025455144614662014, 0);
      const expected = 130198861721;
      const ratio = (result / expected) * 100;

      const absDelta = Math.abs(100 - ratio);
      expect(absDelta).toBeLessThan(THREE_POOL_PRECISIONS);
    });
    it("LP -> 0 D", () => {
      const result = getAmountOut(114864728342774659995894, 0);
      const expected = 114881428169;
      const ratio = (result / expected) * 100;

      const absDelta = Math.abs(100 - ratio);
      expect(absDelta).toBeLessThan(THREE_POOL_PRECISIONS);
    });
    it("LP -> 0 E", () => {
      const result = getAmountOut(102773704306693116838432, 0);
      const expected = 102788702489;
      const ratio = (result / expected) * 100;

      const absDelta = Math.abs(100 - ratio);
      expect(absDelta).toBeLessThan(THREE_POOL_PRECISIONS);
    });

    /**
      From LP to 1
      amountIn 97635019091358460996510
      amountOut 97610931869

      amountIn 195270038182716921993021
      amountOut 195220072057

      amountIn 130180025455144614662014
      amountOut 130147517718

      amountIn 114864728342774659995894
      amountOut 114836208297

      amountIn 102773704306693116838432
      amountOut 102748300882
     */

    it("LP -> 1 A", () => {
      const result = getAmountOut(97635019091358460996510, 0);
      const expected = 97610931869;
      const ratio = (result / expected) * 100;

      const absDelta = Math.abs(100 - ratio);
      expect(absDelta).toBeLessThan(THREE_POOL_PRECISIONS);
    });
    it("LP -> 2 B", () => {
      const result = getAmountOut(195270038182716921993021, 0);
      const expected = 195220072057;
      const ratio = (result / expected) * 100;

      const absDelta = Math.abs(100 - ratio);
      expect(absDelta).toBeLessThan(THREE_POOL_PRECISIONS);
    });
    it("LP -> 3 C", () => {
      const result = getAmountOut(130180025455144614662014, 0);
      const expected = 130147517718;
      const ratio = (result / expected) * 100;

      const absDelta = Math.abs(100 - ratio);
      expect(absDelta).toBeLessThan(THREE_POOL_PRECISIONS);
    });
    it("LP -> 4 D", () => {
      const result = getAmountOut(114864728342774659995894, 0);
      const expected = 114836208297;
      const ratio = (result / expected) * 100;

      const absDelta = Math.abs(100 - ratio);
      expect(absDelta).toBeLessThan(THREE_POOL_PRECISIONS);
    });
    it("LP -> 5 E", () => {
      const result = getAmountOut(102773704306693116838432, 0);
      const expected = 102748300882;
      const ratio = (result / expected) * 100;

      const absDelta = Math.abs(100 - ratio);
      expect(absDelta).toBeLessThan(THREE_POOL_PRECISIONS);
    });
  });
});
