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
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavChild {
  id: string;
  label: string;
  icon: LucideIcon;
  path?: string;
  children?: NavChild[];
}

export interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  section?: string; // renders a divider label above this item
  path?: string; // leaf page — either path OR children, not both
  children?: NavChild[];
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
        icon: ListOrdered ,
        path: "/ventas",
      },
      {
        id: "nueva-venta",
        label: "Nueva Venta",
        icon: Plus,
        path: "/ventas/nueva",
      },
      {
        id: "presupuestos",
        label: "Presupuestos",
        icon: CalendarRange,
        path: "/ventas/presupuestos",
      },
      {
        id: "facturas",
        label: "Facturas",
        icon: Receipt,
        path: "/ventas/facturas",
      },
      {
        id: "devoluciones",
        label: "Devoluciones",
        icon: HandHelping,
        path: "/ventas/devoluciones",
      },
    ],
  },
  {
    id: "compras", label: "Compras", icon: NotebookPen, path: "/compras",
    children: [
      {
        id: "pedidos-compra",
        label: "Pedidos de Compra",
        icon: ScrollText,
        path: "/compras/pedidos"
      },
      {
        id: "solicitudes-cotizacion",
        label: "Solicitudes de Cot.",
        icon: FileText,
        path: "/compras/solicitudes-cotizacion"
      },
      {
        id: "cotizaciones-proveedores",
        label: "Cotizaciones",
        icon:   TableProperties,
        path: "/compras/cotizaciones-proveedores"
      },
      {
        id: "ordenes-de-compra",
        label: "Órdenes de Compra",
        icon: ClipboardCheck,
        path: "/compras/ordenes-de-compra"
      },
      {
        id: "ordenes-por-proveedor",
        label: "OC por Proveedor",
        icon: Truck,
        path: "/compras/ordenes-por-proveedor"
      },
      {
        id: "recepcion-ordenes-compra",
        label: "Recepción de OC",
        icon:   Package,
        path: "/compras/recepcion-ordenes-compra"
      },
    ]

  },
  {
    id: "tesoreria",
    label: "Tesorería y Bancos",
    icon: Landmark,
    path: "/tesoreria",
    children: [
      { id: "bancos", label: "Bancos", icon: Building, path: "/tesoreria/bancos" },
      {
        id: "cuentas",
        label: "Cuentas",
        icon: CreditCard,
        path: "/tesoreria/cuentas",
      },
      {
        id: "movimientos",
        label: "Movimientos",
        icon: BanknoteArrowUp,
        path: "/tesoreria/movimientos",
      },
      {
        id: "cheques",
        label: "Cheques",
        icon: ScrollText,
        path: "/tesoreria/cheques"
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
    id: "gestiones",
    label: "Gestiones",
    icon: UserCog,
    section: "Administración",
    children: [
      { id: "usuarios", label: "Usuarios", icon: User, path: "/register" },
      { id: "clientes", label: "Clientes", icon: Contact, path: "/customers" },

      {
        id: "sucursales",
        label: "Sucursales",
        icon: Building2,
        path: "/sucursales",
      },
      {
        id: "proveedores",
        label: "Proveedores",
        icon: Truck,
        path: "/dash/proveedores",
      },
      {
        id: "catalogo",
        label: "Catálogo",
        icon: Receipt,
        path: "/dash/catalogo",
      },
      {
        id: "organizacion",
        label: "Organización",
        icon: GitBranch,
        path: "/gestiones/organizacion?tab=employees",
      },
      {
        id: "inventario",
        label: "Inventario",
        icon: Package,
        path: "/inventario",
      },
    ],
  },
  {
    id: "contabilidad",
    label: "Contabilidad",
    icon: FileText,
    path: "/dash/contabilidad",
  },
  {
    id: "configuraciones",
    label: "Configuraciones",
    icon: Settings,
    path: "/configuraciones",
  },
];
