import { useState } from 'react'
import { X, FileText } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../../../services/api'

export default function ModalNotaCita({ cita, onClose, onSuccess }) {
  const [nota, setNota] = useState({
    diagnostico: '', tratamiento: '', receta: '', observacion: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      setLoading(true)
      await api.post(`/citas/${cita.id}/nota`, nota)
      onSuccess()
      onClose()
    } catch {
      setError('Error al guardar la nota clínica')
    } finally {
      setLoading(false)
    }
  }

  const textareaClass =
    'w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#00CCA5] focus:bg-white focus:ring-4 focus:ring-[#00CCA5]/15'

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 py-6 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 14 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl"
      >
        <div className="h-1.5 w-full bg-gradient-to-r from-[#000089] via-[#0069C9] to-[#00CCA5]" />

        {/* Header */}
        <div className="flex flex-shrink-0 items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-[#00CCA5]/10">
              <FileText size={19} className="text-[#008f78]" />
            </div>

            <div className="min-w-0">
              <h2 className="text-lg font-black tracking-tight text-slate-900">
                Nota Clínica
              </h2>

              <p className="mt-1 truncate text-xs font-medium text-slate-400">
                {cita.paciente.usuario.nombre} {cita.paciente.usuario.apellido} · {cita.servicio.nombre}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            title="Cerrar modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-6 py-5">
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
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="rounded-3xl border border-slate-200/80 bg-slate-50/60 p-4">
              <label className="mb-2 block text-xs font-black uppercase tracking-[0.12em] text-slate-500">
                Diagnóstico <span className="text-red-500">*</span>
              </label>

              <textarea
                value={nota.diagnostico}
                onChange={(e) => setNota({ ...nota, diagnostico: e.target.value })}
                rows={3}
                required
                placeholder="Diagnóstico del paciente..."
                className={textareaClass}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-[0.12em] text-slate-500">
                  Tratamiento
                  <span className="ml-1 font-bold normal-case tracking-normal text-slate-400">
                    (opcional)
                  </span>
                </label>

                <textarea
                  value={nota.tratamiento}
                  onChange={(e) => setNota({ ...nota, tratamiento: e.target.value })}
                  rows={4}
                  placeholder="Tratamiento indicado..."
                  className={textareaClass}
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-[0.12em] text-slate-500">
                  Receta
                  <span className="ml-1 font-bold normal-case tracking-normal text-slate-400">
                    (opcional)
                  </span>
                </label>

                <textarea
                  value={nota.receta}
                  onChange={(e) => setNota({ ...nota, receta: e.target.value })}
                  rows={4}
                  placeholder="Medicamentos recetados..."
                  className={textareaClass}
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-[0.12em] text-slate-500">
                Observaciones
                <span className="ml-1 font-bold normal-case tracking-normal text-slate-400">
                  (opcional)
                </span>
              </label>

              <textarea
                value={nota.observacion}
                onChange={(e) => setNota({ ...nota, observacion: e.target.value })}
                rows={3}
                placeholder="Observaciones adicionales..."
                className={textareaClass}
              />
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                className="flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-black text-slate-600 transition hover:bg-slate-50 hover:text-slate-800"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={loading}
                className="flex h-11 items-center justify-center rounded-xl bg-[#000089] px-5 text-sm font-black text-white shadow-lg shadow-[#000089]/20 transition hover:bg-[#000070] hover:ring-4 hover:ring-[#00CCA5]/15 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Guardando...' : 'Guardar Nota'}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  )
}