import { AlertTriangle, X } from 'lucide-react'
import { motion } from 'framer-motion'

export default function ModalConfirmar({ mensaje, subMensaje, onConfirmar, onCancelar, tipo = 'danger' }) {
  const colores = {
    danger: {
      icon: 'bg-red-50 text-red-600',
      button: 'bg-red-600 hover:bg-red-700',
      border: 'border-red-100'
    },
    warning: {
      icon: 'bg-yellow-50 text-yellow-600',
      button: 'bg-amber-500 hover:bg-amber-600',
      border: 'border-yellow-100'
    },
    success: {
      icon: 'bg-emerald-50 text-emerald-600',
      button: 'bg-emerald-600 hover:bg-emerald-700',
      border: 'border-emerald-100'
    }
  }

  const color = colores[tipo]

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
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <p className="text-sm font-semibold text-slate-700">Confirmar acción</p>
          <button onClick={onCancelar}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6 flex flex-col items-center text-center">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${color.icon} border ${color.border}`}>
            <AlertTriangle size={24} />
          </div>
          <h3 className="text-base font-semibold text-slate-800 mb-1">{mensaje}</h3>
          {subMensaje && (
            <p className="text-sm text-slate-400">{subMensaje}</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-slate-100">
          <button onClick={onCancelar}
            className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50 transition-all">
            Cancelar
          </button>
          <button onClick={onConfirmar}
            className={`flex-1 px-4 py-2.5 text-white rounded-xl text-sm font-medium transition-all shadow-sm hover:shadow-md ${color.button}`}>
            Confirmar
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}