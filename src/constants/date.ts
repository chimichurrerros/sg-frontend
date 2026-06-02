const toDate = (value: string | Date | null | undefined): Date | null => {
    if (!value) return null;

    let date: Date;

    if (value instanceof Date) {
        date = value;
    } else {
        const normalized = /^\d{4}-\d{2}-\d{2}$/.test(value)
            ? value + "T12:00:00"
            : value;
        date = new Date(normalized);
    }

    return Number.isNaN(date.getTime()) ? null : date;
};

export const parseDate = (value: string | Date | null | undefined): string => {
    const date = toDate(value);
    if (!date) return "";

    return date.toLocaleDateString("es-PY", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
};

export const formatDateLong = (value: string | Date | null | undefined): string => {
    const date = toDate(value);
    if (!date) return "";

    return date.toLocaleDateString("es-PY", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
};
