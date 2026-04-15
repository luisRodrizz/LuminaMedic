import { useState } from 'react'
import { FileText, DollarSign, Stethoscope, Download, Clock, CheckCircle, AlertCircle, Calendar } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import AdminLayout from '../../../components/AdminLayout'
import api from '../../../services/api'

const hoy = new Date()
const primerDiaMes = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-01`
const hoyStr = hoy.toISOString().split('T')[0]

const inputClass = "px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-slate-50 transition-all w-full"

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
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `${reporte.filename}-${fechas.inicio}-${fechas.fin}.pdf`)
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
    <div className="bg-white rounded-2xl border border-slate-100 p-5 md:p-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      <div className="flex items-start gap-4 mb-5">
        <div className={`w-12 h-12 ${reporte.iconBg} rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm`}>
          <Icon size={22} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-semibold text-slate-800">{reporte.titulo}</h2>
          <p className="text-sm text-slate-400 mt-0.5">{reporte.descripcion}</p>
        </div>
      </div>

      <div className={`flex items-center gap-2 px-3 py-2 ${reporte.iconLight} rounded-xl mb-5`}>
        <FileText size={12} className={reporte.iconText} />
        <span className={`text-xs font-medium ${reporte.iconText}`}>{reporte.stats}</span>
      </div>

      {/* Filtros fecha — apilados en móvil */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-4">
        <div className="flex items-center gap-2 flex-1">
          <Calendar size={14} className="text-slate-400 flex-shrink-0" />
          <input type="date" value={fechas.inicio} max={fechas.fin || hoyStr}
            onChange={e => onFechaChange('inicio', e.target.value)}
            className={inputClass} />
        </div>
        <span className="text-slate-400 text-sm text-center">—</span>
        <div className="flex-1">
          <input type="date" value={fechas.fin} min={fechas.inicio} max={hoyStr}
            onChange={e => onFechaChange('fin', e.target.value)}
            className={inputClass} />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {estado === 'success' && (
          <motion.div key="success"
            initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
            className="flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-100 rounded-xl mb-3">
            <CheckCircle size={13} className="text-emerald-500 flex-shrink-0" />
            <span className="text-xs text-emerald-700 font-medium">Reporte descargado correctamente</span>
          </motion.div>
        )}
        {estado === 'error' && (
          <motion.div key="error"
            initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
            className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-100 rounded-xl mb-3">
            <AlertCircle size={13} className="text-red-500 flex-shrink-0" />
            <span className="text-xs text-red-700 font-medium">Error al generar el reporte</span>
          </motion.div>
        )}
      </AnimatePresence>

      <button onClick={descargar} disabled={estado === 'loading' || !fechas.inicio || !fechas.fin}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-900 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-medium transition-all shadow-sm hover:shadow-md">
        {estado === 'loading' ? (
          <>
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Generando PDF...
          </>
        ) : (
          <>
            <Download size={15} />
            Descargar PDF
          </>
        )}
      </button>

      <p className="flex items-center gap-1.5 text-xs text-slate-400 mt-3 justify-center">
        <Clock size={11} />
        {fechas.inicio && fechas.fin
          ? `${new Date(fechas.inicio + 'T00:00:00').toLocaleDateString('es-PE')} — ${new Date(fechas.fin + 'T00:00:00').toLocaleDateString('es-PE')}`
          : 'Selecciona un período'}
      </p>
    </div>
  )
}

export default function Reportes() {
  const [fechasPagos, setFechasPagos] = useState({ inicio: primerDiaMes, fin: hoyStr })
  const [fechasRendimiento, setFechasRendimiento] = useState({ inicio: primerDiaMes, fin: hoyStr })

  const reportes = [
    {
      id: 'pagos',
      titulo: 'Ingresos por Período',
      descripcion: 'Reporte de pagos registrados en un rango de fechas con totales por método de pago.',
      icon: DollarSign, iconBg: 'bg-emerald-500', iconLight: 'bg-emerald-50', iconText: 'text-emerald-600',
      endpoint: '/reportes/pagos', filename: 'reporte-pagos',
      stats: 'Incluye: paciente, servicio, doctor, método, monto y totales',
      fechas: fechasPagos, setFechas: setFechasPagos,
    },
    {
      id: 'rendimiento',
      titulo: 'Rendimiento por Doctor',
      descripcion: 'Citas completadas, canceladas e ingresos generados por cada doctor en el período.',
      icon: Stethoscope, iconBg: 'bg-indigo-500', iconLight: 'bg-indigo-50', iconText: 'text-indigo-600',
      endpoint: '/reportes/rendimiento', filename: 'reporte-rendimiento',
      stats: 'Incluye: total de citas, completadas, canceladas e ingresos por doctor',
      fechas: fechasRendimiento, setFechas: setFechasRendimiento,
    },
  ]

  return (
    <AdminLayout>
      <div className="page-enter">

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
            <FileText size={20} className="text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Reportes Gerenciales</h1>
            <p className="text-slate-400 text-sm mt-0.5">Análisis de ingresos y rendimiento por período</p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-100 rounded-2xl mb-6">
          <AlertCircle size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-700">
            Selecciona el período para cada reporte. Los PDFs se generan con los datos actuales
            del sistema e incluyen el logo y datos de la clínica automáticamente.
            Para exportar pacientes o citas, usa el botón <strong>Exportar PDF</strong> en cada módulo.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {reportes.map(reporte => (
            <ReporteCard
              key={reporte.id}
              reporte={reporte}
              fechas={reporte.fechas}
              onFechaChange={(campo, valor) =>
                reporte.setFechas(prev => ({ ...prev, [campo]: valor }))
              }
            />
          ))}
        </div>
      </div>
    </AdminLayout>
  )
}