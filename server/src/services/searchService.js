import { prisma } from '../config/db.js'
import { generateEmbedding } from './embeddingService.js'
import Groq from 'groq-sdk'
import AppError from '../middlewares/AppError.js'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

// search relevant chunks and generate answer
const searchDocuments = async (query, userId) => {
    // generate embedding for user query
    const queryEmbedding = await generateEmbedding(query)

    // find similar chunks using pgvector cosine similarity
    const similarChunks = await prisma.$queryRaw`
    SELECT 
      c.id,
      c.content,
      c.doc_id,
      d.file_name,
      1 - (e.embedding <=> ${JSON.stringify(queryEmbedding)}::vector) AS similarity
    FROM chunks c
    JOIN embeddings e ON e.chunk_id = c.id
    JOIN documents d ON d.id = c.doc_id
    WHERE d.user_id = ${userId}
    ORDER BY e.embedding <=> ${JSON.stringify(queryEmbedding)}::vector
    LIMIT 5
  `

    if (!similarChunks || similarChunks.length === 0) {
        throw new AppError('No relevant documents found', 404)
    }

    // prepare context from chunks
    const context = similarChunks
        .map((chunk, i) => `[Source ${i + 1} — ${chunk.file_name}]\n${chunk.content}`)
        .join('\n\n')

    // generate answer using Groq LLM
    const response = await groq.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        messages: [
            {
                role: 'system',
                content: `You are a helpful assistant. Answer the user's question based ONLY on the provided context. 
                        If the answer is not in the context, say "I couldn't find relevant information in your documents."
                        Always mention which source you used.`
            },
            {
                role: 'user',
                content: `Context:\n${context}\n\nQuestion: ${query}`
            }
        ],
        temperature: 0.3,
        max_tokens: 1000
    })

    const answer = response.choices[0].message.content

    // return answer with sources
    return {
        answer,
        sources: similarChunks.map(chunk => ({
            fileName: chunk.file_name,
            content: chunk.content.substring(0, 200),
            similarity: parseFloat(chunk.similarity).toFixed(3)
        }))
    }
}

export { searchDocuments }