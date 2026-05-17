import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import {
  Calendar,
  Clock,
  CheckCircle,
  ArrowUpRight,
  Users,
  TrendingUp,
  Activity,
  Wallet,
  Stethoscope
} from 'lucide-react'
import DoctorLayout from '../../../components/DoctorLayout'
import api from '../../../services/api'
import { useAuth } from '../../../context/AuthContext'

const BRAND = {
  primary: '#000089',
  accent: '#00CCA5',
  accentDark: '#008f78',
  sky: '#0EA5E9'
}

const estadoColors = {
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
    dot: 'bg-red-500'
  }
}

const getHora = () => {
  const h = new Date().getHours()
  if (h < 12) return 'Buenos días'
  if (h < 18) return 'Buenas tardes'
  return 'Buenas noches'
}

const formatFecha = (fecha) => new Date(fecha).toLocaleString('es-PE', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
})

const formatHora = (fecha) => new Date(fecha).toLocaleTimeString('es-PE', {
  hour: '2-digit',
  minute: '2-digit'
})

const AvatarPaciente = ({ paciente }) => {
  const nombre = paciente.usuario.nombre
  const apellido = paciente.usuario.apellido

  return (
    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[#00CCA5]/20 bg-[#00CCA5]/10">
      {paciente.foto ? (
        <img
          src={paciente.foto}
          alt=""
          className="h-full w-full object-cover"
          onError={(e) => {
            e.target.style.display = 'none'
            e.target.parentNode.innerHTML = `<span class="text-[#008f78] text-xs font-black">${nombre[0]}${apellido[0]}</span>`
          }}
        />
      ) : (
        <span className="text-xs font-black text-[#008f78]">
          {nombre[0]}
          {apellido[0]}
        </span>
      )}
    </div>
  )
}

const EmptyState = ({ mensaje }) => (
  <div className="flex flex-col items-center justify-center gap-3 px-6 py-14">
    <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-slate-100">
      <Calendar size={22} className="text-slate-400" />
    </div>

    <div className="text-center">
      <p className="text-sm font-black text-slate-700">{mensaje}</p>
      <p className="mt-1 text-xs text-slate-400">
        Cuando existan registros disponibles, aparecerán aquí.
      </p>
    </div>
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
    {
      label: 'Citas hoy',
      value: stats?.citasHoy?.length ?? '—',
      icon: Calendar,
      iconBg: 'bg-[#000089]',
      softBg: 'bg-[#000089]/10',
      iconText: 'text-[#000089]',
      trend: 'Agenda del día'
    },
    {
      label: 'Pendientes',
      value: stats?.resumen?.totalPendientes ?? '—',
      icon: Clock,
      iconBg: 'bg-amber-500',
      softBg: 'bg-amber-50',
      iconText: 'text-amber-600',
      trend: 'Por confirmar o atender'
    },
    {
      label: 'Completadas',
      value: stats?.resumen?.totalCompletadas ?? '—',
      icon: CheckCircle,
      iconBg: 'bg-[#00A98A]',
      softBg: 'bg-[#00CCA5]/10',
      iconText: 'text-[#008f78]',
      trend: 'Atenciones realizadas'
    },
    {
      label: 'Pacientes únicos',
      value: stats?.resumen?.pacientesUnicos ?? '—',
      icon: Users,
      iconBg: 'bg-[#0EA5E9]',
      softBg: 'bg-sky-50',
      iconText: 'text-sky-600',
      trend: 'Pacientes atendidos'
    }
  ]

  return (
    <DoctorLayout>
      <div className="page-enter">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 md:mb-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-950 md:text-3xl">
              {getHora()}, Dr. {user?.nombre}
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              Resumen operativo de tu agenda médica y atenciones asignadas.
            </p>
          </div>

          {stats && (
            <div className="rounded-3xl border border-[#00CCA5]/20 bg-[#00CCA5]/10 px-5 py-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-sm">
                  <TrendingUp size={18} className="text-[#008f78]" />
                </div>

                <div>
                  <p className="text-xs font-black uppercase tracking-[0.12em] text-[#008f78]">
                    Tasa de asistencia
                  </p>
                  <p className="text-2xl font-black leading-tight text-[#008f78]">
                    {stats.resumen.tasaAsistencia}%
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tarjetas */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
                  {loading ? '—' : t.value}
                </p>

                <p className="mt-0.5 text-xs text-slate-400">{t.trend}</p>
              </div>

              <div
                className={`hidden h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl ${t.softBg} opacity-70 transition group-hover:opacity-100 sm:flex`}
              >
                <ArrowUpRight size={15} className={t.iconText} />
              </div>
            </div>
          ))}
        </div>

        {/* Stats del mes */}
        {stats && (
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            {[
              {
                label: 'Citas este mes',
                value: stats.mes.total,
                icon: Activity,
                bg: 'bg-[#000089]/10',
                text: 'text-[#000089]'
              },
              {
                label: 'Completadas el mes',
                value: stats.mes.completadas,
                icon: CheckCircle,
                bg: 'bg-[#00CCA5]/10',
                text: 'text-[#008f78]'
              },
              {
                label: 'Ingresos del mes',
                value: `S/ ${stats.resumen.ingresosMes.toFixed(2)}`,
                icon: Wallet,
                bg: 'bg-sky-50',
                text: 'text-sky-600'
              }
            ].map((s, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-3xl border border-slate-200/70 bg-white px-5 py-4 shadow-sm"
              >
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold text-slate-400">
                    {s.label}
                  </p>
                  <p className={`mt-1 truncate text-xl font-black ${s.text}`}>
                    {s.value}
                  </p>
                </div>

                <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${s.bg}`}>
                  <s.icon size={17} className={s.text} />
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {/* Citas de hoy */}
          <div className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5 md:px-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#000089]/10">
                  <Clock size={18} className="text-[#000089]" />
                </div>

                <div>
                  <p className="text-base font-black text-slate-900">
                    Citas de hoy
                  </p>
                  <p className="text-xs capitalize text-slate-400">
                    {new Date().toLocaleDateString('es-PE', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long'
                    })}
                  </p>
                </div>
              </div>

              <span className="rounded-full bg-[#000089]/10 px-3 py-1 text-xs font-black text-[#000089]">
                {stats?.citasHoy?.length ?? 0}
              </span>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center gap-3 py-16">
                <div className="h-9 w-9 animate-spin rounded-full border-2 border-[#00CCA5] border-t-transparent" />
                <p className="text-sm text-slate-400">Cargando citas...</p>
              </div>
            ) : stats?.citasHoy?.length === 0 ? (
              <EmptyState mensaje="Sin citas para hoy" />
            ) : (
              <div className="divide-y divide-slate-100">
                {stats?.citasHoy?.map((cita) => {
                  const cfg = estadoColors[cita.estado] || estadoColors.CONFIRMADA

                  return (
                    <div
                      key={cita.id}
                      className="flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-slate-50/70 md:px-6"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-slate-100">
                          <span className="font-mono text-xs font-black text-slate-700">
                            {formatHora(cita.fecha)}
                          </span>
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-black text-slate-800">
                            {cita.paciente.usuario.nombre}{' '}
                            {cita.paciente.usuario.apellido}
                          </p>
                          <p className="mt-0.5 truncate text-xs text-slate-400">
                            {cita.servicio.nombre}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`inline-flex flex-shrink-0 items-center gap-2 rounded-2xl px-3 py-1.5 text-xs font-black ${cfg.bg} ${cfg.text}`}
                      >
                        <span className={`h-2 w-2 rounded-full ${cfg.dot}`} />
                        <span className="hidden sm:inline">{cita.estado}</span>
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Próximas citas */}
          <div className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5 md:px-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#00CCA5]/10">
                  <Calendar size={18} className="text-[#008f78]" />
                </div>

                <div>
                  <p className="text-base font-black text-slate-900">
                    Próximas citas
                  </p>
                  <p className="text-xs text-slate-400">
                    Agenda médica programada
                  </p>
                </div>
              </div>

              <span className="rounded-full bg-[#00CCA5]/10 px-3 py-1 text-xs font-black text-[#008f78]">
                {stats?.proximasCitas?.length ?? 0} próxima{stats?.proximasCitas?.length !== 1 ? 's' : ''}
              </span>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center gap-3 py-16">
                <div className="h-9 w-9 animate-spin rounded-full border-2 border-[#00CCA5] border-t-transparent" />
                <p className="text-sm text-slate-400">Cargando próximas citas...</p>
              </div>
            ) : stats?.proximasCitas?.length === 0 ? (
              <EmptyState mensaje="No hay citas próximas" />
            ) : (
              <div className="divide-y divide-slate-100">
                {stats?.proximasCitas?.map((cita) => {
                  const cfg = estadoColors[cita.estado] || estadoColors.CONFIRMADA

                  return (
                    <div
                      key={cita.id}
                      className="flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-slate-50/70 md:px-6"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <AvatarPaciente paciente={cita.paciente} />

                        <div className="min-w-0">
                          <p className="truncate text-sm font-black text-slate-800">
                            {cita.paciente.usuario.nombre}{' '}
                            {cita.paciente.usuario.apellido}
                          </p>
                          <p className="mt-0.5 truncate text-xs text-slate-400">
                            {cita.servicio.nombre} · {formatFecha(cita.fecha)}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`inline-flex flex-shrink-0 items-center gap-2 rounded-2xl px-3 py-1.5 text-xs font-black ${cfg.bg} ${cfg.text}`}
                      >
                        <span className={`h-2 w-2 rounded-full ${cfg.dot}`} />
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