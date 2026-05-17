import { useState } from 'react'
import {
  X,
  Pencil,
  CreditCard,
  ShieldCheck,
  ShieldAlert,
  ShieldOff,
  Phone,
  Stethoscope,
  ClipboardList,
  Save
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../../../services/api'

const validacionBadge = {
  VALIDADO: {
    bg: 'bg-[#00CCA5]/10',
    text: 'text-[#008f78]',
    dot: 'bg-[#00CCA5]',
    label: 'Validado RENIEC',
    Icon: ShieldCheck
  },
  PENDIENTE: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    dot: 'bg-amber-400',
    label: 'Pendiente',
    Icon: ShieldAlert
  },
  NO_APLICA: {
    bg: 'bg-slate-100',
    text: 'text-slate-500',
    dot: 'bg-slate-400',
    label: 'No aplica',
    Icon: ShieldOff
  }
}

export default function ModalEditarDoctor({ doctor, onClose, onSuccess }) {
  const [form, setForm] = useState({
    telefono: doctor?.usuario.telefono || '',
    especialidad: doctor?.especialidad || '',
    descripcion: doctor?.descripcion || ''
  })
  const [error, setError] = useState('')

  const inputClass =
    'w-full h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-[#00CCA5] focus:bg-white focus:ring-4 focus:ring-[#00CCA5]/15'

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    try {
      await api.put(`/doctores/${doctor.id}`, form)
      onSuccess()
      onClose()
    } catch {
      setError('Error al actualizar el doctor.')
    }
  }

  const vBadge = validacionBadge[doctor?.validacionReniec] || validacionBadge.PENDIENTE
  const BadgeIcon = vBadge.Icon

  const tipoLabel =
    {
      DNI: 'DNI',
      CE: 'Carné Ext.',
      PASAPORTE: 'Pasaporte'
    }[doctor?.tipoDocumento] || doctor?.tipoDocumento

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
        className="w-full max-w-2xl overflow-hidden rounded-[2rem] border border-white/70 bg-white shadow-2xl shadow-slate-950/20"
      >
        {/* Header */}
        <div className="relative border-b border-slate-100 px-6 py-6">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#000089] via-[#00A98A] to-[#00CCA5]" />

          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#000089]/10">
                <Pencil size={20} className="text-[#000089]" />
              </div>

              <div>
                <h2 className="text-lg font-black text-slate-950">
                  Editar Doctor
                </h2>
                <p className="mt-0.5 text-xs text-slate-400">
                  Dr. {doctor?.usuario.nombre} {doctor?.usuario.apellido}
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
        <div className="px-6 py-6">
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

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Datos oficiales */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white">
                    <CreditCard size={18} className="text-slate-500" />
                  </div>

                  <div>
                    <p className="text-sm font-black text-slate-900">
                      Datos de identidad
                    </p>
                    <p className="text-xs text-slate-400">
                      Información oficial no editable
                    </p>
                  </div>
                </div>

                <span
                  className={`inline-flex items-center gap-2 rounded-2xl px-3 py-1.5 text-xs font-black ${vBadge.bg} ${vBadge.text}`}
                >
                  <BadgeIcon size={13} />
                  <span className={`h-2 w-2 rounded-full ${vBadge.dot}`} />
                  {vBadge.label}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                  <p className="text-xs font-bold text-slate-400">
                    {tipoLabel}
                  </p>
                  <p className="mt-1 font-mono text-sm font-black text-slate-800">
                    {doctor?.numeroDocumento || '—'}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                  <p className="text-xs font-bold text-slate-400">
                    Nombre
                  </p>
                  <p className="mt-1 truncate text-sm font-black text-slate-800">
                    {doctor?.usuario.nombre}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                  <p className="text-xs font-bold text-slate-400">
                    Apellido
                  </p>
                  <p className="mt-1 truncate text-sm font-black text-slate-800">
                    {doctor?.usuario.apellido}
                  </p>
                </div>
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
                    className={`${inputClass} pl-11`}
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-black text-slate-700">
                  Especialidad
                </label>

                <div className="relative">
                  <Stethoscope
                    size={17}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    name="especialidad"
                    value={form.especialidad}
                    onChange={handleChange}
                    required
                    placeholder="Cardiología, Pediatría..."
                    className={`${inputClass} pl-11`}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-black text-slate-700">
                Descripción{' '}
                <span className="font-medium text-slate-400">(opcional)</span>
              </label>

              <div className="relative">
                <ClipboardList
                  size={17}
                  className="absolute left-4 top-4 text-slate-400"
                />

                <textarea
                  name="descripcion"
                  value={form.descripcion}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Breve descripción del médico..."
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pl-11 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-[#00CCA5] focus:bg-white focus:ring-4 focus:ring-[#00CCA5]/15"
                />
              </div>
            </div>

            <div className="rounded-2xl border border-[#00CCA5]/20 bg-[#00CCA5]/10 px-4 py-3">
              <p className="text-xs leading-5 text-[#008f78]">
                Los datos oficiales de identidad no se modifican desde este formulario.
                Solo puedes actualizar información profesional y de contacto.
              </p>
            </div>

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
                className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#000089] px-4 text-sm font-black text-white shadow-lg shadow-[#000089]/20 transition hover:bg-[#000070] hover:ring-4 hover:ring-[#00CCA5]/15"
              >
                <Save size={16} />
                Guardar Cambios
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  )
}