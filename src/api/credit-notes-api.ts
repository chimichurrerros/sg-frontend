import type { PaginationParams, PaginationType } from "@/types/types";
import { apiClient } from "./client";

export interface CreditNote {
    id:           number;
    billId:       number;
    billNumber:   string;
    type?:        number;
    customerId:   number;
    customerName: string;
    customerRuc:  string;
    date:         string;
    total:        number;
    reason:       string;
    details:      CreditNoteDetail[];
}

export interface CreditNoteDetail {
    id:          number;
    productId:   number;
    productName: string;
    quantity:    number;
    price:       number;
}

export interface GetCreditNoteParams extends PaginationParams { 
    customerName?:   string;
    customerRuc?:    string;
    billNumber?:     string;
    reason?:         string;
    date?:           string;
    minDate?:        string;
    maxDate?:        string;
    type?:           string;
} 

export interface CreateCreditNoteRequest {
    billId:  number;
    date:    string;
    total:   number;
    reason:  string;
    details: CreateCreditNoteRequestDetail[];
}

export interface CreateCreditNoteRequestDetail {
    productId: number;
    quantity:  number;
    price:     number;
}
export const creditNotesApi = {
    get: (params: GetCreditNoteParams) => {
        const queryParams: Record<string, string | number | undefined> = {};
        if (params.page !== undefined) queryParams.page = params.page;
        if (params.pageSize !== undefined) queryParams.pageSize = params.pageSize;
        if (params.customerName) queryParams.customerName = params.customerName;
        if (params.customerRuc) queryParams.customerRuc = params.customerRuc;
        if (params.billNumber) queryParams.billNumber = params.billNumber;
        if (params.reason) queryParams.reason = params.reason;
        if (params.date) queryParams.date = params.date;
        if (params.minDate) queryParams.minDate = params.minDate;
        if (params.maxDate) queryParams.maxDate = params.maxDate;
        if (params.type) queryParams.type = params.type;
        return apiClient.get<{creditNotes:CreditNote[],pagination: PaginationType}>("/api/credit-notes",{params: queryParams}).then(r=>r.data);
    },
    getById:(id:number)=>apiClient.get<{creditNote: CreditNote}>("/api/credit-notes/"+id).then(r=>r.data.creditNote),
    create:(body:CreateCreditNoteRequest)=>apiClient.post<{creditNote:CreditNote}>("/api/credit-notes",body).then(r=>r.data)
}