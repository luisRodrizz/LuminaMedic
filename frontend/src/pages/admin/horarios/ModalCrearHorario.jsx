import { useState } from 'react'
import {
  X,
  Clock,
  CalendarDays,
  Plus,
  Save,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../../../services/api'

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

export default function ModalCrearHorario({ doctorId, horariosExistentes, onClose, onSuccess }) {
  const [modo, setModo] = useState('semana') // 'semana' | 'individual'
  const diasOcupados = horariosExistentes.map(h => h.diaSemana)

  // Modo semana estándar — Lun-Vie editables
  const [semana, setSemana] = useState([
    { diaSemana: 0, horaInicio: '08:00', horaFin: '17:00', activo: !diasOcupados.includes(0) },
    { diaSemana: 1, horaInicio: '08:00', horaFin: '17:00', activo: !diasOcupados.includes(1) },
    { diaSemana: 2, horaInicio: '08:00', horaFin: '17:00', activo: !diasOcupados.includes(2) },
    { diaSemana: 3, horaInicio: '08:00', horaFin: '17:00', activo: !diasOcupados.includes(3) },
    { diaSemana: 4, horaInicio: '08:00', horaFin: '17:00', activo: !diasOcupados.includes(4) },
  ])

  // Modo individual
  const [form, setForm] = useState({ diaSemana: '', horaInicio: '08:00', horaFin: '17:00' })

  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const inputClass =
    'h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none transition focus:border-[#00CCA5] focus:bg-white focus:ring-4 focus:ring-[#00CCA5]/15'

  const toggleDia = (i) => {
    if (diasOcupados.includes(semana[i].diaSemana)) return
    setSemana(prev => prev.map((d, idx) => idx === i ? { ...d, activo: !d.activo } : d))
  }

  const updateSemana = (i, field, value) => {
    setSemana(prev => prev.map((d, idx) => idx === i ? { ...d, [field]: value } : d))
  }

  const handleSubmitSemana = async (e) => {
    e.preventDefault()
    setError('')
    const diasSeleccionados = semana.filter(d => d.activo)
    if (diasSeleccionados.length === 0) {
      return setError('Selecciona al menos un día')
    }
    for (const d of diasSeleccionados) {
      if (d.horaInicio >= d.horaFin) {
        return setError(`${DIAS[d.diaSemana]}: la hora de inicio debe ser menor a la hora de fin`)
      }
    }
    setSaving(true)
    try {
      await Promise.all(diasSeleccionados.map(d =>
        api.post('/horarios', {
          doctorId,
          diaSemana: d.diaSemana,
          horaInicio: d.horaInicio,
          horaFin: d.horaFin
        })
      ))
      onSuccess()
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Error al crear los horarios')
    } finally {
      setSaving(false)
    }
  }

  const handleSubmitIndividual = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      await api.post('/horarios', {
        doctorId,
        diaSemana: parseInt(form.diaSemana),
        horaInicio: form.horaInicio,
        horaFin: form.horaFin
      })
      onSuccess()
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Error al crear el horario')
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 16 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-[2rem] border border-white/70 bg-white shadow-2xl shadow-slate-950/20"
      >
        {/* Header */}
        <div className="relative flex-shrink-0 border-b border-slate-100 px-6 py-6">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#000089] via-[#00A98A] to-[#00CCA5]" />

          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#00CCA5]/10">
                <Clock size={21} className="text-[#008f78]" />
              </div>

              <div>
                <h2 className="text-lg font-black text-slate-950">
                  Agregar Horarios
                </h2>
                <p className="mt-0.5 text-xs text-slate-400">
                  Configura la disponibilidad semanal o un día específico de atención.
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

        {/* Tabs */}
        <div className="flex-shrink-0 border-b border-slate-100 px-6 py-4">
          <div className="grid grid-cols-1 gap-2 rounded-2xl bg-slate-100 p-1 sm:grid-cols-2">
            <button
              onClick={() => {
                setModo('semana')
                setError('')
              }}
              type="button"
              className={`flex h-11 items-center justify-center gap-2 rounded-xl text-sm font-black transition-all ${
                modo === 'semana'
                  ? 'bg-white text-[#000089] shadow-sm'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              <CalendarDays size={16} />
              Semana estándar
            </button>

            <button
              onClick={() => {
                setModo('individual')
                setError('')
              }}
              type="button"
              className={`flex h-11 items-center justify-center gap-2 rounded-xl text-sm font-black transition-all ${
                modo === 'individual'
                  ? 'bg-white text-[#000089] shadow-sm'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              <Plus size={16} />
              Día individual
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

          {/* Modo semana */}
          {modo === 'semana' && (
            <form onSubmit={handleSubmitSemana} className="space-y-4">
              <div className="rounded-2xl border border-[#00CCA5]/20 bg-[#00CCA5]/10 px-4 py-3">
                <div className="flex items-start gap-3">
                  <AlertCircle size={15} className="mt-0.5 flex-shrink-0 text-[#008f78]" />
                  <p className="text-xs leading-5 text-[#008f78]">
                    Selecciona los días y ajusta el horario de cada uno. Los días ya configurados aparecen bloqueados.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {semana.map((dia, i) => {
                  const ocupado = diasOcupados.includes(dia.diaSemana)

                  return (
                    <div
                      key={i}
                      className={`rounded-2xl border p-4 transition-all ${
                        ocupado
                          ? 'border-slate-200 bg-slate-50 opacity-60'
                          : dia.activo
                            ? 'border-[#00CCA5]/25 bg-[#00CCA5]/10'
                            : 'border-slate-200 bg-white'
                      }`}
                    >
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[150px_1fr] sm:items-center">
                        <button
                          type="button"
                          onClick={() => toggleDia(i)}
                          disabled={ocupado}
                          className="flex items-center gap-3 text-left disabled:cursor-not-allowed"
                        >
                          <span
                            className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg border-2 transition-all ${
                              dia.activo && !ocupado
                                ? 'border-[#00CCA5] bg-[#00CCA5]'
                                : 'border-slate-300 bg-white'
                            }`}
                          >
                            {dia.activo && !ocupado && (
                              <CheckCircle size={14} className="text-white" />
                            )}
                          </span>

                          <span>
                            <span
                              className={`block text-sm font-black ${
                                dia.activo && !ocupado ? 'text-slate-900' : 'text-slate-400'
                              }`}
                            >
                              {DIAS[dia.diaSemana]}
                            </span>

                            {ocupado && (
                              <span className="text-xs font-medium text-slate-400">
                                Ya configurado
                              </span>
                            )}
                          </span>
                        </button>

                        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                          <input
                            type="time"
                            value={dia.horaInicio}
                            onChange={e => updateSemana(i, 'horaInicio', e.target.value)}
                            disabled={!dia.activo || ocupado}
                            className={`${inputClass} disabled:cursor-not-allowed disabled:opacity-40`}
                          />

                          <span className="text-xs font-bold text-slate-400">—</span>

                          <input
                            type="time"
                            value={dia.horaFin}
                            onChange={e => updateSemana(i, 'horaFin', e.target.value)}
                            disabled={!dia.activo || ocupado}
                            className={`${inputClass} disabled:cursor-not-allowed disabled:opacity-40`}
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex h-11 flex-1 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={saving}
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
                      Guardar horarios
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Modo individual */}
          {modo === 'individual' && (
            <form onSubmit={handleSubmitIndividual} className="space-y-5">
              <div>
                <label className="mb-2 block text-xs font-black text-slate-700">
                  Día de la semana <span className="text-red-400">*</span>
                </label>

                <div className="relative">
                  <CalendarDays
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <select
                    value={form.diaSemana}
                    onChange={e => setForm({ ...form, diaSemana: e.target.value })}
                    required
                    className={`${inputClass} pl-11`}
                  >
                    <option value="">Seleccionar día</option>
                    {DIAS.map((dia, i) => (
                      <option key={i} value={i} disabled={diasOcupados.includes(i)}>
                        {dia} {diasOcupados.includes(i) ? '(ya configurado)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-black text-slate-700">
                    Hora inicio
                  </label>

                  <div className="relative">
                    <Clock
                      size={16}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="time"
                      value={form.horaInicio}
                      onChange={e => setForm({ ...form, horaInicio: e.target.value })}
                      required
                      className={`${inputClass} pl-11`}
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-black text-slate-700">
                    Hora fin
                  </label>

                  <div className="relative">
                    <Clock
                      size={16}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="time"
                      value={form.horaFin}
                      onChange={e => setForm({ ...form, horaFin: e.target.value })}
                      required
                      className={`${inputClass} pl-11`}
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-[#00CCA5]/20 bg-[#00CCA5]/10 px-4 py-3">
                <p className="text-xs leading-5 text-[#008f78]">
                  Esta opción agrega un solo día de atención. Los días ya configurados no estarán disponibles en la lista.
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
                  disabled={saving}
                  className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#000089] px-4 text-sm font-black text-white shadow-lg shadow-[#000089]/20 transition hover:bg-[#000070] hover:ring-4 hover:ring-[#00CCA5]/15 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Plus size={16} />
                      Agregar horario
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}