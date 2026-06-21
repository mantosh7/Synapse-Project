import { Router } from 'express'
import { register, login, logout, getMe, googleCallback } from '../controllers/auth.controller.js'
import { protect } from '../middlewares/auth.middleware.js'

const router = Router()

router.post('/register', register)
router.post('/login', login)
router.post('/logout', logout)
router.post('/google/callback', googleCallback)
router.get('/me', protect, getMe)

export default router