export interface Supplier {
  id: number;
  entityId?: number;
  documentNumber: string;
  businessName: string;
  fantasyName?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  isActive: boolean;
  productCategoryIds?: number[];
}
