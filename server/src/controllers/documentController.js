import { uploadDocument, getUserDocuments, deleteDocument } from '../services/documentService.js'

// Handle PDF upload
const upload = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                status: 'error',
                message: 'No file uploaded'
            })
        }

        const result = await uploadDocument(req.file, req.user.id)

        res.status(201).json({
            status: 'success',
            data: result
        })
    } catch (err) {
        next(err)
    }
}

// Get all documents for logged in user
const getDocuments = async (req, res, next) => {
    try {
        const documents = await getUserDocuments(req.user.id)

        res.status(200).json({
            status: 'success',
            data: { documents }
        })
    } catch (err) {
        next(err)
    }
}

// Delete a document
const remove = async (req, res, next) => {
    try {
        const result = await deleteDocument(req.params.id, req.user.id)

        res.status(200).json({
            status: 'success',
            data: result
        })
    } catch (err) {
        next(err)
    }
}

export { upload, getDocuments, remove }