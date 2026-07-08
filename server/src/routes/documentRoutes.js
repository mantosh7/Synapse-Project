import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import { upload, getDocuments, remove, saveWeb } from '../controllers/documentController.js'
import { protect } from '../middlewares/authMiddleware.js'

// Multer config — where to save files
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/')
    },
    filename: (req, file, cb) => {
        // Unique filename — timestamp + original name
        const uniqueName = `${Date.now()}-${file.originalname}`
        cb(null, uniqueName)
    }
})

// Only allow PDF files
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true)
    } else {
        const err = new Error('Invalid file type')
        err.code = 'INVALID_FILE_TYPE'
        cb(err, false)
    }
}

const uploadMiddleware = multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
})

const router = Router()

// All routes protected — login required
router.use(protect)

// Web content save — from extension
router.post('/web', saveWeb)

router.post('/', uploadMiddleware.single('pdf'), upload)
router.get('/', getDocuments)
router.delete('/:id', remove)


export default router