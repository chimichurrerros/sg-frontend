import type { PaginationParams, PaginationType } from "@/types/types";
import { apiClient } from "./client";



export interface CustomerRequest{
    name?: string;
    ruc?:  string;
}
export interface Customer {
    id:   number;
    name: string;
    ruc:  string;
}

export interface GetCustomersResponse {
    customers: Customer[];
    pagination:PaginationType;
}

export const customerApi ={
    get:(params:PaginationParams)=>apiClient.get<GetCustomersResponse>("/api/customers",{params}).then(r=>r.data),
    create:(body:CustomerRequest)=>apiClient.post<Customer>("/api/customers",body).then(r=>r.data),
    getById:(id:number) => apiClient.get<Customer>("/api/customers/"+id).then(r=>r.data),
    edit:(id:number, body:CustomerRequest) => apiClient.put("/api/customers/"+id,body).then(r=>r.data), 
    getAll: ()=> apiClient.get<{customers:Customer[]}>("/api/customers/all").then(r=>r.data.customers)
}