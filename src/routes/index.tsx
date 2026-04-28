import { createBrowserRouter, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/routes/guard/ProtectedRoute";
import { PublicRoute } from "@/routes/guard/PublicRoute";
import { LoginPage } from "@/pages/LoginPage";
import { HomePage } from "@/pages/HomePage";
import { RegisterPage } from "@/pages/RegisterPage";
import { HomeLayout } from "@/components/layouts/HomeLayout";
import ConfigurationsPage from "@/pages/ConfigurationsPage";
import NewSalePage from "@/pages/Sales/NewSalePage";
import { CatalogPage } from "@/pages/Catalog/CatalogPage";
import BudgetsPage from "@/pages/Sales/BudgetsPage";
import { AddProducts } from "@/pages/Catalog/AddProduct";
import BranchesListPage from "@/pages/Branches/BranchesListPage";
import BudgetSheetPage from "@/pages/Sales/Budgets/BudgetSheetPage";
import StockListPage from "@/pages/Stock/StockListPage";

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
          { path: "/register", element: <RegisterPage /> },
          { path: "/configuraciones", element: <ConfigurationsPage /> },
          { path: "/ventas/nueva", element: <NewSalePage /> },
          { path: "/ventas/presupuestos", element: <BudgetsPage /> },
          { path: "/dash/catalogo", element: <CatalogPage /> },
          { path: "/dash/catalogo/nuevo-producto", element: <AddProducts /> },
          { path: "/ventas/presupuestos/crear", element: <BudgetSheetPage mode="create" /> },
          { path: "/sucursales", element: <BranchesListPage /> },
          { path: "/inventario", element: <StockListPage /> },

        ],
      },
    ],
  },
  { path: "*", element: <Navigate to="/login" replace /> },
]);
