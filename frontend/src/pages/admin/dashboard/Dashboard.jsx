import { useState, useEffect } from 'react'
import {
  Users,
  Stethoscope,
  Calendar,
  Activity,
  TrendingUp,
  DollarSign,
  ArrowUpRight,
  Clock,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { toast } from 'sonner'
import AdminLayout from '../../../components/AdminLayout'
import api from '../../../services/api'

const BRAND = {
  primary: '#000089',
  accent: '#00CCA5',
  accentDark: '#008f78',
  sky: '#0EA5E9'
}

const estadoConfig = {
  PENDIENTE: { label: 'Pendiente', color: '#f59e0b' },
  CONFIRMADA: { label: 'Confirmada', color: BRAND.primary },
  COMPLETADA: { label: 'Completada', color: BRAND.accent },
  CANCELADA: { label: 'Cancelada', color: '#ef4444' }
}

const estadoBadge = {
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
    dot: 'bg-red-400'
  }
}

const ordenEstados = ['PENDIENTE', 'CONFIRMADA', 'COMPLETADA', 'CANCELADA']

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-2xl bg-slate-950 px-4 py-3 text-xs text-white shadow-2xl">
        <p className="font-bold">{label}</p>
        <p className="mt-1 text-[#00CCA5]">{payload[0].value} citas</p>
      </div>
    )
  }

  return null
}

const PieTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const item = payload[0]

    return (
      <div className="rounded-2xl bg-slate-950 px-4 py-3 text-xs text-white shadow-2xl">
        <div className="flex items-center gap-2">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: item.payload.color }}
          />
          <span className="font-bold">
            {item.name}: {item.value}
          </span>
        </div>
      </div>
    )
  }

  return null
}

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [citasHoy, setCitasHoy] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resStats, resCitasHoy] = await Promise.all([
          api.get('/estadisticas'),
          api.get('/citas/hoy')
        ])

        setStats(resStats.data)
        setCitasHoy(resCitasHoy.data)
      } catch {
        toast.error('Error al cargar las estadísticas')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex h-64 items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-9 w-9 animate-spin rounded-full border-2 border-[#00CCA5] border-t-transparent" />
            <p className="text-sm text-slate-400">Cargando dashboard...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  const tarjetas = [
    {
      label: 'Doctores',
      value: stats?.totales.doctores,
      icon: Stethoscope,
      iconBg: 'bg-[#000089]',
      softBg: 'bg-[#000089]/10',
      iconText: 'text-[#000089]',
      trend: 'Personal médico activo'
    },
    {
      label: 'Pacientes',
      value: stats?.totales.pacientes,
      icon: Users,
      iconBg: 'bg-[#00A98A]',
      softBg: 'bg-[#00CCA5]/10',
      iconText: 'text-[#008f78]',
      trend: 'Pacientes registrados'
    },
    {
      label: 'Citas totales',
      value: stats?.totales.citas,
      icon: Calendar,
      iconBg: 'bg-[#0EA5E9]',
      softBg: 'bg-sky-50',
      iconText: 'text-sky-600',
      trend: 'Historial completo'
    },
    {
      label: 'Citas este mes',
      value: stats?.totales.citasMes,
      icon: TrendingUp,
      iconBg: 'bg-[#000089]',
      softBg: 'bg-[#000089]/10',
      iconText: 'text-[#000089]',
      trend: 'Mes actual'
    },
    {
      label: 'Servicios activos',
      value: stats?.totales.servicios,
      icon: Activity,
      iconBg: 'bg-[#00CCA5]',
      softBg: 'bg-[#00CCA5]/10',
      iconText: 'text-[#008f78]',
      trend: 'Disponibles'
    },
    {
      label: 'Ingresos del mes',
      value: `S/ ${stats?.totales.ingresosMes?.toFixed(2) || '0.00'}`,
      icon: DollarSign,
      iconBg: 'bg-emerald-500',
      softBg: 'bg-emerald-50',
      iconText: 'text-emerald-600',
      trend: 'Facturación mensual'
    }
  ]

  const pieData = ordenEstados
    .map((estado) => {
      const encontrado = stats?.citasPorEstado.find((c) => c.estado === estado)

      return {
        name: estadoConfig[estado].label,
        value: encontrado?.total || 0,
        color: estadoConfig[estado].color
      }
    })
    .filter((d) => d.value > 0)

  return (
    <AdminLayout>
      <div className="page-enter">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 md:mb-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-950 md:text-3xl">
              Dashboard Administrativo
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              Resumen operativo del sistema clínico.
            </p>
          </div>
        </div>

        {/* Tarjetas */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {tarjetas.map((t, i) => (
            <div
              key={i}
              className="group flex items-center gap-4 rounded-3xl border border-slate-200/70 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_50px_rgba(15,23,42,0.08)]"
            >
              <div
                className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl ${t.iconBg} shadow-lg shadow-slate-200/80`}
              >
                <t.icon size={20} className="text-white" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold text-slate-400">
                  {t.label}
                </p>

                <p className="text-2xl font-black leading-tight text-slate-900">
                  {t.value}
                </p>

                <p className="mt-0.5 text-xs text-slate-400">{t.trend}</p>
              </div>

              <div
                className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl ${t.softBg} opacity-70 transition group-hover:opacity-100`}
              >
                <ArrowUpRight size={15} className={t.iconText} />
              </div>
            </div>
          ))}
        </div>

        {/* Gráficos */}
        <div className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
          {/* Barras */}
          <div className="rounded-3xl border border-slate-200/70 bg-white p-6 shadow-sm xl:col-span-2">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-black text-slate-900">
                  Citas por mes
                </h2>
                <p className="mt-0.5 text-xs text-slate-400">
                  Actividad del año en curso — por fecha real de cita
                </p>
              </div>

              <span className="rounded-full bg-[#00CCA5]/10 px-3 py-1 text-xs font-black text-[#008f78]">
                {new Date().getFullYear()}
              </span>
            </div>

            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stats?.citasMensuales} barSize={30}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#f1f5f9"
                  vertical={false}
                />
                <XAxis
                  dataKey="mes"
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: '#f8fafc' }}
                />
                <Bar
                  dataKey="citas"
                  fill={BRAND.primary}
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Dona */}
          <div className="rounded-3xl border border-slate-200/70 bg-white p-6 shadow-sm">
            <div className="mb-8">
              <h2 className="text-base font-black text-slate-900">
                Estado de citas
              </h2>
              <p className="mt-0.5 text-xs text-slate-400">
                Distribución histórica
              </p>
            </div>

            {pieData && pieData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={190}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={58}
                      outerRadius={82}
                      paddingAngle={4}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {pieData.map((item, index) => (
                        <Cell key={index} fill={item.color} />
                      ))}
                    </Pie>

                    <Tooltip content={<PieTooltip />} />

                  </PieChart>
                </ResponsiveContainer>

                <div className="mt-3 space-y-2">
                  {pieData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
                          style={{ background: item.color }}
                        />
                        <span className="text-xs font-medium text-slate-600">
                          {item.name}
                        </span>
                      </div>

                      <span className="text-xs font-black text-slate-900">
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex h-48 flex-col items-center justify-center gap-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
                  <Calendar size={20} className="text-slate-400" />
                </div>
                <p className="text-sm text-slate-400">Sin datos disponibles</p>
              </div>
            )}
          </div>
        </div>

        {/* Citas de hoy */}
        <div className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-100 px-6 py-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#00CCA5]/10">
                <Clock size={18} className="text-[#008f78]" />
              </div>

              <div>
                <p className="text-base font-black text-slate-900">Citas de hoy</p>
                <p className="text-xs capitalize text-slate-400">
                  {new Date().toLocaleDateString('es-PE', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long'
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-500">
                Agenda diaria
              </span>

              <span className="rounded-full bg-[#000089]/10 px-3 py-1 text-xs font-black text-[#000089]">
                {citasHoy.length} {citasHoy.length === 1 ? 'cita' : 'citas'}
              </span>
            </div>
          </div>

          {citasHoy.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 px-6 py-14">
              <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-slate-100">
                <Calendar size={22} className="text-slate-400" />
              </div>

              <div className="text-center">
                <p className="text-sm font-black text-slate-700">
                  No hay citas programadas para hoy
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Cuando existan citas agendadas, aparecerán aquí.
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px]">
                <thead>
                  <tr className="bg-slate-50/80">
                    <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">
                      Hora
                    </th>
                    <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">
                      Paciente
                    </th>
                    <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">
                      Doctor
                    </th>
                    <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">
                      Servicio
                    </th>
                    <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">
                      Estado
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {citasHoy.map((cita) => {
                    const badge = estadoBadge[cita.estado] || estadoBadge.CONFIRMADA

                    return (
                      <tr
                        key={cita.id}
                        className="transition-all duration-150 hover:bg-slate-50/70"
                      >
                        <td className="px-6 py-4 align-middle">
                          <div className="inline-flex rounded-2xl bg-slate-100 px-3 py-1.5">
                            <span className="font-mono text-sm font-black text-slate-700">
                              {new Date(cita.fecha).toLocaleTimeString('es-PE', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-4 align-middle">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-[#00CCA5]/10">
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
                                Paciente registrado
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4 align-middle">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-slate-700">
                              Dr. {cita.doctor.usuario.nombre}{' '}
                              {cita.doctor.usuario.apellido}
                            </p>
                            <p className="text-xs text-slate-400">
                              Profesional asignado
                            </p>
                          </div>
                        </td>

                        <td className="px-6 py-4 align-middle">
                          <span className="inline-flex rounded-2xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-600">
                            {cita.servicio.nombre}
                          </span>
                        </td>

                        <td className="px-6 py-4 align-middle">
                          <span
                            className={`inline-flex items-center gap-2 rounded-2xl px-3 py-1.5 text-xs font-black ${badge.bg} ${badge.text}`}
                          >
                            <span className={`h-2 w-2 rounded-full ${badge.dot}`} />
                            {cita.estado}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}