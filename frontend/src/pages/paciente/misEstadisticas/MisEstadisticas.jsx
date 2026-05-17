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
      <div className="flex flex-col items-center justify-center gap-3 py-24">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-[#00CCA5] border-t-transparent" />
        <p className="text-sm text-slate-400">Cargando estadísticas...</p>
      </div>
    </PacienteLayout>
  )

  const { resumen, graficoMensual, citasPorEstado, ultimasCompletadas } = stats

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
      sub: 'Consultas realizadas'
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
      label: 'Doctores visitados',
      value: resumen.doctoresUnicos,
      icon: Users,
      color: 'bg-[#0EA5E9]',
      soft: 'bg-sky-50',
      text: 'text-sky-600',
      sub: 'Especialistas únicos'
    },
  ]

  const coloresEstado = {
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

  return (
    <PacienteLayout>
      <div className="page-enter">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-black tracking-tight text-slate-950 md:text-3xl">
            Mis Estadísticas
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Revisa el resumen de tus citas, consultas completadas y actividad médica.
          </p>
        </div>

        {/* Tarjetas */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {tarjetas.map((t, i) => (
            <div
              key={i}
              className="group rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_50px_rgba(15,23,42,0.08)]"
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl ${t.color} shadow-lg shadow-slate-200/80`}>
                  <t.icon size={20} className="text-white" />
                </div>

                <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${t.soft}`}>
                  <TrendingUp size={15} className={t.text} />
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

        {/* Gráfico + Distribución */}
        <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Gráfico anual */}
          <div className="rounded-[2rem] border border-slate-200/80 bg-white p-5 shadow-sm md:p-6 lg:col-span-2">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-[#000089]/10">
                  <TrendingUp size={18} className="text-[#000089]" />
                </div>

                <div>
                  <p className="text-base font-black text-slate-900">
                    Mis citas este año
                  </p>
                  <p className="text-xs text-slate-400">
                    Evolución mensual de tu actividad médica.
                  </p>
                </div>
              </div>

              <div className="flex w-fit gap-1 rounded-2xl border border-slate-200 bg-slate-50 p-1">
                <button
                  onClick={() => setGraficoBarra('citas')}
                  className={`rounded-xl px-4 py-2 text-xs font-black transition-all ${
                    graficoBarra === 'citas'
                      ? 'bg-white text-[#000089] shadow-sm'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Total
                </button>

                <button
                  onClick={() => setGraficoBarra('completadas')}
                  className={`rounded-xl px-4 py-2 text-xs font-black transition-all ${
                    graficoBarra === 'completadas'
                      ? 'bg-white text-[#008f78] shadow-sm'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Completadas
                </button>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={graficoMensual} barSize={26}>
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
                    fontSize: 12,
                    fontWeight: 700,
                    boxShadow: '0 18px 50px rgba(15,23,42,0.10)'
                  }}
                  cursor={{ fill: '#f8fafc' }}
                />
                <Bar
                  dataKey={graficoBarra}
                  name={graficoBarra === 'citas' ? 'Total citas' : 'Completadas'}
                  fill={graficoBarra === 'citas' ? '#000089' : '#00CCA5'}
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Distribución por estado */}
          <div className="rounded-[2rem] border border-slate-200/80 bg-white p-5 shadow-sm md:p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-[#00CCA5]/10">
                <Clock size={18} className="text-[#008f78]" />
              </div>

              <div>
                <p className="text-base font-black text-slate-900">
                  Por estado
                </p>
                <p className="text-xs text-slate-400">
                  Distribución general de tus citas.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {citasPorEstado.map((c) => {
                const pct = resumen.totalCitas > 0 ? Math.round((c.total / resumen.totalCitas) * 100) : 0
                const cfg = coloresEstado[c.estado] || coloresEstado.PENDIENTE

                return (
                  <div key={c.estado} className="space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <span className={`truncate text-xs font-black ${cfg.text}`}>
                        {c.estado}
                      </span>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-400">
                          {pct}%
                        </span>

                        <span className={`rounded-xl px-2.5 py-1 text-xs font-black ${cfg.bg} ${cfg.text}`}>
                          {c.total}
                        </span>
                      </div>
                    </div>

                    <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
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

        {/* Últimas consultas */}
        <div className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-5 md:flex-row md:items-center md:justify-between md:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-[#00CCA5]/10">
                <Stethoscope size={18} className="text-[#008f78]" />
              </div>

              <div>
                <p className="text-base font-black text-slate-900">
                  Últimas consultas completadas
                </p>
                <p className="text-xs text-slate-400">
                  Atenciones médicas finalizadas recientemente.
                </p>
              </div>
            </div>

            <span className="w-fit rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-500">
              {ultimasCompletadas.length} consulta{ultimasCompletadas.length !== 1 ? 's' : ''}
            </span>
          </div>

          {ultimasCompletadas.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 px-6 py-14">
              <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-slate-100">
                <Stethoscope size={24} className="text-slate-400" />
              </div>

              <div className="text-center">
                <p className="text-sm font-black text-slate-700">
                  Sin consultas completadas aún
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Cuando finalice una atención, aparecerá en esta sección.
                </p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {ultimasCompletadas.map(cita => (
                <div
                  key={cita.id}
                  className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-slate-50/70 md:px-6"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[#00CCA5]/20 bg-[#00CCA5]/10">
                      {cita.doctor.foto ? (
                        <img
                          src={cita.doctor.foto}
                          className="h-full w-full object-cover"
                          alt=""
                        />
                      ) : (
                        <span className="text-xs font-black text-[#008f78]">
                          {cita.doctor.usuario.nombre[0]}
                          {cita.doctor.usuario.apellido[0]}
                        </span>
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-black text-slate-800">
                        Dr. {cita.doctor.usuario.nombre} {cita.doctor.usuario.apellido}
                      </p>

                      <p className="mt-0.5 truncate text-xs font-medium text-slate-400">
                        {cita.servicio.nombre} · {formatFecha(cita.fecha)}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-shrink-0 items-center gap-2">
                    {cita.nota && (
                      <span className="hidden rounded-2xl border border-[#00CCA5]/20 bg-[#00CCA5]/10 px-3 py-1.5 text-xs font-black text-[#008f78] sm:inline-flex">
                        Con nota clínica
                      </span>
                    )}

                    <span className="rounded-2xl bg-[#00CCA5]/10 px-3 py-1.5 text-xs font-black text-[#008f78]">
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