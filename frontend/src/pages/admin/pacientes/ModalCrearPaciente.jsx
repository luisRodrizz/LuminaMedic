import { useState } from 'react'
import {
  X,
  Users,
  Search,
  Loader2,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  UserCheck,
  UserRound,
  IdCard,
  Mail,
  Lock,
  Phone,
  CalendarDays,
  MapPin,
  VenusAndMars,
  Save
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import zxcvbn from 'zxcvbn'
import api from '../../../services/api'

const fortalezaConfig = [
  { label: 'Muy débil', color: 'bg-red-500', text: 'text-red-500' },
  { label: 'Débil', color: 'bg-orange-500', text: 'text-orange-500' },
  { label: 'Aceptable', color: 'bg-yellow-500', text: 'text-yellow-500' },
  { label: 'Fuerte', color: 'bg-[#000089]', text: 'text-[#000089]' },
  { label: 'Muy fuerte', color: 'bg-[#00CCA5]', text: 'text-[#008f78]' }
]

const STEPS = ['Identidad', 'Cuenta y datos']

const calcularEdad = (fechaNac) => {
  if (!fechaNac) return null

  const fecha = new Date(fechaNac)
  const hoy = new Date()

  return hoy.getFullYear() - fecha.getFullYear() -
    (hoy < new Date(hoy.getFullYear(), fecha.getMonth(), fecha.getDate()) ? 1 : 0)
}

export default function ModalCrearPaciente({ onClose, onSuccess }) {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    confirmar: '',
    telefono: '',
    fechaNac: '',
    genero: '',
    direccion: '',
    alergias: '',
    tipoDocumento: 'DNI',
    numeroDocumento: '',
    fuenteNombre: 'MANUAL',
    tutorNombre: '',
    tutorDni: '',
    tutorTelefono: ''
  })

  const [error, setError] = useState('')
  const [buscando, setBuscando] = useState(false)
  const [estadoVerificacion, setEstadoVerificacion] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmar, setShowConfirmar] = useState(false)
  const [loading, setLoading] = useState(false)

  const inputClass =
    'w-full h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-[#00CCA5] focus:bg-white focus:ring-4 focus:ring-[#00CCA5]/15'

  const scorePassword = form.password ? zxcvbn(form.password) : null
  const score = scorePassword?.score ?? -1
  const cfgFortaleza = score >= 0 ? fortalezaConfig[score] : null
  const edad = calcularEdad(form.fechaNac)
  const esMenor = edad !== null && edad < 18

  const handleChange = (e) => {
    const { name, value } = e.target

    if (name === 'tipoDocumento') {
      setEstadoVerificacion(null)
      setError('')
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

  const buscarDocumento = async () => {
    if (form.numeroDocumento.length !== 8) {
      return setError('El DNI debe tener 8 dígitos')
    }

    setError('')
    setBuscando(true)

    try {
      const res = await api.get(`/pacientes/documento/${form.numeroDocumento}`)

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

    setStep(2)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (form.password.length < 8) {
      return setError('La contraseña debe tener al menos 8 caracteres')
    }

    if (score < 2) {
      return setError('La contraseña es muy débil. Usa letras, números y símbolos.')
    }

    if (form.password !== form.confirmar) {
      return setError('Las contraseñas no coinciden')
    }

    if (esMenor) {
      if (!form.tutorNombre.trim()) {
        return setError('El nombre del tutor es requerido para menores de edad')
      }

      if (!/^\d{8}$/.test(form.tutorDni)) {
        return setError('El DNI del tutor debe tener 8 dígitos')
      }

      if (!form.tutorTelefono.trim()) {
        return setError('El teléfono del tutor es requerido')
      }
    }

    try {
      setLoading(true)
      const { confirmar: _, ...data } = form

      await api.post('/pacientes', data)

      onSuccess()
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Error al registrar el paciente.')
    } finally {
      setLoading(false)
    }
  }

  const esDNI = form.tipoDocumento === 'DNI'

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 16 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-[2rem] border border-white/70 bg-white shadow-2xl shadow-slate-950/20"
      >
        {/* Header */}
        <div className="relative flex-shrink-0 border-b border-slate-100 px-6 py-6">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#000089] via-[#00A98A] to-[#00CCA5]" />

          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#00CCA5]/10">
                <Users size={21} className="text-[#008f78]" />
              </div>

              <div>
                <h2 className="text-lg font-black text-slate-950">
                  Nuevo Paciente
                </h2>
                <p className="mt-0.5 text-xs text-slate-400">
                  Registra los datos de identidad, cuenta y contacto del paciente.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            >
              <X size={18} />
            </button>
          </div>

          {/* Steps */}
          <div className="mt-5 grid grid-cols-2 gap-2">
            {STEPS.map((label, i) => {
              const num = i + 1
              const activo = step === num
              const completado = step > num

              return (
                <div
                  key={label}
                  className={`flex items-center gap-3 rounded-2xl border px-3 py-2.5 transition ${
                    activo
                      ? 'border-[#000089]/20 bg-[#000089]/10'
                      : completado
                        ? 'border-[#00CCA5]/20 bg-[#00CCA5]/10'
                        : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-xl text-xs font-black ${
                      completado
                        ? 'bg-[#00CCA5] text-white'
                        : activo
                          ? 'bg-[#000089] text-white'
                          : 'bg-slate-200 text-slate-400'
                    }`}
                  >
                    {completado ? <CheckCircle size={15} /> : num}
                  </div>

                  <span
                    className={`text-xs font-black ${
                      activo
                        ? 'text-[#000089]'
                        : completado
                          ? 'text-[#008f78]'
                          : 'text-slate-400'
                    }`}
                  >
                    {label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
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
            {/* PASO 1 */}
            {step === 1 && (
              <motion.form
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleNextStep}
                className="space-y-5"
              >
                <div>
                  <label className="mb-2 block text-xs font-black text-slate-700">
                    Documento de identidad <span className="text-red-400">*</span>
                  </label>

                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-[130px_1fr_auto]">
                    <select
                      name="tipoDocumento"
                      value={form.tipoDocumento}
                      onChange={handleChange}
                      className={inputClass}
                    >
                      <option value="DNI">DNI</option>
                      <option value="CE">Carné Ext.</option>
                      <option value="PASAPORTE">Pasaporte</option>
                    </select>

                    <div className="relative">
                      <IdCard
                        size={17}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        name="numeroDocumento"
                        value={form.numeroDocumento}
                        onChange={handleChange}
                        maxLength={esDNI ? 8 : 12}
                        placeholder={esDNI ? '12345678' : 'Número de documento'}
                        className={`${inputClass} pl-11 ${
                          estadoVerificacion === 'verificado'
                            ? 'border-[#00CCA5] bg-[#00CCA5]/5'
                            : ''
                        }`}
                      />
                    </div>

                    {esDNI && (
                      <button
                        type="button"
                        onClick={buscarDocumento}
                        disabled={buscando || form.numeroDocumento.length !== 8}
                        className="flex h-12 items-center justify-center gap-2 rounded-xl bg-[#000089] px-4 text-sm font-black text-white shadow-lg shadow-[#000089]/20 transition hover:bg-[#000070] hover:ring-4 hover:ring-[#00CCA5]/15 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {buscando ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Search size={16} />
                        )}
                        Buscar
                      </button>
                    )}
                  </div>

                  <AnimatePresence>
                    {estadoVerificacion === 'verificado' && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="mt-3 flex items-start gap-3 rounded-2xl border border-[#00CCA5]/20 bg-[#00CCA5]/10 px-4 py-3"
                      >
                        <CheckCircle
                          size={15}
                          className="mt-0.5 flex-shrink-0 text-[#008f78]"
                        />
                        <p className="text-xs font-bold leading-5 text-[#008f78]">
                          Datos encontrados y precargados.
                        </p>
                      </motion.div>
                    )}

                    {estadoVerificacion === 'manual' && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="mt-3 flex items-start gap-3 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3"
                      >
                        <AlertCircle
                          size={15}
                          className="mt-0.5 flex-shrink-0 text-amber-500"
                        />
                        <p className="text-xs font-bold leading-5 text-amber-700">
                          No se encontraron datos. Completa manualmente.
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-xs font-black text-slate-700">
                      Nombre <span className="text-red-400">*</span>
                    </label>

                    <div className="relative">
                      <UserRound
                        size={17}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        name="nombre"
                        value={form.nombre}
                        onChange={handleChange}
                        placeholder="Nombre del paciente"
                        className={`${inputClass} pl-11`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-black text-slate-700">
                      Apellido <span className="text-red-400">*</span>
                    </label>

                    <div className="relative">
                      <UserRound
                        size={17}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        name="apellido"
                        value={form.apellido}
                        onChange={handleChange}
                        placeholder="Apellido del paciente"
                        className={`${inputClass} pl-11`}
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-[#00CCA5]/20 bg-[#00CCA5]/10 px-4 py-3">
                  <p className="text-xs leading-5 text-[#008f78]">
                    Si el documento es DNI, puedes buscar los datos automáticamente.
                    Para otros documentos, completa los nombres manualmente.
                  </p>
                </div>

                <button
                  type="submit"
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#000089] px-4 text-sm font-black text-white shadow-lg shadow-[#000089]/20 transition hover:bg-[#000070] hover:ring-4 hover:ring-[#00CCA5]/15"
                >
                  Continuar
                  <ArrowRight size={16} />
                </button>
              </motion.form>
            )}

            {/* PASO 2 */}
            {step === 2 && (
              <motion.form
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                <div>
                  <label className="mb-2 block text-xs font-black text-slate-700">
                    Correo electrónico <span className="text-red-400">*</span>
                  </label>

                  <div className="relative">
                    <Mail
                      size={17}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      placeholder="paciente@email.com"
                      className={`${inputClass} pl-11`}
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-black text-slate-700">
                    Contraseña <span className="text-red-400">*</span>
                  </label>

                  <div className="relative">
                    <Lock
                      size={17}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={form.password}
                      onChange={handleChange}
                      required
                      minLength={8}
                      placeholder="Mínimo 8 caracteres"
                      className={`${inputClass} pl-11 pr-11`}
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  {form.password && (
                    <div className="mt-3">
                      <div className="mb-1.5 flex gap-1">
                        {[0, 1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                              i <= score ? fortalezaConfig[score].color : 'bg-slate-200'
                            }`}
                          />
                        ))}
                      </div>

                      <p className={`text-xs font-bold ${cfgFortaleza.text}`}>
                        {cfgFortaleza.label}
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-xs font-black text-slate-700">
                    Confirmar contraseña <span className="text-red-400">*</span>
                  </label>

                  <div className="relative">
                    <Lock
                      size={17}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      name="confirmar"
                      type={showConfirmar ? 'text' : 'password'}
                      value={form.confirmar}
                      onChange={handleChange}
                      required
                      placeholder="Repite la contraseña"
                      className={`${inputClass} pl-11 pr-11`}
                    />

                    <button
                      type="button"
                      onClick={() => setShowConfirmar(!showConfirmar)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
                    >
                      {showConfirmar ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  {form.confirmar && (
                    <p
                      className={`mt-2 text-xs font-bold ${
                        form.password === form.confirmar
                          ? 'text-[#008f78]'
                          : 'text-red-500'
                      }`}
                    >
                      {form.password === form.confirmar
                        ? '✓ Las contraseñas coinciden'
                        : '✗ Las contraseñas no coinciden'}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-xs font-black text-slate-700">
                      Teléfono{' '}
                      <span className="font-medium text-slate-400">(opcional)</span>
                    </label>

                    <div className="relative">
                      <Phone
                        size={17}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        name="telefono"
                        value={form.telefono}
                        onChange={handleChange}
                        placeholder="+51 999 999 999"
                        className={`${inputClass} pl-11`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-black text-slate-700">
                      Fecha de nacimiento
                    </label>

                    <div className="relative">
                      <CalendarDays
                        size={17}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        name="fechaNac"
                        type="date"
                        value={form.fechaNac}
                        onChange={handleChange}
                        max={new Date().toISOString().split('T')[0]}
                        className={`${inputClass} pl-11`}
                      />
                    </div>
                  </div>
                </div>

                {edad !== null && (
                  <div
                    className={`rounded-2xl border px-4 py-3 ${
                      esMenor
                        ? 'border-amber-200 bg-amber-50'
                        : 'border-[#00CCA5]/20 bg-[#00CCA5]/10'
                    }`}
                  >
                    <p
                      className={`text-xs font-bold leading-5 ${
                        esMenor ? 'text-amber-700' : 'text-[#008f78]'
                      }`}
                    >
                      Edad calculada: {edad} año{edad !== 1 ? 's' : ''}
                      {esMenor ? ' · Se requieren datos del tutor.' : ''}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-xs font-black text-slate-700">
                      Género
                    </label>

                    <div className="relative">
                      <VenusAndMars
                        size={17}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <select
                        name="genero"
                        value={form.genero}
                        onChange={handleChange}
                        className={`${inputClass} pl-11`}
                      >
                        <option value="">Seleccionar</option>
                        <option value="Masculino">Masculino</option>
                        <option value="Femenino">Femenino</option>
                        <option value="Otro">Otro</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-black text-slate-700">
                      Dirección{' '}
                      <span className="font-medium text-slate-400">(opcional)</span>
                    </label>

                    <div className="relative">
                      <MapPin
                        size={17}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        name="direccion"
                        value={form.direccion}
                        onChange={handleChange}
                        placeholder="Av. Principal 123"
                        className={`${inputClass} pl-11`}
                      />
                    </div>
                  </div>
                </div>

                {/* Sección tutor — solo si es menor */}
                <AnimatePresence>
                  {esMenor && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="space-y-4 rounded-3xl border border-amber-200 bg-amber-50 p-5"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-white">
                          <UserCheck size={18} className="text-amber-600" />
                        </div>

                        <div>
                          <p className="text-sm font-black text-amber-800">
                            Paciente menor de edad
                          </p>
                          <p className="mt-0.5 text-xs leading-5 text-amber-700">
                            Los datos del tutor o padre son requeridos para completar el registro.
                          </p>
                        </div>
                      </div>

                      <div>
                        <label className="mb-2 block text-xs font-black text-slate-700">
                          Nombre del tutor <span className="text-red-400">*</span>
                        </label>

                        <div className="relative">
                          <UserRound
                            size={17}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                          />

                          <input
                            name="tutorNombre"
                            value={form.tutorNombre}
                            onChange={handleChange}
                            placeholder="Nombre completo del tutor"
                            className={`${inputClass} bg-white pl-11`}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label className="mb-2 block text-xs font-black text-slate-700">
                            DNI del tutor <span className="text-red-400">*</span>
                          </label>

                          <div className="relative">
                            <IdCard
                              size={17}
                              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                            />

                            <input
                              name="tutorDni"
                              value={form.tutorDni}
                              onChange={handleChange}
                              maxLength={8}
                              placeholder="12345678"
                              className={`${inputClass} bg-white pl-11`}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="mb-2 block text-xs font-black text-slate-700">
                            Teléfono del tutor <span className="text-red-400">*</span>
                          </label>

                          <div className="relative">
                            <Phone
                              size={17}
                              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                            />

                            <input
                              name="tutorTelefono"
                              value={form.tutorTelefono}
                              onChange={handleChange}
                              placeholder="999 999 999"
                              className={`${inputClass} bg-white pl-11`}
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex flex-col-reverse gap-3 pt-1 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => {
                      setStep(1)
                      setError('')
                    }}
                    className="flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 sm:w-auto"
                  >
                    <ArrowLeft size={16} />
                    Atrás
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#000089] px-4 text-sm font-black text-white shadow-lg shadow-[#000089]/20 transition hover:bg-[#000070] hover:ring-4 hover:ring-[#00CCA5]/15 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        Guardar Paciente
                      </>
                    )}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  )
}