import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import api from '../services/api.js'

// If user is already logged in, redirect to dashboard
const GuestRoute = ({ children }) => {
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

  if (status === 'authenticated') {
    return <Navigate to='/dashboard' />
  }

  return children
}

export default GuestRoute