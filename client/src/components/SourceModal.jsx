import { useState } from 'react'

const SourceModal = ({ sources }) => {
  const [expandedIndex, setExpandedIndex] = useState(null)

  if (sources.length === 0) return null

  return (
    <div className='bg-[#2a2a2a] rounded-xl border border-[#383838] p-5'>
      <p className='text-xs text-gray-500 font-medium uppercase tracking-wide mb-3'>
        Sources
      </p>
      <div className='flex flex-col gap-2'>
        {sources.map((source, i) => (
          <div
            key={i}
            className='border border-[#383838] rounded-lg p-3 cursor-pointer hover:border-teal-600 transition'
            onClick={() => setExpandedIndex(expandedIndex === i ? null : i)}
          >
            <div className='flex items-center justify-between mb-1'>
              <p className='text-xs font-medium text-teal-400 truncate'>
                {source.fileName}
              </p>
              <div className='flex items-center gap-2 shrink-0 ml-3'>
                <span className='text-xs text-[#d4d4d4]'>
                  {Math.round(source.similarity * 100)}% match
                </span>
                <span className='text-xs text-gray-500'>
                  {expandedIndex === i ? '▲' : '▼'}
                </span>
              </div>
            </div>

            {/* Preview */}
            <p className='text-xs text-[#a0a0a0] leading-relaxed'>
              {source.content.substring(0, 150)}...
            </p>

            {/* Full content */}
            {expandedIndex === i && (
              <div className='mt-3 pt-3 border-t border-[#383838]'>
                <p className='text-xs text-[#d4d4d4] leading-relaxed whitespace-pre-wrap'>
                  {source.content}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default SourceModal