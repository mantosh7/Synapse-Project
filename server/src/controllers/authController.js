import { registerUser, loginUser, getUserById, googleLogin } from '../services/authService.js'

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000
}

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body
    const { token, user } = await registerUser({ name, email, password })
    res.cookie('token', token, cookieOptions)
    res.status(201).json({ status: 'success', data: { user } })
  } catch (err) {
    next(err)
  }
}

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body
    const { token, user } = await loginUser({ email, password })
    res.cookie('token', token, cookieOptions)
    res.status(200).json({ status: 'success', data: { user } })
  } catch (err) {
    next(err)
  }
}

const logout = async (req, res, next) => {
  try {
    res.clearCookie('token', cookieOptions)
    res.status(200).json({ status: 'success', message: 'Logged out successfully' })
  } catch (err) {
    next(err)
  }
}

const getMe = async (req, res, next) => {
  try {
    const user = await getUserById(req.user.id)
    res.status(200).json({ status: 'success', data: { user } })
  } catch (err) {
    next(err)
  }
}

const googleCallback = async (req, res, next) => {
  try {
    const { code } = req.body
    const { token, user } = await googleLogin(code)
    res.cookie('token', token, cookieOptions)
    res.status(200).json({ status: 'success', data: { user } })
  } catch (err) {
    next(err)
  }
}

export { register, login, logout, getMe, googleCallback }