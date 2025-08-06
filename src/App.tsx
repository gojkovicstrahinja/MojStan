import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth'
import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'
import PropertyDetail from './pages/PropertyDetail'
import Dashboard from '@/pages/Dashboard'
import PostProperty from '@/pages/PostProperty'
import Search from '@/pages/Search'
import Messages from '@/pages/Messages'
import Navigation from './components/Navigation'
import ProtectedRoute from './components/ProtectedRoute'
import { Toaster } from 'sonner'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/search" element={<Search />} />
            <Route path="/property/:id" element={<PropertyDetail />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/post-property" 
              element={
                <ProtectedRoute>
                  <PostProperty />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/messages" 
              element={
                <ProtectedRoute>
                  <Messages />
                </ProtectedRoute>
              } 
            />
          </Routes>
          <Toaster position="top-right" richColors />
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
