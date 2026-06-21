import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api.js'

const Dashboard = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get('/api/auth/me')
        setUser(res.data.data.user)
      } catch (err) {
        // Token invalid — redirect to login
        navigate('/')
      }
    }

    fetchUser()
  }, [navigate])

  const handleLogout = async () => {
    await api.post('/api/auth/logout')
    navigate('/')
  }

  if (!user) return (
    <div className='min-h-screen flex items-center justify-center'>
      <p className='text-gray-500 text-sm'>Loading...</p>
    </div>
  )

  return (
    <div className='min-h-screen bg-gray-50 p-8'>
      <div className='max-w-2xl mx-auto bg-white rounded-xl shadow-md p-6'>
        <div className='flex items-center justify-between mb-6'>
          <div className='flex items-center gap-3'>
            {user.avatar && (
              <img
                src={user.avatar}
                alt={user.name}
                className='w-10 h-10 rounded-full'
              />
            )}
            <div>
              <h1 className='text-lg font-semibold text-gray-800'>
                {user.name}
              </h1>
              <p className='text-sm text-gray-500'>{user.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className='text-sm text-red-500 hover:underline'
          >
            Logout
          </button>
        </div>
        <p className='text-gray-500 text-sm'>
          Dashboard coming soon — PDF upload aur search yahan hoga!
        </p>
      </div>
    </div>
  )
}

export default Dashboard