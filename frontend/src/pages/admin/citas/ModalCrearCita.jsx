import { useState, useEffect } from 'react'
import { X, Calendar, Clock, AlertCircle } from 'lucide-react'
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

  const hoy = new Date().toISOString().split('T')[0]

  const inputClass = "w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-slate-50 transition-all"

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

  // Fecha mínima = hoy
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!slotSeleccionado) return setError('Selecciona un horario disponible')
    setSaving(true)
    try {
      const fechaCompleta = `${fecha}T${slotSeleccionado}:00`
      await api.post('/citas', { ...form, fecha: fechaCompleta })
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
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50 px-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-cyan-50 rounded-xl flex items-center justify-center">
              <Calendar size={18} className="text-cyan-600" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-800">Nueva Cita</h2>
              <p className="text-xs text-slate-400">Completa la información de la cita</p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 overflow-y-auto flex-1">
          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl mb-5">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0" />{error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Paciente */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Paciente</label>
              <select name="pacienteId" value={form.pacienteId} onChange={handleChange} required className={inputClass}>
                <option value="">Seleccionar paciente</option>
                {pacientes.map(pac => (
                  <option key={pac.id} value={pac.id}>
                    {pac.usuario.nombre} {pac.usuario.apellido}
                  </option>
                ))}
              </select>
            </div>

            {/* Doctor */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Doctor</label>
              <select name="doctorId" value={form.doctorId} onChange={handleChange} required className={inputClass}>
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
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Servicio</label>
              <select name="servicioId" value={form.servicioId} onChange={handleChange} required className={inputClass}>
                <option value="">Seleccionar servicio</option>
                {servicios.filter(s => s.activo).map(srv => (
                  <option key={srv.id} value={srv.id}>
                    {srv.nombre} — S/ {srv.precio} ({srv.duracion} min)
                  </option>
                ))}
              </select>
            </div>

            {/* Fecha — solo aparece cuando hay doctor y servicio */}
            <AnimatePresence>
              {mostrarFecha && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Fecha</label>
                  <input type="date" value={fecha} min={hoy}
                    onChange={e => {
                    const val = e.target.value
                    setFecha(val)
                    setSlotSeleccionado('')
                    setFechaPasada(val < hoy)
                  }}
                    required className={inputClass} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Slots */}
            <AnimatePresence>
              {fecha && mostrarFecha && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                  <label className="block text-xs font-semibold text-slate-600 mb-2">
                    Horario disponible
                    {servicioSeleccionado && (
                      <span className="ml-2 text-slate-400 font-normal">({servicioSeleccionado.duracion} min por cita)</span>
                    )}
                  </label>

                  {loadingSlots ? (
                    <div className="flex items-center gap-2 py-3">
                      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                      <span className="text-sm text-slate-400">Cargando horarios disponibles...</span>
                    </div>
                  ) : fechaPasada ? (
                    <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-100 rounded-xl">
                      <AlertCircle size={14} className="text-red-500 flex-shrink-0" />
                      <p className="text-xs text-red-700">La fecha seleccionada ya pasó. Elige una fecha válida.</p>
                    </div>
                  ) : sinHorario ? (
                    <div className="flex items-center gap-2 px-4 py-3 bg-amber-50 border border-amber-100 rounded-xl">
                      <AlertCircle size={14} className="text-amber-500 flex-shrink-0" />
                      <p className="text-xs text-amber-700">
                        {doctorSeleccionado
                          ? `Dr. ${doctorSeleccionado.usuario.nombre} ${doctorSeleccionado.usuario.apellido} no atiende este día`
                          : 'No hay horarios disponibles para este día'}
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
                              ? 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed'
                              : slotSeleccionado === slot.hora
                                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:bg-blue-50'
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

            {/* Motivo */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Motivo <span className="text-slate-400 font-normal">(opcional)</span>
              </label>
              <textarea name="motivo" value={form.motivo} onChange={handleChange} rows={2}
                placeholder="Motivo de la consulta..."
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-slate-50 transition-all resize-none" />
            </div>

            <div className="flex gap-3 pt-1">
              <button type="button" onClick={onClose}
                className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50 transition-all">
                Cancelar
              </button>
              <button type="submit" disabled={saving || !slotSeleccionado}
                className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-medium transition-all shadow-sm hover:shadow-md">
                {saving ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Guardando...
                  </span>
                ) : 'Guardar Cita'}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  )
}