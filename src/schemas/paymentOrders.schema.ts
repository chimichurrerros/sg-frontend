import { z } from "zod";

const dateFormatRegex = /^\d{2}\/\d{2}\/\d{4}$/;

export const paymentOrderStep0Schema = z.object({
    supplierId: z.string().min(1, "Seleccione un proveedor"),
    billIds: z.array(z.number()).min(1, "Seleccione al menos una factura"),
});

export const paymentOrderMethodSchema = z.object({
    method: z.string().min(1, "Seleccione el método de pago"),
    accountId: z.number().optional(),
    amount: z.number().min(0.01, "El monto debe ser mayor a 0"),
    referenceNumber: z.string().optional(),
    creditNoteId: z.number().optional(),
    checkDetails: z.object({
        accountId: z.number(),
        number: z.string().min(1, "N° de cheque requerido"),
        emisionDate: z.string(),
        availabilityDate: z.string().optional(),
        issuingBank: z.string().min(1, "Banco emisor requerido"),
        type: z.union([z.literal(0), z.literal(1)]),
        receiver: z.string(),
    }).optional(),
});

export const paymentOrderStep1Schema = z.object({
    methods: z.array(paymentOrderMethodSchema).min(1, "Agregue al menos un método de pago"),
});

export const paymentOrderStep2Schema = z.object({
    paymentDate: z.string().min(1, "Seleccione la fecha de pago").regex(dateFormatRegex, "Formato inválido (dd/mm/aaaa)"),
    notes: z.string().optional(),
});

export const paymentOrderAmountSchema = z.number().min(1, "El monto debe ser mayor a 0");

export type PaymentOrderStep0FormData = z.infer<typeof paymentOrderStep0Schema>;
export type PaymentOrderStep1FormData = z.infer<typeof paymentOrderStep1Schema>;
export type PaymentOrderStep2FormData = z.infer<typeof paymentOrderStep2Schema>;
