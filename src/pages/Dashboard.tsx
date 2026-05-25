import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <button className="btn btn-danger" style={{ width: 'auto', padding: '0.5rem 1rem' }} onClick={handleLogout}>
          Logout
        </button>
      </div>
      <div className="profile-card">
        <h2>Your Profile</h2>
        <div className="profile-item">
          <span className="label">ID</span>
          <span>{user?.id}</span>
        </div>
        <div className="profile-item">
          <span className="label">Email</span>
          <span>{user?.email}</span>
        </div>
        {user?.username && (
          <div className="profile-item">
            <span className="label">Username</span>
            <span>{user.username}</span>
          </div>
        )}
      </div>
    </div>
  )
}
