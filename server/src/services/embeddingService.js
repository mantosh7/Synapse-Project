import AppError from '../middlewares/AppError.js'

const COHERE_API_KEY = process.env.COHERE_API_KEY

// Convert text to vector using Cohere
const generateEmbedding = async (text) => {
  const response = await fetch('https://api.cohere.com/v2/embed', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${COHERE_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'embed-english-v3.0',
      texts: [text],
      input_type: 'search_document',
      embedding_types: ['float']
    })
  })

  if (!response.ok) {
    const err = await response.json()
    throw new AppError(`Embedding failed: ${err.message}`, 500)
  }

  const data = await response.json()
  return data.embeddings.float[0]
}

export { generateEmbedding }