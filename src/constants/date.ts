const toDate = (value: string | Date | null | undefined): Date | null => {
    if (!value) return null;

    let date: Date;

    if (value instanceof Date) {
        date = value;
    } else {
        // Normalize date-only values (YYYY-MM-DD or YYYY-MM-DDT00:00:00) to noon
        // to avoid timezone offset shifting the date by one day
        const normalized = /^\d{4}-\d{2}-\d{2}(T00:00:00(\.\d+)?)?$/.test(value)
            ? value.slice(0, 10) + "T12:00:00"
            : value;
        date = new Date(normalized);
    }

    return Number.isNaN(date.getTime()) ? null : date;
};

export const parseDateTime = (value: string | Date | null | undefined): string => {
    const date = toDate(value);
    if (!date) return "";

    return date.toLocaleDateString("es-PY", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
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
