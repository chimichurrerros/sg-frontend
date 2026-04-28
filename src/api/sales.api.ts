import type { CustomerDTO,  SaleData, SaleTotals } from "@/types/sales";
import { apiClient } from "./client";

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


export const salesApi ={
    createSale:(body: NewSaleRequest) => apiClient.post("/api/sales-orders/pos",body).then(r=>r.data)
    // TODO 
}
