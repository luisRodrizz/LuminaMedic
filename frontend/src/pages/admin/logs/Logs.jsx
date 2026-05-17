import { useState, useEffect } from 'react'
import {
  ScrollText,
  ShieldCheck,
  UserRound,
  Activity,
  Clock3
} from 'lucide-react'
import { toast } from 'sonner'
import AdminLayout from '../../../components/AdminLayout'
import Pagination from '../../../components/Pagination'
import api from '../../../services/api'

const accionConfig = {
  CREAR_CITA: {
    bg: 'bg-[#000089]/10',
    text: 'text-[#000089]',
    dot: 'bg-[#000089]'
  },
  CAMBIAR_ESTADO_CITA: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    dot: 'bg-amber-400'
  },
  AGREGAR_NOTA: {
    bg: 'bg-[#00CCA5]/10',
    text: 'text-[#008f78]',
    dot: 'bg-[#00CCA5]'
  },
  CREAR_DOCTOR: {
    bg: 'bg-violet-50',
    text: 'text-violet-700',
    dot: 'bg-violet-500'
  },
  ACTUALIZAR_DOCTOR: {
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    dot: 'bg-orange-400'
  },
  ACTUALIZAR_PACIENTE: {
    bg: 'bg-pink-50',
    text: 'text-pink-700',
    dot: 'bg-pink-400'
  }
}

const rolConfig = {
  ADMIN: {
    bg: 'bg-[#000089]/10',
    text: 'text-[#000089]',
    dot: 'bg-[#000089]'
  },
  DOCTOR: {
    bg: 'bg-[#00CCA5]/10',
    text: 'text-[#008f78]',
    dot: 'bg-[#00CCA5]'
  },
  PACIENTE: {
    bg: 'bg-slate-100',
    text: 'text-slate-600',
    dot: 'bg-slate-400'
  }
}

export default function Logs() {
  const [logs, setLogs] = useState([])
  const [meta, setMeta] = useState(null)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  const fetchLogs = async (p = 1) => {
    try {
      const res = await api.get(`/logs?page=${p}&limit=20`)
      setLogs(res.data.data)
      setMeta(res.data.meta)
    } catch {
      toast.error('Error al cargar los logs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs(page)
  }, [page])

  const formatFecha = (fecha) =>
    new Date(fecha).toLocaleString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })

  return (
    <AdminLayout>
      <div className="page-enter">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-black tracking-tight text-slate-950 md:text-3xl">
            Logs del Sistema
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Supervisa el historial de acciones realizadas por usuarios dentro del sistema.
          </p>
        </div>

        {/* Resumen */}
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#000089] shadow-lg shadow-[#000089]/15">
                <ScrollText size={20} className="text-white" />
              </div>

              <div>
                <p className="text-xs font-bold text-slate-400">
                  Registros totales
                </p>
                <p className="text-2xl font-black text-slate-950">
                  {meta?.total ?? logs.length}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#00CCA5] shadow-lg shadow-[#00CCA5]/20">
                <ShieldCheck size={20} className="text-white" />
              </div>

              <div>
                <p className="text-xs font-bold text-slate-400">
                  Auditoría activa
                </p>
                <p className="text-2xl font-black text-slate-950">
                  Online
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 shadow-lg shadow-slate-200">
                <Activity size={20} className="text-white" />
              </div>

              <div>
                <p className="text-xs font-bold text-slate-400">
                  Vista actual
                </p>
                <p className="text-2xl font-black text-slate-950">
                  {logs.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabla */}
        <div className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-5 md:flex-row md:items-center md:justify-between md:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#00CCA5]/10">
                <ScrollText size={18} className="text-[#008f78]" />
              </div>

              <div>
                <p className="text-sm font-black text-slate-900">
                  Historial de actividad
                </p>
                <p className="text-xs text-slate-400">
                  Acciones registradas por usuario, rol y fecha
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end">
              {meta && (
                <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2">
                  <span className="h-2 w-2 rounded-full bg-[#00CCA5]" />
                  <span className="text-xs font-bold text-slate-500">
                    {meta.total} registro{meta.total !== 1 ? 's' : ''}
                  </span>
                </div>
              )}
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16">
              <div className="h-9 w-9 animate-spin rounded-full border-2 border-[#00CCA5] border-t-transparent" />
              <p className="text-sm text-slate-400">Cargando registros...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 px-6 py-16">
              <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-slate-100">
                <ScrollText size={24} className="text-slate-400" />
              </div>

              <div className="text-center">
                <p className="text-sm font-black text-slate-700">
                  No hay logs registrados
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Las acciones del sistema aparecerán aquí automáticamente.
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px]">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/80">
                    <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">
                      Fecha
                    </th>
                    <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">
                      Usuario
                    </th>
                    <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">
                      Rol
                    </th>
                    <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">
                      Acción
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {logs.map((log) => {
                    const accionCfg =
                      accionConfig[log.accion] || {
                        bg: 'bg-slate-100',
                        text: 'text-slate-600',
                        dot: 'bg-slate-400'
                      }

                    const rolCfg = rolConfig[log.usuario.role] || rolConfig.PACIENTE

                    return (
                      <tr
                        key={log.id}
                        className="transition-colors hover:bg-slate-50/70"
                      >
                        <td className="px-6 py-4">
                          <div className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-3 py-1.5">
                            <Clock3 size={13} className="text-slate-400" />
                            <span className="whitespace-nowrap font-mono text-xs font-black text-slate-700">
                              {formatFecha(log.createdAt)}
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-2xl bg-[#00CCA5]/10">
                              <UserRound size={16} className="text-[#008f78]" />
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-sm font-black text-slate-800">
                                {log.usuario.nombre} {log.usuario.apellido}
                              </p>
                              <p className="text-xs text-slate-400">
                                Usuario del sistema
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-2 rounded-2xl px-3 py-1.5 text-xs font-black ${rolCfg.bg} ${rolCfg.text}`}
                          >
                            <span className={`h-2 w-2 rounded-full ${rolCfg.dot}`} />
                            {log.usuario.role}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-2 rounded-2xl px-3 py-1.5 text-xs font-black ${accionCfg.bg} ${accionCfg.text}`}
                          >
                            <span className={`h-2 w-2 rounded-full ${accionCfg.dot}`} />
                            {log.accion}
                          </span>
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
      </div>
    </AdminLayout>
  )
}