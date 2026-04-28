import type { Bill } from "./types";

export interface ProductSaleDTO {
  id: number;
  name: string | null
  description?: string;
  price: number;
  quantity: number;
  barcode: string;
  total: number;
}

// Products in the fast select list
export interface ProductSelect {
  id: number;
  name: string | null
  barcode?: string;
  price: number;
  minimumStock: number;
}
export interface SaleTotals{
    subtotal: number;
    iva: number;
    total: number;
    amount: number;
    change: number;
  };
export type PaymentMethod = "Efectivo" | "Tarjeta" | "Transferencia"
export type SaleCondition = "Contado" | "Credito";

export const paymentOptions: { label: string; value: PaymentMethod }[] = [
  { label: "Efectivo", value: "Efectivo" },
  { label: "Tarjeta", value: "Tarjeta" },
  { label: "Transferencia", value: "Transferencia" },
];

export interface CustomerDTO {
  name: string;
  ruc: string;
}
export interface SaleData{
    bill?: Bill;
    saleNumber?: number;
    date: string;
    cashierNumber?: number;
  };
export interface Sale {
  customer:CustomerDTO;
  sale: SaleData
  pay: {
    method: PaymentMethod;
    condition: SaleCondition;
  };

  products: Array<ProductSaleDTO>;

  totals: SaleTotals
}

export const saleConditionOptions = [
  { label: "Contado", value: "Contado" },
  { label: "Crédito", value: "Credito" },
];
