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

  const now = new Date()
  const hoy = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`

  const inputClass = 'w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#00CCA5] focus:bg-white focus:ring-4 focus:ring-[#00CCA5]/15'

  // Cargar slots cuando cambia la fecha
  useEffect(() => {
    if (!fecha) {
      setSlots([])
      setSlotSeleccionado('')
      setSinHorario(false)
      return
    }

    if (fecha < hoy) {
      setSlots([])
      setSlotSeleccionado('')
      return
    }

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
      const [year, month, day] = fecha.split('-').map(Number)
      const [hours, minutes] = slotSeleccionado.split(':').map(Number)

      const fechaLocal = new Date(year, month - 1, day, hours, minutes, 0)

      await api.patch(`/citas/${cita.id}/reprogramar`, {
        fecha: fechaLocal.toISOString()
      })

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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 18 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 18 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl"
      >
        <div className="h-1.5 w-full flex-shrink-0 bg-gradient-to-r from-[#000089] via-[#0069C9] to-[#00CCA5]" />

        {/* Header */}
        <div className="flex flex-shrink-0 items-center justify-between border-b border-slate-100 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-[#000089]/10">
              <RefreshCw size={19} className="text-[#000089]" />
            </div>

            <div>
              <h2 className="text-base font-black text-slate-900">
                Reprogramar Cita
              </h2>
              <p className="text-xs font-medium text-slate-400">
                Selecciona una nueva fecha y horario disponible.
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

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {/* Info cita actual */}
          <div className="mb-5 rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#00CCA5]/10">
                <Calendar size={15} className="text-[#008f78]" />
              </div>

              <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-400">
                Cita actual
              </p>
            </div>

            <p className="text-sm font-black text-slate-800">
              Dr. {cita.doctor.usuario.nombre} {cita.doctor.usuario.apellido}
            </p>

            <p className="mt-1 text-xs font-medium text-slate-400">
              {cita.servicio.nombre} · {formatFechaActual(cita.fecha)}
            </p>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mb-5 flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
              >
                <AlertCircle size={16} className="mt-0.5 flex-shrink-0 text-red-500" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nueva fecha */}
            <div>
              <label className="mb-1.5 block text-xs font-black uppercase tracking-[0.08em] text-slate-500">
                Nueva fecha <span className="text-red-400">*</span>
              </label>

              <input
                type="date"
                value={fecha}
                min={hoy}
                onChange={e => {
                  setFecha(e.target.value)
                  setSlotSeleccionado('')
                }}
                required
                className={inputClass}
              />
            </div>

            {/* Slots */}
            <AnimatePresence>
              {fecha && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                >
                  <label className="mb-2 block text-xs font-black uppercase tracking-[0.08em] text-slate-500">
                    Horario disponible
                    <span className="ml-2 normal-case tracking-normal text-slate-400">
                      ({cita.servicio.duracion} min por cita)
                    </span>
                  </label>

                  {loadingSlots ? (
                    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <div className="h-5 w-5 flex-shrink-0 animate-spin rounded-full border-2 border-[#00CCA5] border-t-transparent" />
                      <span className="text-sm font-medium text-slate-400">
                        Cargando horarios disponibles...
                      </span>
                    </div>
                  ) : sinHorario ? (
                    <div className="flex items-start gap-3 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3">
                      <AlertCircle size={16} className="mt-0.5 flex-shrink-0 text-amber-500" />
                      <p className="text-xs font-bold text-amber-700">
                        Dr. {cita.doctor.usuario.nombre} no atiende este día. Elige otra fecha.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                      {slots.map(slot => (
                        <button
                          key={slot.hora}
                          type="button"
                          disabled={slot.ocupado}
                          onClick={() => {
                            if (!slot.ocupado) setSlotSeleccionado(slot.hora)
                          }}
                          className={`flex items-center justify-center gap-1.5 rounded-2xl border px-2 py-2.5 text-xs font-black transition-all ${
                            slot.ocupado
                              ? 'cursor-not-allowed border-slate-100 bg-slate-50 text-slate-300 line-through'
                              : slotSeleccionado === slot.hora
                                ? 'border-[#000089] bg-[#000089] text-white shadow-lg shadow-[#000089]/20'
                                : 'border-slate-200 bg-white text-slate-600 hover:border-[#00CCA5]/50 hover:bg-[#00CCA5]/10 hover:text-[#008f78]'
                          }`}
                        >
                          <Clock size={11} />
                          {slot.hora}
                        </button>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row">
              <button
                type="button"
                onClick={onClose}
                className="flex h-11 flex-1 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={saving || !slotSeleccionado}
                className="flex h-11 flex-1 items-center justify-center rounded-xl bg-[#000089] px-4 text-sm font-black text-white shadow-lg shadow-[#000089]/20 transition hover:bg-[#000070] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
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