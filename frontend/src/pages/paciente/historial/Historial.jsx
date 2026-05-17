import { useState, useEffect } from 'react'
import { FileText, Stethoscope, ClipboardList, CreditCard, DollarSign, ChevronLeft, ChevronRight } from 'lucide-react'
import PacienteLayout from '../../../components/PacienteLayout'
import api from '../../../services/api'
import { toast } from 'sonner'

const metodoPago = {
  efectivo: {
    label: 'Efectivo',
    bg: 'bg-[#00CCA5]/10',
    text: 'text-[#008f78]',
    border: 'border-[#00CCA5]/20'
  },
  tarjeta: {
    label: 'Tarjeta',
    bg: 'bg-[#000089]/10',
    text: 'text-[#000089]',
    border: 'border-[#000089]/20'
  },
  transferencia: {
    label: 'Transferencia',
    bg: 'bg-sky-50',
    text: 'text-sky-700',
    border: 'border-sky-100'
  },
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
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-950 md:text-3xl">
              Historial Clínico
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              {meta
                ? `${meta.total} consulta${meta.total !== 1 ? 's' : ''} completada${meta.total !== 1 ? 's' : ''} en tu historial médico.`
                : 'Consulta tus atenciones médicas completadas, notas clínicas y pagos registrados.'}
            </p>
          </div>

          {Object.keys(pagos).length > 0 && (
            <div className="w-fit rounded-3xl border border-[#00CCA5]/20 bg-[#00CCA5]/10 px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/80">
                  <DollarSign size={17} className="text-[#008f78]" />
                </div>

                <div>
                  <p className="text-xs font-black uppercase tracking-[0.1em] text-[#008f78]">
                    Total pagado
                  </p>
                  <p className="text-xl font-black text-[#008f78]">
                    S/ {Object.values(pagos).reduce((acc, p) => acc + p.monto, 0).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-[2rem] border border-slate-200/80 bg-white py-16 shadow-sm">
            <div className="h-9 w-9 animate-spin rounded-full border-2 border-[#00CCA5] border-t-transparent" />
            <p className="text-sm text-slate-400">Cargando historial...</p>
          </div>
        ) : citas.length === 0 && page === 1 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-[2rem] border border-slate-200/80 bg-white px-6 py-16 text-center shadow-sm">
            <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-slate-100">
              <ClipboardList size={24} className="text-slate-400" />
            </div>

            <div>
              <p className="text-sm font-black text-slate-700">
                No tienes consultas completadas aún
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Cuando finalice una atención médica, aparecerá en esta sección.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-5">
              {citas.map((cita) => {
                const pago = pagos[cita.id]
                const cfgMetodo = pago
                  ? (metodoPago[pago.metodo] || {
                      label: pago.metodo,
                      bg: 'bg-slate-50',
                      text: 'text-slate-600',
                      border: 'border-slate-200'
                    })
                  : null

                return (
                  <div
                    key={cita.id}
                    className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_50px_rgba(15,23,42,0.08)]"
                  >
                    {/* Card header */}
                    <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 md:flex-row md:items-center md:justify-between">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[#00CCA5]/20 bg-[#00CCA5]/10">
                          {cita.doctor.foto ? (
                            <img
                              src={cita.doctor.foto}
                              className="h-full w-full object-cover"
                              alt=""
                            />
                          ) : (
                            <span className="text-sm font-black text-[#008f78]">
                              {cita.doctor.usuario.nombre[0]}
                              {cita.doctor.usuario.apellido[0]}
                            </span>
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-black text-slate-900">
                            Dr. {cita.doctor.usuario.nombre} {cita.doctor.usuario.apellido}
                          </p>
                          <p className="mt-0.5 truncate text-xs font-medium text-slate-400">
                            {cita.servicio.nombre} · {formatFecha(cita.fecha)}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {pago ? (
                          <>
                            <span className={`inline-flex items-center gap-1.5 rounded-2xl border px-3 py-1.5 text-xs font-black ${cfgMetodo.bg} ${cfgMetodo.text} ${cfgMetodo.border}`}>
                              <CreditCard size={12} />
                              {cfgMetodo.label}
                            </span>

                            <span className="rounded-2xl bg-[#00CCA5]/10 px-3 py-1.5 text-xs font-black text-[#008f78]">
                              S/ {pago.monto.toFixed(2)}
                            </span>
                          </>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-400">
                            Sin pago
                          </span>
                        )}

                        <span className="inline-flex items-center gap-2 rounded-2xl bg-[#00CCA5]/10 px-3 py-1.5 text-xs font-black text-[#008f78]">
                          <span className="h-2 w-2 rounded-full bg-[#00CCA5]" />
                          COMPLETADA
                        </span>
                      </div>
                    </div>

                    {/* Card body */}
                    <div className="px-5 py-5">
                      {cita.motivo && (
                        <div className="mb-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                          <p className="text-xs font-black uppercase tracking-[0.1em] text-slate-400">
                            Motivo
                          </p>
                          <p className="mt-1 text-sm font-medium text-slate-700">
                            {cita.motivo}
                          </p>
                        </div>
                      )}

                      {pago && (
                        <div className="mb-4 flex items-start gap-3 rounded-2xl border border-[#00CCA5]/20 bg-[#00CCA5]/10 px-4 py-3">
                          <DollarSign size={16} className="mt-0.5 flex-shrink-0 text-[#008f78]" />
                          <p className="text-xs font-bold text-[#008f78]">
                            Pago registrado el {formatFechaPago(pago.createdAt)} — {cfgMetodo.label} · S/ {pago.monto.toFixed(2)}
                          </p>
                        </div>
                      )}

                      {cita.nota ? (
                        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                          <div className="mb-4 flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#000089]/10">
                              <FileText size={16} className="text-[#000089]" />
                            </div>

                            <div>
                              <p className="text-sm font-black text-slate-900">
                                Nota Clínica
                              </p>
                              <p className="text-xs text-slate-400">
                                Información registrada por el profesional médico.
                              </p>
                            </div>
                          </div>

                          <div className="grid gap-3 md:grid-cols-2">
                            {[
                              { label: 'Diagnóstico', value: cita.nota.diagnostico },
                              { label: 'Tratamiento', value: cita.nota.tratamiento },
                              { label: 'Receta', value: cita.nota.receta },
                              { label: 'Observaciones', value: cita.nota.observacion },
                            ].filter(n => n.value).map((n, i) => (
                              <div
                                key={i}
                                className="rounded-2xl border border-slate-200 bg-white p-4"
                              >
                                <p className="text-xs font-black uppercase tracking-[0.1em] text-slate-400">
                                  {n.label}
                                </p>
                                <p className="mt-1 text-sm font-medium leading-relaxed text-slate-700">
                                  {n.value}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start gap-3 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3">
                          <Stethoscope size={16} className="mt-0.5 flex-shrink-0 text-amber-500" />
                          <p className="text-xs font-bold text-amber-700">
                            El doctor aún no ha registrado la nota clínica.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Paginación */}
            {meta && meta.totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between rounded-[2rem] border border-slate-200/80 bg-white px-4 py-3 shadow-sm md:px-5">
                <p className="hidden text-xs font-medium text-slate-400 sm:block">
                  Mostrando {((page - 1) * LIMIT) + 1}–{Math.min(page * LIMIT, meta.total)} de {meta.total} consultas
                </p>

                <p className="text-xs font-bold text-slate-400 sm:hidden">
                  {page} / {meta.totalPages}
                </p>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(p => p - 1)}
                    disabled={page === 1}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-[#000089] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronLeft size={16} />
                  </button>

                  <span className="hidden rounded-xl bg-slate-50 px-3 py-2 text-xs font-black text-slate-600 sm:inline">
                    {page} / {meta.totalPages}
                  </span>

                  <button
                    onClick={() => setPage(p => p + 1)}
                    disabled={page === meta.totalPages}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-[#000089] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronRight size={16} />
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