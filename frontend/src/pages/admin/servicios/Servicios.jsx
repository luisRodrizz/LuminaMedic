import { useState, useEffect } from 'react'
import { Plus, Search, Pencil, PowerOff, Activity } from 'lucide-react'
import { AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import AdminLayout from '../../../components/AdminLayout'
import Pagination from '../../../components/Pagination'
import ModalConfirmar from '../../../components/ModalConfirmar'
import ModalCrearServicio from './ModalCrearServicio'
import ModalEditarServicio from './ModalEditarServicio'
import api from '../../../services/api'

export default function Servicios() {
  const [servicios, setServicios] = useState([])
  const [meta, setMeta] = useState(null)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [modalCrear, setModalCrear] = useState(false)
  const [modalEditar, setModalEditar] = useState(false)
  const [modalConfirmar, setModalConfirmar] = useState(false)
  const [servicioSeleccionado, setServicioSeleccionado] = useState(null)

  const fetchServicios = async (p = 1, s = '') => {
    try {
      const res = await api.get(`/servicios?page=${p}&limit=10&search=${s}`)
      setServicios(res.data.data || res.data)
      setMeta(res.data.meta || null)
    } catch {
      toast.error('Error al cargar los servicios')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchServicios(page, search) }, [page, search])

  const handleToggle = async () => {
    try {
      await api.delete(`/servicios/${servicioSeleccionado.id}`)
      setModalConfirmar(false)
      fetchServicios(page, search)
      toast.success(
        servicioSeleccionado.activo
          ? `"${servicioSeleccionado.nombre}" desactivado`
          : `"${servicioSeleccionado.nombre}" activado`
      )
    } catch {
      toast.error('Error al cambiar el estado del servicio')
    }
  }

  return (
    <AdminLayout>
      <div className="page-enter">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center">
              <Activity size={20} className="text-rose-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Servicios</h1>
              <p className="text-slate-400 text-sm mt-0.5">Gestión de servicios médicos</p>
            </div>
          </div>
          <button onClick={() => setModalCrear(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 md:px-4 py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm hover:shadow-md">
            <Plus size={16} />
            <span className="hidden sm:inline">Nuevo Servicio</span>
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 md:px-6 py-4 border-b border-slate-100">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Buscar servicio..."
                value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 w-full sm:w-72 bg-slate-50" />
            </div>
            <p className="text-xs text-slate-400">
              {meta ? `${meta.total} servicio${meta.total !== 1 ? 's' : ''} registrado${meta.total !== 1 ? 's' : ''}` : ''}
            </p>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-slate-400 text-sm">Cargando servicios...</p>
            </div>
          ) : servicios.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center">
                <Activity size={24} className="text-slate-400" />
              </div>
              <p className="text-slate-500 font-medium">No hay servicios registrados</p>
              <p className="text-slate-400 text-sm">Crea el primer servicio con el botón de arriba</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[500px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-4 md:px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Servicio</th>
                    <th className="px-4 md:px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Precio</th>
                    <th className="hidden sm:table-cell px-4 md:px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Duración</th>
                    <th className="px-4 md:px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                    <th className="px-4 md:px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {servicios.map((srv) => (
                    <tr key={srv.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 md:px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-rose-50 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Activity size={15} className="text-rose-500" />
                          </div>
                          <span className="font-medium text-slate-800 text-sm truncate">{srv.nombre}</span>
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-4">
                        <span className="text-sm font-semibold text-slate-800">S/ {srv.precio.toFixed(2)}</span>
                      </td>
                      <td className="hidden sm:table-cell px-4 md:px-6 py-4">
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium">
                          {srv.duracion} min
                        </span>
                      </td>
                      <td className="px-4 md:px-6 py-4">
                        {srv.activo ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-medium">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                            <span className="hidden sm:inline">Activo</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-50 text-red-700 rounded-lg text-xs font-medium">
                            <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                            <span className="hidden sm:inline">Inactivo</span>
                          </span>
                        )}
                      </td>
                      <td className="px-4 md:px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => { setServicioSeleccionado(srv); setModalEditar(true) }}
                            className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all" title="Editar">
                            <Pencil size={15} />
                          </button>
                          <button onClick={() => { setServicioSeleccionado(srv); setModalConfirmar(true) }}
                            className={`p-2 rounded-lg transition-all ${srv.activo
                              ? 'text-slate-400 hover:text-red-600 hover:bg-red-50'
                              : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'}`}
                            title={srv.activo ? 'Desactivar' : 'Activar'}>
                            <PowerOff size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="border-t border-slate-100">
            <Pagination meta={meta} onPageChange={(p) => setPage(p)} />
          </div>
        </div>

        <AnimatePresence>
          {modalCrear && (
            <ModalCrearServicio onClose={() => setModalCrear(false)} onSuccess={() => {
              fetchServicios(page, search)
              toast.success('Servicio creado correctamente')
            }} />
          )}
        </AnimatePresence>
        <AnimatePresence>
          {modalEditar && servicioSeleccionado && (
            <ModalEditarServicio servicio={servicioSeleccionado} onClose={() => setModalEditar(false)} onSuccess={() => {
              fetchServicios(page, search)
              toast.success('Servicio actualizado correctamente')
            }} />
          )}
        </AnimatePresence>
        <AnimatePresence>
          {modalConfirmar && servicioSeleccionado && (
            <ModalConfirmar
              mensaje={servicioSeleccionado.activo ? '¿Desactivar este servicio?' : '¿Activar este servicio?'}
              subMensaje={servicioSeleccionado.nombre}
              onConfirmar={handleToggle}
              onCancelar={() => setModalConfirmar(false)}
              tipo={servicioSeleccionado.activo ? 'danger' : 'success'}
            />
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  )
}