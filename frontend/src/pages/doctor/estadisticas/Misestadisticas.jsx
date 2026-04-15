import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { TrendingUp, Users, Calendar, CheckCircle, XCircle, Clock, Award } from 'lucide-react'
import { toast } from 'sonner'
import DoctorLayout from '../../../components/DoctorLayout'
import api from '../../../services/api'

const MESES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
const mesActual = new Date().getMonth()

export default function MisEstadisticas() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [graficoBarra, setGraficoBarra] = useState('citas')

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/estadisticas/doctor')
        setStats(res.data)
      } catch {
        toast.error('Error al cargar estadísticas')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  if (loading) return (
    <DoctorLayout>
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 text-sm">Cargando estadísticas...</p>
      </div>
    </DoctorLayout>
  )

  const { resumen, mes, graficoMensual, citasPorEstado } = stats
  const graficoFiltrado = graficoMensual.slice(0, mesActual + 1)

  const tarjetas = [
    { label: 'Total citas',      value: resumen.totalCitas,       icon: Calendar,    color: 'bg-blue-500',    sub: 'Historial completo'                    },
    { label: 'Completadas',      value: resumen.totalCompletadas, icon: CheckCircle, color: 'bg-emerald-500', sub: `${resumen.tasaAsistencia}% tasa asistencia` },
    { label: 'Canceladas',       value: resumen.totalCanceladas,  icon: XCircle,     color: 'bg-red-500',     sub: 'Total histórico'                        },
    { label: 'Pacientes únicos', value: resumen.pacientesUnicos,  icon: Users,       color: 'bg-indigo-500',  sub: 'Atendidos'                              },
  ]

  const tasaColor = resumen.tasaAsistencia >= 80 ? 'text-emerald-600' :
                    resumen.tasaAsistencia >= 60 ? 'text-yellow-600' : 'text-red-600'
  const tasaBg    = resumen.tasaAsistencia >= 80 ? 'bg-emerald-50 border-emerald-100' :
                    resumen.tasaAsistencia >= 60 ? 'bg-yellow-50 border-yellow-100' : 'bg-red-50 border-red-100'

  return (
    <DoctorLayout>
      <div className="page-enter">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
            <TrendingUp size={20} className="text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Mis Estadísticas</h1>
            <p className="text-slate-400 text-sm mt-0.5">Resumen de tu rendimiento médico</p>
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
              <p className="text-xs text-slate-400 mt-1 truncate">{t.sub}</p>
            </div>
          ))}
        </div>

        {/* Tasa + Resumen del mes */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">

          {/* Tasa de asistencia */}
          <div className={`bg-white rounded-2xl border p-5 flex items-center gap-4 ${tasaBg}`}>
            <div className="relative w-16 h-16 flex-shrink-0">
              <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r="26" fill="none" stroke="#e2e8f0" strokeWidth="6" />
                <circle cx="32" cy="32" r="26" fill="none"
                  stroke={resumen.tasaAsistencia >= 80 ? '#10b981' : resumen.tasaAsistencia >= 60 ? '#f59e0b' : '#ef4444'}
                  strokeWidth="6"
                  strokeDasharray={`${(resumen.tasaAsistencia / 100) * 163} 163`}
                  strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-xs font-bold ${tasaColor}`}>{resumen.tasaAsistencia}%</span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <Award size={14} className={tasaColor} />
                <p className="text-sm font-semibold text-slate-700">Tasa de asistencia</p>
              </div>
              <p className="text-xs text-slate-400">
                {resumen.totalCompletadas} completadas de {resumen.totalCitas - resumen.totalCanceladas} programadas
              </p>
              <p className={`text-xs font-medium mt-1 ${tasaColor}`}>
                {resumen.tasaAsistencia >= 80 ? '¡Excelente rendimiento!' :
                 resumen.tasaAsistencia >= 60 ? 'Rendimiento aceptable' : 'Necesita mejorar'}
              </p>
            </div>
          </div>

          {/* Resumen del mes */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Calendar size={15} className="text-slate-400" />
              <p className="text-sm font-semibold text-slate-700">
                {MESES[mesActual]} — Resumen del mes
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Total',       value: mes.total,       color: 'text-slate-800',   bg: 'bg-slate-50'   },
                { label: 'Completadas', value: mes.completadas, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                { label: 'Pendientes',  value: mes.pendientes,  color: 'text-yellow-600',  bg: 'bg-yellow-50'  },
                { label: 'Canceladas',  value: mes.canceladas,  color: 'text-red-600',     bg: 'bg-red-50'     },
              ].map((s, i) => (
                <div key={i} className={`${s.bg} rounded-xl p-3 text-center`}>
                  <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
              <p className="text-xs text-slate-400">Ingresos del mes</p>
              <p className="text-sm font-bold text-blue-600">S/ {resumen.ingresosMes.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Gráfico anual */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 md:p-6 mb-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <TrendingUp size={15} className="text-slate-400" />
              <p className="text-sm font-semibold text-slate-700">Evolución anual</p>
            </div>
            <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
              <button onClick={() => setGraficoBarra('citas')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${graficoBarra === 'citas' ? 'bg-white shadow-sm text-slate-700' : 'text-slate-400 hover:text-slate-600'}`}>
                Citas
              </button>
              <button onClick={() => setGraficoBarra('ingresos')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${graficoBarra === 'ingresos' ? 'bg-white shadow-sm text-slate-700' : 'text-slate-400 hover:text-slate-600'}`}>
                Ingresos
              </button>
            </div>
          </div>

          {graficoBarra === 'citas' ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={graficoFiltrado} barSize={24}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', fontSize: 12 }} cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="citas" name="Total citas" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                <Bar dataKey="completadas" name="Completadas" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={graficoFiltrado}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', fontSize: 12 }} formatter={(v) => [`S/ ${v.toFixed(2)}`, 'Ingresos']} />
                <Line type="monotone" dataKey="ingresos" stroke="#3b82f6" strokeWidth={2.5} dot={{ fill: '#3b82f6', r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          )}

          <div className="flex items-center gap-4 mt-3 justify-center">
            {graficoBarra === 'citas' ? (
              <>
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-blue-500" /><span className="text-xs text-slate-400">Total citas</span></div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-emerald-500" /><span className="text-xs text-slate-400">Completadas</span></div>
              </>
            ) : (
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-blue-500" /><span className="text-xs text-slate-400">Ingresos (S/)</span></div>
            )}
          </div>
        </div>

        {/* Distribución por estado */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 md:p-6">
          <div className="flex items-center gap-2 mb-5">
            <Clock size={15} className="text-slate-400" />
            <p className="text-sm font-semibold text-slate-700">Distribución por estado (histórico)</p>
          </div>
          <div className="space-y-3">
            {citasPorEstado.map((c) => {
              const pct = resumen.totalCitas > 0 ? Math.round((c.total / resumen.totalCitas) * 100) : 0
              const colores = {
                PENDIENTE:  { bar: 'bg-yellow-400',  text: 'text-yellow-700',  bg: 'bg-yellow-50'  },
                CONFIRMADA: { bar: 'bg-blue-400',    text: 'text-blue-700',    bg: 'bg-blue-50'    },
                COMPLETADA: { bar: 'bg-emerald-400', text: 'text-emerald-700', bg: 'bg-emerald-50' },
                CANCELADA:  { bar: 'bg-red-400',     text: 'text-red-700',     bg: 'bg-red-50'     },
              }
              const cfg = colores[c.estado] || colores.PENDIENTE
              return (
                <div key={c.estado} className="flex items-center gap-3">
                  <span className={`text-xs font-medium w-20 sm:w-24 flex-shrink-0 ${cfg.text}`}>{c.estado}</span>
                  <div className="flex-1 bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div className={`h-full rounded-full ${cfg.bar} transition-all duration-500`} style={{ width: `${pct}%` }} />
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-slate-400 w-8 text-right">{pct}%</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${cfg.bg} ${cfg.text}`}>{c.total}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

      </div>
    </DoctorLayout>
  )
}