import { Router } from 'express'
import { search } from '../controllers/searchController.js'
import { protect } from '../middlewares/authMiddleware.js'

const router = Router()

// Protected — login required
router.post('/', protect, search)

export default router