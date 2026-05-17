import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import {
  X,
  Calendar,
  User,
  Stethoscope,
  Clock,
  FileText,
  DollarSign,
  Download,
  ClipboardList
} from 'lucide-react'
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
  }
}

export default function ModalVerCita({ citaId, onClose }) {
  const [cita, setCita] = useState(null)
  const [loading, setLoading] = useState(true)
  const [descargando, setDescargando] = useState(false)

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

  const descargarPDF = async () => {
    setDescargando(true)

    try {
      const res = await api.get(`/reportes/cita/${citaId}`, {
        responseType: 'blob'
      })

      const url = window.URL.createObjectURL(
        new Blob([res.data], { type: 'application/pdf' })
      )

      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `cita-${citaId}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      toast.success('PDF descargado correctamente')
    } catch {
      toast.error('Error al generar el PDF')
    } finally {
      setDescargando(false)
    }
  }

  const formatFecha = (fecha) =>
    new Date(fecha).toLocaleString('es-PE', {
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 16 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-[2rem] border border-white/70 bg-white shadow-2xl shadow-slate-950/20"
      >
        {/* Header */}
        <div className="relative flex-shrink-0 border-b border-slate-100 px-6 py-6">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#000089] via-[#00A98A] to-[#00CCA5]" />

          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#00CCA5]/10">
                <Calendar size={21} className="text-[#008f78]" />
              </div>

              <div>
                <h2 className="text-lg font-black text-slate-950">
                  Detalle de Cita
                </h2>
                <p className="mt-0.5 text-xs text-slate-400">
                  Información completa de la atención médica registrada.
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
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-14">
              <div className="h-9 w-9 animate-spin rounded-full border-2 border-[#00CCA5] border-t-transparent" />
              <p className="text-sm text-slate-400">Cargando cita...</p>
            </div>
          ) : !cita ? (
            <div className="flex flex-col items-center justify-center gap-3 py-14">
              <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-slate-100">
                <Calendar size={22} className="text-slate-400" />
              </div>
              <p className="text-sm font-bold text-slate-500">
                No se encontró la cita
              </p>
            </div>
          ) : (
            <>
              {/* Estado e ID */}
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                {(() => {
                  const cfg = estadoColors[cita.estado] || estadoColors.CONFIRMADA

                  return (
                    <span
                      className={`inline-flex w-fit items-center gap-2 rounded-2xl px-3 py-1.5 text-xs font-black ${cfg.bg} ${cfg.text}`}
                    >
                      <span className={`h-2 w-2 rounded-full ${cfg.dot}`} />
                      {cita.estado}
                    </span>
                  )
                })()}

                <span className="inline-flex w-fit rounded-2xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-black text-slate-500">
                  Cita #{cita.id}
                </span>
              </div>

              {/* Información principal */}
              <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
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
                    icon: Stethoscope,
                    label: 'Doctor',
                    value: `Dr. ${cita.doctor.usuario.nombre} ${cita.doctor.usuario.apellido}`
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
                  }
                ].map((item, i) => (
                  <div
                    key={i}
                    className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-2xl bg-white">
                        <item.icon size={16} className="text-slate-400" />
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
                  </div>
                ))}
              </div>

              {/* Motivo */}
              {cita.motivo && (
                <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-5">
                  <div className="mb-3 flex items-center gap-2">
                    <ClipboardList size={16} className="text-[#008f78]" />
                    <p className="text-sm font-black text-slate-800">
                      Motivo de consulta
                    </p>
                  </div>

                  <p className="text-sm leading-6 text-slate-500">
                    {cita.motivo}
                  </p>
                </div>
              )}

              {/* Nota clínica */}
              {cita.nota ? (
                <div className="rounded-3xl border border-slate-200 bg-white p-5">
                  <div className="mb-4 flex items-center gap-2">
                    <FileText size={16} className="text-[#000089]" />
                    <p className="text-sm font-black text-slate-800">
                      Nota Clínica
                    </p>
                  </div>

                  <div className="space-y-3">
                    {[
                      { label: 'Diagnóstico', value: cita.nota.diagnostico },
                      { label: 'Tratamiento', value: cita.nota.tratamiento },
                      { label: 'Receta', value: cita.nota.receta },
                      { label: 'Observaciones', value: cita.nota.observacion }
                    ]
                      .filter((n) => n.value)
                      .map((n, i) => (
                        <div
                          key={i}
                          className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3"
                        >
                          <p className="mb-1 text-xs font-black uppercase tracking-[0.12em] text-slate-400">
                            {n.label}
                          </p>

                          <p className="text-sm leading-6 text-slate-600">
                            {n.value}
                          </p>
                        </div>
                      ))}
                  </div>
                </div>
              ) : (
                <div className="rounded-3xl border border-slate-200 bg-slate-50/70 px-5 py-8">
                  <div className="flex flex-col items-center gap-3 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white">
                      <FileText size={20} className="text-slate-400" />
                    </div>

                    <div>
                      <p className="text-sm font-black text-slate-600">
                        Sin nota clínica registrada
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        La nota clínica aparecerá aquí cuando sea registrada por el doctor.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-shrink-0 flex-col-reverse gap-3 border-t border-slate-100 px-6 py-4 sm:flex-row">
          <button
            onClick={onClose}
            type="button"
            className="flex h-11 flex-1 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
          >
            Cerrar
          </button>

          {cita && (
            <button
              onClick={descargarPDF}
              disabled={descargando}
              type="button"
              className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#000089] px-4 text-sm font-black text-white shadow-lg shadow-[#000089]/20 transition hover:bg-[#000070] hover:ring-4 hover:ring-[#00CCA5]/15 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {descargando ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Generando...
                </>
              ) : (
                <>
                  <Download size={16} />
                  Descargar PDF
                </>
              )}
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}