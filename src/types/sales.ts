import type { Bill } from "@/api/sales.api";

export interface ProductSaleDTO {
  id: number;
  name: string | null
  description: string | null;
  price: number;
  quantity: number;
  barcode: string;
  total?: number ;
  stock: number
  taxRate:number
}

// Products in the fast select list
export interface ProductSelect {
  id: number;
  name: string | null
  barcode?: string;
  price: number;
  quantity: number;
}
export interface SaleTotals{
    subtotal: number;
    iva: number;
    total: number;
    change: number;
    importValue: number;
  };
export type PaymentMethod = "Efectivo" | "Tarjeta" | "Transferencia"
export type SaleCondition = "Contado" | "Credito";

export const paymentOptions: { label: string; value: PaymentMethod }[] = [
  { label: "Efectivo", value: "Efectivo" },
  { label: "Tarjeta", value: "Tarjeta" },
  { label: "Transferencia", value: "Transferencia" },
];

export interface CustomerForSales {
  id: number;
  name: string;
  ruc: string;
}
export interface CustomerDTO {
  name: string;
  ruc: string;
}
export interface SaleData{
    bill?: Bill;
    saleNumber?: number;
    date: string;
    branchId?: number | null;
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
