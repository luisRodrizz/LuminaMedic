import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Calendar, Clock, User, FileText } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import DoctorLayout from '../../../components/DoctorLayout'
import ModalVerCita from '../citas/ModalVerCita'
import ModalNotaCita from '../citas/ModalNotaCita'
import api from '../../../services/api'

const estadoColors = {
  PENDIENTE: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    dot: 'bg-amber-400',
    pill: 'bg-amber-100'
  },
  CONFIRMADA: {
    bg: 'bg-[#000089]/10',
    text: 'text-[#000089]',
    border: 'border-[#000089]/20',
    dot: 'bg-[#000089]',
    pill: 'bg-[#000089]/10'
  },
  COMPLETADA: {
    bg: 'bg-[#00CCA5]/10',
    text: 'text-[#008f78]',
    border: 'border-[#00CCA5]/25',
    dot: 'bg-[#00CCA5]',
    pill: 'bg-[#00CCA5]/10'
  },
  CANCELADA: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
    dot: 'bg-red-500',
    pill: 'bg-red-100'
  },
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
          <div className="flex items-start gap-3 border-b border-red-100 bg-red-50 px-4 py-4 md:px-6">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-2xl bg-red-100">
              <span className="text-xs font-black text-red-500">✕</span>
            </div>

            <div>
              <p className="text-sm font-black text-red-700">Día bloqueado</p>
              {bloqueoDia.motivo && (
                <p className="mt-0.5 text-xs font-medium text-red-500">
                  {bloqueoDia.motivo}
                </p>
              )}
            </div>
          </div>
        )}

        {citasDia.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 px-6 py-14">
            <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-slate-100">
              <Calendar size={22} className="text-slate-400" />
            </div>

            <div className="text-center">
              <p className="text-sm font-black text-slate-700">Sin citas este día</p>
              <p className="mt-1 text-xs text-slate-400">
                No hay atenciones programadas para esta fecha.
              </p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {citasDia.map((cita) => {
              const cfg = estadoColors[cita.estado] || estadoColors.CONFIRMADA

              return (
                <div
                  key={cita.id}
                  className="flex items-center gap-3 px-4 py-4 transition hover:bg-slate-50/70 md:gap-4 md:px-6"
                >
                  <div className="w-16 flex-shrink-0 text-center">
                    <p className="font-mono text-sm font-black text-slate-800">
                      {formatHora(cita.fecha)}
                    </p>
                    <p className="mt-0.5 text-xs font-bold text-slate-400">
                      {cita.servicio.duracion} min
                    </p>
                  </div>

                  <div className={`h-12 w-1 flex-shrink-0 rounded-full ${cfg.dot}`} />

                  <div className="min-w-0 flex-1">
                    <div className="mb-0.5 flex items-center gap-2">
                      <User size={13} className="flex-shrink-0 text-slate-400" />
                      <p className="truncate text-sm font-black text-slate-800">
                        {cita.paciente.usuario.nombre} {cita.paciente.usuario.apellido}
                      </p>
                    </div>

                    <p className="ml-5 truncate text-xs font-medium text-slate-400">
                      {cita.servicio.nombre}
                    </p>

                    {cita.motivo && (
                      <p className="ml-5 mt-0.5 truncate text-xs text-slate-400">
                        "{cita.motivo}"
                      </p>
                    )}
                  </div>

                  <span
                    className={`hidden flex-shrink-0 items-center gap-2 rounded-2xl px-3 py-1.5 text-xs font-black sm:inline-flex ${cfg.bg} ${cfg.text}`}
                  >
                    <span className={`h-2 w-2 rounded-full ${cfg.dot}`} />
                    {cita.estado}
                  </span>

                  <div className="flex flex-shrink-0 items-center gap-1">
                    <button
                      onClick={() => {
                        setCitaSeleccionada(cita)
                        setModalVer(true)
                      }}
                      className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-[#00CCA5]/10 hover:text-[#008f78]"
                      title="Ver detalle"
                    >
                      <Calendar size={15} />
                    </button>

                    {cita.estado !== 'COMPLETADA' && cita.estado !== 'CANCELADA' && !cita.nota && (
                      <button
                        onClick={() => {
                          setCitaSeleccionada(cita)
                          setModalNota(true)
                        }}
                        className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-[#000089]/10 hover:text-[#000089]"
                        title="Agregar nota"
                      >
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
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-950 md:text-3xl">
              Agenda Semanal
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              Visualiza tus citas programadas, días bloqueados y atenciones por semana.
            </p>
          </div>

          {/* Controles navegación */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <button
              onClick={irHoy}
              className="flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-600 shadow-sm transition hover:border-[#00CCA5]/30 hover:bg-slate-50 hover:text-[#000089]"
            >
              Hoy
            </button>

            <div className="flex h-11 items-center overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <button
                onClick={semanaAnterior}
                className="flex h-full w-10 items-center justify-center text-slate-500 transition hover:bg-slate-50 hover:text-[#000089]"
                title="Semana anterior"
              >
                <ChevronLeft size={18} />
              </button>

              <span className="min-w-[160px] px-3 text-center text-xs font-black text-slate-700 md:min-w-[230px] md:text-sm">
                {semanaLabel()}
              </span>

              <button
                onClick={semanaSiguiente}
                className="flex h-full w-10 items-center justify-center text-slate-500 transition hover:bg-slate-50 hover:text-[#000089]"
                title="Semana siguiente"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Stats — solo desktop */}
        <div className="mb-5 hidden grid-cols-3 gap-4 md:grid">
          {[
            {
              label: 'Esta semana',
              value: totalSemana,
              color: 'bg-[#000089]',
              softBg: 'bg-[#000089]/10',
              iconText: 'text-[#000089]',
              icon: Calendar
            },
            {
              label: 'Pendientes',
              value: pendientesSemana,
              color: 'bg-amber-500',
              softBg: 'bg-amber-50',
              iconText: 'text-amber-600',
              icon: Clock
            },
            {
              label: 'Completadas',
              value: completadasSemana,
              color: 'bg-[#00A98A]',
              softBg: 'bg-[#00CCA5]/10',
              iconText: 'text-[#008f78]',
              icon: FileText
            },
          ].map((s, i) => (
            <div
              key={i}
              className="group flex items-center gap-4 rounded-3xl border border-slate-200/70 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_50px_rgba(15,23,42,0.08)]"
            >
              <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl ${s.color} shadow-lg shadow-slate-200/80`}>
                <s.icon size={20} className="text-white" />
              </div>

              <div className="min-w-0">
                <p className="truncate text-xs font-bold text-slate-400">
                  {s.label}
                </p>
                <p className="text-2xl font-black leading-tight text-slate-900">
                  {s.value}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* ── MÓVIL: selector de día + vista día ── */}
        <div className="md:hidden">
          {/* Selector días */}
          <div className="mb-4 overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white shadow-sm">
            <div className="grid grid-cols-7">
              {diasSemana.map((dia, i) => {
                const esHoyDia    = esMismaFecha(dia, hoy)
                const bloqueoDia  = getBloqueoDelDia(dia)
                const esDiaActivo = esMismaFecha(dia, diaActivo)

                return (
                  <button
                    key={i}
                    onClick={() => setDiaActivo(dia)}
                    className={`flex flex-col items-center gap-0.5 border-r border-slate-100 py-3 transition-all last:border-r-0
                      ${esDiaActivo ? 'bg-[#00CCA5]' : bloqueoDia ? 'bg-red-50/70' : esHoyDia ? 'bg-[#00CCA5]/10' : 'bg-white hover:bg-slate-50'}`}
                  >
                    <span
                      className={`text-xs font-black uppercase ${
                        esDiaActivo
                          ? 'text-white'
                          : bloqueoDia
                            ? 'text-red-500'
                            : esHoyDia
                              ? 'text-[#008f78]'
                              : 'text-slate-400'
                      }`}
                    >
                      {DIAS[i]}
                    </span>

                    <span
                      className={`text-base font-black ${
                        esDiaActivo
                          ? 'text-white'
                          : bloqueoDia
                            ? 'text-red-500'
                            : esHoyDia
                              ? 'text-[#008f78]'
                              : 'text-slate-700'
                      }`}
                    >
                      {dia.getDate()}
                    </span>

                    {getCitasDia(dia).length > 0 && !esDiaActivo && (
                      <span className={`h-1.5 w-1.5 rounded-full ${
                        bloqueoDia ? 'bg-red-400' : esHoyDia ? 'bg-[#00CCA5]' : 'bg-slate-300'
                      }`} />
                    )}

                    {bloqueoDia && !esDiaActivo && (
                      <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Vista día móvil */}
          <div className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#00CCA5]/10">
                  <Calendar size={15} className="text-[#008f78]" />
                </div>

                <p className="text-sm font-black text-slate-800">
                  {DIAS_FULL[diaActivo.getDay() === 0 ? 6 : diaActivo.getDay() - 1]},{' '}
                  {diaActivo.toLocaleDateString('es-PE', { day: 'numeric', month: 'long' })}
                </p>
              </div>

              <span className={`rounded-2xl px-3 py-1 text-xs font-black ${
                getCitasDia(diaActivo).length > 0
                  ? 'bg-[#00CCA5]/10 text-[#008f78]'
                  : 'bg-slate-100 text-slate-400'
              }`}>
                {getCitasDia(diaActivo).length} cita{getCitasDia(diaActivo).length !== 1 ? 's' : ''}
              </span>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center gap-3 py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#00CCA5] border-t-transparent" />
                <p className="text-sm text-slate-400">Cargando agenda...</p>
              </div>
            ) : (
              <VistaDiaContenido dia={diaActivo} />
            )}
          </div>
        </div>

        {/* ── DESKTOP: calendario semanal ── */}
        <div className="hidden overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white shadow-sm md:block">
          {/* Cabecera días */}
          <div className="grid grid-cols-7 border-b border-slate-100">
            {diasSemana.map((dia, i) => {
              const esHoyDia   = esMismaFecha(dia, hoy)
              const citasDia   = getCitasDia(dia)
              const bloqueoDia = getBloqueoDelDia(dia)

              return (
                <div
                  key={i}
                  className={`cursor-pointer border-r border-slate-100 px-3 py-4 text-center transition-all last:border-r-0 hover:bg-slate-50
                    ${bloqueoDia ? 'bg-red-50/70' : esHoyDia ? 'bg-[#00CCA5]/10' : 'bg-white'}`}
                  onClick={() => {
                    setDiaActivo(dia)
                    setVistaActiva('dia')
                  }}
                >
                  <p
                    className={`mb-1 text-xs font-black uppercase tracking-[0.14em] ${
                      esHoyDia
                        ? 'text-[#008f78]'
                        : bloqueoDia
                          ? 'text-red-500'
                          : 'text-slate-400'
                    }`}
                  >
                    {DIAS[i]}
                  </p>

                  <p
                    className={`text-2xl font-black ${
                      esHoyDia
                        ? 'text-[#008f78]'
                        : bloqueoDia
                          ? 'text-red-500'
                          : 'text-slate-800'
                    }`}
                  >
                    {dia.getDate()}
                  </p>

                  <p className="mt-0.5 text-xs font-bold text-slate-400">
                    {formatFechaHeader(dia).split(' ')[1]}
                  </p>

                  {bloqueoDia ? (
                    <div className="mt-2 flex justify-center">
                      <span className="rounded-full bg-red-100 px-2.5 py-1 text-[10px] font-black text-red-600">
                        Bloqueado
                      </span>
                    </div>
                  ) : citasDia.length > 0 && (
                    <div className="mt-2 flex justify-center">
                      <span className={`rounded-full px-2.5 py-1 text-[10px] font-black ${
                        esHoyDia
                          ? 'bg-[#00CCA5]/15 text-[#008f78]'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {citasDia.length} cita{citasDia.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Cuerpo citas por día */}
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16">
              <div className="h-9 w-9 animate-spin rounded-full border-2 border-[#00CCA5] border-t-transparent" />
              <p className="text-sm text-slate-400">Cargando agenda...</p>
            </div>
          ) : (
            <div className="grid min-h-[420px] grid-cols-7">
              {diasSemana.map((dia, i) => {
                const citasDia   = getCitasDia(dia)
                const esHoyDia   = esMismaFecha(dia, hoy)
                const bloqueoDia = getBloqueoDelDia(dia)

                return (
                  <div
                    key={i}
                    className={`min-h-[420px] border-r border-slate-100 p-2.5 last:border-r-0
                      ${esHoyDia ? 'bg-[#00CCA5]/5' : ''}
                      ${bloqueoDia ? 'bg-red-50/20' : ''}`}
                  >
                    {bloqueoDia ? (
                      <div className="flex h-full flex-col items-center justify-center gap-2 px-1">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-100">
                          <span className="text-sm font-black text-red-500">✕</span>
                        </div>

                        <p className="text-center text-xs font-bold leading-tight text-red-500">
                          {bloqueoDia.motivo || 'No disponible'}
                        </p>
                      </div>
                    ) : citasDia.length === 0 ? (
                      <div className="flex h-full items-center justify-center">
                        <p className="text-center text-xs font-bold text-slate-300">
                          Sin citas
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {citasDia.map((cita) => {
                          const cfg = estadoColors[cita.estado] || estadoColors.CONFIRMADA

                          return (
                            <motion.button
                              key={cita.id}
                              initial={{ opacity: 0, y: 4 }}
                              animate={{ opacity: 1, y: 0 }}
                              onClick={() => {
                                setCitaSeleccionada(cita)
                                setModalVer(true)
                              }}
                              className={`group w-full rounded-2xl border p-3 text-left transition-all hover:-translate-y-0.5 hover:shadow-sm ${cfg.bg} ${cfg.border}`}
                            >
                              <div className="mb-1.5 flex items-center gap-1.5">
                                <span className={`h-2 w-2 flex-shrink-0 rounded-full ${cfg.dot}`} />
                                <span className={`font-mono text-xs font-black ${cfg.text}`}>
                                  {formatHora(cita.fecha)}
                                </span>
                              </div>

                              <p className="truncate text-xs font-black leading-tight text-slate-800">
                                {cita.paciente.usuario.nombre} {cita.paciente.usuario.apellido}
                              </p>

                              <p className="mt-0.5 truncate text-xs font-medium text-slate-500">
                                {cita.servicio.nombre}
                              </p>

                              {cita.estado !== 'COMPLETADA' && cita.estado !== 'CANCELADA' && !cita.nota && (
                                <div
                                  role="button"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setCitaSeleccionada(cita)
                                    setModalNota(true)
                                  }}
                                  className="mt-2 flex cursor-pointer items-center gap-1 text-xs font-bold text-slate-400 opacity-0 transition hover:text-[#008f78] group-hover:opacity-100"
                                >
                                  <FileText size={11} />
                                  Nota
                                </div>
                              )}

                              {cita.nota && (
                                <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-[#00CCA5]/10 px-2 py-1 text-[10px] font-black text-[#008f78]">
                                  <FileText size={10} />
                                  Nota
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
              className="mt-5 hidden overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white shadow-sm md:block"
            >
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#00CCA5]/10">
                    <Calendar size={17} className="text-[#008f78]" />
                  </div>

                  <div>
                    <p className="text-sm font-black text-slate-900">
                      {DIAS_FULL[diaActivo.getDay() === 0 ? 6 : diaActivo.getDay() - 1]},{' '}
                      {diaActivo.toLocaleDateString('es-PE', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                    <p className="text-xs text-slate-400">
                      Detalle de citas del día seleccionado.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setVistaActiva('semana')}
                  className="rounded-xl px-3 py-1.5 text-xs font-black text-slate-400 transition hover:bg-slate-50 hover:text-slate-700"
                >
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
            <ModalVerCita
              citaId={citaSeleccionada.id}
              onClose={() => setModalVer(false)}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {modalNota && citaSeleccionada && (
            <ModalNotaCita
              cita={citaSeleccionada}
              onClose={() => setModalNota(false)}
              onSuccess={() => {
                fetchCitas()
                toast.success('Nota clínica guardada correctamente')
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </DoctorLayout>
  )
}