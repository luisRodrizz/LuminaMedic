import { useState, useEffect } from 'react'
import { Plus, Calendar, Filter, XCircle, RefreshCw, AlertTriangle } from 'lucide-react'
import { AnimatePresence } from 'framer-motion'
import PacienteLayout from '../../../components/PacienteLayout'
import ModalAgendarCita from './ModalAgendarCita'
import ModalReprogramarCita from './ModalReprogramarCita'
import ModalConfirmar from '../../../components/ModalConfirmar'
import api from '../../../services/api'
import { toast } from 'sonner'

const estadoColors = {
  PENDIENTE:  { bg: 'bg-yellow-50',  text: 'text-yellow-700',  dot: 'bg-yellow-400'  },
  CONFIRMADA: { bg: 'bg-blue-50',    text: 'text-blue-700',    dot: 'bg-blue-400'    },
  COMPLETADA: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-400' },
  CANCELADA:  { bg: 'bg-red-50',     text: 'text-red-700',     dot: 'bg-red-400'     },
}

const MAX_CANCELACIONES = 3

export default function PacienteCitas() {
  const [citas, setCitas] = useState([])
  const [filtroEstado, setFiltroEstado] = useState('')
  const [loading, setLoading] = useState(true)
  const [cancelacionesRestantes, setCancelacionesRestantes] = useState(MAX_CANCELACIONES)
  const [modalAgendar, setModalAgendar] = useState(false)
  const [modalCancelar, setModalCancelar] = useState(false)
  const [modalReprogramar, setModalReprogramar] = useState(false)
  const [citaACancelar, setCitaACancelar] = useState(null)
  const [citaAReprogramar, setCitaAReprogramar] = useState(null)
  const [cancelando, setCancelando] = useState(false)

  const fetchCitas = async () => {
    try {
      const res = await api.get('/citas?page=1&limit=100')
      setCitas(res.data.data)
      const hoy = new Date()
      const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1)
      const canceladasMes = res.data.data.filter(c =>
        c.estado === 'CANCELADA' && new Date(c.updatedAt) >= inicioMes
      ).length
      setCancelacionesRestantes(Math.max(0, MAX_CANCELACIONES - canceladasMes))
    } catch {
      console.error('Error al cargar citas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchCitas() }, [])

  const citasFiltradas = filtroEstado ? citas.filter(c => c.estado === filtroEstado) : citas

  const handleCancelar = async () => {
    if (!citaACancelar) return
    setCancelando(true)
    try {
      const res = await api.patch(`/citas/${citaACancelar.id}/cancelar`)
      if (res.data.cancelacionesRestantes !== undefined) {
        setCancelacionesRestantes(res.data.cancelacionesRestantes)
      }
      await fetchCitas()
      setModalCancelar(false)
      setCitaACancelar(null)
      toast.success(`Cita cancelada. Te quedan ${res.data.cancelacionesRestantes} cancelación(es) este mes.`)
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al cancelar la cita'
      toast.error(msg)
      setModalCancelar(false)
      setCitaACancelar(null)
    } finally {
      setCancelando(false)
    }
  }

  const formatFecha = (fecha) => new Date(fecha).toLocaleString('es-PE', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })

  const puedeAccion = (estado) => estado === 'PENDIENTE' || estado === 'CONFIRMADA'

  const badgeCancelaciones = cancelacionesRestantes === 0
    ? { bg: 'bg-red-50',    text: 'text-red-600',    border: 'border-red-100'    }
    : cancelacionesRestantes === 1
      ? { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100' }
      : { bg: 'bg-slate-50', text: 'text-slate-500',  border: 'border-slate-100'  }

  return (
    <PacienteLayout>
      <div className="page-enter">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <Calendar size={20} className="text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Mis Citas</h1>
              <p className="text-slate-400 text-sm mt-0.5 hidden sm:block">Historial y agenda de citas</p>
            </div>
          </div>
          {/* Acciones — siempre en fila */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className={`hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-medium ${badgeCancelaciones.bg} ${badgeCancelaciones.text} ${badgeCancelaciones.border}`}>
              {cancelacionesRestantes === 0 && <AlertTriangle size={12} />}
              {cancelacionesRestantes === MAX_CANCELACIONES
                ? `${MAX_CANCELACIONES} cancelaciones disponibles`
                : `${cancelacionesRestantes} cancelación(es) restante(s) este mes`
              }
            </div>
            <button onClick={() => setModalAgendar(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm hover:shadow-md">
              <Plus size={16} />
              <span className="hidden sm:inline">Agendar Cita</span>
            </button>
          </div>
        </div>

        {/* Badge cancelaciones — solo móvil, debajo del header */}
        <div className={`sm:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-medium mb-4 ${badgeCancelaciones.bg} ${badgeCancelaciones.text} ${badgeCancelaciones.border}`}>
          {cancelacionesRestantes === 0 && <AlertTriangle size={12} />}
          {cancelacionesRestantes === MAX_CANCELACIONES
            ? `${MAX_CANCELACIONES} cancelaciones disponibles este mes`
            : `${cancelacionesRestantes} cancelación(es) restante(s) este mes`
          }
        </div>

        {/* Card tabla */}
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 md:px-6 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Filter size={15} className="text-slate-400 flex-shrink-0" />
              <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}
                className="py-2 px-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-slate-50 text-slate-600 w-full sm:w-auto">
                <option value="">Todos los estados</option>
                <option value="PENDIENTE">Pendiente</option>
                <option value="CONFIRMADA">Confirmada</option>
                <option value="COMPLETADA">Completada</option>
                <option value="CANCELADA">Cancelada</option>
              </select>
            </div>
            <p className="text-xs text-slate-400">{citasFiltradas.length} cita{citasFiltradas.length !== 1 ? 's' : ''}</p>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-slate-400 text-sm">Cargando citas...</p>
            </div>
          ) : citasFiltradas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center">
                <Calendar size={24} className="text-slate-400" />
              </div>
              <p className="text-slate-500 font-medium">No tienes citas registradas</p>
              <p className="text-slate-400 text-sm">Agenda tu primera cita con el botón de arriba</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[540px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-4 md:px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Fecha</th>
                    <th className="px-4 md:px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Doctor</th>
                    <th className="hidden sm:table-cell px-4 md:px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Servicio</th>
                    <th className="hidden md:table-cell px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Motivo</th>
                    <th className="px-4 md:px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                    <th className="px-4 md:px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {citasFiltradas.map((cita) => {
                    const cfg = estadoColors[cita.estado]
                    return (
                      <tr key={cita.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-4 md:px-6 py-4 text-slate-500 text-sm whitespace-nowrap">
                          {formatFecha(cita.fecha)}
                        </td>
                        <td className="px-4 md:px-6 py-4">
                          <span className="text-sm font-medium text-slate-800 truncate block max-w-[130px] md:max-w-none">
                            Dr. {cita.doctor.usuario.nombre} {cita.doctor.usuario.apellido}
                          </span>
                        </td>
                        <td className="hidden sm:table-cell px-4 md:px-6 py-4">
                          <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium">
                            {cita.servicio.nombre}
                          </span>
                        </td>
                        <td className="hidden md:table-cell px-6 py-4 text-slate-500 text-sm">
                          {cita.motivo || '—'}
                        </td>
                        <td className="px-4 md:px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${cfg.bg} ${cfg.text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                            <span className="hidden sm:inline">{cita.estado}</span>
                          </span>
                        </td>
                        <td className="px-4 md:px-6 py-4">
                          {puedeAccion(cita.estado) ? (
                            <div className="flex items-center gap-1">
                              <button onClick={() => { setCitaAReprogramar(cita); setModalReprogramar(true) }}
                                className="p-2 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-all"
                                title="Reprogramar cita">
                                <RefreshCw size={15} />
                              </button>
                              <button
                                onClick={() => { setCitaACancelar(cita); setModalCancelar(true) }}
                                disabled={cancelacionesRestantes === 0}
                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                title={cancelacionesRestantes === 0 ? 'Límite de cancelaciones alcanzado' : 'Cancelar cita'}>
                                <XCircle size={15} />
                              </button>
                            </div>
                          ) : (
                            <span className="text-slate-300 text-xs px-2">—</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <AnimatePresence>
          {modalAgendar && (
            <ModalAgendarCita onClose={() => setModalAgendar(false)} onSuccess={() => {
              fetchCitas()
              toast.success('Cita agendada correctamente')
            }} />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {modalReprogramar && citaAReprogramar && (
            <ModalReprogramarCita
              cita={citaAReprogramar}
              onClose={() => { setModalReprogramar(false); setCitaAReprogramar(null) }}
              onSuccess={() => {
                fetchCitas()
                toast.success('Cita reprogramada correctamente')
              }}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {modalCancelar && citaACancelar && (
            <ModalConfirmar
              titulo="Cancelar cita"
              mensaje={`¿Estás seguro que deseas cancelar tu cita con Dr. ${citaACancelar.doctor.usuario.nombre} ${citaACancelar.doctor.usuario.apellido} del ${formatFecha(citaACancelar.fecha)}? Te quedarán ${cancelacionesRestantes - 1} cancelación(es) disponibles este mes.`}
              tipo="danger"
              textoConfirmar={cancelando ? 'Cancelando...' : 'Sí, cancelar cita'}
              onConfirmar={handleCancelar}
              onCancelar={() => { setModalCancelar(false); setCitaACancelar(null) }}
            />
          )}
        </AnimatePresence>

      </div>
    </PacienteLayout>
  )
}