import { useState, useEffect } from 'react'
import { Clock, CheckCircle, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import DoctorLayout from '../../../components/DoctorLayout'
import api from '../../../services/api'

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

const diasSemana = () => {
  const hoy = new Date()
  const diaJS = hoy.getDay()
  const diaActual = diaJS === 0 ? 6 : diaJS - 1
  return diaActual
}

export default function MisHorarios() {
  const [horarios, setHorarios] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchHorarios = async () => {
      try {
        const res = await api.get('/horarios/me')
        setHorarios(res.data)
      } catch {
        toast.error('Error al cargar los horarios')
      } finally {
        setLoading(false)
      }
    }
    fetchHorarios()
  }, [])

  const diaActual = diasSemana()

  const horariosCompletos = DIAS.map((dia, i) => ({
    dia, diaSemana: i,
    esHoy: i === diaActual,
    horario: horarios.find(h => h.diaSemana === i) || null
  }))

  const diasConfigurados = horarios.filter(h => h.activo).length
  const horasTotales = horarios
    .filter(h => h.activo)
    .reduce((acc, h) => {
      const [hIni, mIni] = h.horaInicio.split(':').map(Number)
      const [hFin, mFin] = h.horaFin.split(':').map(Number)
      return acc + ((hFin * 60 + mFin) - (hIni * 60 + mIni))
    }, 0)
  const horasTotalesStr = `${Math.floor(horasTotales / 60)}h ${horasTotales % 60 > 0 ? `${horasTotales % 60}m` : ''}`

  return (
    <DoctorLayout>
      <div className="page-enter">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
            <Clock size={20} className="text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Mis Horarios</h1>
            <p className="text-slate-400 text-sm mt-0.5">Tu horario de atención semanal</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center gap-4 hover:shadow-sm transition-all">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <CheckCircle size={18} className="text-white" />
            </div>
            <div>
              <p className="text-slate-400 text-xs">Días activos</p>
              <p className="text-2xl font-bold text-slate-800">{diasConfigurados} <span className="text-sm font-normal text-slate-400">/ 7</span></p>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center gap-4 hover:shadow-sm transition-all">
            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <Clock size={18} className="text-white" />
            </div>
            <div>
              <p className="text-slate-400 text-xs">Horas semanales</p>
              <p className="text-2xl font-bold text-slate-800">{diasConfigurados > 0 ? horasTotalesStr : '—'}</p>
            </div>
          </div>
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-slate-100">
            <p className="text-sm font-semibold text-slate-700">Horario semanal</p>
            <p className="text-xs text-slate-400">{diasConfigurados} de 7 días configurados</p>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
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
                    <th className="hidden sm:table-cell px-4 md:px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Duración</th>
                    <th className="px-4 md:px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {horariosCompletos.map(({ dia, diaSemana, esHoy, horario }) => {
                    let duracion = '—'
                    if (horario) {
                      const [hIni, mIni] = horario.horaInicio.split(':').map(Number)
                      const [hFin, mFin] = horario.horaFin.split(':').map(Number)
                      const mins = (hFin * 60 + mFin) - (hIni * 60 + mIni)
                      duracion = `${Math.floor(mins / 60)}h${mins % 60 > 0 ? ` ${mins % 60}m` : ''}`
                    }
                    return (
                      <tr key={diaSemana}
                        className={`transition-colors ${esHoy ? 'bg-emerald-50/50 hover:bg-emerald-50' : 'hover:bg-slate-50/70'}`}>
                        <td className="px-4 md:px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-semibold ${esHoy ? 'text-emerald-600' : 'text-slate-700'}`}>
                              {dia}
                            </span>
                            {esHoy && (
                              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-600 text-xs font-bold rounded-lg">
                                Hoy
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 md:px-6 py-4">
                          <span className={`text-sm font-mono ${horario ? 'text-slate-700 font-semibold' : 'text-slate-300'}`}>
                            {horario ? horario.horaInicio : '——:——'}
                          </span>
                        </td>
                        <td className="px-4 md:px-6 py-4">
                          <span className={`text-sm font-mono ${horario ? 'text-slate-700 font-semibold' : 'text-slate-300'}`}>
                            {horario ? horario.horaFin : '——:——'}
                          </span>
                        </td>
                        <td className="hidden sm:table-cell px-4 md:px-6 py-4">
                          <span className={`text-sm ${horario ? 'text-slate-500' : 'text-slate-300'}`}>
                            {duracion}
                          </span>
                        </td>
                        <td className="px-4 md:px-6 py-4">
                          {!horario ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-400">
                              <XCircle size={11} /><span className="hidden sm:inline">Sin configurar</span>
                            </span>
                          ) : horario.activo ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-700">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                              <span className="hidden sm:inline">Activo</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-500">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                              <span className="hidden sm:inline">Inactivo</span>
                            </span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {!loading && diasConfigurados === 0 && (
            <div className="flex flex-col items-center justify-center py-10 gap-2 border-t border-slate-100">
              <Clock size={28} className="text-slate-300" />
              <p className="text-slate-400 text-sm font-medium">No tienes horarios configurados</p>
              <p className="text-slate-400 text-xs">Contacta al administrador para configurar tu horario</p>
            </div>
          )}
        </div>

      </div>
    </DoctorLayout>
  )
}