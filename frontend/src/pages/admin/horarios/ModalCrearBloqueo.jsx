import { useState } from 'react'
import {
  X,
  Ban,
  AlertCircle,
  AlertTriangle,
  CalendarDays,
  ClipboardList,
  Save
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../../../services/api'

export default function ModalCrearBloqueo({ doctorId, doctorNombre, onClose, onSuccess }) {
  const [form, setForm] = useState({ fechaInicio: '', fechaFin: '', motivo: '' })
  const [cancelarCitas, setCancelarCitas] = useState(false)
  const [citasAfectadas, setCitasAfectadas] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const hoy = new Date().toISOString().split('T')[0]

  const inputClass =
    'h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-[#00CCA5] focus:bg-white focus:ring-4 focus:ring-[#00CCA5]/15'

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

    if (!form.fechaInicio || !form.fechaFin) {
      return setError('Las fechas son requeridas')
    }

    if (form.fechaInicio > form.fechaFin) {
      return setError('La fecha de inicio debe ser anterior a la fecha de fin')
    }

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
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-red-500 via-[#000089] to-[#00CCA5]" />

          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50">
                <Ban size={21} className="text-red-600" />
              </div>

              <div>
                <h2 className="text-lg font-black text-slate-950">
                  Bloquear días
                </h2>
                <p className="mt-0.5 text-xs text-slate-400">
                  Dr. {doctorNombre}
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
                <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-black text-slate-700">
                  Fecha inicio <span className="text-red-400">*</span>
                </label>

                <div className="relative">
                  <CalendarDays
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="date"
                    value={form.fechaInicio}
                    min={hoy}
                    onChange={e => handleFechaChange('fechaInicio', e.target.value)}
                    className={`${inputClass} pl-11`}
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-black text-slate-700">
                  Fecha fin <span className="text-red-400">*</span>
                </label>

                <div className="relative">
                  <CalendarDays
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="date"
                    value={form.fechaFin}
                    min={form.fechaInicio || hoy}
                    onChange={e => handleFechaChange('fechaFin', e.target.value)}
                    className={`${inputClass} pl-11`}
                  />
                </div>
              </div>
            </div>

            {/* Preview días bloqueados */}
            {diasBloqueados > 0 && (
              <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3">
                <div className="flex items-start gap-3">
                  <Ban size={15} className="mt-0.5 flex-shrink-0 text-red-600" />

                  <p className="text-xs leading-5 text-red-700">
                    Se bloquearán{' '}
                    <strong>
                      {diasBloqueados} día{diasBloqueados !== 1 ? 's' : ''}
                    </strong>
                    . Los pacientes no podrán agendar citas en este período.
                  </p>
                </div>
              </div>
            )}

            {/* Advertencia citas afectadas */}
            <AnimatePresence>
              {citasAfectadas !== null && citasAfectadas > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="space-y-3 rounded-3xl border border-amber-200 bg-amber-50 p-4"
                >
                  <div className="flex items-start gap-3">
                    <AlertTriangle
                      size={16}
                      className="mt-0.5 flex-shrink-0 text-amber-600"
                    />

                    <p className="text-xs leading-5 text-amber-700">
                      Hay{' '}
                      <strong>
                        {citasAfectadas} cita{citasAfectadas !== 1 ? 's' : ''}
                      </strong>{' '}
                      confirmada{citasAfectadas !== 1 ? 's' : ''} o pendiente
                      {citasAfectadas !== 1 ? 's' : ''} en este período.
                    </p>
                  </div>

                  <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-amber-200 bg-white/60 px-3 py-3">
                    <div className="relative mt-0.5">
                      <input
                        type="checkbox"
                        checked={cancelarCitas}
                        onChange={e => setCancelarCitas(e.target.checked)}
                        className="sr-only"
                      />

                      <div
                        className={`flex h-5 w-5 items-center justify-center rounded-md border-2 transition-all ${
                          cancelarCitas
                            ? 'border-amber-500 bg-amber-500'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {cancelarCitas && (
                          <span className="text-[11px] font-black text-white">
                            ✓
                          </span>
                        )}
                      </div>
                    </div>

                    <span className="text-xs font-bold leading-5 text-amber-800">
                      Cancelar automáticamente las {citasAfectadas} cita
                      {citasAfectadas !== 1 ? 's' : ''} y notificar a los pacientes.
                    </span>
                  </label>

                  {!cancelarCitas && (
                    <p className="pl-8 text-xs leading-5 text-amber-600">
                      Si no las cancelas, deberás gestionarlas manualmente.
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="mb-2 block text-xs font-black text-slate-700">
                Motivo <span className="font-medium text-slate-400">(opcional)</span>
              </label>

              <div className="relative">
                <ClipboardList
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  value={form.motivo}
                  onChange={e => setForm(prev => ({ ...prev, motivo: e.target.value }))}
                  placeholder="Ej: Vacaciones, Congreso médico, Licencia..."
                  className={`${inputClass} pl-11`}
                />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs leading-5 text-slate-500">
                El bloqueo impedirá nuevas reservas dentro del rango seleccionado.
                Las citas existentes solo se cancelarán si marcas la opción correspondiente.
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
                disabled={loading}
                className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-red-500 px-4 text-sm font-black text-white shadow-lg shadow-red-500/20 transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Bloqueando...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Confirmar bloqueo
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