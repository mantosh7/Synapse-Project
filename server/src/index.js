import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { connectDB } from './config/db.js'
import errorHandler from './middlewares/errorHandler.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: join(__dirname, '../../../.env') })

const app = express()

app.use(cors())
app.use(express.json())
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