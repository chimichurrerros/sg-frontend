import { z } from "zod";

export const purchaseReceiptStep0Schema = z.object({
    pofsId: z.string("Seleccione una orden de compra").min(1, "Seleccione una orden de compra"),
    supplierId: z.string("Seleccione un proveedor").min(1, "Seleccione un proveedor"),
    branchId: z.string("Seleccione una sucursal").min(1, "Seleccione una sucursal"),
    billNumber: z.string("Ingrese el número de factura").min(1, "Ingrese el número de factura"),
    stamp: z.string().optional().default(""),
    date: z.string("Seleccione una fecha").min(1, "Seleccione una fecha"),
    observation: z.string().optional().default(""),
});

export const purchaseReceiptDetailSchema = z.object({
    productId: z.number(),
    quantity: z.number("Ingrese la cantidad").min(0, "Debe ser un valor positivo"),
    price: z.number("Ingrese el precio").min(0, "Debe ser un valor positivo"),
});

export const purchaseReceiptDetailsSchema = z
    .array(purchaseReceiptDetailSchema)
    .min(1, "Debe haber al menos un producto para recibir");

export type PurchaseReceiptStep0FormData = z.infer<typeof purchaseReceiptStep0Schema>;
