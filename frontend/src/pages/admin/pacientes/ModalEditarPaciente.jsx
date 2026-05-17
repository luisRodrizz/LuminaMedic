import { useState } from 'react'
import {
  X,
  Pencil,
  UserCheck,
  Phone,
  CalendarDays,
  MapPin,
  VenusAndMars,
  ClipboardList,
  IdCard,
  Save
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../../../services/api'

export default function ModalEditarPaciente({ paciente, onClose, onSuccess }) {
  const [form, setForm] = useState({
    telefono: paciente?.usuario.telefono || '',
    direccion: paciente?.direccion || '',
    alergias: paciente?.alergias || '',
    genero: paciente?.genero || '',
    fechaNac: paciente?.fechaNac
      ? new Date(paciente.fechaNac).toISOString().split('T')[0]
      : '',
    tutorNombre: paciente?.tutorNombre || '',
    tutorDni: paciente?.tutorDni || '',
    tutorTelefono: paciente?.tutorTelefono || ''
  })

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value })

  const calcularEdad = (fechaNac) => {
    if (!fechaNac) return null

    const fecha = new Date(fechaNac)
    const hoy = new Date()

    return hoy.getFullYear() - fecha.getFullYear() -
      (hoy < new Date(hoy.getFullYear(), fecha.getMonth(), fecha.getDate())
        ? 1
        : 0)
  }

  const edad = calcularEdad(form.fechaNac)
  const esMenor = edad !== null && edad < 18

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

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

      await api.put(`/pacientes/${paciente.id}`, { ...form, esMenor })

      onSuccess()
      onClose()
    } catch {
      setError('Error al actualizar el paciente.')
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'w-full h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-[#00CCA5] focus:bg-white focus:ring-4 focus:ring-[#00CCA5]/15'

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
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#000089]/10">
                <Pencil size={20} className="text-[#000089]" />
              </div>

              <div>
                <h2 className="text-lg font-black text-slate-950">
                  Editar Paciente
                </h2>
                <p className="mt-0.5 text-xs text-slate-400">
                  {paciente?.usuario.nombre} {paciente?.usuario.apellido}
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
        </div>

        {/* Body */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 space-y-5 overflow-y-auto px-6 py-6"
        >
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600"
              >
                <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-red-500" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Información editable */}
          <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white">
                <ClipboardList size={18} className="text-slate-500" />
              </div>

              <div>
                <p className="text-sm font-black text-slate-900">
                  Datos editables
                </p>
                <p className="text-xs text-slate-400">
                  Actualiza información de contacto y datos clínicos básicos.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-black text-slate-700">
                  Teléfono
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
                    className={`${inputClass} bg-white pl-11`}
                  />
                </div>
              </div>

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
                    className={`${inputClass} bg-white pl-11`}
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
                  Fecha de nacimiento
                  {esMenor && (
                    <span className="ml-1.5 font-bold text-amber-600">
                      · Menor de edad
                    </span>
                  )}
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
                    className={`${inputClass} bg-white pl-11`}
                  />
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
                    className={`${inputClass} bg-white pl-11`}
                  />
                </div>
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

          {/* Alergias */}
          <div>
            <label className="mb-2 block text-xs font-black text-slate-700">
              Alergias{' '}
              <span className="font-medium text-slate-400">(opcional)</span>
            </label>

            <div className="relative">
              <ClipboardList
                size={17}
                className="absolute left-4 top-4 text-slate-400"
              />

              <textarea
                name="alergias"
                value={form.alergias}
                onChange={handleChange}
                rows={3}
                placeholder="Ej: Penicilina, Polen..."
                className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pl-11 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-[#00CCA5] focus:bg-white focus:ring-4 focus:ring-[#00CCA5]/15"
              />
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
                      Tutor / Padre responsable
                    </p>
                    <p className="mt-0.5 text-xs leading-5 text-amber-700">
                      Datos obligatorios porque el paciente es menor de edad.
                    </p>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-black text-slate-700">
                    Nombre completo del tutor{' '}
                    <span className="text-red-400">*</span>
                  </label>

                  <div className="relative">
                    <UserCheck
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

          {/* Footer */}
          <div className="flex flex-col-reverse gap-3 pt-1 sm:flex-row">
            <button
              type="button"
              onClick={onClose}
              className="flex h-11 flex-1 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
            >
              Cancelar
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
                  Guardar Cambios
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}