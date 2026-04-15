import { useState, useEffect } from 'react'
import { FileText, Stethoscope, ClipboardList, CreditCard, DollarSign, ChevronLeft, ChevronRight } from 'lucide-react'
import PacienteLayout from '../../../components/PacienteLayout'
import api from '../../../services/api'
import { toast } from 'sonner'

const metodoPago = {
  efectivo:      { label: 'Efectivo',      bg: 'bg-emerald-50', text: 'text-emerald-700' },
  tarjeta:       { label: 'Tarjeta',       bg: 'bg-blue-50',    text: 'text-blue-700'    },
  transferencia: { label: 'Transferencia', bg: 'bg-violet-50',  text: 'text-violet-700'  },
}

const LIMIT = 5

export default function Historial() {
  const [citas, setCitas] = useState([])
  const [pagos, setPagos] = useState({})
  const [meta, setMeta] = useState(null)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [citasRes, pagosRes] = await Promise.all([
          api.get(`/citas?page=${page}&limit=${LIMIT}&estado=COMPLETADA`),
          api.get('/pagos/mis-pagos')
        ])
        setCitas(citasRes.data.data)
        setMeta(citasRes.data.meta)
        const pagosMap = {}
        pagosRes.data.pagos.forEach(p => { pagosMap[p.cita.id] = p })
        setPagos(pagosMap)
      } catch {
        toast.error('Error cargando historial')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [page])

  const formatFecha = (fecha) => new Date(fecha).toLocaleString('es-PE', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })

  const formatFechaPago = (fecha) => new Date(fecha).toLocaleDateString('es-PE', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  })

  return (
    <PacienteLayout>
      <div className="page-enter">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <ClipboardList size={20} className="text-emerald-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Historial Clínico</h1>
              <p className="text-slate-400 text-sm mt-0.5 hidden sm:block">
                {meta ? `${meta.total} consulta${meta.total !== 1 ? 's' : ''} completada${meta.total !== 1 ? 's' : ''}` : 'Tus consultas médicas completadas'}
              </p>
            </div>
          </div>
          {/* Total pagado */}
          {Object.keys(pagos).length > 0 && (
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 px-3 md:px-4 py-2.5 rounded-2xl flex-shrink-0">
              <DollarSign size={15} className="text-emerald-600" />
              <div>
                <p className="text-xs text-emerald-600 font-medium hidden sm:block">Total pagado</p>
                <p className="text-base md:text-lg font-bold text-emerald-700">
                  S/ {Object.values(pagos).reduce((acc, p) => acc + p.monto, 0).toFixed(2)}
                </p>
              </div>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-400 text-sm">Cargando historial...</p>
          </div>
        ) : citas.length === 0 && page === 1 ? (
          <div className="bg-white rounded-2xl border border-slate-100 flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center">
              <ClipboardList size={24} className="text-slate-400" />
            </div>
            <p className="text-slate-500 font-medium">No tienes consultas completadas aún</p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {citas.map((cita) => {
                const pago = pagos[cita.id]
                const cfgMetodo = pago ? (metodoPago[pago.metodo] || { label: pago.metodo, bg: 'bg-slate-50', text: 'text-slate-600' }) : null

                return (
                  <div key={cita.id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-md transition-all duration-200">

                    {/* Card header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 md:px-5 py-4 border-b border-slate-50">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {cita.doctor.foto ? (
                            <img src={cita.doctor.foto} className="w-full h-full object-cover" alt="" />
                          ) : (
                            <span className="text-blue-600 text-sm font-bold">
                              {cita.doctor.usuario.nombre[0]}{cita.doctor.usuario.apellido[0]}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-800 text-sm truncate">
                            Dr. {cita.doctor.usuario.nombre} {cita.doctor.usuario.apellido}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5 truncate">
                            {cita.servicio.nombre} · {formatFecha(cita.fecha)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap flex-shrink-0">
                        {pago ? (
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${cfgMetodo.bg} ${cfgMetodo.text}`}>
                              <CreditCard size={11} />
                              {cfgMetodo.label}
                            </span>
                            <span className="text-sm font-bold text-emerald-600">S/ {pago.monto.toFixed(2)}</span>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 text-slate-400 rounded-lg text-xs font-medium border border-slate-100">
                            Sin pago
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-medium">
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                          COMPLETADA
                        </span>
                      </div>
                    </div>

                    {/* Card body */}
                    <div className="px-4 md:px-5 py-4">
                      {cita.motivo && (
                        <p className="text-sm text-slate-600 mb-4">
                          <span className="font-medium text-slate-700">Motivo: </span>{cita.motivo}
                        </p>
                      )}
                      {pago && (
                        <div className="flex items-center gap-3 mb-4 px-4 py-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                          <DollarSign size={14} className="text-emerald-500 flex-shrink-0" />
                          <p className="text-xs text-emerald-700">
                            Pago registrado el {formatFechaPago(pago.createdAt)} — {cfgMetodo.label} · S/ {pago.monto.toFixed(2)}
                          </p>
                        </div>
                      )}
                      {cita.nota ? (
                        <div className="bg-slate-50 rounded-2xl p-4 space-y-3">
                          <div className="flex items-center gap-2">
                            <FileText size={14} className="text-slate-400" />
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Nota Clínica</p>
                          </div>
                          {[
                            { label: 'Diagnóstico',   value: cita.nota.diagnostico },
                            { label: 'Tratamiento',   value: cita.nota.tratamiento },
                            { label: 'Receta',        value: cita.nota.receta      },
                            { label: 'Observaciones', value: cita.nota.observacion },
                          ].filter(n => n.value).map((n, i) => (
                            <div key={i} className="bg-white rounded-xl p-3 border border-slate-100">
                              <p className="text-xs text-slate-400 mb-1">{n.label}</p>
                              <p className="text-sm text-slate-700">{n.value}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 px-4 py-3 bg-yellow-50 border border-yellow-100 rounded-xl">
                          <Stethoscope size={14} className="text-yellow-500 flex-shrink-0" />
                          <p className="text-xs text-yellow-600">El doctor aún no ha registrado la nota clínica</p>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Paginación */}
            {meta && meta.totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 bg-white rounded-2xl border border-slate-100 px-4 md:px-5 py-3">
                <p className="text-xs text-slate-400 hidden sm:block">
                  Mostrando {((page - 1) * LIMIT) + 1}–{Math.min(page * LIMIT, meta.total)} de {meta.total} consultas
                </p>
                <p className="text-xs text-slate-400 sm:hidden">
                  {page} / {meta.totalPages}
                </p>
                <div className="flex items-center gap-2">
                  <button onClick={() => setPage(p => p - 1)} disabled={page === 1}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                    <ChevronLeft size={15} />
                  </button>
                  <span className="text-xs font-medium text-slate-600 px-2 hidden sm:inline">
                    {page} / {meta.totalPages}
                  </span>
                  <button onClick={() => setPage(p => p + 1)} disabled={page === meta.totalPages}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                    <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </PacienteLayout>
  )
}