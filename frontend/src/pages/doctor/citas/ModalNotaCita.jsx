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

  const textareaClass = "w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-slate-50 transition-all resize-none"

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
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center">
              <FileText size={18} className="text-emerald-600" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-800">Nota Clínica</h2>
              <p className="text-xs text-slate-400">
                {cita.paciente.usuario.nombre} {cita.paciente.usuario.apellido} · {cita.servicio.nombre}
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
                className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl mb-5">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0" />{error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Diagnóstico <span className="text-red-400">*</span>
              </label>
              <textarea value={nota.diagnostico} onChange={(e) => setNota({ ...nota, diagnostico: e.target.value })}
                rows={2} required placeholder="Diagnóstico del paciente..." className={textareaClass} />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Tratamiento <span className="text-slate-400 font-normal">(opcional)</span>
              </label>
              <textarea value={nota.tratamiento} onChange={(e) => setNota({ ...nota, tratamiento: e.target.value })}
                rows={2} placeholder="Tratamiento indicado..." className={textareaClass} />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Receta <span className="text-slate-400 font-normal">(opcional)</span>
              </label>
              <textarea value={nota.receta} onChange={(e) => setNota({ ...nota, receta: e.target.value })}
                rows={2} placeholder="Medicamentos recetados..." className={textareaClass} />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Observaciones <span className="text-slate-400 font-normal">(opcional)</span>
              </label>
              <textarea value={nota.observacion} onChange={(e) => setNota({ ...nota, observacion: e.target.value })}
                rows={2} placeholder="Observaciones adicionales..." className={textareaClass} />
            </div>

            <div className="flex gap-3 pt-1">
              <button type="button" onClick={onClose}
                className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50 transition-all">
                Cancelar
              </button>
              <button type="submit" disabled={loading}
                className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium transition-all shadow-sm hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed">
                {loading ? 'Guardando...' : 'Guardar Nota'}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  )
}