import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 180000, // 3 min — RAG queries can be slow
  headers: { 'Content-Type': 'application/json' },
})

// ── Sessions ──────────────────────────────────────────────────────────────────

export const fetchSessions = () =>
  api.get('/sessions').then((r) => r.data.sessions)

export const fetchSession = (sessionId) =>
  api.get(`/sessions/${sessionId}`).then((r) => r.data)

export const fetchSessionStatus = (sessionId) =>
  api.get(`/sessions/${sessionId}/status`).then((r) => r.data)

export const deleteSession = (sessionId) =>
  api.delete(`/sessions/${sessionId}`).then((r) => r.data)

// ── Messages ──────────────────────────────────────────────────────────────────

export const fetchMessages = (sessionId) =>
  api.get(`/sessions/${sessionId}/messages`).then((r) => r.data.messages)

// ── Upload ────────────────────────────────────────────────────────────────────

export const uploadPdf = (file, onProgress) => {
  const formData = new FormData()
  formData.append('file', file)
  return api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (evt) => {
      if (onProgress && evt.total) {
        onProgress(Math.round((evt.loaded * 100) / evt.total))
      }
    },
  }).then((r) => r.data)
}

// ── Chat ──────────────────────────────────────────────────────────────────────

export const sendChat = (sessionId, question, top_k = 5) =>
  api.post('/chat', { session_id: sessionId, question, top_k }).then((r) => r.data)

export default api
