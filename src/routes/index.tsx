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
import BanksPage from "@/pages/Treasury/Banks/BanksPage";
import BankCreate from "@/pages/Treasury/Banks/BankCreate";
import BankView from "@/pages/Treasury/Banks/BankView";
import BankAccountsPage from "@/pages/Treasury/Accounts/BankAccountsPage";
import BankAccountView from "@/pages/Treasury/Accounts/BankAccountView";
import BankAccountCreate from "@/pages/Treasury/Accounts/BankAccountCreate";
import MovementsPage from "@/pages/Treasury/Movements/MovementsPage";
import MovementView from "@/pages/Treasury/Movements/MovementView";
import MovementCreate from "@/pages/Treasury/Movements/MovementCreate";
import ChecksList from "@/pages/Treasury/Checks/ChecksList";
import CheckView from "@/pages/Treasury/Checks/CheckView";
import SupplierQuotesList from "@/pages/Purchases/SupplierQuotes/SupplierQuotesList";
import SupplierQuoteSheet from "@/pages/Purchases/SupplierQuotes/SupplierQuoteSheet";
import PurchaseReceiptWizard from "@/pages/Purchases/PurchaseReceipts/PurchaseReceiptWizard";
import PurchaseRequestList from "@/pages/Purchases/PurchaseRequests/PurchaseRequestList";
import PurchaseRequestCreate from "@/pages/Purchases/PurchaseRequests/PurchaseRequestCreate";
import PurchaseRequestView from "@/pages/Purchases/PurchaseRequests/PurchaseRequestView";
import { AddSupplierPage } from "@/pages/Suppliers/AddSupplierPage";
import SupplierListPage from "@/pages/Suppliers/SupplierListPage";
import PurchaseOrderList from "@/pages/Purchases/PurchaseOrders/PurchaseOrderList";
import PurchaseOrderFormPage from "@/pages/Purchases/PurchaseOrders/PurchaseOrderFormPage";
import EmployeesPage from "@/pages/RRHH/Employees/EmployeesPage";
import EmployeeFormPage from "@/pages/RRHH/Employees/EmployeeFormPage";
import OrganizationPage from "@/pages/Organization/OrganizationPage";

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
          { path: "/compras/pedidos", element: <PurchaseRequestList /> },
          { path: "/compras/pedidos/nuevo", element: <PurchaseRequestCreate /> },
          { path: "/compras/pedidos/:id", element: <PurchaseRequestView /> },
          { path: "/compras/cotizaciones-proveedores", element: <SupplierQuotesList /> },
          { path: "/compras/cotizaciones-proveedores/nueva", element: <SupplierQuoteSheet mode="create" /> },
          { path: "/compras/cotizaciones-proveedores/:id", element: <SupplierQuoteSheet mode="edit" /> },
          { path: "/compras/ordenes-de-compra", element: <PurchaseOrderList /> },
          { path: "/compras/ordenes-de-compra/nuevo", element: <PurchaseOrderFormPage /> },
          { path: "/compras/ordenes-de-compra/:id", element: <PurchaseOrderFormPage /> },
          { path: "/compras/recepcion-ordenes-compra", element: <PurchaseReceiptWizard /> },

          /* ===== TESORERIA ===== */
          { path: "/tesoreria/bancos", element: <BanksPage /> },
          { path: "/tesoreria/bancos/nuevo", element: <BankCreate /> },
          { path: "/tesoreria/bancos/:id", element: <BankView /> },
          { path: "/tesoreria/cuentas-bancarias", element: <BankAccountsPage /> },
          { path: "/tesoreria/cuentas-bancarias/nueva", element: <BankAccountCreate /> },
          { path: "/tesoreria/cuentas-bancarias/:id", element: <BankAccountView /> },
          { path: "/tesoreria/movimientos", element: <MovementsPage /> },
          { path: "/tesoreria/movimientos/nueva", element: <MovementCreate /> },
          { path: "/tesoreria/movimientos/:id", element: <MovementView /> },
          { path: "/tesoreria/cheques", element: <ChecksList /> },
          { path: "/tesoreria/cheques/:id", element: <CheckView /> },

          /* ===== GESTIONES ===== */
          { path: "/register", element: <RegisterPage /> },
          { path: "/dash/catalogo", element: <CatalogPage /> },
          { path: "/dash/catalogo/nuevo-producto", element: <AddProducts /> },
          { path: "/dash/proveedores", element: <SupplierListPage /> },
          { path: "/dash/proveedores/nuevo", element: <AddSupplierPage /> },
          { path: "/dash/proveedores/:id", element: <AddSupplierPage /> },
          { path: "/rrhh/empleados", element: <EmployeesPage /> },
          { path: "/rrhh/empleados/nuevo", element: <EmployeeFormPage /> },
          { path: "/rrhh/empleados/:id", element: <EmployeeFormPage /> },
          { path: "/gestiones/organizacion", element: <OrganizationPage /> },
          {
            path: "/gestiones/organizacion/empleados",
            element: (
              <EmployeesPage
                routeBase="/gestiones/organizacion/empleados"
                contextLabel="Gestiones / Organización / Empleados"
              />
            ),
          },
          {
            path: "/gestiones/organizacion/empleados/nuevo",
            element: (
              <EmployeeFormPage
                basePath="/gestiones/organizacion/empleados"
                breadcrumb="Gestiones / Organización / Empleados"
              />
            ),
          },
          {
            path: "/gestiones/organizacion/empleados/:id",
            element: (
              <EmployeeFormPage
                basePath="/gestiones/organizacion/empleados"
                breadcrumb="Gestiones / Organización / Empleados"
              />
            ),
          },
          { path: "/ventas/presupuestos/crear", element: <BudgetSheetPage mode="create" /> },
          { path: "/sucursales", element: <BranchesListPage /> },
          { path: "/inventario", element: <StockListPage /> },
        ],
      },
    ],
  },
  { path: "*", element: <Navigate to="/login" replace /> },
]);
