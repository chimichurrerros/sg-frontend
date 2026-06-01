import { createBrowserRouter, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/routes/guard/ProtectedRoute";
import { PublicRoute } from "@/routes/guard/PublicRoute";
import { LoginPage } from "@/pages/LoginPage";
import { HomePage } from "@/pages/HomePage";
import { RegisterPage } from "@/pages/RegisterPage";
import { HomeLayout } from "@/components/layouts/HomeLayout";
import ConfigurationsPage from "@/pages/ConfigurationsPage";
import AccountingDashboardPage from "@/pages/Accounting/AccountingDashboardPage";
import LibroDiarioPage from "@/pages/Accounting/LibroDiarioPage";
import LibroMayorPage from "@/pages/Accounting/LibroMayorPage";
import BalanceGeneralPage from "@/pages/Accounting/BalanceGeneralPage";
import BalanceSumasSaldosPage from "@/pages/Accounting/BalanceSumasSaldosPage";
import BalanceResultadosPage from "@/pages/Accounting/BalanceResultadosPage";
import BudgetsPage from "@/pages/Sales/Budgets/BudgetsPage";
import { AddProducts } from "@/pages/Catalog/AddProduct";
import { AddService } from "@/pages/Catalog/AddService";
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
import { AddSupplierPage } from "@/pages/Suppliers/AddSupplierPage";
import SupplierListPage from "@/pages/Suppliers/SupplierListPage";
import PurchaseOrderList from "@/pages/Purchases/PurchaseOrders/PurchaseOrderList";
import PurchaseOrderFormPage from "@/pages/Purchases/PurchaseOrders/PurchaseOrderFormPage";
import SaleListPage from "@/pages/Sales/SaleListPage";
import { CustomersListPage } from "@/pages/Customers/CustomersListPage";

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
          { path: "/customers", element: <CustomersListPage /> },

          { path: "/dash/catalogo", element: <CatalogPage /> },
          { path: "/dash/catalogo/nuevo-producto", element: <AddProducts /> },
          { path: "/dash/catalogo/productos/:id", element: <AddProducts /> },
          { path: "/dash/catalogo/nuevo-servicio", element: <AddService /> },
          { path: "/dash/catalogo/servicios/:id", element: <AddService /> },
          { path: "/dash/proveedores", element: <SupplierListPage /> },
          { path: "/dash/proveedores/nuevo", element: <AddSupplierPage /> },
          { path: "/dash/proveedores/:id", element: <AddSupplierPage /> },
          { path: "/ventas/presupuestos/crear", element: <BudgetSheetPage mode="create" /> },
          { path: "/sucursales", element: <BranchesListPage /> },
          { path: "/inventario", element: <StockListPage /> },
        ],
      },
    ],
  },
  { path: "*", element: <Navigate to="/login" replace /> },
]);
