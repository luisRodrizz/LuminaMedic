import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Calendar, Clock, User, FileText } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import DoctorLayout from '../../../components/DoctorLayout'
import ModalVerCita from '../citas/ModalVerCita'
import ModalNotaCita from '../citas/ModalNotaCita'
import api from '../../../services/api'

const estadoColors = {
  PENDIENTE:  { bg: 'bg-yellow-50',  text: 'text-yellow-700',  border: 'border-yellow-200', dot: 'bg-yellow-400', pill: 'bg-yellow-100' },
  CONFIRMADA: { bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200',   dot: 'bg-blue-400',   pill: 'bg-blue-100'   },
  COMPLETADA: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200',dot: 'bg-emerald-400',pill: 'bg-emerald-100' },
  CANCELADA:  { bg: 'bg-red-50',     text: 'text-red-700',     border: 'border-red-200',    dot: 'bg-red-400',    pill: 'bg-red-100'    },
}

const DIAS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
const DIAS_FULL = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

const getLunes = (fecha) => {
  const d = new Date(fecha)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

const formatFechaHeader = (fecha) => fecha.toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })

const esMismaFecha = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate()

export default function Agenda() {
  const [semanaBase, setSemanaBase] = useState(() => getLunes(new Date()))
  const [citas, setCitas] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalVer, setModalVer] = useState(false)
  const [modalNota, setModalNota] = useState(false)
  const [citaSeleccionada, setCitaSeleccionada] = useState(null)
  const [vistaActiva, setVistaActiva] = useState('semana')
  const [diaActivo, setDiaActivo] = useState(new Date())
  const [bloqueos, setBloqueos] = useState([])

  const hoy = new Date()

  const diasSemana = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(semanaBase)
    d.setDate(semanaBase.getDate() + i)
    return d
  })

  const fetchCitas = async () => {
    setLoading(true)
    try {
      const inicio = diasSemana[0].toISOString().split('T')[0]
      const fin    = diasSemana[6].toISOString().split('T')[0]
      const [resCitas, resBloqueos] = await Promise.all([
        api.get(`/citas?page=1&limit=200&inicio=${inicio}&fin=${fin}`),
        api.get('/horarios/me/bloqueos')
      ])
      setCitas(resCitas.data.data)
      setBloqueos(resBloqueos.data)
    } catch {
      toast.error('Error al cargar la agenda')
    } finally {
      setLoading(false)
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchCitas() }, [semanaBase])

  const getCitasDia = (dia) =>
    citas
      .filter(c => esMismaFecha(new Date(c.fecha), dia))
      .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))

  const getBloqueoDelDia = (dia) => {
    const inicioDia = new Date(dia.getFullYear(), dia.getMonth(), dia.getDate(), 0, 0, 0)
    const finDia    = new Date(dia.getFullYear(), dia.getMonth(), dia.getDate(), 23, 59, 59)
    return bloqueos.find(b =>
      new Date(b.fechaInicio) <= finDia && new Date(b.fechaFin) >= inicioDia
    ) || null
  }

  const semanaAnterior = () => {
    const d = new Date(semanaBase)
    d.setDate(d.getDate() - 7)
    setSemanaBase(d)
  }

  const semanaSiguiente = () => {
    const d = new Date(semanaBase)
    d.setDate(d.getDate() + 7)
    setSemanaBase(d)
  }

  const irHoy = () => {
    setSemanaBase(getLunes(new Date()))
    setDiaActivo(new Date())
  }

  const formatHora = (fecha) => new Date(fecha).toLocaleTimeString('es-PE', {
    hour: '2-digit', minute: '2-digit'
  })

  const semanaLabel = () => {
    const ini = diasSemana[0]
    const fin = diasSemana[6]
    if (ini.getMonth() === fin.getMonth()) {
      return `${ini.getDate()} — ${fin.getDate()} de ${fin.toLocaleDateString('es-PE', { month: 'long', year: 'numeric' })}`
    }
    return `${ini.toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })} — ${fin.toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' })}`
  }

  const totalSemana = citas.length
  const pendientesSemana = citas.filter(c => c.estado === 'PENDIENTE').length
  const completadasSemana = citas.filter(c => c.estado === 'COMPLETADA').length

  // ── Contenido de vista día — reutilizado en mobile y desktop ─────────────────
  const VistaDiaContenido = ({ dia }) => {
    const bloqueoDia = getBloqueoDelDia(dia)
    const citasDia = getCitasDia(dia)
    return (
      <>
        {/* Banner bloqueo */}
        {bloqueoDia && (
          <div className="flex items-center gap-3 px-4 md:px-6 py-3 bg-red-50 border-b border-red-100">
            <div className="w-6 h-6 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-red-500 text-xs font-bold">✕</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-red-600">Día bloqueado</p>
              {bloqueoDia.motivo && <p className="text-xs text-red-400">{bloqueoDia.motivo}</p>}
            </div>
          </div>
        )}

        {citasDia.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 gap-3">
            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center">
              <Calendar size={20} className="text-slate-400" />
            </div>
            <p className="text-slate-500 font-medium text-sm">Sin citas este día</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {citasDia.map((cita) => {
              const cfg = estadoColors[cita.estado]
              return (
                <div key={cita.id} className="flex items-center gap-3 md:gap-4 px-4 md:px-6 py-4 hover:bg-slate-50/70 transition-colors">
                  <div className="w-14 flex-shrink-0 text-center">
                    <p className="text-sm font-bold text-slate-700">{formatHora(cita.fecha)}</p>
                    <p className="text-xs text-slate-400">{cita.servicio.duracion} min</p>
                  </div>
                  <div className={`w-1 h-12 rounded-full flex-shrink-0 ${cfg.dot}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <User size={13} className="text-slate-400 flex-shrink-0" />
                      <p className="text-sm font-semibold text-slate-800 truncate">
                        {cita.paciente.usuario.nombre} {cita.paciente.usuario.apellido}
                      </p>
                    </div>
                    <p className="text-xs text-slate-400 ml-5">{cita.servicio.nombre}</p>
                    {cita.motivo && (
                      <p className="text-xs text-slate-400 ml-5 mt-0.5 truncate">"{cita.motivo}"</p>
                    )}
                  </div>
                  <span className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium flex-shrink-0 ${cfg.bg} ${cfg.text}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                    {cita.estado}
                  </span>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={() => { setCitaSeleccionada(cita); setModalVer(true) }}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      title="Ver detalle">
                      <Calendar size={15} />
                    </button>
                    {cita.estado !== 'COMPLETADA' && cita.estado !== 'CANCELADA' && !cita.nota && (
                      <button onClick={() => { setCitaSeleccionada(cita); setModalNota(true) }}
                        className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                        title="Agregar nota">
                        <FileText size={15} />
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </>
    )
  }

  return (
    <DoctorLayout>
      <div className="page-enter">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
              <Calendar size={20} className="text-emerald-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Agenda Semanal</h1>
              <p className="text-slate-400 text-sm mt-0.5 hidden sm:block">Vista de tus citas por semana</p>
            </div>
          </div>

          {/* Controles navegación */}
          <div className="flex items-center gap-2">
            <button onClick={irHoy}
              className="px-3 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all">
              Hoy
            </button>
            <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden">
              <button onClick={semanaAnterior}
                className="p-2 text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-all">
                <ChevronLeft size={18} />
              </button>
              <span className="px-2 md:px-3 text-xs md:text-sm font-medium text-slate-700 min-w-[100px] md:min-w-[200px] text-center">
                {semanaLabel()}
              </span>
              <button onClick={semanaSiguiente}
                className="p-2 text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-all">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Stats — solo desktop */}
        <div className="hidden md:grid grid-cols-3 gap-4 mb-5">
          {[
            { label: 'Esta semana', value: totalSemana,       color: 'bg-slate-800',   icon: Calendar },
            { label: 'Pendientes',  value: pendientesSemana,  color: 'bg-yellow-500',  icon: Clock    },
            { label: 'Completadas', value: completadasSemana, color: 'bg-emerald-500', icon: FileText },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center gap-3 hover:shadow-sm transition-all">
              <div className={`w-9 h-9 ${s.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                <s.icon size={16} className="text-white" />
              </div>
              <div>
                <p className="text-slate-400 text-xs">{s.label}</p>
                <p className="text-xl font-bold text-slate-800">{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── MÓVIL: selector de día + vista día ── */}
        <div className="md:hidden">
          {/* Selector días */}
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden mb-4">
            <div className="grid grid-cols-7">
              {diasSemana.map((dia, i) => {
                const esHoyDia    = esMismaFecha(dia, hoy)
                const bloqueoDia  = getBloqueoDelDia(dia)
                const esDiaActivo = esMismaFecha(dia, diaActivo)
                return (
                  <button key={i}
                    onClick={() => setDiaActivo(dia)}
                    className={`py-3 flex flex-col items-center gap-0.5 transition-all border-r last:border-r-0 border-slate-100
                      ${esDiaActivo ? 'bg-emerald-500' : bloqueoDia ? 'bg-red-50/60' : esHoyDia ? 'bg-emerald-50' : ''}`}>
                    <span className={`text-xs font-semibold uppercase ${esDiaActivo ? 'text-white' : bloqueoDia ? 'text-red-400' : esHoyDia ? 'text-emerald-600' : 'text-slate-400'}`}>
                      {DIAS[i]}
                    </span>
                    <span className={`text-base font-bold ${esDiaActivo ? 'text-white' : bloqueoDia ? 'text-red-400' : esHoyDia ? 'text-emerald-600' : 'text-slate-700'}`}>
                      {dia.getDate()}
                    </span>
                    {getCitasDia(dia).length > 0 && !esDiaActivo && (
                      <span className={`w-1.5 h-1.5 rounded-full ${bloqueoDia ? 'bg-red-400' : esHoyDia ? 'bg-emerald-400' : 'bg-slate-300'}`} />
                    )}
                    {bloqueoDia && !esDiaActivo && (
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Vista día móvil */}
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Calendar size={15} className="text-emerald-500" />
                <p className="text-sm font-semibold text-slate-700">
                  {DIAS_FULL[diaActivo.getDay() === 0 ? 6 : diaActivo.getDay() - 1]},{' '}
                  {diaActivo.toLocaleDateString('es-PE', { day: 'numeric', month: 'long' })}
                </p>
              </div>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                getCitasDia(diaActivo).length > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'
              }`}>
                {getCitasDia(diaActivo).length} cita{getCitasDia(diaActivo).length !== 1 ? 's' : ''}
              </span>
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-10 gap-3">
                <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-slate-400 text-sm">Cargando...</p>
              </div>
            ) : (
              <VistaDiaContenido dia={diaActivo} />
            )}
          </div>
        </div>

        {/* ── DESKTOP: calendario semanal ── */}
        <div className="hidden md:block bg-white rounded-2xl border border-slate-100 overflow-hidden">

          {/* Cabecera días */}
          <div className="grid grid-cols-7 border-b border-slate-100">
            {diasSemana.map((dia, i) => {
              const esHoyDia   = esMismaFecha(dia, hoy)
              const citasDia   = getCitasDia(dia)
              const bloqueoDia = getBloqueoDelDia(dia)
              return (
                <div key={i}
                  className={`px-3 py-3 text-center border-r last:border-r-0 border-slate-100 cursor-pointer hover:bg-slate-50 transition-all
                    ${bloqueoDia ? 'bg-red-50/60' : esHoyDia ? 'bg-emerald-50' : ''}`}
                  onClick={() => { setDiaActivo(dia); setVistaActiva('dia') }}
                >
                  <p className={`text-xs font-semibold uppercase tracking-wider mb-1
                    ${esHoyDia ? 'text-emerald-600' : bloqueoDia ? 'text-red-400' : 'text-slate-400'}`}>
                    {DIAS[i]}
                  </p>
                  <p className={`text-lg font-bold
                    ${esHoyDia ? 'text-emerald-600' : bloqueoDia ? 'text-red-400' : 'text-slate-700'}`}>
                    {dia.getDate()}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">{formatFechaHeader(dia).split(' ')[1]}</p>
                  {bloqueoDia ? (
                    <div className="mt-1.5 flex justify-center">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-500">Bloqueado</span>
                    </div>
                  ) : citasDia.length > 0 && (
                    <div className="mt-1.5 flex justify-center">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${esHoyDia ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                        {citasDia.length}
                      </span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Cuerpo citas por día */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-slate-400 text-sm">Cargando agenda...</p>
            </div>
          ) : (
            <div className="grid grid-cols-7 min-h-[400px]">
              {diasSemana.map((dia, i) => {
                const citasDia   = getCitasDia(dia)
                const esHoyDia   = esMismaFecha(dia, hoy)
                const bloqueoDia = getBloqueoDelDia(dia)
                return (
                  <div key={i}
                    className={`border-r last:border-r-0 border-slate-100 p-2 min-h-[400px]
                      ${esHoyDia ? 'bg-emerald-50/30' : ''}
                      ${bloqueoDia ? 'bg-red-50/20' : ''}`}>
                    {bloqueoDia ? (
                      <div className="h-full flex flex-col items-center justify-center gap-2 px-1">
                        <div className="w-8 h-8 bg-red-100 rounded-xl flex items-center justify-center">
                          <span className="text-red-400 text-sm">✕</span>
                        </div>
                        <p className="text-red-400 text-xs font-medium text-center leading-tight">
                          {bloqueoDia.motivo || 'No disponible'}
                        </p>
                      </div>
                    ) : citasDia.length === 0 ? (
                      <div className="h-full flex items-center justify-center">
                        <p className="text-slate-300 text-xs text-center">Sin citas</p>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        {citasDia.map((cita) => {
                          const cfg = estadoColors[cita.estado]
                          return (
                            <motion.button
                              key={cita.id}
                              initial={{ opacity: 0, y: 4 }}
                              animate={{ opacity: 1, y: 0 }}
                              onClick={() => { setCitaSeleccionada(cita); setModalVer(true) }}
                              className={`w-full text-left p-2 rounded-xl border ${cfg.bg} ${cfg.border} hover:shadow-sm transition-all group`}
                            >
                              <div className="flex items-center gap-1 mb-1">
                                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
                                <span className={`text-xs font-bold ${cfg.text}`}>{formatHora(cita.fecha)}</span>
                              </div>
                              <p className="text-xs text-slate-700 font-medium leading-tight truncate">
                                {cita.paciente.usuario.nombre} {cita.paciente.usuario.apellido}
                              </p>
                              <p className="text-xs text-slate-400 truncate mt-0.5">{cita.servicio.nombre}</p>
                              {cita.estado !== 'COMPLETADA' && cita.estado !== 'CANCELADA' && !cita.nota && (
                                <div
                                  role="button"
                                  onClick={(e) => { e.stopPropagation(); setCitaSeleccionada(cita); setModalNota(true) }}
                                  className="mt-1.5 flex items-center gap-1 text-xs text-slate-400 hover:text-emerald-600 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                                >
                                  <FileText size={10} /> Nota
                                </div>
                              )}
                              {cita.nota && (
                                <span className="mt-1 inline-flex items-center gap-0.5 text-xs text-emerald-600">
                                  <FileText size={10} /> ✓
                                </span>
                              )}
                            </motion.button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Vista día desktop — panel inferior al hacer click */}
        <AnimatePresence>
          {vistaActiva === 'dia' && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ duration: 0.2 }}
              className="hidden md:block mt-5 bg-white rounded-2xl border border-slate-100 overflow-hidden"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-emerald-500" />
                  <p className="text-sm font-semibold text-slate-700">
                    {DIAS_FULL[diaActivo.getDay() === 0 ? 6 : diaActivo.getDay() - 1]},{' '}
                    {diaActivo.toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <button onClick={() => setVistaActiva('semana')}
                  className="text-xs text-slate-400 hover:text-slate-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-50">
                  Cerrar
                </button>
              </div>
              <VistaDiaContenido dia={diaActivo} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modales */}
        <AnimatePresence>
          {modalVer && citaSeleccionada && (
            <ModalVerCita citaId={citaSeleccionada.id} onClose={() => setModalVer(false)} />
          )}
        </AnimatePresence>
        <AnimatePresence>
          {modalNota && citaSeleccionada && (
            <ModalNotaCita cita={citaSeleccionada} onClose={() => setModalNota(false)} onSuccess={() => {
              fetchCitas()
              toast.success('Nota clínica guardada correctamente')
            }} />
          )}
        </AnimatePresence>

      </div>
    </DoctorLayout>
  )
}