export const translatePayrollStatus = (statusName?: string | null): string => {
  const text = (statusName ?? "").toLowerCase();
  if (text.includes("open")) return "Abierto";
  if (text.includes("closed")) return "Cerrado";
  if (text.includes("paid")) return "Pagado";
  return text || "Sin estado";
};

export const formatStatusColor = (statusName?: string | null): string => {
  const text = (statusName ?? "").toLowerCase();
  if (text.includes("open")) return "green";
  if (text.includes("closed")) return "orange";
  if (text.includes("paid")) return "purple";
  return "gray";
};

export const ProcessTypeId = {
  Monthly: 1,
  Bonus: 2,
  Settlement: 3,
} as const;

export const processTypeNameMap: Record<number, string> = {
  [ProcessTypeId.Monthly]: "Mensual",
  [ProcessTypeId.Bonus]: "Aguinaldo",
  [ProcessTypeId.Settlement]: "Liquidación",
};

export const PayrollStatusId = {
  Open: 1,
  Closed: 2,
  Paid: 3,
} as const;

export const monthNameMap: Record<number, string> = {
  1: "Enero", 2: "Febrero", 3: "Marzo", 4: "Abril",
  5: "Mayo", 6: "Junio", 7: "Julio", 8: "Agosto",
  9: "Setiembre", 10: "Octubre", 11: "Noviembre", 12: "Diciembre",
};
