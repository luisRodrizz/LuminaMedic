import { useState } from 'react'
import { X, Ban, AlertCircle, AlertTriangle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../../../services/api'

export default function ModalCrearBloqueo({ doctorId, doctorNombre, onClose, onSuccess }) {
  const [form, setForm] = useState({ fechaInicio: '', fechaFin: '', motivo: '' })
  const [cancelarCitas, setCancelarCitas] = useState(false)
  const [citasAfectadas, setCitasAfectadas] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const hoy = new Date().toISOString().split('T')[0]
  const inputClass = "w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-slate-50 transition-all"

  // Verificar citas afectadas cuando cambian las fechas
  const verificarCitas = async (fechaInicio, fechaFin) => {
    if (!fechaInicio || !fechaFin || fechaInicio > fechaFin) {
      setCitasAfectadas(null)
      return
    }
    try {
      // Usamos el endpoint de obtener citas del doctor en ese rango
      const res = await api.get(`/citas?page=1&limit=100&inicio=${fechaInicio}&fin=${fechaFin}`)
      const afectadas = res.data.data.filter(c =>
        c.estado === 'PENDIENTE' || c.estado === 'CONFIRMADA'
      )
      setCitasAfectadas(afectadas.length)
    } catch {
      setCitasAfectadas(null)
    }
  }

  const handleFechaChange = (campo, valor) => {
    const nuevo = { ...form, [campo]: valor }
    setForm(nuevo)
    if (nuevo.fechaInicio && nuevo.fechaFin) {
      verificarCitas(nuevo.fechaInicio, nuevo.fechaFin)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.fechaInicio || !form.fechaFin) return setError('Las fechas son requeridas')
    if (form.fechaInicio > form.fechaFin) return setError('La fecha de inicio debe ser anterior a la fecha de fin')
    setLoading(true)
    try {
      const res = await api.post('/horarios/bloqueos', {
        doctorId,
        fechaInicio: form.fechaInicio,
        fechaFin: form.fechaFin,
        motivo: form.motivo || null,
        cancelarCitasAfectadas: cancelarCitas
      })

      if (res.data.citasCanceladas > 0) {
        onSuccess(`Bloqueo creado y ${res.data.citasCanceladas} cita(s) cancelada(s) correctamente`)
      } else {
        onSuccess()
      }
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Error al crear el bloqueo')
    } finally {
      setLoading(false)
    }
  }

  const diasBloqueados = form.fechaInicio && form.fechaFin
    ? Math.ceil((new Date(form.fechaFin) - new Date(form.fechaInicio)) / (1000 * 60 * 60 * 24)) + 1
    : 0

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }} transition={{ duration: 0.2, ease: 'easeOut' }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center">
              <Ban size={17} className="text-red-500" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-800">Bloquear días</h2>
              <p className="text-xs text-slate-400">Dr. {doctorNombre}</p>
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
                className="flex items-start gap-2 text-sm px-4 py-3 rounded-xl mb-4 bg-red-50 border border-red-100 text-red-600">
                <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4">

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Fecha inicio <span className="text-red-400">*</span></label>
                <input type="date" value={form.fechaInicio} min={hoy}
                  onChange={e => handleFechaChange('fechaInicio', e.target.value)}
                  className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Fecha fin <span className="text-red-400">*</span></label>
                <input type="date" value={form.fechaFin} min={form.fechaInicio || hoy}
                  onChange={e => handleFechaChange('fechaFin', e.target.value)}
                  className={inputClass} />
              </div>
            </div>

            {/* Preview días bloqueados */}
            {diasBloqueados > 0 && (
              <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-100 rounded-xl">
                <Ban size={13} className="text-red-500 flex-shrink-0" />
                <p className="text-xs text-red-700">
                  Se bloquearán <strong>{diasBloqueados} día{diasBloqueados !== 1 ? 's' : ''}</strong> — los pacientes no podrán agendar citas en este período
                </p>
              </div>
            )}

            {/* Advertencia citas afectadas */}
            <AnimatePresence>
              {citasAfectadas !== null && citasAfectadas > 0 && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  className="border border-amber-200 bg-amber-50 rounded-xl p-4 space-y-3">
                  <div className="flex items-start gap-2">
                    <AlertTriangle size={15} className="text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-700">
                      Hay <strong>{citasAfectadas} cita(s)</strong> confirmadas o pendientes en este período. ¿Qué deseas hacer con ellas?
                    </p>
                  </div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div className="relative">
                      <input type="checkbox" checked={cancelarCitas}
                        onChange={e => setCancelarCitas(e.target.checked)}
                        className="sr-only" />
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                        cancelarCitas ? 'bg-amber-500 border-amber-500' : 'border-slate-300 bg-white'
                      }`}>
                        {cancelarCitas && <span className="text-white text-[10px] font-bold">✓</span>}
                      </div>
                    </div>
                    <span className="text-xs font-medium text-amber-800">
                      Cancelar automáticamente las {citasAfectadas} cita(s) y notificar a los pacientes
                    </span>
                  </label>
                  {!cancelarCitas && (
                    <p className="text-xs text-amber-600 pl-7">
                      Si no las cancelas, deberás gestionarlas manualmente.
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Motivo <span className="text-slate-400 font-normal">(opcional)</span>
              </label>
              <input value={form.motivo} onChange={e => setForm(prev => ({ ...prev, motivo: e.target.value }))}
                placeholder="Ej: Vacaciones, Congreso médico, Licencia..."
                className={inputClass} />
            </div>

            <div className="flex gap-3 pt-1">
              <button type="button" onClick={onClose}
                className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50 transition-all">
                Cancelar
              </button>
              <button type="submit" disabled={loading}
                className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-all shadow-sm hover:shadow-md">
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Bloqueando...
                  </span>
                ) : 'Confirmar bloqueo'}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  )
}