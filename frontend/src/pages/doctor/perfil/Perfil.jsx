import { useState, useEffect, useRef } from 'react'
import {
  UserCircle, Upload, CreditCard, CheckCircle,
  Lock, Building2, Mail, Phone, Calendar
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import DoctorLayout from '../../../components/DoctorLayout'
import ModalCambiarPassword from '../../../components/ModalCambiarPassword'
import api from '../../../services/api'

const validacionBadge = {
  VALIDADO:  { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500', label: 'Validado RENIEC' },
  PENDIENTE: { bg: 'bg-amber-50',   text: 'text-amber-700',   dot: 'bg-amber-400',   label: 'Pendiente'      },
  NO_APLICA: { bg: 'bg-slate-100',  text: 'text-slate-500',   dot: 'bg-slate-400',   label: 'No aplica'      },
}

const tipoLabel = { DNI: 'DNI', CE: 'Carné Ext.', PASAPORTE: 'Pasaporte' }

export default function DoctorPerfil() {
  const [doctor, setDoctor] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ telefono: '', especialidad: '', descripcion: '' })
  const [fotoFile, setFotoFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [modalPass, setModalPass] = useState(false)
  const fileRef = useRef()

  const fetchPerfil = async () => {
    try {
      const res = await api.get('/doctores/perfil/me')
      setDoctor(res.data)
      setForm({
        telefono:     res.data.usuario.telefono || '',
        especialidad: res.data.especialidad || '',
        descripcion:  res.data.descripcion || ''
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
      formData.append('especialidad', form.especialidad)
      formData.append('descripcion', form.descripcion)
      if (fotoFile) formData.append('foto', fotoFile)

      await api.put('/doctores/perfil/me', formData, {
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
    <DoctorLayout>
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 text-sm">Cargando perfil...</p>
      </div>
    </DoctorLayout>
  )

  const inputClass = "w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 bg-slate-50 transition-all"
  const vBadge = validacionBadge[doctor?.validacionReniec] || validacionBadge.PENDIENTE

  return (
    <DoctorLayout>
      <div className="page-enter">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
            <UserCircle size={20} className="text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Mi Perfil</h1>
            <p className="text-slate-400 text-sm mt-0.5">Información personal y profesional</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Columna izquierda ── */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 flex flex-col items-center">

            {/* Avatar */}
            <div className="w-28 h-28 rounded-2xl bg-emerald-50 flex items-center justify-center mb-4 overflow-hidden border-2 border-emerald-100">
              {preview ? (
                <img src={preview} alt="Foto de perfil" className="w-full h-full object-cover" />
              ) : (
                <span className="text-emerald-600 text-3xl font-bold">
                  {doctor?.usuario.nombre[0]}{doctor?.usuario.apellido[0]}
                </span>
              )}
            </div>

            {/* Nombre y especialidad */}
            <p className="text-sm font-semibold text-slate-800 text-center leading-snug">
              Dr. {doctor?.usuario.nombre} {doctor?.usuario.apellido}
            </p>
            <span className="mt-1.5 px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-lg">
              {doctor?.especialidad}
            </span>

            {/* Botón cambiar foto */}
            <label className="mt-5 flex items-center gap-2 cursor-pointer bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-4 py-2.5 rounded-xl text-sm font-medium transition-all w-full justify-center">
              <Upload size={15} />
              {fotoFile ? 'Foto seleccionada ✓' : 'Cambiar foto'}
              <input ref={fileRef} type="file" accept="image/jpg,image/jpeg,image/png,image/webp"
                className="hidden" onChange={handleFotoChange} />
            </label>
            <p className="text-xs text-slate-400 mt-1.5">JPG, PNG o WEBP · Máx 5MB</p>

            {/* Stats */}
            <div className="w-full mt-6 pt-5 border-t border-slate-100 text-center">
              <p className="text-3xl font-bold text-slate-800">{doctor?.citas?.length || 0}</p>
              <p className="text-xs text-slate-400 mt-0.5">Citas totales</p>
            </div>

            {/* Botón cambiar contraseña */}
            <div className="w-full mt-4 pt-4 border-t border-slate-100">
              <button onClick={() => setModalPass(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-sm font-medium transition-all">
                <Lock size={14} />
                Cambiar contraseña
              </button>
            </div>
          </div>

          {/* ── Columna derecha ── */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-6">
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Teléfono</label>
                  <input name="telefono" value={form.telefono} onChange={handleChange}
                    placeholder="+51 999 999 999" className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Especialidad <span className="text-red-400">*</span>
                  </label>
                  <input name="especialidad" value={form.especialidad} onChange={handleChange}
                    required placeholder="Cardiología, Pediatría..." className={inputClass} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Descripción profesional <span className="text-slate-400 font-normal">(opcional)</span>
                </label>
                <textarea name="descripcion" value={form.descripcion} onChange={handleChange}
                  rows={3} placeholder="Breve descripción de tu experiencia y especialización..."
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 bg-slate-50 transition-all resize-none" />
              </div>

              {/* Datos de solo lectura — consolidados */}
              <div className="border border-slate-100 rounded-xl overflow-hidden">
                <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Datos de identidad</p>
                  <p className="text-xs text-slate-400 mt-0.5">Solo el administrador puede modificarlos</p>
                </div>
                <div className="divide-y divide-slate-50">
                  {[
                    { icon: Mail,      label: 'Correo',       value: doctor?.usuario.email },
                    { icon: Building2, label: 'Clínica',      value: doctor?.clinica?.nombre || '—' },
                    { icon: Calendar,  label: 'Miembro desde',value: doctor?.usuario.createdAt ? new Date(doctor.usuario.createdAt).toLocaleDateString('es-PE', { year: 'numeric', month: 'long' }) : '—' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 px-4 py-3">
                      <item.icon size={13} className="text-slate-400 flex-shrink-0" />
                      <span className="text-xs text-slate-400 w-24 flex-shrink-0">{item.label}</span>
                      <span className="text-xs font-medium text-slate-600 truncate">{item.value}</span>
                    </div>
                  ))}
                  {/* Documento */}
                  <div className="flex items-center gap-3 px-4 py-3">
                    <CreditCard size={13} className="text-slate-400 flex-shrink-0" />
                    <span className="text-xs text-slate-400 w-24 flex-shrink-0">{tipoLabel[doctor?.tipoDocumento] || doctor?.tipoDocumento}</span>
                    <span className="text-xs font-medium text-slate-600 font-mono">{doctor?.numeroDocumento || '—'}</span>
                    <span className={`ml-auto inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-xs font-medium ${vBadge.bg} ${vBadge.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${vBadge.dot}`} />
                      {vBadge.label}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-1">
                <button type="submit" disabled={saving}
                  className="w-full px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-medium transition-all shadow-sm hover:shadow-md">
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
        {modalPass && (
          <ModalCambiarPassword onClose={() => setModalPass(false)} color="emerald" />
        )}
      </AnimatePresence>

    </DoctorLayout>
  )
}