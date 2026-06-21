import { searchDocuments } from '../services/searchService.js'

// Handle search query
const search = async (req, res, next) => {
  try {
    const { query } = req.body

    if (!query || query.trim().length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Query is required'
      })
    }

    const result = await searchDocuments(query, req.user.id)

    res.status(200).json({
      status: 'success',
      data: result
    })
  } catch (err) {
    next(err)
  }
}

export { search }