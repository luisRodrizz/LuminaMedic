import { useState } from 'react'
import { X, Clock, CalendarDays, Plus } from 'lucide-react'
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

  const inputClass = "w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-slate-50 transition-all"

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
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
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
            <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
              <Clock size={18} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-800">Agregar Horarios</h2>
              <p className="text-xs text-slate-400">Configura los días de atención</p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all">
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-6 pt-4 pb-2 flex-shrink-0">
          <button onClick={() => { setModo('semana'); setError('') }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              modo === 'semana' ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:bg-slate-50'
            }`}>
            <CalendarDays size={15} />
            Semana estándar
          </button>
          <button onClick={() => { setModo('individual'); setError('') }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              modo === 'individual' ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:bg-slate-50'
            }`}>
            <Plus size={15} />
            Día individual
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4 overflow-y-auto flex-1">
          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0" />{error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Modo semana ── */}
          {modo === 'semana' && (
            <form onSubmit={handleSubmitSemana} className="space-y-3">
              <p className="text-xs text-slate-400 mb-3">
                Selecciona los días y ajusta el horario de cada uno. Los días ya configurados están deshabilitados.
              </p>
              {semana.map((dia, i) => {
                const ocupado = diasOcupados.includes(dia.diaSemana)
                return (
                  <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                    ocupado ? 'bg-slate-50 border-slate-100 opacity-50' :
                    dia.activo ? 'bg-blue-50/50 border-blue-100' : 'bg-white border-slate-100'
                  }`}>
                    {/* Checkbox */}
                    <button type="button" onClick={() => toggleDia(i)} disabled={ocupado}
                      className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                        dia.activo && !ocupado ? 'bg-blue-500 border-blue-500' : 'border-slate-300'
                      }`}>
                      {dia.activo && !ocupado && (
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                          <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </button>

                    {/* Día */}
                    <span className={`text-sm font-medium w-24 flex-shrink-0 ${dia.activo && !ocupado ? 'text-slate-800' : 'text-slate-400'}`}>
                      {DIAS[dia.diaSemana]}
                      {ocupado && <span className="text-xs text-slate-400 ml-1">(configurado)</span>}
                    </span>

                    {/* Horas */}
                    <div className="flex items-center gap-2 flex-1">
                      <input type="time" value={dia.horaInicio}
                        onChange={e => updateSemana(i, 'horaInicio', e.target.value)}
                        disabled={!dia.activo || ocupado}
                        className="flex-1 px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all" />
                      <span className="text-xs text-slate-400">—</span>
                      <input type="time" value={dia.horaFin}
                        onChange={e => updateSemana(i, 'horaFin', e.target.value)}
                        disabled={!dia.activo || ocupado}
                        className="flex-1 px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all" />
                    </div>
                  </div>
                )
              })}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={onClose}
                  className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50 transition-all">
                  Cancelar
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-medium transition-all shadow-sm">
                  {saving ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Guardando...
                    </span>
                  ) : 'Guardar horarios'}
                </button>
              </div>
            </form>
          )}

          {/* ── Modo individual ── */}
          {modo === 'individual' && (
            <form onSubmit={handleSubmitIndividual} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Día de la semana <span className="text-red-400">*</span>
                </label>
                <select value={form.diaSemana}
                  onChange={e => setForm({ ...form, diaSemana: e.target.value })}
                  required className={inputClass}>
                  <option value="">Seleccionar día</option>
                  {DIAS.map((dia, i) => (
                    <option key={i} value={i} disabled={diasOcupados.includes(i)}>
                      {dia} {diasOcupados.includes(i) ? '(ya configurado)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Hora inicio</label>
                  <input type="time" value={form.horaInicio}
                    onChange={e => setForm({ ...form, horaInicio: e.target.value })}
                    required className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Hora fin</label>
                  <input type="time" value={form.horaFin}
                    onChange={e => setForm({ ...form, horaFin: e.target.value })}
                    required className={inputClass} />
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={onClose}
                  className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50 transition-all">
                  Cancelar
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-medium transition-all shadow-sm">
                  {saving ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Guardando...
                    </span>
                  ) : 'Agregar horario'}
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}