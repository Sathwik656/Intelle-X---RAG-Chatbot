import { useState, useRef, useCallback } from 'react'
import { useApp } from '../../context/AppContext'
import { fetchSessionStatus } from '../../api/client'
import { X, Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react'

const POLL_INTERVAL = 2000 // ms

export default function UploadModal() {
  const { closeUploadModal, uploadDocument, selectSession } = useApp()
  const [dragOver, setDragOver] = useState(false)
  const [file, setFile]         = useState(null)
  const [phase, setPhase]       = useState('idle')   // idle | uploading | indexing | done | error
  const [uploadPct, setUploadPct] = useState(0)
  const [errorMsg, setErrorMsg]   = useState('')
  const [sessionId, setSessionId] = useState(null)
  const fileRef = useRef(null)
  const pollRef = useRef(null)

  const stopPolling = () => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null }
  }

  const startPolling = useCallback((sid) => {
    pollRef.current = setInterval(async () => {
      try {
        const { status } = await fetchSessionStatus(sid)
        if (status === 'ready') {
          stopPolling()
          setPhase('done')
        } else if (status === 'error') {
          stopPolling()
          setPhase('error')
          setErrorMsg('Indexing failed. Please try again.')
        }
      } catch { /* keep polling */ }
    }, POLL_INTERVAL)
  }, [])

  const handleFile = useCallback(async (f) => {
    if (!f || !f.name.toLowerCase().endsWith('.pdf')) {
      setErrorMsg('Please select a valid PDF file.')
      setPhase('error')
      return
    }
    setFile(f)
    setPhase('uploading')
    setUploadPct(0)
    setErrorMsg('')

    try {
      const data = await uploadDocument(f, (pct) => setUploadPct(pct))
      setSessionId(data.session_id)
      setPhase('indexing')
      startPolling(data.session_id)
    } catch (err) {
      setPhase('error')
      setErrorMsg(err?.response?.data?.detail || 'Upload failed. Please try again.')
    }
  }, [uploadDocument, startPolling])

  const onDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  const onFileInput = (e) => {
    const f = e.target.files[0]
    if (f) handleFile(f)
  }

  const handleOpenChat = () => {
    stopPolling()
    if (sessionId) selectSession(sessionId)
    closeUploadModal()
  }

  const handleReset = () => {
    stopPolling()
    setFile(null)
    setPhase('idle')
    setUploadPct(0)
    setErrorMsg('')
    setSessionId(null)
  }

  const handleClose = () => {
    stopPolling()
    closeUploadModal()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={handleClose} />

      {/* Modal */}
      <div
        className="relative z-10 w-full max-w-lg bg-bg-secondary border-2 border-black animate-slide-up"
        style={{ boxShadow: '8px 8px 0 #000' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b-2 border-black">
          <div>
            <h2 className="font-grotesk font-extrabold text-white text-lg tracking-tight">UPLOAD PDF</h2>
            <p className="font-mono text-[10px] text-accent-cyan tracking-widest mt-0.5">DOCUMENT INGESTION</p>
          </div>
          <button onClick={handleClose} className="w-8 h-8 border-2 border-white/20 flex items-center justify-center hover:border-white/50 transition-colors">
            <X size={14} className="text-white" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* ── Idle / Drop zone ── */}
          {(phase === 'idle') && (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              onClick={() => fileRef.current?.click()}
              className={`
                flex flex-col items-center justify-center gap-4
                border-2 border-dashed cursor-pointer
                py-14 px-6 transition-all duration-200
                ${dragOver
                  ? 'border-accent-lime bg-accent-lime/5'
                  : 'border-white/20 hover:border-accent-cyan/60 hover:bg-white/2'}
              `}
            >
              <div className={`w-14 h-14 border-2 flex items-center justify-center transition-colors ${dragOver ? 'border-accent-lime bg-accent-lime/10' : 'border-white/20'}`}>
                <Upload size={24} className={dragOver ? 'text-accent-lime' : 'text-text-muted'} />
              </div>
              <div className="text-center">
                <p className="font-grotesk font-bold text-white text-sm">
                  {dragOver ? 'DROP IT HERE' : 'DRAG & DROP YOUR PDF'}
                </p>
                <p className="text-text-muted text-xs mt-1">or click to browse — PDF files only</p>
              </div>
              <input ref={fileRef} type="file" accept=".pdf" className="hidden" onChange={onFileInput} />
            </div>
          )}

          {/* ── Uploading ── */}
          {phase === 'uploading' && file && (
            <div className="space-y-5">
              <div className="flex items-center gap-3 p-3 border border-white/10 bg-bg-card">
                <FileText size={20} className="text-accent-cyan flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="font-grotesk font-bold text-sm text-white truncate">{file.name}</p>
                  <p className="font-mono text-[10px] text-text-muted">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1.5">
                  <span className="font-mono text-[10px] text-text-muted tracking-wider">UPLOADING</span>
                  <span className="font-mono text-[10px] text-accent-cyan">{uploadPct}%</span>
                </div>
                <div className="h-2 bg-bg-card border border-white/10 w-full">
                  <div
                    className="h-full bg-accent-cyan progress-fill"
                    style={{ width: `${uploadPct}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── Indexing ── */}
          {phase === 'indexing' && file && (
            <div className="space-y-5">
              <div className="flex items-center gap-3 p-3 border border-accent-yellow/30 bg-accent-yellow/5">
                <FileText size={20} className="text-accent-yellow flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="font-grotesk font-bold text-sm text-white truncate">{file.name}</p>
                  <p className="font-mono text-[10px] text-accent-yellow tracking-wider">INDEXING CHUNKS…</p>
                </div>
              </div>
              <div className="text-center py-6">
                <div className="flex justify-center gap-2 mb-4">
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                </div>
                <p className="font-grotesk font-bold text-white/70 text-sm">Processing your document</p>
                <p className="text-text-muted text-xs mt-1">Chunking, embedding, and storing vectors…</p>
                <p className="font-mono text-[9px] text-text-dim mt-3 tracking-wider">THIS MAY TAKE A FEW MINUTES</p>
              </div>
            </div>
          )}

          {/* ── Done ── */}
          {phase === 'done' && file && (
            <div className="space-y-5">
              <div className="flex items-center gap-3 p-3 border border-accent-lime/40 bg-accent-lime/5">
                <CheckCircle size={20} className="text-accent-lime flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="font-grotesk font-bold text-sm text-white truncate">{file.name}</p>
                  <p className="font-mono text-[10px] text-accent-lime tracking-wider">INDEXED & READY</p>
                </div>
              </div>

              <div className="text-center py-4">
                <div className="w-12 h-12 bg-accent-lime/10 border-2 border-accent-lime mx-auto flex items-center justify-center mb-3">
                  <CheckCircle size={20} className="text-accent-lime" />
                </div>
                <p className="font-grotesk font-bold text-white">Document ready!</p>
                <p className="text-text-muted text-sm mt-1">Your PDF has been indexed and is ready to query.</p>
              </div>

              <div className="flex gap-3">
                <button onClick={handleReset} className="btn-ghost flex-1 py-2.5 text-xs">
                  UPLOAD ANOTHER
                </button>
                <button onClick={handleOpenChat} className="btn-lime flex-1 py-2.5 text-xs">
                  START CHATTING →
                </button>
              </div>
            </div>
          )}

          {/* ── Error ── */}
          {phase === 'error' && (
            <div className="space-y-5">
              <div className="flex items-center gap-3 p-3 border border-accent-pink/40 bg-accent-pink/5">
                <AlertCircle size={20} className="text-accent-pink flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="font-grotesk font-bold text-sm text-white">Upload Failed</p>
                  <p className="font-mono text-[10px] text-accent-pink tracking-wider">{errorMsg}</p>
                </div>
              </div>
              <button onClick={handleReset} className="btn-pink w-full py-2.5 text-xs">
                TRY AGAIN
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
