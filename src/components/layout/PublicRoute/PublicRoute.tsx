import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import PageLoader from '../../ui/PageLoader/PageLoader'

export default function PublicRoute() {
  const { user, loading } = useAuth()
  if (loading) return <PageLoader />
  if (user) return <Navigate to="/dashboard" replace />
  return <Outlet />
}
