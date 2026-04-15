import { useState, useEffect } from 'react'
import { Plus, DollarSign, CreditCard, Banknote, TrendingUp, FileDown, ArrowUpRight, Download } from 'lucide-react'
import { AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import AdminLayout from '../../../components/AdminLayout'
import Pagination from '../../../components/Pagination'
import ModalRegistrarPago from './ModalRegistrarPago'
import api from '../../../services/api'

const metodoConfig = {
  efectivo:      { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-400', icon: Banknote },
  tarjeta:       { bg: 'bg-blue-50',    text: 'text-blue-700',    dot: 'bg-blue-400',    icon: CreditCard },
  transferencia: { bg: 'bg-violet-50',  text: 'text-violet-700',  dot: 'bg-violet-400',  icon: TrendingUp }
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

  useEffect(() => { fetchPagos(page) }, [page])

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

  const formatFecha = (fecha) => new Date(fecha).toLocaleDateString('es-PE', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  })

  const descargarRecibo = async (pagoId) => {
    const toastId = toast.loading('Generando recibo...')
    try {
      const res = await api.get(`/reportes/pago/${pagoId}`, { responseType: 'blob' })
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
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
              <DollarSign size={20} className="text-emerald-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Pagos</h1>
              <p className="text-slate-400 text-sm mt-0.5">Gestión de pagos e ingresos</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={exportarPDF}
              className="flex items-center gap-2 border border-slate-200 text-slate-600 hover:bg-slate-50 px-3 md:px-4 py-2.5 rounded-xl text-sm font-medium transition-all">
              <FileDown size={16} />
              <span className="hidden sm:inline">Exportar PDF</span>
            </button>
            <button onClick={() => setModalRegistrar(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 md:px-4 py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm hover:shadow-md">
              <Plus size={16} />
              <span className="hidden sm:inline">Registrar Pago</span>
            </button>
          </div>
        </div>

        {/* Tarjetas resumen */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
            <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
              <DollarSign size={20} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-slate-400 text-xs">Ingresos del mes</p>
              <p className="text-2xl font-bold text-slate-800">S/ {resumen?.totalMes?.toFixed(2) || '0.00'}</p>
            </div>
            <ArrowUpRight size={16} className="text-slate-300 flex-shrink-0" />
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
              <TrendingUp size={20} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-slate-400 text-xs">Ingresos totales</p>
              <p className="text-2xl font-bold text-slate-800">S/ {resumen?.totalGeneral?.toFixed(2) || '0.00'}</p>
            </div>
            <ArrowUpRight size={16} className="text-slate-300 flex-shrink-0" />
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
            <p className="text-slate-400 text-xs mb-3">Por método de pago</p>
            <div className="space-y-2">
              {resumen?.porMetodo?.map((m) => {
                const cfg = metodoConfig[m.metodo] || metodoConfig.efectivo
                const Icon = cfg.icon
                return (
                  <div key={m.metodo} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon size={13} className={cfg.text} />
                      <span className={`px-2 py-0.5 rounded-lg text-xs font-medium ${cfg.bg} ${cfg.text}`}>
                        {m.metodo}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-slate-700">S/ {m.total.toFixed(2)}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-slate-100">
            <p className="text-sm font-semibold text-slate-700">Historial de pagos</p>
            <p className="text-xs text-slate-400">
              {meta ? `${meta.total} pago${meta.total !== 1 ? 's' : ''} registrado${meta.total !== 1 ? 's' : ''}` : ''}
            </p>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-slate-400 text-sm">Cargando pagos...</p>
            </div>
          ) : pagos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center">
                <DollarSign size={24} className="text-slate-400" />
              </div>
              <p className="text-slate-500 font-medium">No hay pagos registrados</p>
              <p className="text-slate-400 text-sm">Registra el primer pago con el botón de arriba</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-4 md:px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Fecha</th>
                    <th className="px-4 md:px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Paciente</th>
                    <th className="hidden sm:table-cell px-4 md:px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Servicio</th>
                    <th className="hidden md:table-cell px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Doctor</th>
                    <th className="hidden sm:table-cell px-4 md:px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Método</th>
                    <th className="px-4 md:px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Monto</th>
                    <th className="px-4 md:px-6 py-3.5"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {pagos.map((pago) => {
                    const cfg = metodoConfig[pago.metodo] || metodoConfig.efectivo
                    const Icon = cfg.icon
                    return (
                      <tr key={pago.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-4 md:px-6 py-4 text-slate-500 text-sm whitespace-nowrap">
                          {formatFecha(pago.createdAt)}
                        </td>
                        <td className="px-4 md:px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0">
                              <span className="text-indigo-600 text-xs font-bold">
                                {pago.cita.paciente.usuario.nombre[0]}{pago.cita.paciente.usuario.apellido[0]}
                              </span>
                            </div>
                            <span className="text-sm font-medium text-slate-800 truncate max-w-[120px] md:max-w-none">
                              {pago.cita.paciente.usuario.nombre} {pago.cita.paciente.usuario.apellido}
                            </span>
                          </div>
                        </td>
                        <td className="hidden sm:table-cell px-4 md:px-6 py-4">
                          <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium">
                            {pago.cita.servicio.nombre}
                          </span>
                        </td>
                        <td className="hidden md:table-cell px-6 py-4 text-slate-500 text-sm">
                          Dr. {pago.cita.doctor.usuario.nombre} {pago.cita.doctor.usuario.apellido}
                        </td>
                        <td className="hidden sm:table-cell px-4 md:px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${cfg.bg} ${cfg.text}`}>
                            <Icon size={11} />{pago.metodo}
                          </span>
                        </td>
                        <td className="px-4 md:px-6 py-4">
                          <span className="text-sm font-bold text-emerald-600">S/ {pago.monto.toFixed(2)}</span>
                        </td>
                        <td className="px-4 md:px-6 py-4">
                          <button onClick={() => descargarRecibo(pago.id)}
                            className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                            title="Descargar recibo">
                            <Download size={15} />
                          </button>
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
            <ModalRegistrarPago onClose={() => setModalRegistrar(false)} onSuccess={() => {
              fetchPagos(page)
              toast.success('Pago registrado correctamente')
            }} />
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  )
}