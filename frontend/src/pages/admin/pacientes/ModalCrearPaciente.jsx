import { useState } from 'react'
import { X, Users, Search, Loader2, CheckCircle, AlertCircle, Eye, EyeOff, ArrowRight, ArrowLeft, UserCheck } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import zxcvbn from 'zxcvbn'
import api from '../../../services/api'

const fortalezaConfig = [
  { label: 'Muy débil',  color: 'bg-red-500',    text: 'text-red-500'    },
  { label: 'Débil',      color: 'bg-orange-500',  text: 'text-orange-500' },
  { label: 'Aceptable',  color: 'bg-yellow-500',  text: 'text-yellow-500' },
  { label: 'Fuerte',     color: 'bg-blue-500',    text: 'text-blue-500'   },
  { label: 'Muy fuerte', color: 'bg-emerald-500', text: 'text-emerald-500'},
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
    nombre: '', apellido: '', email: '', password: '', confirmar: '',
    telefono: '', fechaNac: '', genero: '', direccion: '', alergias: '',
    tipoDocumento: 'DNI', numeroDocumento: '', fuenteNombre: 'MANUAL',
    tutorNombre: '', tutorDni: '', tutorTelefono: ''
  })
  const [error, setError] = useState('')
  const [buscando, setBuscando] = useState(false)
  const [estadoVerificacion, setEstadoVerificacion] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmar, setShowConfirmar] = useState(false)
  const [loading, setLoading] = useState(false)

  const inputClass = "w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 bg-slate-50 transition-all"

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
      setForm(prev => ({ ...prev, tipoDocumento: value, numeroDocumento: '', nombre: '', apellido: '', fuenteNombre: 'MANUAL' }))
      return
    }
    if (name === 'numeroDocumento') setEstadoVerificacion(null)
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const buscarDocumento = async () => {
    if (form.numeroDocumento.length !== 8) return setError('El DNI debe tener 8 dígitos')
    setError('')
    setBuscando(true)
    try {
      const res = await api.get(`/pacientes/documento/${form.numeroDocumento}`)
      setForm(prev => ({
        ...prev,
        nombre: res.data.nombres,
        apellido: `${res.data.apellido_paterno} ${res.data.apellido_materno}`,
        fuenteNombre: 'RENIEC_API'
      }))
      setEstadoVerificacion('verificado')
    } catch {
      setForm(prev => ({ ...prev, fuenteNombre: 'MANUAL' }))
      setEstadoVerificacion('manual')
    } finally {
      setBuscando(false)
    }
  }

  const handleNextStep = (e) => {
    e.preventDefault()
    setError('')
    if (!form.numeroDocumento) return setError('El número de documento es requerido')
    if (form.tipoDocumento === 'DNI' && form.numeroDocumento.length !== 8) return setError('El DNI debe tener 8 dígitos')
    if (!form.nombre.trim()) return setError('El nombre es requerido')
    if (!form.apellido.trim()) return setError('El apellido es requerido')
    setStep(2)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password.length < 8) return setError('La contraseña debe tener al menos 8 caracteres')
    if (score < 2) return setError('La contraseña es muy débil. Usa letras, números y símbolos.')
    if (form.password !== form.confirmar) return setError('Las contraseñas no coinciden')
    if (esMenor) {
      if (!form.tutorNombre.trim()) return setError('El nombre del tutor es requerido para menores de edad')
      if (!/^\d{8}$/.test(form.tutorDni)) return setError('El DNI del tutor debe tener 8 dígitos')
      if (!form.tutorTelefono.trim()) return setError('El teléfono del tutor es requerido')
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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }} transition={{ duration: 0.2, ease: 'easeOut' }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center">
              <Users size={18} className="text-indigo-600" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-800">Nuevo Paciente</h2>
              <div className="flex items-center gap-2 mt-0.5">
                {STEPS.map((label, i) => {
                  const num = i + 1
                  const activo = step === num
                  const completado = step > num
                  return (
                    <div key={i} className="flex items-center gap-1.5">
                      <div className={`flex items-center gap-1 text-xs font-medium transition-all ${
                        activo ? 'text-indigo-600' : completado ? 'text-emerald-500' : 'text-slate-300'
                      }`}>
                        {completado ? <CheckCircle size={11} /> : (
                          <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${
                            activo ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-400'
                          }`}>{num}</span>
                        )}
                        {label}
                      </div>
                      {i < STEPS.length - 1 && <div className="w-3 h-px bg-slate-200" />}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0" />{error}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">

            {/* PASO 1 */}
            {step === 1 && (
              <motion.form key="step1"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }} onSubmit={handleNextStep} className="space-y-4">

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Documento de identidad <span className="text-red-400">*</span>
                  </label>
                  <div className="flex gap-2">
                    <select name="tipoDocumento" value={form.tipoDocumento} onChange={handleChange}
                      className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 bg-slate-50 transition-all">
                      <option value="DNI">DNI</option>
                      <option value="CE">Carné Ext.</option>
                      <option value="PASAPORTE">Pasaporte</option>
                    </select>
                    <div className="relative flex-1">
                      <input name="numeroDocumento" value={form.numeroDocumento} onChange={handleChange}
                        maxLength={esDNI ? 8 : 12} placeholder={esDNI ? '12345678' : 'Número de documento'}
                        className={`${inputClass} ${estadoVerificacion === 'verificado' ? 'border-emerald-300 bg-emerald-50/30' : ''}`} />
                    </div>
                    {esDNI && (
                      <button type="button" onClick={buscarDocumento}
                        disabled={buscando || form.numeroDocumento.length !== 8}
                        className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-medium transition-all whitespace-nowrap">
                        {buscando ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
                        Buscar
                      </button>
                    )}
                  </div>
                  <AnimatePresence>
                    {estadoVerificacion === 'verificado' && (
                      <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="flex items-center gap-2 mt-2 px-3 py-2 bg-emerald-50 border border-emerald-100 rounded-xl">
                        <CheckCircle size={14} className="text-emerald-500 flex-shrink-0" />
                        <p className="text-xs text-emerald-700">Datos encontrados y precargados.</p>
                      </motion.div>
                    )}
                    {estadoVerificacion === 'manual' && (
                      <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="flex items-center gap-2 mt-2 px-3 py-2 bg-amber-50 border border-amber-100 rounded-xl">
                        <AlertCircle size={14} className="text-amber-500 flex-shrink-0" />
                        <p className="text-xs text-amber-700">No se encontraron datos. Completa manualmente.</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Nombre <span className="text-red-400">*</span></label>
                    <input name="nombre" value={form.nombre} onChange={handleChange}
                      placeholder="Nombre del paciente" className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Apellido <span className="text-red-400">*</span></label>
                    <input name="apellido" value={form.apellido} onChange={handleChange}
                      placeholder="Apellido del paciente" className={inputClass} />
                  </div>
                </div>

                <button type="submit"
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-all shadow-sm hover:shadow-md">
                  Continuar <ArrowRight size={15} />
                </button>
              </motion.form>
            )}

            {/* PASO 2 */}
            {step === 2 && (
              <motion.form key="step2"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }} onSubmit={handleSubmit} className="space-y-4">

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Correo electrónico <span className="text-red-400">*</span></label>
                  <input name="email" type="email" value={form.email} onChange={handleChange} required
                    placeholder="paciente@email.com" className={inputClass} />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Contraseña <span className="text-red-400">*</span></label>
                  <div className="relative">
                    <input name="password" type={showPassword ? 'text' : 'password'}
                      value={form.password} onChange={handleChange} required minLength={8}
                      placeholder="Mínimo 8 caracteres" className={`${inputClass} pr-10`} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {form.password && (
                    <div className="mt-2">
                      <div className="flex gap-1 mb-1">
                        {[0,1,2,3,4].map(i => (
                          <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                            i <= score ? fortalezaConfig[score].color : 'bg-slate-200'
                          }`} />
                        ))}
                      </div>
                      <p className={`text-xs font-medium ${cfgFortaleza.text}`}>{cfgFortaleza.label}</p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Confirmar contraseña <span className="text-red-400">*</span></label>
                  <div className="relative">
                    <input name="confirmar" type={showConfirmar ? 'text' : 'password'}
                      value={form.confirmar} onChange={handleChange} required
                      placeholder="Repite la contraseña" className={`${inputClass} pr-10`} />
                    <button type="button" onClick={() => setShowConfirmar(!showConfirmar)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                      {showConfirmar ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {form.confirmar && (
                    <p className={`text-xs mt-1.5 ${form.password === form.confirmar ? 'text-emerald-500' : 'text-red-400'}`}>
                      {form.password === form.confirmar ? '✓ Las contraseñas coinciden' : '✗ Las contraseñas no coinciden'}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                      Teléfono <span className="text-slate-400 font-normal">(opcional)</span>
                    </label>
                    <input name="telefono" value={form.telefono} onChange={handleChange}
                      placeholder="+51 999 999 999" className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Fecha de nacimiento</label>
                    <input name="fechaNac" type="date" value={form.fechaNac} onChange={handleChange}
                      max={new Date().toISOString().split('T')[0]} className={inputClass} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Género</label>
                    <select name="genero" value={form.genero} onChange={handleChange} className={inputClass}>
                      <option value="">Seleccionar</option>
                      <option value="Masculino">Masculino</option>
                      <option value="Femenino">Femenino</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                      Dirección <span className="text-slate-400 font-normal">(opcional)</span>
                    </label>
                    <input name="direccion" value={form.direccion} onChange={handleChange}
                      placeholder="Av. Principal 123" className={inputClass} />
                  </div>
                </div>

                {/* Sección tutor — solo si es menor */}
                <AnimatePresence>
                  {esMenor && (
                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                      className="border border-amber-200 bg-amber-50 rounded-xl p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <UserCheck size={15} className="text-amber-600 flex-shrink-0" />
                        <p className="text-xs font-semibold text-amber-700">
                          Paciente menor de edad — Datos del tutor/padre requeridos
                        </p>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Nombre del tutor <span className="text-red-400">*</span></label>
                        <input name="tutorNombre" value={form.tutorNombre} onChange={handleChange}
                          placeholder="Nombre completo del tutor" className={inputClass} />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1.5">DNI del tutor <span className="text-red-400">*</span></label>
                          <input name="tutorDni" value={form.tutorDni} onChange={handleChange}
                            maxLength={8} placeholder="12345678" className={inputClass} />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Teléfono del tutor <span className="text-red-400">*</span></label>
                          <input name="tutorTelefono" value={form.tutorTelefono} onChange={handleChange}
                            placeholder="999 999 999" className={inputClass} />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={() => { setStep(1); setError('') }}
                    className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50 transition-all">
                    <ArrowLeft size={15} /> Atrás
                  </button>
                  <button type="submit" disabled={loading}
                    className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-all shadow-sm hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed">
                    {loading ? 'Guardando...' : 'Guardar Paciente'}
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