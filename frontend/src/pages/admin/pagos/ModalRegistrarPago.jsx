import { useState, useEffect } from 'react'
import {
  X,
  DollarSign,
  Banknote,
  CreditCard,
  TrendingUp,
  CalendarCheck,
  Save
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../../../services/api'

const metodos = [
  {
    value: 'efectivo',
    label: 'Efectivo',
    icon: Banknote,
    bg: 'bg-[#00CCA5]/10',
    text: 'text-[#008f78]',
    border: 'border-[#00CCA5]/35'
  },
  {
    value: 'tarjeta',
    label: 'Tarjeta',
    icon: CreditCard,
    bg: 'bg-[#000089]/10',
    text: 'text-[#000089]',
    border: 'border-[#000089]/30'
  },
  {
    value: 'transferencia',
    label: 'Transferencia',
    icon: TrendingUp,
    bg: 'bg-sky-50',
    text: 'text-sky-700',
    border: 'border-sky-300'
  }
]

export default function ModalRegistrarPago({ onClose, onSuccess }) {
  const [citas, setCitas] = useState([])
  const [form, setForm] = useState({
    citaId: '',
    monto: '',
    metodo: 'efectivo'
  })
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchCitas = async () => {
      try {
        const res = await api.get('/citas?page=1&limit=100&estado=CONFIRMADA')
        setCitas(res.data.data)
      } catch {
        console.error('Error cargando citas')
      }
    }

    fetchCitas()
  }, [])

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value })

  const handleCitaChange = (e) => {
    const citaId = e.target.value
    const cita = citas.find((c) => c.id === parseInt(citaId))

    setForm({
      ...form,
      citaId,
      monto: cita ? cita.servicio.precio : ''
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    try {
      await api.post('/pagos', form)
      onSuccess()
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Error al registrar el pago.')
    }
  }

  const inputClass =
    'w-full h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-[#00CCA5] focus:bg-white focus:ring-4 focus:ring-[#00CCA5]/15'

  const citaSeleccionada = citas.find((c) => c.id === parseInt(form.citaId))

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
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#000089] via-[#00A98A] to-[#00CCA5]" />

          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#00CCA5]/10">
                <DollarSign size={21} className="text-[#008f78]" />
              </div>

              <div>
                <h2 className="text-lg font-black text-slate-950">
                  Registrar Pago
                </h2>
                <p className="mt-0.5 text-xs text-slate-400">
                  Registra el pago de una cita confirmada.
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
                <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-red-500" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-xs font-black text-slate-700">
                Cita confirmada
              </label>

              <div className="relative">
                <CalendarCheck
                  size={17}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <select
                  name="citaId"
                  value={form.citaId}
                  onChange={handleCitaChange}
                  required
                  className={`${inputClass} pl-11`}
                >
                  <option value="">Seleccionar cita</option>
                  {citas.map((cita) => (
                    <option key={cita.id} value={cita.id}>
                      {cita.paciente.usuario.nombre}{' '}
                      {cita.paciente.usuario.apellido} —{' '}
                      {cita.servicio.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {citaSeleccionada && (
              <div className="rounded-2xl border border-[#00CCA5]/20 bg-[#00CCA5]/10 px-4 py-3">
                <p className="text-xs font-bold text-[#008f78]">
                  Cita seleccionada
                </p>
                <p className="mt-1 text-xs leading-5 text-[#008f78]">
                  {citaSeleccionada.paciente.usuario.nombre}{' '}
                  {citaSeleccionada.paciente.usuario.apellido} ·{' '}
                  {citaSeleccionada.servicio.nombre} · S/{' '}
                  {Number(citaSeleccionada.servicio.precio || 0).toFixed(2)}
                </p>
              </div>
            )}

            <div>
              <label className="mb-2 block text-xs font-black text-slate-700">
                Monto (S/)
              </label>

              <div className="relative">
                <DollarSign
                  size={17}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  name="monto"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.monto}
                  onChange={handleChange}
                  required
                  placeholder="0.00"
                  className={`${inputClass} pl-11`}
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-black text-slate-700">
                Método de pago
              </label>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                {metodos.map((m) => {
                  const Icon = m.icon
                  const isSelected = form.metodo === m.value

                  return (
                    <button
                      key={m.value}
                      type="button"
                      onClick={() => setForm({ ...form, metodo: m.value })}
                      className={`flex items-center justify-center gap-2 rounded-2xl border px-3 py-3 text-xs font-black transition-all sm:flex-col sm:gap-1.5 ${
                        isSelected
                          ? `${m.bg} ${m.text} ${m.border} shadow-sm`
                          : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800'
                      }`}
                    >
                      <Icon
                        size={17}
                        className={isSelected ? m.text : 'text-slate-400'}
                      />
                      {m.label}
                    </button>
                  )
                })}
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
                className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#000089] px-4 text-sm font-black text-white shadow-lg shadow-[#000089]/20 transition hover:bg-[#000070] hover:ring-4 hover:ring-[#00CCA5]/15"
              >
                <Save size={16} />
                Registrar Pago
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  )
}