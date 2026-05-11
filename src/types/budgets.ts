import type { PaymentMethod, ProductSaleDTO, SaleCondition, } from "./sales";
import type { CustomerForSales, Bill } from "./types";

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