import { z } from "zod";

export const createBrandSchema = z.object({
  name: z
    .string({ message: "El nombre es requerido" })
    .min(1, "El nombre es requerido")
    .min(2, "El nombre debe tener al menos 2 caracteres"),
});

export type CreateBrandFormData = z.infer<typeof createBrandSchema>;

export const createCategorySchema = z.object({
  name: z
    .string({ message: "El nombre es requerido" })
    .min(1, "El nombre es requerido")
    .min(2, "El nombre debe tener al menos 2 caracteres"),
});

export type CreateCategoryFormData = z.infer<typeof createCategorySchema>;

export const createProductSchema = z.object({
  barcode: z
    .string({ message: "El código de barras es requerido" })
    .min(1, "El código es requerido")
    .min(3, "El código debe tener al menos 3 caracteres"),
  name: z
    .string({ message: "El nombre es requerido" })
    .min(1, "El nombre es requerido")
    .min(2, "El nombre debe tener al menos 2 caracteres"),
  description: z.string().optional(),
  barcode: z
    .string({ message: "El código de barras es requerido" })
    .min(1, "El código de barras es requerido"),
  productCategoryId: z
    .number({ message: "La categoría es requerida" })
    .min(1, "La categoría es requerida"),
  productBrandId: z
    .number({ message: "La marca es requerida" })
    .min(1, "La marca es requerida"),
  price: z
    .number({ message: "El precio es requerido" })
    .min(0, "El precio no puede ser negativo"),
  cost: z
    .number({ message: "El costo es requerido" })
    .min(0, "El costo no puede ser negativo"),
  minimumStock: z
    .number({ message: "El stock mínimo es requerido" })
    .min(0, "El stock mínimo no puede ser negativo"),
});

export type CreateProductFormData = z.infer<typeof createProductSchema>;