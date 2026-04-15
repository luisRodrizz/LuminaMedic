import { useState, useEffect } from 'react'
import { Eye, Users } from 'lucide-react'
import { toast } from 'sonner'
import { AnimatePresence } from 'framer-motion'
import DoctorLayout from '../../../components/DoctorLayout'
import ModalVerPaciente from './ModalVerPaciente'
import api from '../../../services/api'

const estadoColors = {
  PENDIENTE:  { bg: 'bg-yellow-50',  text: 'text-yellow-700',  dot: 'bg-yellow-400'  },
  CONFIRMADA: { bg: 'bg-blue-50',    text: 'text-blue-700',    dot: 'bg-blue-400'    },
  COMPLETADA: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-400' },
  CANCELADA:  { bg: 'bg-red-50',     text: 'text-red-700',     dot: 'bg-red-400'     },
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

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
            <Users size={20} className="text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Mis Pacientes</h1>
            <p className="text-slate-400 text-sm mt-0.5">Pacientes atendidos y en seguimiento</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-slate-100">
            <p className="text-sm font-semibold text-slate-700">Lista de pacientes</p>
            <p className="text-xs text-slate-400">
              {pacientesUnicos.length} paciente{pacientesUnicos.length !== 1 ? 's' : ''}
            </p>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-slate-400 text-sm">Cargando pacientes...</p>
            </div>
          ) : pacientesUnicos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center">
                <Users size={24} className="text-slate-400" />
              </div>
              <p className="text-slate-500 font-medium">No tienes pacientes asignados</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-4 md:px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Paciente</th>
                    <th className="hidden md:table-cell px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
                    <th className="hidden lg:table-cell px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Teléfono</th>
                    <th className="hidden sm:table-cell px-4 md:px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Total citas</th>
                    <th className="px-4 md:px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Última cita</th>
                    <th className="px-4 md:px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {pacientesUnicos.map((pac) => {
                    const ultimaCita = getUltimaCita(pac.id)
                    const cfg = ultimaCita ? estadoColors[ultimaCita.estado] : null
                    return (
                      <tr key={pac.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-4 md:px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0 bg-indigo-50 flex items-center justify-center">
                              {pac.foto ? (
                                <img src={pac.foto} alt={`${pac.usuario.nombre} ${pac.usuario.apellido}`}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.style.display = 'none'
                                    e.target.parentNode.innerHTML = `<span class="text-indigo-600 text-xs font-bold">${pac.usuario.nombre[0]}${pac.usuario.apellido[0]}</span>`
                                  }} />
                              ) : (
                                <span className="text-indigo-600 text-xs font-bold">
                                  {pac.usuario.nombre[0]}{pac.usuario.apellido[0]}
                                </span>
                              )}
                            </div>
                            <span className="font-medium text-slate-800 text-sm truncate">
                              {pac.usuario.nombre} {pac.usuario.apellido}
                            </span>
                          </div>
                        </td>
                        <td className="hidden md:table-cell px-6 py-4 text-slate-500 text-sm truncate max-w-[160px]">
                          {pac.usuario.email}
                        </td>
                        <td className="hidden lg:table-cell px-6 py-4 text-slate-500 text-sm">
                          {pac.usuario.telefono || '—'}
                        </td>
                        <td className="hidden sm:table-cell px-4 md:px-6 py-4">
                          <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium">
                            {getCitasPaciente(pac.id).length} cita{getCitasPaciente(pac.id).length !== 1 ? 's' : ''}
                          </span>
                        </td>
                        <td className="px-4 md:px-6 py-4">
                          {cfg && (
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${cfg.bg} ${cfg.text}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                              <span className="hidden sm:inline">{ultimaCita.estado}</span>
                            </span>
                          )}
                        </td>
                        <td className="px-4 md:px-6 py-4">
                          <button onClick={() => { setPacienteSeleccionado(pac); setModalVer(true) }}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                            title="Ver expediente">
                            <Eye size={15} />
                          </button>
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
            <ModalVerPaciente pacienteId={pacienteSeleccionado.id} onClose={() => setModalVer(false)} />
          )}
        </AnimatePresence>
      </div>
    </DoctorLayout>
  )
}