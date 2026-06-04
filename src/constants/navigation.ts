import {
  Home,
  ShoppingCart,
  UserCog,
  Settings,
  Plus,
  User,
  Truck,
  CalendarRange,
  Package,
  Receipt,
  Landmark,
  Building,
  CreditCard,
  BanknoteArrowUp,
  TableProperties,
  ListOrdered,
  BadgeCheck,
  Megaphone,
  ListChecks,
  Calculator,
  GitBranch,
  Building2,
  NotebookPen,
  ScrollText,
  ClipboardCheck,
  HandHelping,
  FileText,
  UserCheck,
  Contact,
  StickyNote,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavChild {
  id: string;
  label: string;
  icon: LucideIcon;
  path?: string;
  children?: NavChild[];
  permission?: string;
}

export interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  section?: string; // renders a divider label above this item
  path?: string; // leaf page — either path OR children, not both
  children?: NavChild[];
  permission?: string;
}

export const NAV_CONFIG: NavItem[] = [
  { id: "inicio", label: "Inicio", icon: Home, path: "/dash" },
  {
    id: "ventas",
    label: "Ventas",
    icon: ShoppingCart,
    section: "Operaciones",
    children: [
      {
        id: "ventas",
        label: "Listado de Ventas",
        icon: ListOrdered,
        path: "/ventas",
        permission: "salesOrders.view",
      },
      {
        id: "nueva-venta",
        label: "Nueva Venta",
        icon: Plus,
        path: "/ventas/nueva",
        permission: "salesOrders.create",
      },
      {
        id: "presupuestos",
        label: "Presupuestos",
        icon: CalendarRange,
        path: "/ventas/presupuestos",
        permission: "customerQuotes.view",
      },
      {
        id: "facturas",
        label: "Facturas",
        icon: Receipt,
        path: "/ventas/facturas",
        permission: "bills.view",
      },
      {
        id: "devoluciones",
        label: "Devoluciones",
        icon: HandHelping,
        path: "/ventas/devoluciones",
        permission: "salesReturns.view",
      },
      {
        id: "notas-credito-ventas",
        label: "Notas de Crédito(Ventas)",
        icon: StickyNote,
        path: "/ventas/notas-de-credito",
        permission: "creditNotes.view",
      },
    ],
  },
  {
    id: "compras",
    label: "Compras",
    icon: NotebookPen,
    path: "/compras",
    children: [
      {
        id: "pedidos-compra",
        label: "Pedidos de Compra",
        icon: ScrollText,
        path: "/compras/pedidos",
        permission: "purchaseRequests.view",
      },
      {
        id: "solicitudes-cotizacion",
        label: "Solicitudes de Cot.",
        icon: FileText,
        path: "/compras/solicitudes-cotizacion",
        permission: "requestForQuotations.view",
      },
      {
        id: "cotizaciones-proveedores",
        label: "Cotizaciones",
        icon: TableProperties,
        path: "/compras/cotizaciones-proveedores",
        permission: "supplierQuotes.view",
      },
      {
        id: "ordenes-de-compra",
        label: "Órdenes de Compra",
        icon: ClipboardCheck,
        path: "/compras/ordenes-de-compra",
        permission: "purchaseOrders.view",
      },
      {
        id: "ordenes-por-proveedor",
        label: "OC por Proveedor",
        icon: Truck,
        path: "/compras/ordenes-por-proveedor",
        permission: "purchaseOrderForSuppliers.view",
      },
      {
        id: "recepcion-ordenes-compra",
        label: "Recepción de OC",
        icon: Package,
        path: "/compras/recepcion-ordenes-compra",
        permission: "purchaseReceipts.view",
      },
    ],
  },
  {
    id: "tesoreria",
    label: "Tesorería y Bancos",
    icon: Landmark,
    path: "/tesoreria",
    children: [
      {
        id: "bancos",
        label: "Bancos",
        icon: Building,
        path: "/tesoreria/bancos",
        permission: "banks.view",
      },
      {
        id: "cuentas",
        label: "Cuentas",
        icon: CreditCard,
        path: "/tesoreria/cuentas",
        permission: "accounts.view",
      },
      {
        id: "movimientos",
        label: "Movimientos",
        icon: BanknoteArrowUp,
        path: "/tesoreria/movimientos",
        permission: "bankMovements.view",
      },
      {
        id: "cheques",
        label: "Cheques",
        icon: ScrollText,
        path: "/tesoreria/cheques",
        permission: "checks.view",
      },
    ],
  },
  {
    id: "rrhh",
    label: "RR.HH.",
    icon: BadgeCheck,
    section: "Operaciones",
    children: [
      { id: "rrhh-novedades", label: "Novedades", icon: Megaphone, path: "/rrhh/novedades" },
      { id: "rrhh-conceptos-manuales", label: "Conceptos Manuales", icon: ListChecks, path: "/rrhh/conceptos-manuales" },
      { id: "rrhh-asistencia", label: "Asistencia", icon: UserCheck, path: "/rrhh/asistencia" },
      { id: "rrhh-planillas", label: "Planillas", icon: Calculator, path: "/rrhh/planillas" },
    ],
  },
  {
    id: "contabilidad",
    label: "Contabilidad",
    icon: FileText,
    path: "/dash/contabilidad",
    permission: "entries.view",
  },
  {
    id: "gestiones",
    label: "Gestiones",
    icon: UserCog,
    section: "Administración",
    children: [
      {
        id: "usuarios",
        label: "Usuarios",
        icon: User,
        path: "/register",
        permission: "users.view",
      },
      {
        id: "clientes",
        label: "Clientes",
        icon: Contact,
        path: "/customers",
        permission: "customers.view",
      },
      {
        id: "sucursales",
        label: "Sucursales",
        icon: Building2,
        path: "/sucursales",
        permission: "branches.view",
      },
      {
        id: "proveedores",
        label: "Proveedores",
        icon: Truck,
        path: "/dash/proveedores",
        permission: "suppliers.view",
      },
      {
        id: "catalogo",
        label: "Catálogo",
        icon: Receipt,
        path: "/dash/catalogo",
        permission: "products.view",
      },
      {
        id: "inventario",
        label: "Inventario",
        icon: Package,
        path: "/inventario",
        permission: "stock.view",
      },
    ],
  },
  {
    id: "configuraciones",
    label: "Configuraciones",
    icon: Settings,
    path: "/configuraciones",
    permission: "roles.view",
  },
];
