import AppError from './AppError.js'

const errorHandler = (err, req, res, next) => {

  // complete error log on server
  console.error(
    `[${new Date().toISOString()}] ${req.method} ${req.path}`,
    err
  )

  // Custom AppError — expected errors
  // Examples: "Document not found", "Invalid credentials"
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message
    })
  }

  // PostgreSQL unique constraint violation
  if (err.code === '23505') {
    return res.status(409).json({
      status: 'error',
      message: 'This record already exists.'
    })
  }

  // PostgreSQL foreign key violation
  if (err.code === '23503') {
    return res.status(400).json({
      status: 'error',
      message: 'Referenced record does not exist.'
    })
  }

  // Multer file size error
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      status: 'error',
      message: 'File too large. Maximum size allowed is 10MB.'
    })
  }

  // Multer invalid file type
  if (err.code === 'INVALID_FILE_TYPE') {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid file type. Only PDFs are allowed.'
    })
  }

  // JWT invalid token
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid token. Please login again.'
    })
  }

  // JWT expired
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      status: 'error',
      message: 'Session expired. Please login again.'
    })
  }

  // Unexpected error — bug in code
  const isDev = process.env.NODE_ENV === 'development'

  return res.status(500).json({
    status: 'error',
    message: 'Something went wrong. Please try again.',
    
    ...(isDev && {
      detail: err.message,
      stack: err.stack
    })
  })
}

export default errorHandler