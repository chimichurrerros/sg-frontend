export interface Bill {
  id: number;
  billType: number;
  billState: number;
  customerId: number;
  salesOrderId?: number;
  purchaseOrderId?: number;
  purchaseOrderForSupplierId?: number;
  stamp?: string;
  number: string;
  date: string;
  dueDate?: string;
  paymentTerms?: string;
  total: number;
  taxTotal: number;
  isCredit: boolean;
}

export const BillTypeEnum = {
  CONTADO: 1,
  CREDITO: 2,
} as const;

export const billTypeEnumParse: Record<number,string>={
  1 : "CONTADO",
  2 : "CREDITO"
}

export type BillTypeEnum = (typeof BillTypeEnum)[keyof typeof BillTypeEnum];

export const BillStateEnum = {
  Pending: 0,
  Paid: 1,
  Voided: 2,
} as const;
export const billStatusEnumParse: Record<number,string>={
  0 : "PENDIENTE",
  1 : "PAGADO",
  2 : "ANULADO"
}
export type BillStateEnum = (typeof BillStateEnum)[keyof typeof BillStateEnum];
