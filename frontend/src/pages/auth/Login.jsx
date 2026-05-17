import { useState } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import AuthLoadingScreen from '../../components/ui/AuthLoadingScreen'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  HeartPulse,
  ShieldCheck,
  CalendarCheck,
  Stethoscope,
  UsersRound,
  ArrowLeft,
  CheckCircle2
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showAccessLoader, setShowAccessLoader] = useState(false)
  const [loaderStage, setLoaderStage] = useState('loading')
  const [loaderRoleLabel, setLoaderRoleLabel] = useState('tu panel')

  const { login } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const registrado = searchParams.get('registered')

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const getRoleLabel = (role) => {
    if (role === 'ADMIN') return 'panel administrativo'
    if (role === 'DOCTOR') return 'panel médico'
    return 'portal del paciente'
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setLoaderStage('loading')
    setLoaderRoleLabel('tu panel')
    setShowAccessLoader(true)

    try {
      const res = await api.post('/auth/login', form)

      login(res.data.usuario, res.data.token)

      const role = res.data.usuario.role
      const roleLabel = getRoleLabel(role)

      setLoaderRoleLabel(roleLabel)

      await new Promise((resolve) => setTimeout(resolve, 1700))

      setLoaderStage('success')

      await new Promise((resolve) => setTimeout(resolve, 550))

      if (role === 'ADMIN') navigate('/admin/dashboard')
      else if (role === 'DOCTOR') navigate('/doctor/dashboard')
      else navigate('/paciente/dashboard')
    } catch {
      setError('Correo o contraseña incorrectos')
      setShowAccessLoader(false)
      setLoaderStage('loading')
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-[#00CCA5] focus:bg-white focus:ring-4 focus:ring-[#00CCA5]/15'

  return (
    <main
      className="min-h-screen overflow-hidden bg-[#F8FBFC] text-slate-900"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <AuthLoadingScreen
        show={showAccessLoader}
        stage={loaderStage}
        roleLabel={loaderRoleLabel}
      />

      <div className="grid min-h-screen lg:grid-cols-[0.95fr_1.05fr]">
        {/* Panel formulario */}
        <section className="relative flex min-h-screen flex-col bg-[#F8FBFC] px-5 py-6 sm:px-8 lg:px-12 xl:px-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,204,165,0.16),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(0,0,137,0.07),transparent_34%)]" />

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

          <div className="relative z-10 flex flex-1 items-center justify-center py-10">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.38, ease: 'easeOut' }}
              className="w-full max-w-[500px]"
            >
              <div className="mb-9">
                <span className="mb-5 inline-flex items-center gap-2 rounded-full bg-[#00CCA5]/10 px-4 py-2 text-xs font-black text-[#008f78]">
                  <ShieldCheck size={14} />
                  Acceso seguro
                </span>

                <h1 className="text-4xl font-black leading-tight tracking-tight text-[#000089] sm:text-5xl">
                  Bienvenido de vuelta
                </h1>

                <p className="mt-4 max-w-md text-sm leading-7 text-slate-500">
                  Ingresa tus credenciales para acceder a tu panel de
                  LuminaMedic y continuar con tu atención o gestión médica.
                </p>
              </div>

              <AnimatePresence>
                {registrado && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="mb-5 flex items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
                  >
                    <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-emerald-500" />
                    <span>
                      Cuenta creada correctamente. Ya puedes iniciar sesión.
                    </span>
                  </motion.div>
                )}

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
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="correo@ejemplo.com"
                      required
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <label className="text-xs font-black text-slate-700">
                      Contraseña
                    </label>

                    <Link
                      to="/forgot-password"
                      className="text-xs font-black text-[#000089] transition hover:text-[#00a98a]"
                    >
                      ¿Olvidaste tu contraseña?
                    </Link>
                  </div>

                  <div className="relative">
                    <Lock
                      size={17}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      required
                      className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-11 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-[#00CCA5] focus:bg-white focus:ring-4 focus:ring-[#00CCA5]/15"
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

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileTap={{ scale: 0.98 }}
                  className="h-12 w-full rounded-2xl bg-[#000089] text-sm font-black text-white shadow-lg shadow-[#000089]/20 transition hover:bg-[#000070] hover:ring-4 hover:ring-[#00CCA5]/15 hover:shadow-xl hover:shadow-[#000089]/25 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Ingresando...
                    </span>
                  ) : (
                    'Iniciar sesión'
                  )}
                </motion.button>
              </form>

              <div className="mt-7 border-t border-slate-200 pt-6">
                <p className="text-center text-sm text-slate-500">
                  ¿No tienes cuenta?{' '}
                  <Link
                    to="/register"
                    className="font-black text-[#00a98a] transition hover:text-[#000089]"
                  >
                    Regístrate aquí
                  </Link>
                </p>
              </div>

              <div className="mt-7 flex flex-col items-center justify-center gap-2 text-center">
                <p className="text-xs text-slate-400">
                  LuminaMedic © {new Date().getFullYear()} · Sistema de Gestión Clínica
                </p>
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