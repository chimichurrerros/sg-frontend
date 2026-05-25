
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

export interface BackendError{
    title:string
    status:number
    details?:string
}