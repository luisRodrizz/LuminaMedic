import { useState } from 'react'
import { X, Pencil, Save, UserRound } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../../../services/api'

const estados = ['PENDIENTE', 'CONFIRMADA', 'COMPLETADA', 'CANCELADA']

const estadoConfig = {
  PENDIENTE: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-300',
    dot: 'bg-amber-400'
  },
  CONFIRMADA: {
    bg: 'bg-[#000089]/10',
    text: 'text-[#000089]',
    border: 'border-[#000089]/30',
    dot: 'bg-[#000089]'
  },
  COMPLETADA: {
    bg: 'bg-[#00CCA5]/10',
    text: 'text-[#008f78]',
    border: 'border-[#00CCA5]/35',
    dot: 'bg-[#00CCA5]'
  },
  CANCELADA: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-300',
    dot: 'bg-red-500'
  }
}

export default function ModalEditarCita({ cita, onClose, onSuccess }) {
  const [estado, setEstado] = useState(cita?.estado || 'PENDIENTE')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    try {
      await api.patch(`/citas/${cita.id}/estado`, { estado })
      onSuccess()
      onClose()
    } catch {
      setError('Error al actualizar el estado.')
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
        className="w-full max-w-md overflow-hidden rounded-[2rem] border border-white/70 bg-white shadow-2xl shadow-slate-950/20"
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
                  Cambiar Estado
                </h2>
                <p className="mt-0.5 text-xs text-slate-400">
                  Actualiza el estado de la cita seleccionada.
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
          <div className="mb-5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-2xl bg-[#00CCA5]/10">
                <UserRound size={17} className="text-[#008f78]" />
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-black text-slate-800">
                  {cita.paciente.usuario.nombre} {cita.paciente.usuario.apellido}
                </p>
                <p className="text-xs text-slate-400">
                  Paciente de la cita
                </p>
              </div>
            </div>
          </div>

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
              <p className="mb-3 text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">
                Selecciona el estado
              </p>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {estados.map((e) => {
                  const cfg = estadoConfig[e]
                  const isSelected = estado === e

                  return (
                    <button
                      key={e}
                      type="button"
                      onClick={() => setEstado(e)}
                      className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-xs font-black transition-all ${
                        isSelected
                          ? `${cfg.bg} ${cfg.text} ${cfg.border} shadow-sm`
                          : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800'
                      }`}
                    >
                      <span
                        className={`h-2.5 w-2.5 flex-shrink-0 rounded-full ${
                          isSelected ? cfg.dot : 'bg-slate-300'
                        }`}
                      />

                      <span>{e}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="rounded-2xl border border-[#00CCA5]/20 bg-[#00CCA5]/10 px-4 py-3">
              <p className="text-xs leading-5 text-[#008f78]">
                Este cambio actualizará el estado visible de la cita dentro del sistema.
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
                Guardar
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  )
}