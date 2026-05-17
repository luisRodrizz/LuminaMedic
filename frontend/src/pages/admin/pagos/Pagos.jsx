import { useState, useEffect } from 'react'
import {
  Plus,
  DollarSign,
  CreditCard,
  Banknote,
  TrendingUp,
  FileDown,
  ArrowUpRight,
  Download,
  ReceiptText,
  WalletCards
} from 'lucide-react'
import { AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import AdminLayout from '../../../components/AdminLayout'
import Pagination from '../../../components/Pagination'
import ModalRegistrarPago from './ModalRegistrarPago'
import api from '../../../services/api'

const metodoConfig = {
  efectivo: {
    bg: 'bg-[#00CCA5]/10',
    text: 'text-[#008f78]',
    dot: 'bg-[#00CCA5]',
    icon: Banknote
  },
  tarjeta: {
    bg: 'bg-[#000089]/10',
    text: 'text-[#000089]',
    dot: 'bg-[#000089]',
    icon: CreditCard
  },
  transferencia: {
    bg: 'bg-sky-50',
    text: 'text-sky-700',
    dot: 'bg-sky-500',
    icon: TrendingUp
  }
}

export default function Pagos() {
  const [pagos, setPagos] = useState([])
  const [resumen, setResumen] = useState(null)
  const [meta, setMeta] = useState(null)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [modalRegistrar, setModalRegistrar] = useState(false)

  const fetchPagos = async (p = 1) => {
    try {
      const [pagosRes, resumenRes] = await Promise.all([
        api.get(`/pagos?page=${p}&limit=10`),
        api.get('/pagos/resumen')
      ])

      setPagos(pagosRes.data.data)
      setMeta(pagosRes.data.meta)
      setResumen(resumenRes.data)
    } catch {
      toast.error('Error al cargar los pagos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPagos(page)
  }, [page])

  const exportarPDF = async () => {
    const toastId = toast.loading('Generando PDF...')

    try {
      const res = await api.get('/pagos/reporte', { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')

      link.href = url
      link.setAttribute('download', 'pagos.pdf')
      document.body.appendChild(link)
      link.click()
      link.remove()

      toast.success('PDF descargado correctamente', { id: toastId })
    } catch {
      toast.error('Error al exportar el PDF', { id: toastId })
    }
  }

  const formatFecha = (fecha) =>
    new Date(fecha).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })

  const descargarRecibo = async (pagoId) => {
    const toastId = toast.loading('Generando recibo...')

    try {
      const res = await api.get(`/reportes/pago/${pagoId}`, {
        responseType: 'blob'
      })

      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')

      link.href = url
      link.setAttribute('download', `recibo-pago-${pagoId}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()

      toast.success('Recibo descargado', { id: toastId })
    } catch {
      toast.error('Error al generar el recibo', { id: toastId })
    }
  }

  return (
    <AdminLayout>
      <div className="page-enter">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-950 md:text-3xl">
              Pagos
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              Gestiona ingresos, métodos de pago y recibos emitidos por atenciones clínicas.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <button
              onClick={exportarPDF}
              className="flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-600 shadow-sm transition hover:border-[#00CCA5]/30 hover:bg-slate-50 hover:text-[#000089]"
            >
              <FileDown size={16} />
              Exportar PDF
            </button>

            <button
              onClick={() => setModalRegistrar(true)}
              className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#000089] px-4 text-sm font-black text-white shadow-lg shadow-[#000089]/20 transition hover:bg-[#000070] hover:ring-4 hover:ring-[#00CCA5]/15"
            >
              <Plus size={16} />
              Registrar Pago
            </button>
          </div>
        </div>

        {/* Tarjetas resumen */}
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="group flex items-center gap-4 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-[#00CCA5] shadow-lg shadow-[#00CCA5]/20">
              <DollarSign size={20} className="text-white" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-400">
                Ingresos del mes
              </p>
              <p className="text-2xl font-black text-slate-950">
                S/ {resumen?.totalMes?.toFixed(2) || '0.00'}
              </p>
            </div>

            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#00CCA5]/10">
              <ArrowUpRight size={15} className="text-[#008f78]" />
            </div>
          </div>

          <div className="group flex items-center gap-4 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-[#000089] shadow-lg shadow-[#000089]/15">
              <TrendingUp size={20} className="text-white" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-400">
                Ingresos totales
              </p>
              <p className="text-2xl font-black text-slate-950">
                S/ {resumen?.totalGeneral?.toFixed(2) || '0.00'}
              </p>
            </div>

            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#000089]/10">
              <ArrowUpRight size={15} className="text-[#000089]" />
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100">
                <WalletCards size={18} className="text-slate-500" />
              </div>

              <div>
                <p className="text-sm font-black text-slate-900">
                  Por método de pago
                </p>
                <p className="text-xs text-slate-400">
                  Distribución registrada
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {resumen?.porMetodo?.length ? (
                resumen.porMetodo.map((m) => {
                  const cfg = metodoConfig[m.metodo] || metodoConfig.efectivo
                  const Icon = cfg.icon

                  return (
                    <div
                      key={m.metodo}
                      className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-3 py-2"
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <Icon size={14} className={cfg.text} />

                        <span
                          className={`truncate rounded-xl px-2 py-0.5 text-xs font-black ${cfg.bg} ${cfg.text}`}
                        >
                          {m.metodo}
                        </span>
                      </div>

                      <span className="whitespace-nowrap text-sm font-black text-slate-800">
                        S/ {m.total.toFixed(2)}
                      </span>
                    </div>
                  )
                })
              ) : (
                <p className="text-xs text-slate-400">
                  Sin métodos registrados.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Tabla */}
        <div className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-5 md:flex-row md:items-center md:justify-between md:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#00CCA5]/10">
                <ReceiptText size={18} className="text-[#008f78]" />
              </div>

              <div>
                <p className="text-sm font-black text-slate-900">
                  Historial de pagos
                </p>
                <p className="text-xs text-slate-400">
                  Recibos, métodos y montos registrados
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end">
              {meta && (
                <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2">
                  <span className="h-2 w-2 rounded-full bg-[#00CCA5]" />
                  <span className="text-xs font-bold text-slate-500">
                    {meta.total} pago{meta.total !== 1 ? 's' : ''} registrado
                    {meta.total !== 1 ? 's' : ''}
                  </span>
                </div>
              )}
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16">
              <div className="h-9 w-9 animate-spin rounded-full border-2 border-[#00CCA5] border-t-transparent" />
              <p className="text-sm text-slate-400">Cargando pagos...</p>
            </div>
          ) : pagos.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 px-6 py-16">
              <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-slate-100">
                <DollarSign size={24} className="text-slate-400" />
              </div>

              <div className="text-center">
                <p className="text-sm font-black text-slate-700">
                  No hay pagos registrados
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Registra el primer pago desde el botón superior.
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/80">
                    <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">
                      Fecha
                    </th>
                    <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">
                      Paciente
                    </th>
                    <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">
                      Servicio
                    </th>
                    <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">
                      Doctor
                    </th>
                    <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">
                      Método
                    </th>
                    <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">
                      Monto
                    </th>
                    <th className="px-6 py-4 text-right text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">
                      Recibo
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {pagos.map((pago) => {
                    const cfg = metodoConfig[pago.metodo] || metodoConfig.efectivo
                    const Icon = cfg.icon

                    return (
                      <tr
                        key={pago.id}
                        className="transition-colors hover:bg-slate-50/70"
                      >
                        <td className="px-6 py-4">
                          <div className="inline-flex rounded-2xl bg-slate-100 px-3 py-1.5">
                            <span className="whitespace-nowrap font-mono text-sm font-black text-slate-700">
                              {formatFecha(pago.createdAt)}
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-2xl bg-[#00CCA5]/10">
                              <span className="text-xs font-black text-[#008f78]">
                                {pago.cita.paciente.usuario.nombre[0]}
                                {pago.cita.paciente.usuario.apellido[0]}
                              </span>
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-sm font-black text-slate-800">
                                {pago.cita.paciente.usuario.nombre}{' '}
                                {pago.cita.paciente.usuario.apellido}
                              </p>
                              <p className="text-xs text-slate-400">
                                Paciente
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <span className="inline-flex rounded-2xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-600">
                            {pago.cita.servicio.nombre}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-slate-700">
                              Dr. {pago.cita.doctor.usuario.nombre}{' '}
                              {pago.cita.doctor.usuario.apellido}
                            </p>
                            <p className="text-xs text-slate-400">
                              Médico asignado
                            </p>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-2 rounded-2xl px-3 py-1.5 text-xs font-black ${cfg.bg} ${cfg.text}`}
                          >
                            <Icon size={12} />
                            {pago.metodo}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <span className="text-sm font-black text-[#008f78]">
                            S/ {pago.monto.toFixed(2)}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex justify-end">
                            <button
                              onClick={() => descargarRecibo(pago.id)}
                              className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-[#00CCA5]/10 hover:text-[#008f78]"
                              title="Descargar recibo"
                            >
                              <Download size={15} />
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

          <div className="border-t border-slate-100">
            <Pagination meta={meta} onPageChange={(p) => setPage(p)} />
          </div>
        </div>

        <AnimatePresence>
          {modalRegistrar && (
            <ModalRegistrarPago
              onClose={() => setModalRegistrar(false)}
              onSuccess={() => {
                fetchPagos(page)
                toast.success('Pago registrado correctamente')
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  )
}