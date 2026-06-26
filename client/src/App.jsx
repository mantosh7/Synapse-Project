import { Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Dashboard from './pages/Dashboard.jsx'
import AuthCallback from './pages/AuthCallback.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import GuestRoute from './components/GuestRoute.jsx'

const App = () => {
  return (
    <Routes>
      {/* Guest only — logged in user goes to dashboard */}
      <Route path='/' element={<Landing />} />
      <Route path='/login' element={<GuestRoute> <Login /> </GuestRoute>} />
      <Route path='/register' element={<GuestRoute> <Register /> </GuestRoute>} />

      {/* Protected — login required */}
      <Route path='/dashboard' element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

      {/* Auth callback — no protection needed */}
      <Route path='/auth/callback' element={<AuthCallback />} />
    </Routes>
  )
}

export default App