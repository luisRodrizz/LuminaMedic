import { useState, useEffect } from 'react'
import { Clock, Plus, Pencil, Trash2, ChevronDown, Stethoscope, Ban, CalendarOff } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import AdminLayout from '../../../components/AdminLayout'
import ModalConfirmar from '../../../components/ModalConfirmar'
import ModalCrearHorario from './ModalCrearHorario'
import ModalEditarHorario from './ModalEditarHorario'
import ModalCrearBloqueo from './ModalCrearBloqueo'
import api from '../../../services/api'

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

const estadoBadge = {
  true:  { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-400', label: 'Activo'   },
  false: { bg: 'bg-slate-100',  text: 'text-slate-500',   dot: 'bg-slate-400',   label: 'Inactivo' },
}

const formatFecha = (fecha) => new Date(fecha).toLocaleDateString('es-PE', {
  day: '2-digit', month: '2-digit', year: 'numeric'
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
    dia, diaSemana: i,
    horario: horarios.find(h => h.diaSemana === i) || null
  }))

  const hoy = new Date()
  const bloqueosActivos = bloqueos.filter(b => new Date(b.fechaFin) >= hoy)

  return (
    <AdminLayout>
      <div className="page-enter">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <Clock size={20} className="text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Horarios</h1>
              <p className="text-slate-400 text-sm mt-0.5 hidden sm:block">Gestiona los horarios de atención de los doctores</p>
            </div>
          </div>
          {doctorSeleccionado && (
            <div className="flex items-center gap-2">
              <button onClick={() => setModalCrearBloqueo(true)}
                className="flex items-center gap-2 px-3 md:px-4 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-sm font-medium transition-all">
                <Ban size={15} />
                <span className="hidden sm:inline">Bloquear días</span>
              </button>
              <button onClick={() => setModalCrear(true)}
                disabled={horarios.length >= 7}
                className="flex items-center gap-2 px-3 md:px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-sm font-medium transition-all shadow-sm">
                <Plus size={16} />
                <span className="hidden sm:inline">Agregar horario</span>
              </button>
            </div>
          )}
        </div>

        {/* Selector de doctor */}
        <div className="bg-white rounded-2xl border border-slate-100 p-4 md:p-5 mb-6">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Seleccionar doctor</p>
          <div className="relative">
            <button onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-full flex items-center justify-between px-4 py-3 border border-slate-200 rounded-xl text-sm bg-slate-50 hover:bg-white transition-all">
              {doctorSeleccionado ? (
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                    {doctorSeleccionado.foto ? (
                      <img src={doctorSeleccionado.foto} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <span className="text-blue-600 text-xs font-bold">
                        {doctorSeleccionado.usuario.nombre[0]}{doctorSeleccionado.usuario.apellido[0]}
                      </span>
                    )}
                  </div>
                  <div className="text-left min-w-0">
                    <p className="font-medium text-slate-800 truncate">Dr. {doctorSeleccionado.usuario.nombre} {doctorSeleccionado.usuario.apellido}</p>
                    <p className="text-xs text-slate-400 truncate">{doctorSeleccionado.especialidad}</p>
                  </div>
                </div>
              ) : (
                <span className="text-slate-400 text-sm">Selecciona un doctor para ver sus horarios</span>
              )}
              <ChevronDown size={16} className={`text-slate-400 transition-transform flex-shrink-0 ml-2 ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-xl z-10 overflow-hidden max-h-64 overflow-y-auto">
                  {loadingDoctores ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : doctores.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 text-sm">No hay doctores registrados</div>
                  ) : (
                    doctores.map(doc => (
                      <button key={doc.id} onClick={() => seleccionarDoctor(doc)}
                        className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left ${doctorSeleccionado?.id === doc.id ? 'bg-blue-50' : ''}`}>
                        <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                          {doc.foto ? (
                            <img src={doc.foto} className="w-full h-full object-cover" alt="" />
                          ) : (
                            <span className="text-blue-600 text-xs font-bold">
                              {doc.usuario.nombre[0]}{doc.usuario.apellido[0]}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-800 truncate">Dr. {doc.usuario.nombre} {doc.usuario.apellido}</p>
                          <p className="text-xs text-slate-400 truncate">{doc.especialidad}</p>
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
          <div className="bg-white rounded-2xl border border-slate-100 flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center">
              <Stethoscope size={24} className="text-slate-400" />
            </div>
            <p className="text-slate-500 font-medium">Selecciona un doctor</p>
            <p className="text-slate-400 text-sm">para ver y gestionar sus horarios de atención</p>
          </div>
        ) : (
          <div className="space-y-6">

            {/* Tabla horarios semanales */}
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
              <div className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-slate-100">
                <p className="text-sm font-semibold text-slate-700 truncate">
                  Horarios de Dr. {doctorSeleccionado.usuario.nombre} {doctorSeleccionado.usuario.apellido}
                </p>
                <p className="text-xs text-slate-400 flex-shrink-0 ml-2">{horarios.length}/7 días</p>
              </div>
              {loadingHorarios ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-slate-400 text-sm">Cargando horarios...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[480px]">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="px-4 md:px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Día</th>
                        <th className="px-4 md:px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Inicio</th>
                        <th className="px-4 md:px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Fin</th>
                        <th className="hidden sm:table-cell px-4 md:px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                        <th className="px-4 md:px-6 py-3.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {horariosCompletos.map(({ dia, diaSemana, horario }) => {
                        const badge = horario ? estadoBadge[horario.activo] : null
                        return (
                          <tr key={diaSemana} className="hover:bg-slate-50/70 transition-colors">
                            <td className="px-4 md:px-6 py-4">
                              <span className="text-sm font-medium text-slate-700">{dia}</span>
                            </td>
                            <td className="px-4 md:px-6 py-4">
                              <span className="text-sm text-slate-600 font-mono">{horario ? horario.horaInicio : '—'}</span>
                            </td>
                            <td className="px-4 md:px-6 py-4">
                              <span className="text-sm text-slate-600 font-mono">{horario ? horario.horaFin : '—'}</span>
                            </td>
                            <td className="hidden sm:table-cell px-4 md:px-6 py-4">
                              {horario ? (
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${badge.bg} ${badge.text}`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />{badge.label}
                                </span>
                              ) : (
                                <span className="text-xs text-slate-400">Sin configurar</span>
                              )}
                            </td>
                            <td className="px-4 md:px-6 py-4">
                              <div className="flex items-center justify-end gap-2">
                                {horario ? (
                                  <>
                                    <button onClick={() => setModalEditar(horario)}
                                      className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all">
                                      <Pencil size={14} />
                                    </button>
                                    <button onClick={() => setModalEliminar(horario)}
                                      className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all">
                                      <Trash2 size={14} />
                                    </button>
                                  </>
                                ) : (
                                  <button onClick={() => setModalCrear(true)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                                    <Plus size={12} /> Agregar
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
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
              <div className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <CalendarOff size={16} className="text-slate-400" />
                  <p className="text-sm font-semibold text-slate-700">Días bloqueados</p>
                </div>
                <p className="text-xs text-slate-400">{bloqueosActivos.length} activo{bloqueosActivos.length !== 1 ? 's' : ''}</p>
              </div>

              {bloqueos.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 gap-2">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                    <CalendarOff size={18} className="text-slate-400" />
                  </div>
                  <p className="text-slate-500 text-sm font-medium">Sin días bloqueados</p>
                  <p className="text-slate-400 text-xs text-center px-4">Usa el botón "Bloquear días" para agregar períodos de no disponibilidad</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[480px]">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="px-4 md:px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Desde</th>
                        <th className="px-4 md:px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Hasta</th>
                        <th className="hidden sm:table-cell px-4 md:px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Motivo</th>
                        <th className="px-4 md:px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                        <th className="px-4 md:px-6 py-3.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {bloqueos.map(bloqueo => {
                        const activo = new Date(bloqueo.fechaFin) >= hoy
                        return (
                          <tr key={bloqueo.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="px-4 md:px-6 py-4 text-sm text-slate-600 font-mono whitespace-nowrap">{formatFecha(bloqueo.fechaInicio)}</td>
                            <td className="px-4 md:px-6 py-4 text-sm text-slate-600 font-mono whitespace-nowrap">{formatFecha(bloqueo.fechaFin)}</td>
                            <td className="hidden sm:table-cell px-4 md:px-6 py-4 text-sm text-slate-500">{bloqueo.motivo || '—'}</td>
                            <td className="px-4 md:px-6 py-4">
                              {activo ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-red-50 text-red-700">
                                  <span className="w-1.5 h-1.5 rounded-full bg-red-400" /> Activo
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-400">
                                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300" /> Expirado
                                </span>
                              )}
                            </td>
                            <td className="px-4 md:px-6 py-4">
                              <div className="flex items-center justify-end">
                                <button onClick={() => setModalEliminarBloqueo(bloqueo)}
                                  className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all">
                                  <Trash2 size={14} />
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
            onSuccess={() => { fetchHorarios(doctorSeleccionado); setModalEditar(null) }}
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
            mensaje={`¿Eliminar el bloqueo del ${formatFecha(modalEliminarBloqueo.fechaInicio)} al ${formatFecha(modalEliminarBloqueo.fechaFin)}?`}
            onConfirmar={handleEliminarBloqueo}
            onCancelar={() => setModalEliminarBloqueo(null)}
          />
        )}
      </AnimatePresence>
    </AdminLayout>
  )
}