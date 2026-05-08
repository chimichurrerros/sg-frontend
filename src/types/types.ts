
export interface PaginationType{ 
    totalPages: number
    pageSize:number
    totalElements:number
    currentPage:number
}
export interface PaginationParams{
    page?: number
    pageSize?: number
}
   
export interface Bill{
    id:number
    number:string
    //TO DO
}

export interface CustomerForSales{
    id:number
    name:string
    ruc:string
}