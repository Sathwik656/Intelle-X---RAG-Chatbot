import { useEffect } from 'react'
import { useApp } from './context/AppContext'
import Sidebar from './components/Sidebar/Sidebar'
import HomePage from './pages/HomePage'
import ChatPage from './pages/ChatPage'
import UploadModal from './components/Upload/UploadModal'

export default function App() {
  const { activeSessionId, uploadModalOpen, loadSessions } = useApp()

  useEffect(() => {
    loadSessions()
  }, [loadSessions])

  return (
    <div className="flex h-full w-full overflow-hidden bg-bg-primary">
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {activeSessionId ? <ChatPage /> : <HomePage />}
      </main>

      {uploadModalOpen && <UploadModal />}
    </div>
  )
}
