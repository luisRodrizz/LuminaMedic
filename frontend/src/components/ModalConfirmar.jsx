import { AlertTriangle, X, CheckCircle, AlertCircle } from 'lucide-react'
import { motion } from 'framer-motion'

export default function ModalConfirmar({
  mensaje,
  subMensaje,
  onConfirmar,
  onCancelar,
  tipo = 'danger'
}) {
  const colores = {
    danger: {
      icon: 'bg-red-50 text-red-600 border-red-100',
      button: 'bg-red-500 hover:bg-red-600 shadow-red-500/20',
      soft: 'bg-red-50 border-red-100',
      text: 'text-red-700',
      Icon: AlertTriangle
    },
    warning: {
      icon: 'bg-amber-50 text-amber-600 border-amber-100',
      button: 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20',
      soft: 'bg-amber-50 border-amber-100',
      text: 'text-amber-700',
      Icon: AlertCircle
    },
    success: {
      icon: 'bg-[#00CCA5]/10 text-[#008f78] border-[#00CCA5]/20',
      button: 'bg-[#000089] hover:bg-[#000070] shadow-[#000089]/20',
      soft: 'bg-[#00CCA5]/10 border-[#00CCA5]/20',
      text: 'text-[#008f78]',
      Icon: CheckCircle
    }
  }

  const color = colores[tipo] || colores.danger
  const Icon = color.Icon

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
        className="w-full max-w-sm overflow-hidden rounded-[2rem] border border-white/70 bg-white shadow-2xl shadow-slate-950/20"
      >
        {/* Header */}
        <div className="relative border-b border-slate-100 px-6 py-5">
          <div
            className={`absolute inset-x-0 top-0 h-1 ${
              tipo === 'danger'
                ? 'bg-red-500'
                : tipo === 'warning'
                  ? 'bg-amber-500'
                  : 'bg-gradient-to-r from-[#000089] to-[#00CCA5]'
            }`}
          />

          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-black text-slate-900">
              Confirmar acción
            </p>

            <button
              onClick={onCancelar}
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            >
              <X size={17} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-7 text-center">
          <div
            className={`mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl border ${color.icon}`}
          >
            <Icon size={28} />
          </div>

          <h3 className="text-base font-black leading-6 text-slate-900">
            {mensaje}
          </h3>

          {subMensaje && (
            <div className={`mt-4 rounded-2xl border px-4 py-3 ${color.soft}`}>
              <p className={`text-sm font-bold leading-5 ${color.text}`}>
                {subMensaje}
              </p>
            </div>
          )}

          <p className="mt-4 text-xs leading-5 text-slate-400">
            Esta acción puede modificar el estado de la información dentro del sistema.
          </p>
        </div>

        {/* Footer */}
        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 px-6 py-4 sm:flex-row">
          <button
            onClick={onCancelar}
            type="button"
            className="flex h-11 flex-1 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
          >
            Cancelar
          </button>

          <button
            onClick={onConfirmar}
            type="button"
            className={`flex h-11 flex-1 items-center justify-center rounded-xl px-4 text-sm font-black text-white shadow-lg transition ${color.button}`}
          >
            Confirmar
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}