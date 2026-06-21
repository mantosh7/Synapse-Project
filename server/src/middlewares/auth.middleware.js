import jwt from 'jsonwebtoken'
import AppError from './AppError.js'

// Verify JWT token from cookie
const protect = async (req, res, next) => {
  try {
    // Read token from cookie instead of header
    const token = req.cookies?.token

    if (!token) {
      throw new AppError('Access denied. Please login.', 401)
    }

    // Verify and decode token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Attach user id to request
    req.user = { id: decoded.id }

    next()
  } catch (err) {
    next(err)
  }
}

export { protect }