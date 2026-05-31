import { lazy } from 'react'
import type { RouteObject } from 'react-router-dom'
import PublicRoute from '../components/layout/PublicRoute/PublicRoute'

const Login = lazy(() => import('../pages/auth/Login/Login'))
const Register = lazy(() => import('../pages/auth/Register/Register'))

export const publicRoutes: RouteObject[] = [
  {
    element: <PublicRoute />,
    children: [
      { path: '/login', element: <Login /> },
      { path: '/register', element: <Register /> },
    ],
  },
]
