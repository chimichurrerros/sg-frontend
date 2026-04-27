import type { Bill } from "./types";

export interface ProductSaleDTO {
  id: string;
  code: string;
  description: string;
  unitPrice: number;
  quantitu: number;
  total: number;
}

export interface RUC {
  number: string;
  dv: string;
}

export type PaymentMethod = "Efectivo" | "Tarjeta" | "Transferencia"
export type SaleCondition = "Contado" | "Credito";

export const paymentOptions: { label: string; value: PaymentMethod }[] = [
  { label: "Efectivo", value: "Efectivo" },
  { label: "Tarjeta", value: "Tarjeta" },
  { label: "Transferencia", value: "Transferencia" },
];


export interface Sale {
  customer: {
    name: string;
    ruc: RUC;
  };
  sale: {
    bill?: Bill;
    saleNumber?: number;
    date: string;
    cashierNumber?: number;
  };
  pay: {
    method: PaymentMethod;
    condition: SaleCondition;
  };

  products: Array<ProductSaleDTO>;

  totals: {
    subtotal: number;
    iva: number;
    total: number;
    amount: number;
    change: number;
  };
}




export const saleConditionOptions = [
  { label: "Contado", value: "Contado" },
  { label: "Crédito", value: "Credito" },
];
