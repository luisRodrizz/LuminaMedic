import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { X, Mail, Phone, Calendar, MapPin, AlertCircle, ClipboardList, Users } from 'lucide-react'
import { motion } from 'framer-motion'
import api from '../../../services/api'

const estadoColors = {
  PENDIENTE:  { bg: 'bg-yellow-50',  text: 'text-yellow-700'  },
  CONFIRMADA: { bg: 'bg-blue-50',    text: 'text-blue-700'    },
  COMPLETADA: { bg: 'bg-emerald-50', text: 'text-emerald-700' },
  CANCELADA:  { bg: 'bg-red-50',     text: 'text-red-700'     },
}

export default function ModalVerPaciente({ pacienteId, onClose }) {
  const [paciente, setPaciente] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPaciente = async () => {
      try {
        const res = await api.get(`/pacientes/${pacienteId}`)
        setPaciente(res.data)
      } catch {
        toast.error('Error al cargar el paciente')
      } finally {
        setLoading(false)
      }
    }
    fetchPaciente()
  }, [pacienteId])

  const formatFecha = (fecha) => fecha ? new Date(fecha).toLocaleDateString('es-PE') : '—'

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
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
            <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center">
              <Users size={18} className="text-indigo-600" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-800">Expediente del Paciente</h2>
              <p className="text-xs text-slate-400">Información completa</p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 overflow-y-auto flex-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-slate-400 text-sm">Cargando expediente...</p>
            </div>
          ) : !paciente ? (
            <div className="py-12 text-center text-slate-400">No se encontró el paciente</div>
          ) : (
            <>
              {/* Perfil */}
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl mb-5">
                {/* Avatar con foto o iniciales */}
                <div className="w-14 h-14 bg-indigo-100 rounded-2xl overflow-hidden flex items-center justify-center flex-shrink-0">
                  {paciente.foto ? (
                    <img
                      src={paciente.foto}
                      alt={`${paciente.usuario.nombre} ${paciente.usuario.apellido}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none'
                        e.target.parentNode.innerHTML = `<span class="text-indigo-600 text-lg font-bold">${paciente.usuario.nombre[0]}${paciente.usuario.apellido[0]}</span>`
                      }}
                    />
                  ) : (
                    <span className="text-indigo-600 text-lg font-bold">
                      {paciente.usuario.nombre[0]}{paciente.usuario.apellido[0]}
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">
                    {paciente.usuario.nombre} {paciente.usuario.apellido}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">{paciente.genero || 'Género no especificado'}</p>
                </div>
              </div>

              {/* Info */}
              <div className="space-y-2 mb-5">
                {[
                  { icon: Mail,     label: 'Correo',     value: paciente.usuario.email },
                  { icon: Phone,    label: 'Teléfono',   value: paciente.usuario.telefono || '—' },
                  { icon: Calendar, label: 'Nacimiento', value: formatFecha(paciente.fechaNac) },
                  { icon: MapPin,   label: 'Dirección',  value: paciente.direccion || '—' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                    <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <item.icon size={14} className="text-slate-500" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">{item.label}</p>
                      <p className="text-sm text-slate-700 font-medium">{item.value}</p>
                    </div>
                  </div>
                ))}

                {paciente.alergias && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-red-50 border border-red-100">
                    <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <AlertCircle size={14} className="text-red-500" />
                    </div>
                    <div>
                      <p className="text-xs text-red-400">Alergias</p>
                      <p className="text-sm text-red-700 font-medium">{paciente.alergias}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Historial */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <ClipboardList size={15} className="text-slate-400" />
                  <p className="text-sm font-semibold text-slate-700">
                    Historial de citas <span className="text-slate-400 font-normal">({paciente.citas?.length || 0})</span>
                  </p>
                </div>
                {paciente.citas?.length === 0 ? (
                  <p className="text-sm text-slate-400 px-1">Sin citas registradas</p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {paciente.citas?.map((cita) => {
                      const cfg = estadoColors[cita.estado]
                      return (
                        <div key={cita.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                          <div>
                            <p className="text-xs font-medium text-slate-700">{cita.servicio.nombre}</p>
                            <p className="text-xs text-slate-400 mt-0.5">
                              Dr. {cita.doctor.usuario.nombre} · {formatFecha(cita.fecha)}
                            </p>
                          </div>
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${cfg.bg} ${cfg.text}`}>
                            {cita.estado}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex-shrink-0">
          <button onClick={onClose}
            className="w-full px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50 transition-all">
            Cerrar
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}