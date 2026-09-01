import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.alejandrodev.micuaderno',
  appName: 'MiCuaderno',
  webDir: 'dist',
  plugins: {
    StatusBar: {
      // Edge-to-edge en todas las versiones de Android soportadas (en
      // Android 15+ el sistema ya lo fuerza igualmente, esto solo iguala el
      // comportamiento en versiones anteriores). El contenido respeta las
      // áreas seguras con env(safe-area-inset-*) en CSS.
      overlaysWebView: true,
      // Fondo claro (tema crema de la app) -> iconos/texto oscuros.
      style: 'LIGHT',
    },
  },
}

export default config
