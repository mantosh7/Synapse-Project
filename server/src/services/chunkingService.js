// Split text into overlapping chunks for better search results
const chunkText = (text, chunkSize = 300, overlap = 50) => {
    // Clean text — remove extra whitespace
    const cleanText = text.replace(/\s+/g, ' ').trim()

    const words = cleanText.split(' ')
    const chunks = []
    let i = 0

    while (i < words.length) {
        const chunkWords = words.slice(i, i + chunkSize)
        const chunkContent = chunkWords.join(' ')

        if (chunkContent.trim()) {
            chunks.push({
                content: chunkContent,
                chunkIndex: chunks.length
            })
        }
        
        // Overlap ensures context is not lost between chunks
        i += chunkSize - overlap
    }

    return chunks
}

export { chunkText }