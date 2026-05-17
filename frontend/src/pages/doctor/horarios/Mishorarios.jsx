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
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-950 md:text-3xl">
              Mis Horarios
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              Consulta tu horario semanal de atención médica y disponibilidad configurada.
            </p>
          </div>

          <div className="inline-flex w-fit items-center gap-2 rounded-2xl border border-[#00CCA5]/20 bg-[#00CCA5]/10 px-4 py-2">
            <span className="h-2 w-2 rounded-full bg-[#00CCA5]" />
            <span className="text-xs font-black text-[#008f78]">
              {diasConfigurados} de 7 días activos
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="group flex items-center gap-4 rounded-3xl border border-slate-200/70 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-[#00A98A] shadow-lg shadow-slate-200/80">
              <CheckCircle size={20} className="text-white" />
            </div>

            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-400">
                Días activos
              </p>
              <p className="text-2xl font-black leading-tight text-slate-900">
                {diasConfigurados}
                <span className="ml-1 text-sm font-bold text-slate-400">/ 7</span>
              </p>
              <p className="mt-0.5 text-xs text-slate-400">
                Días configurados para atención
              </p>
            </div>
          </div>

          <div className="group flex items-center gap-4 rounded-3xl border border-slate-200/70 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-[#000089] shadow-lg shadow-slate-200/80">
              <Clock size={20} className="text-white" />
            </div>

            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-400">
                Horas semanales
              </p>
              <p className="text-2xl font-black leading-tight text-slate-900">
                {diasConfigurados > 0 ? horasTotalesStr : '—'}
              </p>
              <p className="mt-0.5 text-xs text-slate-400">
                Total de disponibilidad activa
              </p>
            </div>
          </div>
        </div>

        {/* Tabla */}
        <div className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 md:flex-row md:items-center md:justify-between md:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-[#00CCA5]/10">
                <Clock size={18} className="text-[#008f78]" />
              </div>

              <div>
                <p className="text-base font-black text-slate-900">
                  Horario semanal
                </p>
                <p className="text-xs text-slate-400">
                  Distribución semanal de tu atención médica.
                </p>
              </div>
            </div>

            <span className="w-fit rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-500">
              {diasConfigurados} de 7 días configurados
            </span>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16">
              <div className="h-9 w-9 animate-spin rounded-full border-2 border-[#00CCA5] border-t-transparent" />
              <p className="text-sm text-slate-400">Cargando horarios...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px]">
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
                      Duración
                    </th>
                    <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">
                      Estado
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {horariosCompletos.map(({ dia, diaSemana, esHoy, horario }) => {
                    let duracion = '—'
                    if (horario) {
                      const [hIni, mIni] = horario.horaInicio.split(':').map(Number)
                      const [hFin, mFin] = horario.horaFin.split(':').map(Number)
                      const mins = (hFin * 60 + mFin) - (hIni * 60 + mIni)
                      duracion = `${Math.floor(mins / 60)}h${mins % 60 > 0 ? ` ${mins % 60}m` : ''}`
                    }

                    return (
                      <tr
                        key={diaSemana}
                        className={`transition-colors ${
                          esHoy
                            ? 'bg-[#00CCA5]/5 hover:bg-[#00CCA5]/10'
                            : 'hover:bg-slate-50/70'
                        }`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-2xl ${
                                esHoy ? 'bg-[#00CCA5]/10' : 'bg-slate-100'
                              }`}
                            >
                              <span
                                className={`text-xs font-black ${
                                  esHoy ? 'text-[#008f78]' : 'text-slate-500'
                                }`}
                              >
                                {dia.slice(0, 2).toUpperCase()}
                              </span>
                            </div>

                            <div>
                              <p
                                className={`text-sm font-black ${
                                  esHoy ? 'text-[#008f78]' : 'text-slate-800'
                                }`}
                              >
                                {dia}
                              </p>

                              {esHoy && (
                                <span className="mt-1 inline-flex rounded-full bg-[#00CCA5]/10 px-2 py-0.5 text-[10px] font-black text-[#008f78]">
                                  Hoy
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex rounded-2xl px-3 py-1.5 font-mono text-sm font-black ${
                              horario
                                ? 'bg-slate-100 text-slate-700'
                                : 'bg-slate-50 text-slate-300'
                            }`}
                          >
                            {horario ? horario.horaInicio : '——:——'}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex rounded-2xl px-3 py-1.5 font-mono text-sm font-black ${
                              horario
                                ? 'bg-slate-100 text-slate-700'
                                : 'bg-slate-50 text-slate-300'
                            }`}
                          >
                            {horario ? horario.horaFin : '——:——'}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`text-sm font-bold ${
                              horario ? 'text-slate-600' : 'text-slate-300'
                            }`}
                          >
                            {duracion}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          {!horario ? (
                            <span className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-3 py-1.5 text-xs font-black text-slate-400">
                              <XCircle size={12} />
                              Sin configurar
                            </span>
                          ) : horario.activo ? (
                            <span className="inline-flex items-center gap-2 rounded-2xl bg-[#00CCA5]/10 px-3 py-1.5 text-xs font-black text-[#008f78]">
                              <span className="h-2 w-2 rounded-full bg-[#00CCA5]" />
                              Activo
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-3 py-1.5 text-xs font-black text-slate-500">
                              <span className="h-2 w-2 rounded-full bg-slate-400" />
                              Inactivo
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
            <div className="flex flex-col items-center justify-center gap-3 border-t border-slate-100 px-6 py-12">
              <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-slate-100">
                <Clock size={24} className="text-slate-400" />
              </div>

              <div className="text-center">
                <p className="text-sm font-black text-slate-700">
                  No tienes horarios configurados
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Contacta al administrador para configurar tu horario de atención.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </DoctorLayout>
  )
}