import { useApp } from '../../context/AppContext'
import SessionItem from './SessionItem'
import UserFooter from './UserFooter'
import { Plus, Zap } from 'lucide-react'

export default function Sidebar() {
  const { sessions, activeSessionId, selectSession, startNewChat, openUploadModal, isLoadingSessions } = useApp()

  const readySessions   = sessions.filter((s) => s.status === 'ready')
  const pendingSessions = sessions.filter((s) => s.status !== 'ready')

  return (
    <aside className="w-[220px] min-w-[220px] h-full flex flex-col bg-bg-secondary border-r-2 border-black overflow-hidden">

      {/* ── Logo ─────────────────────────────────────────────── */}
      <div className="px-4 pt-5 pb-4 border-b-2 border-black">
        <div className="flex items-center gap-2 mb-0.5">
          <div className="w-7 h-7 bg-accent-cyan border-2 border-black flex items-center justify-center">
            <Zap size={14} className="text-black fill-black" />
          </div>
          <span className="font-grotesk font-extrabold text-lg tracking-tight text-white leading-none">
            INTELLE X
          </span>
        </div>
        <p className="font-mono text-[10px] text-text-muted tracking-widest pl-9">
          RAG-CHATBOT V2.4
        </p>
      </div>

      {/* ── New Chat button ───────────────────────────────────── */}
      <div className="px-3 py-3 border-b-2 border-black">
        <button
          onClick={startNewChat}
          className="btn-lime w-full text-xs py-2.5 flex items-center justify-between"
        >
          <span>NEW CHAT</span>
          <Plus size={14} />
        </button>
      </div>

      {/* ── Session list ─────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto py-2">

        {isLoadingSessions && (
          <div className="px-3 space-y-2 mt-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="shimmer h-12 border border-white/5" />
            ))}
          </div>
        )}

        {!isLoadingSessions && sessions.length === 0 && (
          <div className="px-4 py-8 text-center">
            <p className="text-text-dim text-xs font-mono">NO SESSIONS YET</p>
            <button
              onClick={openUploadModal}
              className="mt-3 btn-cyan text-[10px] py-1.5 px-3"
            >
              UPLOAD PDF
            </button>
          </div>
        )}

        {!isLoadingSessions && sessions.length > 0 && (
          <>
            <p className="px-3 pt-2 pb-1 font-mono text-[9px] text-text-dim tracking-widest uppercase">
              Recent Memory
            </p>
            {sessions.map((session) => (
              <SessionItem
                key={session.session_id}
                session={session}
                isActive={session.session_id === activeSessionId}
                onClick={() => selectSession(session.session_id)}
              />
            ))}
          </>
        )}
      </div>

      {/* ── Upload shortcut ───────────────────────────────────── */}
      <div className="px-3 py-2 border-t-2 border-black">
        <button
          onClick={openUploadModal}
          className="btn-ghost w-full text-[10px] py-2"
        >
          + UPLOAD PDF
        </button>
      </div>

      {/* ── User footer ──────────────────────────────────────── */}
      <UserFooter />
    </aside>
  )
}
