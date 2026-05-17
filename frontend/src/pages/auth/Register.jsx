import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Phone,
  Search,
  Loader2,
  CheckCircle,
  AlertCircle,
  CreditCard,
  ArrowRight,
  ArrowLeft,
  Calendar,
  ShieldCheck,
  HeartPulse
} from 'lucide-react'
import api from '../../services/api'

const STEPS = ['Identidad', 'Cuenta']

const calcularEdad = (fechaNac) => {
  if (!fechaNac) return null

  const fecha = new Date(fechaNac)
  const hoy = new Date()

  return (
    hoy.getFullYear() -
    fecha.getFullYear() -
    (hoy < new Date(hoy.getFullYear(), fecha.getMonth(), fecha.getDate()) ? 1 : 0)
  )
}

export default function Register() {
  const [step, setStep] = useState(1)

  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    password: '',
    confirmar: '',
    tipoDocumento: 'DNI',
    numeroDocumento: '',
    fuenteNombre: 'MANUAL',
    fechaNac: ''
  })

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmar, setShowConfirmar] = useState(false)
  const [buscando, setBuscando] = useState(false)
  const [aceptaTerminos, setAceptaTerminos] = useState(false)
  const [estadoVerificacion, setEstadoVerificacion] = useState(null)

  const navigate = useNavigate()

  const edad = calcularEdad(form.fechaNac)
  const esMenor = edad !== null && edad < 18
  const esDNI = form.tipoDocumento === 'DNI'

  const inputBase =
    'h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-[#00CCA5] focus:bg-white focus:ring-4 focus:ring-[#00CCA5]/15'

  const handleChange = (e) => {
    const { name, value } = e.target

    if (name === 'tipoDocumento') {
      setEstadoVerificacion(null)
      setForm((prev) => ({
        ...prev,
        tipoDocumento: value,
        numeroDocumento: '',
        nombre: '',
        apellido: '',
        fuenteNombre: 'MANUAL'
      }))
      return
    }

    if (name === 'numeroDocumento') setEstadoVerificacion(null)

    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const buscarDni = async () => {
    if (form.numeroDocumento.length !== 8) {
      return setError('El DNI debe tener 8 dígitos')
    }

    setError('')
    setBuscando(true)

    try {
      const res = await api.get(`/auth/consultar-dni/${form.numeroDocumento}`)

      setForm((prev) => ({
        ...prev,
        nombre: res.data.nombres,
        apellido: `${res.data.apellido_paterno} ${res.data.apellido_materno}`,
        fuenteNombre: 'RENIEC_API'
      }))

      setEstadoVerificacion('verificado')
    } catch {
      setForm((prev) => ({ ...prev, fuenteNombre: 'MANUAL' }))
      setEstadoVerificacion('manual')
    } finally {
      setBuscando(false)
    }
  }

  const handleNextStep = (e) => {
    e.preventDefault()
    setError('')

    if (!form.numeroDocumento) return setError('El número de documento es requerido')
    if (form.tipoDocumento === 'DNI' && form.numeroDocumento.length !== 8) {
      return setError('El DNI debe tener 8 dígitos')
    }
    if (!form.nombre.trim()) return setError('El nombre es requerido')
    if (!form.apellido.trim()) return setError('El apellido es requerido')
    if (!form.fechaNac) return setError('La fecha de nacimiento es requerida')
    if (esMenor) {
      return setError(
        'Debes tener al menos 18 años para registrarte. Los menores de edad deben ser registrados por un tutor desde la clínica.'
      )
    }

    setStep(2)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (form.password.length < 8) {
      return setError('La contraseña debe tener al menos 8 caracteres')
    }

    if (form.password !== form.confirmar) {
      return setError('Las contraseñas no coinciden')
    }

    if (!aceptaTerminos) {
      return setError('Debes aceptar la Política de Privacidad para continuar')
    }

    setLoading(true)

    try {
      await api.post('/auth/register', {
        nombre: form.nombre,
        apellido: form.apellido,
        email: form.email,
        telefono: form.telefono,
        password: form.password,
        tipoDocumento: form.tipoDocumento,
        numeroDocumento: form.numeroDocumento,
        fuenteNombre: form.fuenteNombre,
        fechaNac: form.fechaNac
      })

      navigate('/login?registered=true')
    } catch (err) {
      setError(err.response?.data?.message || 'Error al crear la cuenta. Intenta de nuevo.')
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
        {/* Panel de formulario */}
        <section className="relative flex min-h-screen items-center justify-center bg-[#F8FBFC] px-5 py-4 sm:px-8 lg:h-screen lg:overflow-hidden lg:px-12 xl:px-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,204,165,0.16),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(0,0,137,0.08),transparent_34%)]" />

          <div className="relative z-10 flex w-full items-center justify-center">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="w-full max-w-[560px]"
            >
              {/* Header */}
              <div className="mb-5">
                <span className="mb-5 inline-flex items-center gap-2 rounded-full bg-[#00CCA5]/10 px-4 py-2 text-xs font-black text-[#008f78]">
                  <ShieldCheck size={14} />
                  Registro seguro
                </span>

                <h1 className="text-3xl font-black leading-tight tracking-tight text-[#000089] sm:text-4xl">
                  Crea tu cuenta
                </h1>

                <p className="mt-4 max-w-md text-sm leading-7 text-slate-500">
                  Regístrate para reservar citas y acceder a tu panel de paciente
                  en LuminaMedic.
                </p>
              </div>

              {/* Stepper */}
              <div className="mb-5 grid grid-cols-2 gap-3">
                {STEPS.map((label, index) => {
                  const num = index + 1
                  const activo = step === num
                  const completado = step > num

                  return (
                    <div
                      key={label}
                      className={`rounded-2xl border px-3 py-2.5 transition ${
                        activo
                          ? 'border-[#000089]/20 bg-[#000089]/5'
                          : completado
                            ? 'border-[#00CCA5]/30 bg-[#00CCA5]/10'
                            : 'border-slate-200 bg-white/70'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-xl text-xs font-black ${
                            completado
                              ? 'bg-[#00CCA5] text-white'
                              : activo
                                ? 'bg-[#000089] text-white'
                                : 'bg-slate-200 text-slate-500'
                          }`}
                        >
                          {completado ? <CheckCircle size={15} /> : num}
                        </div>

                        <div>
                          <p
                            className={`text-sm font-black ${
                              activo || completado ? 'text-slate-900' : 'text-slate-500'
                            }`}
                          >
                            {label}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {num === 1 ? 'Datos personales' : 'Acceso al sistema'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
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

              <AnimatePresence mode="wait">
                {/* Paso 1 */}
                {step === 1 && (
                  <motion.form
                    key="step1"
                    initial={{ opacity: 0, x: 18 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -18 }}
                    transition={{ duration: 0.2 }}
                    onSubmit={handleNextStep}
                    className="space-y-3.5"
                  >
                    <div>
                      <h3 className="text-lg font-black text-slate-900">
                        Tu identidad
                      </h3>
                      <p className="mt-1 text-xs text-slate-500">
                        Ingresa tus datos personales para crear tu perfil.
                      </p>
                    </div>

                    {/* Documento */}
                    <div>
                      <label className="mb-2 block text-xs font-black text-slate-700">
                        Documento de identidad <span className="text-red-400">*</span>
                      </label>

                      <div className="grid gap-2 sm:grid-cols-[130px_1fr_auto]">
                        <select
                          name="tipoDocumento"
                          value={form.tipoDocumento}
                          onChange={handleChange}
                          className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none transition focus:border-[#00CCA5] focus:bg-white focus:ring-4 focus:ring-[#00CCA5]/15"
                        >
                          <option value="DNI">DNI</option>
                          <option value="CE">Carné Ext.</option>
                          <option value="PASAPORTE">Pasaporte</option>
                        </select>

                        <div className="relative">
                          <CreditCard
                            size={16}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                          />

                          <input
                            name="numeroDocumento"
                            value={form.numeroDocumento}
                            onChange={handleChange}
                            maxLength={esDNI ? 8 : 12}
                            placeholder={esDNI ? '12345678' : 'Número de documento'}
                            className={`${inputBase} pl-11 pr-4 ${
                              estadoVerificacion === 'verificado'
                                ? 'border-emerald-300 bg-emerald-50/40'
                                : ''
                            }`}
                          />
                        </div>

                        {esDNI && (
                          <button
                            type="button"
                            onClick={buscarDni}
                            disabled={buscando || form.numeroDocumento.length !== 8}
                            className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#000089] px-4 text-sm font-black text-white shadow-lg shadow-[#000089]/15 transition hover:bg-[#000070] hover:ring-4 hover:ring-[#00CCA5]/15 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {buscando ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : (
                              <Search size={16} />
                            )}
                            <span className="hidden sm:inline">Buscar</span>
                          </button>
                        )}
                      </div>

                      <AnimatePresence>
                        {estadoVerificacion === 'verificado' && (
                          <motion.div
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="mt-2 flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2"
                          >
                            <CheckCircle size={14} className="flex-shrink-0 text-emerald-500" />
                            <p className="text-xs text-emerald-700">
                              Datos encontrados. Puedes editarlos si es necesario.
                            </p>
                          </motion.div>
                        )}

                        {estadoVerificacion === 'manual' && (
                          <motion.div
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="mt-2 flex items-center gap-2 rounded-xl border border-amber-100 bg-amber-50 px-3 py-2"
                          >
                            <AlertCircle size={14} className="flex-shrink-0 text-amber-500" />
                            <p className="text-xs text-amber-700">
                              DNI no encontrado. Completa tu nombre manualmente.
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Nombre y apellido */}
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-xs font-black text-slate-700">
                          Nombre <span className="text-red-400">*</span>
                        </label>

                        <div className="relative">
                          <User
                            size={16}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                          />

                          <input
                            name="nombre"
                            value={form.nombre}
                            onChange={handleChange}
                            placeholder="Carlos"
                            className={`${inputBase} pl-11 pr-4`}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="mb-2 block text-xs font-black text-slate-700">
                          Apellido <span className="text-red-400">*</span>
                        </label>

                        <div className="relative">
                          <User
                            size={16}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                          />

                          <input
                            name="apellido"
                            value={form.apellido}
                            onChange={handleChange}
                            placeholder="García"
                            className={`${inputBase} pl-11 pr-4`}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Fecha nacimiento */}
                    <div>
                      <label className="mb-2 block text-xs font-black text-slate-700">
                        Fecha de nacimiento <span className="text-red-400">*</span>
                      </label>

                      <div className="relative">
                        <Calendar
                          size={16}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                          type="date"
                          name="fechaNac"
                          value={form.fechaNac}
                          onChange={handleChange}
                          max={new Date().toISOString().split('T')[0]}
                          className={`${inputBase} pl-11 pr-4`}
                        />
                      </div>

                      <AnimatePresence>
                        {esMenor && (
                          <motion.div
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="mt-2 flex items-start gap-2 rounded-xl border border-amber-100 bg-amber-50 px-3 py-2"
                          >
                            <AlertCircle
                              size={14}
                              className="mt-0.5 flex-shrink-0 text-amber-500"
                            />
                            <p className="text-xs text-amber-700">
                              Los menores de 18 años no pueden registrarse por cuenta
                              propia. Deben ser registrados desde la clínica con los
                              datos del tutor.
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <motion.button
                      type="submit"
                      whileTap={{ scale: 0.98 }}
                      className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#000089] text-sm font-black text-white shadow-lg shadow-[#000089]/20 transition hover:bg-[#000070] hover:ring-4 hover:ring-[#00CCA5]/15 hover:shadow-xl hover:shadow-[#000089]/25"
                    >
                      Continuar <ArrowRight size={17} />
                    </motion.button>
                  </motion.form>
                )}

                {/* Paso 2 */}
                {step === 2 && (
                  <motion.form
                    key="step2"
                    initial={{ opacity: 0, x: 18 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -18 }}
                    transition={{ duration: 0.2 }}
                    onSubmit={handleSubmit}
                    className="space-y-3.5"
                  >
                    <div>
                      <h3 className="text-lg font-black text-slate-900">
                        Tu cuenta
                      </h3>
                      <p className="mt-1 text-xs text-slate-500">
                        Configura tus credenciales de acceso.
                      </p>
                    </div>

                    <div>
                      <label className="mb-2 block text-xs font-black text-slate-700">
                        Correo electrónico <span className="text-red-400">*</span>
                      </label>

                      <div className="relative">
                        <Mail
                          size={16}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                          type="email"
                          name="email"
                          value={form.email}
                          onChange={handleChange}
                          placeholder="correo@ejemplo.com"
                          required
                          className={`${inputBase} pl-11 pr-4`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-xs font-black text-slate-700">
                        Teléfono <span className="font-normal text-slate-400">(opcional)</span>
                      </label>

                      <div className="relative">
                        <Phone
                          size={16}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                          name="telefono"
                          value={form.telefono}
                          onChange={handleChange}
                          placeholder="+51 999 999 999"
                          className={`${inputBase} pl-11 pr-4`}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-xs font-black text-slate-700">
                          Contraseña <span className="text-red-400">*</span>
                        </label>

                        <div className="relative">
                          <Lock
                            size={16}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                          />

                          <input
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            placeholder="Mínimo 8 caracteres"
                            required
                            className={`${inputBase} pl-11 pr-11`}
                          />

                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-[#000089]"
                            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                          >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="mb-2 block text-xs font-black text-slate-700">
                          Confirmar <span className="text-red-400">*</span>
                        </label>

                        <div className="relative">
                          <Lock
                            size={16}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                          />

                          <input
                            type={showConfirmar ? 'text' : 'password'}
                            name="confirmar"
                            value={form.confirmar}
                            onChange={handleChange}
                            placeholder="Repite tu contraseña"
                            required
                            className={`${inputBase} pl-11 pr-11`}
                          />

                          <button
                            type="button"
                            onClick={() => setShowConfirmar(!showConfirmar)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-[#000089]"
                            aria-label={showConfirmar ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                          >
                            {showConfirmar ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {form.confirmar && (
                      <p
                        className={`text-xs font-bold ${
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

                    {/* Consentimiento */}
                    <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white/70 p-4">
                      <input
                        type="checkbox"
                        id="terminos"
                        checked={aceptaTerminos}
                        onChange={(e) => setAceptaTerminos(e.target.checked)}
                        className="mt-0.5 h-4 w-4 flex-shrink-0 cursor-pointer rounded border-slate-300 text-[#000089] focus:ring-[#00CCA5]"
                      />

                      <label
                        htmlFor="terminos"
                        className="cursor-pointer text-xs leading-relaxed text-slate-600"
                      >
                        He leído y acepto la{' '}
                        <a
                          href="/privacidad"
                          target="_blank"
                          className="font-bold text-[#000089] underline transition hover:text-[#00a98a]"
                        >
                          Política de Privacidad
                        </a>{' '}
                        y autorizo el tratamiento de mis datos personales conforme a la{' '}
                        <span className="font-bold">Ley N° 29733</span>.
                      </label>
                    </div>

                    <div className="flex gap-3 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setStep(1)
                          setError('')
                        }}
                        className="flex h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
                      >
                        <ArrowLeft size={16} /> Atrás
                      </button>

                      <motion.button
                        type="submit"
                        disabled={loading || !aceptaTerminos}
                        whileTap={{ scale: 0.98 }}
                        className="h-12 flex-1 rounded-2xl bg-[#000089] text-sm font-black text-white shadow-lg shadow-[#000089]/20 transition hover:bg-[#000070] hover:ring-4 hover:ring-[#00CCA5]/15 hover:shadow-xl hover:shadow-[#000089]/25 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {loading ? (
                          <span className="flex items-center justify-center gap-2">
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                            Creando cuenta...
                          </span>
                        ) : (
                          'Crear cuenta'
                        )}
                      </motion.button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>

              <div className="mt-7 border-t border-slate-200 pt-6">
                <p className="text-center text-sm text-slate-500">
                  ¿Ya tienes cuenta?{' '}
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