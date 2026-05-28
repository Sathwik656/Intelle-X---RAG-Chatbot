import { useState, useRef } from 'react'
import { useApp } from '../context/AppContext'
import { Send, Upload, Globe, GitBranch, Database, Cpu, Layers, Lightbulb } from 'lucide-react'

const QUICK_ACTIONS = [
  {
    category: 'QUICK ACTION',
    categoryColor: 'text-accent-cyan',
    title: 'Analyze Dataset',
    desc: 'Upload a CSV and let me find anomalies.',
    icon: Database,
  },
  {
    category: 'RESEARCH',
    categoryColor: 'text-accent-pink',
    title: 'Code Refactor',
    desc: 'Optimize React components for performance.',
    icon: Cpu,
  },
  {
    category: 'DEVELOPMENT',
    categoryColor: 'text-accent-lime',
    title: 'System Design',
    desc: 'Architect a scalable microservices backend.',
    icon: Layers,
  },
  {
    category: 'BRAINSTORM',
    categoryColor: 'text-accent-yellow',
    title: 'Creative Output',
    desc: 'Brainstorm dystopian sci-fi world concepts.',
    icon: Lightbulb,
  },
]

export default function HomePage() {
  const { openUploadModal, sessions, selectSession } = useApp()
  const [query, setQuery] = useState('')
  const inputRef = useRef(null)

  const handleQuerySubmit = () => {
    // If there are ready sessions, use the most recent one
    const readySession = sessions.find((s) => s.status === 'ready')
    if (readySession) {
      selectSession(readySession.session_id)
    } else {
      openUploadModal()
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleQuerySubmit()
    }
  }

  return (
    <div className="flex flex-col items-center justify-center h-full px-6 py-10 overflow-y-auto">

      {/* ── Status bar (top-right) ── */}
      <div className="absolute top-4 right-6 flex items-center gap-2">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-accent-cyan border-2 border-black"
             style={{ boxShadow: '3px 3px 0 #000' }}>
          <div className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
          <span className="font-mono text-[10px] text-black font-bold tracking-wider">MODEL: IX-ULTRA</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-bg-card border-2 border-white/20"
             style={{ boxShadow: '3px 3px 0 #000' }}>
          <span className="font-mono text-[10px] text-text-muted tracking-wider">LATENCY: —</span>
        </div>
      </div>

      {/* ── Hero headline ── */}
      <div className="text-center mb-10 max-w-2xl animate-fade-in">
        <h1 className="font-grotesk font-black text-white leading-[1.1] tracking-tight"
            style={{ fontSize: 'clamp(2rem, 5vw, 3.6rem)' }}>
          WHAT WOULD YOU LIKE<br />
          <span style={{ color: '#ff0066' }}>TO EXPLORE TODAY?</span>
        </h1>
        <p className="text-text-muted text-sm mt-5 leading-relaxed max-w-md mx-auto">
          Harness the power of Intelle X Retrieval Augmented<br />
          Generation for deep data synthesis.
        </p>
      </div>

      {/* ── Central input ── */}
      <div className="w-full max-w-2xl mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <div
          className="relative border-2 border-white/20 bg-bg-secondary transition-all duration-200
                     focus-within:border-accent-cyan"
          style={{ boxShadow: '0 0 0 1px transparent', }}
        >
          <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-text-dim text-base select-none">/</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Query your private data or the web..."
            className="w-full bg-transparent text-white pl-9 pr-14 py-4 text-sm font-inter
                       placeholder-text-muted outline-none"
          />
          <button
            onClick={handleQuerySubmit}
            className="absolute right-3 top-1/2 -translate-y-1/2
                       w-9 h-9 bg-accent-cyan border-2 border-black
                       flex items-center justify-center
                       hover:bg-accent-lime transition-colors duration-150"
            style={{ boxShadow: '2px 2px 0 #000' }}
          >
            <Send size={14} className="text-black" />
          </button>
        </div>

        {/* ── Action buttons ── */}
        <div className="flex items-center gap-2 mt-3 flex-wrap justify-center">
          <button
            onClick={openUploadModal}
            className="btn-brutal bg-bg-card text-white border-white/25 text-[11px] py-2 px-3 gap-1.5"
          >
            <Upload size={11} />
            UPLOAD PDF
          </button>
          <button
            disabled
            className="btn-brutal bg-accent-lime text-black text-[11px] py-2 px-3 gap-1.5 opacity-60 cursor-not-allowed"
          >
            <GitBranch size={11} />
            CONNECT GITHUB
          </button>
          <button
            disabled
            className="btn-brutal bg-bg-card text-white border-white/25 text-[11px] py-2 px-3 gap-1.5 opacity-50 cursor-not-allowed"
          >
            <Globe size={11} />
            SEARCH WEB
          </button>
        </div>
      </div>

      {/* ── Quick action cards ── */}
      <div className="w-full max-w-2xl grid grid-cols-2 sm:grid-cols-4 gap-3 animate-fade-in"
           style={{ animationDelay: '0.2s' }}>
        {QUICK_ACTIONS.map((action) => {
          const Icon = action.icon
          return (
            <button
              key={action.title}
              onClick={openUploadModal}
              className="brutal-card p-3 text-left hover:translate-x-[-2px] hover:translate-y-[-2px] transition-transform duration-150"
            >
              <p className={`font-mono text-[8px] tracking-widest uppercase mb-1.5 ${action.categoryColor}`}>
                {action.category}
              </p>
              <div className="flex items-center gap-1.5 mb-1">
                <Icon size={12} className="text-white/50 flex-shrink-0" />
                <p className="font-grotesk font-bold text-white text-sm leading-tight">{action.title}</p>
              </div>
              <p className="text-text-muted text-[11px] leading-relaxed">{action.desc}</p>
            </button>
          )
        })}
      </div>

      {/* ── Recent sessions hint ── */}
      {sessions.length > 0 && (
        <div className="mt-8 text-center animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <p className="font-mono text-[10px] text-text-dim tracking-wider mb-2">
            OR CONTINUE WITH A PREVIOUS SESSION
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {sessions.slice(0, 3).map((s) => (
              <button
                key={s.session_id}
                onClick={() => selectSession(s.session_id)}
                className="btn-ghost text-[10px] py-1.5 px-3"
              >
                {s.filename.replace(/\.pdf$/i, '')}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
