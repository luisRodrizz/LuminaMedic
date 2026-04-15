import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp, Calendar, CheckCircle, XCircle, Clock, Users, Stethoscope } from 'lucide-react'
import { toast } from 'sonner'
import PacienteLayout from '../../../components/PacienteLayout'
import api from '../../../services/api'

const MESES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']

const formatFecha = (fecha) => new Date(fecha).toLocaleDateString('es-PE', {
  day: '2-digit', month: 'short', year: 'numeric'
})

export default function MisEstadisticasPaciente() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [graficoBarra, setGraficoBarra] = useState('citas')

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/estadisticas/paciente')
        setStats(res.data)
      } catch {
        toast.error('Error al cargar estadísticas')
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) return (
    <PacienteLayout>
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 text-sm">Cargando estadísticas...</p>
      </div>
    </PacienteLayout>
  )

  const { resumen, graficoMensual, citasPorEstado, ultimasCompletadas } = stats

  const tarjetas = [
    { label: 'Total citas',        value: resumen.totalCitas,       icon: Calendar,    color: 'bg-blue-500',    sub: 'Historial completo'   },
    { label: 'Completadas',        value: resumen.totalCompletadas, icon: CheckCircle, color: 'bg-emerald-500', sub: 'Consultas realizadas' },
    { label: 'Canceladas',         value: resumen.totalCanceladas,  icon: XCircle,     color: 'bg-red-500',     sub: 'Total histórico'      },
    { label: 'Doctores visitados', value: resumen.doctoresUnicos,   icon: Users,       color: 'bg-indigo-500',  sub: 'Especialistas únicos' },
  ]

  const coloresEstado = {
    PENDIENTE:  { bar: 'bg-yellow-400',  text: 'text-yellow-700',  bg: 'bg-yellow-50'  },
    CONFIRMADA: { bar: 'bg-blue-400',    text: 'text-blue-700',    bg: 'bg-blue-50'    },
    COMPLETADA: { bar: 'bg-emerald-400', text: 'text-emerald-700', bg: 'bg-emerald-50' },
    CANCELADA:  { bar: 'bg-red-400',     text: 'text-red-700',     bg: 'bg-red-50'     },
  }

  return (
    <PacienteLayout>
      <div className="page-enter">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
            <TrendingUp size={20} className="text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Mis Estadísticas</h1>
            <p className="text-slate-400 text-sm mt-0.5">Resumen de tu historial médico</p>
          </div>
        </div>

        {/* Tarjetas */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {tarjetas.map((t, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 p-4 md:p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-9 h-9 ${t.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <t.icon size={16} className="text-white" />
                </div>
                <p className="text-xs text-slate-400 truncate">{t.label}</p>
              </div>
              <p className="text-2xl md:text-3xl font-bold text-slate-800">{t.value}</p>
              <p className="text-xs text-slate-400 mt-1">{t.sub}</p>
            </div>
          ))}
        </div>

        {/* Gráfico + Distribución */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

          {/* Gráfico anual */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-5 md:p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <TrendingUp size={15} className="text-slate-400" />
                <p className="text-sm font-semibold text-slate-700">Mis citas este año</p>
              </div>
              <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
                <button onClick={() => setGraficoBarra('citas')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${graficoBarra === 'citas' ? 'bg-white shadow-sm text-slate-700' : 'text-slate-400 hover:text-slate-600'}`}>
                  Total
                </button>
                <button onClick={() => setGraficoBarra('completadas')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${graficoBarra === 'completadas' ? 'bg-white shadow-sm text-slate-700' : 'text-slate-400 hover:text-slate-600'}`}>
                  Completadas
                </button>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={graficoMensual} barSize={24}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: 12 }} cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey={graficoBarra}
                  name={graficoBarra === 'citas' ? 'Total citas' : 'Completadas'}
                  fill={graficoBarra === 'citas' ? '#3b82f6' : '#10b981'}
                  radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Distribución por estado */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 md:p-6">
            <div className="flex items-center gap-2 mb-5">
              <Clock size={15} className="text-slate-400" />
              <p className="text-sm font-semibold text-slate-700">Por estado</p>
            </div>
            <div className="space-y-3">
              {citasPorEstado.map((c) => {
                const pct = resumen.totalCitas > 0 ? Math.round((c.total / resumen.totalCitas) * 100) : 0
                const cfg = coloresEstado[c.estado] || coloresEstado.PENDIENTE
                return (
                  <div key={c.estado} className="flex items-center gap-3">
                    <span className={`text-xs font-medium w-20 sm:w-24 flex-shrink-0 ${cfg.text}`}>{c.estado}</span>
                    <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div className={`h-full rounded-full ${cfg.bar} transition-all duration-500`} style={{ width: `${pct}%` }} />
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className="text-xs text-slate-400 w-7 text-right">{pct}%</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${cfg.bg} ${cfg.text}`}>{c.total}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Últimas consultas */}
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="flex items-center gap-2 px-4 md:px-6 py-4 border-b border-slate-100">
            <Stethoscope size={15} className="text-slate-400" />
            <p className="text-sm font-semibold text-slate-700">Últimas consultas completadas</p>
          </div>
          {ultimasCompletadas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center">
                <Stethoscope size={24} className="text-slate-400" />
              </div>
              <p className="text-slate-500 font-medium text-sm">Sin consultas completadas aún</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {ultimasCompletadas.map(cita => (
                <div key={cita.id} className="flex items-center justify-between px-4 md:px-6 py-4 hover:bg-slate-50/70 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {cita.doctor.foto ? (
                        <img src={cita.doctor.foto} className="w-full h-full object-cover" alt="" />
                      ) : (
                        <span className="text-emerald-600 text-xs font-bold">
                          {cita.doctor.usuario.nombre[0]}{cita.doctor.usuario.apellido[0]}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-slate-800 text-sm truncate">
                        Dr. {cita.doctor.usuario.nombre} {cita.doctor.usuario.apellido}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5 truncate">
                        {cita.servicio.nombre} · {formatFecha(cita.fecha)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                    {cita.nota && (
                      <span className="hidden sm:inline-flex px-2.5 py-1 bg-emerald-50 text-emerald-600 text-xs font-medium rounded-lg border border-emerald-100">
                        Con nota clínica
                      </span>
                    )}
                    <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-lg">
                      Completada
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </PacienteLayout>
  )
}