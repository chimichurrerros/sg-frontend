import { createBrowserRouter, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/routes/guard/ProtectedRoute";
import { PublicRoute } from "@/routes/guard/PublicRoute";
import { LoginPage } from "@/pages/LoginPage";
import { HomePage } from "@/pages/HomePage";
import { RegisterPage } from "@/pages/RegisterPage";
import { AddUserPage } from "@/pages/AddUserPage";
import { RolePermissionsPage } from "@/pages/RolePermissionsPage";
import { HomeLayout } from "@/components/layouts/HomeLayout";
import ConfigurationsPage from "@/pages/ConfigurationsPage";
import AccountingDashboardPage from "@/pages/Accounting/AccountingDashboardPage";
import LibroDiarioPage from "@/pages/Accounting/LibroDiarioPage";
import LibroMayorPage from "@/pages/Accounting/LibroMayorPage";
import BalanceGeneralPage from "@/pages/Accounting/BalanceGeneralPage";
import BalanceSumasSaldosPage from "@/pages/Accounting/BalanceSumasSaldosPage";
import BalanceResultadosPage from "@/pages/Accounting/BalanceResultadosPage";
import PlanCuentasPage from "@/pages/Accounting/PlanCuentasPage";
import NuevoAsientoPage from "@/pages/Accounting/NuevoAsientoPage";
import BudgetsPage from "@/pages/Sales/Budgets/BudgetsPage";
import { AddProducts } from "@/pages/Catalog/AddProduct";
import { AddService } from "@/pages/Catalog/AddService";
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
import RequestForQuotationList from "@/pages/Purchases/RequestForQuotation/RequestForQuotationList";
import RequestForQuotationView from "@/pages/Purchases/RequestForQuotation/RequestForQuotationView";
import SupplierQuoteSheet from "@/pages/Purchases/SupplierQuotes/SupplierQuoteSheet";
import PurchaseOrdersForSupplierList from "@/pages/Purchases/PurchaseOrdersForSupplier/PurchaseOrdersForSupplierList";
import PurchaseOrdersForSupplierView from "@/pages/Purchases/PurchaseOrdersForSupplier/PurchaseOrdersForSupplierView";
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
import AreaDetailPage from "@/pages/Organization/AreaDetailPage";
import { AddSupplierPage } from "@/pages/Suppliers/AddSupplierPage";
import SupplierListPage from "@/pages/Suppliers/SupplierListPage";
import PurchaseOrderList from "@/pages/Purchases/PurchaseOrders/PurchaseOrderList";
import PurchaseOrderFormPage from "@/pages/Purchases/PurchaseOrders/PurchaseOrderFormPage";
import { CustomersListPage } from "@/pages/Customers/CustomersListPage";
import ReturnsListPage from "@/pages/Sales/Returns/ReturnsListPage";
import ReturnSheetPage from "@/pages/Sales/Returns/ReturnSheetPage";
import CreditNotesPage from "@/pages/Sales/CreditNotes/CreditNotesListPage";
import CreditNoteSheetPage from "@/pages/Sales/CreditNotes/CreditNoteSheetPage";

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
          { path: "/dash/contabilidad", element: <AccountingDashboardPage /> },
          { path: "/dash/contabilidad/libro-diario", element: <LibroDiarioPage /> },
          { path: "/dash/contabilidad/libro-mayor", element: <LibroMayorPage /> },
          { path: "/dash/contabilidad/balance-general", element: <BalanceGeneralPage /> },
          { path: "/dash/contabilidad/balance-sumas-saldos", element: <BalanceSumasSaldosPage /> },
          { path: "/dash/contabilidad/balance-resultados", element: <BalanceResultadosPage /> },
          { path: "/dash/contabilidad/plan-cuentas", element: <PlanCuentasPage /> },
          { path: "/dash/contabilidad/nuevo-asiento", element: <NuevoAsientoPage /> },
          { path: "/configuraciones", element: <ConfigurationsPage /> },

          /* ===== VENTAS ===== */
          { path: "/ventas", element: <SaleListPage /> },
          { path: "/ventas/nueva", element: <SaleSheetPage mode="create" /> },
          { path: "/ventas/:id", element: <SaleSheetPage mode="view" /> },
          { path: "/ventas/presupuestos", element: <BudgetsPage /> },
          { path: "/ventas/presupuestos/crear", element: <BudgetSheetPage mode="create" /> },
          { path: "/ventas/presupuestos/:id", element: <BudgetSheetPage mode="edit" /> },
          { path: "/ventas/facturas", element: <BillsListPage /> },
          { path: "/ventas/facturas/nueva", element: <BillFormPage /> },
          { path: "/ventas/facturas/:id", element: <BillFormPage /> },
          {path: "/ventas/devoluciones", element: <ReturnsListPage /> },
          {path: "/ventas/devoluciones/:id", element: <ReturnSheetPage mode="view" /> },
          {path: "/ventas/devoluciones/desde/:sale", element: <ReturnSheetPage mode="create" /> },
          {path: "/ventas/devoluciones/crear", element: <ReturnSheetPage mode="create" /> },
          {path: "/ventas/notas-de-credito", element: <CreditNotesPage/> },
          {path: "/ventas/notas-de-credito/:id", element: <CreditNoteSheetPage/> },

          /* ===== COMPRAS ===== */
          { path: "/compras/pedidos", element: <PurchaseRequestList /> },
          { path: "/compras/pedidos/nuevo", element: <PurchaseRequestCreate /> },
          { path: "/compras/pedidos/:id", element: <PurchaseRequestView /> },
          { path: "/compras/solicitudes-cotizacion", element: <RequestForQuotationList /> },
          { path: "/compras/solicitudes-cotizacion/:id", element: <RequestForQuotationView /> },
          { path: "/compras/cotizaciones-proveedores", element: <SupplierQuotesList /> },
          { path: "/compras/cotizaciones-proveedores/nueva", element: <SupplierQuoteSheet mode="create" /> },
          { path: "/compras/cotizaciones-proveedores/:id", element: <SupplierQuoteSheet mode="edit" /> },
          { path: "/compras/ordenes-de-compra", element: <PurchaseOrderList /> },
          { path: "/compras/ordenes-de-compra/nuevo", element: <PurchaseOrderFormPage /> },
          { path: "/compras/ordenes-de-compra/:id", element: <PurchaseOrderFormPage /> },
          { path: "/compras/recepcion-ordenes-compra", element: <PurchaseReceiptWizard /> },
          { path: "/compras/ordenes-por-proveedor", element: <PurchaseOrdersForSupplierList /> },
          { path: "/compras/ordenes-por-proveedor/:id", element: <PurchaseOrdersForSupplierView /> },

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
          { path: "/register/nuevo", element: <AddUserPage /> },
          { path: "/register/:id", element: <AddUserPage /> },
          { path: "/register/roles/:id/permisos", element: <RolePermissionsPage /> },
          { path: "/customers", element: <CustomersListPage /> },

          { path: "/dash/catalogo", element: <CatalogPage /> },
          { path: "/dash/catalogo/nuevo-producto", element: <AddProducts /> },
          { path: "/dash/catalogo/productos/:id", element: <AddProducts /> },
          { path: "/dash/catalogo/nuevo-servicio", element: <AddService /> },
          { path: "/dash/catalogo/servicios/:id", element: <AddService /> },
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
          { path: "/gestiones/organizacion/areas/:id", element: <AreaDetailPage /> },
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
          { path: "/sucursales", element: <BranchesListPage /> },
          { path: "/inventario", element: <StockListPage /> },
        ],
      },
    ],
  },
  { path: "*", element: <Navigate to="/login" replace /> },
]);
