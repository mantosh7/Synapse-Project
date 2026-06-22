// split text into sentence-aware overlapping chunks for better retrieval
const chunkText = (text, maxWords = 300, overlapSentences = 2) => {
  // normalize whitespace and clean extracted text
  const cleanText = text
    .replace(/\s+/g, ' ')        // multiple spaces remove
    .replace(/\n+/g, ' ')        // newlines remove
    .trim()

  // split text into sentences while preserving sentence boundaries
  const sentences = cleanText.match(/[^.!?]+[.!?]+[\s]*/g) || [cleanText]

  const chunks = []
  let currentChunk = []
  let currentWordCount = 0

  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i].trim()
    const sentenceWordCount = sentence.split(' ').length

    // save the current chunk once it reaches the size limit
    if (currentWordCount + sentenceWordCount > maxWords && currentChunk.length > 0) {
      chunks.push({
        content: currentChunk.join(' '),
        chunkIndex: chunks.length
      })

      // preserve the last few sentences to maintain context continuity
      const overlapStart = Math.max(0, currentChunk.length - overlapSentences)
      currentChunk = currentChunk.slice(overlapStart)
      currentWordCount = currentChunk.join(' ').split(' ').length
    }

    currentChunk.push(sentence)
    currentWordCount += sentenceWordCount
  }

  // save any remaining content as the final chunk
  if (currentChunk.length > 0) {
    chunks.push({
      content: currentChunk.join(' '),
      chunkIndex: chunks.length
    })
  }

  return chunks
}

export { chunkText }