import { useState, useEffect, useCallback } from 'react'
import {
  MonitorCheck,
  RefreshCw,
  Clock,
  CheckCircle,
  UserCheck,
  XCircle,
  Calendar,
  Activity,
  Radio,
  Stethoscope
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import AdminLayout from '../../../components/AdminLayout'
import api from '../../../services/api'

const estadoConfig = {
  PENDIENTE: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    dot: 'bg-amber-400',
    border: 'border-amber-200',
    label: 'Pendiente'
  },
  CONFIRMADA: {
    bg: 'bg-[#000089]/10',
    text: 'text-[#000089]',
    dot: 'bg-[#000089]',
    border: 'border-[#000089]/20',
    label: 'En espera'
  },
  COMPLETADA: {
    bg: 'bg-[#00CCA5]/10',
    text: 'text-[#008f78]',
    dot: 'bg-[#00CCA5]',
    border: 'border-[#00CCA5]/25',
    label: 'Atendido'
  },
  CANCELADA: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    dot: 'bg-red-500',
    border: 'border-red-200',
    label: 'Cancelado'
  }
}

const accionesRapidas = {
  PENDIENTE: [
    {
      estado: 'CONFIRMADA',
      label: 'Confirmar',
      icon: UserCheck,
      color: 'bg-[#000089] hover:bg-[#000070]'
    },
    {
      estado: 'CANCELADA',
      label: 'Cancelar',
      icon: XCircle,
      color: 'bg-red-500 hover:bg-red-600'
    }
  ],
  CONFIRMADA: [
    {
      estado: 'COMPLETADA',
      label: 'Atendido',
      icon: CheckCircle,
      color: 'bg-[#00A98A] hover:bg-[#008f78]'
    },
    {
      estado: 'CANCELADA',
      label: 'Cancelar',
      icon: XCircle,
      color: 'bg-red-500 hover:bg-red-600'
    }
  ],
  COMPLETADA: [],
  CANCELADA: []
}

const formatHora = (fecha) =>
  new Date(fecha).toLocaleTimeString('es-PE', {
    hour: '2-digit',
    minute: '2-digit'
  })

const formatFechaHoy = () =>
  new Date().toLocaleDateString('es-PE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })

function AvatarPaciente({ cita }) {
  const [imgError, setImgError] = useState(false)
  const foto = cita.paciente?.foto
  const nombre = cita.paciente?.usuario?.nombre || ''
  const apellido = cita.paciente?.usuario?.apellido || ''

  if (foto && !imgError) {
    return (
      <img
        src={foto}
        alt=""
        onError={() => setImgError(true)}
        className="h-11 w-11 flex-shrink-0 rounded-2xl object-cover"
      />
    )
  }

  return (
    <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-[#00CCA5]/10">
      <span className="text-sm font-black text-[#008f78]">
        {nombre[0]}
        {apellido[0]}
      </span>
    </div>
  )
}

export default function SalaEspera() {
  const [citas, setCitas] = useState([])
  const [loading, setLoading] = useState(true)
  const [actualizando, setActualizando] = useState(null)
  const [ultimaActualizacion, setUltimaActualizacion] = useState(null)
  const [filtroEstado, setFiltroEstado] = useState('activas')

  const fetchCitasHoy = useCallback(async (silencioso = false) => {
    if (!silencioso) setLoading(true)

    try {
      const res = await api.get('/citas/hoy')
      setCitas(res.data)
      setUltimaActualizacion(new Date())
    } catch {
      toast.error('Error al cargar las citas de hoy')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCitasHoy()
    const interval = setInterval(() => fetchCitasHoy(true), 30000)

    return () => clearInterval(interval)
  }, [fetchCitasHoy])

  const cambiarEstado = async (citaId, nuevoEstado) => {
    setActualizando(citaId)

    try {
      await api.patch(`/citas/${citaId}/estado`, { estado: nuevoEstado })

      setCitas((prev) =>
        prev.map((c) => (c.id === citaId ? { ...c, estado: nuevoEstado } : c))
      )

      const mensajes = {
        CONFIRMADA: 'Cita confirmada',
        COMPLETADA: 'Paciente atendido',
        CANCELADA: 'Cita cancelada'
      }

      toast.success(mensajes[nuevoEstado] || 'Estado actualizado')
    } catch {
      toast.error('Error al actualizar el estado')
    } finally {
      setActualizando(null)
    }
  }

  const stats = {
    total: citas.length,
    enEspera: citas.filter((c) => c.estado === 'CONFIRMADA').length,
    atendidos: citas.filter((c) => c.estado === 'COMPLETADA').length,
    cancelados: citas.filter((c) => c.estado === 'CANCELADA').length
  }

  const citasFiltradas =
    filtroEstado === 'activas'
      ? citas.filter((c) => c.estado === 'CONFIRMADA' || c.estado === 'PENDIENTE')
      : citas

  return (
    <AdminLayout>
      <div className="page-enter">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-950 md:text-3xl">
              Sala de Espera
            </h1>

            <p className="mt-2 text-sm capitalize text-slate-400">
              {formatFechaHoy()}
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="inline-flex items-center gap-2 rounded-2xl border border-[#00CCA5]/20 bg-[#00CCA5]/10 px-3.5 py-2">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#00CCA5]" />
              <span className="text-xs font-black text-[#008f78]">
                En vivo
              </span>
            </div>

            <button
              onClick={() => fetchCitasHoy(false)}
              className="flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-600 shadow-sm transition hover:border-[#00CCA5]/30 hover:bg-slate-50 hover:text-[#000089]"
            >
              <RefreshCw size={16} />
              Actualizar
            </button>
          </div>
        </div>

        {/* Stats del día */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: 'Total hoy',
              value: stats.total,
              color: 'bg-[#000089]',
              soft: 'bg-[#000089]/10',
              iconText: 'text-[#000089]',
              icon: Calendar
            },
            {
              label: 'En espera',
              value: stats.enEspera,
              color: 'bg-[#00A98A]',
              soft: 'bg-[#00CCA5]/10',
              iconText: 'text-[#008f78]',
              icon: Clock
            },
            {
              label: 'Atendidos',
              value: stats.atendidos,
              color: 'bg-[#00CCA5]',
              soft: 'bg-[#00CCA5]/10',
              iconText: 'text-[#008f78]',
              icon: CheckCircle
            },
            {
              label: 'Cancelados',
              value: stats.cancelados,
              color: 'bg-red-500',
              soft: 'bg-red-50',
              iconText: 'text-red-600',
              icon: XCircle
            }
          ].map((stat, i) => (
            <div
              key={i}
              className="group rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_50px_rgba(15,23,42,0.08)]"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl ${stat.color} shadow-lg shadow-slate-200/80`}
                >
                  <stat.icon size={20} className="text-white" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-400">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-black text-slate-950">
                    {stat.value}
                  </p>
                </div>

                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-xl ${stat.soft}`}
                >
                  <Activity size={15} className={stat.iconText} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Lista de citas */}
        <div className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 md:flex-row md:items-center md:justify-between md:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#00CCA5]/10">
                <MonitorCheck size={18} className="text-[#008f78]" />
              </div>

              <div>
                <p className="text-sm font-black text-slate-900">
                  Control de atención
                </p>
                <p className="text-xs text-slate-400">
                  Citas del día y cambios rápidos de estado
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex gap-1 rounded-2xl bg-slate-100 p-1">
                {[
                  { key: 'activas', label: `En espera (${stats.enEspera})` },
                  { key: 'todas', label: `Todas (${stats.total})` }
                ].map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setFiltroEstado(f.key)}
                    className={`rounded-xl px-3 py-2 text-xs font-black transition-all ${
                      filtroEstado === f.key
                        ? 'bg-white text-[#000089] shadow-sm'
                        : 'text-slate-400 hover:text-slate-700'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {ultimaActualizacion && (
                <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
                  <Radio size={12} className="text-[#008f78]" />
                  <span className="text-xs font-bold text-slate-500">
                    {ultimaActualizacion.toLocaleTimeString('es-PE', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16">
              <div className="h-9 w-9 animate-spin rounded-full border-2 border-[#00CCA5] border-t-transparent" />
              <p className="text-sm text-slate-400">
                Cargando citas de hoy...
              </p>
            </div>
          ) : citasFiltradas.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 px-6 py-16">
              <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-slate-100">
                <MonitorCheck size={24} className="text-slate-400" />
              </div>

              <div className="text-center">
                <p className="text-sm font-black text-slate-700">
                  {filtroEstado === 'activas'
                    ? 'No hay pacientes en espera'
                    : 'No hay citas para hoy'}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  {filtroEstado === 'activas'
                    ? 'Todos los pacientes fueron atendidos'
                    : 'La sala de espera está vacía'}
                </p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              <AnimatePresence>
                {citasFiltradas.map((cita) => {
                  const cfg = estadoConfig[cita.estado]
                  const acciones = accionesRapidas[cita.estado] || []
                  const estaActualizando = actualizando === cita.id

                  return (
                    <motion.div
                      key={cita.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`grid grid-cols-[72px_1fr_auto] items-center gap-4 px-5 py-4 transition-colors hover:bg-slate-50/70 md:px-6 ${
                        cita.estado === 'COMPLETADA' ||
                        cita.estado === 'CANCELADA'
                          ? 'opacity-60'
                          : ''
                      }`}
                    >
                      {/* Hora */}
                      <div className="flex flex-col items-center justify-center rounded-2xl bg-slate-100 px-2 py-2.5">
                        <p className="font-mono text-sm font-black text-slate-800">
                          {formatHora(cita.fecha)}
                        </p>
                        <p className="mt-0.5 hidden text-xs text-slate-400 sm:block">
                          {cita.servicio?.duracion} min
                        </p>
                      </div>

                      {/* Info */}
                      <div className="min-w-0">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className={`h-11 w-1 rounded-full ${cfg.dot}`} />

                          <AvatarPaciente cita={cita} />

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-col gap-1 md:flex-row md:items-center md:gap-3">
                              <p className="truncate text-sm font-black text-slate-800">
                                {cita.paciente?.usuario?.nombre}{' '}
                                {cita.paciente?.usuario?.apellido}
                              </p>

                              <span
                                className={`inline-flex w-fit items-center gap-1.5 rounded-2xl border px-2.5 py-1 text-xs font-black ${cfg.bg} ${cfg.text} ${cfg.border}`}
                              >
                                <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                                {cfg.label}
                              </span>
                            </div>

                            <div className="mt-1 flex flex-col gap-1 text-xs text-slate-400 sm:flex-row sm:items-center">
                              <span className="truncate">
                                Dr. {cita.doctor?.usuario?.nombre}{' '}
                                {cita.doctor?.usuario?.apellido}
                              </span>

                              <span className="hidden sm:inline">·</span>

                              <span className="truncate">
                                {cita.servicio?.nombre}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Acciones */}
                      <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center">
                        {acciones.length > 0 ? (
                          acciones.map((accion) => (
                            <button
                              key={accion.estado}
                              onClick={() =>
                                cambiarEstado(cita.id, accion.estado)
                              }
                              disabled={estaActualizando}
                              className={`flex h-9 items-center justify-center gap-1.5 rounded-xl px-3 text-xs font-black text-white shadow-sm transition-all disabled:cursor-not-allowed disabled:opacity-50 ${accion.color}`}
                            >
                              {estaActualizando ? (
                                <span className="h-3.5 w-3.5 animate-spin rounded-full border border-white/30 border-t-white" />
                              ) : (
                                <accion.icon size={13} />
                              )}

                              <span className="hidden sm:inline">
                                {accion.label}
                              </span>
                            </button>
                          ))
                        ) : (
                          <span className="rounded-2xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-400">
                            Sin acciones
                          </span>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Leyenda */}
        <div className="mt-4 hidden items-center gap-6 px-2 sm:flex">
          <p className="text-xs font-bold text-slate-400">Leyenda:</p>

          {Object.entries(estadoConfig).map(([key, cfg]) => (
            <div key={key} className="flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${cfg.dot}`} />
              <span className="text-xs font-medium text-slate-500">
                {cfg.label}
              </span>
            </div>
          ))}

          <p className="ml-auto text-xs font-medium text-slate-400">
            Se actualiza cada 30 segundos
          </p>
        </div>
      </div>
    </AdminLayout>
  )
}