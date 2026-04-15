import { useState, useEffect } from 'react'
import { X, Calendar, Clock, AlertCircle, RefreshCw } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../../../services/api'

export default function ModalReprogramarCita({ cita, onClose, onSuccess }) {
  const [fecha, setFecha] = useState('')
  const [slots, setSlots] = useState([])
  const [slotSeleccionado, setSlotSeleccionado] = useState('')
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [sinHorario, setSinHorario] = useState(false)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const hoy = new Date().toISOString().split('T')[0]
  const inputClass = "w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-slate-50 transition-all"

  // Cargar slots cuando cambia la fecha
  useEffect(() => {
    if (!fecha) { setSlots([]); setSlotSeleccionado(''); setSinHorario(false); return }
    if (fecha < hoy) { setSlots([]); setSlotSeleccionado(''); return }

    const fetchSlots = async () => {
      setLoadingSlots(true)
      setSinHorario(false)
      setSlotSeleccionado('')
      try {
        const res = await api.get(`/horarios/slots?doctorId=${cita.doctorId}&fecha=${fecha}&duracion=${cita.servicio.duracion}`)
        if (res.data.slots.length === 0) {
          setSinHorario(true)
          setSlots([])
        } else {
          setSlots(res.data.slots)
        }
      } catch {
        setSinHorario(true)
        setSlots([])
      } finally {
        setLoadingSlots(false)
      }
    }
    fetchSlots()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fecha])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!slotSeleccionado) return setError('Selecciona un horario disponible')

    setSaving(true)
    try {
      const fechaCompleta = `${fecha}T${slotSeleccionado}:00`
      await api.patch(`/citas/${cita.id}/reprogramar`, { fecha: fechaCompleta })
      onSuccess()
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Error al reprogramar la cita')
    } finally {
      setSaving(false)
    }
  }

  const formatFechaActual = (fecha) => new Date(fecha).toLocaleString('es-PE', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
  })

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50 px-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-violet-50 rounded-xl flex items-center justify-center">
              <RefreshCw size={18} className="text-violet-600" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-800">Reprogramar Cita</h2>
              <p className="text-xs text-slate-400">Selecciona una nueva fecha y horario</p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">

          {/* Info cita actual */}
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 mb-5">
            <p className="text-xs font-semibold text-slate-500 mb-2">Cita actual</p>
            <p className="text-sm font-medium text-slate-800">
              Dr. {cita.doctor.usuario.nombre} {cita.doctor.usuario.apellido}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              {cita.servicio.nombre} · {formatFechaActual(cita.fecha)}
            </p>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0" />{error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Nueva fecha */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Nueva fecha <span className="text-red-400">*</span>
              </label>
              <input type="date" value={fecha} min={hoy}
                onChange={e => { setFecha(e.target.value); setSlotSeleccionado('') }}
                required className={inputClass} />
            </div>

            {/* Slots */}
            <AnimatePresence>
              {fecha && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                  <label className="block text-xs font-semibold text-slate-600 mb-2">
                    Horario disponible
                    <span className="ml-2 text-slate-400 font-normal">({cita.servicio.duracion} min por cita)</span>
                  </label>

                  {loadingSlots ? (
                    <div className="flex items-center gap-2 py-3">
                      <div className="w-4 h-4 border-2 border-violet-500 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                      <span className="text-sm text-slate-400">Cargando horarios...</span>
                    </div>
                  ) : sinHorario ? (
                    <div className="flex items-center gap-2 px-4 py-3 bg-amber-50 border border-amber-100 rounded-xl">
                      <AlertCircle size={14} className="text-amber-500 flex-shrink-0" />
                      <p className="text-xs text-amber-700">
                        Dr. {cita.doctor.usuario.nombre} no atiende este día. Elige otra fecha.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-4 gap-2">
                      {slots.map(slot => (
                        <button key={slot.hora} type="button"
                          disabled={slot.ocupado}
                          onClick={() => { if (!slot.ocupado) setSlotSeleccionado(slot.hora) }}
                          className={`flex items-center justify-center gap-1 py-2 rounded-xl text-xs font-medium transition-all border ${
                            slot.ocupado
                              ? 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed line-through'
                              : slotSeleccionado === slot.hora
                                ? 'bg-violet-600 text-white border-violet-600 shadow-sm'
                                : 'bg-white text-slate-600 border-slate-200 hover:border-violet-300 hover:bg-violet-50'
                          }`}>
                          <Clock size={10} />
                          {slot.hora}
                        </button>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex gap-3 pt-1">
              <button type="button" onClick={onClose}
                className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50 transition-all">
                Cancelar
              </button>
              <button type="submit" disabled={saving || !slotSeleccionado}
                className="flex-1 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-medium transition-all shadow-sm hover:shadow-md">
                {saving ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Reprogramando...
                  </span>
                ) : 'Confirmar nueva fecha'}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  )
}