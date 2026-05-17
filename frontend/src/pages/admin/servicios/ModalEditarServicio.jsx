import { useState } from 'react'
import { X, Pencil, Activity, Clock, DollarSign, Save } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../../../services/api'

export default function ModalEditarServicio({ servicio, onClose, onSuccess }) {
  const [form, setForm] = useState({
    nombre: servicio?.nombre || '',
    precio: servicio?.precio || '',
    duracion: servicio?.duracion || ''
  })
  const [error, setError] = useState('')

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    try {
      await api.put(`/servicios/${servicio.id}`, form)
      onSuccess()
      onClose()
    } catch {
      setError('Error al actualizar el servicio.')
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
        className="w-full max-w-lg overflow-hidden rounded-[2rem] border border-white/70 bg-white shadow-2xl shadow-slate-950/20"
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
                  Editar Servicio
                </h2>
                <p className="mt-0.5 text-xs text-slate-400">
                  {servicio?.nombre || 'Actualiza la información del servicio'}
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
            <div>
              <label className="mb-2 block text-xs font-black text-slate-700">
                Nombre del servicio
              </label>

              <div className="relative">
                <Activity
                  size={17}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  required
                  placeholder="Consulta General, Cardiología..."
                  className={`${inputClass} pl-11`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-black text-slate-700">
                  Precio (S/)
                </label>

                <div className="relative">
                  <DollarSign
                    size={17}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    name="precio"
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.precio}
                    onChange={handleChange}
                    required
                    placeholder="0.00"
                    className={`${inputClass} pl-11`}
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-black text-slate-700">
                  Duración (min)
                </label>

                <div className="relative">
                  <Clock
                    size={17}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    name="duracion"
                    type="number"
                    min="1"
                    value={form.duracion}
                    onChange={handleChange}
                    required
                    placeholder="30"
                    className={`${inputClass} pl-11`}
                  />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-[#000089]/10 bg-[#000089]/5 px-4 py-3">
              <p className="text-xs leading-5 text-slate-600">
                Los cambios se aplicarán al servicio y estarán disponibles para nuevas reservas de citas.
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