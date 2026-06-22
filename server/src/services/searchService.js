import { prisma } from '../config/db.js'
import { generateEmbedding } from './embeddingService.js'
import Groq from 'groq-sdk'
import AppError from '../middlewares/AppError.js'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

// Search documents using vector similarity and answer from retrieved content
const searchDocuments = async (query, userId) => {
    
    // generate embedding for user query
    const queryEmbedding = await generateEmbedding(query)

    // find similar chunks with similarity threshold
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
        AND 1 - (e.embedding <=> ${JSON.stringify(queryEmbedding)}::vector) > 0.4
        ORDER BY similarity DESC
        LIMIT 5
    `

    // if no relevant chunks found — return honest response
    if (!similarChunks || similarChunks.length === 0) {
        return {
            answer: 'This information is not in your documents.',
            sources: []
        }
    }

    // prepare context from chunks 
    const context = similarChunks
        .map((chunk, i) => `[Source ${i + 1} — ${chunk.file_name}]\n${chunk.content}`)
        .join('\n\n')

    // generate answer using Groq with strict prompt
    const response = await groq.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        temperature: 0, // deterministic — reduces hallucination
        max_tokens: 1000,
        messages: [
            {
                role: 'system',
                content: `You are a document assistant. Follow these rules strictly:
                        1. Answer ONLY from the provided context — nothing else
                        2. If the answer is not in the context, say EXACTLY: "This information is not in your documents."
                        3. NEVER add information from your training data
                        4. NEVER make up examples or explanations
                        5. Quote exact text from context when possible
                        6. Always mention which source you used`
            },
            {
                role: 'user',
                content: `Context:\n${context}\n\nQuestion: ${query}`
            }
        ]
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