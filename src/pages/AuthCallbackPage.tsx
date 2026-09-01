// Red de seguridad: en el flujo normal, este redirect_uri lo intercepta la
// app nativa como App Link verificado antes de llegar a cargarse como
// página (ver AndroidManifest.xml). Si algún dispositivo aún no ha
// propagado la verificación, el navegador cae aquí en su lugar — no hay
// nada que hacer con los parámetros de la URL, solo invitar a volver.
export function AuthCallbackPage() {
  return (
    <section className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-4 py-10 text-center">
      <h1 className="font-display text-2xl text-espresso-700">
        Puedes volver a la aplicación
      </h1>
      <p className="mt-2 text-espresso-500/70">
        Ya puedes cerrar esta pestaña y continuar en MiCuaderno.
      </p>
    </section>
  )
}
