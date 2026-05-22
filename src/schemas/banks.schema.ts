import { z } from "zod";

export const createBankSchema = z.object({
    name: z.string().optional(),
    ruc: z.string().optional(),
});

export type CreateBankFormData = z.infer<typeof createBankSchema>;
