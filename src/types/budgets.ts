import type { PaymentMethod, ProductSaleDTO, SaleCondition, CustomerForSales } from "./sales";
import type { Bill } from "@/api/sales.api";

export interface BudgetForm{
    bill?: Bill
    description?: string
    customer?:CustomerForSales
    customerName?:string
    ruc?:string
    creationDate?: string
    expirationDate?:string
    resolutionDate?:string
    status?: "Pendiente" | "Aprobado" | "Rechazado" | "Expirado"
    payMethod?: PaymentMethod
    condition?: SaleCondition
    products: ProductSaleDTO[]
}