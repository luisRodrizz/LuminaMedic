import { useState } from 'react'
import { X, Pencil, CreditCard, ShieldCheck, ShieldAlert, ShieldOff } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../../../services/api'

const validacionBadge = {
  VALIDADO:  { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500', label: 'Validado RENIEC',   Icon: ShieldCheck },
  PENDIENTE: { bg: 'bg-amber-50',   text: 'text-amber-700',   dot: 'bg-amber-400',   label: 'Pendiente',         Icon: ShieldAlert },
  NO_APLICA: { bg: 'bg-slate-100',  text: 'text-slate-500',   dot: 'bg-slate-400',   label: 'No aplica',         Icon: ShieldOff   },
}

export default function ModalEditarDoctor({ doctor, onClose, onSuccess }) {
  const [form, setForm] = useState({
    telefono:     doctor?.usuario.telefono || '',
    especialidad: doctor?.especialidad || '',
    descripcion:  doctor?.descripcion || ''
  })
  const [error, setError] = useState('')

  const inputClass = "w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-slate-50 transition-all"

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await api.put(`/doctores/${doctor.id}`, form)
      onSuccess()
      onClose()
    } catch {
      setError('Error al actualizar el doctor.')
    }
  }

  const vBadge = validacionBadge[doctor?.validacionReniec] || validacionBadge.PENDIENTE
  const tipoLabel = { DNI: 'DNI', CE: 'Carné Ext.', PASAPORTE: 'Pasaporte' }[doctor?.tipoDocumento] || doctor?.tipoDocumento

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
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center">
              <Pencil size={16} className="text-amber-600" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-800">Editar Doctor</h2>
              <p className="text-xs text-slate-400">Dr. {doctor?.usuario.nombre} {doctor?.usuario.apellido}</p>
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
                className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl mb-5">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0" />{error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Datos oficiales — solo lectura */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-xs text-slate-400 mb-2.5 flex items-center gap-1.5">
                <CreditCard size={12} />
                Datos de identidad — no editables
              </p>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <p className="text-xs text-slate-400 mb-1">{tipoLabel}</p>
                  <p className="text-sm font-semibold text-slate-700 font-mono">
                    {doctor?.numeroDocumento || '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Nombre</p>
                  <p className="text-sm font-medium text-slate-700">{doctor?.usuario.nombre}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Apellido</p>
                  <p className="text-sm font-medium text-slate-700">{doctor?.usuario.apellido}</p>
                </div>
              </div>
              {/* Badge validación */}
              <div className="mt-2.5 pt-2.5 border-t border-slate-200">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${vBadge.bg} ${vBadge.text}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${vBadge.dot}`} />
                  {vBadge.label}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Teléfono</label>
                <input name="telefono" value={form.telefono} onChange={handleChange}
                  placeholder="+51 999 999 999" className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Especialidad</label>
                <input name="especialidad" value={form.especialidad} onChange={handleChange} required
                  className={inputClass} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Descripción <span className="text-slate-400 font-normal">(opcional)</span>
              </label>
              <textarea name="descripcion" value={form.descripcion} onChange={handleChange} rows={2}
                placeholder="Breve descripción del médico..."
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-slate-50 transition-all resize-none" />
            </div>

            <div className="flex gap-3 pt-1">
              <button type="button" onClick={onClose}
                className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50 transition-all">
                Cancelar
              </button>
              <button type="submit"
                className="flex-1 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-medium transition-all shadow-sm hover:shadow-md">
                Guardar Cambios
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  )
}