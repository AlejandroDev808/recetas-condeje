import { AnimatePresence } from 'framer-motion'
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom'
import { Footer } from '@/components/layout/Footer'
import { MusicPlayer } from '@/components/layout/MusicPlayer'
import { NavBar } from '@/components/layout/NavBar'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import { LoginPage } from '@/pages/LoginPage'
import { MealPreviewPage } from '@/pages/MealPreviewPage'
import { NotebookPage } from '@/pages/NotebookPage'
import { RecipeDetailPage } from '@/pages/RecipeDetailPage'
import { RecipeFormPage } from '@/pages/RecipeFormPage'
import { SearchPage } from '@/pages/SearchPage'

function AnimatedRoutes() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Navigate to="/buscar" replace />} />
        <Route path="/buscar" element={<SearchPage />} />
        <Route path="/buscar/:id" element={<MealPreviewPage />} />
        <Route path="/mi-cuaderno" element={<NotebookPage />} />
        <Route path="/mi-cuaderno/nueva" element={<RecipeFormPage />} />
        <Route path="/mi-cuaderno/:id/editar" element={<RecipeFormPage />} />
        <Route path="/recetas/:id" element={<RecipeDetailPage />} />
        <Route path="/entrar" element={<LoginPage />} />
      </Routes>
    </AnimatePresence>
  )
}

function AppShell() {
  const { resolvingRedirect } = useAuth()

  // Mientras se resuelve el resultado de signInWithRedirect (justo al
  // recargar tras volver de Google) se evita pintar rutas o el NavBar con
  // un estado de sesión que todavía no es definitivo.
  if (resolvingRedirect) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-cream-100">
        <p className="text-espresso-500/60">Un momento…</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-svh flex-col overflow-x-hidden bg-cream-100">
      <NavBar />
      <div className="flex-1">
        <AnimatedRoutes />
      </div>
      <Footer />
      <MusicPlayer />
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
