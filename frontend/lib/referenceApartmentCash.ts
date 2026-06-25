export const REFERENCE_PRICE_LIMIT_15EOK_KRW = 1_500_000_000;
export const REFERENCE_PRICE_LIMIT_25EOK_KRW = 2_500_000_000;
export const REFERENCE_MAX_LOAN_UNDER_15EOK_KRW = 600_000_000;
export const REFERENCE_MAX_LOAN_UNDER_25EOK_KRW = 400_000_000;
export const REFERENCE_MAX_LOAN_OVER_25EOK_KRW = 200_000_000;

export function calculateReferenceAssumedLoanKrw(currentPriceKrw: number | null) {
  if (currentPriceKrw === null) {
    return null;
  }

  if (currentPriceKrw <= REFERENCE_PRICE_LIMIT_15EOK_KRW) {
    return REFERENCE_MAX_LOAN_UNDER_15EOK_KRW;
  }
  if (currentPriceKrw <= REFERENCE_PRICE_LIMIT_25EOK_KRW) {
    return REFERENCE_MAX_LOAN_UNDER_25EOK_KRW;
  }

  return REFERENCE_MAX_LOAN_OVER_25EOK_KRW;
}

export function calculateReferenceRequiredCashKrw(currentPriceKrw: number | null) {
  const assumedLoanKrw = calculateReferenceAssumedLoanKrw(currentPriceKrw);

  if (currentPriceKrw === null || assumedLoanKrw === null) {
    return null;
  }

  return Math.max(currentPriceKrw - assumedLoanKrw, 0);
}

export function calculateReferenceCashGapKrw(referenceRequiredCashKrw: number | null, zoneInvestmentMinKrw: number | null) {
  if (referenceRequiredCashKrw === null || zoneInvestmentMinKrw === null) {
    return null;
  }

  return referenceRequiredCashKrw - zoneInvestmentMinKrw;
}
