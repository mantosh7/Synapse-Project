import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import api from '../services/api.js'

// Checks if user is logged in before showing the page
const ProtectedRoute = ({ children }) => {
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    const check = async () => {
      try {
        await api.get('/api/auth/me')
        setStatus('authenticated')
      } catch {
        setStatus('unauthenticated')
      }
    }
    check()
  }, [])

  if (status === 'loading') {
    return (
      <div className='min-h-screen bg-gray-900 flex items-center justify-center'>
        <p className='text-gray-400 text-sm'>Loading...</p>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return <Navigate to='/login' />
  }

  return children
}

export default ProtectedRoute