export function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${mm}/${dd}/${date.getFullYear()}`;
}

export function formatMoney(amount) {
  const absolute = Math.abs(Number(amount) || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return (amount < 0 ? "-$" : "$") + absolute;
}

// Mirrors BigDecimal.stripTrailingZeros().toPlainString() for display.
export function plainNumber(value) {
  if (value === null || value === undefined || value === "") return "";
  return String(Number(value));
}

export function blankToNull(value) {
  const text = value == null ? "" : String(value).trim();
  return text === "" ? null : text;
}

// Strips characters that have meaning inside a PostgREST "or" filter.
export function safeSearch(value) {
  return value.trim().replace(/[,()*%\\"]/g, "");
}

export const VISUAL_ACUITIES = [20, 25, 30, 40, 50, 60, 70, 80].map((value) => `20/${value}`);

// XX.X: up to two whole digits and one decimal, not negative.
export function isPdValue(text) {
  return /^\d{1,2}(\.\d)?$/.test(text.trim());
}
