import { z } from "zod";

const createCheckSchema = z.object({
    number: z.string().optional().or(z.literal("")),
    emisionDate: z
        .string({ message: "La fecha de emisión es requerida" })
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha inválido (AAAA-MM-DD)"),
    availabilityDate: z.string().optional().or(z.literal("")),
    type: z
        .number({ message: "El tipo de cheque es requerido" })
        .refine((val) => [0, 1].includes(val), "Tipo de cheque inválido"),
    issuingBank: z.string().optional().or(z.literal("")),
    receiver: z.string().optional().or(z.literal("")),
    amount: z
        .number({ message: "El monto del cheque es requerido" })
        .positive("El monto del cheque debe ser mayor a 0"),
}).superRefine((data, ctx) => {
    if (data.type === 1 && (!data.availabilityDate || data.availabilityDate === "")) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "La fecha de disponibilidad es requerida para cheques diferidos",
            path: ["availabilityDate"],
        });
    }
});

export const createMovementSchema = z.object({
    accountId: z
        .number({ message: "La cuenta es requerida" })
        .positive("La cuenta es requerida"),
    amount: z
        .number({ message: "El monto es requerido" })
        .positive("El monto debe ser mayor a 0"),
    description: z
        .string()
        .optional()
        .or(z.literal("")),
    date: z
        .string({ message: "La fecha es requerida" })
        .min(1, "La fecha es requerida"),
    movementType: z
        .number({ message: "El tipo de movimiento es requerido" }),
    checkDetails: z.undefined().or(z.null()).or(createCheckSchema),
});

export type CreateMovementFormData = z.infer<typeof createMovementSchema>;
