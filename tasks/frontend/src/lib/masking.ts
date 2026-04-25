export function maskPhoneNumber(phone?: string | null) {
  if (!phone) return "";
  const cleaned = phone.replace(/-/g, "");
  if (cleaned.length < 10) return "***-****-****";
  return cleaned.replace(/(\d{3})(\d{4})(\d{4})/, "$1-****-$3");
}

export function maskUnitNumber(unit?: string | null) {
  if (!unit) return "";
  // Simple masking: replace numbers with *
  return unit.replace(/\d/g, "*");
}
