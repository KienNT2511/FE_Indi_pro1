import { lazy } from 'react'
import type { RouteObject } from 'react-router-dom'
import PrivateRoute from '../components/layout/PrivateRoute/PrivateRoute'
import AppLayout from '../components/layout/AppLayout/AppLayout'

const Dashboard = lazy(() => import('../pages/dashboard/Dashboard/Dashboard'))
const ChangePassword = lazy(() => import('../pages/auth/ChangePassword/ChangePassword'))

export const privateRoutes: RouteObject[] = [
  {
    element: <PrivateRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: '/dashboard', element: <Dashboard /> },
          { path: '/change-password', element: <ChangePassword /> },
        ],
      },
    ],
  },
]
