import { z } from "zod";

export const createBankSchema = z.object({
    name: z
        .string({ message: "El nombre es requerido" })
        .min(1, "El nombre es requerido"),
    ruc: z
        .string({ message: "El RUC es requerido" })
        .min(1, "El RUC es requerido"),
});

export type CreateBankFormData = z.infer<typeof createBankSchema>;
