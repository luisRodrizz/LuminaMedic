import { useState, useEffect } from 'react'
import { Bell, CheckCheck, Calendar, RefreshCw, Clock, XCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import PacienteLayout from '../../../components/PacienteLayout'
import api from '../../../services/api'

const tipoIcono = {
  CONFIRMACION: {
    icon: Calendar,
    bg: 'bg-[#000089]/10',
    text: 'text-[#000089]',
    border: 'border-[#000089]/20'
  },
  CANCELACION: {
    icon: XCircle,
    bg: 'bg-red-50',
    text: 'text-red-600',
    border: 'border-red-100'
  },
  CAMBIO_ESTADO: {
    icon: RefreshCw,
    bg: 'bg-amber-50',
    text: 'text-amber-600',
    border: 'border-amber-100'
  },
  COMPLETADA: {
    icon: Clock,
    bg: 'bg-[#00CCA5]/10',
    text: 'text-[#008f78]',
    border: 'border-[#00CCA5]/20'
  },
}

const formatTiempo = (fecha) => {
  const diff = Math.floor((new Date() - new Date(fecha)) / 1000)
  if (diff < 60)    return 'Hace un momento'
  if (diff < 3600)  return `Hace ${Math.floor(diff / 60)} min`
  if (diff < 86400) return `Hace ${Math.floor(diff / 3600)}h`
  return new Date(fecha).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export default function NotificacionesPaciente() {
  const [notificaciones, setNotificaciones] = useState([])
  const [noLeidas, setNoLeidas] = useState(0)
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState('todas')

  const fetchNotificaciones = async () => {
    try {
      const res = await api.get('/notificaciones/paciente')
      setNotificaciones(res.data.notificaciones)
      setNoLeidas(res.data.noLeidas)
    } catch {
      toast.error('Error al cargar notificaciones')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchNotificaciones() }, [])

  const marcarLeida = async (id) => {
    try {
      await api.patch(`/notificaciones/paciente/${id}/leer`)
      setNotificaciones(prev => prev.map(n => n.id === id ? { ...n, leida: true } : n))
      setNoLeidas(prev => Math.max(0, prev - 1))
    } catch {
      toast.error('Error al marcar notificación')
    }
  }

  const marcarTodasLeidas = async () => {
    try {
      await api.patch('/notificaciones/paciente/leer-todas')
      setNotificaciones(prev => prev.map(n => ({ ...n, leida: true })))
      setNoLeidas(0)
      toast.success('Todas marcadas como leídas')
    } catch {
      toast.error('Error al marcar notificaciones')
    }
  }

  const notifFiltradas = filtro === 'no_leidas'
    ? notificaciones.filter(n => !n.leida)
    : notificaciones

  return (
    <PacienteLayout>
      <div className="page-enter">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-950 md:text-3xl">
              Notificaciones
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              {noLeidas > 0
                ? `Tienes ${noLeidas} notificación${noLeidas !== 1 ? 'es' : ''} sin leer.`
                : 'Todo al día. No tienes notificaciones pendientes.'}
            </p>
          </div>

          {noLeidas > 0 && (
            <button
              onClick={marcarTodasLeidas}
              className="flex h-11 w-fit items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-black text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-[#000089]"
            >
              <CheckCheck size={16} />
              <span className="hidden sm:inline">Marcar todas como leídas</span>
              <span className="sm:hidden">Marcar leídas</span>
            </button>
          )}
        </div>

        {/* Resumen visual */}
        <div className="mb-5 rounded-[2rem] border border-slate-200/80 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="relative flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-[#000089]/10">
                <Bell size={20} className="text-[#000089]" />

                {noLeidas > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-black text-white ring-4 ring-white">
                    {noLeidas > 9 ? '9+' : noLeidas}
                  </span>
                )}
              </div>

              <div>
                <p className="text-base font-black text-slate-900">
                  Centro de notificaciones
                </p>
                <p className="text-xs text-slate-400">
                  Revisa actualizaciones sobre tus citas y atenciones médicas.
                </p>
              </div>
            </div>

            <div className="flex w-fit items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2">
              <span className="text-xs font-black uppercase tracking-[0.1em] text-slate-400">
                Total
              </span>
              <span className="text-sm font-black text-slate-700">
                {notificaciones.length}
              </span>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
          {[
            { key: 'todas', label: 'Todas', count: notificaciones.length },
            { key: 'no_leidas', label: 'Sin leer', count: noLeidas },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFiltro(f.key)}
              className={`flex flex-shrink-0 items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-black transition-all ${
                filtro === f.key
                  ? 'bg-[#000089] text-white shadow-lg shadow-[#000089]/20'
                  : 'border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-700'
              }`}
            >
              {f.label}

              <span className={`rounded-xl px-2 py-0.5 text-xs font-black ${
                filtro === f.key
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-100 text-slate-500'
              }`}>
                {f.count}
              </span>
            </button>
          ))}
        </div>

        {/* Lista */}
        <div className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white shadow-sm">
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16">
              <div className="h-9 w-9 animate-spin rounded-full border-2 border-[#00CCA5] border-t-transparent" />
              <p className="text-sm text-slate-400">Cargando notificaciones...</p>
            </div>
          ) : notifFiltradas.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-slate-100">
                <Bell size={24} className="text-slate-400" />
              </div>

              <div>
                <p className="text-sm font-black text-slate-700">
                  {filtro === 'no_leidas' ? 'No tienes notificaciones sin leer' : 'No hay notificaciones'}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  {filtro === 'no_leidas'
                    ? 'Todas tus notificaciones ya fueron revisadas.'
                    : 'Cuando haya novedades sobre tus citas, aparecerán aquí.'}
                </p>
              </div>
            </div>
          ) : (
            <AnimatePresence>
              <div className="divide-y divide-slate-100">
                {notifFiltradas.map((notif) => {
                  const cfg = tipoIcono[notif.tipo] || tipoIcono.CAMBIO_ESTADO
                  const IconoTipo = cfg.icon

                  return (
                    <motion.div
                      key={notif.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`group flex cursor-pointer items-start gap-3 px-5 py-4 transition-colors hover:bg-slate-50/70 md:gap-4 md:px-6 ${
                        !notif.leida ? 'bg-[#00CCA5]/5' : ''
                      }`}
                      onClick={() => !notif.leida && marcarLeida(notif.id)}
                    >
                      <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl border ${cfg.bg} ${cfg.border}`}>
                        <IconoTipo size={17} className={cfg.text} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className={`truncate text-sm ${
                              !notif.leida
                                ? 'font-black text-slate-900'
                                : 'font-bold text-slate-600'
                            }`}>
                              {notif.titulo}
                            </p>

                            <p className="mt-1 text-xs font-medium leading-relaxed text-slate-500">
                              {notif.mensaje}
                            </p>
                          </div>

                          <span className="mt-0.5 flex-shrink-0 whitespace-nowrap text-xs font-bold text-slate-400">
                            {formatTiempo(notif.createdAt)}
                          </span>
                        </div>

                        {!notif.leida && (
                          <div className="mt-3 flex items-center gap-2">
                            <span className="flex h-2 w-2 rounded-full bg-[#00CCA5]" />
                            <span className="text-xs font-black text-[#008f78]">
                              Nueva
                            </span>
                          </div>
                        )}
                      </div>

                      {!notif.leida && (
                        <div className="mt-2 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-[#00CCA5]" />
                      )}
                    </motion.div>
                  )
                })}
              </div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </PacienteLayout>
  )
}