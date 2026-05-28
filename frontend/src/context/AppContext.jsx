import { createContext, useContext, useReducer, useCallback } from 'react'
import { fetchSessions, fetchMessages, sendChat, uploadPdf, deleteSession } from '../api/client'

// ── State shape ───────────────────────────────────────────────────────────────
const initialState = {
  sessions: [],          // [{session_id, filename, status, created_at, chunks_count}]
  activeSessionId: null,
  messages: {},          // { [sessionId]: [{id, role, content, sources, created_at}] }
  isLoadingSessions: false,
  isTyping: false,
  uploadModalOpen: false,
  error: null,
}

// ── Reducer ───────────────────────────────────────────────────────────────────
function reducer(state, action) {
  switch (action.type) {
    case 'SET_SESSIONS':
      return { ...state, sessions: action.payload, isLoadingSessions: false }

    case 'SET_LOADING_SESSIONS':
      return { ...state, isLoadingSessions: action.payload }

    case 'ADD_SESSION':
      return {
        ...state,
        sessions: [action.payload, ...state.sessions],
        activeSessionId: action.payload.session_id,
        messages: { ...state.messages, [action.payload.session_id]: [] },
      }

    case 'UPDATE_SESSION_STATUS': {
      const sessions = state.sessions.map((s) =>
        s.session_id === action.payload.session_id
          ? { ...s, ...action.payload }
          : s
      )
      return { ...state, sessions }
    }

    case 'REMOVE_SESSION': {
      const sessions = state.sessions.filter(s => s.session_id !== action.payload)
      const messages = { ...state.messages }
      delete messages[action.payload]
      return {
        ...state,
        sessions,
        messages,
        activeSessionId: state.activeSessionId === action.payload ? null : state.activeSessionId
      }
    }

    case 'SET_ACTIVE_SESSION':
      return { ...state, activeSessionId: action.payload }

    case 'SET_MESSAGES':
      return {
        ...state,
        messages: { ...state.messages, [action.payload.sessionId]: action.payload.messages },
      }

    case 'APPEND_MESSAGE': {
      const existing = state.messages[action.payload.sessionId] || []
      return {
        ...state,
        messages: {
          ...state.messages,
          [action.payload.sessionId]: [...existing, action.payload.message],
        },
      }
    }

    case 'UPDATE_LAST_MESSAGE': {
      const msgs = [...(state.messages[action.payload.sessionId] || [])]
      if (msgs.length > 0) {
        msgs[msgs.length - 1] = { ...msgs[msgs.length - 1], ...action.payload.updates }
      }
      return {
        ...state,
        messages: { ...state.messages, [action.payload.sessionId]: msgs },
      }
    }

    case 'SET_TYPING':
      return { ...state, isTyping: action.payload }

    case 'SET_UPLOAD_MODAL':
      return { ...state, uploadModalOpen: action.payload }

    case 'SET_ERROR':
      return { ...state, error: action.payload }

    default:
      return state
  }
}

// ── Context ───────────────────────────────────────────────────────────────────
const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  // Load all sessions from backend
  const loadSessions = useCallback(async () => {
    dispatch({ type: 'SET_LOADING_SESSIONS', payload: true })
    try {
      const sessions = await fetchSessions()
      dispatch({ type: 'SET_SESSIONS', payload: sessions })
    } catch {
      dispatch({ type: 'SET_LOADING_SESSIONS', payload: false })
    }
  }, [])

  // Switch active session and load its messages if not cached
  const selectSession = useCallback(async (sessionId) => {
    dispatch({ type: 'SET_ACTIVE_SESSION', payload: sessionId })
    if (!state.messages[sessionId]) {
      try {
        const messages = await fetchMessages(sessionId)
        dispatch({ type: 'SET_MESSAGES', payload: { sessionId, messages } })
      } catch {
        dispatch({ type: 'SET_MESSAGES', payload: { sessionId, messages: [] } })
      }
    }
  }, [state.messages])

  // Send a chat message and receive the response
  const sendMessage = useCallback(async (question, topK = 5) => {
    const sessionId = state.activeSessionId
    if (!sessionId || !question.trim()) return

    // Optimistic user message
    const userMsg = {
      id: `tmp-user-${Date.now()}`,
      role: 'user',
      content: question,
      sources: [],
      created_at: new Date().toISOString(),
    }
    dispatch({ type: 'APPEND_MESSAGE', payload: { sessionId, message: userMsg } })
    dispatch({ type: 'SET_TYPING', payload: true })

    try {
      const data = await sendChat(sessionId, question, topK)
      const assistantMsg = {
        id: `tmp-ai-${Date.now()}`,
        role: 'assistant',
        content: data.answer,
        sources: data.sources || [],
        created_at: new Date().toISOString(),
      }
      dispatch({ type: 'APPEND_MESSAGE', payload: { sessionId, message: assistantMsg } })
    } catch (err) {
      const errMsg = {
        id: `tmp-err-${Date.now()}`,
        role: 'assistant',
        content: '⚠️ Something went wrong. Please try again.',
        sources: [],
        created_at: new Date().toISOString(),
        isError: true,
      }
      dispatch({ type: 'APPEND_MESSAGE', payload: { sessionId, message: errMsg } })
    } finally {
      dispatch({ type: 'SET_TYPING', payload: false })
    }
  }, [state.activeSessionId])

  // Upload PDF and create new session
  const uploadDocument = useCallback(async (file, onProgress) => {
    try {
      const data = await uploadPdf(file, onProgress)
      dispatch({ type: 'ADD_SESSION', payload: data })
      return data
    } catch (err) {
      throw err
    }
  }, [])

  const updateSessionStatus = useCallback((sessionId, status, extra = {}) => {
    dispatch({ type: 'UPDATE_SESSION_STATUS', payload: { session_id: sessionId, status, ...extra } })
  }, [])

  const removeSession = useCallback(async (sessionId) => {
    try {
      await deleteSession(sessionId)
      dispatch({ type: 'REMOVE_SESSION', payload: sessionId })
    } catch (err) {
      console.error('Failed to delete session', err)
    }
  }, [])

  const openUploadModal  = () => dispatch({ type: 'SET_UPLOAD_MODAL', payload: true })
  const closeUploadModal = () => dispatch({ type: 'SET_UPLOAD_MODAL', payload: false })
  const startNewChat     = () => dispatch({ type: 'SET_ACTIVE_SESSION', payload: null })

  const value = {
    ...state,
    loadSessions,
    selectSession,
    sendMessage,
    uploadDocument,
    updateSessionStatus,
    removeSession,
    openUploadModal,
    closeUploadModal,
    startNewChat,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export const useApp = () => {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}
