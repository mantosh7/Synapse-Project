import { useState } from 'react'

const Sidebar = ({ documents, uploading, error, history, showHistory, onUpload, onDelete, onDeleteHistory, onToggleHistory, onHistoryClick, }) => {

    return (
        <aside className='w-64 bg-[#212121] border-r border-[#383838] flex flex-col overflow-y-auto'>

            {/* Upload */}
            <div className='p-4 border-b border-[#383838]'>
                <label className={`
                            block w-full text-center py-2 px-4 rounded-lg border border-dashed
                            border-[#383838] text-sm text-gray-300 cursor-pointer
                            hover:border-[#4a4a4a] hover:text-gray-200 transition
                            ${uploading ? 'opacity-50 pointer-events-none' : ''}
                        `}>
                    <input
                        type='file'
                        accept='.pdf'
                        onChange={onUpload}
                        className='hidden'
                    />
                    {uploading ? 'Uploading...' : '📄 Upload PDF'}
                </label>

                {error && (
                    <p className='text-xs text-red-400 mt-2'>{error}</p>
                )}
            </div>

            {/* Documents */}
            <div className='p-4 flex-1'>
                <p className='text-xs text-[#a0a0a0] font-medium uppercase tracking-wide mb-3'>
                    Documents
                </p>

                {documents.length === 0 ? (
                    <p className='text-xs text-[#666666] text-center mt-6'>
                        No documents yet
                    </p>
                ) : (
                    <div className='flex flex-col gap-2'>
                        {documents.map(doc => (
                            <div
                                key={doc.id}
                                className='flex items-start justify-between gap-2 p-2.5 rounded-lg hover:bg-[#333333] transition group'
                            >
                                <div className='flex-1 min-w-0'>
                                    <p className='text-xs text-[#d4d4d4] truncate font-medium'>
                                        {doc.fileName}
                                    </p>
                                    <p className='text-xs text-[#8a8a8a] mt-0.5'>
                                        {doc._count.chunks} chunks
                                    </p>
                                </div>
                                <button
                                    onClick={() => onDelete(doc.id)}
                                    className='text-[#666666] hover:text-red-400 transition text-xs opacity-0 group-hover:opacity-100'
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Search History */}
            <div className='p-4 border-t border-[#383838]'>
                <button
                    onClick={onToggleHistory}
                    className='flex items-center justify-between w-full text-xs text-[#a0a0a0] font-medium uppercase tracking-wide mb-3 hover:text-[#e8e8e8] transition-colors'
                >
                    <span>History</span>
                    <span>{showHistory ? '▲' : '▼'}</span>
                </button>

                {showHistory && (
                    <div className='flex flex-col gap-1'>
                        {history.length === 0 ? (
                            <p className='text-xs text-gray-600 text-center py-2'>
                                No history yet
                            </p>
                        ) : (
                            history.map(item => (
                                <div
                                    key={item.id}
                                    onClick={() => { onHistoryClick(item) }}
                                    className='flex items-center justify-between gap-2 px-2 py-1.5 rounded-md cursor-pointer hover:bg-[#333333] transition group'
                                >
                                    <p className='text-xs text-gray-300 truncate flex-1'>
                                        {item.query}
                                    </p>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            onDeleteHistory(item.id)
                                        }}
                                        className='text-gray-600 hover:text-red-400 transition text-xs opacity-0 group-hover:opacity-100'
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </aside>
    )
}

export default Sidebar