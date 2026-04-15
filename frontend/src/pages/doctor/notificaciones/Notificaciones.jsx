import { useState, useEffect } from 'react'
import { Bell, CheckCheck, Calendar, RefreshCw, Clock } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import DoctorLayout from '../../../components/DoctorLayout'
import api from '../../../services/api'

const tipoIcono = {
  NUEVA_CITA:    { icon: Calendar,  bg: 'bg-blue-50',   text: 'text-blue-600',   border: 'border-blue-100'   },
  CAMBIO_ESTADO: { icon: RefreshCw, bg: 'bg-yellow-50', text: 'text-yellow-600', border: 'border-yellow-100' },
  CANCELACION:   { icon: Clock,     bg: 'bg-red-50',    text: 'text-red-600',    border: 'border-red-100'    },
}

const formatTiempo = (fecha) => {
  const diff = Math.floor((new Date() - new Date(fecha)) / 1000)
  if (diff < 60)    return 'Hace un momento'
  if (diff < 3600)  return `Hace ${Math.floor(diff / 60)} min`
  if (diff < 86400) return `Hace ${Math.floor(diff / 3600)}h`
  return new Date(fecha).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export default function Notificaciones() {
  const [notificaciones, setNotificaciones] = useState([])
  const [noLeidas, setNoLeidas] = useState(0)
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState('todas')

  const fetchNotificaciones = async () => {
    try {
      const res = await api.get('/notificaciones')
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
      await api.patch(`/notificaciones/${id}/leer`)
      setNotificaciones(prev => prev.map(n => n.id === id ? { ...n, leida: true } : n))
      setNoLeidas(prev => Math.max(0, prev - 1))
    } catch {
      toast.error('Error al marcar notificación')
    }
  }

  const marcarTodasLeidas = async () => {
    try {
      await api.patch('/notificaciones/leer-todas')
      setNotificaciones(prev => prev.map(n => ({ ...n, leida: true })))
      setNoLeidas(0)
      toast.success('Todas las notificaciones marcadas como leídas')
    } catch {
      toast.error('Error al marcar notificaciones')
    }
  }

  const notifFiltradas = filtro === 'no_leidas'
    ? notificaciones.filter(n => !n.leida)
    : notificaciones

  return (
    <DoctorLayout>
      <div className="page-enter">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center relative">
              <Bell size={20} className="text-blue-600" />
              {noLeidas > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center">
                  {noLeidas > 9 ? '9+' : noLeidas}
                </span>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Notificaciones</h1>
              <p className="text-slate-400 text-sm mt-0.5">
                {noLeidas > 0 ? `${noLeidas} sin leer` : 'Todo al día'}
              </p>
            </div>
          </div>

          {noLeidas > 0 && (
            <button onClick={marcarTodasLeidas}
              className="flex items-center gap-2 px-3 md:px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50 transition-all">
              <CheckCheck size={15} />
              <span className="hidden sm:inline">Marcar todas como leídas</span>
            </button>
          )}
        </div>

        {/* Filtros */}
        <div className="flex gap-2 mb-5">
          {[
            { key: 'todas',     label: 'Todas',    count: notificaciones.length },
            { key: 'no_leidas', label: 'Sin leer', count: noLeidas },
          ].map(f => (
            <button key={f.key} onClick={() => setFiltro(f.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                filtro === f.key
                  ? 'bg-slate-800 text-white'
                  : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'
              }`}>
              {f.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-lg font-bold ${
                filtro === f.key ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
              }`}>
                {f.count}
              </span>
            </button>
          ))}
        </div>

        {/* Lista */}
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-slate-400 text-sm">Cargando notificaciones...</p>
            </div>
          ) : notifFiltradas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center">
                <Bell size={24} className="text-slate-400" />
              </div>
              <p className="text-slate-500 font-medium">
                {filtro === 'no_leidas' ? 'No tienes notificaciones sin leer' : 'No hay notificaciones'}
              </p>
            </div>
          ) : (
            <AnimatePresence>
              <div className="divide-y divide-slate-50">
                {notifFiltradas.map((notif) => {
                  const cfg = tipoIcono[notif.tipo] || tipoIcono.NUEVA_CITA
                  const IconoTipo = cfg.icon
                  return (
                    <motion.div
                      key={notif.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`flex items-start gap-3 md:gap-4 px-4 md:px-6 py-4 hover:bg-slate-50/70 transition-colors cursor-pointer ${!notif.leida ? 'bg-blue-50/30' : ''}`}
                      onClick={() => !notif.leida && marcarLeida(notif.id)}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${cfg.bg} ${cfg.border}`}>
                        <IconoTipo size={16} className={cfg.text} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm font-semibold truncate ${!notif.leida ? 'text-slate-800' : 'text-slate-600'}`}>
                            {notif.titulo}
                          </p>
                          <span className="text-xs text-slate-400 flex-shrink-0 mt-0.5 whitespace-nowrap">
                            {formatTiempo(notif.createdAt)}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{notif.mensaje}</p>
                      </div>
                      {!notif.leida && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5" />
                      )}
                    </motion.div>
                  )
                })}
              </div>
            </AnimatePresence>
          )}
        </div>

      </div>
    </DoctorLayout>
  )
}