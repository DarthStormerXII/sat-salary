export function formatUsd(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: value > 1000 ? 0 : 2,
  }).format(value);
}

export function formatMusd(value: number): string {
  return `${new Intl.NumberFormat("en-US", {
    maximumFractionDigits: value > 1000 ? 0 : 2,
  }).format(value)} MUSD`;
}
