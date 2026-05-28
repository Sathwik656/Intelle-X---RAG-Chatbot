import { FileText } from 'lucide-react'

export default function SourceChip({ source }) {
  const display = source.replace(/^.*[\\/]/, '').replace(/\.pdf$/i, '')
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 font-mono text-[9px]
                 text-accent-cyan border border-accent-cyan/40 bg-accent-cyan/5
                 tracking-wide uppercase"
    >
      <FileText size={8} />
      {display}
    </span>
  )
}
