import { useState } from 'react'
import { X, Pencil } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../../../services/api'

const estados = ['PENDIENTE', 'CONFIRMADA', 'COMPLETADA', 'CANCELADA']

const estadoConfig = {
  PENDIENTE:  { bg: 'bg-yellow-50',  text: 'text-yellow-700',  border: 'border-yellow-300',  dot: 'bg-yellow-400'  },
  CONFIRMADA: { bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-300',    dot: 'bg-blue-400'    },
  COMPLETADA: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-300', dot: 'bg-emerald-400' },
  CANCELADA:  { bg: 'bg-red-50',     text: 'text-red-700',     border: 'border-red-300',     dot: 'bg-red-400'     },
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
      className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50 px-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center">
              <Pencil size={16} className="text-amber-600" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-800">Cambiar Estado</h2>
              <p className="text-xs text-slate-400">
                {cita.paciente.usuario.nombre} {cita.paciente.usuario.apellido}
              </p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0" />{error}
              </motion.div>
            )}
          </AnimatePresence>

          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Selecciona el estado</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              {estados.map((e) => {
                const cfg = estadoConfig[e]
                const isSelected = estado === e
                return (
                  <button
                    key={e}
                    type="button"
                    onClick={() => setEstado(e)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium border-2 transition-all ${
                      isSelected
                        ? `${cfg.bg} ${cfg.text} ${cfg.border}`
                        : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${isSelected ? cfg.dot : 'bg-slate-300'}`} />
                    {e}
                  </button>
                )
              })}
            </div>

            <div className="flex gap-3 pt-1">
              <button type="button" onClick={onClose}
                className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50 transition-all">
                Cancelar
              </button>
              <button type="submit"
                className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-all shadow-sm hover:shadow-md">
                Guardar
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  )
}