import { useState, useEffect } from 'react'
import { Eye, FileText, Calendar, Filter } from 'lucide-react'
import { AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import DoctorLayout from '../../../components/DoctorLayout'
import Pagination from '../../../components/Pagination'
import ModalVerCita from './ModalVerCita'
import ModalNotaCita from './ModalNotaCita'
import api from '../../../services/api'

const estadoColors = {
  PENDIENTE:  { bg: 'bg-yellow-50',  text: 'text-yellow-700',  dot: 'bg-yellow-400'  },
  CONFIRMADA: { bg: 'bg-blue-50',    text: 'text-blue-700',    dot: 'bg-blue-400'    },
  COMPLETADA: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-400' },
  CANCELADA:  { bg: 'bg-red-50',     text: 'text-red-700',     dot: 'bg-red-400'     },
}

export default function DoctorCitas() {
  const [citas, setCitas] = useState([])
  const [meta, setMeta] = useState(null)
  const [page, setPage] = useState(1)
  const [filtroEstado, setFiltroEstado] = useState('')
  const [loading, setLoading] = useState(true)
  const [modalVer, setModalVer] = useState(false)
  const [modalNota, setModalNota] = useState(false)
  const [citaSeleccionada, setCitaSeleccionada] = useState(null)

  const fetchCitas = async (p = 1, estado = '') => {
    try {
      const res = await api.get(`/citas?page=${p}&limit=10&estado=${estado}`)
      setCitas(res.data.data)
      setMeta(res.data.meta)
    } catch {
      toast.error('Error al cargar las citas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchCitas(page, filtroEstado) }, [page, filtroEstado])

  const formatFecha = (fecha) => new Date(fecha).toLocaleString('es-PE', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })

  return (
    <DoctorLayout>
      <div className="page-enter">

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <Calendar size={20} className="text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Mis Citas</h1>
              <p className="text-slate-400 text-sm mt-0.5">Gestión de tus citas médicas</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 md:px-6 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Filter size={15} className="text-slate-400 flex-shrink-0" />
              <select value={filtroEstado}
                onChange={(e) => { setFiltroEstado(e.target.value); setPage(1) }}
                className="py-2 px-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-slate-50 text-slate-600 w-full sm:w-auto">
                <option value="">Todos los estados</option>
                <option value="PENDIENTE">Pendiente</option>
                <option value="CONFIRMADA">Confirmada</option>
                <option value="COMPLETADA">Completada</option>
                <option value="CANCELADA">Cancelada</option>
              </select>
            </div>
            <p className="text-xs text-slate-400">
              {meta ? `${meta.total} cita${meta.total !== 1 ? 's' : ''}` : ''}
            </p>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-slate-400 text-sm">Cargando citas...</p>
            </div>
          ) : citas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center">
                <Calendar size={24} className="text-slate-400" />
              </div>
              <p className="text-slate-500 font-medium">No tienes citas programadas</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[580px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-4 md:px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Fecha</th>
                    <th className="px-4 md:px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Paciente</th>
                    <th className="hidden sm:table-cell px-4 md:px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Servicio</th>
                    <th className="hidden md:table-cell px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Motivo</th>
                    <th className="px-4 md:px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                    <th className="px-4 md:px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {citas.map((cita) => {
                    const cfg = estadoColors[cita.estado]
                    return (
                      <tr key={cita.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-4 md:px-6 py-4 text-slate-500 text-sm whitespace-nowrap">
                          {formatFecha(cita.fecha)}
                        </td>
                        <td className="px-4 md:px-6 py-4">
                          <span className="text-sm font-medium text-slate-800 truncate block max-w-[120px] md:max-w-none">
                            {cita.paciente.usuario.nombre} {cita.paciente.usuario.apellido}
                          </span>
                        </td>
                        <td className="hidden sm:table-cell px-4 md:px-6 py-4">
                          <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium">
                            {cita.servicio.nombre}
                          </span>
                        </td>
                        <td className="hidden md:table-cell px-6 py-4 text-slate-500 text-sm">
                          {cita.motivo || '—'}
                        </td>
                        <td className="px-4 md:px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${cfg.bg} ${cfg.text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                            <span className="hidden sm:inline">{cita.estado}</span>
                          </span>
                        </td>
                        <td className="px-4 md:px-6 py-4">
                          <div className="flex items-center gap-1.5">
                            <button onClick={() => { setCitaSeleccionada(cita); setModalVer(true) }}
                              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                              title="Ver detalle">
                              <Eye size={15} />
                            </button>
                            {cita.estado !== 'COMPLETADA' && cita.estado !== 'CANCELADA' && !cita.nota && (
                              <button onClick={() => { setCitaSeleccionada(cita); setModalNota(true) }}
                                className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                                title="Agregar nota clínica">
                                <FileText size={15} />
                              </button>
                            )}
                            {cita.nota && (
                              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-medium">
                                <FileText size={11} /> Nota ✓
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="border-t border-slate-100">
            <Pagination meta={meta} onPageChange={(p) => setPage(p)} />
          </div>
        </div>

        <AnimatePresence>
          {modalVer && citaSeleccionada && (
            <ModalVerCita citaId={citaSeleccionada.id} onClose={() => setModalVer(false)} />
          )}
        </AnimatePresence>
        <AnimatePresence>
          {modalNota && citaSeleccionada && (
            <ModalNotaCita cita={citaSeleccionada} onClose={() => setModalNota(false)} onSuccess={() => {
              fetchCitas(page, filtroEstado)
              toast.success('Nota clínica guardada correctamente')
            }} />
          )}
        </AnimatePresence>
      </div>
    </DoctorLayout>
  )
}