export const phonePattern =
  "^\\+?1?[-.\\s]?\\(?[2-9]\\d{2}\\)?[-.\\s]?\\d{3}[-.\\s]?\\d{4}$";

export function formatPhoneInput(value: string) {
  const digits = value.replace(/\D/g, "").replace(/^1(?=\d{10})/, "").slice(0, 10);

  if (digits.length <= 3) {
    return digits;
  }

  if (digits.length <= 6) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  }

  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

export function isValidUsPhone(value: string) {
  return /^[2-9]\d{9}$/.test(value.replace(/\D/g, ""));
}
