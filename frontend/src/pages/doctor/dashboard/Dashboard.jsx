import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Calendar, Clock, CheckCircle, ArrowUpRight, Users, TrendingUp } from 'lucide-react'
import DoctorLayout from '../../../components/DoctorLayout'
import api from '../../../services/api'
import { useAuth } from '../../../context/AuthContext'

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

const formatHora = (fecha) => new Date(fecha).toLocaleTimeString('es-PE', {
  hour: '2-digit', minute: '2-digit'
})

const AvatarPaciente = ({ paciente }) => {
  const nombre = paciente.usuario.nombre
  const apellido = paciente.usuario.apellido
  return (
    <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
      {paciente.foto ? (
        <img src={paciente.foto} alt="" className="w-full h-full object-cover"
          onError={(e) => {
            e.target.style.display = 'none'
            e.target.parentNode.innerHTML = `<span class="text-indigo-600 text-xs font-bold">${nombre[0]}${apellido[0]}</span>`
          }} />
      ) : (
        <span className="text-indigo-600 text-xs font-bold">{nombre[0]}{apellido[0]}</span>
      )}
    </div>
  )
}

const EmptyState = ({ mensaje }) => (
  <div className="flex flex-col items-center justify-center py-10 gap-3">
    <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center">
      <Calendar size={20} className="text-slate-400" />
    </div>
    <p className="text-slate-400 text-sm">{mensaje}</p>
  </div>
)

export default function DoctorDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/estadisticas/doctor')
        setStats(res.data)
      } catch {
        toast.error('Error al cargar el dashboard')
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  const tarjetas = [
    { label: 'Citas hoy',        value: stats?.citasHoy?.length         ?? '—', icon: Calendar,    iconBg: 'bg-blue-500'    },
    { label: 'Pendientes',       value: stats?.resumen?.totalPendientes  ?? '—', icon: Clock,       iconBg: 'bg-yellow-500'  },
    { label: 'Completadas',      value: stats?.resumen?.totalCompletadas ?? '—', icon: CheckCircle, iconBg: 'bg-emerald-500' },
    { label: 'Pacientes únicos', value: stats?.resumen?.pacientesUnicos  ?? '—', icon: Users,       iconBg: 'bg-indigo-500'  },
  ]

  return (
    <DoctorLayout>
      <div className="page-enter">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
              {getHora()}, Dr. {user?.nombre}
            </h1>
            <p className="text-slate-400 text-sm mt-1">Aquí está el resumen de tu agenda</p>
          </div>
          {stats && (
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 px-4 py-2.5 rounded-2xl self-start sm:self-auto">
              <TrendingUp size={15} className="text-emerald-600" />
              <div>
                <p className="text-xs text-emerald-600 font-medium">Tasa de asistencia</p>
                <p className="text-lg font-bold text-emerald-700">{stats.resumen.tasaAsistencia}%</p>
              </div>
            </div>
          )}
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

        {/* Stats del mes */}
        {stats && (
          <div className="grid grid-cols-3 gap-3 md:gap-4 mb-6">
            {[
              { label: 'Citas este mes',     value: stats.mes.total,       color: 'text-slate-800'   },
              { label: 'Completadas el mes', value: stats.mes.completadas, color: 'text-emerald-600' },
              { label: 'Ingresos del mes',   value: `S/ ${stats.resumen.ingresosMes.toFixed(2)}`, color: 'text-blue-600' },
            ].map((s, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 px-4 py-3 md:px-5 md:py-4">
                <p className="text-xs text-slate-400 mb-1 truncate">{s.label}</p>
                <p className={`text-lg md:text-xl font-bold ${s.color} truncate`}>{s.value}</p>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

          {/* Citas de hoy */}
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <div className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Clock size={13} className="text-blue-600" />
                </div>
                <p className="text-sm font-semibold text-slate-700">Citas de hoy</p>
              </div>
              <span className="text-xs text-slate-400">
                {new Date().toLocaleDateString('es-PE', { day: 'numeric', month: 'long' })}
              </span>
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : stats?.citasHoy?.length === 0 ? (
              <EmptyState mensaje="Sin citas para hoy" />
            ) : (
              <div className="divide-y divide-slate-50">
                {stats?.citasHoy?.map(cita => (
                  <div key={cita.id} className="flex items-center justify-between px-4 md:px-6 py-4 hover:bg-slate-50/70 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-600 text-xs font-bold font-mono">{formatHora(cita.fecha)}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-slate-800 text-sm truncate">
                          {cita.paciente.usuario.nombre} {cita.paciente.usuario.apellido}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5 truncate">{cita.servicio.nombre}</p>
                      </div>
                    </div>
                    {(() => {
                      const cfg = estadoColors[cita.estado]
                      return (
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium flex-shrink-0 ml-2 ${cfg.bg} ${cfg.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                          <span className="hidden sm:inline">{cita.estado}</span>
                        </span>
                      )
                    })()}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Próximas citas */}
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <div className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-emerald-50 rounded-lg flex items-center justify-center">
                  <Calendar size={13} className="text-emerald-600" />
                </div>
                <p className="text-sm font-semibold text-slate-700">Próximas citas</p>
              </div>
              <p className="text-xs text-slate-400">
                {stats?.proximasCitas?.length ?? 0} próxima{stats?.proximasCitas?.length !== 1 ? 's' : ''}
              </p>
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : stats?.proximasCitas?.length === 0 ? (
              <EmptyState mensaje="No hay citas próximas" />
            ) : (
              <div className="divide-y divide-slate-50">
                {stats?.proximasCitas?.map(cita => {
                  const cfg = estadoColors[cita.estado]
                  return (
                    <div key={cita.id} className="flex items-center justify-between px-4 md:px-6 py-4 hover:bg-slate-50/70 transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <AvatarPaciente paciente={cita.paciente} />
                        <div className="min-w-0">
                          <p className="font-medium text-slate-800 text-sm truncate">
                            {cita.paciente.usuario.nombre} {cita.paciente.usuario.apellido}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5 truncate">
                            {cita.servicio.nombre} · {formatFecha(cita.fecha)}
                          </p>
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

        </div>
      </div>
    </DoctorLayout>
  )
}