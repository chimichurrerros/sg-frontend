
export interface SupplierQuote {
    id: number;
    code: number;
    supplierName: string;
    stablishment: string;
    totalAmount: number;
    quoteDate: string;
    status: number; // 0 = Active, 1 = Inactive, 2 = Rejected
}

export const supplierQuoteStatusMap: Record<number, string> = {
    0: "Activo",
    1: "Inactivo",
    2: "Rechazado"
}

export interface ProductSupplierQuote {
    id: number;
    quoteId: number;
    code: number;
    name: string;
    supplierName: string;
    quantity: number;
    unitPrice: number;
    totalPrice?: number;
}