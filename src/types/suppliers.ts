export interface SupplierCategory {
  id: number;
  supplierId: number;
  productCategoryId: number;
  productCategory: {
    id: number;
    name: string;
  };
}

export interface Supplier {
  id: number;
  entityId?: number;
  ruc: string;
  documentNumber: string;
  businessName: string;
  fantasyName?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  isActive: boolean;
  supplierCategories?: SupplierCategory[];
}
