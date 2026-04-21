export interface PaginationType{ 
    totalPages: number
    pageSize:number
    totalRecords:number
    records:number
    currentPage:number
}
export interface ProductSaleDTO{    
    id: string;
    codigo: string;
    descripcion: string;
    precioUnitario: number;
    cantidad: number;
    total: number;}
    
export interface VentaForm {
  cliente: {
    nombreRazonSocial: string;
    ruc: {
      numero: string;
      digitoVerificador: string;
    };
  };
  venta: {
    numeroFactura: string;
    numeroVenta: number;
    fecha: Date;
    cajaNumero: number;
  };
  pago: {
    metodo: "efectivo" | "tarjeta" | "transferencia";
    condicion: "contado" | "credito";
  };
  productos: Array<ProductSaleDTO>;
  totales: {
    subtotal: number;
    iva: number;
    total: number;
    importe: number;
    vuelto: number;
  };
}