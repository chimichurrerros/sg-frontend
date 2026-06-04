import axios from "axios";

type ApiErrorBody = {
  message?: string;
  title?: string;
  detail?: string;
  errors?: Record<string, string[] | string | undefined>;
  validationErrors?: Record<string, string[] | string | undefined>;
  [key: string]: unknown;
};

const toMessageList = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item)).filter(Boolean);
  }

  if (typeof value === "string") {
    return value ? [value] : [];
  }

  return [];
};

export const parseApiError = (error: unknown) => {
  if (!axios.isAxiosError(error)) {
    return {
      status: undefined as number | undefined,
      message: error instanceof Error ? error.message : "Error desconocido",
      fieldErrors: {} as Record<string, string>,
    };
  }

  const responseData = error.response?.data as ApiErrorBody | string | undefined;
  const fieldErrors: Record<string, string> = {};

  if (responseData && typeof responseData === "object") {
    const serverFieldErrors = responseData.errors ?? responseData.validationErrors;
    if (serverFieldErrors && typeof serverFieldErrors === "object") {
      Object.entries(serverFieldErrors).forEach(([field, value]) => {
        const messages = toMessageList(value);
        if (messages.length > 0) {
          fieldErrors[field] = messages.join(" ");
        }
      });
    }
  }

  const message =
    (responseData && typeof responseData === "object"
      ? responseData.message || responseData.title || responseData.detail
      : undefined) ||
    (typeof responseData === "string" ? responseData : undefined) ||
    error.message ||
    "Error desconocido";

  return {
    status: error.response?.status,
    message,
    fieldErrors,
  };
};