import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider, useApp } from './contexts/AppContext'

// Layouts
import UserLayout from './components/layouts/UserLayout'
import AdminLayout from './components/layouts/AdminLayout'

// Pages
import LoginPage from './pages/auth/LoginPage'
import DocumentList from './pages/user/DocumentList'
import DocumentDetail from './pages/user/DocumentDetail'
import UsersManagement from './pages/admin/UsersManagement'
import DepartmentManagement from './pages/admin/DepartmentManagement'
import CategoryManagement from './pages/admin/CategoryManagement'

// Common
import Toast from './components/common/Toast'

function ProtectedRoute({ children, role }) {
  const { state } = useApp()
  if (!state.user) return <Navigate to="/login" replace />
  if (role && state.user.role !== role) return <Navigate to="/" replace />
  return children
}

function RootRedirect() {
  const { state } = useApp()
  if (!state.user) return <Navigate to="/login" replace />
  if (state.user.role === 'admin') return <Navigate to="/admin/users" replace />
  return <Navigate to="/documents" replace />
}

function AppRoutes() {
  const { state } = useApp()
  return (
    <>
      <Routes>
        <Route path="/login" element={state.user ? <RootRedirect /> : <LoginPage />} />
        <Route path="/" element={<RootRedirect />} />

        {/* User routes */}
        <Route path="/" element={
          <ProtectedRoute><UserLayout /></ProtectedRoute>
        }>
          <Route path="documents" element={<DocumentList />} />
          <Route path="documents/:id" element={<DocumentDetail />} />
        </Route>

        {/* Admin routes */}
        <Route path="/admin" element={
          <ProtectedRoute role="admin"><AdminLayout /></ProtectedRoute>
        }>
          <Route path="users" element={<UsersManagement />} />
          <Route path="departments" element={<DepartmentManagement />} />
          <Route path="categories" element={<CategoryManagement />} />
          <Route path="documents" element={<DocumentList />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toast />
    </>
  )
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  )
}
