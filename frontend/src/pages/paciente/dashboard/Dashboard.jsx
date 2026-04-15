import { useState, useEffect } from 'react'
import { Calendar, CheckCircle, Clock, ArrowUpRight, Plus, Users } from 'lucide-react'
import PacienteLayout from '../../../components/PacienteLayout'
import api from '../../../services/api'
import { useAuth } from '../../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

const estadoColors = {
  PENDIENTE:  { bg: 'bg-yellow-50',  text: 'text-yellow-700',  dot: 'bg-yellow-400' },
  CONFIRMADA: { bg: 'bg-blue-50',    text: 'text-blue-700',    dot: 'bg-blue-400'   },
  COMPLETADA: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-400'},
  CANCELADA:  { bg: 'bg-red-50',     text: 'text-red-700',     dot: 'bg-red-400'    },
}

const getHora = () => {
  const h = new Date().getHours()
  if (h < 12) return 'Buenos días'
  if (h < 18) return 'Buenas tardes'
  return 'Buenas noches'
}

const formatFecha = (fecha) => new Date(fecha).toLocaleString('es-PE', {
  day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
})

export default function PacienteDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/estadisticas/paciente')
        setStats(res.data)
      } catch {
        toast.error('Error cargando dashboard')
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  const tarjetas = [
    { label: 'Citas pendientes',      value: stats?.resumen?.totalPendientes  ?? '—', icon: Clock,       iconBg: 'bg-yellow-500' },
    { label: 'Consultas completadas', value: stats?.resumen?.totalCompletadas ?? '—', icon: CheckCircle, iconBg: 'bg-emerald-500'},
    { label: 'Total de citas',        value: stats?.resumen?.totalCitas       ?? '—', icon: Calendar,    iconBg: 'bg-blue-500'   },
    { label: 'Doctores consultados',  value: stats?.resumen?.doctoresUnicos   ?? '—', icon: Users,       iconBg: 'bg-indigo-500' },
  ]

  return (
    <PacienteLayout>
      <div className="page-enter">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">
              {getHora()}, {user?.nombre} 👋
            </h1>
            <p className="text-slate-400 text-sm mt-1">Bienvenido a tu portal de salud</p>
          </div>
          <button onClick={() => navigate('/paciente/citas')}
            className="flex items-center gap-2 px-3 md:px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-all shadow-sm hover:shadow-md flex-shrink-0">
            <Plus size={16} />
            <span className="hidden sm:inline">Agendar cita</span>
          </button>
        </div>

        {/* Tarjetas */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {tarjetas.map((t, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 p-4 md:p-5 flex items-center gap-3 md:gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
              <div className={`w-10 h-10 md:w-11 md:h-11 ${t.iconBg} rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm`}>
                <t.icon size={17} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-slate-400 text-xs truncate">{t.label}</p>
                <p className="text-xl md:text-2xl font-bold text-slate-800">{loading ? '—' : t.value}</p>
              </div>
              <ArrowUpRight size={15} className="text-slate-300 flex-shrink-0 hidden sm:block" />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

          {/* Próximas citas */}
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <div className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-slate-100">
              <p className="text-sm font-semibold text-slate-700">Citas próximas</p>
              <p className="text-xs text-slate-400">
                {stats?.proximasCitas?.length ?? 0} pendiente{stats?.proximasCitas?.length !== 1 ? 's' : ''}
              </p>
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : stats?.proximasCitas?.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center">
                  <Calendar size={24} className="text-slate-400" />
                </div>
                <p className="text-slate-500 font-medium text-sm">No tienes citas próximas</p>
                <button onClick={() => navigate('/paciente/citas')}
                  className="flex items-center gap-1.5 text-blue-600 text-sm font-medium hover:text-blue-700">
                  <Plus size={14} /> Agendar una cita
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {stats.proximasCitas.map((cita, i) => {
                  const cfg = estadoColors[cita.estado]
                  return (
                    <div key={cita.id} className={`flex items-center justify-between px-4 md:px-6 py-4 hover:bg-slate-50/70 transition-colors ${i === 0 ? 'bg-blue-50/30' : ''}`}>
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {cita.doctor.foto ? (
                            <img src={cita.doctor.foto} className="w-full h-full object-cover" alt="" />
                          ) : (
                            <span className="text-blue-600 text-xs font-bold">
                              {cita.doctor.usuario.nombre[0]}{cita.doctor.usuario.apellido[0]}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium text-slate-800 text-sm truncate">
                              Dr. {cita.doctor.usuario.nombre} {cita.doctor.usuario.apellido}
                            </p>
                            {i === 0 && (
                              <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-xs font-semibold rounded-full flex-shrink-0">Próxima</span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5 truncate">{cita.servicio.nombre} · {formatFecha(cita.fecha)}</p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium flex-shrink-0 ml-2 ${cfg.bg} ${cfg.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                        <span className="hidden sm:inline">{cita.estado}</span>
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Últimas consultas */}
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <div className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-slate-100">
              <p className="text-sm font-semibold text-slate-700">Últimas consultas</p>
              <p className="text-xs text-slate-400">{stats?.resumen?.totalCompletadas ?? 0} completadas</p>
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : stats?.ultimasCompletadas?.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center">
                  <CheckCircle size={24} className="text-slate-400" />
                </div>
                <p className="text-slate-500 font-medium text-sm">Sin consultas completadas</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {stats.ultimasCompletadas.map(cita => (
                  <div key={cita.id} className="flex items-center justify-between px-4 md:px-6 py-4 hover:bg-slate-50/70 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0">
                        <span className="text-emerald-600 text-xs font-bold">
                          {cita.doctor.usuario.nombre[0]}{cita.doctor.usuario.apellido[0]}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-slate-800 text-sm truncate">
                          Dr. {cita.doctor.usuario.nombre} {cita.doctor.usuario.apellido}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5 truncate">{cita.servicio.nombre} · {formatFecha(cita.fecha)}</p>
                      </div>
                    </div>
                    {cita.nota && (
                      <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 text-xs font-medium rounded-lg flex-shrink-0 ml-2">
                        Con nota
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </PacienteLayout>
  )
}