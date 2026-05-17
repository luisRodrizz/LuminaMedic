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
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-950 md:text-3xl">
              Mis Citas
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              Revisa tus citas médicas asignadas, estados de atención y notas clínicas.
            </p>
          </div>

          {meta && (
            <div className="inline-flex w-fit items-center gap-2 rounded-2xl border border-[#00CCA5]/20 bg-[#00CCA5]/10 px-4 py-2">
              <span className="h-2 w-2 rounded-full bg-[#00CCA5]" />
              <span className="text-xs font-black text-[#008f78]">
                {meta.total} cita{meta.total !== 1 ? 's' : ''} registrada{meta.total !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>

        {/* Tabla */}
        <div className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 md:flex-row md:items-center md:justify-between md:px-6">
            <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-[#00CCA5]/10">
                <Filter size={17} className="text-[#008f78]" />
              </div>

              <select
                value={filtroEstado}
                onChange={(e) => {
                  setFiltroEstado(e.target.value)
                  setPage(1)
                }}
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-600 outline-none transition focus:border-[#00CCA5] focus:bg-white focus:ring-4 focus:ring-[#00CCA5]/15 sm:w-72"
              >
                <option value="">Todos los estados</option>
                <option value="PENDIENTE">Pendiente</option>
                <option value="CONFIRMADA">Confirmada</option>
                <option value="COMPLETADA">Completada</option>
                <option value="CANCELADA">Cancelada</option>
              </select>
            </div>

            <div className="flex items-center justify-end">
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-500">
                Agenda médica
              </span>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16">
              <div className="h-9 w-9 animate-spin rounded-full border-2 border-[#00CCA5] border-t-transparent" />
              <p className="text-sm text-slate-400">Cargando citas...</p>
            </div>
          ) : citas.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 px-6 py-16">
              <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-slate-100">
                <Calendar size={24} className="text-slate-400" />
              </div>

              <div className="text-center">
                <p className="text-sm font-black text-slate-700">
                  No tienes citas programadas
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Cuando existan citas asignadas, aparecerán en esta sección.
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/80">
                    <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">
                      Fecha
                    </th>
                    <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">
                      Paciente
                    </th>
                    <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">
                      Servicio
                    </th>
                    <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">
                      Motivo
                    </th>
                    <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">
                      Estado
                    </th>
                    <th className="px-6 py-4 text-right text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">
                      Acciones
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {citas.map((cita) => {
                    const cfg = estadoColors[cita.estado] || estadoColors.CONFIRMADA

                    return (
                      <tr
                        key={cita.id}
                        className="transition-colors hover:bg-slate-50/70"
                      >
                        <td className="px-6 py-4">
                          <div className="inline-flex rounded-2xl bg-slate-100 px-3 py-1.5">
                            <span className="whitespace-nowrap font-mono text-sm font-black text-slate-700">
                              {formatFecha(cita.fecha)}
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-2xl border border-[#00CCA5]/20 bg-[#00CCA5]/10">
                              <span className="text-xs font-black text-[#008f78]">
                                {cita.paciente.usuario.nombre[0]}
                                {cita.paciente.usuario.apellido[0]}
                              </span>
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-sm font-black text-slate-800">
                                {cita.paciente.usuario.nombre}{' '}
                                {cita.paciente.usuario.apellido}
                              </p>
                              <p className="text-xs text-slate-400">
                                Paciente asignado
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <span className="inline-flex rounded-2xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-600">
                            {cita.servicio.nombre}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <p className="max-w-[240px] truncate text-sm font-medium text-slate-500">
                            {cita.motivo || '—'}
                          </p>
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-2 rounded-2xl px-3 py-1.5 text-xs font-black ${cfg.bg} ${cfg.text}`}
                          >
                            <span className={`h-2 w-2 rounded-full ${cfg.dot}`} />
                            {cita.estado}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setCitaSeleccionada(cita)
                                setModalVer(true)
                              }}
                              className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-[#00CCA5]/10 hover:text-[#008f78]"
                              title="Ver detalle"
                            >
                              <Eye size={15} />
                            </button>

                            {cita.estado !== 'COMPLETADA' && cita.estado !== 'CANCELADA' && !cita.nota && (
                              <button
                                onClick={() => {
                                  setCitaSeleccionada(cita)
                                  setModalNota(true)
                                }}
                                className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-[#000089]/10 hover:text-[#000089]"
                                title="Agregar nota clínica"
                              >
                                <FileText size={15} />
                              </button>
                            )}

                            {cita.nota && (
                              <span className="inline-flex items-center gap-1.5 rounded-2xl bg-[#00CCA5]/10 px-3 py-1.5 text-xs font-black text-[#008f78]">
                                <FileText size={12} />
                                Nota
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
            <ModalVerCita
              citaId={citaSeleccionada.id}
              onClose={() => setModalVer(false)}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {modalNota && citaSeleccionada && (
            <ModalNotaCita
              cita={citaSeleccionada}
              onClose={() => setModalNota(false)}
              onSuccess={() => {
                fetchCitas(page, filtroEstado)
                toast.success('Nota clínica guardada correctamente')
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </DoctorLayout>
  )
}