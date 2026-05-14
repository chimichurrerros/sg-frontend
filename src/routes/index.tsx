import { createBrowserRouter, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/routes/guard/ProtectedRoute";
import { PublicRoute } from "@/routes/guard/PublicRoute";
import { LoginPage } from "@/pages/LoginPage";
import { HomePage } from "@/pages/HomePage";
import { RegisterPage } from "@/pages/RegisterPage";
import { HomeLayout } from "@/components/layouts/HomeLayout";
import ConfigurationsPage from "@/pages/ConfigurationsPage";
import BudgetsPage from "@/pages/Sales/BudgetsPage";
import { AddProducts } from "@/pages/Catalog/AddProduct";
import BranchesListPage from "@/pages/Branches/BranchesListPage";
import BudgetSheetPage from "@/pages/Sales/Budgets/BudgetSheetPage";
import StockListPage from "@/pages/Stock/StockListPage";
import BillsListPage from "@/pages/Sales/Bills/BillsList";
import BillFormPage from "@/pages/Sales/Bills/BillFormPage";
import SaleSheetPage from "@/pages/Sales/SaleSheetPage";
import { CatalogPage } from "@/pages/Catalog/CatalogPage";
import BanksPage from "@/pages/Treasury/BanksPage";
import BankAccountsPage from "@/pages/Treasury/BankAccountsPage";
import MovementsPage from "@/pages/Treasury/MovementsPage";
import ChecksList from "@/pages/Treasury/Checks/ChecksList";
import CheckView from "@/pages/Treasury/Checks/CheckView";
import PurchaseQuotesList from "@/pages/Purchases/SupplierQuotes/PurchaseQuotesList";

export const router = createBrowserRouter([
  {
    element: <PublicRoute />,
    children: [{ path: "/login", element: <LoginPage /> }],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <HomeLayout />,
        children: [
          { path: "/dash", element: <HomePage /> },
          { path: "/configuraciones", element: <ConfigurationsPage /> },

          /* ===== VENTAS ===== */
          { path: "/ventas/nueva", element: <SaleSheetPage mode="create" /> },
          { path: "/ventas/presupuestos", element: <BudgetsPage /> },
          {
            path: "/ventas/presupuestos/crear",
            element: <BudgetSheetPage mode="create" />,
          },
          { path: "/ventas/facturas", element: <BillsListPage /> },
          { path: "/ventas/facturas/nueva", element: <BillFormPage /> },
          { path: "/ventas/facturas/:id", element: <BillFormPage /> },
          {
            path: "/ventas/presupuestos/crear",
            element: <BudgetSheetPage mode="create" />,
          },
          /* ===== COMPRAS ===== */
          { path: "/compras/cotizaciones-proveedores", element: <PurchaseQuotesList /> },

          /* ===== TESORERIA ===== */
          { path: "/tesoreria/bancos", element: <BanksPage /> },
          { path: "/tesoreria/cuentas-bancarias", element: <BankAccountsPage /> },
          { path: "/tesoreria/movimientos", element: <MovementsPage /> },
          { path: "/tesoreria/cheques", element: <ChecksList /> },
          { path: "/tesoreria/cheques/:id", element: <CheckView /> },

          /* ===== GESTIONES ===== */
          { path: "/register", element: <RegisterPage /> },
          { path: "/dash/catalogo", element: <CatalogPage /> },
          { path: "/dash/catalogo/nuevo-producto", element: <AddProducts /> },
          { path: "/sucursales", element: <BranchesListPage /> },
          { path: "/inventario", element: <StockListPage /> },
        ],
      },
    ],
  },
  { path: "*", element: <Navigate to="/login" replace /> },
]);
