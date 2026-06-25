import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, Network } from 'lucide-react'
import AnswerRenderer from '../components/AnswerRenderer'
import api from '../services/api.js'

const Dashboard = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [documents, setDocuments] = useState([])
  const [query, setQuery] = useState('')
  const [answer, setAnswer] = useState(null)
  const [sources, setSources] = useState([])
  const [uploading, setUploading] = useState(false)
  const [searching, setSearching] = useState(false)
  const [history, setHistory] = useState([])
  const [showHistory, setShowHistory] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const init = async () => {
      try {
        const userRes = await api.get('/api/auth/me')
        setUser(userRes.data.data.user)
        const docsRes = await api.get('/api/documents')
        setDocuments(docsRes.data.data.documents)
        const historyRes = await api.get('/api/search/history')
        setHistory(historyRes.data.data.history)
      } catch (err) {
        navigate('/')
      }
    }
    init()
  }, [navigate])

  const handleUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    setError(null)
    try {
      const formData = new FormData()
      formData.append('pdf', file)
      await api.post('/api/documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      const docsRes = await api.get('/api/documents')
      setDocuments(docsRes.data.data.documents)
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const handleDelete = async (docId) => {
    try {
      await api.delete(`/api/documents/${docId}`)
      setDocuments(documents.filter(d => d.id !== docId))
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed')
    }
  }

  const handleDeleteHistory = async (historyId) => {
    try {
      await api.delete(`/api/search/history/${historyId}`)
      setHistory(history.filter(h => h.id !== historyId))
    } catch (err) {
      console.error('Delete history failed')
    }
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!query.trim()) return
    setSearching(true)
    setAnswer(null)
    setSources([])
    setError(null)
    try {
      const res = await api.post('/api/search', { query })
      setAnswer(res.data.data.answer)
      setSources(res.data.data.sources)
      const historyRes = await api.get('/api/search/history')
      setHistory(historyRes.data.data.history)
    } catch (err) {
      setError(err.response?.data?.message || 'Search failed')
    } finally {
      setSearching(false)
    }
  }

  const handleLogout = async () => {
    await api.post('/api/auth/logout')
    navigate('/')
  }

  if (!user) return (
    <div className='min-h-screen flex items-center justify-center bg-gray-900'>
      <p className='text-gray-400 text-sm'>Loading...</p>
    </div>
  )

  return (
    <div className='min-h-screen bg-[#1a1a1a] text-[#e8e8e8] flex flex-col'>

      {/* Navbar */}
      <nav className='bg-[#212121] border-b border-[#383838] px-6 py-4 flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <div className="w-10 h-10 bg-[#0d9488] rounded-lg flex items-center justify-center">
            <Network className="w-5 h-5 text-white" />
          </div>
          <span className='text-white font-semibold text-base'>Synapse</span>
        </div>

        <div className='flex items-center gap-4 mr-8'>
          {user.avatar
            ? <img src={user.avatar} alt={user.name} className='w-8 h-8 rounded-full' />
            : (
              <div className='w-8 h-8 bg-[#0d9488] rounded-full flex items-center justify-center text-white text-sm font-medium'>
                {user.name.charAt(0).toUpperCase()}
              </div>
            )
          }
          <span className='text-sm font-medium text-[#e2e2e2]'>{user.name}</span>
          <button
            onClick={handleLogout}
            className='text-sm font-medium text-white hover:text-red-400 transition-colors duration-200'
          >
            Logout
          </button>
        </div>
      </nav>

      <div className='flex flex-1 overflow-hidden'>

        {/* Sidebar */}
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
                onChange={handleUpload}
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
                      onClick={() => handleDelete(doc.id)}
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
              onClick={() => setShowHistory(!showHistory)}
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
                      onClick={() => {
                        setQuery(item.query)
                        setAnswer(item.answer)
                        setSources([])
                      }}
                      className='flex items-center justify-between gap-2 px-2 py-1.5 rounded-md cursor-pointer hover:bg-[#333333] transition group'
                    >
                      <p className='text-xs text-gray-300 truncate flex-1'>
                        {item.query}
                      </p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteHistory(item.id)
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

        {/* Main */}
        <main className='flex-1 flex flex-col overflow-hidden mr-32 ml-32'>

          {/* Search Bar */}
          <div className='px-2 py-8 border-b border-[#303030]'>
            <form onSubmit={handleSearch} className='flex gap-3'>
              <input
                type='text'
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder='Ask anything from your documents...'
                className='flex-1 border border-[#383838] rounded-lg px-4 py-2.5 text-sm text-[#e8e8e8] placeholder-[#666666] focus:outline-none focus:border-[#0d9488] transition'
              />
              <button
                type='submit'
                disabled={searching || !query.trim()}
                className='bg-[#0d9488] hover:bg-[#0f766e] disabled:opacity-60 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-lg text-sm font-medium transition'
              >
                {searching ? 'Searching...' : 'Search'}
              </button>
            </form>
          </div>

          {/* Results */}
          <div className='flex-1 overflow-y-auto p-6 flex flex-col gap-5'>

            {/* Answer */}
            {answer && (
              <div className='bg-[#222222] rounded-xl border border-[#383838] p-5'>
                <p className='text-xs text-[#a0a0a0] font-medium uppercase tracking-wide mb-3'>
                  Answer
                </p>
                <AnswerRenderer content={answer} />
              </div>
            )}

            {/* Sources */}
            {sources.length > 0 && (
              <div className='bg-[#2a2a2a] rounded-xl border border-[#383838] p-5'>
                <p className='text-xs text-gray-500 font-medium uppercase tracking-wide mb-3'>
                  Sources
                </p>
                <div className='flex flex-col gap-2'>
                  {sources.map((source, i) => (
                    <div
                      key={i}
                      className='border border-[#383838] rounded-lg p-3'
                    >
                      <div className='flex items-center justify-between mb-1'>
                        <p className='text-xs font-medium text-teal-400 truncate'>
                          {source.fileName}
                        </p>
                        <span className='text-xs text-[#d4d4d4] ml-3 shrink-0'>
                          {Math.round(source.similarity * 100)}% match
                        </span>
                      </div>
                      <p className='text-xs text-[#a0a0a0] leading-relaxed'>
                        {source.content}...
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {!answer && !searching && (
              <div className='flex-1 flex flex-col items-center justify-start pt-40 text-center py-20'>
                <FileText className="w-8 h-8 text-[#0d9488]" />
                <p className='text-[#e8e8e8] text-sm font-medium'>
                  Ask anything from your documents
                </p>
                <p className='text-[#a0a0a0] text-xs mt-1'>
                  Upload a PDF to get started
                </p>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  )
}

export default Dashboard