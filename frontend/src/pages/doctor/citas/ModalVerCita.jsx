import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { X, Calendar, User, Clock, FileText, DollarSign } from 'lucide-react'
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

export default function ModalVerCita({ citaId, onClose }) {
  const [cita, setCita] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCita = async () => {
      try {
        const res = await api.get(`/citas/${citaId}`)
        setCita(res.data)
      } catch {
        toast.error('Error al cargar la cita')
      } finally {
        setLoading(false)
      }
    }

    fetchCita()
  }, [citaId])

  const formatFecha = (fecha) => new Date(fecha).toLocaleString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

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
            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-[#000089]/10">
              <Calendar size={19} className="text-[#000089]" />
            </div>

            <div className="min-w-0">
              <h2 className="text-lg font-black tracking-tight text-slate-900">
                Detalle de Cita
              </h2>
              <p className="mt-1 text-xs font-medium text-slate-400">
                Información completa de la atención médica.
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
              <p className="text-sm text-slate-400">Cargando cita...</p>
            </div>
          ) : !cita ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16">
              <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-slate-100">
                <Calendar size={22} className="text-slate-400" />
              </div>

              <div className="text-center">
                <p className="text-sm font-black text-slate-700">
                  No se encontró la cita
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  La información solicitada no está disponible.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Estado y ID */}
              <div className="mb-5 flex items-center justify-between gap-3">
                {(() => {
                  const cfg = estadoColors[cita.estado] || estadoColors.CONFIRMADA

                  return (
                    <span
                      className={`inline-flex items-center gap-2 rounded-2xl px-3 py-1.5 text-xs font-black ${cfg.bg} ${cfg.text}`}
                    >
                      <span className={`h-2 w-2 rounded-full ${cfg.dot}`} />
                      {cita.estado}
                    </span>
                  )
                })()}

                <span className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-black text-slate-500">
                  Cita #{cita.id}
                </span>
              </div>

              {/* Info */}
              <div className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-2">
                {[
                  {
                    icon: Calendar,
                    label: 'Fecha y hora',
                    value: formatFecha(cita.fecha)
                  },
                  {
                    icon: User,
                    label: 'Paciente',
                    value: `${cita.paciente.usuario.nombre} ${cita.paciente.usuario.apellido}`
                  },
                  {
                    icon: Clock,
                    label: 'Servicio',
                    value: `${cita.servicio.nombre} (${cita.servicio.duracion} min)`
                  },
                  {
                    icon: DollarSign,
                    label: 'Precio',
                    value: `S/ ${cita.servicio.precio}`
                  },
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

              {/* Motivo */}
              {cita.motivo && (
                <div className="mb-5 rounded-3xl border border-slate-200/80 bg-slate-50/70 p-4">
                  <p className="mb-2 text-xs font-black uppercase tracking-[0.12em] text-slate-500">
                    Motivo
                  </p>
                  <p className="text-sm leading-relaxed text-slate-600">
                    {cita.motivo}
                  </p>
                </div>
              )}

              {/* Nota clínica */}
              {cita.nota ? (
                <div className="border-t border-slate-100 pt-5">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#00CCA5]/10">
                      <FileText size={17} className="text-[#008f78]" />
                    </div>

                    <div>
                      <p className="text-sm font-black text-slate-900">
                        Nota Clínica
                      </p>
                      <p className="text-xs text-slate-400">
                        Registro médico asociado a la cita.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {[
                      { label: 'Diagnóstico', value: cita.nota.diagnostico },
                      { label: 'Tratamiento', value: cita.nota.tratamiento },
                      { label: 'Receta', value: cita.nota.receta },
                      { label: 'Observaciones', value: cita.nota.observacion },
                    ].filter(n => n.value).map((n, i) => (
                      <div
                        key={i}
                        className="rounded-3xl border border-slate-200/80 bg-white p-4 shadow-sm"
                      >
                        <p className="mb-1 text-xs font-black uppercase tracking-[0.12em] text-slate-400">
                          {n.label}
                        </p>
                        <p className="text-sm leading-relaxed text-slate-700">
                          {n.value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="border-t border-slate-100 pt-5">
                  <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-slate-200 bg-slate-50/70 px-6 py-8">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm">
                      <FileText size={20} className="text-slate-400" />
                    </div>

                    <div className="text-center">
                      <p className="text-sm font-black text-slate-700">
                        Sin nota clínica registrada
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        La cita todavía no cuenta con una nota clínica.
                      </p>
                    </div>
                  </div>
                </div>
              )}
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