import AppError from '../middlewares/AppError.js'

const COHERE_API_KEY = process.env.COHERE_API_KEY

// shared helper to generate embeddings using Cohere API
const embed = async (text, inputType) => {
  const response = await fetch('https://api.cohere.com/v2/embed', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${COHERE_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'embed-english-v3.0',
      texts: [text],
      input_type: inputType,
      embedding_types: ['float']
    })
  })

  // handle API errors gracefully
  if (!response.ok) {
    const err = await response.json()
    throw new AppError(`Embedding failed: ${err.message}`, 500)
  }

  const data = await response.json()

  // return the embedding vector for the input text
  return data.embeddings.float[0]
}

// generate embeddings for document chunks before storing them
const generateEmbedding = async (text) => {
  return embed(text, 'search_document')
}

// generate embeddings for user search queries
const generateQueryEmbedding = async (text) => {
  return embed(text, 'search_query')
}

export { generateEmbedding, generateQueryEmbedding }