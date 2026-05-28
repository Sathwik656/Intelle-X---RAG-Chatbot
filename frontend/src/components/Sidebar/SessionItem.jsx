import { FileText, Clock, AlertCircle, CheckCircle, Trash2 } from 'lucide-react'
import { useApp } from '../../context/AppContext'

const TAG_COLORS = ['tag-cyan', 'tag-lime', 'tag-pink', 'tag-yellow']

const STATUS_ICONS = {
  ready:      <CheckCircle size={10} className="text-accent-lime" />,
  processing: <Clock size={10} className="text-accent-yellow animate-spin" />,
  pending:    <Clock size={10} className="text-text-muted" />,
  error:      <AlertCircle size={10} className="text-accent-pink" />,
}

function getTagColor(filename) {
  let hash = 0
  for (let i = 0; i < filename.length; i++) hash = filename.charCodeAt(i) + ((hash << 5) - hash)
  return TAG_COLORS[Math.abs(hash) % TAG_COLORS.length]
}

function getTagLabel(filename) {
  const ext = filename.split('.').pop()?.toUpperCase() || 'FILE'
  return ext === 'PDF' ? 'DOC' : ext
}

function truncateFilename(name, max = 22) {
  const base = name.replace(/\.pdf$/i, '')
  return base.length > max ? base.slice(0, max - 1) + '…' : base
}

export default function SessionItem({ session, isActive, onClick }) {
  const { removeSession } = useApp()
  const tagColor = getTagColor(session.filename)
  const tagLabel = getTagLabel(session.filename)
  const displayName = truncateFilename(session.filename)

  return (
    <div className={`sidebar-item w-full flex items-start gap-3 p-2 group ${isActive ? 'active' : ''}`} onClick={onClick}>
      <div className="flex-shrink-0 mt-0.5">
        <FileText size={12} className={isActive ? 'text-accent-cyan' : 'text-text-muted'} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 mb-0.5 w-full">
          <span className={`tag ${tagColor} text-[8px] px-1 py-0`}>{tagLabel}</span>
          <span className="ml-auto flex items-center">{STATUS_ICONS[session.status] || STATUS_ICONS.pending}</span>
        </div>
        <p className={`text-xs font-grotesk font-semibold leading-tight truncate ${isActive ? 'text-white' : 'text-white/70'}`}>
          {displayName}
        </p>
        {session.chunks_count != null && (
          <p className="text-[9px] font-mono text-text-dim mt-0.5">{session.chunks_count} chunks</p>
        )}
      </div>
      <button 
        onClick={(e) => {
          e.stopPropagation()
          removeSession(session.session_id)
        }}
        className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-accent-pink transition-all p-1"
        title="Delete session"
      >
        <Trash2 size={14} />
      </button>
    </div>
  )
}
