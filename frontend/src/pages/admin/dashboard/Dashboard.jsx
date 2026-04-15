import { useState, useEffect } from 'react'
import { Users, Stethoscope, Calendar, Activity, TrendingUp, DollarSign, ArrowUpRight, Clock } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts'
import { toast } from 'sonner'
import AdminLayout from '../../../components/AdminLayout'
import api from '../../../services/api'

const estadoConfig = {
  PENDIENTE:  { label: 'Pendiente',  color: '#f59e0b' },
  CONFIRMADA: { label: 'Confirmada', color: '#3b82f6' },
  COMPLETADA: { label: 'Completada', color: '#10b981' },
  CANCELADA:  { label: 'Cancelada',  color: '#ef4444' },
}

const estadoBadge = {
  PENDIENTE:  { bg: 'bg-yellow-50',  text: 'text-yellow-700',  dot: 'bg-yellow-400'  },
  CONFIRMADA: { bg: 'bg-blue-50',    text: 'text-blue-700',    dot: 'bg-blue-400'    },
  COMPLETADA: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-400' },
  CANCELADA:  { bg: 'bg-red-50',     text: 'text-red-700',     dot: 'bg-red-400'     },
}

const ordenEstados = ['PENDIENTE', 'CONFIRMADA', 'COMPLETADA', 'CANCELADA']

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 text-white px-3 py-2 rounded-lg text-xs shadow-xl">
        <p className="font-medium">{label}</p>
        <p className="text-blue-400">{payload[0].value} citas</p>
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
        // Llamadas paralelas — estadísticas y citas de hoy por separado
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

  if (loading) return (
    <AdminLayout>
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Cargando dashboard...</p>
        </div>
      </div>
    </AdminLayout>
  )

  const tarjetas = [
    { label: 'Doctores',         value: stats?.totales.doctores,    icon: Stethoscope, iconBg: 'bg-blue-500',   trend: 'Personal médico activo'  },
    { label: 'Pacientes',        value: stats?.totales.pacientes,   icon: Users,       iconBg: 'bg-indigo-500', trend: 'Pacientes registrados'   },
    { label: 'Citas totales',    value: stats?.totales.citas,       icon: Calendar,    iconBg: 'bg-cyan-500',   trend: 'Historial completo'      },
    { label: 'Citas este mes',   value: stats?.totales.citasMes,    icon: TrendingUp,  iconBg: 'bg-violet-500', trend: 'Mes actual'              },
    { label: 'Servicios activos',value: stats?.totales.servicios,   icon: Activity,    iconBg: 'bg-rose-500',   trend: 'Disponibles'             },
    { label: 'Ingresos del mes', value: `S/ ${stats?.totales.ingresosMes?.toFixed(2) || '0.00'}`, icon: DollarSign, iconBg: 'bg-emerald-500', trend: 'Facturación mensual' },
  ]

  const pieData = ordenEstados
    .map(estado => {
      const encontrado = stats?.citasPorEstado.find(c => c.estado === estado)
      return { name: estadoConfig[estado].label, value: encontrado?.total || 0, color: estadoConfig[estado].color }
    })
    .filter(d => d.value > 0)

  return (
    <AdminLayout>
      <div className="page-enter">

        {/* Header */}
        <div className="mb-5 md:mb-8">
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">Resumen general del sistema clínico</p>
        </div>

        {/* Tarjetas */}
        <div className="grid grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
          {tarjetas.map((t, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
              <div className={`w-12 h-12 ${t.iconBg} rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm`}>
                <t.icon size={20} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-slate-400 text-xs font-medium truncate">{t.label}</p>
                <p className="text-2xl font-bold text-slate-800 leading-tight">{t.value}</p>
                <p className="text-slate-400 text-xs mt-0.5">{t.trend}</p>
              </div>
              <ArrowUpRight size={16} className="text-slate-300 flex-shrink-0" />
            </div>
          ))}
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">

          {/* Barras */}
          <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-base font-semibold text-slate-800">Citas por mes</h2>
                <p className="text-slate-400 text-xs mt-0.5">Actividad del año en curso — por fecha real de cita</p>
              </div>
              <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-medium rounded-full">
                {new Date().getFullYear()}
              </span>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stats?.citasMensuales} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="citas" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Dona */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6">
            <div className="mb-6">
              <h2 className="text-base font-semibold text-slate-800">Estado de citas</h2>
              <p className="text-slate-400 text-xs mt-0.5">Distribución histórica</p>
            </div>
            {pieData && pieData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80}
                      paddingAngle={4} dataKey="value" strokeWidth={0}>
                      {pieData.map((item, index) => (
                        <Cell key={index} fill={item.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '8px', color: 'white', fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-2">
                  {pieData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: item.color }} />
                        <span className="text-xs text-slate-600">{item.name}</span>
                      </div>
                      <span className="text-xs font-semibold text-slate-800">{item.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 gap-2">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                  <Calendar size={20} className="text-slate-400" />
                </div>
                <p className="text-slate-400 text-sm">Sin datos disponibles</p>
              </div>
            )}
          </div>
        </div>

        {/* Citas de hoy — usa /citas/hoy para tener TODOS los estados */}
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                <Clock size={15} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700">Citas de hoy</p>
                <p className="text-xs text-slate-400 capitalize">
                  {new Date().toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' })}
                </p>
              </div>
            </div>
            <span className="text-xs font-medium text-slate-500">
              {citasHoy.length} {citasHoy.length === 1 ? 'cita' : 'citas'}
            </span>
          </div>

          {citasHoy.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center">
                <Calendar size={20} className="text-slate-400" />
              </div>
              <p className="text-slate-500 font-medium text-sm">Sin citas para hoy</p>
              <p className="text-slate-400 text-xs">No hay citas programadas para hoy</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Hora</th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Paciente</th>
                    <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Doctor</th>
                    <th className="hidden sm:table-cell px-4 md:px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Servicio</th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {citasHoy.map((cita) => {
                    const badge = estadoBadge[cita.estado] || estadoBadge.CONFIRMADA
                    return (
                      <tr key={cita.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-4 md:px-6 py-4">
                          <span className="text-sm font-semibold text-slate-700 font-mono">
                            {new Date(cita.fecha).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </td>
                        <td className="px-4 md:px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0">
                              <span className="text-indigo-600 text-xs font-bold">
                                {cita.paciente.usuario.nombre[0]}{cita.paciente.usuario.apellido[0]}
                              </span>
                            </div>
                            <span className="text-sm text-slate-700 font-medium truncate max-w-[120px] md:max-w-none">
                              {cita.paciente.usuario.nombre} {cita.paciente.usuario.apellido}
                            </span>
                          </div>
                        </td>
                        <td className="hidden md:table-cell px-6 py-4">
                          <span className="text-sm text-slate-500">
                            Dr. {cita.doctor.usuario.nombre} {cita.doctor.usuario.apellido}
                          </span>
                        </td>
                        <td className="hidden sm:table-cell px-4 md:px-6 py-4">
                          <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-lg">
                            {cita.servicio.nombre}
                          </span>
                        </td>
                        <td className="px-4 md:px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${badge.bg} ${badge.text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
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