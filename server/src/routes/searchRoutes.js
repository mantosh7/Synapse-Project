import { Router } from 'express'
import { search, getHistory, deleteHistory } from '../controllers/searchController.js'
import { protect } from '../middlewares/authMiddleware.js'

const router = Router()

// Protected - login required
router.use(protect)

router.post('/', search)
router.get('/history', getHistory)
router.delete('/history/:id', deleteHistory)

export default router