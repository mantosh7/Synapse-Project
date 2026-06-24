import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

import { connectDB } from './config/db.js'
import errorHandler from './middlewares/errorHandler.js'
import authRoutes from './routes/authRoutes.js'
import documentRoutes from './routes/documentRoutes.js'
import searchRoutes from './routes/searchRoutes.js'


const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: join(__dirname, '../../../.env') })

const app = express()

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigin = process.env.CLIENT_URL?.replace(/\/$/, '')
    if (!origin || origin.replace(/\/$/, '') === allowedOrigin) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true
}))
app.use(express.json())
app.use(cookieParser())

// auth route
app.use('/api/auth', authRoutes)

// routes
app.use('/api/documents', documentRoutes)
app.use('/api/search', searchRoutes)

// error handler
app.use(errorHandler)

app.get('/', (req, res) => {
  res.json({ message: 'Synapse API running ✓' })
})

const start = async () => {
  await connectDB()
  const PORT = process.env.PORT || 5000
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
}

start()