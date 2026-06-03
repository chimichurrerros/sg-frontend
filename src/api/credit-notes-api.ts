import type { PaginationParams, PaginationType } from "@/types/types";
import { apiClient } from "./client";

export interface CreditNote {
    id:           number;
    billId:       number;
    billNumber:   string;
    customerId:   number;
    customerName: string;
    customerRuc:  string;
    date:         Date;
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
} 

export interface CreateCreditNoteRequest {
    billId:  number;
    date:    Date;
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
    get: (params: GetCreditNoteParams) => apiClient.get<{creditNotes:CreditNote[],pagination: PaginationType}>("/api/credit-notes",{params}).then(r=>r.data),
    getById:(id:number)=>apiClient.get<{creditNote: CreditNote}>("/api/credit-notes/"+id).then(r=>r.data.creditNote),
    create:(body:CreateCreditNoteRequest)=>apiClient.post<{creditNote:CreditNote}>("/api/credit-notes",body).then(r=>r.data)
}