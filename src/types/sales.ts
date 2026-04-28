import type { Bill } from "./types";

export interface ProductSaleDTO {
  id: number;
  code: string;
  description: string;
  unitPrice: number;
  quantity: number;
  total: number;
}
export interface ProductSelect {
  id: number;
  code: string;
  description: string;
  unitPrice: number;
  stock: number;
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
    ruc: string;
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
