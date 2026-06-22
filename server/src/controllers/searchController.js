import { searchDocuments, getSearchHistory, deleteSearchHistory } from '../services/searchService.js'

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

// Get search history
const getHistory = async (req, res, next) => {
  try {
    const history = await getSearchHistory(req.user.id)

    res.status(200).json({
      status: 'success',
      data: { history }
    })
  } catch (err) {
    next(err)
  }
}

// Delete history item
const deleteHistory = async (req, res, next) => {
  try {
    const result = await deleteSearchHistory(req.params.id, req.user.id)

    res.status(200).json({
      status: 'success',
      data: result
    })
  } catch (err) {
    next(err)
  }
}

export { search, getHistory, deleteHistory }