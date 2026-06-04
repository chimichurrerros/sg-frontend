import { z } from "zod";

const dateFormatRegex = /^\d{2}\/\d{2}\/\d{4}$/;

export const purchaseReturnStep0Schema = z.object({
    pofsId: z.string({ required_error: "Seleccione una orden de compra" }).min(1, "Seleccione una orden de compra"),
    reasonId: z.string({ required_error: "Seleccione un motivo" }).min(1, "Seleccione un motivo"),
    branchId: z.string({ required_error: "Seleccione una sucursal" }).min(1, "Seleccione una sucursal"),
    billNumber: z.string({ required_error: "Ingrese el número de factura" }).min(1, "Ingrese el número de factura"),
    billDate: z.string({ required_error: "Seleccione la fecha de factura" }).min(1, "Seleccione la fecha de factura").regex(dateFormatRegex, "Formato inválido (dd/mm/aaaa)"),
    number: z.string({ required_error: "Ingrese el número de devolución" }).min(1, "Ingrese el número de devolución"),
    creditNoteNumber: z.string({ required_error: "Ingrese el número de nota de crédito" }).min(1, "Ingrese el número de nota de crédito"),
    date: z.string({ required_error: "Seleccione una fecha" }).min(1, "Seleccione una fecha").regex(dateFormatRegex, "Formato inválido (dd/mm/aaaa)"),
    observation: z.string().optional().default(""),
});

export const purchaseReturnDetailSchema = z.object({
    productId: z.number(),
    quantity: z.number({ required_error: "Ingrese la cantidad" }).min(1, "Debe ser mayor a 0"),
    price: z.number({ required_error: "Ingrese el precio" }).min(0, "Debe ser un valor positivo"),
});

export const purchaseReturnDetailsSchema = z
    .array(purchaseReturnDetailSchema)
    .min(1, "Debe haber al menos un producto para devolver");

export type PurchaseReturnStep0FormData = z.infer<typeof purchaseReturnStep0Schema>;
