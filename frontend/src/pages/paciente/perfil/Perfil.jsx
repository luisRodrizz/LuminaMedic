import { useState, useEffect, useRef } from 'react'
import {
  UserCircle, Upload, CreditCard, CheckCircle,
  AlertCircle, Lock, Mail, Calendar, UserCheck
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import PacienteLayout from '../../../components/PacienteLayout'
import ModalCambiarPassword from '../../../components/ModalCambiarPassword'
import api from '../../../services/api'

const validacionBadge = {
  VALIDADO:  { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500', label: 'Validado RENIEC' },
  PENDIENTE: { bg: 'bg-amber-50',   text: 'text-amber-700',   dot: 'bg-amber-400',   label: 'Pendiente'      },
  NO_APLICA: { bg: 'bg-slate-100',  text: 'text-slate-500',   dot: 'bg-slate-400',   label: 'No aplica'      },
}

const tipoLabel = { DNI: 'DNI', CE: 'Carné Ext.', PASAPORTE: 'Pasaporte' }

export default function PacientePerfil() {
  const [paciente, setPaciente] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ telefono: '', fechaNac: '', genero: '', direccion: '', alergias: '' })
  const [fotoFile, setFotoFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [modalPass, setModalPass] = useState(false)
  const fileRef = useRef()

  const fetchPerfil = async () => {
    try {
      const res = await api.get('/pacientes/perfil/me')
      setPaciente(res.data)
      setForm({
        telefono:  res.data.usuario.telefono || '',
        fechaNac:  res.data.fechaNac ? res.data.fechaNac.split('T')[0] : '',
        genero:    res.data.genero || '',
        direccion: res.data.direccion || '',
        alergias:  res.data.alergias || ''
      })
      if (res.data.foto) setPreview(res.data.foto)
    } catch {
      toast.error('Error al cargar el perfil')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchPerfil() }, [])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleFotoChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { toast.error('La imagen no puede superar los 5MB'); return }
    setFotoFile(file)
    setPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const formData = new FormData()
      formData.append('telefono', form.telefono)
      formData.append('fechaNac', form.fechaNac)
      formData.append('genero', form.genero)
      formData.append('direccion', form.direccion)
      formData.append('alergias', form.alergias)
      if (fotoFile) formData.append('foto', fotoFile)
      await api.put('/pacientes/perfil/me', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setFotoFile(null)
      setSuccess('Perfil actualizado correctamente')
      setTimeout(() => setSuccess(''), 3000)
      await fetchPerfil()
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar los cambios')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <PacienteLayout>
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 text-sm">Cargando perfil...</p>
      </div>
    </PacienteLayout>
  )

  const inputClass = "w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-slate-50 transition-all"
  const vBadge = validacionBadge[paciente?.validacionReniec] || validacionBadge.PENDIENTE

  return (
    <PacienteLayout>
      <div className="page-enter">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
            <UserCircle size={20} className="text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Mi Perfil</h1>
            <p className="text-slate-400 text-sm mt-0.5">Información personal y de salud</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Columna izquierda */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 flex flex-col items-center">
            <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl bg-blue-50 flex items-center justify-center mb-4 overflow-hidden border-2 border-blue-100">
              {preview ? (
                <img src={preview} alt="Foto de perfil" className="w-full h-full object-cover" />
              ) : (
                <span className="text-blue-600 text-3xl font-bold">
                  {paciente?.usuario.nombre[0]}{paciente?.usuario.apellido[0]}
                </span>
              )}
            </div>

            <p className="text-sm font-semibold text-slate-800 text-center leading-snug">
              {paciente?.usuario.nombre} {paciente?.usuario.apellido}
            </p>

            <div className="flex items-center gap-2 mt-1.5 flex-wrap justify-center">
              <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-lg">Paciente</span>
              {paciente?.esMenor && (
                <span className="px-2.5 py-0.5 bg-amber-50 text-amber-700 text-xs font-medium rounded-lg flex items-center gap-1">
                  <UserCheck size={10} /> Menor de edad
                </span>
              )}
            </div>

            <label className="mt-5 flex items-center gap-2 cursor-pointer bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-2.5 rounded-xl text-sm font-medium transition-all w-full justify-center">
              <Upload size={15} />
              {fotoFile ? 'Foto seleccionada ✓' : 'Cambiar foto'}
              <input ref={fileRef} type="file" accept="image/jpg,image/jpeg,image/png,image/webp"
                className="hidden" onChange={handleFotoChange} />
            </label>
            <p className="text-xs text-slate-400 mt-1.5">JPG, PNG o WEBP · Máx 5MB</p>

            <div className="w-full mt-6 pt-5 border-t border-slate-100 text-center">
              <p className="text-3xl font-bold text-slate-800">{paciente?.citas?.length || 0}</p>
              <p className="text-xs text-slate-400 mt-0.5">Citas registradas</p>
            </div>

            <div className="w-full mt-4 pt-4 border-t border-slate-100">
              <button onClick={() => setModalPass(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-sm font-medium transition-all">
                <Lock size={14} /> Cambiar contraseña
              </button>
            </div>
          </div>

          {/* Columna derecha */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-5 md:p-6">
            <h2 className="text-base font-semibold text-slate-800 mb-5">Información editable</h2>

            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl mb-5">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0" />{error}
                </motion.div>
              )}
              {success && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 text-emerald-600 text-sm px-4 py-3 rounded-xl mb-5">
                  <CheckCircle size={14} className="flex-shrink-0" />{success}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Teléfono</label>
                  <input name="telefono" value={form.telefono} onChange={handleChange}
                    placeholder="+51 999 999 999" className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Fecha de nacimiento</label>
                  <input name="fechaNac" type="date" value={form.fechaNac} onChange={handleChange} className={inputClass} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Género</label>
                  <select name="genero" value={form.genero} onChange={handleChange} className={inputClass}>
                    <option value="">Seleccionar...</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Femenino">Femenino</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Dirección</label>
                  <input name="direccion" value={form.direccion} onChange={handleChange}
                    placeholder="Av. Principal 123" className={inputClass} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Alergias <span className="text-slate-400 font-normal">(opcional)</span>
                </label>
                <textarea name="alergias" value={form.alergias} onChange={handleChange}
                  rows={3} placeholder="Ej: Penicilina, mariscos, látex..."
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-slate-50 transition-all resize-none" />
                {form.alergias && (
                  <div className="mt-2 flex items-start gap-2 p-2.5 bg-amber-50 border border-amber-100 rounded-xl">
                    <AlertCircle size={13} className="text-amber-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-700">Esta información es visible para tu médico durante las consultas</p>
                  </div>
                )}
              </div>

              {/* Datos identidad — solo lectura */}
              <div className="border border-slate-100 rounded-xl overflow-hidden">
                <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Datos de identidad</p>
                  <p className="text-xs text-slate-400 mt-0.5">Solo el administrador puede modificarlos</p>
                </div>
                <div className="divide-y divide-slate-50">
                  {[
                    { icon: Mail,       label: 'Correo',        value: paciente?.usuario.email },
                    { icon: UserCircle, label: 'Nombre',        value: `${paciente?.usuario.nombre} ${paciente?.usuario.apellido}` },
                    { icon: Calendar,   label: 'Miembro desde', value: paciente?.usuario.createdAt ? new Date(paciente.usuario.createdAt).toLocaleDateString('es-PE', { year: 'numeric', month: 'long' }) : '—' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 px-4 py-3">
                      <item.icon size={13} className="text-slate-400 flex-shrink-0" />
                      <span className="text-xs text-slate-400 w-20 sm:w-24 flex-shrink-0">{item.label}</span>
                      <span className="text-xs font-medium text-slate-600 truncate">{item.value}</span>
                    </div>
                  ))}
                  <div className="flex items-center gap-3 px-4 py-3 flex-wrap">
                    <CreditCard size={13} className="text-slate-400 flex-shrink-0" />
                    <span className="text-xs text-slate-400 w-20 sm:w-24 flex-shrink-0">{tipoLabel[paciente?.tipoDocumento] || paciente?.tipoDocumento}</span>
                    <span className="text-xs font-medium text-slate-600 font-mono">{paciente?.numeroDocumento || '—'}</span>
                    <span className={`ml-auto inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-xs font-medium ${vBadge.bg} ${vBadge.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${vBadge.dot}`} />
                      {vBadge.label}
                    </span>
                  </div>

                  {paciente?.esMenor && (
                    <div className="px-4 py-3 bg-amber-50">
                      <div className="flex items-center gap-2 mb-2">
                        <UserCheck size={13} className="text-amber-600 flex-shrink-0" />
                        <span className="text-xs font-semibold text-amber-700">Datos del tutor/padre</span>
                      </div>
                      <div className="space-y-1.5">
                        {[
                          { label: 'Nombre',     value: paciente?.tutorNombre   },
                          { label: 'DNI tutor',  value: paciente?.tutorDni      },
                          { label: 'Teléfono',   value: paciente?.tutorTelefono },
                        ].map((item, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <span className="text-xs text-slate-400 w-20 sm:w-24 flex-shrink-0">{item.label}</span>
                            <span className="text-xs font-medium text-slate-600 font-mono truncate">{item.value || '—'}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-1">
                <button type="submit" disabled={saving}
                  className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-medium transition-all shadow-sm hover:shadow-md">
                  {saving ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Guardando...
                    </span>
                  ) : 'Guardar cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {modalPass && <ModalCambiarPassword onClose={() => setModalPass(false)} color="blue" />}
      </AnimatePresence>
    </PacienteLayout>
  )
}