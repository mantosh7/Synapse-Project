import { prisma } from '../config/db.js'
import { generateQueryEmbedding } from './embeddingService.js'
import Groq from 'groq-sdk'
import AppError from '../middlewares/AppError.js'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

const searchDocuments = async (query, userId) => {
  // generate embedding for the user's search query
  const queryEmbedding = await generateQueryEmbedding(query)

  // retrieve the most relevant document chunks using vector similarity search
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
    AND 1 - (e.embedding <=> ${JSON.stringify(queryEmbedding)}::vector) > 0.3
    ORDER BY similarity DESC
    LIMIT 5
  `

  // remove duplicate or highly overlapping chunks
  const uniqueChunks = similarChunks.filter((chunk, index, similarChunkArray) => {
    return index === similarChunkArray.findIndex(c => {
      return c.content.substring(0, 100) === chunk.content.substring(0, 100)
    })
  })

  // return early if no relevant information was found
  if (!uniqueChunks || uniqueChunks.length === 0) {
    return {
      answer: 'This information is not in your documents.',
      sources: []
    }
  }

  // combine retrieved chunks into a single context for the LLM
  const context = uniqueChunks
    .map((chunk, i) => `[Source ${i + 1} — ${chunk.file_name}]\n${chunk.content}`)
    .join('\n\n')

  // generate a grounded answer using only the retrieved context
  const response = await groq.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    temperature: 0,
    max_tokens: 1000,
    messages: [
      {
        role: 'system',
        content: `You are a helpful document assistant. Your job is to synthesize information from retrieved document chunks and provide a clear, coherent answer.

        STRICT RULES:
        1. Answer ONLY from the provided context — never use outside knowledge
        2. SYNTHESIZE information — do not copy chunks verbatim
        3. Write in your own words — coherent paragraphs, not bullet dumps
        4. If answer not found — say EXACTLY: "This information is not in your documents."
        5. NEVER hallucinate or make up examples
        6. Mention source only ONCE at the end — not after every sentence
        7. Keep answer concise and to the point
        8. Format your answer appropriately:
          - Use paragraphs for conceptual explanations
          - Use bullet points for lists, steps, or comparisons
          - Never use both unnecessarily`
      },
      {
        role: 'user',
        content: `Context: \n${context}\n\nQuestion: ${query}`
      }
    ]
  })

  const answer = response.choices[0].message.content

  // return the final answer along with source metadata for the UI
  return {
    answer,
    sources: uniqueChunks.map(chunk => ({
      fileName: chunk.file_name,
      content: chunk.content.substring(0, 200),
      similarity: parseFloat(chunk.similarity).toFixed(3)
    }))
  }
}

export { searchDocuments }