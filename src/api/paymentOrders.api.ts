import type { PaginationType } from "@/types/types";
import { apiClient } from "./client";

export interface PaymentOrderCreditNoteDto {
    id: number;
    creditNoteId: number;
    amount: number;
    creditNoteNumber?: string | null;
}

export interface PaymentOrderBillDto {
    id: number;
    billId: number;
    purchaseOrderForSupplierId: number;
    amount: number;
    billNumber?: string | null;
}

export interface PaymentOrderMovementDto {
    id: number;
    bankMovementId: number;
    bankAccountId: number;
    amount: number;
    date: string;
    paymentMethod?: string | null;
    referenceNumber?: string | null;
}

export interface PaymentOrderResponseDto {
    id: number;
    supplierId: number;
    supplierName?: string | null;
    purchaseOrderForSupplierId: number;
    date: string;
    total: number;
    stateId?: string | null;
    paymentMethod?: string | null;
    bills?: PaymentOrderBillDto[] | null;
    movements?: PaymentOrderMovementDto[] | null;
    creditNotes?: PaymentOrderCreditNoteDto[] | null;
}

export interface ListPaymentOrdersWrapperDto {
    paymentOrders: PaymentOrderResponseDto[] | null;
    pagination: PaginationType | null;
}

export interface PaymentOrderWrapperDto {
    paymentOrder: PaymentOrderResponseDto;
}

export interface PaymentOrderFilterParams {
    page?: number;
    pageSize?: number;
    supplierId?: number;
    stateId?: string;
    startDate?: string;
    endDate?: string;
}

export interface PaymentCreditNoteDto {
    creditNoteId: number;
    amount: number;
}

export interface CheckDetailsRequest {
    accountId: number;
    number: string;
    emisionDate: string;
    availabilityDate: string;
    issuingBank: string;
    type: number;
    receiver: string;
}

export interface PaymentMethodRequest {
    method: string;
    accountId: number;
    amount: number;
    referenceNumber?: string | null;
    checkDetails?: CheckDetailsRequest | null;
    creditNoteId?: number | null;
}

export interface CreatePaymentOrderRequest {
    purchaseOrderForSupplierId: number;
    paymentDate: string;
    notes?: string | null;
    methods: PaymentMethodRequest[];
}

export const paymentOrderStateMap: Record<string, string> = {
    "Pending": "Pendiente",
    "Processed": "Procesado",
    "Cancelled": "Cancelado",
};

export const paymentMethodOptions = [
    { value: "Transfer", label: "Transferencia" },
    { value: "Cash", label: "Efectivo" },
    { value: "Check", label: "Cheque" },
    { value: "CreditNote", label: "Nota de Crédito" },
];

export const paymentOrdersApi = {
    get: (params: PaymentOrderFilterParams) => {
        const queryParams: Record<string, string | number> = {};
        if (params.page !== undefined) queryParams.Page = params.page;
        if (params.pageSize !== undefined) queryParams.PageSize = params.pageSize;
        if (params.supplierId !== undefined) queryParams.SupplierId = params.supplierId;
        if (params.stateId !== undefined) queryParams.State = params.stateId;
        if (params.startDate !== undefined) queryParams.StartDate = params.startDate;
        if (params.endDate !== undefined) queryParams.EndDate = params.endDate;
        return apiClient
            .get<ListPaymentOrdersWrapperDto>("/api/payment-orders", { params: queryParams })
            .then((r) => r.data);
    },
    getById: (id: number) =>
        apiClient.get<PaymentOrderWrapperDto>(`/api/payment-orders/${id}`).then((r) => r.data),
    create: (body: CreatePaymentOrderRequest) =>
        apiClient.post<PaymentOrderWrapperDto>("/api/payment-orders", body).then((r) => r.data),
};
