import { prisma } from '../config/db.js'
import { generateEmbedding } from './embeddingService.js'
import { chunkText } from './chunkingService.js'
import { extractText } from 'unpdf'
import fs from 'fs'
import AppError from '../middlewares/AppError.js'

// Upload and process PDF — full pipeline
const uploadDocument = async (file, userId) => {
    // Step 1 — Extract text from PDF
    const pdfBuffer = fs.readFileSync(file.path)
    const { text } = await extractText(new Uint8Array(pdfBuffer))
    const extractedText = text.join(' ')

    if (!extractedText || extractedText.trim().length === 0) {
        throw new AppError('Could not extract text from PDF', 400)
    }

    // Step 2 — Save document record in database
    const document = await prisma.document.create({
        data: {
            userId,
            fileName: file.originalname,
            filePath: file.path,
            fileSize: file.size,
            status: 'processing'
        }
    })

    // Step 3 — Split text into chunks
    const chunks = chunkText(extractedText)

    // Step 4 — For each chunk: save + generate embedding + store vector
    for (const chunk of chunks) {
        // Save chunk in database
        const savedChunk = await prisma.chunk.create({
            data: {
                docId: document.id,
                content: chunk.content,
                chunkIndex: chunk.chunkIndex
            }
        })

        // Generate embedding for chunk
        const embedding = await generateEmbedding(chunk.content)

        // Store embedding vector using raw SQL — pgvector
        await prisma.$executeRaw`
      INSERT INTO embeddings (id, chunk_id, embedding)
      VALUES (gen_random_uuid(), ${savedChunk.id}, ${JSON.stringify(embedding)}::vector)
    `
    }

    // Step 5 — Update document status to done
    await prisma.document.update({
        where: { id: document.id },
        data: { status: 'completed' }
    })

    // Clean up uploaded file from disk
    fs.unlinkSync(file.path)

    return {
        id: document.id,
        fileName: document.fileName,
        totalChunks: chunks.length,
        status: 'completed'
    }
}

// Get all documents for a user
const getUserDocuments = async (userId) => {
    const documents = await prisma.document.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            fileName: true,
            fileSize: true,
            status: true,
            createdAt: true,
            _count: {
                select: { chunks: true }
            }
        }
    })

    return documents
}

// Delete a document and all its chunks + embeddings
const deleteDocument = async (documentId, userId) => {
    const document = await prisma.document.findUnique({
        where: { id: documentId }
    })

    if (!document) {
        throw new AppError('Document not found', 404)
    }

    // Make sure user owns this document
    if (document.userId !== userId) {
        throw new AppError('Not authorized', 403)
    }

    // Cascade delete — chunks + embeddings automatically deleted
    await prisma.document.delete({
        where: { id: documentId }
    })

    return { message: 'Document deleted successfully' }
}

export { uploadDocument, getUserDocuments, deleteDocument }