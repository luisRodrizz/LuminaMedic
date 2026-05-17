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
  VALIDADO:  {
    bg: 'bg-[#00CCA5]/10',
    text: 'text-[#008f78]',
    dot: 'bg-[#00CCA5]',
    border: 'border-[#00CCA5]/20',
    label: 'Validado RENIEC'
  },
  PENDIENTE: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    dot: 'bg-amber-400',
    border: 'border-amber-100',
    label: 'Pendiente'
  },
  NO_APLICA: {
    bg: 'bg-slate-100',
    text: 'text-slate-500',
    dot: 'bg-slate-400',
    border: 'border-slate-200',
    label: 'No aplica'
  },
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
      <div className="flex h-64 flex-col items-center justify-center gap-3">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-[#00CCA5] border-t-transparent" />
        <p className="text-sm text-slate-400">Cargando perfil...</p>
      </div>
    </PacienteLayout>
  )

  const inputClass = 'w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#00CCA5] focus:bg-white focus:ring-4 focus:ring-[#00CCA5]/15'
  const vBadge = validacionBadge[paciente?.validacionReniec] || validacionBadge.PENDIENTE

  return (
    <PacienteLayout>
      <div className="page-enter">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-black tracking-tight text-slate-950 md:text-3xl">
            Mi Perfil
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Administra tu información personal, datos de salud y seguridad de acceso.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Columna izquierda */}
          <div className="rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-sm">
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-4">
                <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-[2rem] border border-[#00CCA5]/20 bg-[#00CCA5]/10 shadow-sm">
                  {preview ? (
                    <img
                      src={preview}
                      alt="Foto de perfil"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl font-black text-[#008f78]">
                      {paciente?.usuario.nombre[0]}{paciente?.usuario.apellido[0]}
                    </span>
                  )}
                </div>

                <div className="absolute -bottom-2 -right-2 flex h-9 w-9 items-center justify-center rounded-2xl border border-white bg-[#000089] shadow-lg shadow-[#000089]/20">
                  <UserCircle size={17} className="text-white" />
                </div>
              </div>

              <p className="text-base font-black leading-snug text-slate-900">
                {paciente?.usuario.nombre} {paciente?.usuario.apellido}
              </p>

              <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
                <span className="rounded-full bg-[#000089]/10 px-3 py-1 text-xs font-black text-[#000089]">
                  Paciente
                </span>

                {paciente?.esMenor && (
                  <span className="flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-black text-amber-700">
                    <UserCheck size={11} />
                    Menor de edad
                  </span>
                )}
              </div>

              <label className="mt-6 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#00CCA5]/20 bg-[#00CCA5]/10 px-4 py-3 text-sm font-black text-[#008f78] transition hover:bg-[#00CCA5]/15">
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

              <p className="mt-2 text-xs text-slate-400">
                JPG, PNG o WEBP · Máx 5MB
              </p>
            </div>

            <div className="mt-6 border-t border-slate-100 pt-5 text-center">
              <p className="text-4xl font-black text-slate-900">
                {paciente?.citas?.length || 0}
              </p>
              <p className="mt-1 text-xs font-medium text-slate-400">
                Citas registradas
              </p>
            </div>

            <div className="mt-5 border-t border-slate-100 pt-5">
              <button
                onClick={() => setModalPass(true)}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-600 transition hover:bg-slate-50 hover:text-[#000089]"
              >
                <Lock size={15} />
                Cambiar contraseña
              </button>
            </div>
          </div>

          {/* Columna derecha */}
          <div className="rounded-[2rem] border border-slate-200/80 bg-white p-5 shadow-sm md:p-6 lg:col-span-2">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-[#000089]/10">
                <UserCircle size={19} className="text-[#000089]" />
              </div>

              <div>
                <h2 className="text-base font-black text-slate-900">
                  Información editable
                </h2>
                <p className="text-xs text-slate-400">
                  Estos datos pueden actualizarse desde tu cuenta.
                </p>
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="mb-5 flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
                >
                  <AlertCircle size={16} className="mt-0.5 flex-shrink-0 text-red-500" />
                  <span>{error}</span>
                </motion.div>
              )}

              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="mb-5 flex items-start gap-3 rounded-2xl border border-[#00CCA5]/20 bg-[#00CCA5]/10 px-4 py-3 text-sm font-medium text-[#008f78]"
                >
                  <CheckCircle size={16} className="mt-0.5 flex-shrink-0 text-[#008f78]" />
                  <span>{success}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-black uppercase tracking-[0.08em] text-slate-500">
                    Teléfono
                  </label>
                  <input
                    name="telefono"
                    value={form.telefono}
                    onChange={handleChange}
                    placeholder="+51 999 999 999"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-black uppercase tracking-[0.08em] text-slate-500">
                    Fecha de nacimiento
                  </label>
                  <input
                    name="fechaNac"
                    type="date"
                    value={form.fechaNac}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-black uppercase tracking-[0.08em] text-slate-500">
                    Género
                  </label>
                  <select
                    name="genero"
                    value={form.genero}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="">Seleccionar...</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Femenino">Femenino</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-black uppercase tracking-[0.08em] text-slate-500">
                    Dirección
                  </label>
                  <input
                    name="direccion"
                    value={form.direccion}
                    onChange={handleChange}
                    placeholder="Av. Principal 123"
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-black uppercase tracking-[0.08em] text-slate-500">
                  Alergias <span className="font-medium normal-case tracking-normal text-slate-400">(opcional)</span>
                </label>

                <textarea
                  name="alergias"
                  value={form.alergias}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Ej: Penicilina, mariscos, látex..."
                  className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#00CCA5] focus:bg-white focus:ring-4 focus:ring-[#00CCA5]/15"
                />

                {form.alergias && (
                  <div className="mt-3 flex items-start gap-3 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3">
                    <AlertCircle size={16} className="mt-0.5 flex-shrink-0 text-amber-500" />
                    <p className="text-xs font-bold text-amber-700">
                      Esta información es visible para tu médico durante las consultas.
                    </p>
                  </div>
                )}
              </div>

              {/* Datos identidad — solo lectura */}
              <div className="overflow-hidden rounded-3xl border border-slate-200">
                <div className="border-b border-slate-100 bg-slate-50 px-5 py-4">
                  <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">
                    Datos de identidad
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Solo el administrador puede modificarlos.
                  </p>
                </div>

                <div className="divide-y divide-slate-100">
                  {[
                    { icon: Mail,       label: 'Correo',        value: paciente?.usuario.email },
                    { icon: UserCircle, label: 'Nombre',        value: `${paciente?.usuario.nombre} ${paciente?.usuario.apellido}` },
                    { icon: Calendar,   label: 'Miembro desde', value: paciente?.usuario.createdAt ? new Date(paciente.usuario.createdAt).toLocaleDateString('es-PE', { year: 'numeric', month: 'long' }) : '—' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 px-5 py-4">
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-slate-100">
                        <item.icon size={14} className="text-slate-400" />
                      </div>

                      <span className="w-24 flex-shrink-0 text-xs font-bold text-slate-400">
                        {item.label}
                      </span>

                      <span className="truncate text-xs font-black text-slate-600">
                        {item.value}
                      </span>
                    </div>
                  ))}

                  <div className="flex flex-wrap items-center gap-3 px-5 py-4">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-slate-100">
                      <CreditCard size={14} className="text-slate-400" />
                    </div>

                    <span className="w-24 flex-shrink-0 text-xs font-bold text-slate-400">
                      {tipoLabel[paciente?.tipoDocumento] || paciente?.tipoDocumento}
                    </span>

                    <span className="font-mono text-xs font-black text-slate-600">
                      {paciente?.numeroDocumento || '—'}
                    </span>

                    <span className={`ml-auto inline-flex items-center gap-2 rounded-2xl border px-3 py-1.5 text-xs font-black ${vBadge.bg} ${vBadge.text} ${vBadge.border}`}>
                      <span className={`h-2 w-2 rounded-full ${vBadge.dot}`} />
                      {vBadge.label}
                    </span>
                  </div>

                  {paciente?.esMenor && (
                    <div className="bg-amber-50 px-5 py-4">
                      <div className="mb-3 flex items-center gap-2">
                        <UserCheck size={15} className="flex-shrink-0 text-amber-600" />
                        <span className="text-xs font-black uppercase tracking-[0.1em] text-amber-700">
                          Datos del tutor/padre
                        </span>
                      </div>

                      <div className="space-y-2">
                        {[
                          { label: 'Nombre',     value: paciente?.tutorNombre   },
                          { label: 'DNI tutor',  value: paciente?.tutorDni      },
                          { label: 'Teléfono',   value: paciente?.tutorTelefono },
                        ].map((item, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <span className="w-24 flex-shrink-0 text-xs font-bold text-slate-400">
                              {item.label}
                            </span>

                            <span className="truncate font-mono text-xs font-black text-slate-600">
                              {item.value || '—'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-1">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex h-11 w-full items-center justify-center rounded-xl bg-[#000089] px-4 text-sm font-black text-white shadow-lg shadow-[#000089]/20 transition hover:bg-[#000070] disabled:cursor-not-allowed disabled:opacity-50"
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
        {modalPass && <ModalCambiarPassword onClose={() => setModalPass(false)} color="blue" />}
      </AnimatePresence>
    </PacienteLayout>
  )
}