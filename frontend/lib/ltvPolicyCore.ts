export type LtvPolicyLike = {
  id: string;
  tierName: string;
  cashMinKrw: bigint;
  cashMaxKrw: bigint | null;
  ltvRatio: unknown | null;
  dsrNote: string | null;
  effectiveFrom: Date;
  effectiveTo: Date | null;
  isActive: boolean;
};

export type SelectedLtvPolicy = {
  id: string;
  tierName: string;
  cashMinKrw: bigint;
  cashMaxKrw: bigint | null;
  ltvRatio: number | null;
  dsrNote: string | null;
  effectiveFrom: Date;
  effectiveTo: Date | null;
};

function isPolicyEffective(policy: LtvPolicyLike, asOf: Date): boolean {
  const startsOnOrBefore = policy.effectiveFrom.getTime() <= asOf.getTime();
  const endsAfterOrOpen = policy.effectiveTo === null || policy.effectiveTo.getTime() >= asOf.getTime();

  return policy.isActive && startsOnOrBefore && endsAfterOrOpen;
}

function containsCash(policy: LtvPolicyLike, cashKrw: bigint): boolean {
  const aboveMin = policy.cashMinKrw <= cashKrw;
  // Adjacent cash bands share boundary values, so upper bounds are exclusive.
  const belowMax = policy.cashMaxKrw === null || cashKrw < policy.cashMaxKrw;

  return aboveMin && belowMax;
}

function decimalLikeToNumber(value: unknown | null): number | null {
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value === "number") {
    return value;
  }
  if (typeof value === "string") {
    return Number(value);
  }
  if (typeof value === "object" && "toNumber" in value && typeof value.toNumber === "function") {
    return value.toNumber();
  }
  if (typeof value === "object" && "toString" in value && typeof value.toString === "function") {
    return Number(value.toString());
  }

  return null;
}

export function toSelectedLtvPolicy(policy: LtvPolicyLike): SelectedLtvPolicy {
  return {
    id: policy.id,
    tierName: policy.tierName,
    cashMinKrw: policy.cashMinKrw,
    cashMaxKrw: policy.cashMaxKrw,
    ltvRatio: decimalLikeToNumber(policy.ltvRatio),
    dsrNote: policy.dsrNote,
    effectiveFrom: policy.effectiveFrom,
    effectiveTo: policy.effectiveTo,
  };
}

export function selectActiveLtvPolicy(
  policies: LtvPolicyLike[],
  cashKrw: bigint,
  asOf: Date = new Date(),
): SelectedLtvPolicy | null {
  if (cashKrw < BigInt(0)) {
    throw new RangeError("cashKrw must be greater than or equal to 0");
  }

  const matches = policies
    .filter((policy) => isPolicyEffective(policy, asOf) && containsCash(policy, cashKrw))
    .sort((left, right) => {
      if (right.cashMinKrw > left.cashMinKrw) {
        return 1;
      }
      if (right.cashMinKrw < left.cashMinKrw) {
        return -1;
      }

      return right.effectiveFrom.getTime() - left.effectiveFrom.getTime();
    });

  if (matches.length === 0) {
    return null;
  }

  return toSelectedLtvPolicy(matches[0]);
}
