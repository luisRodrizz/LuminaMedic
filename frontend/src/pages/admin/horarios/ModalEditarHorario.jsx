import { useState } from 'react'
import { X, Clock, Save, CalendarDays, Power } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../../../services/api'

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

export default function ModalEditarHorario({ horario, onClose, onSuccess }) {
  const [form, setForm] = useState({
    horaInicio: horario.horaInicio,
    horaFin: horario.horaFin,
    activo: horario.activo
  })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const inputClass =
    'h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-800 outline-none transition focus:border-[#00CCA5] focus:bg-white focus:ring-4 focus:ring-[#00CCA5]/15'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)

    try {
      await api.put(`/horarios/${horario.id}`, form)
      onSuccess()
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Error al actualizar el horario')
    } finally {
      setSaving(false)
    }
  }

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
        className="w-full max-w-lg overflow-hidden rounded-[2rem] border border-white/70 bg-white shadow-2xl shadow-slate-950/20"
      >
        {/* Header */}
        <div className="relative border-b border-slate-100 px-6 py-6">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#000089] via-[#00A98A] to-[#00CCA5]" />

          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#00CCA5]/10">
                <Clock size={21} className="text-[#008f78]" />
              </div>

              <div>
                <h2 className="text-lg font-black text-slate-950">
                  Editar Horario
                </h2>
                <p className="mt-0.5 text-xs text-slate-400">
                  {DIAS[horario.diaSemana]} · Actualiza el rango de atención.
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
            <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white">
                  <CalendarDays size={18} className="text-slate-500" />
                </div>

                <div>
                  <p className="text-sm font-black text-slate-900">
                    Día configurado
                  </p>
                  <p className="text-xs text-slate-400">
                    {DIAS[horario.diaSemana]}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-black text-slate-700">
                    Hora inicio
                  </label>

                  <div className="relative">
                    <Clock
                      size={16}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="time"
                      value={form.horaInicio}
                      onChange={(e) =>
                        setForm({ ...form, horaInicio: e.target.value })
                      }
                      required
                      className={`${inputClass} pl-11`}
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-black text-slate-700">
                    Hora fin
                  </label>

                  <div className="relative">
                    <Clock
                      size={16}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="time"
                      value={form.horaFin}
                      onChange={(e) =>
                        setForm({ ...form, horaFin: e.target.value })
                      }
                      required
                      className={`${inputClass} pl-11`}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Toggle activo */}
            <div className="flex items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-5">
              <div className="flex items-start gap-3">
                <div
                  className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl ${
                    form.activo ? 'bg-[#00CCA5]/10' : 'bg-slate-100'
                  }`}
                >
                  <Power
                    size={18}
                    className={form.activo ? 'text-[#008f78]' : 'text-slate-400'}
                  />
                </div>

                <div>
                  <p className="text-sm font-black text-slate-900">
                    Horario activo
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    {form.activo
                      ? 'Los pacientes podrán agendar en este horario.'
                      : 'Este horario quedará deshabilitado para nuevas citas.'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setForm({ ...form, activo: !form.activo })}
                className={`relative h-7 w-12 flex-shrink-0 rounded-full transition-colors duration-200 ${
                  form.activo ? 'bg-[#00CCA5]' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`absolute left-0.5 top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform duration-200 ${
                    form.activo ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="rounded-2xl border border-[#00CCA5]/20 bg-[#00CCA5]/10 px-4 py-3">
              <p className="text-xs leading-5 text-[#008f78]">
                Si desactivas el horario, seguirá registrado, pero no estará disponible para nuevas reservas.
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
                disabled={saving}
                className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#000089] px-4 text-sm font-black text-white shadow-lg shadow-[#000089]/20 transition hover:bg-[#000070] hover:ring-4 hover:ring-[#00CCA5]/15 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Guardar cambios
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  )
}