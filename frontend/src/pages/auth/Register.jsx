import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, Stethoscope, User, Phone, Search, Loader2, CheckCircle, AlertCircle, CreditCard, ArrowRight, ArrowLeft, Calendar } from 'lucide-react'
import api from '../../services/api'


const STEPS = ['Identidad', 'Cuenta']

const calcularEdad = (fechaNac) => {
  if (!fechaNac) return null
  const fecha = new Date(fechaNac)
  const hoy = new Date()
  return hoy.getFullYear() - fecha.getFullYear() -
    (hoy < new Date(hoy.getFullYear(), fecha.getMonth(), fecha.getDate()) ? 1 : 0)
}

export default function Register() {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    nombre: '', apellido: '', email: '', telefono: '', password: '', confirmar: '',
    tipoDocumento: 'DNI', numeroDocumento: '', fuenteNombre: 'MANUAL', fechaNac: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmar, setShowConfirmar] = useState(false)
  const [buscando, setBuscando] = useState(false)
  const [aceptaTerminos, setAceptaTerminos] = useState(false)
  const [estadoVerificacion, setEstadoVerificacion] = useState(null)
  const navigate = useNavigate()

  const inputBase = "w-full py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-slate-50 transition-all"

  const edad = calcularEdad(form.fechaNac)
  const esMenor = edad !== null && edad < 18

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === 'tipoDocumento') {
      setEstadoVerificacion(null)
      setForm(prev => ({ ...prev, tipoDocumento: value, numeroDocumento: '', nombre: '', apellido: '', fuenteNombre: 'MANUAL' }))
      return
    }
    if (name === 'numeroDocumento') setEstadoVerificacion(null)
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const buscarDni = async () => {
    if (form.numeroDocumento.length !== 8) return setError('El DNI debe tener 8 dígitos')
    setError('')
    setBuscando(true)
    try {
      const res = await api.get(`/auth/consultar-dni/${form.numeroDocumento}`)
      setForm(prev => ({
        ...prev,
        nombre:       res.data.nombres,
        apellido:     `${res.data.apellido_paterno} ${res.data.apellido_materno}`,
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
    if (!form.fechaNac) return setError('La fecha de nacimiento es requerida')
    if (esMenor) return setError('Debes tener al menos 18 años para registrarte. Los menores de edad deben ser registrados por un tutor desde la clínica.')
    setStep(2)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password.length < 8) return setError('La contraseña debe tener al menos 8 caracteres')
    if (form.password !== form.confirmar) return setError('Las contraseñas no coinciden')
    if (!aceptaTerminos) return setError('Debes aceptar la Política de Privacidad para continuar')
    setLoading(true)
    try {
      await api.post('/auth/register', {
        nombre:          form.nombre,
        apellido:        form.apellido,
        email:           form.email,
        telefono:        form.telefono,
        password:        form.password,
        tipoDocumento:   form.tipoDocumento,
        numeroDocumento: form.numeroDocumento,
        fuenteNombre:    form.fuenteNombre,
        fechaNac:        form.fechaNac,
      })
      navigate('/login?registered=true')
    } catch (err) {
      setError(err.response?.data?.message || 'Error al crear la cuenta. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const esDNI = form.tipoDocumento === 'DNI'

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center px-4 py-8"
      style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl" />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }} className="relative w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">

          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 md:px-8 pt-8 pb-6 text-center">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Stethoscope size={24} className="text-white" />
            </div>
            <h1 className="text-xl font-bold text-white">MediCare</h1>
            <p className="text-blue-200 text-xs mt-1">Crea tu cuenta de paciente</p>
            <div className="flex items-center justify-center gap-3 mt-5">
              {STEPS.map((label, i) => {
                const num = i + 1
                const activo = step === num
                const completado = step > num
                return (
                  <div key={i} className="flex items-center gap-2">
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      activo ? 'bg-white text-blue-600' : completado ? 'bg-white/30 text-white' : 'bg-white/10 text-blue-300'
                    }`}>
                      {completado ? <CheckCircle size={12} /> : (
                        <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          activo ? 'bg-blue-600 text-white' : 'bg-white/20 text-blue-200'
                        }`}>{num}</span>
                      )}
                      {label}
                    </div>
                    {i < STEPS.length - 1 && <div className={`w-6 h-px ${step > num ? 'bg-white/50' : 'bg-white/20'}`} />}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Body */}
          <div className="px-6 md:px-8 py-7">
            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl mb-5">
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
                    <h2 className="text-lg font-bold text-slate-800">Tu identidad</h2>
                    <p className="text-slate-400 text-xs mt-0.5">Ingresa tus datos para identificarte</p>
                  </div>

                  {/* Documento */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                      Documento de identidad <span className="text-red-400">*</span>
                    </label>
                    {/* En móvil: select arriba, input+botón abajo */}
                    <div className="flex flex-col gap-2">
                      <select name="tipoDocumento" value={form.tipoDocumento} onChange={handleChange}
                        className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-slate-50 transition-all w-full sm:w-auto">
                        <option value="DNI">DNI</option>
                        <option value="CE">Carné Ext.</option>
                        <option value="PASAPORTE">Pasaporte</option>
                      </select>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <CreditCard size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input name="numeroDocumento" value={form.numeroDocumento} onChange={handleChange}
                            maxLength={esDNI ? 8 : 12} placeholder={esDNI ? '12345678' : 'Número de documento'}
                            className={`${inputBase} pl-10 pr-4 ${estadoVerificacion === 'verificado' ? 'border-emerald-300 bg-emerald-50/30' : ''}`} />
                        </div>
                        {esDNI && (
                          <button type="button" onClick={buscarDni}
                            disabled={buscando || form.numeroDocumento.length !== 8}
                            className="flex items-center gap-1.5 px-3 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-medium transition-all whitespace-nowrap flex-shrink-0">
                            {buscando ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
                            <span className="hidden xs:inline">Buscar</span>
                          </button>
                        )}
                      </div>
                    </div>
                    <AnimatePresence>
                      {estadoVerificacion === 'verificado' && (
                        <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                          className="flex items-center gap-2 mt-2 px-3 py-2 bg-emerald-50 border border-emerald-100 rounded-xl">
                          <CheckCircle size={13} className="text-emerald-500 flex-shrink-0" />
                          <p className="text-xs text-emerald-700">Datos encontrados. Puedes editarlos si es necesario.</p>
                        </motion.div>
                      )}
                      {estadoVerificacion === 'manual' && (
                        <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                          className="flex items-center gap-2 mt-2 px-3 py-2 bg-amber-50 border border-amber-100 rounded-xl">
                          <AlertCircle size={13} className="text-amber-500 flex-shrink-0" />
                          <p className="text-xs text-amber-700">DNI no encontrado. Completa tu nombre manualmente.</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Nombre y Apellido — apilados en móvil */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">Nombre <span className="text-red-400">*</span></label>
                      <div className="relative">
                        <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input name="nombre" value={form.nombre} onChange={handleChange}
                          placeholder="Carlos" className={`${inputBase} pl-10 pr-4`} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">Apellido <span className="text-red-400">*</span></label>
                      <div className="relative">
                        <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input name="apellido" value={form.apellido} onChange={handleChange}
                          placeholder="García" className={`${inputBase} pl-10 pr-4`} />
                      </div>
                    </div>
                  </div>

                  {/* Fecha de nacimiento */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                      Fecha de nacimiento <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <Calendar size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input type="date" name="fechaNac" value={form.fechaNac} onChange={handleChange}
                        max={new Date().toISOString().split('T')[0]}
                        className={`${inputBase} pl-10 pr-4`} />
                    </div>
                    <AnimatePresence>
                      {esMenor && (
                        <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                          className="flex items-start gap-2 mt-2 px-3 py-2 bg-amber-50 border border-amber-100 rounded-xl">
                          <AlertCircle size={13} className="text-amber-500 flex-shrink-0 mt-0.5" />
                          <p className="text-xs text-amber-700">
                            Los menores de 18 años no pueden registrarse por cuenta propia. Un tutor o padre debe registrarlos en la clínica.
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <button type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 mt-2">
                    Continuar <ArrowRight size={16} />
                  </button>
                </motion.form>
              )}

              {/* PASO 2 */}
              {step === 2 && (
                <motion.form key="step2"
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }} onSubmit={handleSubmit} className="space-y-4">

                  <div>
                    <h2 className="text-lg font-bold text-slate-800">Tu cuenta</h2>
                    <p className="text-slate-400 text-xs mt-0.5">Configura tu acceso al sistema</p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Correo electrónico <span className="text-red-400">*</span></label>
                    <div className="relative">
                      <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input type="email" name="email" value={form.email} onChange={handleChange}
                        placeholder="correo@ejemplo.com" required className={`${inputBase} pl-10 pr-4`} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                      Teléfono <span className="text-slate-400 font-normal">(opcional)</span>
                    </label>
                    <div className="relative">
                      <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input name="telefono" value={form.telefono} onChange={handleChange}
                        placeholder="+51 999 999 999" className={`${inputBase} pl-10 pr-4`} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Contraseña <span className="text-red-400">*</span></label>
                    <div className="relative">
                      <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input type={showPassword ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange}
                        placeholder="Mínimo 8 caracteres" required className={`${inputBase} pl-10 pr-10`} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                        {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Confirmar contraseña <span className="text-red-400">*</span></label>
                    <div className="relative">
                      <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input type={showConfirmar ? 'text' : 'password'} name="confirmar" value={form.confirmar} onChange={handleChange}
                        placeholder="Repite tu contraseña" required className={`${inputBase} pl-10 pr-10`} />
                      <button type="button" onClick={() => setShowConfirmar(!showConfirmar)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                        {showConfirmar ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                    {form.confirmar && (
                      <p className={`text-xs mt-1.5 ${form.password === form.confirmar ? 'text-emerald-500' : 'text-red-400'}`}>
                        {form.password === form.confirmar ? '✓ Las contraseñas coinciden' : '✗ Las contraseñas no coinciden'}
                      </p>
                    )}
                  </div>

                  {/* Consentimiento Ley 29733 */}
                  <div className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <input
                      type="checkbox"
                      id="terminos"
                      checked={aceptaTerminos}
                      onChange={e => setAceptaTerminos(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 flex-shrink-0 cursor-pointer"
                    />
                    <label htmlFor="terminos" className="text-xs text-slate-600 leading-relaxed cursor-pointer">
                      He leído y acepto la{' '}
                      <a href="/privacidad" target="_blank" className="text-blue-500 hover:text-blue-600 font-medium underline">
                        Política de Privacidad
                      </a>
                      {' '}y autorizo el tratamiento de mis datos personales conforme a la{' '}
                      <span className="font-medium">Ley N° 29733</span>.
                    </label>
                  </div>

                  <div className="flex gap-3 pt-1">
                    <button type="button" onClick={() => { setStep(1); setError('') }}
                      className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50 transition-all">
                      <ArrowLeft size={15} /> Atrás
                    </button>
                    <button type="submit" disabled={loading || !aceptaTerminos}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl transition-all shadow-sm hover:shadow-md">
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Creando cuenta...
                        </span>
                      ) : 'Crear cuenta'}
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            <p className="text-center text-sm text-slate-500 mt-5">
              ¿Ya tienes cuenta?{' '}
              <Link to="/login" className="text-blue-500 hover:text-blue-600 font-medium transition-colors">Inicia sesión</Link>
            </p>
          </div>
        </div>
        <p className="text-center text-xs text-slate-500 mt-4">Sistema de Gestión Clínica © {new Date().getFullYear()}</p>
      </motion.div>
    </div>
  )
}