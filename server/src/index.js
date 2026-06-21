import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

import { connectDB } from './config/db.js'
import errorHandler from './middlewares/errorHandler.js'
import authRoutes from './routes/auth.routes.js'


const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: join(__dirname, '../../../.env') })

const app = express()

// Middleware
app.use(cors({
  origin: 'http://localhost:5173', 
  credentials: true                
}))
app.use(express.json())
app.use(cookieParser())   

// auth route
app.use('/api/auth', authRoutes)

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