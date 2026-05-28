import { Zap } from 'lucide-react'

export default function TypingIndicator() {
  return (
    <div className="flex items-start gap-3 animate-fade-in">
      {/* AI avatar */}
      <div className="flex-shrink-0 w-7 h-7 bg-bg-secondary border-2 border-black flex items-center justify-center"
           style={{ boxShadow: '2px 2px 0 #000' }}>
        <Zap size={12} className="text-accent-cyan fill-accent-cyan" />
      </div>

      {/* Typing dots */}
      <div className="px-4 py-3 bg-bg-card border-2 border-white/15"
           style={{ boxShadow: '3px 3px 0 #000' }}>
        <div className="flex items-center gap-1.5 h-4">
          <span className="typing-dot" />
          <span className="typing-dot" />
          <span className="typing-dot" />
        </div>
      </div>
    </div>
  )
}
