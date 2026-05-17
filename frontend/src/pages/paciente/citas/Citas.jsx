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
    ? { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-100' }
    : cancelacionesRestantes === 1
      ? { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100' }
      : { bg: 'bg-slate-50', text: 'text-slate-500', border: 'border-slate-200' }

  return (
    <PacienteLayout>
      <div className="page-enter">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-950 md:text-3xl">
              Mis Citas
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              Revisa, agenda, reprograma o cancela tus citas médicas según disponibilidad.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className={`flex items-center gap-2 rounded-2xl border px-4 py-2 text-xs font-black ${badgeCancelaciones.bg} ${badgeCancelaciones.text} ${badgeCancelaciones.border}`}>
              {cancelacionesRestantes === 0 && <AlertTriangle size={14} />}
              {cancelacionesRestantes === MAX_CANCELACIONES
                ? `${MAX_CANCELACIONES} cancelaciones disponibles`
                : `${cancelacionesRestantes} cancelación(es) restante(s) este mes`
              }
            </div>

            <button
              onClick={() => setModalAgendar(true)}
              className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#000089] px-5 text-sm font-black text-white shadow-lg shadow-[#000089]/20 transition hover:bg-[#000070] hover:ring-4 hover:ring-[#00CCA5]/15"
            >
              <Plus size={17} />
              Agendar Cita
            </button>
          </div>
        </div>

        {/* Card tabla */}
        <div className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 md:flex-row md:items-center md:justify-between md:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-[#000089]/10">
                <Calendar size={18} className="text-[#000089]" />
              </div>

              <div>
                <p className="text-base font-black text-slate-900">
                  Historial y agenda de citas
                </p>
                <p className="text-xs text-slate-400">
                  Filtra tus citas por estado y revisa las acciones disponibles.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2">
                <Filter size={15} className="flex-shrink-0 text-slate-400" />

                <select
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-600 outline-none transition focus:border-[#00CCA5] focus:bg-white focus:ring-4 focus:ring-[#00CCA5]/15 sm:w-auto"
                >
                  <option value="">Todos los estados</option>
                  <option value="PENDIENTE">Pendiente</option>
                  <option value="CONFIRMADA">Confirmada</option>
                  <option value="COMPLETADA">Completada</option>
                  <option value="CANCELADA">Cancelada</option>
                </select>
              </div>

              <span className="w-fit rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-500">
                {citasFiltradas.length} cita{citasFiltradas.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16">
              <div className="h-9 w-9 animate-spin rounded-full border-2 border-[#00CCA5] border-t-transparent" />
              <p className="text-sm text-slate-400">Cargando citas...</p>
            </div>
          ) : citasFiltradas.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 px-6 py-16">
              <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-slate-100">
                <Calendar size={24} className="text-slate-400" />
              </div>

              <div className="text-center">
                <p className="text-sm font-black text-slate-700">
                  No tienes citas registradas
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Agenda tu primera cita médica con el botón superior.
                </p>
              </div>

              <button
                onClick={() => setModalAgendar(true)}
                className="mt-1 flex items-center gap-2 rounded-xl bg-[#000089] px-4 py-2 text-xs font-black text-white transition hover:bg-[#000070]"
              >
                <Plus size={14} />
                Agendar cita
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[960px]">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/80">
                    <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">
                      Fecha
                    </th>
                    <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">
                      Doctor
                    </th>
                    <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">
                      Servicio
                    </th>
                    <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">
                      Motivo
                    </th>
                    <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">
                      Estado
                    </th>
                    <th className="px-6 py-4 text-right text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">
                      Acciones
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {citasFiltradas.map((cita) => {
                    const cfg = estadoColors[cita.estado] || estadoColors.CONFIRMADA

                    return (
                      <tr
                        key={cita.id}
                        className="transition-colors hover:bg-slate-50/70"
                      >
                        <td className="px-6 py-4">
                          <span className="whitespace-nowrap font-mono text-sm font-bold text-slate-600">
                            {formatFecha(cita.fecha)}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[#00CCA5]/20 bg-[#00CCA5]/10">
                              {cita.doctor.foto ? (
                                <img
                                  src={cita.doctor.foto}
                                  alt=""
                                  className="h-full w-full object-cover"
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
                              <p className="text-xs text-slate-400">
                                Profesional asignado
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <span className="inline-flex rounded-2xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-600">
                            {cita.servicio.nombre}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <p className="max-w-[230px] truncate text-sm font-medium text-slate-500">
                            {cita.motivo || '—'}
                          </p>
                        </td>

                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-2 rounded-2xl px-3 py-1.5 text-xs font-black ${cfg.bg} ${cfg.text}`}>
                            <span className={`h-2 w-2 rounded-full ${cfg.dot}`} />
                            {cita.estado}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end">
                            {puedeAccion(cita.estado) ? (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => {
                                    setCitaAReprogramar(cita)
                                    setModalReprogramar(true)
                                  }}
                                  className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-[#000089]/10 hover:text-[#000089]"
                                  title="Reprogramar cita"
                                >
                                  <RefreshCw size={15} />
                                </button>

                                <button
                                  onClick={() => {
                                    setCitaACancelar(cita)
                                    setModalCancelar(true)
                                  }}
                                  disabled={cancelacionesRestantes === 0}
                                  className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30"
                                  title={cancelacionesRestantes === 0 ? 'Límite de cancelaciones alcanzado' : 'Cancelar cita'}
                                >
                                  <XCircle size={15} />
                                </button>
                              </div>
                            ) : (
                              <span className="rounded-xl bg-slate-50 px-3 py-1 text-xs font-bold text-slate-300">
                                —
                              </span>
                            )}
                          </div>
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
            <ModalAgendarCita
              onClose={() => setModalAgendar(false)}
              onSuccess={() => {
                fetchCitas()
                toast.success('Cita agendada correctamente')
              }}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {modalReprogramar && citaAReprogramar && (
            <ModalReprogramarCita
              cita={citaAReprogramar}
              onClose={() => {
                setModalReprogramar(false)
                setCitaAReprogramar(null)
              }}
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
              onCancelar={() => {
                setModalCancelar(false)
                setCitaACancelar(null)
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </PacienteLayout>
  )
}