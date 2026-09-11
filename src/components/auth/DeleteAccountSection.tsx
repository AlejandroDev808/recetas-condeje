import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

function getErrorCode(error: unknown): string | undefined {
  if (error && typeof error === 'object' && 'code' in error) {
    return String((error as { code: unknown }).code)
  }
  return undefined
}

function isCancelledReauth(error: unknown): boolean {
  const code = getErrorCode(error)
  return code === 'auth/popup-closed-by-user' || code === 'auth/native-google-cancelled'
}

function describeDeleteError(error: unknown): string {
  const code = getErrorCode(error)
  if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
    return 'Contraseña incorrecta.'
  }
  if (error instanceof Error && error.message) return error.message
  return 'No se ha podido eliminar la cuenta. Inténtalo de nuevo.'
}

/**
 * Requisito de la política de Google Play: si la app permite crear cuenta
 * dentro de ella (aquí, con email/contraseña), también debe permitir
 * solicitar su borrado desde dentro de la app, no solo por email.
 */
export function DeleteAccountSection() {
  const { user, deleteAccount } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!user) return null
  const needsPassword = user.providerData[0]?.providerId === 'password'

  function reset() {
    setOpen(false)
    setPassword('')
    setError(null)
  }

  async function handleConfirm() {
    setBusy(true)
    setError(null)
    try {
      await deleteAccount(needsPassword ? password : undefined)
      navigate('/buscar', { replace: true })
    } catch (err) {
      setBusy(false)
      if (isCancelledReauth(err)) return
      setError(describeDeleteError(err))
    }
  }

  return (
    <div className="mt-16 border-t border-espresso-500/10 pt-6">
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="text-sm text-espresso-500/60 underline decoration-espresso-500/20 underline-offset-2 transition-colors hover:text-red-700"
        >
          Eliminar mi cuenta
        </button>
      ) : (
        <div className="max-w-md rounded-2xl border border-red-900/15 bg-red-50/60 p-4">
          <p className="text-sm font-medium text-red-900">
            Esto borrará tu cuenta y todas tus recetas guardadas de forma
            permanente. No se puede deshacer.
          </p>

          {needsPassword && (
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Confirma tu contraseña"
              className="mt-3 w-full rounded-lg border border-espresso-500/15 bg-cream-50 px-3 py-2 text-sm text-espresso-700 outline-none focus:border-terracotta-500"
            />
          )}

          {error && <p className="mt-2 text-sm text-red-700">{error}</p>}

          <div className="mt-3 flex gap-2">
            <button
              type="button"
              disabled={busy || (needsPassword && !password)}
              onClick={() => void handleConfirm()}
              className="rounded-full bg-red-700 px-4 py-1.5 text-sm font-medium text-cream-50 transition-colors hover:bg-red-800 disabled:opacity-50"
            >
              {busy ? 'Eliminando…' : 'Sí, eliminar mi cuenta'}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={reset}
              className="rounded-full border border-espresso-500/15 px-4 py-1.5 text-sm font-medium text-espresso-600 transition-colors hover:bg-cream-200"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
