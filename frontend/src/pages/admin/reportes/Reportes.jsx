import { useState } from 'react'
import {
  FileText,
  DollarSign,
  Stethoscope,
  Download,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  BarChart3
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import AdminLayout from '../../../components/AdminLayout'
import api from '../../../services/api'

const hoy = new Date()
const primerDiaMes = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-01`
const hoyStr = hoy.toISOString().split('T')[0]

const inputClass =
  'h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none transition focus:border-[#00CCA5] focus:bg-white focus:ring-4 focus:ring-[#00CCA5]/15'

function ReporteCard({ reporte, fechas, onFechaChange }) {
  const [estado, setEstado] = useState('idle')
  const Icon = reporte.icon

  const descargar = async () => {
    if (!fechas.inicio || !fechas.fin) return

    setEstado('loading')

    try {
      const res = await api.get(
        `${reporte.endpoint}?inicio=${fechas.inicio}&fin=${fechas.fin}`,
        { responseType: 'blob' }
      )

      const url = window.URL.createObjectURL(
        new Blob([res.data], { type: 'application/pdf' })
      )

      const link = document.createElement('a')
      link.href = url
      link.setAttribute(
        'download',
        `${reporte.filename}-${fechas.inicio}-${fechas.fin}.pdf`
      )

      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      setEstado('success')
      setTimeout(() => setEstado('idle'), 3000)
    } catch {
      setEstado('error')
      setTimeout(() => setEstado('idle'), 3000)
    }
  }

  return (
    <div className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
      {/* Header card */}
      <div className="border-b border-slate-100 px-6 py-6">
        <div className="flex items-start gap-4">
          <div
            className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl ${reporte.iconBg} shadow-lg ${reporte.shadow}`}
          >
            <Icon size={22} className="text-white" />
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-black text-slate-950">
              {reporte.titulo}
            </h2>

            <p className="mt-1 text-sm leading-6 text-slate-400">
              {reporte.descripcion}
            </p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="px-6 py-6">
        <div className={`mb-5 rounded-2xl px-4 py-3 ${reporte.iconLight}`}>
          <div className="flex items-start gap-2">
            <FileText
              size={14}
              className={`mt-0.5 flex-shrink-0 ${reporte.iconText}`}
            />

            <p className={`text-xs font-bold leading-5 ${reporte.iconText}`}>
              {reporte.stats}
            </p>
          </div>
        </div>

        {/* Fechas */}
        <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
          <div>
            <label className="mb-2 block text-xs font-black text-slate-700">
              Fecha inicio
            </label>

            <div className="relative">
              <Calendar
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="date"
                value={fechas.inicio}
                max={fechas.fin || hoyStr}
                onChange={(e) => onFechaChange('inicio', e.target.value)}
                className={`${inputClass} pl-10`}
              />
            </div>
          </div>

          <span className="hidden pt-6 text-slate-300 sm:block">—</span>

          <div>
            <label className="mb-2 block text-xs font-black text-slate-700">
              Fecha fin
            </label>

            <div className="relative">
              <Calendar
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="date"
                value={fechas.fin}
                min={fechas.inicio}
                max={hoyStr}
                onChange={(e) => onFechaChange('fin', e.target.value)}
                className={`${inputClass} pl-10`}
              />
            </div>
          </div>
        </div>

        <div className="mb-4 flex items-center justify-center gap-1.5 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
          <Clock size={12} className="text-slate-400" />

          <span className="text-xs font-bold text-slate-500">
            {fechas.inicio && fechas.fin
              ? `${new Date(fechas.inicio + 'T00:00:00').toLocaleDateString(
                  'es-PE'
                )} — ${new Date(fechas.fin + 'T00:00:00').toLocaleDateString(
                  'es-PE'
                )}`
              : 'Selecciona un período'}
          </span>
        </div>

        <AnimatePresence mode="wait">
          {estado === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="mb-4 flex items-start gap-3 rounded-2xl border border-[#00CCA5]/20 bg-[#00CCA5]/10 px-4 py-3"
            >
              <CheckCircle
                size={15}
                className="mt-0.5 flex-shrink-0 text-[#008f78]"
              />
              <span className="text-xs font-bold leading-5 text-[#008f78]">
                Reporte descargado correctamente.
              </span>
            </motion.div>
          )}

          {estado === 'error' && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="mb-4 flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3"
            >
              <AlertCircle
                size={15}
                className="mt-0.5 flex-shrink-0 text-red-500"
              />
              <span className="text-xs font-bold leading-5 text-red-700">
                Error al generar el reporte.
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={descargar}
          disabled={estado === 'loading' || !fechas.inicio || !fechas.fin}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#000089] px-4 text-sm font-black text-white shadow-lg shadow-[#000089]/20 transition hover:bg-[#000070] hover:ring-4 hover:ring-[#00CCA5]/15 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {estado === 'loading' ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Generando PDF...
            </>
          ) : (
            <>
              <Download size={16} />
              Descargar PDF
            </>
          )}
        </button>
      </div>
    </div>
  )
}

export default function Reportes() {
  const [fechasPagos, setFechasPagos] = useState({
    inicio: primerDiaMes,
    fin: hoyStr
  })

  const [fechasRendimiento, setFechasRendimiento] = useState({
    inicio: primerDiaMes,
    fin: hoyStr
  })

  const reportes = [
    {
      id: 'pagos',
      titulo: 'Ingresos por Período',
      descripcion:
        'Reporte de pagos registrados en un rango de fechas con totales por método de pago.',
      icon: DollarSign,
      iconBg: 'bg-[#00CCA5]',
      iconLight: 'bg-[#00CCA5]/10',
      iconText: 'text-[#008f78]',
      shadow: 'shadow-[#00CCA5]/20',
      endpoint: '/reportes/pagos',
      filename: 'reporte-pagos',
      stats: 'Incluye paciente, servicio, doctor, método, monto y totales del período.',
      fechas: fechasPagos,
      setFechas: setFechasPagos
    },
    {
      id: 'rendimiento',
      titulo: 'Rendimiento por Doctor',
      descripcion:
        'Citas completadas, canceladas e ingresos generados por cada doctor en el período.',
      icon: Stethoscope,
      iconBg: 'bg-[#000089]',
      iconLight: 'bg-[#000089]/10',
      iconText: 'text-[#000089]',
      shadow: 'shadow-[#000089]/15',
      endpoint: '/reportes/rendimiento',
      filename: 'reporte-rendimiento',
      stats: 'Incluye total de citas, completadas, canceladas e ingresos por doctor.',
      fechas: fechasRendimiento,
      setFechas: setFechasRendimiento
    }
  ]

  return (
    <AdminLayout>
      <div className="page-enter">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-black tracking-tight text-slate-950 md:text-3xl">
            Reportes Gerenciales
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Genera análisis administrativos sobre ingresos y rendimiento médico por período.
          </p>
        </div>

        {/* Aviso */}
        <div className="mb-6 rounded-[2rem] border border-[#000089]/10 bg-[#000089]/5 px-5 py-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-white">
              <BarChart3 size={18} className="text-[#000089]" />
            </div>

            <div>
              <p className="text-sm font-black text-slate-800">
                Exportación de reportes
              </p>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                Selecciona el período para cada reporte. Los PDFs se generan con
                datos actuales del sistema e incluyen automáticamente la identidad
                y datos registrados de la clínica.
              </p>

              <p className="mt-2 text-xs font-bold text-slate-400">
                Para exportar pacientes o citas generales, utiliza el botón Exportar PDF
                dentro de cada módulo correspondiente.
              </p>
            </div>
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          {reportes.map((reporte) => (
            <ReporteCard
              key={reporte.id}
              reporte={reporte}
              fechas={reporte.fechas}
              onFechaChange={(campo, valor) =>
                reporte.setFechas((prev) => ({ ...prev, [campo]: valor }))
              }
            />
          ))}
        </div>
      </div>
    </AdminLayout>
  )
}