import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api.js'

const AuthCallback = () => {
  const navigate = useNavigate()
  const [error, setError] = useState(null)

  useEffect(() => {
    const handleCallback = async () => {
      // Extract code from URL
      const params = new URLSearchParams(window.location.search)
      const code = params.get('code')

      if (!code) {
        setError('No authorization code found')
        return
      }

      try {
        // Send code to backend
        await api.post('/api/auth/google/callback', { code })
        navigate('/dashboard')
      } catch (err) {
        setError(err.response?.data?.message || 'Google login failed')
      }
    }

    handleCallback()
  }, [navigate])

  if (error) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50'>
        <div className='bg-white p-8 rounded-xl shadow-md text-center'>
          <p className='text-red-600 text-sm'>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50'>
      <div className='bg-white p-8 rounded-xl shadow-md text-center'>
        <p className='text-gray-600 text-sm'>Completing login...</p>
      </div>
    </div>
  )
}

export default AuthCallback