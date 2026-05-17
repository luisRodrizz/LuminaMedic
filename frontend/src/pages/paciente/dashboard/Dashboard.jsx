import { useState, useEffect } from 'react'
import { Calendar, CheckCircle, Clock, ArrowUpRight, Plus, Users } from 'lucide-react'
import PacienteLayout from '../../../components/PacienteLayout'
import api from '../../../services/api'
import { useAuth } from '../../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

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
  },
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
    {
      label: 'Citas pendientes',
      value: stats?.resumen?.totalPendientes ?? '—',
      icon: Clock,
      iconBg: 'bg-amber-500',
      soft: 'bg-amber-50',
      text: 'text-amber-600',
      sub: 'Por confirmar o atender'
    },
    {
      label: 'Consultas completadas',
      value: stats?.resumen?.totalCompletadas ?? '—',
      icon: CheckCircle,
      iconBg: 'bg-[#00A98A]',
      soft: 'bg-[#00CCA5]/10',
      text: 'text-[#008f78]',
      sub: 'Atenciones finalizadas'
    },
    {
      label: 'Total de citas',
      value: stats?.resumen?.totalCitas ?? '—',
      icon: Calendar,
      iconBg: 'bg-[#000089]',
      soft: 'bg-[#000089]/10',
      text: 'text-[#000089]',
      sub: 'Historial general'
    },
    {
      label: 'Doctores consultados',
      value: stats?.resumen?.doctoresUnicos ?? '—',
      icon: Users,
      iconBg: 'bg-[#0EA5E9]',
      soft: 'bg-sky-50',
      text: 'text-sky-600',
      sub: 'Profesionales atendidos'
    },
  ]

  return (
    <PacienteLayout>
      <div className="page-enter">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-950 md:text-3xl">
              {getHora()}, {user?.nombre}
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              Bienvenido a tu portal de salud. Revisa tus citas, consultas y seguimiento médico.
            </p>
          </div>

          <button
            onClick={() => navigate('/paciente/citas')}
            className="flex h-11 w-fit items-center justify-center gap-2 rounded-xl bg-[#000089] px-5 text-sm font-black text-white shadow-lg shadow-[#000089]/20 transition hover:bg-[#000070] hover:ring-4 hover:ring-[#00CCA5]/15"
          >
            <Plus size={17} />
            Agendar cita
          </button>
        </div>

        {/* Tarjetas */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {tarjetas.map((t, i) => (
            <div
              key={i}
              className="group rounded-3xl border border-slate-200/70 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_50px_rgba(15,23,42,0.08)]"
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl ${t.iconBg} shadow-lg shadow-slate-200/80`}>
                  <t.icon size={20} className="text-white" />
                </div>

                <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${t.soft}`}>
                  <ArrowUpRight size={15} className={t.text} />
                </div>
              </div>

              <p className="text-xs font-bold text-slate-400">
                {t.label}
              </p>

              <p className="mt-1 text-3xl font-black leading-tight text-slate-900">
                {loading ? '—' : t.value}
              </p>

              <p className="mt-1 truncate text-xs text-slate-400">
                {t.sub}
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {/* Próximas citas */}
          <div className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-5 md:flex-row md:items-center md:justify-between md:px-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-[#000089]/10">
                  <Calendar size={18} className="text-[#000089]" />
                </div>

                <div>
                  <p className="text-base font-black text-slate-900">
                    Citas próximas
                  </p>
                  <p className="text-xs text-slate-400">
                    Tus próximas atenciones programadas.
                  </p>
                </div>
              </div>

              <span className="w-fit rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-500">
                {stats?.proximasCitas?.length ?? 0} pendiente{stats?.proximasCitas?.length !== 1 ? 's' : ''}
              </span>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center gap-3 py-14">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#00CCA5] border-t-transparent" />
                <p className="text-sm text-slate-400">Cargando citas...</p>
              </div>
            ) : stats?.proximasCitas?.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 px-6 py-14">
                <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-slate-100">
                  <Calendar size={24} className="text-slate-400" />
                </div>

                <div className="text-center">
                  <p className="text-sm font-black text-slate-700">
                    No tienes citas próximas
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Puedes agendar una nueva atención desde el módulo de citas.
                  </p>
                </div>

                <button
                  onClick={() => navigate('/paciente/citas')}
                  className="mt-1 flex items-center gap-2 rounded-xl bg-[#000089] px-4 py-2 text-xs font-black text-white transition hover:bg-[#000070]"
                >
                  <Plus size={14} />
                  Agendar una cita
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {stats.proximasCitas.map((cita, i) => {
                  const cfg = estadoColors[cita.estado] || estadoColors.CONFIRMADA

                  return (
                    <div
                      key={cita.id}
                      className={`flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-slate-50/70 md:px-6 ${
                        i === 0 ? 'bg-[#00CCA5]/5' : ''
                      }`}
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
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="truncate text-sm font-black text-slate-800">
                              Dr. {cita.doctor.usuario.nombre} {cita.doctor.usuario.apellido}
                            </p>

                            {i === 0 && (
                              <span className="rounded-full bg-[#00CCA5]/10 px-2.5 py-1 text-[10px] font-black text-[#008f78]">
                                Próxima
                              </span>
                            )}
                          </div>

                          <p className="mt-0.5 truncate text-xs font-medium text-slate-400">
                            {cita.servicio.nombre} · {formatFecha(cita.fecha)}
                          </p>
                        </div>
                      </div>

                      <span className={`inline-flex flex-shrink-0 items-center gap-2 rounded-2xl px-3 py-1.5 text-xs font-black ${cfg.bg} ${cfg.text}`}>
                        <span className={`h-2 w-2 rounded-full ${cfg.dot}`} />
                        <span className="hidden sm:inline">{cita.estado}</span>
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Últimas consultas */}
          <div className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-5 md:flex-row md:items-center md:justify-between md:px-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-[#00CCA5]/10">
                  <CheckCircle size={18} className="text-[#008f78]" />
                </div>

                <div>
                  <p className="text-base font-black text-slate-900">
                    Últimas consultas
                  </p>
                  <p className="text-xs text-slate-400">
                    Atenciones completadas recientemente.
                  </p>
                </div>
              </div>

              <span className="w-fit rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-500">
                {stats?.resumen?.totalCompletadas ?? 0} completadas
              </span>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center gap-3 py-14">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#00CCA5] border-t-transparent" />
                <p className="text-sm text-slate-400">Cargando consultas...</p>
              </div>
            ) : stats?.ultimasCompletadas?.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 px-6 py-14">
                <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-slate-100">
                  <CheckCircle size={24} className="text-slate-400" />
                </div>

                <div className="text-center">
                  <p className="text-sm font-black text-slate-700">
                    Sin consultas completadas
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Cuando finalice una atención, aparecerá en esta sección.
                  </p>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {stats.ultimasCompletadas.map(cita => (
                  <div
                    key={cita.id}
                    className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-slate-50/70 md:px-6"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl border border-[#00CCA5]/20 bg-[#00CCA5]/10">
                        <span className="text-xs font-black text-[#008f78]">
                          {cita.doctor.usuario.nombre[0]}
                          {cita.doctor.usuario.apellido[0]}
                        </span>
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

                    {cita.nota && (
                      <span className="flex-shrink-0 rounded-2xl bg-[#00CCA5]/10 px-3 py-1.5 text-xs font-black text-[#008f78]">
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