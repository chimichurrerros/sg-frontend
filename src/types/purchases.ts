
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