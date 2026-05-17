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
      <div className="flex flex-col items-center justify-center gap-3 py-24">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-[#00CCA5] border-t-transparent" />
        <p className="text-sm text-slate-400">Cargando estadísticas...</p>
      </div>
    </DoctorLayout>
  )

  const { resumen, mes, graficoMensual, citasPorEstado } = stats
  const graficoFiltrado = graficoMensual.slice(0, mesActual + 1)

  const tarjetas = [
    {
      label: 'Total citas',
      value: resumen.totalCitas,
      icon: Calendar,
      color: 'bg-[#000089]',
      soft: 'bg-[#000089]/10',
      text: 'text-[#000089]',
      sub: 'Historial completo'
    },
    {
      label: 'Completadas',
      value: resumen.totalCompletadas,
      icon: CheckCircle,
      color: 'bg-[#00A98A]',
      soft: 'bg-[#00CCA5]/10',
      text: 'text-[#008f78]',
      sub: `${resumen.tasaAsistencia}% tasa asistencia`
    },
    {
      label: 'Canceladas',
      value: resumen.totalCanceladas,
      icon: XCircle,
      color: 'bg-red-500',
      soft: 'bg-red-50',
      text: 'text-red-600',
      sub: 'Total histórico'
    },
    {
      label: 'Pacientes únicos',
      value: resumen.pacientesUnicos,
      icon: Users,
      color: 'bg-[#0EA5E9]',
      soft: 'bg-sky-50',
      text: 'text-sky-600',
      sub: 'Atendidos'
    },
  ]

  const tasaColor = resumen.tasaAsistencia >= 80 ? 'text-[#008f78]' :
                    resumen.tasaAsistencia >= 60 ? 'text-amber-600' : 'text-red-600'
  const tasaBg    = resumen.tasaAsistencia >= 80 ? 'bg-[#00CCA5]/10 border-[#00CCA5]/20' :
                    resumen.tasaAsistencia >= 60 ? 'bg-amber-50 border-amber-100' : 'bg-red-50 border-red-100'

  return (
    <DoctorLayout>
      <div className="page-enter">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-950 md:text-3xl">
              Mis Estadísticas
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              Analiza tu rendimiento médico, asistencia, citas e ingresos generados.
            </p>
          </div>

          <div className="inline-flex w-fit items-center gap-2 rounded-2xl border border-[#00CCA5]/20 bg-[#00CCA5]/10 px-4 py-2">
            <span className="h-2 w-2 rounded-full bg-[#00CCA5]" />
            <span className="text-xs font-black text-[#008f78]">
              Reporte actualizado
            </span>
          </div>
        </div>

        {/* Tarjetas */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {tarjetas.map((t, i) => (
            <div
              key={i}
              className="group rounded-3xl border border-slate-200/70 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_50px_rgba(15,23,42,0.08)]"
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl ${t.color} shadow-lg shadow-slate-200/80`}>
                  <t.icon size={20} className="text-white" />
                </div>

                <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${t.soft}`}>
                  <TrendingUp size={14} className={t.text} />
                </div>
              </div>

              <p className="text-xs font-bold text-slate-400">
                {t.label}
              </p>

              <p className="mt-1 text-3xl font-black leading-tight text-slate-900">
                {t.value}
              </p>

              <p className="mt-1 truncate text-xs text-slate-400">
                {t.sub}
              </p>
            </div>
          ))}
        </div>

        {/* Tasa + Resumen del mes */}
        <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Tasa de asistencia */}
          <div className={`rounded-[2rem] border bg-white p-5 shadow-sm ${tasaBg}`}>
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <Award size={16} className={tasaColor} />
                  <p className="text-sm font-black text-slate-900">
                    Tasa de asistencia
                  </p>
                </div>

                <p className="text-xs leading-relaxed text-slate-500">
                  {resumen.totalCompletadas} completadas de {resumen.totalCitas - resumen.totalCanceladas} programadas
                </p>

                <p className={`mt-2 text-xs font-black ${tasaColor}`}>
                  {resumen.tasaAsistencia >= 80 ? 'Excelente rendimiento' :
                   resumen.tasaAsistencia >= 60 ? 'Rendimiento aceptable' : 'Necesita mejorar'}
                </p>
              </div>

              <div className="relative flex h-20 w-20 flex-shrink-0 items-center justify-center">
                <svg className="h-20 w-20 -rotate-90" viewBox="0 0 64 64">
                  <circle
                    cx="32"
                    cy="32"
                    r="26"
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth="6"
                  />
                  <circle
                    cx="32"
                    cy="32"
                    r="26"
                    fill="none"
                    stroke={resumen.tasaAsistencia >= 80 ? '#00CCA5' : resumen.tasaAsistencia >= 60 ? '#f59e0b' : '#ef4444'}
                    strokeWidth="6"
                    strokeDasharray={`${(resumen.tasaAsistencia / 100) * 163} 163`}
                    strokeLinecap="round"
                  />
                </svg>

                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-sm font-black ${tasaColor}`}>
                    {resumen.tasaAsistencia}%
                  </span>
                </div>
              </div>
            </div>

            <div className="h-2.5 overflow-hidden rounded-full bg-white/70">
              <div
                className={`h-full rounded-full ${
                  resumen.tasaAsistencia >= 80
                    ? 'bg-[#00CCA5]'
                    : resumen.tasaAsistencia >= 60
                      ? 'bg-amber-400'
                      : 'bg-red-500'
                }`}
                style={{ width: `${resumen.tasaAsistencia}%` }}
              />
            </div>
          </div>

          {/* Resumen del mes */}
          <div className="rounded-[2rem] border border-slate-200/80 bg-white p-5 shadow-sm lg:col-span-2">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#000089]/10">
                  <Calendar size={18} className="text-[#000089]" />
                </div>

                <div>
                  <p className="text-base font-black text-slate-900">
                    {MESES[mesActual]} — Resumen del mes
                  </p>
                  <p className="text-xs text-slate-400">
                    Actividad médica mensual.
                  </p>
                </div>
              </div>

              <span className="w-fit rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-500">
                Mes actual
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { label: 'Total', value: mes.total, color: 'text-slate-900', bg: 'bg-slate-50' },
                { label: 'Completadas', value: mes.completadas, color: 'text-[#008f78]', bg: 'bg-[#00CCA5]/10' },
                { label: 'Pendientes', value: mes.pendientes, color: 'text-amber-600', bg: 'bg-amber-50' },
                { label: 'Canceladas', value: mes.canceladas, color: 'text-red-600', bg: 'bg-red-50' },
              ].map((s, i) => (
                <div
                  key={i}
                  className={`${s.bg} rounded-3xl px-4 py-4 text-center`}
                >
                  <p className={`text-2xl font-black ${s.color}`}>
                    {s.value}
                  </p>
                  <p className="mt-0.5 text-xs font-bold text-slate-400">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
              <p className="text-xs font-bold text-slate-400">
                Ingresos del mes
              </p>
              <p className="text-lg font-black text-[#000089]">
                S/ {resumen.ingresosMes.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Gráfico anual */}
        <div className="mb-6 rounded-[2rem] border border-slate-200/80 bg-white p-5 shadow-sm md:p-6">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#00CCA5]/10">
                <TrendingUp size={18} className="text-[#008f78]" />
              </div>

              <div>
                <p className="text-base font-black text-slate-900">
                  Evolución anual
                </p>
                <p className="text-xs text-slate-400">
                  Comparativo mensual hasta el mes actual.
                </p>
              </div>
            </div>

            <div className="flex w-fit gap-1 rounded-2xl bg-slate-100 p-1">
              <button
                onClick={() => setGraficoBarra('citas')}
                className={`rounded-xl px-4 py-2 text-xs font-black transition-all ${
                  graficoBarra === 'citas'
                    ? 'bg-white text-[#000089] shadow-sm'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                Citas
              </button>

              <button
                onClick={() => setGraficoBarra('ingresos')}
                className={`rounded-xl px-4 py-2 text-xs font-black transition-all ${
                  graficoBarra === 'ingresos'
                    ? 'bg-white text-[#000089] shadow-sm'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                Ingresos
              </button>
            </div>
          </div>

          <div className="h-[240px]">
            {graficoBarra === 'citas' ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={graficoFiltrado} barSize={26}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="mes"
                    tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 700 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 700 }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '16px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 18px 40px rgba(15,23,42,0.12)',
                      fontSize: 12,
                      fontWeight: 700
                    }}
                    cursor={{ fill: '#f8fafc' }}
                  />
                  <Bar dataKey="citas" name="Total citas" fill="#000089" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="completadas" name="Completadas" fill="#00CCA5" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={graficoFiltrado}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="mes"
                    tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 700 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 700 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '16px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 18px 40px rgba(15,23,42,0.12)',
                      fontSize: 12,
                      fontWeight: 700
                    }}
                    formatter={(v) => [`S/ ${v.toFixed(2)}`, 'Ingresos']}
                  />
                  <Line
                    type="monotone"
                    dataKey="ingresos"
                    stroke="#000089"
                    strokeWidth={3}
                    dot={{ fill: '#00CCA5', stroke: '#ffffff', strokeWidth: 2, r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="mt-4 flex items-center justify-center gap-5">
            {graficoBarra === 'citas' ? (
              <>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded bg-[#000089]" />
                  <span className="text-xs font-bold text-slate-400">Total citas</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded bg-[#00CCA5]" />
                  <span className="text-xs font-bold text-slate-400">Completadas</span>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded bg-[#000089]" />
                <span className="text-xs font-bold text-slate-400">Ingresos (S/)</span>
              </div>
            )}
          </div>
        </div>

        {/* Distribución por estado */}
        <div className="rounded-[2rem] border border-slate-200/80 bg-white p-5 shadow-sm md:p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#000089]/10">
              <Clock size={18} className="text-[#000089]" />
            </div>

            <div>
              <p className="text-base font-black text-slate-900">
                Distribución por estado
              </p>
              <p className="text-xs text-slate-400">
                Resumen histórico de citas por estado.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {citasPorEstado.map((c) => {
              const pct = resumen.totalCitas > 0 ? Math.round((c.total / resumen.totalCitas) * 100) : 0
              const colores = {
                PENDIENTE: {
                  bar: 'bg-amber-400',
                  text: 'text-amber-700',
                  bg: 'bg-amber-50'
                },
                CONFIRMADA: {
                  bar: 'bg-[#000089]',
                  text: 'text-[#000089]',
                  bg: 'bg-[#000089]/10'
                },
                COMPLETADA: {
                  bar: 'bg-[#00CCA5]',
                  text: 'text-[#008f78]',
                  bg: 'bg-[#00CCA5]/10'
                },
                CANCELADA: {
                  bar: 'bg-red-500',
                  text: 'text-red-700',
                  bg: 'bg-red-50'
                },
              }
              const cfg = colores[c.estado] || colores.PENDIENTE

              return (
                <div key={c.estado} className="rounded-3xl border border-slate-200/70 bg-slate-50/50 p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${cfg.bar}`} />
                      <span className={`text-xs font-black ${cfg.text}`}>
                        {c.estado}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-slate-400">
                        {pct}%
                      </span>
                      <span className={`rounded-2xl px-3 py-1 text-xs font-black ${cfg.bg} ${cfg.text}`}>
                        {c.total}
                      </span>
                    </div>
                  </div>

                  <div className="h-2.5 overflow-hidden rounded-full bg-white">
                    <div
                      className={`h-full rounded-full ${cfg.bar} transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
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