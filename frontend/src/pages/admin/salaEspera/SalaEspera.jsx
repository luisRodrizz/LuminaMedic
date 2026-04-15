import { useState, useEffect, useCallback } from 'react'
import { MonitorCheck, RefreshCw, Clock, CheckCircle, UserCheck, XCircle, Calendar } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import AdminLayout from '../../../components/AdminLayout'
import api from '../../../services/api'

const estadoConfig = {
  PENDIENTE:  { bg: 'bg-yellow-50',  text: 'text-yellow-700',  dot: 'bg-yellow-400',  border: 'border-yellow-200',  label: 'Pendiente' },
  CONFIRMADA: { bg: 'bg-blue-50',    text: 'text-blue-700',    dot: 'bg-blue-400',    border: 'border-blue-200',    label: 'En espera' },
  COMPLETADA: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-400', border: 'border-emerald-200', label: 'Atendido'  },
  CANCELADA:  { bg: 'bg-red-50',     text: 'text-red-700',     dot: 'bg-red-400',     border: 'border-red-200',     label: 'Cancelado' },
}

const accionesRapidas = {
  PENDIENTE:  [
    { estado: 'CONFIRMADA', label: 'Confirmar', icon: UserCheck,   color: 'bg-blue-500 hover:bg-blue-600'       },
    { estado: 'CANCELADA',  label: 'Cancelar',  icon: XCircle,     color: 'bg-red-500 hover:bg-red-600'         },
  ],
  CONFIRMADA: [
    { estado: 'COMPLETADA', label: 'Atendido',  icon: CheckCircle, color: 'bg-emerald-500 hover:bg-emerald-600' },
    { estado: 'CANCELADA',  label: 'Cancelar',  icon: XCircle,     color: 'bg-red-500 hover:bg-red-600'         },
  ],
  COMPLETADA: [],
  CANCELADA:  [],
}

const formatHora = (fecha) => new Date(fecha).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
const formatFechaHoy = () => new Date().toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

function AvatarPaciente({ cita }) {
  const [imgError, setImgError] = useState(false)
  const foto = cita.paciente?.foto
  const nombre = cita.paciente?.usuario?.nombre || ''
  const apellido = cita.paciente?.usuario?.apellido || ''
  if (foto && !imgError) {
    return <img src={foto} alt="" onError={() => setImgError(true)} className="w-10 h-10 rounded-xl object-cover flex-shrink-0" />
  }
  return (
    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
      <span className="text-slate-600 text-sm font-bold">{nombre[0]}{apellido[0]}</span>
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
      setCitas(prev => prev.map(c => c.id === citaId ? { ...c, estado: nuevoEstado } : c))
      const mensajes = {
        CONFIRMADA: 'Cita confirmada',
        COMPLETADA: 'Paciente atendido',
        CANCELADA:  'Cita cancelada',
      }
      toast.success(mensajes[nuevoEstado] || 'Estado actualizado')
    } catch {
      toast.error('Error al actualizar el estado')
    } finally {
      setActualizando(null)
    }
  }

  const stats = {
    total:      citas.length,
    enEspera:   citas.filter(c => c.estado === 'CONFIRMADA').length,
    atendidos:  citas.filter(c => c.estado === 'COMPLETADA').length,
    cancelados: citas.filter(c => c.estado === 'CANCELADA').length,
  }

  const citasFiltradas = filtroEstado === 'activas'
    ? citas.filter(c => c.estado === 'CONFIRMADA' || c.estado === 'PENDIENTE')
    : citas

  return (
    <AdminLayout>
      <div className="page-enter">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <MonitorCheck size={20} className="text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Sala de Espera</h1>
              <p className="text-slate-400 text-sm mt-0.5 capitalize hidden sm:block">{formatFechaHoy()}</p>
            </div>
          </div>
          <button onClick={() => fetchCitasHoy(false)}
            className="flex items-center gap-2 px-3 md:px-4 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-sm font-medium transition-all">
            <RefreshCw size={15} />
            <span className="hidden sm:inline">Actualizar</span>
          </button>
        </div>

        {/* Stats del día */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total hoy',  value: stats.total,      color: 'bg-slate-800',   icon: Calendar    },
            { label: 'En espera',  value: stats.enEspera,   color: 'bg-blue-500',    icon: Clock       },
            { label: 'Atendidos',  value: stats.atendidos,  color: 'bg-emerald-500', icon: CheckCircle },
            { label: 'Cancelados', value: stats.cancelados, color: 'bg-red-500',     icon: XCircle     },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center gap-3 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
              <div className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                <stat.icon size={18} className="text-white" />
              </div>
              <div>
                <p className="text-slate-400 text-xs">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Lista de citas */}
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 md:px-6 py-4 border-b border-slate-100">
            <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
              {[
                { key: 'activas', label: `En espera (${stats.enEspera})` },
                { key: 'todas',   label: `Todas (${stats.total})` },
              ].map(f => (
                <button key={f.key} onClick={() => setFiltroEstado(f.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    filtroEstado === f.key ? 'bg-white shadow-sm text-slate-700' : 'text-slate-400 hover:text-slate-600'
                  }`}>
                  {f.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              {ultimaActualizacion && (
                <p className="text-xs text-slate-400 hidden sm:block">
                  Actualizado {ultimaActualizacion.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
                </p>
              )}
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-xs text-slate-400">En vivo</span>
              </span>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-slate-400 text-sm">Cargando citas de hoy...</p>
            </div>
          ) : citasFiltradas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center">
                <MonitorCheck size={24} className="text-slate-400" />
              </div>
              <p className="text-slate-500 font-medium">
                {filtroEstado === 'activas' ? 'No hay pacientes en espera' : 'No hay citas para hoy'}
              </p>
              <p className="text-slate-400 text-sm">
                {filtroEstado === 'activas' ? 'Todos los pacientes fueron atendidos' : 'La sala de espera está vacía'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              <AnimatePresence>
                {citasFiltradas.map((cita) => {
                  const cfg = estadoConfig[cita.estado]
                  const acciones = accionesRapidas[cita.estado] || []
                  const estaActualizando = actualizando === cita.id
                  return (
                    <motion.div key={cita.id} layout
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className={`flex items-center gap-3 md:gap-4 px-4 md:px-6 py-4 hover:bg-slate-50/50 transition-colors ${
                        cita.estado === 'COMPLETADA' || cita.estado === 'CANCELADA' ? 'opacity-60' : ''
                      }`}>

                      {/* Hora */}
                      <div className="w-12 flex-shrink-0 text-center">
                        <p className="text-sm font-bold text-slate-800 font-mono">{formatHora(cita.fecha)}</p>
                        <p className="text-xs text-slate-400 hidden sm:block">{cita.servicio?.duracion} min</p>
                      </div>

                      {/* Separador vertical */}
                      <div className={`w-0.5 h-10 rounded-full flex-shrink-0 ${cfg.dot}`} />

                      {/* Avatar + info */}
                      <AvatarPaciente cita={cita} />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-800 text-sm truncate">
                          {cita.paciente?.usuario?.nombre} {cita.paciente?.usuario?.apellido}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5 truncate">
                          Dr. {cita.doctor?.usuario?.nombre} {cita.doctor?.usuario?.apellido}
                          <span className="hidden sm:inline"> · {cita.servicio?.nombre}</span>
                        </p>
                      </div>

                      {/* Estado badge */}
                      <span className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border flex-shrink-0 ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                        {cfg.label}
                      </span>

                      {/* Acciones */}
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {acciones.length > 0 ? (
                          acciones.map(accion => (
                            <button key={accion.estado}
                              onClick={() => cambiarEstado(cita.id, accion.estado)}
                              disabled={estaActualizando}
                              className={`flex items-center gap-1 px-2 md:px-3 py-1.5 ${accion.color} disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-xs font-medium transition-all`}>
                              {estaActualizando ? (
                                <span className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
                              ) : (
                                <accion.icon size={12} />
                              )}
                              <span className="hidden sm:inline">{accion.label}</span>
                            </button>
                          ))
                        ) : (
                          <span className="w-16 md:w-24" />
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
        <div className="hidden sm:flex items-center gap-6 mt-4 px-2">
          <p className="text-xs text-slate-400 font-medium">Leyenda:</p>
          {Object.entries(estadoConfig).map(([key, cfg]) => (
            <div key={key} className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
              <span className="text-xs text-slate-500">{cfg.label}</span>
            </div>
          ))}
          <p className="text-xs text-slate-400 ml-auto">Se actualiza cada 30 segundos</p>
        </div>

      </div>
    </AdminLayout>
  )
}