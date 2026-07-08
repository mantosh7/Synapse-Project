import { prisma } from '../config/db.js'
import { generateEmbedding } from './embeddingService.js'
import { chunkText } from './chunkingService.js'
import { extractText } from 'unpdf'
import fs from 'fs'
import AppError from '../middlewares/AppError.js'

// Save web page content from Chrome Extension
const saveWebContent = async ({ title, content, url, userId }) => {

    // Validate page content
    if (!content || content.trim().length === 0) {
        throw new AppError('No content found on this page', 400)
    }

    // Create a document record
    const document = await prisma.document.create({
        data: {
            userId,
            fileName: title || 'Untitled Page',
            filePath: url,       // Store page URL
            fileSize: content.length,
            status: 'processing'
        }
    })

    // split text into chunks
    const chunks = chunkText(content)

    // for each chunk: save + generate embedding + store vector
    for (const chunk of chunks) {

        // Store chunk in database
        const savedChunk = await prisma.chunk.create({
            data: {
                docId: document.id,
                content: chunk.content,
                chunkIndex: chunk.chunkIndex
            }
        })

        // generate embedding for chunk
        const embedding = await generateEmbedding(chunk.content)

        // store embedding vector in pgvector table using raw SQL
        await prisma.$executeRaw`
        INSERT INTO embeddings (id, chunk_id, embedding)
        VALUES (gen_random_uuid(), ${savedChunk.id}, ${JSON.stringify(embedding)}::vector)
        `
    }

    // update document status to completed
    await prisma.document.update({
        where: { id: document.id },
        data: { status: 'completed' }
    })

    // Return upload summary
    return {
        id: document.id,
        fileName: document.fileName,
        totalChunks: chunks.length,
        status: 'completed'
    }
}

// upload and process PDF — full pipeline
const uploadDocument = async (file, userId) => {
    try {
        // extract text from PDF
        const pdfBuffer = fs.readFileSync(file.path)
        const { text } = await extractText(new Uint8Array(pdfBuffer))
        const extractedText = text.join(' ')

        if (!extractedText || extractedText.trim().length === 0) {
            throw new AppError('Could not extract text from PDF', 400)
        }

        // save document record in database
        const document = await prisma.document.create({
            data: {
                userId,
                fileName: file.originalname,
                filePath: file.path,
                fileSize: file.size,
                status: 'processing'
            }
        })

        // split text into chunks
        const chunks = chunkText(extractedText)

        // for each chunk: save + generate embedding + store vector
        for (const chunk of chunks) {
            const savedChunk = await prisma.chunk.create({
                data: {
                    docId: document.id,
                    content: chunk.content,
                    chunkIndex: chunk.chunkIndex
                }
            })

            // generate embedding for chunk
            const embedding = await generateEmbedding(chunk.content)

            // store embedding vector in pgvector table using raw SQL
            await prisma.$executeRaw`
            INSERT INTO embeddings (id, chunk_id, embedding)
            VALUES (gen_random_uuid(), ${savedChunk.id}, ${JSON.stringify(embedding)}::vector)
            `
        }

        // update document status to completed
        await prisma.document.update({
            where: { id: document.id },
            data: { status: 'completed' }
        })

        // Return upload summary
        return {
            id: document.id,
            fileName: document.fileName,
            totalChunks: chunks.length,
            status: 'completed'
        }
    } finally {
        //  delete uploaded file
        if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path)
        }
    }
}

// get all documents for a user
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

// delete a document and all its chunks + embeddings
const deleteDocument = async (documentId, userId) => {
    const document = await prisma.document.findUnique({
        where: { id: documentId }
    })

    if (!document) {
        throw new AppError('Document not found', 404)
    }

    if (document.userId !== userId) {
        throw new AppError('Not authorized', 403)
    }

    // cascade delete — chunks + embeddings automatically deleted
    await prisma.document.delete({
        where: { id: documentId }
    })

    return { message: 'Document deleted successfully' }
}

export { uploadDocument, getUserDocuments, deleteDocument, saveWebContent }