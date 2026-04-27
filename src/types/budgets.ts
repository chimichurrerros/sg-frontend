import type { PaymentMethod, RUC } from "./sales";
import type { CustomerForSales, Bill } from "./types";

export interface BudgetForm{
    invoice?: Bill
    description?: string
    customer?:CustomerForSales
    customerName?:string
    ruc?:RUC
    creationDate?: string
    expirationDate?:string
    resolutionDate?:string
    status?: "Pendiente" | "Aprobado" | "Rechazado" | "Expirado"
    payMethod?: PaymentMethod
}