import { Suspense } from 'react'
import { Navigate, useRoutes } from 'react-router-dom'
import PageLoader from '../components/ui/PageLoader/PageLoader'
import { publicRoutes } from './publicRoutes'
import { privateRoutes } from './privateRoutes'

export default function AppRouter() {
  const element = useRoutes([
    ...publicRoutes,
    ...privateRoutes,
    { path: '*', element: <Navigate to="/login" replace /> },
  ])

  return (
    <Suspense fallback={<PageLoader />}>
      {element}
    </Suspense>
  )
}
