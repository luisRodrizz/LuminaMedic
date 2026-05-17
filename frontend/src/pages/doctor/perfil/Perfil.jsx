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
  VALIDADO: {
    bg: 'bg-[#00CCA5]/10',
    text: 'text-[#008f78]',
    dot: 'bg-[#00CCA5]',
    label: 'Validado RENIEC'
  },
  PENDIENTE: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    dot: 'bg-amber-400',
    label: 'Pendiente'
  },
  NO_APLICA: {
    bg: 'bg-slate-100',
    text: 'text-slate-500',
    dot: 'bg-slate-400',
    label: 'No aplica'
  },
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
      <div className="flex h-64 flex-col items-center justify-center gap-3">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-[#00CCA5] border-t-transparent" />
        <p className="text-sm text-slate-400">Cargando perfil...</p>
      </div>
    </DoctorLayout>
  )

  const inputClass =
    'w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#00CCA5] focus:bg-white focus:ring-4 focus:ring-[#00CCA5]/15'

  const textareaClass =
    'w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#00CCA5] focus:bg-white focus:ring-4 focus:ring-[#00CCA5]/15'

  const vBadge = validacionBadge[doctor?.validacionReniec] || validacionBadge.PENDIENTE

  return (
    <DoctorLayout>
      <div className="page-enter">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-950 md:text-3xl">
              Mi Perfil
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              Actualiza tu información profesional, foto de perfil y datos de contacto.
            </p>
          </div>

          <div className={`inline-flex w-fit items-center gap-2 rounded-2xl px-4 py-2 ${vBadge.bg}`}>
            <span className={`h-2 w-2 rounded-full ${vBadge.dot}`} />
            <span className={`text-xs font-black ${vBadge.text}`}>
              {vBadge.label}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Columna izquierda */}
          <div className="rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-sm">
            <div className="flex flex-col items-center">
              {/* Avatar */}
              <div className="relative mb-5 flex h-32 w-32 items-center justify-center overflow-hidden rounded-[2rem] border border-[#00CCA5]/20 bg-[#00CCA5]/10 shadow-sm">
                {preview ? (
                  <img
                    src={preview}
                    alt="Foto de perfil"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-4xl font-black text-[#008f78]">
                    {doctor?.usuario.nombre[0]}{doctor?.usuario.apellido[0]}
                  </span>
                )}
              </div>

              {/* Nombre y especialidad */}
              <p className="text-center text-base font-black leading-snug text-slate-900">
                Dr. {doctor?.usuario.nombre} {doctor?.usuario.apellido}
              </p>

              <span className="mt-2 rounded-2xl bg-[#00CCA5]/10 px-3 py-1.5 text-xs font-black text-[#008f78]">
                {doctor?.especialidad || 'Especialidad no registrada'}
              </span>

              {/* Botón cambiar foto */}
              <label className="mt-6 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#000089] px-4 py-3 text-sm font-black text-white shadow-lg shadow-[#000089]/20 transition hover:bg-[#000070] hover:ring-4 hover:ring-[#00CCA5]/15">
                <Upload size={15} />
                {fotoFile ? 'Foto seleccionada ✓' : 'Cambiar foto'}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpg,image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleFotoChange}
                />
              </label>

              <p className="mt-2 text-center text-xs text-slate-400">
                JPG, PNG o WEBP · Máx 5MB
              </p>

              {/* Stats */}
              <div className="mt-6 w-full border-t border-slate-100 pt-6 text-center">
                <p className="text-4xl font-black leading-none text-slate-900">
                  {doctor?.citas?.length || 0}
                </p>
                <p className="mt-1 text-xs font-bold text-slate-400">
                  Citas totales
                </p>
              </div>

              {/* Botón cambiar contraseña */}
              <div className="mt-5 w-full border-t border-slate-100 pt-5">
                <button
                  onClick={() => setModalPass(true)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-600 transition hover:bg-slate-50 hover:text-slate-800"
                >
                  <Lock size={15} />
                  Cambiar contraseña
                </button>
              </div>
            </div>
          </div>

          {/* Columna derecha */}
          <div className="rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-sm lg:col-span-2">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-[#00CCA5]/10">
                <UserCircle size={19} className="text-[#008f78]" />
              </div>

              <div>
                <h2 className="text-base font-black text-slate-900">
                  Información editable
                </h2>
                <p className="text-xs text-slate-400">
                  Estos datos pueden actualizarse desde tu perfil médico.
                </p>
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="mb-5 flex items-center gap-2 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-600"
                >
                  <span className="h-2 w-2 flex-shrink-0 rounded-full bg-red-500" />
                  {error}
                </motion.div>
              )}

              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="mb-5 flex items-center gap-2 rounded-2xl border border-[#00CCA5]/20 bg-[#00CCA5]/10 px-4 py-3 text-sm font-bold text-[#008f78]"
                >
                  <CheckCircle size={15} className="flex-shrink-0" />
                  {success}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-black uppercase tracking-[0.12em] text-slate-500">
                    Teléfono
                  </label>

                  <div className="relative">
                    <Phone size={15} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      name="telefono"
                      value={form.telefono}
                      onChange={handleChange}
                      placeholder="+51 999 999 999"
                      className={`${inputClass} pl-10`}
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-black uppercase tracking-[0.12em] text-slate-500">
                    Especialidad <span className="text-red-500">*</span>
                  </label>

                  <input
                    name="especialidad"
                    value={form.especialidad}
                    onChange={handleChange}
                    required
                    placeholder="Cardiología, Pediatría..."
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-[0.12em] text-slate-500">
                  Descripción profesional
                  <span className="ml-1 font-bold normal-case tracking-normal text-slate-400">
                    (opcional)
                  </span>
                </label>

                <textarea
                  name="descripcion"
                  value={form.descripcion}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Breve descripción de tu experiencia y especialización..."
                  className={textareaClass}
                />
              </div>

              {/* Datos de solo lectura */}
              <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white">
                <div className="border-b border-slate-100 bg-slate-50/80 px-5 py-4">
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">
                    Datos de identidad
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Solo el administrador puede modificar esta información.
                  </p>
                </div>

                <div className="divide-y divide-slate-100">
                  {[
                    { icon: Mail, label: 'Correo', value: doctor?.usuario.email },
                    { icon: Building2, label: 'Clínica', value: doctor?.clinica?.nombre || '—' },
                    {
                      icon: Calendar,
                      label: 'Miembro desde',
                      value: doctor?.usuario.createdAt
                        ? new Date(doctor.usuario.createdAt).toLocaleDateString('es-PE', {
                            year: 'numeric',
                            month: 'long'
                          })
                        : '—'
                    },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="grid grid-cols-1 gap-2 px-5 py-4 sm:grid-cols-[180px_1fr]"
                    >
                      <div className="flex items-center gap-2">
                        <item.icon size={15} className="flex-shrink-0 text-slate-400" />
                        <span className="text-xs font-bold text-slate-400">
                          {item.label}
                        </span>
                      </div>

                      <span className="truncate text-sm font-black text-slate-700">
                        {item.value}
                      </span>
                    </div>
                  ))}

                  {/* Documento */}
                  <div className="grid grid-cols-1 gap-3 px-5 py-4 sm:grid-cols-[180px_1fr_auto] sm:items-center">
                    <div className="flex items-center gap-2">
                      <CreditCard size={15} className="flex-shrink-0 text-slate-400" />
                      <span className="text-xs font-bold text-slate-400">
                        {tipoLabel[doctor?.tipoDocumento] || doctor?.tipoDocumento}
                      </span>
                    </div>

                    <span className="font-mono text-sm font-black text-slate-700">
                      {doctor?.numeroDocumento || '—'}
                    </span>

                    <span className={`inline-flex w-fit items-center gap-2 rounded-2xl px-3 py-1.5 text-xs font-black ${vBadge.bg} ${vBadge.text}`}>
                      <span className={`h-2 w-2 rounded-full ${vBadge.dot}`} />
                      {vBadge.label}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-1">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex h-12 w-full items-center justify-center rounded-xl bg-[#000089] px-5 text-sm font-black text-white shadow-lg shadow-[#000089]/20 transition hover:bg-[#000070] hover:ring-4 hover:ring-[#00CCA5]/15 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
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