import { createBrowserRouter, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/routes/guard/ProtectedRoute";
import { PublicRoute } from "@/routes/guard/PublicRoute";
import { RequirePermission } from "@/routes/guard/RequirePermission";
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

          /* ===== CONTABILIDAD ===== */
          {
            element: <RequirePermission permission="entries.view" />,
            children: [
              { path: "/contabilidad", element: <AccountingDashboardPage /> },
              { path: "/contabilidad/libro-diario", element: <LibroDiarioPage /> },
              { path: "/contabilidad/libro-mayor", element: <LibroMayorPage /> },
              { path: "/contabilidad/balance-general", element: <BalanceGeneralPage /> },
              { path: "/contabilidad/balance-sumas-saldos", element: <BalanceSumasSaldosPage /> },
              { path: "/contabilidad/balance-resultados", element: <BalanceResultadosPage /> },
              { path: "/contabilidad/plan-cuentas", element: <PlanCuentasPage /> },
              { path: "/contabilidad/nuevo-asiento", element: <NuevoAsientoPage /> },
            ],
          },

          /* ===== CONFIGURACIONES ===== */
          {
            element: <RequirePermission permission="roles.view" />,
            children: [
              { path: "/configuraciones", element: <ConfigurationsPage /> },
            ],
          },

          /* ===== VENTAS ===== */
          {
            element: <RequirePermission permission="salesOrders.view" />,
            children: [
              { path: "/ventas/listado", element: <SaleListPage /> },
              { path: "/ventas/listado/:id", element: <SaleSheetPage mode="view" /> },
            ],
          },
          {
            element: <RequirePermission permission="salesOrders.create" />,
            children: [
              { path: "/ventas/nueva", element: <SaleSheetPage mode="create" /> },
            ],
          },
          {
            element: <RequirePermission permission="customerQuotes.view" />,
            children: [
              { path: "/ventas/presupuestos", element: <BudgetsPage /> },
            ],
          },
          {
            element: <RequirePermission permission="customerQuotes.create" />,
            children: [
              { path: "/ventas/presupuestos/crear", element: <BudgetSheetPage mode="create" /> },
            ],
          },
          {
            element: <RequirePermission permission="customerQuotes.update" />,
            children: [
              { path: "/ventas/presupuestos/:id", element: <BudgetSheetPage mode="edit" /> },
            ],
          },
          {
            element: <RequirePermission permission="bills.view" />,
            children: [
              { path: "/ventas/facturas", element: <BillsListPage /> },
              { path: "/ventas/facturas/:id", element: <BillFormPage /> },
            ],
          },
          {
            element: <RequirePermission permission="bills.create" />,
            children: [
              { path: "/ventas/facturas/nueva", element: <BillFormPage /> },
            ],
          },
          {
            element: <RequirePermission permission="salesReturns.view" />,
            children: [
              { path: "/ventas/devoluciones", element: <ReturnsListPage /> },
              { path: "/ventas/devoluciones/:id", element: <ReturnSheetPage mode="view" /> },
            ],
          },
          {
            element: <RequirePermission permission="salesReturns.create" />,
            children: [
              { path: "/ventas/devoluciones/desde/:sale", element: <ReturnSheetPage mode="create" /> },
              { path: "/ventas/devoluciones/crear", element: <ReturnSheetPage mode="create" /> },
            ],
          },
          {
            element: <RequirePermission permission="creditNotes.view" />,
            children: [
              { path: "/ventas/notas-de-credito", element: <CreditNotesPage /> },
              { path: "/ventas/notas-de-credito/:id", element: <CreditNoteSheetPage /> },
            ],
          },

          /* ===== COMPRAS ===== */
          {
            element: <RequirePermission permission="purchaseRequests.view" />,
            children: [
              { path: "/compras/pedidos", element: <PurchaseRequestList /> },
              { path: "/compras/pedidos/:id", element: <PurchaseRequestView /> },
            ],
          },
          {
            element: <RequirePermission permission="purchaseRequests.create" />,
            children: [
              { path: "/compras/pedidos/nuevo", element: <PurchaseRequestCreate /> },
            ],
          },
          {
            element: <RequirePermission permission="requestForQuotations.view" />,
            children: [
              { path: "/compras/solicitudes-cotizacion", element: <RequestForQuotationList /> },
              { path: "/compras/solicitudes-cotizacion/:id", element: <RequestForQuotationView /> },
            ],
          },
          {
            element: <RequirePermission permission="supplierQuotes.view" />,
            children: [
              { path: "/compras/cotizaciones-proveedores", element: <SupplierQuotesList /> },
              { path: "/compras/cotizaciones-proveedores/:id", element: <SupplierQuoteSheet mode="edit" /> },
            ],
          },
          {
            element: <RequirePermission permission="supplierQuotes.create" />,
            children: [
              { path: "/compras/cotizaciones-proveedores/nueva", element: <SupplierQuoteSheet mode="create" /> },
            ],
          },
          {
            element: <RequirePermission permission="purchaseOrders.view" />,
            children: [
              { path: "/compras/ordenes-de-compra", element: <PurchaseOrderList /> },
            ],
          },
          {
            element: <RequirePermission permission="purchaseOrders.create" />,
            children: [
              { path: "/compras/ordenes-de-compra/nuevo", element: <PurchaseOrderFormPage /> },
            ],
          },
          {
            element: <RequirePermission permission="purchaseOrders.update" />,
            children: [
              { path: "/compras/ordenes-de-compra/:id", element: <PurchaseOrderFormPage /> },
            ],
          },
          {
            element: <RequirePermission permission="purchaseReceipts.view" />,
            children: [
              { path: "/compras/recepcion-ordenes-compra", element: <PurchaseReceiptWizard /> },
            ],
          },
          {
            element: <RequirePermission permission="purchaseOrderForSuppliers.view" />,
            children: [
              { path: "/compras/ordenes-por-proveedor", element: <PurchaseOrdersForSupplierList /> },
              { path: "/compras/ordenes-por-proveedor/:id", element: <PurchaseOrdersForSupplierView /> },
            ],
          },

          /* ===== TESORERIA ===== */
          {
            element: <RequirePermission permission="banks.view" />,
            children: [
              { path: "/tesoreria/bancos", element: <BanksPage /> },
              { path: "/tesoreria/bancos/:id", element: <BankView /> },
            ],
          },
          {
            element: <RequirePermission permission="banks.create" />,
            children: [
              { path: "/tesoreria/bancos/nuevo", element: <BankCreate /> },
            ],
          },
          {
            element: <RequirePermission permission="accounts.view" />,
            children: [
              { path: "/tesoreria/cuentas", element: <AccountsPage /> },
              { path: "/tesoreria/cuentas/:id", element: <AccountView /> },
            ],
          },
          {
            element: <RequirePermission permission="accounts.create" />,
            children: [
              { path: "/tesoreria/cuentas/nueva", element: <AccountCreate /> },
            ],
          },
          {
            element: <RequirePermission permission="bankMovements.view" />,
            children: [
              { path: "/tesoreria/movimientos", element: <MovementsPage /> },
              { path: "/tesoreria/movimientos/:id", element: <MovementView /> },
            ],
          },
          {
            element: <RequirePermission permission="bankMovements.create" />,
            children: [
              { path: "/tesoreria/movimientos/nueva", element: <MovementCreate /> },
            ],
          },
          {
            element: <RequirePermission permission="checks.view" />,
            children: [
              { path: "/tesoreria/cheques", element: <ChecksList /> },
              { path: "/tesoreria/cheques/:id", element: <CheckView /> },
            ],
          },

          /* ===== GESTIONES Y SEGURIDAD ===== */
          {
            element: <RequirePermission permission="users.view" />,
            children: [
              { path: "/register", element: <RegisterPage /> },
              { path: "/register/nuevo", element: <AddUserPage /> },
              { path: "/register/:id", element: <AddUserPage /> },
              { path: "/register/roles/:id/permisos", element: <RolePermissionsPage /> },
            ],
          },
          {
            element: <RequirePermission permission="customers.view" />,
            children: [
              { path: "/customers", element: <CustomersListPage /> },
            ],
          },
          {
            element: <RequirePermission permission="branches.view" />,
            children: [
              { path: "/sucursales", element: <BranchesListPage /> },
            ],
          },
          {
            element: <RequirePermission permission="suppliers.view" />,
            children: [
              { path: "/proveedores", element: <SupplierListPage /> },
              { path: "/proveedores/nuevo", element: <AddSupplierPage /> },
              { path: "/proveedores/:id", element: <AddSupplierPage /> },
            ],
          },
          {
            element: <RequirePermission permission="products.view" />,
            children: [
              { path: "/catalogo", element: <CatalogPage /> },
              { path: "/catalogo/nuevo-producto", element: <AddProducts /> },
              { path: "/catalogo/productos/:id", element: <AddProducts /> },
              { path: "/catalogo/nuevo-servicio", element: <AddService /> },
              { path: "/catalogo/servicios/:id", element: <AddService /> },
            ],
          },
          {
            element: <RequirePermission permission="stock.view" />,
            children: [
              { path: "/inventario", element: <StockListPage /> },
            ],
          },
          {
            element: <RequirePermission permission="organizations.view" />,
            children: [
              { path: "/gestiones/organizacion", element: <OrganizationPage /> },
              { path: "/gestiones/organizacion/areas/:id", element: <AreaDetailPage /> },
            ],
          },

          /* ===== EMPLEADOS ===== */
          {
            element: <RequirePermission permission="employees.view" />,
            children: [
              { path: "/rrhh/empleados", element: <EmployeesPage /> },
              { path: "/rrhh/empleados/:id/cargos", element: <EmployeeHistoryPage /> },
              { path: "/rrhh/empleados/:id/nucleo-familiar", element: <EmployeeFamilyPage /> },
              { path: "/gestiones/organizacion/empleados", element: <EmployeesPage routeBase="/gestiones/organizacion/empleados" /> },
              { path: "/gestiones/organizacion/empleados/:id/cargos", element: <EmployeeHistoryPage basePath="/gestiones/organizacion/empleados" /> },
              { path: "/gestiones/organizacion/empleados/:id/nucleo-familiar", element: <EmployeeFamilyPage basePath="/gestiones/organizacion/empleados" /> },
            ],
          },
          {
            element: <RequirePermission permission="employees.create" />,
            children: [
              { path: "/rrhh/empleados/nuevo", element: <EmployeeFormPage /> },
              { path: "/gestiones/organizacion/empleados/nuevo", element: <EmployeeFormPage basePath="/gestiones/organizacion/empleados" /> },
            ],
          },
          {
            element: <RequirePermission permission="employees.update" />,
            children: [
              { path: "/rrhh/empleados/:id", element: <EmployeeFormPage /> },
              { path: "/gestiones/organizacion/empleados/:id", element: <EmployeeFormPage basePath="/gestiones/organizacion/empleados" /> },
            ],
          },

          /* ===== RECURSOS HUMANOS (RRHH) ===== */
          { path: "/rrhh", element: <Navigate to="/rrhh/novedades" replace /> },
          {
            element: <RequirePermission permission="payrollUpdates.view" />,
            children: [
              { path: "/rrhh/novedades", element: <NovedadesPage /> },
            ],
          },
          {
            element: <RequirePermission permission="manualConcepts.view" />,
            children: [
              { path: "/rrhh/conceptos-manuales", element: <ConceptosManualesPage /> },
            ],
          },
          {
            element: <RequirePermission permission="payrollProcesses.view" />,
            children: [
              { path: "/rrhh/planillas", element: <PlanillasPage /> },
              { path: "/rrhh/planillas/:id", element: <PlanillaDetallePage /> },
            ],
          },
          {
            element: <RequirePermission permission="payrollProcesses.create" />,
            children: [
              { path: "/rrhh/planillas/nuevo", element: <CrearPlanillaPage /> },
            ],
          },
          {
            element: <RequirePermission permission="attendance.view" />,
            children: [
              { path: "/rrhh/asistencia", element: <AttendancePage /> },
            ],
          },
        ],
      },
    ],
  },
  { path: "*", element: <Navigate to="/login" replace /> },
]);
