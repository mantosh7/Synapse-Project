import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../services/api.js'

const Register = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await api.post('/api/auth/register', formData)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  // Google OAuth — same flow as login
  const handleGoogleLogin = () => {
    const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth'
    const options = {
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      redirect_uri: import.meta.env.VITE_GOOGLE_REDIRECT_URI,
      response_type: 'code',
      scope: 'openid profile email',
      access_type: 'offline',
      prompt: 'consent'
    }
    const query = new URLSearchParams(options)
    window.location = `${rootUrl}?${query.toString()}`
  }

  return (
    <div className='min-h-screen bg-[#161616] px-12 py-4'>

      {/* Logo */}
      <div className="flex items-center cursor-pointer " onClick={() => navigate("/")}>
        <img src="/logos/logo.png" className="w-20 h-20 text-white" />
        <div className="">
          <p className="text-lg font-semibold text-white">
            Synapse
          </p>
          <p className="text-xs text-[#a8a8a8] mb-1">
            PDF Assistant
          </p>
        </div>
      </div>

      {/* form */}
      <div className='flex items-center justify-center min-h-[calc(100vh-60px)]'>
        <div className='w-full max-w-sm mb-12'>
          <h1 className='text-xl font-semibold text-white mb-1'>
            Create an account
          </h1>
          <p className='text-sm text-gray-400 mb-6'>
            Start searching your documents
          </p>

          {/* Error message */}
          {error && (
            <div className='bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg mb-4 text-sm'>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className='space-y-4'>
            <div>
              <label className='block text-sm text-gray-400 mb-1.5'>
                Name
              </label>
              <input
                type='text'
                name='name'
                value={formData.name}
                onChange={handleChange}
                required
                placeholder='Your name'
                className='w-full border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-teal-500 transition'
              />
            </div>

            <div>
              <label className='block text-sm text-gray-400 mb-1.5'>
                Email
              </label>
              <input
                type='email'
                name='email'
                value={formData.email}
                onChange={handleChange}
                required
                placeholder='you@example.com'
                className='w-full border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-teal-500 transition'
              />
            </div>

            <div>
              <label className='block text-sm text-gray-400 mb-1.5'>
                Password
              </label>
              <input
                type='password'
                name='password'
                value={formData.password}
                onChange={handleChange}
                required
                placeholder='••••••••'
                className='w-full border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-teal-500 transition'
              />
            </div>

            <button
              type='submit'
              disabled={loading}
              className='w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2.5 rounded-lg text-sm font-medium transition'
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          {/* Divider */}
          <div className='flex items-center gap-3 my-5'>
            <hr className='flex-1 border-gray-600' />
            <span className='text-xs text-gray-400'>or</span>
            <hr className='flex-1 border-gray-600' />
          </div>

          {/* Google login */}
          <button
            onClick={handleGoogleLogin}
            className='w-full hover:bg-[#1E1E1E] border border-gray-700 text-gray-300 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-2'
          >
            <img
              src='/logos/google.png'
              alt='Google'
              className='w-4 h-4'
            />
            Continue with Google
          </button>

          <p className='text-center text-sm text-gray-400 mt-6'>
            Already have an account?{' '}
            <Link to='/login' className='text-teal-400 hover:text-teal-300 transition'>
              Login
            </Link>
          </p>
        </div>

      </div>
    </div>
  )
}

export default Register