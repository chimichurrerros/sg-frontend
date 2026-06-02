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
import SaleListPage from "@/pages/Sales/SaleListPage";
import SaleSheetPage from "@/pages/Sales/SaleSheetPage";
import { CatalogPage } from "@/pages/Catalog/CatalogPage";
import BanksPage from "@/pages/Treasury/Banks/BanksPage";
import BankCreate from "@/pages/Treasury/Banks/BankCreate";
import BankView from "@/pages/Treasury/Banks/BankView";
import AccountsPage from "@/pages/Treasury/Accounts/AccountsPage";
import AccountView from "@/pages/Treasury/Accounts/AccountView";
import AccountCreate from "@/pages/Treasury/Accounts/AccountCreate";
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
import EmployeesPage from "@/pages/RRHH/Employees/EmployeesPage";
import EmployeeFormPage from "@/pages/RRHH/Employees/EmployeeFormPage";
import EmployeeHistoryPage from "@/pages/RRHH/Employees/EmployeeHistoryPage";
import EmployeeFamilyPage from "@/pages/RRHH/Employees/EmployeeFamilyPage";
import NovedadesPage from "@/pages/RRHH/NovedadesPage";
import ConceptosManualesPage from "@/pages/RRHH/ConceptosManualesPage";
import PlanillasPage from "@/pages/RRHH/PlanillasPage";
import PlanillaDetallePage from "@/pages/RRHH/PlanillaDetallePage";
import CrearPlanillaPage from "@/pages/RRHH/CrearPlanillaPage";
import AttendancePage from "@/pages/RRHH/AttendancePage";
import OrganizationPage from "@/pages/Organization/OrganizationPage";
import { AddSupplierPage } from "@/pages/Suppliers/AddSupplierPage";
import SupplierListPage from "@/pages/Suppliers/SupplierListPage";
import PurchaseOrderList from "@/pages/Purchases/PurchaseOrders/PurchaseOrderList";
import PurchaseOrderFormPage from "@/pages/Purchases/PurchaseOrders/PurchaseOrderFormPage";

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
          { path: "/ventas", element: <SaleListPage /> },
          { path: "/ventas/nueva", element: <SaleSheetPage mode="create" /> },
          { path: "/ventas/:id", element: <SaleSheetPage mode="view" /> },
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
          { path: "/tesoreria/cuentas", element: <AccountsPage /> },
          { path: "/tesoreria/cuentas/nueva", element: <AccountCreate /> },
          { path: "/tesoreria/cuentas/:id", element: <AccountView /> },
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
          { path: "/rrhh/empleados/:id/cargos", element: <EmployeeHistoryPage /> },
          { path: "/rrhh/empleados/:id/nucleo-familiar", element: <EmployeeFamilyPage /> },
          { path: "/rrhh", element: <Navigate to="/rrhh/novedades" replace /> },
          { path: "/rrhh/novedades", element: <NovedadesPage /> },
          { path: "/rrhh/conceptos-manuales", element: <ConceptosManualesPage /> },
          { path: "/rrhh/planillas", element: <PlanillasPage /> },
          { path: "/rrhh/planillas/nuevo", element: <CrearPlanillaPage /> },
          { path: "/rrhh/planillas/:id", element: <PlanillaDetallePage /> },
          { path: "/rrhh/asistencia", element: <AttendancePage /> },
          { path: "/gestiones/organizacion", element: <OrganizationPage /> },
          {
            path: "/gestiones/organizacion/empleados",
            element: (
              <EmployeesPage
                routeBase="/gestiones/organizacion/empleados"
              />
            ),
          },
          {
            path: "/gestiones/organizacion/empleados/nuevo",
            element: (
              <EmployeeFormPage
                basePath="/gestiones/organizacion/empleados"
              />
            ),
          },
          {
            path: "/gestiones/organizacion/empleados/:id",
            element: (
              <EmployeeFormPage
                basePath="/gestiones/organizacion/empleados"
              />
            ),
          },
          {
            path: "/gestiones/organizacion/empleados/:id/cargos",
            element: (
              <EmployeeHistoryPage
                basePath="/gestiones/organizacion/empleados"
              />
            ),
          },
          {
            path: "/gestiones/organizacion/empleados/:id/nucleo-familiar",
            element: (
              <EmployeeFamilyPage
                basePath="/gestiones/organizacion/empleados"
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
