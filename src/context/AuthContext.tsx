import { App as CapacitorApp } from '@capacitor/app'
import { Browser } from '@capacitor/browser'
import { Capacitor } from '@capacitor/core'
import {
  type User,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithCredential,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
} from 'firebase/auth'
import {
  type ReactNode,
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import { useNavigate } from 'react-router-dom'
import { auth, googleProvider } from '@/services/firebase'

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  'auth/account-exists-with-different-credential':
    'Ya existe una cuenta con ese correo usando otro método de acceso.',
  'auth/credential-already-in-use':
    'Esa cuenta de Google ya está asociada a otro usuario.',
  'auth/network-request-failed':
    'Fallo de red al iniciar sesión. Revisa tu conexión e inténtalo de nuevo.',
  'auth/user-disabled': 'Esta cuenta ha sido deshabilitada.',
  'auth/timeout':
    'La autenticación ha tardado demasiado. Inténtalo de nuevo.',
  'auth/web-storage-unsupported':
    'Tu navegador bloquea el almacenamiento necesario para iniciar sesión.',
}

function getAuthErrorCode(error: unknown): string | undefined {
  if (error && typeof error === 'object' && 'code' in error) {
    return String((error as { code: unknown }).code)
  }
  return undefined
}

export function describeAuthError(error: unknown): string {
  const code = getAuthErrorCode(error)
  return (
    (code && AUTH_ERROR_MESSAGES[code]) ??
    'No se ha podido completar el inicio de sesión con Google.'
  )
}

function isUserCancelledGoogleSignIn(error: unknown): boolean {
  // Web (signInWithPopup): el usuario cierra la ventana de Google.
  if (getAuthErrorCode(error) === 'auth/popup-closed-by-user') return true

  // Nativo: el usuario cierra la pestaña de Chrome Custom Tabs sin llegar a
  // completar el login (sin recibir antes el App Link de vuelta).
  if (getAuthErrorCode(error) === 'auth/native-google-cancelled') return true

  return false
}

// redirect_uri de tipo Web verificado como App Link (ver AndroidManifest.xml
// y public/.well-known/assetlinks.json): Google no admite un esquema
// personalizado (micuaderno://) como redirect_uri para un client_id de tipo
// Web, así que en nativo se abre esta URL HTTPS en Chrome Custom Tabs y
// Android la intercepta antes de que llegue a cargarse como página.
const NATIVE_REDIRECT_URI = 'https://micuaderno.onrender.com/auth-callback'
const GOOGLE_AUTH_ENDPOINT = 'https://accounts.google.com/o/oauth2/v2/auth'
const NATIVE_GOOGLE_SIGN_IN_TIMEOUT_MS = 60_000

function randomToken(): string {
  return crypto.randomUUID().replace(/-/g, '')
}

function buildGoogleAuthUrl(state: string, nonce: string): string {
  const params = new URLSearchParams({
    client_id: import.meta.env.VITE_GOOGLE_WEB_CLIENT_ID,
    redirect_uri: NATIVE_REDIRECT_URI,
    response_type: 'id_token',
    scope: 'openid email profile',
    prompt: 'select_account',
    state,
    nonce,
  })
  return `${GOOGLE_AUTH_ENDPOINT}?${params.toString()}`
}

function decodeIdTokenNonce(idToken: string): string | undefined {
  try {
    const payload = idToken.split('.')[1]
    if (!payload) return undefined
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      '=',
    )
    const json = JSON.parse(atob(padded)) as { nonce?: string }
    return json.nonce
  } catch {
    return undefined
  }
}

function nativeCancelledError(): Error {
  return Object.assign(new Error('Login con Google cancelado'), {
    code: 'auth/native-google-cancelled',
  })
}

function nativeTimeoutError(): Error {
  return Object.assign(new Error('Tiempo de espera agotado'), {
    code: 'auth/timeout',
  })
}

/**
 * Login nativo con Google vía Chrome Custom Tabs + App Link. Devuelve una
 * promesa que se resuelve cuando la sesión de Firebase queda establecida, se
 * rechaza con `auth/native-google-cancelled` si el usuario cierra la pestaña
 * sin completar el login, con `auth/timeout` si no llega respuesta en 60s, o
 * con el error de Firebase/validación correspondiente en cualquier otro caso.
 *
 * `registerCleanup` recibe una función de limpieza (listeners + timeout) que
 * el llamante debe invocar si el componente se desmonta antes de que esta
 * promesa se resuelva.
 */
function signInWithGoogleNative(
  registerCleanup: (cleanup: () => void) => () => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const state = randomToken()
    const nonce = randomToken()
    let settled = false
    let timeoutId: ReturnType<typeof setTimeout>
    let appUrlListenerHandle: { remove: () => void } | undefined
    let browserFinishedListenerHandle: { remove: () => void } | undefined

    function cleanup() {
      clearTimeout(timeoutId)
      appUrlListenerHandle?.remove()
      browserFinishedListenerHandle?.remove()
    }

    const unregisterCleanup = registerCleanup(cleanup)

    function settle(fn: () => void) {
      if (settled) return
      settled = true
      cleanup()
      unregisterCleanup()
      fn()
    }

    timeoutId = setTimeout(() => {
      settle(() => {
        void Browser.close().catch(() => {})
        reject(nativeTimeoutError())
      })
    }, NATIVE_GOOGLE_SIGN_IN_TIMEOUT_MS)

    void CapacitorApp.addListener('appUrlOpen', ({ url }) => {
      if (!url.startsWith(NATIVE_REDIRECT_URI)) return
      settle(() => {
        void Browser.close().catch(() => {})
        try {
          const fragment = url.split('#')[1] ?? ''
          const params = new URLSearchParams(fragment)
          const idToken = params.get('id_token')
          const returnedState = params.get('state')
          if (!idToken || returnedState !== state) {
            throw new Error('Respuesta de Google inválida (state)')
          }
          if (decodeIdTokenNonce(idToken) !== nonce) {
            throw new Error('Respuesta de Google inválida (nonce)')
          }
          signInWithCredential(auth, GoogleAuthProvider.credential(idToken))
            .then(() => resolve())
            .catch(reject)
        } catch (error) {
          reject(error)
        }
      })
    }).then((handle) => {
      appUrlListenerHandle = handle
    })

    void Browser.addListener('browserFinished', () => {
      // Se dispara tanto si el usuario cierra la pestaña manualmente (sin
      // haber recibido antes el appUrlOpen) como al llamar nosotros a
      // Browser.close() tras uno ya procesado; `settle` ignora esta segunda
      // llamada porque `settled` ya es true. En el primer caso se rechaza
      // con el sentinel de cancelación: isUserCancelledGoogleSignIn lo
      // reconoce y el llamante lo trata como cancelación silenciosa (sin
      // mostrar error ni navegar).
      settle(() => reject(nativeCancelledError()))
    }).then((handle) => {
      browserFinishedListenerHandle = handle
    })

    void Browser.open({ url: buildGoogleAuthUrl(state, nonce) })
  })
}

interface AuthContextValue {
  user: User | null
  loading: boolean
  signUp: (email: string, password: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signInWithGoogle: (returnTo?: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const pendingNativeCleanupsRef = useRef<Set<() => void>>(new Set())

  useEffect(() => {
    return onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser)
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    const pendingCleanups = pendingNativeCleanupsRef.current
    return () => {
      for (const cleanup of pendingCleanups) cleanup()
      pendingCleanups.clear()
    }
  }, [])

  const value: AuthContextValue = {
    user,
    loading,
    signUp: async (email, password) => {
      await createUserWithEmailAndPassword(auth, email, password)
    },
    signIn: async (email, password) => {
      await signInWithEmailAndPassword(auth, email, password)
    },
    signInWithGoogle: async (returnTo) => {
      try {
        if (Capacitor.isNativePlatform()) {
          // Flujo nativo (Android): signInWithPopup no es fiable en un
          // WebView (Google bloquea OAuth embebido). Se abre la pantalla de
          // consentimiento de Google en Chrome Custom Tabs y se recupera el
          // id_token cuando Android entrega de vuelta el App Link
          // verificado a esta app (ver signInWithGoogleNative).
          await signInWithGoogleNative((cleanup) => {
            const cleanups = pendingNativeCleanupsRef.current
            cleanups.add(cleanup)
            return () => cleanups.delete(cleanup)
          })
        } else {
          await signInWithPopup(auth, googleProvider)
        }
      } catch (error) {
        // El usuario cancela el selector/ventana de Google sin completar el
        // acceso: no es un error real, así que no se propaga ni se muestra.
        if (isUserCancelledGoogleSignIn(error)) return
        throw error
      }
      navigate(
        returnTo ?? `${window.location.pathname}${window.location.search}`,
        { replace: true },
      )
    },
    signOut: async () => {
      await firebaseSignOut(auth)
    },
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}
