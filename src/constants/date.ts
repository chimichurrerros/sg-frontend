export const parseDate = (value: string | Date | null | undefined): string => {
    if (!value) return "";

    let date: Date;

    if (value instanceof Date) {
        date = value;
    } else {
        const normalized = /^\d{4}-\d{2}-\d{2}$/.test(value)
            ? value + "T12:00:00"
            : value;
        date = new Date(normalized);
    }

    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleDateString("es-PY", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
};