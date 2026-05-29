import type { CustomerDTO,  Sale,  SaleData, SaleTotals } from "@/types/sales";
import { apiClient } from "./client";
import type { PaginationParams, PaginationType } from "@/types/types";

export interface SendProductDTO{
    productId:number
    barcode:string
    quantity:number
}
export interface NewSaleRequest {
    customer: CustomerDTO;
    sale:     SaleData;
    pay:      {method: number,condition:number};
    products: SendProductDTO[];
    totals:   SaleTotals;
}
export interface SaleOrderDetail {
    id:                 number;
    productId:          number;
    barcode:            string;
    productDescription: string;
    productName:        string;
    quantityOrdered:    number;
    quantityInvoiced:   number;
    price:              number;
    taxRate:            number;
}

export interface FullSaleOrder {
    id:              number;
    customerId:      number;
    customerName:    string;
    customerRuc:     string;
    branchId:        number;
    userId:          number;
    userName:        string;
    number:          string;
    date:            Date;
    importValue:     number;
    total:           number;
    salesOrderState: number;
    saleCondition:   number;
    paymentMethod:   number;
    details:         SaleOrderDetail[];
    bills:           Bill[];
}

// export interface Bill {
//   id: number;
//   billType: number;
//   billState: number;
//   customerId: number;
//   salesOrderId?: number;
//   purchaseOrderId?: number;
//   stamp?: string;
//   number: string;
//   date: string;
//   dueDate?: string;
//   paymentTerms?: string;
//   total: number;
//   taxTotal: number;
//   isCredit: boolean;
// }
export interface Bill {
    id:              number;
    billType:        number;
    billState:       number;
    customerId:      number;
    salesOrderId:    number;
    purchaseOrderId: number;
    stamp:           string;
    number:          string;
    date:            string;
    dueDate:         string;
    paymentTerms:    string;
    total:           number;
    taxTotal:        number;
    isCredit:        boolean;
}
export const SalesOrderStateEnum:Record<number, string> = {
    0 : "Pendiente",
    1 : "Confirmada",
    2 : "Cancelada"
}
export const salesApi ={
    createSale:(body: NewSaleRequest) => apiClient.post<Sale>("/api/sales-orders/pos",body).then(r=>r.data),
    getSales: (params:PaginationParams) => apiClient.get<{ salesOrders: FullSaleOrder[], pagination: PaginationType }>("/api/sales-orders", {params}).then(r=>r.data),
    getSaleById: (id:number) => apiClient.get<{ salesOrder: FullSaleOrder }>(`/api/sales-orders/${id}`).then(r=>r.data.salesOrder),
    getAll: () => apiClient.get<{ sales: Sale[] }>("/api/sales-orders/all").then(r=>r.data)
}
