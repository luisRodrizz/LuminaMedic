import { useState, useEffect } from 'react'
import { X, Calendar, Clock, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../../../services/api'
import { toast } from 'sonner'

export default function ModalAgendarCita({ onClose, onSuccess }) {
  const [doctores, setDoctores] = useState([])
  const [servicios, setServicios] = useState([])
  const [form, setForm] = useState({ motivo: '', doctorId: '', servicioId: '' })
  const [fecha, setFecha] = useState('')
  const [slots, setSlots] = useState([])
  const [slotSeleccionado, setSlotSeleccionado] = useState('')
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [sinHorario, setSinHorario] = useState(false)
  const [fechaPasada, setFechaPasada] = useState(false)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const now = new Date()
  const hoy = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`

  const inputClass = 'w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#00CCA5] focus:bg-white focus:ring-4 focus:ring-[#00CCA5]/15'

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [doctoresRes, serviciosRes] = await Promise.all([
          api.get('/doctores?page=1&limit=100'),
          api.get('/servicios')
        ])
        setDoctores(doctoresRes.data.data)
        setServicios(Array.isArray(serviciosRes.data) ? serviciosRes.data : serviciosRes.data.data)
      } catch {
        toast.error('Error al cargar los datos')
      }
    }
    fetchData()
  }, [])

  // Cargar slots cuando hay doctor, servicio y fecha
  useEffect(() => {
    if (!form.doctorId || !form.servicioId || !fecha) {
      setSlots([])
      setSlotSeleccionado('')
      setSinHorario(false)
      return
    }

    // No consultar si la fecha ya pasó
    if (fecha < hoy) {
      setSlots([])
      setSlotSeleccionado('')
      setSinHorario(false)
      return
    }

    const fetchSlots = async () => {
      setLoadingSlots(true)
      setSinHorario(false)
      setSlotSeleccionado('')

      try {
        const servicioActual = servicios.find(s => s.id === parseInt(form.servicioId))
        if (!servicioActual) return

        const res = await api.get(`/horarios/slots?doctorId=${form.doctorId}&fecha=${fecha}&duracion=${servicioActual.duracion}`)

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
  }, [form.doctorId, form.servicioId, fecha, servicios])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))

    // Solo resetear slot si cambia doctor o servicio
    if (name === 'doctorId' || name === 'servicioId') {
      setSlotSeleccionado('')
      setFecha('')
      setFechaPasada(false)
    }
  }

  const mostrarFecha = form.doctorId && form.servicioId
  const doctorSeleccionado = doctores.find(d => d.id === parseInt(form.doctorId))
  const servicioSeleccionado = servicios.find(s => s.id === parseInt(form.servicioId))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!slotSeleccionado) return setError('Selecciona un horario disponible')

    setSaving(true)

    try {
      const [year, month, day] = fecha.split('-').map(Number)
      const [hours, minutes] = slotSeleccionado.split(':').map(Number)

      const fechaLocal = new Date(year, month - 1, day, hours, minutes, 0)

      await api.post('/citas', {
        ...form,
        fecha: fechaLocal.toISOString()
      })

      onSuccess()
      onClose()
    } catch (err) {
      const data = err.response?.data
      if (data?.errors?.length > 0) {
        setError(data.errors[0].mensaje)
      } else {
        setError(data?.message || 'Error al agendar la cita. Verifica los datos.')
      }
    } finally {
      setSaving(false)
    }
  }

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
              <Calendar size={19} className="text-[#000089]" />
            </div>

            <div>
              <h2 className="text-base font-black text-slate-900">
                Agendar Cita
              </h2>
              <p className="text-xs font-medium text-slate-400">
                Selecciona doctor, servicio y horario disponible.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            type="button"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
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
            {/* Doctor */}
            <div>
              <label className="mb-1.5 block text-xs font-black uppercase tracking-[0.08em] text-slate-500">
                Doctor
              </label>

              <select
                name="doctorId"
                value={form.doctorId}
                onChange={handleChange}
                required
                className={inputClass}
              >
                <option value="">Seleccionar doctor</option>
                {doctores.filter(d => d.usuario.activo).map(doc => (
                  <option key={doc.id} value={doc.id}>
                    Dr. {doc.usuario.nombre} {doc.usuario.apellido} — {doc.especialidad}
                  </option>
                ))}
              </select>
            </div>

            {/* Servicio */}
            <div>
              <label className="mb-1.5 block text-xs font-black uppercase tracking-[0.08em] text-slate-500">
                Servicio
              </label>

              <select
                name="servicioId"
                value={form.servicioId}
                onChange={handleChange}
                required
                className={inputClass}
              >
                <option value="">Seleccionar servicio</option>
                {servicios.filter(s => s.activo).map(srv => (
                  <option key={srv.id} value={srv.id}>
                    {srv.nombre} — S/ {srv.precio} ({srv.duracion} min)
                  </option>
                ))}
              </select>
            </div>

            {/* Fecha */}
            <AnimatePresence>
              {mostrarFecha && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                >
                  <label className="mb-1.5 block text-xs font-black uppercase tracking-[0.08em] text-slate-500">
                    Fecha
                  </label>

                  <input
                    type="date"
                    value={fecha}
                    min={hoy}
                    onChange={e => {
                      const val = e.target.value
                      setFecha(val)
                      setSlotSeleccionado('')
                      setFechaPasada(val < hoy)
                    }}
                    required
                    className={inputClass}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Slots */}
            <AnimatePresence>
              {fecha && mostrarFecha && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                >
                  <label className="mb-2 block text-xs font-black uppercase tracking-[0.08em] text-slate-500">
                    Horario disponible
                    {servicioSeleccionado && (
                      <span className="ml-2 normal-case tracking-normal text-slate-400">
                        ({servicioSeleccionado.duracion} min por cita)
                      </span>
                    )}
                  </label>

                  {loadingSlots ? (
                    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <div className="h-5 w-5 flex-shrink-0 animate-spin rounded-full border-2 border-[#00CCA5] border-t-transparent" />
                      <span className="text-sm font-medium text-slate-400">
                        Cargando horarios disponibles...
                      </span>
                    </div>
                  ) : fechaPasada ? (
                    <div className="flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3">
                      <AlertCircle size={16} className="mt-0.5 flex-shrink-0 text-red-500" />
                      <p className="text-xs font-bold text-red-700">
                        La fecha seleccionada ya pasó. Elige una fecha válida.
                      </p>
                    </div>
                  ) : sinHorario ? (
                    <div className="flex items-start gap-3 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3">
                      <AlertCircle size={16} className="mt-0.5 flex-shrink-0 text-amber-500" />
                      <p className="text-xs font-bold text-amber-700">
                        {doctorSeleccionado
                          ? `Dr. ${doctorSeleccionado.usuario.nombre} ${doctorSeleccionado.usuario.apellido} no atiende este día`
                          : 'No hay horarios disponibles para este día'}
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

            {/* Motivo */}
            <div>
              <label className="mb-1.5 block text-xs font-black uppercase tracking-[0.08em] text-slate-500">
                Motivo <span className="font-medium normal-case tracking-normal text-slate-400">(opcional)</span>
              </label>

              <textarea
                name="motivo"
                value={form.motivo}
                onChange={handleChange}
                rows={3}
                placeholder="Describe el motivo de tu consulta..."
                className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#00CCA5] focus:bg-white focus:ring-4 focus:ring-[#00CCA5]/15"
              />
            </div>

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
                    Agendando...
                  </span>
                ) : 'Agendar Cita'}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  )
}