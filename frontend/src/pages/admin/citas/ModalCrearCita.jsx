import { useState, useEffect } from 'react'
import {
  X,
  Calendar,
  Clock,
  AlertCircle,
  UserRound,
  Stethoscope,
  Activity,
  FileText,
  Save
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../../../services/api'

export default function ModalCrearCita({ onClose, onSuccess }) {
  const [doctores, setDoctores] = useState([])
  const [pacientes, setPacientes] = useState([])
  const [servicios, setServicios] = useState([])
  const [form, setForm] = useState({ motivo: '', doctorId: '', pacienteId: '', servicioId: '' })
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

  const inputClass =
    'w-full h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-[#00CCA5] focus:bg-white focus:ring-4 focus:ring-[#00CCA5]/15'

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [doctoresRes, pacientesRes, serviciosRes] = await Promise.all([
          api.get('/doctores?page=1&limit=100'),
          api.get('/pacientes?page=1&limit=100'),
          api.get('/servicios')
        ])
        setDoctores(doctoresRes.data.data)
        setPacientes(pacientesRes.data.data)
        setServicios(Array.isArray(serviciosRes.data) ? serviciosRes.data : serviciosRes.data.data)
      } catch {
        console.error('Error cargando datos')
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    if (!form.doctorId || !form.servicioId || !fecha) {
      setSlots([])
      setSlotSeleccionado('')
      setSinHorario(false)
      return
    }

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

    if (name === 'doctorId' || name === 'servicioId') {
      setSlotSeleccionado('')
      setFecha('')
      setFechaPasada(false)
    }
  }

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
      setError(err.response?.data?.message || 'Error al crear la cita. Verifica los datos.')
    } finally {
      setSaving(false)
    }
  }

  const doctorSeleccionado = doctores.find(d => d.id === parseInt(form.doctorId))
  const servicioSeleccionado = servicios.find(s => s.id === parseInt(form.servicioId))
  const mostrarFecha = form.doctorId && form.servicioId

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
        className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-[2rem] border border-white/70 bg-white shadow-2xl shadow-slate-950/20"
      >
        {/* Header */}
        <div className="relative flex-shrink-0 border-b border-slate-100 px-6 py-6">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#000089] via-[#00A98A] to-[#00CCA5]" />

          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#00CCA5]/10">
                <Calendar size={21} className="text-[#008f78]" />
              </div>

              <div>
                <h2 className="text-lg font-black text-slate-950">
                  Nueva Cita
                </h2>
                <p className="mt-0.5 text-xs text-slate-400">
                  Agenda una atención médica seleccionando paciente, doctor, servicio y horario.
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
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mb-5 flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600"
              >
                <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-red-500" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Paciente */}
            <div>
              <label className="mb-2 block text-xs font-black text-slate-700">
                Paciente
              </label>

              <div className="relative">
                <UserRound
                  size={17}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <select
                  name="pacienteId"
                  value={form.pacienteId}
                  onChange={handleChange}
                  required
                  className={`${inputClass} pl-11`}
                >
                  <option value="">Seleccionar paciente</option>
                  {pacientes.map(pac => (
                    <option key={pac.id} value={pac.id}>
                      {pac.usuario.nombre} {pac.usuario.apellido}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Doctor */}
            <div>
              <label className="mb-2 block text-xs font-black text-slate-700">
                Doctor
              </label>

              <div className="relative">
                <Stethoscope
                  size={17}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <select
                  name="doctorId"
                  value={form.doctorId}
                  onChange={handleChange}
                  required
                  className={`${inputClass} pl-11`}
                >
                  <option value="">Seleccionar doctor</option>
                  {doctores.filter(d => d.usuario.activo).map(doc => (
                    <option key={doc.id} value={doc.id}>
                      Dr. {doc.usuario.nombre} {doc.usuario.apellido} — {doc.especialidad}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Servicio */}
            <div>
              <label className="mb-2 block text-xs font-black text-slate-700">
                Servicio
              </label>

              <div className="relative">
                <Activity
                  size={17}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <select
                  name="servicioId"
                  value={form.servicioId}
                  onChange={handleChange}
                  required
                  className={`${inputClass} pl-11`}
                >
                  <option value="">Seleccionar servicio</option>
                  {servicios.filter(s => s.activo).map(srv => (
                    <option key={srv.id} value={srv.id}>
                      {srv.nombre} — S/ {srv.precio} ({srv.duracion} min)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Fecha */}
            <AnimatePresence>
              {mostrarFecha && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                >
                  <label className="mb-2 block text-xs font-black text-slate-700">
                    Fecha
                  </label>

                  <div className="relative">
                    <Calendar
                      size={17}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

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
                      className={`${inputClass} pl-11`}
                    />
                  </div>
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
                  <label className="mb-2 block text-xs font-black text-slate-700">
                    Horario disponible
                    {servicioSeleccionado && (
                      <span className="ml-2 font-medium text-slate-400">
                        ({servicioSeleccionado.duracion} min por cita)
                      </span>
                    )}
                  </label>

                  {loadingSlots ? (
                    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <div className="h-4 w-4 flex-shrink-0 animate-spin rounded-full border-2 border-[#00CCA5] border-t-transparent" />
                      <span className="text-sm text-slate-400">
                        Cargando horarios disponibles...
                      </span>
                    </div>
                  ) : fechaPasada ? (
                    <div className="flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3">
                      <AlertCircle size={15} className="mt-0.5 flex-shrink-0 text-red-500" />
                      <p className="text-xs leading-5 text-red-700">
                        La fecha seleccionada ya pasó. Elige una fecha válida.
                      </p>
                    </div>
                  ) : sinHorario ? (
                    <div className="flex items-start gap-3 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3">
                      <AlertCircle size={15} className="mt-0.5 flex-shrink-0 text-amber-500" />
                      <p className="text-xs leading-5 text-amber-700">
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
                          className={`flex items-center justify-center gap-1.5 rounded-xl border px-2 py-2.5 text-xs font-black transition-all ${
                            slot.ocupado
                              ? 'cursor-not-allowed border-slate-100 bg-slate-50 text-slate-300'
                              : slotSeleccionado === slot.hora
                                ? 'border-[#000089] bg-[#000089] text-white shadow-lg shadow-[#000089]/15'
                                : 'border-slate-200 bg-white text-slate-600 hover:border-[#00CCA5]/40 hover:bg-[#00CCA5]/10 hover:text-[#008f78]'
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
              <label className="mb-2 block text-xs font-black text-slate-700">
                Motivo <span className="font-medium text-slate-400">(opcional)</span>
              </label>

              <div className="relative">
                <FileText
                  size={17}
                  className="absolute left-4 top-4 text-slate-400"
                />

                <textarea
                  name="motivo"
                  value={form.motivo}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Motivo de la consulta..."
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pl-11 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-[#00CCA5] focus:bg-white focus:ring-4 focus:ring-[#00CCA5]/15"
                />
              </div>
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
                disabled={saving || !slotSeleccionado}
                className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#000089] px-4 text-sm font-black text-white shadow-lg shadow-[#000089]/20 transition hover:bg-[#000070] hover:ring-4 hover:ring-[#00CCA5]/15 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Guardar Cita
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