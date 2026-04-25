import {
  Home,
  ShoppingCart,
  UserCog,
  Settings,
  Plus,
  List,
  User,
  Building2,
  Truck,
  CalendarRange,
  ClipboardList,
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
        id: "listado",
        label: "Listado",
        icon: List,
        path: "/ventas"
      },
      {
        id: "presupuestos",
        label: "Presupuestos",
        icon: CalendarRange,
        path: "/ventas/presupuestos"
      }
    ],
  },
  // { id: "compras", label: "Compras", icon: Package, path: "/dash/compras" },
  // {
  //   id: "tesoreria",
  //   label: "Tesorería y Bancos",
  //   icon: Landmark,
  //   path: "/dash/tesoreria",
  // },
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
        icon: ClipboardList,
        path: "/dash/catalogo",
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
    id: "configuraciones",
    label: "Configuraciones",
    icon: Settings,
    path: "/configuraciones",
  },
];
