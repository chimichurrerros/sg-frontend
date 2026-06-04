export function parsePrice(amount: number | string): string {
    amount = Number(amount)
    return new Intl.NumberFormat("es-PY", {
        style: "currency",
        currency: "PYG",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

export function formatDecimal(amount: number | string): string {
    const num = Number(amount);
    if (isNaN(num)) return "";
    return new Intl.NumberFormat("es-PY", {
        style: "decimal",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(num);
}