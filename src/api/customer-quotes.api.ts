import type { PaginationParams, PaginationType } from "@/types/types";
import { apiClient } from "./client";
import type { Customer } from "./customers.api";
import type { FullSaleOrder } from "./sales.api";

export const customerQuotesStatus: Record<number, string> = {
    0 : "Abierto",
    1 : "Expirado",
    2 : "Aprobado",
    3 : "Rechazado"
}
export interface CustomerQuotesParams extends PaginationParams {
    date?: string;
    expirationDate?: string;
    customerName?: string;
    customerId?: number;
    id?: number;
    number?: string;
}

export interface CustomerQuote {
    id:                     number;
    customerId:             number;
    customerName:           string;
    customerRuc:            string;
    userId:                 number;
    userName:               string;
    date:                   string;
    expirationDate:         string;
    total:                  number;
    importValue:            number;
    branchId:               number;
    number:                 string;
    paymentMethod:          number;
    saleCondition:          number;
    billType:               number;
    status:                 number;
    details:                CustomerQuoteDetail[];
    associatedSalesOrderId: number;
}

export interface CustomerQuoteDetail {
    id:          number;
    productId:   number;
    productName: string;
    description: string;
    quantity:    number;
    price:       number;
}

export interface CreateCustomerQuoteRequest {
    customer: Partial<Customer>;
    sale:     CustomerQuoteData;
    pay:      Pay;
    products: CustomerQuoteProductDTO[];
    totals:   Totals;
}

export interface Pay {
    method:    number;
    condition: number;
}

export interface CustomerQuoteProductDTO {
    productId: number;
    productName: string;
    barcode:   string;
    description: string;
    quantity:  number;
    price:     number;
}

export interface CustomerQuoteData {
    bill:          number;
    date:          Date;
    branchId:      number;
    accountId:     number;
    movementType:  number;
}

export interface Totals {
    subtotal?:    number;
    iva:         number;
    total:       number;
    amount:      number;
    change:      number;
    importValue: number;
}


export const customerQuotesApi ={
    get: (params: CustomerQuotesParams) => apiClient.get<{ customerQuotes: CustomerQuote[], pagination: PaginationType} >("api/customerquotes", { params }).then(response => response.data),
    getById: (id: number) => apiClient.get<{ customerQuote: CustomerQuote }>(`api/customerquotes/${id}`).then(response => response.data.customerQuote),
    create: (data: CreateCustomerQuoteRequest) => apiClient.post("api/customerquotes", data).then(response => response.data),
    update: (id: number, data: Partial<CreateCustomerQuoteRequest>) => apiClient.put(`api/customerquotes/${id}`, data).then(response => response.data),
    sell: (id: number) => apiClient.post<{ salesOrder: FullSaleOrder}>(`api/customerquotes/${id}/sell`).then(response => response.data.salesOrder),
    reject: (id: number) => apiClient.post(`api/customerquotes/${id}/cancel`).then(response => response.data),
}