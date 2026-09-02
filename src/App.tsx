import { AnimatePresence } from 'framer-motion'
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom'
import { FloatingToolsButton } from '@/components/layout/FloatingToolsButton'
import { Footer } from '@/components/layout/Footer'
import { NavBar } from '@/components/layout/NavBar'
import { AuthProvider } from '@/context/AuthContext'
import { KitchenTimerProvider } from '@/context/KitchenTimerContext'
import { MusicPlayerProvider } from '@/context/MusicPlayerContext'
import { useAndroidBackButton } from '@/hooks/useAndroidBackButton'
import { AuthCallbackPage } from '@/pages/AuthCallbackPage'
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
        <Route path="/auth-callback" element={<AuthCallbackPage />} />
      </Routes>
    </AnimatePresence>
  )
}

function AppShell() {
  useAndroidBackButton()

  return (
    <div className="flex min-h-svh flex-col overflow-x-hidden bg-cream-100">
      <NavBar />
      <div className="flex-1">
        <AnimatedRoutes />
      </div>
      <Footer />
      <FloatingToolsButton />
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <MusicPlayerProvider>
          <KitchenTimerProvider>
            <AppShell />
          </KitchenTimerProvider>
        </MusicPlayerProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
