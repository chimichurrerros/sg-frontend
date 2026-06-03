import type { Customer } from "@/api/customers.api";
import type { PaymentMethod, ProductSaleDTO, SaleCondition, } from "./sales";
import type { Bill } from "@/api/sales.api";

export interface BudgetForm{
    bill?: Bill
    description?: string
    customer?:Customer
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