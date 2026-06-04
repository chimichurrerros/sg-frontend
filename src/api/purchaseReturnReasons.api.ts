import { apiClient } from "./client";

export interface PurchaseReturnReason {
    id: number;
    name: string;
}

export interface ListPurchaseReturnReasonsWrapper {
    reasons: PurchaseReturnReason[];
}

export const purchaseReturnReasonsApi = {
    getAll: () =>
        apiClient
            .get<ListPurchaseReturnReasonsWrapper>("/api/purchase-returns/reasons")
            .then((r) => r.data),
};
