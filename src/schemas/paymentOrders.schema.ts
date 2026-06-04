import { z } from "zod";

const dateFormatRegex = /^\d{2}\/\d{2}\/\d{4}$/;

export const paymentOrderStep0Schema = z.object({
    pofsId: z.string("Seleccione una OC por proveedor").min(1, "Seleccione una OC por proveedor"),
    bankAccountId: z.string("Seleccione una cuenta bancaria").min(1, "Seleccione una cuenta bancaria"),
    amount: z.string("Ingrese el monto").min(1, "Ingrese el monto"),
    paymentMethod: z.string("Seleccione el método de pago").min(1, "Seleccione el método de pago"),
    referenceNumber: z.string().optional().default(""),
    paymentDate: z.string("Seleccione la fecha de pago").min(1, "Seleccione la fecha de pago").regex(dateFormatRegex, "Formato inválido (dd/mm/aaaa)"),
    notes: z.string().optional().default(""),
});

export const paymentOrderAmountSchema = z.number("El monto es requerido").min(1, "El monto debe ser mayor a 0");

export type PaymentOrderStep0FormData = z.infer<typeof paymentOrderStep0Schema>;
