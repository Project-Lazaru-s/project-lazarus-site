const dateFormat = new Intl.DateTimeFormat("pt-BR", { dateStyle: "long", timeZone: "UTC" });

export function formatDate(iso: string) {
  return dateFormat.format(new Date(iso));
}

const mbFormat = new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

export function formatBytes(bytes: number) {
  return `${mbFormat.format(bytes / 1_000_000)} MB`;
}

export function signed(value: number) {
  return value > 0 ? `+${value}` : `${value}`;
}
