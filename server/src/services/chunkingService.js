// Split text into overlapping chunks for better search results
const chunkText = (text, chunkSize = 500, overlap = 50) => {
    // Clean text — remove extra whitespace
    const cleanText = text.replace(/\s+/g, ' ').trim()

    const words = cleanText.split(' ')
    const chunks = []
    let i = 0

    while (i < words.length) {
        // Take chunkSize words
        const chunkWords = words.slice(i, i + chunkSize)
        const chunkContent = chunkWords.join(' ')

        if (chunkContent.trim()) {
            chunks.push({
                content: chunkContent,
                chunkIndex: chunks.length
            })
        }

        // Move forward by chunkSize minus overlap
        // Overlap ensures context is not lost between chunks
        i += chunkSize - overlap
    }

    // console.log(chunks) ;
    return chunks
}

export { chunkText }