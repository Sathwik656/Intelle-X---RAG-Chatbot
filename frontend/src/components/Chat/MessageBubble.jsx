import { Zap } from 'lucide-react'
import SourceChip from './SourceChip'

function renderContent(text) {
  // Simple markdown-like rendering
  if (!text) return null
  const lines = text.split('\n')
  return lines.map((line, i) => {
    if (line.startsWith('### ')) return <h3 key={i} className="font-grotesk font-bold text-white mt-3 mb-1">{line.slice(4)}</h3>
    if (line.startsWith('## '))  return <h2 key={i} className="font-grotesk font-bold text-white text-base mt-3 mb-1">{line.slice(3)}</h2>
    if (line.startsWith('# '))   return <h1 key={i} className="font-grotesk font-bold text-white text-lg mt-3 mb-1">{line.slice(2)}</h1>
    if (line.startsWith('- ') || line.startsWith('* ')) {
      return <li key={i} className="ml-4 text-white/85 text-sm">{renderInline(line.slice(2))}</li>
    }
    if (/^\d+\. /.test(line)) {
      return <li key={i} className="ml-4 text-white/85 text-sm list-decimal">{renderInline(line.replace(/^\d+\. /, ''))}</li>
    }
    if (line.trim() === '') return <br key={i} />
    return <p key={i} className="text-white/85 text-sm mb-1 leading-relaxed">{renderInline(line)}</p>
  })
}

function renderInline(text) {
  // Bold and code inline
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/)
  return parts.map((part, i) => {
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={i} className="font-mono text-accent-cyan bg-black/40 px-1 text-xs">{part.slice(1, -1)}</code>
    }
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="text-white font-semibold">{part.slice(2, -2)}</strong>
    }
    return part
  })
}

export default function MessageBubble({ message }) {
  const isUser = message.role === 'user'
  const isError = message.isError

  if (isUser) {
    return (
      <div className="flex justify-end animate-slide-up">
        <div
          className="max-w-[72%] px-4 py-3 bg-accent-cyan text-black border-2 border-black font-inter text-sm leading-relaxed"
          style={{ boxShadow: '3px 3px 0 #000' }}
        >
          <p className="font-medium">{message.content}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-start gap-3 animate-slide-up">
      {/* AI avatar */}
      <div className="flex-shrink-0 w-7 h-7 bg-bg-secondary border-2 border-black flex items-center justify-center mt-0.5"
           style={{ boxShadow: '2px 2px 0 #000' }}>
        <Zap size={12} className="text-accent-cyan fill-accent-cyan" />
      </div>

      {/* Bubble */}
      <div className="flex-1 min-w-0">
        <div
          className={`px-4 py-3 border-2 ${isError ? 'border-accent-pink bg-accent-pink/10' : 'border-white/15 bg-bg-card'}`}
          style={{ boxShadow: '3px 3px 0 #000' }}
        >
          <div className="prose-brutal text-sm">
            {renderContent(message.content)}
          </div>
        </div>

        {/* Sources */}
        {message.sources && message.sources.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            <span className="font-mono text-[9px] text-text-dim tracking-wider self-center">SOURCES:</span>
            {message.sources.map((src, i) => (
              <SourceChip key={i} source={src} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
