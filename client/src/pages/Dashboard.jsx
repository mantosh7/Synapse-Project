import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api.js'

const Dashboard = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [documents, setDocuments] = useState([])
  const [query, setQuery] = useState('')
  const [answer, setAnswer] = useState(null)
  const [sources, setSources] = useState([])
  const [uploading, setUploading] = useState(false)
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState(null)

  // Fetch user and documents on mount
  useEffect(() => {
    const init = async () => {
      try {
        const userRes = await api.get('/api/auth/me')
        setUser(userRes.data.data.user)

        const docsRes = await api.get('/api/documents')
        setDocuments(docsRes.data.data.documents)
      } catch (err) {
        navigate('/')
      }
    }
    init()
  }, [navigate])

  // Handle PDF upload
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

      // Refresh documents list
      const docsRes = await api.get('/api/documents')
      setDocuments(docsRes.data.data.documents)
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed')
    } finally {
      setUploading(false)
      // Reset file input
      e.target.value = ''
    }
  }

  // Handle document delete
  const handleDelete = async (docId) => {
    try {
      await api.delete(`/api/documents/${docId}`)
      setDocuments(documents.filter(d => d.id !== docId))
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed')
    }
  }

  // Handle search
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
    } catch (err) {
      setError(err.response?.data?.message || 'Search failed')
    } finally {
      setSearching(false)
    }
  }

  // Handle logout
  const handleLogout = async () => {
    await api.post('/api/auth/logout')
    navigate('/')
  }

  if (!user) return (
    <div className='min-h-screen flex items-center justify-center'>
      <p className='text-gray-500 text-sm'>Loading...</p>
    </div>
  )

  return (
    <div className='min-h-screen bg-gray-50 flex flex-col'>

      {/* Navbar */}
      <nav className='bg-white border-b px-6 py-3 flex items-center justify-between'>
        <h1 className='text-lg font-bold text-blue-600'>Synapse</h1>
        <div className='flex items-center gap-3'>
          {user.avatar && (
            <img src={user.avatar} alt={user.name} className='w-8 h-8 rounded-full' />
          )}
          <span className='text-sm text-gray-600'>{user.name}</span>
          <button
            onClick={handleLogout}
            className='text-sm text-red-500 hover:underline'
          >
            Logout
          </button>
        </div>
      </nav>

      <div className='flex flex-1 overflow-hidden'>

        {/* Left Sidebar — Documents */}
        <aside className='w-72 bg-white border-r p-4 flex flex-col gap-4 overflow-y-auto'>
          <div>
            <h2 className='text-sm font-semibold text-gray-700 mb-3'>
              Your Documents
            </h2>

            {/* Upload Button */}
            <label className={`
              w-full flex items-center justify-center gap-2 
              border-2 border-dashed border-blue-300 rounded-lg 
              py-3 text-sm text-blue-500 cursor-pointer
              hover:bg-blue-50 transition
              ${uploading ? 'opacity-50 pointer-events-none' : ''}
            `}>
              <input
                type='file'
                accept='.pdf'
                onChange={handleUpload}
                className='hidden'
              />
              {uploading ? 'Uploading...' : '+ Upload PDF'}
            </label>
          </div>

          {/* Error */}
          {error && (
            <p className='text-xs text-red-500'>{error}</p>
          )}

          {/* Documents List */}
          <div className='flex flex-col gap-2'>
            {documents.length === 0 ? (
              <p className='text-xs text-gray-400 text-center mt-4'>
                No documents yet — upload a PDF!
              </p>
            ) : (
              documents.map(doc => (
                <div
                  key={doc.id}
                  className='bg-gray-50 rounded-lg p-3 flex items-start justify-between gap-2'
                >
                  <div className='flex-1 min-w-0'>
                    <p className='text-xs font-medium text-gray-700 truncate'>
                      {doc.fileName}
                    </p>
                    <p className='text-xs text-gray-400 mt-1'>
                      {doc._count.chunks} chunks • {doc.status}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className='text-xs text-red-400 hover:text-red-600 shrink-0'
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>
        </aside>

        {/* Main Area — Search */}
        <main className='flex-1 p-6 overflow-y-auto flex flex-col gap-6'>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className='flex gap-2'>
            <input
              type='text'
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder='Ask anything from your documents...'
              className='flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
            <button
              type='submit'
              disabled={searching || !query.trim()}
              className='bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition'
            >
              {searching ? 'Searching...' : 'Search'}
            </button>
          </form>

          {/* Answer */}
          {answer && (
            <div className='bg-white rounded-xl shadow-sm border p-5'>
              <h3 className='text-sm font-semibold text-gray-700 mb-3'>
                Answer
              </h3>
              <p className='text-sm text-gray-600 leading-relaxed whitespace-pre-wrap'>
                {answer}
              </p>
            </div>
          )}

          {/* Sources */}
          {sources.length > 0 && (
            <div className='bg-white rounded-xl shadow-sm border p-5'>
              <h3 className='text-sm font-semibold text-gray-700 mb-3'>
                Sources
              </h3>
              <div className='flex flex-col gap-3'>
                {sources.map((source, i) => (
                  <div key={i} className='bg-gray-50 rounded-lg p-3'>
                    <div className='flex items-center justify-between mb-1'>
                      <p className='text-xs font-medium text-blue-600'>
                        {source.fileName}
                      </p>
                      <span className='text-xs text-gray-400'>
                        {Math.round(source.similarity * 100)}% match
                      </span>
                    </div>
                    <p className='text-xs text-gray-500 leading-relaxed'>
                      {source.content}...
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {!answer && !searching && (
            <div className='flex-1 flex items-center justify-center'>
              <div className='text-center'>
                <p className='text-4xl mb-3'>🔍</p>
                <p className='text-gray-400 text-sm'>
                  Upload a PDF and ask anything!
                </p>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  )
}

export default Dashboard