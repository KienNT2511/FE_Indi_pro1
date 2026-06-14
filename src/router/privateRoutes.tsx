import { lazy } from 'react'
import type { RouteObject } from 'react-router-dom'
import PrivateRoute from '../components/layout/PrivateRoute/PrivateRoute'
import AppLayout from '../components/layout/AppLayout/AppLayout'

const Dashboard = lazy(() => import('../pages/dashboard/Dashboard/Dashboard'))
const Products = lazy(() => import('../pages/products/Products/Products'))
const Customers = lazy(() => import('../pages/customers/Customers/Customers'))
const Orders = lazy(() => import('../pages/orders/Orders/Orders'))
const Account = lazy(() => import('../pages/account/Account/Account'))
const ChangePassword = lazy(() => import('../pages/auth/ChangePassword/ChangePassword'))

// Kho vận (Module 4)
const Stock = lazy(() => import('../pages/inventory/Stock/Stock'))
const LowStock = lazy(() => import('../pages/inventory/LowStock/LowStock'))
const Movements = lazy(() => import('../pages/inventory/Movements/Movements'))
const Warehouses = lazy(() => import('../pages/inventory/Warehouses/Warehouses'))
const Batches = lazy(() => import('../pages/inventory/Batches/Batches'))
const StockDocs = lazy(() => import('../pages/inventory/StockDocs/StockDocs'))

// Mua hàng (Module 2)
const Suppliers = lazy(() => import('../pages/purchasing/Suppliers/Suppliers'))
const PurchaseRequests = lazy(() => import('../pages/purchasing/PurchaseRequests/PurchaseRequests'))
const PurchaseOrders = lazy(() => import('../pages/purchasing/PurchaseOrders/PurchaseOrders'))
const SupplierDebts = lazy(() => import('../pages/purchasing/SupplierDebts/SupplierDebts'))

// Bán hàng (Module 3)
const Quotations = lazy(() => import('../pages/sales/Quotations/Quotations'))
const Deliveries = lazy(() => import('../pages/sales/Deliveries/Deliveries'))
const Receivables = lazy(() => import('../pages/sales/Receivables/Receivables'))
const CRM = lazy(() => import('../pages/sales/CRM/CRM'))

// Sản xuất (Module 1)
const BOMs = lazy(() => import('../pages/production/BOMs/BOMs'))
const ProductionOrders = lazy(() => import('../pages/production/ProductionOrders/ProductionOrders'))

// Tài chính - Kế toán (Module 5)
const FinanceReports = lazy(() => import('../pages/finance/Reports/Reports'))
const FinanceTransactions = lazy(() => import('../pages/finance/Transactions/Transactions'))
const FinanceDebts = lazy(() => import('../pages/finance/Debts/Debts'))
const FinanceAccounts = lazy(() => import('../pages/finance/Accounts/Accounts'))

export const privateRoutes: RouteObject[] = [
  {
    element: <PrivateRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: '/dashboard', element: <Dashboard /> },
          { path: '/products', element: <Products /> },
          { path: '/customers', element: <Customers /> },
          { path: '/orders', element: <Orders /> },
          { path: '/inventory/stock', element: <Stock /> },
          { path: '/inventory/low-stock', element: <LowStock /> },
          { path: '/inventory/movements', element: <Movements /> },
          { path: '/inventory/warehouses', element: <Warehouses /> },
          { path: '/inventory/batches', element: <Batches /> },
          { path: '/inventory/receipts', element: <StockDocs docType="receipt" /> },
          { path: '/inventory/issues', element: <StockDocs docType="issue" /> },
          { path: '/inventory/transfers', element: <StockDocs docType="transfer" /> },
          { path: '/inventory/counts', element: <StockDocs docType="count" /> },
          { path: '/purchasing/suppliers', element: <Suppliers /> },
          { path: '/purchasing/requests', element: <PurchaseRequests /> },
          { path: '/purchasing/orders', element: <PurchaseOrders /> },
          { path: '/purchasing/debts', element: <SupplierDebts /> },
          { path: '/sales/quotations', element: <Quotations /> },
          { path: '/sales/deliveries', element: <Deliveries /> },
          { path: '/sales/receivables', element: <Receivables /> },
          { path: '/sales/crm', element: <CRM /> },
          { path: '/production/boms', element: <BOMs /> },
          { path: '/production/orders', element: <ProductionOrders /> },
          { path: '/finance/reports', element: <FinanceReports /> },
          { path: '/finance/transactions', element: <FinanceTransactions /> },
          { path: '/finance/debts', element: <FinanceDebts /> },
          { path: '/finance/accounts', element: <FinanceAccounts /> },
          { path: '/account', element: <Account /> },
          { path: '/change-password', element: <ChangePassword /> },
        ],
      },
    ],
  },
]
