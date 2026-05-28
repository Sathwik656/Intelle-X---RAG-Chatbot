import { useRef, useState, useEffect } from 'react'
import { useApp } from '../../context/AppContext'
import MessageBubble from './MessageBubble'
import TypingIndicator from './TypingIndicator'
import { Send, FileText, ChevronDown } from 'lucide-react'

export default function ChatWindow() {
  const { activeSessionId, sessions, messages, isTyping, sendMessage } = useApp()
  const [input, setInput] = useState('')
  const [showScrollBtn, setShowScrollBtn] = useState(false)
  const bottomRef = useRef(null)
  const chatRef   = useRef(null)
  const inputRef  = useRef(null)

  const session  = sessions.find((s) => s.session_id === activeSessionId)
  const msgList  = messages[activeSessionId] || []

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgList.length, isTyping])

  // Show scroll-to-bottom button when user scrolls up
  const handleScroll = () => {
    if (!chatRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = chatRef.current
    setShowScrollBtn(scrollHeight - scrollTop - clientHeight > 120)
  }

  const scrollToBottom = () => bottomRef.current?.scrollIntoView({ behavior: 'smooth' })

  const handleSend = () => {
    const q = input.trim()
    if (!q || isTyping) return
    setInput('')
    sendMessage(q)
    inputRef.current?.focus()
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-full">

      {/* ── Chat header ────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-6 py-3 border-b-2 border-black bg-bg-secondary flex-shrink-0">
        <div className="w-7 h-7 bg-accent-cyan/10 border border-accent-cyan/40 flex items-center justify-center">
          <FileText size={13} className="text-accent-cyan" />
        </div>
        <div className="min-w-0">
          <h2 className="font-grotesk font-bold text-sm text-white truncate">
            {session?.filename || 'Document Chat'}
          </h2>
          <p className="font-mono text-[9px] text-text-muted tracking-wider">
            {session?.status === 'ready'
              ? `${session.chunks_count ?? '?'} CHUNKS INDEXED`
              : session?.status?.toUpperCase() || 'LOADING…'}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className={`tag text-[8px] px-1.5 ${
            session?.status === 'ready' ? 'tag-lime' :
            session?.status === 'processing' ? 'tag-yellow' : 'tag-muted'
          }`}>
            {session?.status?.toUpperCase() || 'PENDING'}
          </span>
        </div>
      </div>

      {/* ── Message list ───────────────────────────────────────── */}
      <div
        ref={chatRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-6 space-y-4 relative"
      >
        {msgList.length === 0 && !isTyping && (
          <div className="flex flex-col items-center justify-center h-full text-center animate-fade-in">
            <div className="w-12 h-12 bg-accent-cyan/10 border-2 border-accent-cyan/30 flex items-center justify-center mb-4">
              <FileText size={20} className="text-accent-cyan" />
            </div>
            <p className="font-grotesk font-bold text-white/70 text-lg mb-1">
              {session?.status === 'ready' ? 'Ready to answer' : 'Processing document…'}
            </p>
            <p className="text-text-muted text-sm">
              {session?.status === 'ready'
                ? 'Ask any question about your document.'
                : 'Please wait while we index your PDF.'}
            </p>
          </div>
        )}

        {msgList.map((msg, idx) => (
          <MessageBubble key={msg.id || idx} message={msg} />
        ))}

        {isTyping && <TypingIndicator />}

        <div ref={bottomRef} />
      </div>

      {/* Scroll-to-bottom button */}
      {showScrollBtn && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-24 right-8 w-8 h-8 bg-bg-card border-2 border-black shadow-brutal flex items-center justify-center hover:bg-bg-hover transition-colors"
        >
          <ChevronDown size={14} className="text-white" />
        </button>
      )}

      {/* ── Input bar ──────────────────────────────────────────── */}
      <div className="flex-shrink-0 px-4 py-4 border-t-2 border-black bg-bg-secondary">
        <div className="relative border-2 border-white/20 focus-within:border-accent-cyan transition-colors duration-200"
             style={{ boxShadow: '0 0 0 0', }}>
          <div className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-text-dim text-sm select-none">/</div>
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about your document…"
            rows={1}
            disabled={isTyping || session?.status !== 'ready'}
            className="w-full bg-bg-secondary text-white pl-7 pr-12 py-3 text-sm font-inter
                       placeholder-text-muted resize-none outline-none leading-relaxed
                       disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ maxHeight: '120px', overflowY: 'auto' }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping || session?.status !== 'ready'}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8
                       bg-accent-cyan border-2 border-black
                       flex items-center justify-center
                       disabled:opacity-40 disabled:cursor-not-allowed
                       hover:bg-accent-lime transition-colors duration-150"
            style={{ boxShadow: '2px 2px 0 #000' }}
          >
            <Send size={13} className="text-black" />
          </button>
        </div>
        <p className="text-center font-mono text-[9px] text-text-dim mt-1.5 tracking-wider">
          ENTER TO SEND · SHIFT+ENTER FOR NEWLINE
        </p>
      </div>
    </div>
  )
}
