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
          { path: "/dash/configuraciones", element: <ConfigurationsPage /> },
          { path: "/dash/ventas/nueva", element: <NewSalePage /> },
          { path: "/dash/configuraciones", element: <ConfigurationsPage /> },
          { path: "/dash/catalogo", element: <CatalogPage /> },
        ],
      },
    ],
  },
  { path: "*", element: <Navigate to="/login" replace /> },
]);


