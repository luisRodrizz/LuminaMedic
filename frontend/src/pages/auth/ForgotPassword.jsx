import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Mail,
  ArrowLeft,
  HeartPulse,
  CheckCircle,
  ShieldCheck,
  KeyRound
} from 'lucide-react'
import api from '../../services/api'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await api.post('/auth/forgot-password', { email })
      setEnviado(true)
    } catch {
      setError('Error al procesar la solicitud. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main
      className="min-h-screen overflow-hidden bg-[#F8FBFC] text-slate-900"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <div className="grid min-h-screen lg:grid-cols-[0.95fr_1.05fr]">
       {/* Panel formulario */}
      <section className="relative flex min-h-screen flex-col bg-[#F8FBFC] px-5 py-6 sm:px-8 lg:h-screen lg:overflow-hidden lg:px-12 xl:px-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,204,165,0.16),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(0,0,137,0.08),transparent_34%)]" />

        <motion.header
          initial={{ opacity: 0, y: -14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="relative z-10 flex w-full items-center justify-between gap-3"
        >
          <Link
            to="/"
            className="min-w-0 inline-flex items-center transition hover:scale-[1.02]"
          >
            <img
              src="/branding/luminamedic-full.png"
              alt="LuminaMedic"
              className="h-9 w-auto max-w-[210px] object-contain sm:h-12 sm:max-w-none"
              onError={(e) => {
                e.target.style.display = 'none'
                e.target.parentNode.innerHTML = `<span class="text-xl font-black text-[#000089]">LuminaMedic</span>`
              }}
            />
          </Link>

          <Link
            to="/"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-2 text-[11px] font-black text-slate-600 shadow-sm transition hover:border-[#00CCA5]/40 hover:text-[#000089] sm:gap-2 sm:px-4 sm:text-xs"
          >
            <ArrowLeft size={13} className="sm:size-[14px]" />
            Volver al home
          </Link>
        </motion.header>

        <div className="relative z-10 flex flex-1 items-center justify-center py-8">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="w-full max-w-[500px]"
          >
            

            <AnimatePresence mode="wait">
              {!enviado ? (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="mb-8">
                    <span className="mb-5 inline-flex items-center gap-2 rounded-full bg-[#00CCA5]/10 px-4 py-2 text-xs font-black text-[#008f78]">
                      <ShieldCheck size={14} />
                      Recuperación segura
                    </span>

                    <h1 className="text-4xl font-black leading-tight tracking-tight text-[#000089] sm:text-5xl">
                      Recupera tu contraseña
                    </h1>

                    <p className="mt-4 max-w-md text-sm leading-7 text-slate-500">
                      Ingresa tu correo electrónico y te enviaremos instrucciones
                      para restablecer tu acceso de forma segura.
                    </p>
                  </div>

                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="mb-5 flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600"
                      >
                        <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-red-500" />
                        <span>{error}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <label className="mb-2 block text-xs font-black text-slate-700">
                        Correo electrónico
                      </label>

                      <div className="relative">
                        <Mail
                          size={17}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="correo@ejemplo.com"
                          required
                          className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-[#00CCA5] focus:bg-white focus:ring-4 focus:ring-[#00CCA5]/15"
                        />
                      </div>
                    </div>

                    <motion.button
                      type="submit"
                      disabled={loading}
                      whileTap={{ scale: 0.98 }}
                      className="h-12 w-full rounded-2xl bg-[#000089] text-sm font-black text-white shadow-lg shadow-[#000089]/20 transition hover:bg-[#000070] hover:ring-4 hover:ring-[#00CCA5]/15 hover:shadow-xl hover:shadow-[#000089]/25 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                          Enviando...
                        </span>
                      ) : (
                        'Enviar instrucciones'
                      )}
                    </motion.button>
                  </form>

                  <div className="mt-7 border-t border-slate-200 pt-6">
                    <p className="text-center text-sm text-slate-500">
                      ¿Recordaste tu contraseña?{' '}
                      <Link
                        to="/login"
                        className="font-black text-[#00a98a] transition hover:text-[#000089]"
                      >
                        Inicia sesión
                      </Link>
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="mb-8">
                    <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#00CCA5]/10">
                      <CheckCircle size={34} className="text-[#008f78]" />
                    </div>

                    <span className="mb-5 inline-flex items-center gap-2 rounded-full bg-[#00CCA5]/10 px-4 py-2 text-xs font-black text-[#008f78]">
                      Solicitud enviada
                    </span>

                    <h1 className="text-4xl font-black leading-tight tracking-tight text-[#000089] sm:text-5xl">
                      Revisa tu correo
                    </h1>

                    <p className="mt-4 max-w-md text-sm leading-7 text-slate-500">
                      Si el correo{' '}
                      <span className="font-black text-slate-700">{email}</span>{' '}
                      está registrado, recibirás las instrucciones en unos minutos.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white/70 px-4 py-4 text-xs leading-5 text-slate-500">
                    El enlace expira en 30 minutos. Revisa también tu carpeta de
                    spam o promociones.
                  </div>

                  <Link
                    to="/login"
                    className="mt-7 flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#000089] text-sm font-black text-white shadow-lg shadow-[#000089]/20 transition hover:bg-[#000070]"
                  >
                    <ArrowLeft size={16} />
                    Volver al inicio de sesión
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-7 flex flex-col items-center justify-center gap-2 text-center">
              <p className="text-xs text-slate-400">
                LuminaMedic © {new Date().getFullYear()} · Sistema de Gestión Clínica
              </p>

              <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400">
                <HeartPulse size={13} className="text-[#00CCA5]" />
                Claridad, confianza y acompañamiento
              </div>
            </div>
          </motion.div>
        </div>
      </section>

        {/* Panel visual */}
        <section className="relative hidden min-h-screen overflow-hidden lg:block">
          <img
            src="/landing/doctora.png"
            alt="Atención médica LuminaMedic"
            className="absolute inset-0 h-full w-full object-cover object-center"
          />

          {/* Overlay general MUY suave */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#000089]/20 via-[#000089]/10 to-[#00CCA5]/10" />

          {/* Capa sutil solo para mejorar contraste del texto */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_35%_68%,rgba(0,0,137,0.42),transparent_34%),radial-gradient(circle_at_78%_18%,rgba(0,204,165,0.08),transparent_28%)]" />
        </section>
      </div>
    </main>
  )
}