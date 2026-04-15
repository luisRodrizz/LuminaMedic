import { useState } from 'react'
import { X, Pencil, UserCheck } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../../../services/api'

export default function ModalEditarPaciente({ paciente, onClose, onSuccess }) {
  const [form, setForm] = useState({
    telefono:      paciente?.usuario.telefono || '',
    direccion:     paciente?.direccion || '',
    alergias:      paciente?.alergias || '',
    genero:        paciente?.genero || '',
    fechaNac:      paciente?.fechaNac ? new Date(paciente.fechaNac).toISOString().split('T')[0] : '',
    tutorNombre:   paciente?.tutorNombre || '',
    tutorDni:      paciente?.tutorDni || '',
    tutorTelefono: paciente?.tutorTelefono || '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const calcularEdad = (fechaNac) => {
    if (!fechaNac) return null
    const fecha = new Date(fechaNac)
    const hoy = new Date()
    return hoy.getFullYear() - fecha.getFullYear() -
      (hoy < new Date(hoy.getFullYear(), fecha.getMonth(), fecha.getDate()) ? 1 : 0)
  }
  const edad = calcularEdad(form.fechaNac)
  const esMenor = edad !== null && edad < 18

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (esMenor) {
      if (!form.tutorNombre.trim()) return setError('El nombre del tutor es requerido para menores de edad')
      if (!/^\d{8}$/.test(form.tutorDni)) return setError('El DNI del tutor debe tener 8 dígitos')
      if (!form.tutorTelefono.trim()) return setError('El teléfono del tutor es requerido')
    }
    try {
      setLoading(true)
      await api.put(`/pacientes/${paciente.id}`, { ...form, esMenor })
      onSuccess()
      onClose()
    } catch {
      setError('Error al actualizar el paciente.')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 bg-slate-50 transition-all"

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }} transition={{ duration: 0.2, ease: 'easeOut' }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center">
              <Pencil size={16} className="text-amber-600" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-800">Editar Paciente</h2>
              <p className="text-xs text-slate-400">{paciente?.usuario.nombre} {paciente?.usuario.apellido}</p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-3">

          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0" />{error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Fila 1 — Teléfono + Género */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Teléfono</label>
              <input name="telefono" value={form.telefono} onChange={handleChange}
                placeholder="+51 999 999 999" className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Género</label>
              <select name="genero" value={form.genero} onChange={handleChange} className={inputClass}>
                <option value="">Seleccionar</option>
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
          </div>

          {/* Fila 2 — Fecha nacimiento + Dirección */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Fecha de nacimiento
                {esMenor && (
                  <span className="ml-1.5 text-amber-500 font-normal">· Menor de edad</span>
                )}
              </label>
              <input name="fechaNac" type="date" value={form.fechaNac} onChange={handleChange}
                max={new Date().toISOString().split('T')[0]} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Dirección <span className="text-slate-400 font-normal">(opcional)</span>
              </label>
              <input name="direccion" value={form.direccion} onChange={handleChange}
                placeholder="Av. Principal 123" className={inputClass} />
            </div>
          </div>

          {/* Fila 3 — Alergias */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Alergias <span className="text-slate-400 font-normal">(opcional)</span>
            </label>
            <textarea name="alergias" value={form.alergias} onChange={handleChange} rows={2}
              placeholder="Ej: Penicilina, Polen..."
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 bg-slate-50 transition-all resize-none" />
          </div>

          {/* Sección tutor — solo si es menor */}
          <AnimatePresence>
            {esMenor && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                className="border border-amber-200 bg-amber-50 rounded-xl p-3.5 space-y-3">
                <div className="flex items-center gap-2">
                  <UserCheck size={14} className="text-amber-600 flex-shrink-0" />
                  <p className="text-xs font-semibold text-amber-700">Tutor / Padre responsable</p>
                </div>
                <input name="tutorNombre" value={form.tutorNombre} onChange={handleChange}
                  placeholder="Nombre completo del tutor" className={inputClass} />
                <div className="grid grid-cols-2 gap-3">
                  <input name="tutorDni" value={form.tutorDni} onChange={handleChange}
                    maxLength={8} placeholder="DNI del tutor" className={inputClass} />
                  <input name="tutorTelefono" value={form.tutorTelefono} onChange={handleChange}
                    placeholder="Teléfono del tutor" className={inputClass} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer */}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50 transition-all">
              Cancelar
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-medium transition-all shadow-sm hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed">
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}