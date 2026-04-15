import { useState, useEffect } from 'react'
import { ScrollText } from 'lucide-react'
import { toast } from 'sonner'
import AdminLayout from '../../../components/AdminLayout'
import Pagination from '../../../components/Pagination'
import api from '../../../services/api'

const accionConfig = {
  CREAR_CITA:           { bg: 'bg-blue-50',    text: 'text-blue-700'    },
  CAMBIAR_ESTADO_CITA:  { bg: 'bg-yellow-50',  text: 'text-yellow-700'  },
  AGREGAR_NOTA:         { bg: 'bg-emerald-50', text: 'text-emerald-700' },
  CREAR_DOCTOR:         { bg: 'bg-violet-50',  text: 'text-violet-700'  },
  ACTUALIZAR_DOCTOR:    { bg: 'bg-orange-50',  text: 'text-orange-700'  },
  ACTUALIZAR_PACIENTE:  { bg: 'bg-pink-50',    text: 'text-pink-700'    },
}

const rolConfig = {
  ADMIN:    { bg: 'bg-blue-50',    text: 'text-blue-700'    },
  DOCTOR:   { bg: 'bg-emerald-50', text: 'text-emerald-700' },
  PACIENTE: { bg: 'bg-slate-100',  text: 'text-slate-600'   },
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

  useEffect(() => { fetchLogs(page) }, [page])

  const formatFecha = (fecha) => new Date(fecha).toLocaleString('es-PE', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  })

  return (
    <AdminLayout>
      <div className="page-enter">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
            <ScrollText size={20} className="text-slate-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Logs del Sistema</h1>
            <p className="text-slate-400 text-sm mt-0.5">Registro de acciones realizadas</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-slate-100">
            <p className="text-sm font-semibold text-slate-700">Historial de actividad</p>
            <p className="text-xs text-slate-400">
              {meta ? `${meta.total} registro${meta.total !== 1 ? 's' : ''}` : ''}
            </p>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-slate-400 text-sm">Cargando registros...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center">
                <ScrollText size={24} className="text-slate-400" />
              </div>
              <p className="text-slate-500 font-medium">No hay logs registrados</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[500px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-4 md:px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Fecha</th>
                    <th className="px-4 md:px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Usuario</th>
                    <th className="hidden sm:table-cell px-4 md:px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Rol</th>
                    <th className="px-4 md:px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {logs.map((log) => {
                    const accionCfg = accionConfig[log.accion] || { bg: 'bg-slate-100', text: 'text-slate-600' }
                    const rolCfg = rolConfig[log.usuario.role] || rolConfig.PACIENTE
                    return (
                      <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-4 md:px-6 py-4 text-slate-500 text-xs font-mono whitespace-nowrap">
                          {formatFecha(log.createdAt)}
                        </td>
                        <td className="px-4 md:px-6 py-4">
                          <span className="text-sm font-medium text-slate-800 truncate block max-w-[120px] md:max-w-none">
                            {log.usuario.nombre} {log.usuario.apellido}
                          </span>
                        </td>
                        <td className="hidden sm:table-cell px-4 md:px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${rolCfg.bg} ${rolCfg.text}`}>
                            {log.usuario.role}
                          </span>
                        </td>
                        <td className="px-4 md:px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${accionCfg.bg} ${accionCfg.text}`}>
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