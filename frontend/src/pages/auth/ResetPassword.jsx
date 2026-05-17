import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Lock,
  Eye,
  EyeOff,
  HeartPulse,
  CheckCircle,
  AlertCircle,
  ShieldCheck,
  KeyRound,
  ArrowLeft
} from 'lucide-react'
import api from '../../services/api'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const navigate = useNavigate()

  const [form, setForm] = useState({ password: '', confirmar: '' })
  const [loading, setLoading] = useState(false)
  const [exito, setExito] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmar, setShowConfirmar] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (form.password.length < 8) {
      return setError('La contraseña debe tener al menos 8 caracteres')
    }

    if (form.password !== form.confirmar) {
      return setError('Las contraseñas no coinciden')
    }

    if (!token) {
      return setError('Token inválido. Solicita un nuevo enlace de recuperación.')
    }

    setLoading(true)

    try {
      await api.post('/auth/reset-password', {
        token,
        password: form.password
      })

      setExito(true)
      setTimeout(() => navigate('/login'), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Error al restablecer la contraseña.')
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-11 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-[#00CCA5] focus:bg-white focus:ring-4 focus:ring-[#00CCA5]/15'

  if (!token) {
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
                <div className="mb-8">
                  <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
                    <AlertCircle size={34} className="text-red-500" />
                  </div>

                  <span className="mb-5 inline-flex items-center gap-2 rounded-full bg-red-50 px-4 py-2 text-xs font-black text-red-600">
                    Enlace no válido
                  </span>

                  <h1 className="text-4xl font-black leading-tight tracking-tight text-[#000089] sm:text-5xl">
                    Link inválido o expirado
                  </h1>

                  <p className="mt-4 max-w-md text-sm leading-7 text-slate-500">
                    Este enlace de recuperación no es válido o ya expiró.
                    Solicita uno nuevo para restablecer tu contraseña.
                  </p>
                </div>

                <Link
                  to="/forgot-password"
                  className="flex h-12 w-full items-center justify-center rounded-2xl bg-[#000089] text-sm font-black text-white shadow-lg shadow-[#000089]/20 transition hover:bg-[#000070] hover:ring-4 hover:ring-[#00CCA5]/15"
                >
                  Solicitar nuevo enlace
                </Link>

                <div className="mt-7 border-t border-slate-200 pt-6">
                  <p className="text-center text-sm text-slate-500">
                    ¿Ya tienes acceso?{' '}
                    <Link
                      to="/login"
                      className="font-black text-[#00a98a] transition hover:text-[#000089]"
                    >
                      Inicia sesión
                    </Link>
                  </p>
                </div>

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

            <div className="absolute inset-0 bg-gradient-to-br from-[#000089]/12 via-transparent to-[#00CCA5]/10" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_18%,rgba(0,204,165,0.08),transparent_30%)]" />
          </section>
        </div>
      </main>
    )
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
                {!exito ? (
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
                        Restablecimiento seguro
                      </span>

                      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#000089]/10">
                        <KeyRound size={27} className="text-[#000089]" />
                      </div>

                      <h1 className="text-4xl font-black leading-tight tracking-tight text-[#000089] sm:text-5xl">
                        Nueva contraseña
                      </h1>

                      <p className="mt-4 max-w-md text-sm leading-7 text-slate-500">
                        Crea una nueva contraseña para recuperar el acceso a tu
                        cuenta de LuminaMedic.
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
                          Nueva contraseña
                        </label>

                        <div className="relative">
                          <Lock
                            size={17}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                          />

                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={form.password}
                            onChange={(e) =>
                              setForm({ ...form, password: e.target.value })
                            }
                            placeholder="Mínimo 8 caracteres"
                            required
                            className={inputClass}
                          />

                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-[#000089]"
                            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                          >
                            {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="mb-2 block text-xs font-black text-slate-700">
                          Confirmar contraseña
                        </label>

                        <div className="relative">
                          <Lock
                            size={17}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                          />

                          <input
                            type={showConfirmar ? 'text' : 'password'}
                            value={form.confirmar}
                            onChange={(e) =>
                              setForm({ ...form, confirmar: e.target.value })
                            }
                            placeholder="Repite tu nueva contraseña"
                            required
                            className={inputClass}
                          />

                          <button
                            type="button"
                            onClick={() => setShowConfirmar(!showConfirmar)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-[#000089]"
                            aria-label={showConfirmar ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                          >
                            {showConfirmar ? <EyeOff size={17} /> : <Eye size={17} />}
                          </button>
                        </div>

                        {form.confirmar && (
                          <p
                            className={`mt-2 text-xs font-bold ${
                              form.password === form.confirmar
                                ? 'text-emerald-600'
                                : 'text-red-500'
                            }`}
                          >
                            {form.password === form.confirmar
                              ? '✓ Las contraseñas coinciden'
                              : '✗ Las contraseñas no coinciden'}
                          </p>
                        )}
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
                            Guardando...
                          </span>
                        ) : (
                          'Restablecer contraseña'
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
                        Contraseña actualizada
                      </span>

                      <h1 className="text-4xl font-black leading-tight tracking-tight text-[#000089] sm:text-5xl">
                        Acceso recuperado
                      </h1>

                      <p className="mt-4 max-w-md text-sm leading-7 text-slate-500">
                        Tu contraseña fue cambiada correctamente. Serás redirigido
                        al inicio de sesión en unos segundos.
                      </p>
                    </div>

                    <Link
                      to="/login"
                      className="flex h-12 w-full items-center justify-center rounded-2xl bg-[#000089] text-sm font-black text-white shadow-lg shadow-[#000089]/20 transition hover:bg-[#000070]"
                    >
                      Ir al inicio de sesión
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