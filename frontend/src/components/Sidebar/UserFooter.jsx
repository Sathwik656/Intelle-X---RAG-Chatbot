import { Settings } from 'lucide-react'

export default function UserFooter() {
  return (
    <div className="flex items-center gap-2 px-3 py-3 border-t-2 border-black bg-bg-secondary">
      {/* Avatar */}
      <div className="w-8 h-8 bg-accent-pink border-2 border-black flex items-center justify-center flex-shrink-0">
        <span className="font-grotesk font-black text-xs text-white">IX</span>
      </div>

      {/* User info */}
      <div className="min-w-0 flex-1">
        <p className="font-grotesk font-bold text-xs text-white leading-none truncate">USER</p>
        <p className="font-mono text-[9px] text-accent-cyan tracking-wider mt-0.5">PRO ACCOUNT</p>
      </div>

      {/* Settings */}
      <button className="flex-shrink-0 w-6 h-6 flex items-center justify-center text-text-muted hover:text-white transition-colors">
        <Settings size={13} />
      </button>
    </div>
  )
}
