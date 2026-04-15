import { useState, useEffect } from 'react'
import { X, Mail, Phone, Stethoscope, Calendar, Users, Building2, CreditCard, ShieldCheck, ShieldAlert, ShieldOff } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import api from '../../../services/api'

const estadoColors = {
  PENDIENTE:  { bg: 'bg-yellow-50',  text: 'text-yellow-700'  },
  CONFIRMADA: { bg: 'bg-blue-50',    text: 'text-blue-700'    },
  COMPLETADA: { bg: 'bg-emerald-50', text: 'text-emerald-700' },
  CANCELADA:  { bg: 'bg-red-50',     text: 'text-red-700'     },
}

const validacionBadge = {
  VALIDADO:  { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500', label: 'Validado RENIEC', Icon: ShieldCheck },
  PENDIENTE: { bg: 'bg-amber-50',   text: 'text-amber-700',   dot: 'bg-amber-400',   label: 'Pendiente',      Icon: ShieldAlert },
  NO_APLICA: { bg: 'bg-slate-100',  text: 'text-slate-500',   dot: 'bg-slate-400',   label: 'No aplica',      Icon: ShieldOff   },
}

const tipoLabel = { DNI: 'DNI', CE: 'Carné Ext.', PASAPORTE: 'Pasaporte' }

export default function ModalVerDoctor({ doctorId, onClose }) {
  const [doctor, setDoctor] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('info') // 'info' | 'citas'

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const res = await api.get(`/doctores/${doctorId}`)
        setDoctor(res.data)
      } catch {
        toast.error('Error al cargar el doctor')
      } finally {
        setLoading(false)
      }
    }
    fetchDoctor()
  }, [doctorId])

  const formatFecha = (fecha) => fecha ? new Date(fecha).toLocaleDateString('es-PE') : '—'

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
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
              <Stethoscope size={18} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-800">Perfil del Doctor</h2>
              <p className="text-xs text-slate-400">Información completa</p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all">
            <X size={18} />
          </button>
        </div>

        {/* Loading / Error */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-400 text-sm">Cargando información...</p>
          </div>
        ) : !doctor ? (
          <div className="py-16 text-center text-slate-400">No se encontró el doctor</div>
        ) : (
          <>
            {/* Avatar + nombre — siempre visible */}
            <div className="flex items-center gap-4 px-6 py-4 bg-slate-50 border-b border-slate-100">
              <div className="w-12 h-12 bg-blue-100 rounded-2xl overflow-hidden flex items-center justify-center flex-shrink-0">
                {doctor.foto ? (
                  <img src={doctor.foto} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-blue-600 text-base font-bold">
                    {doctor.usuario.nombre[0]}{doctor.usuario.apellido[0]}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-800 truncate">
                  Dr. {doctor.usuario.nombre} {doctor.usuario.apellido}
                </h3>
                <span className="inline-block mt-1 px-2.5 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-lg">
                  {doctor.especialidad}
                </span>
              </div>
              {doctor.usuario.activo ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-medium flex-shrink-0">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />Activo
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-50 text-red-700 rounded-lg text-xs font-medium flex-shrink-0">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />Inactivo
                </span>
              )}
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-100 px-6 flex-shrink-0">
              <button
                onClick={() => setTab('info')}
                className={`py-3 px-1 mr-6 text-sm font-medium border-b-2 transition-all ${
                  tab === 'info'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                Información
              </button>
              <button
                onClick={() => setTab('citas')}
                className={`py-3 px-1 text-sm font-medium border-b-2 transition-all flex items-center gap-1.5 ${
                  tab === 'citas'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                Citas
                <span className={`text-xs px-1.5 py-0.5 rounded-md font-medium ${
                  tab === 'citas' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-500'
                }`}>
                  {doctor.citas?.length || 0}
                </span>
              </button>
            </div>

            {/* Tab: Información */}
            {tab === 'info' && (() => {
              const vBadge = validacionBadge[doctor.validacionReniec] || validacionBadge.PENDIENTE
              const tipo = tipoLabel[doctor.tipoDocumento] || doctor.tipoDocumento
              return (
                <div className="px-6 py-4 space-y-2">
                  {/* Documento + validación */}
                  <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                    <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <CreditCard size={14} className="text-slate-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-slate-400">{tipo}</p>
                      <p className="text-sm text-slate-700 font-medium font-mono">{doctor.numeroDocumento || '—'}</p>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${vBadge.bg} ${vBadge.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${vBadge.dot}`} />
                      {vBadge.label}
                    </span>
                  </div>

                  {/* Campos en grilla 2 columnas */}
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { icon: Mail,      label: 'Correo',   value: doctor.usuario.email,                                          full: true  },
                      { icon: Phone,     label: 'Teléfono', value: doctor.usuario.telefono || '—',                                full: false },
                      { icon: Calendar,  label: 'Registro', value: new Date(doctor.usuario.createdAt).toLocaleDateString('es-PE'), full: false },
                      { icon: Building2, label: 'Clínica',  value: doctor.clinica?.nombre || '—',                                 full: true  },
                    ].map((item, i) => (
                      <div key={i} className={`flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors ${item.full ? 'col-span-2' : ''}`}>
                        <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <item.icon size={14} className="text-slate-500" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs text-slate-400">{item.label}</p>
                          <p className="text-sm text-slate-700 font-medium truncate">{item.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Descripción */}
                  {doctor.descripcion && (
                    <div className="p-4 bg-slate-50 rounded-2xl">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Descripción</p>
                      <p className="text-sm text-slate-600 leading-relaxed">{doctor.descripcion}</p>
                    </div>
                  )}
                </div>
              )
            })()}

            {/* Tab: Citas */}
            {tab === 'citas' && (
              <div className="px-6 py-4">
                {!doctor.citas?.length ? (
                  <div className="flex flex-col items-center justify-center py-10 gap-3">
                    <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center">
                      <Users size={20} className="text-slate-400" />
                    </div>
                    <p className="text-slate-500 font-medium text-sm">Sin citas registradas</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {doctor.citas.map((cita) => {
                      const cfg = estadoColors[cita.estado] || estadoColors.PENDIENTE
                      return (
                        <div key={cita.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                          <div className="min-w-0 flex-1 mr-3">
                            <p className="text-xs font-medium text-slate-700 truncate">{cita.servicio.nombre}</p>
                            <p className="text-xs text-slate-400 mt-0.5">
                              {cita.paciente?.usuario?.nombre} {cita.paciente?.usuario?.apellido} · {formatFecha(cita.fecha)}
                            </p>
                          </div>
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-medium flex-shrink-0 ${cfg.bg} ${cfg.text}`}>
                            {cita.estado}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
          </>
        )}

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