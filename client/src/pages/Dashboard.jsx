import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, Network } from 'lucide-react'
import Sidebar from '../components/Sidebar.jsx'
import AnswerRenderer from '../components/AnswerRenderer.jsx'
import SourceModal from '../components/SourceModal.jsx'
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
    navigate('/login')
  }

  if (!user) return (
    <div className='min-h-screen flex items-center justify-center bg-gray-900'>
      <p className='text-gray-400 text-sm'>Loading...</p>
    </div>
  )

  return (
    <div className='min-h-screen bg-[#1a1a1a] text-[#e8e8e8] flex flex-col'>

      {/* Navbar */}
      <nav className='bg-[#212121] border-b border-[#383838] px-6 py-0 flex items-center justify-between'>
        <div className='flex items-center ml-4'>
          <img src="/logos/logo.png" className="w-18 h-18 text-white" />
          <span className='text-white text-lg font-semibold text-base ml-[-4px]'>Synapse</span>
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
        <Sidebar
          documents={documents}
          uploading={uploading}
          error={error}
          history={history}
          showHistory={showHistory}
          onUpload={handleUpload}
          onDelete={handleDelete}
          onDeleteHistory={handleDeleteHistory}
          onToggleHistory={() => setShowHistory(!showHistory)}
          onHistoryClick={(item) => {
            setQuery(item.query)
            setAnswer(item.answer)
            setSources([])
          }}
        />

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
            <SourceModal sources={sources} />

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