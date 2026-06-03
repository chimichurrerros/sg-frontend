import { z } from "zod";

export const purchaseReceiptStep0Schema = z.object({
    pofsId: z.string({ required_error: "Seleccione una orden de compra" }).min(1, "Seleccione una orden de compra"),
    supplierId: z.string({ required_error: "Seleccione un proveedor" }).min(1, "Seleccione un proveedor"),
    branchId: z.string({ required_error: "Seleccione una sucursal" }).min(1, "Seleccione una sucursal"),
    billNumber: z.string({ required_error: "Ingrese el número de factura" }).min(1, "Ingrese el número de factura"),
    stamp: z.string().optional().default(""),
    date: z.string({ required_error: "Seleccione una fecha" }).min(1, "Seleccione una fecha"),
    observation: z.string().optional().default(""),
});

export const purchaseReceiptDetailSchema = z.object({
    productId: z.number(),
    quantity: z.number({ required_error: "Ingrese la cantidad" }).min(0, "Debe ser un valor positivo"),
    price: z.number({ required_error: "Ingrese el precio" }).min(0, "Debe ser un valor positivo"),
});

export const purchaseReceiptDetailsSchema = z
    .array(purchaseReceiptDetailSchema)
    .min(1, "Debe haber al menos un producto para recibir");

export type PurchaseReceiptStep0FormData = z.infer<typeof purchaseReceiptStep0Schema>;
