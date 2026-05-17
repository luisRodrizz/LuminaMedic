import { useState, useEffect } from 'react'
import {
  Clock,
  Plus,
  Pencil,
  Trash2,
  ChevronDown,
  Stethoscope,
  Ban,
  CalendarOff,
  CalendarDays,
  ShieldCheck,
  Activity
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import AdminLayout from '../../../components/AdminLayout'
import ModalConfirmar from '../../../components/ModalConfirmar'
import ModalCrearHorario from './ModalCrearHorario'
import ModalEditarHorario from './ModalEditarHorario'
import ModalCrearBloqueo from './ModalCrearBloqueo'
import api from '../../../services/api'

const DIAS = [
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
  'Domingo'
]

const estadoBadge = {
  true: {
    bg: 'bg-[#00CCA5]/10',
    text: 'text-[#008f78]',
    dot: 'bg-[#00CCA5]',
    label: 'Activo'
  },
  false: {
    bg: 'bg-slate-100',
    text: 'text-slate-500',
    dot: 'bg-slate-400',
    label: 'Inactivo'
  }
}

const formatFecha = (fecha) =>
  new Date(fecha).toLocaleDateString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })

export default function Horarios() {
  const [doctores, setDoctores] = useState([])
  const [doctorSeleccionado, setDoctorSeleccionado] = useState(null)
  const [horarios, setHorarios] = useState([])
  const [bloqueos, setBloqueos] = useState([])
  const [loadingDoctores, setLoadingDoctores] = useState(true)
  const [loadingHorarios, setLoadingHorarios] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [modalCrear, setModalCrear] = useState(false)
  const [modalEditar, setModalEditar] = useState(null)
  const [modalEliminar, setModalEliminar] = useState(null)
  const [modalCrearBloqueo, setModalCrearBloqueo] = useState(false)
  const [modalEliminarBloqueo, setModalEliminarBloqueo] = useState(null)

  useEffect(() => {
    const fetchDoctores = async () => {
      try {
        const res = await api.get('/doctores?page=1&limit=100')
        setDoctores(res.data.data)
      } catch {
        toast.error('Error al cargar los doctores')
      } finally {
        setLoadingDoctores(false)
      }
    }

    fetchDoctores()
  }, [])

  const fetchHorarios = async (doctor) => {
    setLoadingHorarios(true)

    try {
      const [horariosRes, bloqueosRes] = await Promise.all([
        api.get(`/horarios/${doctor.id}`),
        api.get(`/horarios/${doctor.id}/bloqueos`)
      ])

      setHorarios(horariosRes.data)
      setBloqueos(bloqueosRes.data)
    } catch {
      toast.error('Error al cargar los horarios')
    } finally {
      setLoadingHorarios(false)
    }
  }

  const seleccionarDoctor = (doctor) => {
    setDoctorSeleccionado(doctor)
    setDropdownOpen(false)
    fetchHorarios(doctor)
  }

  const handleEliminar = async () => {
    try {
      await api.delete(`/horarios/${modalEliminar.id}`)
      toast.success('Horario eliminado')
      setModalEliminar(null)
      fetchHorarios(doctorSeleccionado)
    } catch {
      toast.error('Error al eliminar el horario')
    }
  }

  const handleEliminarBloqueo = async () => {
    try {
      await api.delete(`/horarios/bloqueos/${modalEliminarBloqueo.id}`)
      toast.success('Bloqueo eliminado')
      setModalEliminarBloqueo(null)
      fetchHorarios(doctorSeleccionado)
    } catch {
      toast.error('Error al eliminar el bloqueo')
    }
  }

  const horariosCompletos = DIAS.map((dia, i) => ({
    dia,
    diaSemana: i,
    horario: horarios.find((h) => h.diaSemana === i) || null
  }))

  const hoy = new Date()
  const bloqueosActivos = bloqueos.filter((b) => new Date(b.fechaFin) >= hoy)

  return (
    <AdminLayout>
      <div className="page-enter">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-950 md:text-3xl">
              Horarios
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              Gestiona los horarios de atención médica y bloqueos de disponibilidad por doctor.
            </p>
          </div>

          {doctorSeleccionado && (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <button
                onClick={() => setModalCrearBloqueo(true)}
                className="flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-600 shadow-sm transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
              >
                <Ban size={16} />
                Bloquear días
              </button>

              <button
                onClick={() => setModalCrear(true)}
                disabled={horarios.length >= 7}
                className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#000089] px-4 text-sm font-black text-white shadow-lg shadow-[#000089]/20 transition hover:bg-[#000070] hover:ring-4 hover:ring-[#00CCA5]/15 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Plus size={16} />
                Agregar horario
              </button>
            </div>
          )}
        </div>

        {/* Selector de doctor */}
        <div className="mb-6 rounded-[2rem] border border-slate-200/80 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#00CCA5]/10">
              <Stethoscope size={18} className="text-[#008f78]" />
            </div>

            <div>
              <p className="text-sm font-black text-slate-900">
                Seleccionar doctor
              </p>
              <p className="text-xs text-slate-400">
                Elige un profesional para administrar su disponibilidad.
              </p>
            </div>
          </div>

          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm transition hover:bg-white hover:ring-4 hover:ring-[#00CCA5]/10"
            >
              {doctorSeleccionado ? (
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#00CCA5]/10">
                    {doctorSeleccionado.foto ? (
                      <img
                        src={doctorSeleccionado.foto}
                        className="h-full w-full object-cover"
                        alt=""
                      />
                    ) : (
                      <span className="text-xs font-black text-[#008f78]">
                        {doctorSeleccionado.usuario.nombre[0]}
                        {doctorSeleccionado.usuario.apellido[0]}
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 text-left">
                    <p className="truncate text-sm font-black text-slate-800">
                      Dr. {doctorSeleccionado.usuario.nombre}{' '}
                      {doctorSeleccionado.usuario.apellido}
                    </p>
                    <p className="truncate text-xs text-slate-400">
                      {doctorSeleccionado.especialidad}
                    </p>
                  </div>
                </div>
              ) : (
                <span className="text-sm font-medium text-slate-400">
                  Selecciona un doctor para ver sus horarios
                </span>
              )}

              <ChevronDown
                size={17}
                className={`ml-2 flex-shrink-0 text-slate-400 transition-transform ${
                  dropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 right-0 top-full z-20 mt-2 max-h-72 overflow-hidden overflow-y-auto rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/10"
                >
                  {loadingDoctores ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="h-7 w-7 animate-spin rounded-full border-2 border-[#00CCA5] border-t-transparent" />
                    </div>
                  ) : doctores.length === 0 ? (
                    <div className="py-8 text-center text-sm text-slate-400">
                      No hay doctores registrados
                    </div>
                  ) : (
                    doctores.map((doc) => (
                      <button
                        key={doc.id}
                        onClick={() => seleccionarDoctor(doc)}
                        className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50 ${
                          doctorSeleccionado?.id === doc.id
                            ? 'bg-[#00CCA5]/10'
                            : ''
                        }`}
                      >
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#00CCA5]/10">
                          {doc.foto ? (
                            <img
                              src={doc.foto}
                              className="h-full w-full object-cover"
                              alt=""
                            />
                          ) : (
                            <span className="text-xs font-black text-[#008f78]">
                              {doc.usuario.nombre[0]}
                              {doc.usuario.apellido[0]}
                            </span>
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-black text-slate-800">
                            Dr. {doc.usuario.nombre} {doc.usuario.apellido}
                          </p>
                          <p className="truncate text-xs text-slate-400">
                            {doc.especialidad}
                          </p>
                        </div>
                      </button>
                    ))
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {!doctorSeleccionado ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-[2rem] border border-slate-200/80 bg-white px-6 py-16 shadow-sm">
            <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-slate-100">
              <Stethoscope size={24} className="text-slate-400" />
            </div>

            <div className="text-center">
              <p className="text-sm font-black text-slate-700">
                Selecciona un doctor
              </p>
              <p className="mt-1 text-xs text-slate-400">
                para ver y gestionar sus horarios de atención.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Resumen */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#000089] shadow-lg shadow-[#000089]/15">
                    <Clock size={20} className="text-white" />
                  </div>

                  <div>
                    <p className="text-xs font-bold text-slate-400">
                      Días configurados
                    </p>
                    <p className="text-2xl font-black text-slate-950">
                      {horarios.length}/7
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#00CCA5] shadow-lg shadow-[#00CCA5]/20">
                    <ShieldCheck size={20} className="text-white" />
                  </div>

                  <div>
                    <p className="text-xs font-bold text-slate-400">
                      Horarios activos
                    </p>
                    <p className="text-2xl font-black text-slate-950">
                      {horarios.filter((h) => h.activo).length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500 shadow-lg shadow-red-100">
                    <CalendarOff size={20} className="text-white" />
                  </div>

                  <div>
                    <p className="text-xs font-bold text-slate-400">
                      Bloqueos activos
                    </p>
                    <p className="text-2xl font-black text-slate-950">
                      {bloqueosActivos.length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabla horarios semanales */}
            <div className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white shadow-sm">
              <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-5 md:flex-row md:items-center md:justify-between md:px-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#00CCA5]/10">
                    <CalendarDays size={18} className="text-[#008f78]" />
                  </div>

                  <div>
                    <p className="text-sm font-black text-slate-900">
                      Horarios de Dr. {doctorSeleccionado.usuario.nombre}{' '}
                      {doctorSeleccionado.usuario.apellido}
                    </p>
                    <p className="text-xs text-slate-400">
                      Disponibilidad semanal de atención médica
                    </p>
                  </div>
                </div>

                <div className="inline-flex w-fit items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2">
                  <span className="h-2 w-2 rounded-full bg-[#00CCA5]" />
                  <span className="text-xs font-bold text-slate-500">
                    {horarios.length}/7 días
                  </span>
                </div>
              </div>

              {loadingHorarios ? (
                <div className="flex flex-col items-center justify-center gap-3 py-12">
                  <div className="h-9 w-9 animate-spin rounded-full border-2 border-[#00CCA5] border-t-transparent" />
                  <p className="text-sm text-slate-400">Cargando horarios...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px]">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/80">
                        <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">
                          Día
                        </th>
                        <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">
                          Inicio
                        </th>
                        <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">
                          Fin
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
                      {horariosCompletos.map(({ dia, diaSemana, horario }) => {
                        const badge = horario ? estadoBadge[horario.activo] : null

                        return (
                          <tr
                            key={diaSemana}
                            className="transition-colors hover:bg-slate-50/70"
                          >
                            <td className="px-6 py-4">
                              <span className="text-sm font-black text-slate-800">
                                {dia}
                              </span>
                            </td>

                            <td className="px-6 py-4">
                              <span className="inline-flex rounded-2xl bg-slate-100 px-3 py-1.5 font-mono text-sm font-black text-slate-700">
                                {horario ? horario.horaInicio : '—'}
                              </span>
                            </td>

                            <td className="px-6 py-4">
                              <span className="inline-flex rounded-2xl bg-slate-100 px-3 py-1.5 font-mono text-sm font-black text-slate-700">
                                {horario ? horario.horaFin : '—'}
                              </span>
                            </td>

                            <td className="px-6 py-4">
                              {horario ? (
                                <span
                                  className={`inline-flex items-center gap-2 rounded-2xl px-3 py-1.5 text-xs font-black ${badge.bg} ${badge.text}`}
                                >
                                  <span className={`h-2 w-2 rounded-full ${badge.dot}`} />
                                  {badge.label}
                                </span>
                              ) : (
                                <span className="inline-flex rounded-2xl bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-400">
                                  Sin configurar
                                </span>
                              )}
                            </td>

                            <td className="px-6 py-4">
                              <div className="flex items-center justify-end gap-2">
                                {horario ? (
                                  <>
                                    <button
                                      onClick={() => setModalEditar(horario)}
                                      className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-amber-50 hover:text-amber-600"
                                      title="Editar"
                                    >
                                      <Pencil size={15} />
                                    </button>

                                    <button
                                      onClick={() => setModalEliminar(horario)}
                                      className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                                      title="Eliminar"
                                    >
                                      <Trash2 size={15} />
                                    </button>
                                  </>
                                ) : (
                                  <button
                                    onClick={() => setModalCrear(true)}
                                    className="flex h-9 items-center justify-center gap-1.5 rounded-xl bg-[#000089]/10 px-3 text-xs font-black text-[#000089] transition hover:bg-[#000089] hover:text-white"
                                  >
                                    <Plus size={13} />
                                    Agregar
                                  </button>
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

            {/* Sección bloqueos */}
            <div className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white shadow-sm">
              <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-5 md:flex-row md:items-center md:justify-between md:px-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-50">
                    <CalendarOff size={18} className="text-red-600" />
                  </div>

                  <div>
                    <p className="text-sm font-black text-slate-900">
                      Días bloqueados
                    </p>
                    <p className="text-xs text-slate-400">
                      Períodos donde el doctor no estará disponible
                    </p>
                  </div>
                </div>

                <div className="inline-flex w-fit items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2">
                  <span className="h-2 w-2 rounded-full bg-red-500" />
                  <span className="text-xs font-bold text-slate-500">
                    {bloqueosActivos.length} activo
                    {bloqueosActivos.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              {bloqueos.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 px-6 py-12">
                  <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-slate-100">
                    <CalendarOff size={24} className="text-slate-400" />
                  </div>

                  <div className="text-center">
                    <p className="text-sm font-black text-slate-700">
                      Sin días bloqueados
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      Usa el botón “Bloquear días” para agregar períodos de no disponibilidad.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px]">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/80">
                        <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">
                          Desde
                        </th>
                        <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">
                          Hasta
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
                      {bloqueos.map((bloqueo) => {
                        const activo = new Date(bloqueo.fechaFin) >= hoy

                        return (
                          <tr
                            key={bloqueo.id}
                            className="transition-colors hover:bg-slate-50/70"
                          >
                            <td className="px-6 py-4">
                              <span className="inline-flex rounded-2xl bg-slate-100 px-3 py-1.5 font-mono text-sm font-black text-slate-700">
                                {formatFecha(bloqueo.fechaInicio)}
                              </span>
                            </td>

                            <td className="px-6 py-4">
                              <span className="inline-flex rounded-2xl bg-slate-100 px-3 py-1.5 font-mono text-sm font-black text-slate-700">
                                {formatFecha(bloqueo.fechaFin)}
                              </span>
                            </td>

                            <td className="px-6 py-4">
                              <span className="text-sm font-medium text-slate-600">
                                {bloqueo.motivo || '—'}
                              </span>
                            </td>

                            <td className="px-6 py-4">
                              {activo ? (
                                <span className="inline-flex items-center gap-2 rounded-2xl bg-red-50 px-3 py-1.5 text-xs font-black text-red-700">
                                  <span className="h-2 w-2 rounded-full bg-red-500" />
                                  Activo
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-3 py-1.5 text-xs font-black text-slate-400">
                                  <span className="h-2 w-2 rounded-full bg-slate-300" />
                                  Expirado
                                </span>
                              )}
                            </td>

                            <td className="px-6 py-4">
                              <div className="flex items-center justify-end">
                                <button
                                  onClick={() => setModalEliminarBloqueo(bloqueo)}
                                  className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                                  title="Eliminar bloqueo"
                                >
                                  <Trash2 size={15} />
                                </button>
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
          </div>
        )}
      </div>

      <AnimatePresence>
        {modalCrear && (
          <ModalCrearHorario
            doctorId={doctorSeleccionado?.id}
            horariosExistentes={horarios}
            onClose={() => setModalCrear(false)}
            onSuccess={() => fetchHorarios(doctorSeleccionado)}
          />
        )}

        {modalEditar && (
          <ModalEditarHorario
            horario={modalEditar}
            onClose={() => setModalEditar(null)}
            onSuccess={() => {
              fetchHorarios(doctorSeleccionado)
              setModalEditar(null)
            }}
          />
        )}

        {modalCrearBloqueo && (
          <ModalCrearBloqueo
            doctorId={doctorSeleccionado?.id}
            doctorNombre={`${doctorSeleccionado?.usuario.nombre} ${doctorSeleccionado?.usuario.apellido}`}
            onClose={() => setModalCrearBloqueo(false)}
            onSuccess={(mensaje) => {
              fetchHorarios(doctorSeleccionado)
              toast.success(mensaje || 'Bloqueo creado correctamente')
            }}
          />
        )}

        {modalEliminar && (
          <ModalConfirmar
            titulo="Eliminar horario"
            mensaje={`¿Eliminar el horario del ${DIAS[modalEliminar.diaSemana]}? Los pacientes no podrán agendar ese día.`}
            onConfirmar={handleEliminar}
            onCancelar={() => setModalEliminar(null)}
          />
        )}

        {modalEliminarBloqueo && (
          <ModalConfirmar
            titulo="Eliminar bloqueo"
            mensaje={`¿Eliminar el bloqueo del ${formatFecha(
              modalEliminarBloqueo.fechaInicio
            )} al ${formatFecha(modalEliminarBloqueo.fechaFin)}?`}
            onConfirmar={handleEliminarBloqueo}
            onCancelar={() => setModalEliminarBloqueo(null)}
          />
        )}
      </AnimatePresence>
    </AdminLayout>
  )
}