export type CostItem = {
  label: string;
  amountKrw: bigint;
};

export type AcquisitionTaxInput = {
  basePriceKrw: bigint;
  taxRateBps: number;
};

export type EntryCostInput = {
  baseInvestmentKrw: bigint;
  acquisitionBasePriceKrw: bigint;
  acquisitionTaxRateBps: number;
  additionalCosts?: CostItem[];
};

export type EntryCostBreakdown = {
  baseInvestmentKrw: bigint;
  acquisitionTaxKrw: bigint;
  additionalCostKrw: bigint;
  totalRequiredCashKrw: bigint;
};

export type ReverseBudgetCheck = {
  availableCashKrw: bigint;
  requiredCashKrw: bigint;
  remainingCashKrw: bigint;
  isWithinBudget: boolean;
};

export type ErrorRateResult = {
  expectedKrw: bigint;
  actualKrw: bigint;
  absoluteErrorKrw: bigint;
  errorRateBps: number;
  isWithinTolerance: boolean;
};

function assertNonNegativeMoney(value: bigint, fieldName: string) {
  if (value < BigInt(0)) {
    throw new RangeError(`${fieldName} must be greater than or equal to 0`);
  }
}

function assertNonNegativeRate(rateBps: number, fieldName: string) {
  if (!Number.isInteger(rateBps) || rateBps < 0) {
    throw new RangeError(`${fieldName} must be a non-negative integer basis-point rate`);
  }
}

function absoluteBigInt(value: bigint): bigint {
  return value < BigInt(0) ? -value : value;
}

export function calculateAcquisitionTax({ basePriceKrw, taxRateBps }: AcquisitionTaxInput): bigint {
  assertNonNegativeMoney(basePriceKrw, "basePriceKrw");
  assertNonNegativeRate(taxRateBps, "taxRateBps");

  // 취득세율은 정책 변경 가능성이 크므로 bps 입력값으로만 계산합니다.
  return (basePriceKrw * BigInt(taxRateBps)) / BigInt(10_000);
}

export function sumCostItems(items: CostItem[] = []): bigint {
  return items.reduce((total, item) => {
    assertNonNegativeMoney(item.amountKrw, `cost item ${item.label}`);

    return total + item.amountKrw;
  }, BigInt(0));
}

export function calculateEntryCost(input: EntryCostInput): EntryCostBreakdown {
  assertNonNegativeMoney(input.baseInvestmentKrw, "baseInvestmentKrw");
  assertNonNegativeMoney(input.acquisitionBasePriceKrw, "acquisitionBasePriceKrw");

  const acquisitionTaxKrw = calculateAcquisitionTax({
    basePriceKrw: input.acquisitionBasePriceKrw,
    taxRateBps: input.acquisitionTaxRateBps,
  });
  const additionalCostKrw = sumCostItems(input.additionalCosts);

  return {
    baseInvestmentKrw: input.baseInvestmentKrw,
    acquisitionTaxKrw,
    additionalCostKrw,
    totalRequiredCashKrw: input.baseInvestmentKrw + acquisitionTaxKrw + additionalCostKrw,
  };
}

export function checkReverseBudget(availableCashKrw: bigint, requiredCashKrw: bigint): ReverseBudgetCheck {
  assertNonNegativeMoney(availableCashKrw, "availableCashKrw");
  assertNonNegativeMoney(requiredCashKrw, "requiredCashKrw");

  const remainingCashKrw = availableCashKrw - requiredCashKrw;

  return {
    availableCashKrw,
    requiredCashKrw,
    remainingCashKrw,
    isWithinBudget: remainingCashKrw >= BigInt(0),
  };
}

export function calculateErrorRate(
  expectedKrw: bigint,
  actualKrw: bigint,
  toleranceBps = 500,
): ErrorRateResult {
  assertNonNegativeMoney(expectedKrw, "expectedKrw");
  assertNonNegativeMoney(actualKrw, "actualKrw");
  assertNonNegativeRate(toleranceBps, "toleranceBps");

  if (actualKrw === BigInt(0)) {
    throw new RangeError("actualKrw must be greater than 0 to calculate an error rate");
  }

  const absoluteErrorKrw = absoluteBigInt(expectedKrw - actualKrw);
  const errorRateBps = Number((absoluteErrorKrw * BigInt(10_000)) / actualKrw);

  return {
    expectedKrw,
    actualKrw,
    absoluteErrorKrw,
    errorRateBps,
    isWithinTolerance: errorRateBps <= toleranceBps,
  };
}
