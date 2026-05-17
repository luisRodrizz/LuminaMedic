import { useState, useEffect } from 'react'
import { Eye, Users } from 'lucide-react'
import { toast } from 'sonner'
import { AnimatePresence } from 'framer-motion'
import DoctorLayout from '../../../components/DoctorLayout'
import ModalVerPaciente from './ModalVerPaciente'
import api from '../../../services/api'

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

export default function DoctorPacientes() {
  const [citas, setCitas] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalVer, setModalVer] = useState(false)
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null)

  useEffect(() => {
    const fetchCitas = async () => {
      try {
        const res = await api.get('/citas?page=1&limit=100')
        setCitas(res.data.data)
      } catch {
        toast.error('Error al cargar los pacientes')
      } finally {
        setLoading(false)
      }
    }

    fetchCitas()
  }, [])

  const pacientesUnicos = citas.reduce((acc, cita) => {
    const existe = acc.find(p => p.id === cita.paciente.id)
    if (!existe) acc.push(cita.paciente)
    return acc
  }, [])

  const getCitasPaciente = (pacienteId) => citas.filter(c => c.paciente.id === pacienteId)

  const getUltimaCita = (pacienteId) => {
    const citasPac = getCitasPaciente(pacienteId)
    return citasPac.sort((a, b) => new Date(b.fecha) - new Date(a.fecha))[0]
  }

  return (
    <DoctorLayout>
      <div className="page-enter">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-950 md:text-3xl">
              Mis Pacientes
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              Consulta pacientes atendidos, historial de citas y seguimiento médico.
            </p>
          </div>

          <div className="inline-flex w-fit items-center gap-2 rounded-2xl border border-[#00CCA5]/20 bg-[#00CCA5]/10 px-4 py-2">
            <span className="h-2 w-2 rounded-full bg-[#00CCA5]" />
            <span className="text-xs font-black text-[#008f78]">
              {pacientesUnicos.length} paciente{pacientesUnicos.length !== 1 ? 's' : ''} registrado{pacientesUnicos.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Tabla */}
        <div className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 md:flex-row md:items-center md:justify-between md:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-[#00CCA5]/10">
                <Users size={18} className="text-[#008f78]" />
              </div>

              <div>
                <p className="text-base font-black text-slate-900">
                  Lista de pacientes
                </p>
                <p className="text-xs text-slate-400">
                  Pacientes vinculados a tus citas médicas.
                </p>
              </div>
            </div>

            <span className="w-fit rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-500">
              Seguimiento médico
            </span>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16">
              <div className="h-9 w-9 animate-spin rounded-full border-2 border-[#00CCA5] border-t-transparent" />
              <p className="text-sm text-slate-400">Cargando pacientes...</p>
            </div>
          ) : pacientesUnicos.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 px-6 py-16">
              <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-slate-100">
                <Users size={24} className="text-slate-400" />
              </div>

              <div className="text-center">
                <p className="text-sm font-black text-slate-700">
                  No tienes pacientes asignados
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Cuando atiendas o tengas citas asignadas, los pacientes aparecerán aquí.
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/80">
                    <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">
                      Paciente
                    </th>
                    <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">
                      Teléfono
                    </th>
                    <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">
                      Total citas
                    </th>
                    <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">
                      Última cita
                    </th>
                    <th className="px-6 py-4 text-right text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">
                      Acciones
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {pacientesUnicos.map((pac) => {
                    const ultimaCita = getUltimaCita(pac.id)
                    const cfg = ultimaCita ? estadoColors[ultimaCita.estado] : null
                    const totalCitas = getCitasPaciente(pac.id).length

                    return (
                      <tr
                        key={pac.id}
                        className="transition-colors hover:bg-slate-50/70"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[#00CCA5]/20 bg-[#00CCA5]/10">
                              {pac.foto ? (
                                <img
                                  src={pac.foto}
                                  alt={`${pac.usuario.nombre} ${pac.usuario.apellido}`}
                                  className="h-full w-full object-cover"
                                  onError={(e) => {
                                    e.target.style.display = 'none'
                                    e.target.parentNode.innerHTML = `<span class="text-[#008f78] text-xs font-black">${pac.usuario.nombre[0]}${pac.usuario.apellido[0]}</span>`
                                  }}
                                />
                              ) : (
                                <span className="text-xs font-black text-[#008f78]">
                                  {pac.usuario.nombre[0]}
                                  {pac.usuario.apellido[0]}
                                </span>
                              )}
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-sm font-black text-slate-800">
                                {pac.usuario.nombre} {pac.usuario.apellido}
                              </p>
                              <p className="text-xs text-slate-400">
                                Paciente en seguimiento
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <p className="max-w-[210px] truncate text-sm font-medium text-slate-500">
                            {pac.usuario.email}
                          </p>
                        </td>

                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-slate-500">
                            {pac.usuario.telefono || '—'}
                          </p>
                        </td>

                        <td className="px-6 py-4">
                          <span className="inline-flex rounded-2xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-600">
                            {totalCitas} cita{totalCitas !== 1 ? 's' : ''}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          {cfg ? (
                            <span
                              className={`inline-flex items-center gap-2 rounded-2xl px-3 py-1.5 text-xs font-black ${cfg.bg} ${cfg.text}`}
                            >
                              <span className={`h-2 w-2 rounded-full ${cfg.dot}`} />
                              {ultimaCita.estado}
                            </span>
                          ) : (
                            <span className="text-sm text-slate-400">—</span>
                          )}
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end">
                            <button
                              onClick={() => {
                                setPacienteSeleccionado(pac)
                                setModalVer(true)
                              }}
                              className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-[#00CCA5]/10 hover:text-[#008f78]"
                              title="Ver expediente"
                            >
                              <Eye size={15} />
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

        <AnimatePresence>
          {modalVer && pacienteSeleccionado && (
            <ModalVerPaciente
              pacienteId={pacienteSeleccionado.id}
              onClose={() => setModalVer(false)}
            />
          )}
        </AnimatePresence>
      </div>
    </DoctorLayout>
  )
}