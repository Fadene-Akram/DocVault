import { createContext, useContext, useReducer, useEffect } from 'react'

const AppContext = createContext(null)

const initialState = {
  // Auth
  user: null,
  // Data
  documents: [],
  users: [],
  departments: [],
  categories: [],
  // UI
  loading: false,
  toast: null,
}

function reducer(state, action) {
  switch (action.type) {
    // Auth
    case 'LOGIN':
      return { ...state, user: action.payload }
    case 'LOGOUT':
      return { ...state, user: null }

    // Documents
    case 'SET_DOCUMENTS':
      return { ...state, documents: action.payload }
    case 'ADD_DOCUMENT':
      return { ...state, documents: [action.payload, ...state.documents] }
    case 'UPDATE_DOCUMENT':
      return { ...state, documents: state.documents.map(d => d.id === action.payload.id ? action.payload : d) }
    case 'DELETE_DOCUMENT':
      return { ...state, documents: state.documents.filter(d => d.id !== action.payload) }

    // Users
    case 'SET_USERS':
      return { ...state, users: action.payload }
    case 'ADD_USER':
      return { ...state, users: [...state.users, action.payload] }
    case 'UPDATE_USER':
      return { ...state, users: state.users.map(u => u.id === action.payload.id ? action.payload : u) }
    case 'DELETE_USER':
      return { ...state, users: state.users.filter(u => u.id !== action.payload) }
    case 'BULK_UPDATE_USERS':
      return {
        ...state,
        users: state.users.map(u => action.payload.ids.includes(u.id) ? { ...u, ...action.payload.data } : u)
      }

    // Departments
    case 'SET_DEPARTMENTS':
      return { ...state, departments: action.payload }
    case 'ADD_DEPARTMENT':
      return { ...state, departments: [...state.departments, action.payload] }
    case 'UPDATE_DEPARTMENT':
      return { ...state, departments: state.departments.map(d => d.id === action.payload.id ? action.payload : d) }
    case 'DELETE_DEPARTMENT':
      return { ...state, departments: state.departments.filter(d => d.id !== action.payload) }

    // Categories
    case 'SET_CATEGORIES':
      return { ...state, categories: action.payload }
    case 'ADD_CATEGORY':
      return { ...state, categories: [...state.categories, action.payload] }
    case 'UPDATE_CATEGORY':
      return { ...state, categories: state.categories.map(c => c.id === action.payload.id ? action.payload : c) }
    case 'DELETE_CATEGORY':
      return { ...state, categories: state.categories.filter(c => c.id !== action.payload) }

    // UI
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'SHOW_TOAST':
      return { ...state, toast: action.payload }
    case 'HIDE_TOAST':
      return { ...state, toast: null }

    default:
      return state
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  // Persist auth to sessionStorage
  useEffect(() => {
    const stored = sessionStorage.getItem('docvault_user')
    if (stored) {
      try { dispatch({ type: 'LOGIN', payload: JSON.parse(stored) }) } catch {}
    }
  }, [])

  useEffect(() => {
    if (state.user) {
      sessionStorage.setItem('docvault_user', JSON.stringify(state.user))
    } else {
      sessionStorage.removeItem('docvault_user')
    }
  }, [state.user])

  // Auto-hide toast
  useEffect(() => {
    if (state.toast) {
      const t = setTimeout(() => dispatch({ type: 'HIDE_TOAST' }), 3500)
      return () => clearTimeout(t)
    }
  }, [state.toast])

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be inside AppProvider')
  return ctx
}

// Convenience hook for toast
export function useToast() {
  const { dispatch } = useApp()
  return (message, type = 'success') => dispatch({ type: 'SHOW_TOAST', payload: { message, type } })
}
