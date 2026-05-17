import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { X, Mail, Phone, Calendar, MapPin, AlertCircle, ClipboardList, Users } from 'lucide-react'
import { motion } from 'framer-motion'
import api from '../../../services/api'

const estadoColors = {
  PENDIENTE: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    dot: 'bg-amber-400'
  },
  CONFIRMADA: {
    bg: 'bg-[#000089]/10',
    text: 'text-[#000089]',
    dot: 'bg-[#000089]'
  },
  COMPLETADA: {
    bg: 'bg-[#00CCA5]/10',
    text: 'text-[#008f78]',
    dot: 'bg-[#00CCA5]'
  },
  CANCELADA: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    dot: 'bg-red-500'
  },
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 py-6 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 14 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl"
      >
        <div className="h-1.5 w-full bg-gradient-to-r from-[#000089] via-[#0069C9] to-[#00CCA5]" />

        {/* Header */}
        <div className="flex flex-shrink-0 items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-[#00CCA5]/10">
              <Users size={19} className="text-[#008f78]" />
            </div>

            <div className="min-w-0">
              <h2 className="text-lg font-black tracking-tight text-slate-900">
                Expediente del Paciente
              </h2>

              <p className="mt-1 text-xs font-medium text-slate-400">
                Información clínica y datos de seguimiento.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            title="Cerrar modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16">
              <div className="h-9 w-9 animate-spin rounded-full border-2 border-[#00CCA5] border-t-transparent" />
              <p className="text-sm text-slate-400">Cargando expediente...</p>
            </div>
          ) : !paciente ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16">
              <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-slate-100">
                <Users size={22} className="text-slate-400" />
              </div>

              <div className="text-center">
                <p className="text-sm font-black text-slate-700">
                  No se encontró el paciente
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  La información solicitada no está disponible.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Perfil */}
              <div className="mb-5 flex items-center gap-4 rounded-3xl border border-slate-200/80 bg-gradient-to-br from-slate-50 to-white p-4">
                <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-3xl border border-[#00CCA5]/20 bg-[#00CCA5]/10">
                  {paciente.foto ? (
                    <img
                      src={paciente.foto}
                      alt={`${paciente.usuario.nombre} ${paciente.usuario.apellido}`}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none'
                        e.target.parentNode.innerHTML = `<span class="text-[#008f78] text-lg font-black">${paciente.usuario.nombre[0]}${paciente.usuario.apellido[0]}</span>`
                      }}
                    />
                  ) : (
                    <span className="text-lg font-black text-[#008f78]">
                      {paciente.usuario.nombre[0]}
                      {paciente.usuario.apellido[0]}
                    </span>
                  )}
                </div>

                <div className="min-w-0">
                  <h3 className="truncate text-lg font-black text-slate-900">
                    {paciente.usuario.nombre} {paciente.usuario.apellido}
                  </h3>

                  <p className="mt-1 text-xs font-bold text-slate-400">
                    {paciente.genero || 'Género no especificado'}
                  </p>

                  <div className="mt-3 inline-flex items-center gap-2 rounded-2xl bg-[#00CCA5]/10 px-3 py-1.5">
                    <span className="h-2 w-2 rounded-full bg-[#00CCA5]" />
                    <span className="text-xs font-black text-[#008f78]">
                      Paciente en seguimiento
                    </span>
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-2">
                {[
                  { icon: Mail, label: 'Correo', value: paciente.usuario.email },
                  { icon: Phone, label: 'Teléfono', value: paciente.usuario.telefono || '—' },
                  { icon: Calendar, label: 'Nacimiento', value: formatFecha(paciente.fechaNac) },
                  { icon: MapPin, label: 'Dirección', value: paciente.direccion || '—' },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 rounded-3xl border border-slate-200/80 bg-slate-50/60 p-4 transition hover:bg-white"
                  >
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm">
                      <item.icon size={16} className="text-slate-500" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-400">
                        {item.label}
                      </p>
                      <p className="mt-0.5 truncate text-sm font-black text-slate-800">
                        {item.value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Alergias */}
              {paciente.alergias && (
                <div className="mb-5 flex items-start gap-3 rounded-3xl border border-red-100 bg-red-50 p-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm">
                    <AlertCircle size={17} className="text-red-500" />
                  </div>

                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.12em] text-red-500">
                      Alergias
                    </p>
                    <p className="mt-1 text-sm font-medium leading-relaxed text-red-700">
                      {paciente.alergias}
                    </p>
                  </div>
                </div>
              )}

              {/* Historial */}
              <div className="border-t border-slate-100 pt-5">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#000089]/10">
                      <ClipboardList size={17} className="text-[#000089]" />
                    </div>

                    <div>
                      <p className="text-sm font-black text-slate-900">
                        Historial de citas
                      </p>
                      <p className="text-xs text-slate-400">
                        Registro de atenciones vinculadas al paciente.
                      </p>
                    </div>
                  </div>

                  <span className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-black text-slate-500">
                    {paciente.citas?.length || 0}
                  </span>
                </div>

                {paciente.citas?.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-slate-200 bg-slate-50/70 px-6 py-8">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm">
                      <ClipboardList size={20} className="text-slate-400" />
                    </div>

                    <div className="text-center">
                      <p className="text-sm font-black text-slate-700">
                        Sin citas registradas
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        Aún no existen atenciones asociadas a este paciente.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="max-h-56 space-y-3 overflow-y-auto pr-1">
                    {paciente.citas?.map((cita) => {
                      const cfg = estadoColors[cita.estado] || estadoColors.CONFIRMADA

                      return (
                        <div
                          key={cita.id}
                          className="flex items-center justify-between gap-4 rounded-3xl border border-slate-200/80 bg-white p-4 shadow-sm"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-black text-slate-800">
                              {cita.servicio.nombre}
                            </p>
                            <p className="mt-0.5 truncate text-xs text-slate-400">
                              Dr. {cita.doctor.usuario.nombre} · {formatFecha(cita.fecha)}
                            </p>
                          </div>

                          <span
                            className={`inline-flex flex-shrink-0 items-center gap-2 rounded-2xl px-3 py-1.5 text-xs font-black ${cfg.bg} ${cfg.text}`}
                          >
                            <span className={`h-2 w-2 rounded-full ${cfg.dot}`} />
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
        <div className="flex flex-shrink-0 justify-end border-t border-slate-100 px-6 py-4">
          <button
            onClick={onClose}
            className="flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-6 text-sm font-black text-slate-600 transition hover:bg-slate-50 hover:text-slate-800"
          >
            Cerrar
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}