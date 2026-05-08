import {
  Home,
  ShoppingCart,
  UserCog,
  Settings,
  Plus,
  User,
  Building2,
  Truck,
  CalendarRange,
  Package,
  Receipt,
  Landmark,
  Building,
  CreditCard,
  BanknoteArrowUp,
  ScrollText,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavChild {
  id: string;
  label: string;
  path: string;
  icon: LucideIcon;
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
    ],
  },
  // { id: "compras", label: "Compras", icon: Package, path: "/dash/compras" },
  {
    id: "tesoreria",
    label: "Tesorería y Bancos",
    icon: Landmark,
    path: "/tesoreria",
    children: [
      { id: "bancos", label: "Bancos", icon: Building, path: "/tesoreria/bancos" },
      {
        id: "cuentas-bancarias",
        label: "Cuentas bancarias",
        icon: CreditCard,
        path: "/tesoreria/cuentas-bancarias",
      },
      {
        id: "movimientos",
        label: "Movimientos",
        icon: BanknoteArrowUp,
        path: "/tesoreria/movimientos",
      },
    ],
  },
  // { id: "rrhh", label: "RR.HH.", icon: Users, path: "/dash/rrhh" },
  {
    id: "gestiones",
    label: "Gestiones",
    icon: UserCog,
    section: "Administración",
    children: [
      { id: "usuarios", label: "Usuarios", icon: User, path: "/register" },
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
        id: "inventario",
        label: "Inventario",
        icon: Package,
        path: "/inventario",
      },
    ],
  },
  // {
  //   id: "contabilidad",
  //   label: "Contabilidad",
  //   icon: FileText,
  //   path: "/dash/contabilidad",
  // },
  {
    id: "tesoreria",
    label: "Tesorería y Bancos",
    icon: Landmark,
    path: "/tesoreria",
    children: [
      {
        id: "cheques",
        label: "Cheques",
        icon: ScrollText,
        path:"/tesoreria/cheques"
      },
    ],
  },
  {
    id: "configuraciones",
    label: "Configuraciones",
    icon: Settings,
    path: "/configuraciones",
  },
];
