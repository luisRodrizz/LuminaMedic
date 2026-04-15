import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { X, Calendar, User, Stethoscope, Clock, FileText, DollarSign, Download } from 'lucide-react'
import { motion } from 'framer-motion'
import api from '../../../services/api'

const estadoColors = {
  PENDIENTE:  { bg: 'bg-yellow-50',  text: 'text-yellow-700',  dot: 'bg-yellow-400'  },
  CONFIRMADA: { bg: 'bg-blue-50',    text: 'text-blue-700',    dot: 'bg-blue-400'    },
  COMPLETADA: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-400' },
  CANCELADA:  { bg: 'bg-red-50',     text: 'text-red-700',     dot: 'bg-red-400'     },
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
      const res = await api.get(`/reportes/cita/${citaId}`, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
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

  const formatFecha = (fecha) => new Date(fecha).toLocaleString('es-PE', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })

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
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-cyan-50 rounded-xl flex items-center justify-center">
              <Calendar size={18} className="text-cyan-600" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-800">Detalle de Cita</h2>
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
              <p className="text-slate-400 text-sm">Cargando cita...</p>
            </div>
          ) : !cita ? (
            <div className="py-12 text-center text-slate-400">No se encontró la cita</div>
          ) : (
            <>
              {/* Estado y ID */}
              <div className="flex items-center justify-between mb-5">
                {(() => {
                  const cfg = estadoColors[cita.estado]
                  return (
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
                      <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                      {cita.estado}
                    </span>
                  )
                })()}
                <span className="text-xs text-slate-400 bg-slate-50 px-3 py-1.5 rounded-xl">Cita #{cita.id}</span>
              </div>

              {/* Info principal */}
              <div className="space-y-2 mb-5">
                {[
                  { icon: Calendar,    label: 'Fecha y hora', value: formatFecha(cita.fecha) },
                  { icon: User,        label: 'Paciente',     value: `${cita.paciente.usuario.nombre} ${cita.paciente.usuario.apellido}` },
                  { icon: Stethoscope, label: 'Doctor',       value: `Dr. ${cita.doctor.usuario.nombre} ${cita.doctor.usuario.apellido}` },
                  { icon: Clock,       label: 'Servicio',     value: `${cita.servicio.nombre} (${cita.servicio.duracion} min)` },
                  { icon: DollarSign,  label: 'Precio',       value: `S/ ${cita.servicio.precio}` },
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
              </div>

              {/* Motivo */}
              {cita.motivo && (
                <div className="p-4 bg-slate-50 rounded-2xl mb-5">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Motivo</p>
                  <p className="text-sm text-slate-600">{cita.motivo}</p>
                </div>
              )}

              {/* Nota clínica */}
              {cita.nota ? (
                <div className="border-t border-slate-100 pt-5">
                  <div className="flex items-center gap-2 mb-3">
                    <FileText size={15} className="text-slate-400" />
                    <p className="text-sm font-semibold text-slate-700">Nota Clínica</p>
                  </div>
                  <div className="space-y-2">
                    {[
                      { label: 'Diagnóstico',   value: cita.nota.diagnostico },
                      { label: 'Tratamiento',   value: cita.nota.tratamiento },
                      { label: 'Receta',        value: cita.nota.receta },
                      { label: 'Observaciones', value: cita.nota.observacion },
                    ].filter(n => n.value).map((n, i) => (
                      <div key={i} className="p-3 bg-slate-50 rounded-xl">
                        <p className="text-xs text-slate-400 mb-1">{n.label}</p>
                        <p className="text-sm text-slate-700">{n.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="border-t border-slate-100 pt-5">
                  <div className="flex flex-col items-center gap-2 py-4">
                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                      <FileText size={18} className="text-slate-400" />
                    </div>
                    <p className="text-sm text-slate-400">Sin nota clínica registrada</p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex-shrink-0 flex gap-3">
          <button onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50 transition-all">
            Cerrar
          </button>
          {cita && (
            <button onClick={descargarPDF} disabled={descargando}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-medium transition-all shadow-sm">
              {descargando ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generando...
                </>
              ) : (
                <>
                  <Download size={15} />
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