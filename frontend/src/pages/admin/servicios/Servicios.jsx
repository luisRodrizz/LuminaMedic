import { useState, useEffect } from 'react'
import {
  Plus,
  Search,
  Pencil,
  PowerOff,
  Activity,
  Clock,
  DollarSign,
  ShieldCheck
} from 'lucide-react'
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

  useEffect(() => {
    fetchServicios(page, search)
  }, [page, search])

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

  const totalServicios = meta?.total ?? servicios.length
  const activos = servicios.filter((s) => s.activo).length
  const inactivos = servicios.filter((s) => !s.activo).length

  return (
    <AdminLayout>
      <div className="page-enter">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-950 md:text-3xl">
              Servicios
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              Administra las especialidades, consultas y servicios disponibles para la atención clínica.
            </p>
          </div>

          <button
            onClick={() => setModalCrear(true)}
            className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#000089] px-4 text-sm font-black text-white shadow-lg shadow-[#000089]/20 transition hover:bg-[#000070] hover:ring-4 hover:ring-[#00CCA5]/15"
          >
            <Plus size={17} />
            Nuevo Servicio
          </button>
        </div>

        {/* Resumen */}
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#000089] shadow-lg shadow-[#000089]/15">
                <Activity size={20} className="text-white" />
              </div>

              <div>
                <p className="text-xs font-bold text-slate-400">
                  Servicios registrados
                </p>
                <p className="text-2xl font-black text-slate-950">
                  {totalServicios}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#00CCA5] shadow-lg shadow-[#00CCA5]/20">
                <ShieldCheck size={20} className="text-white" />
              </div>

              <div>
                <p className="text-xs font-bold text-slate-400">
                  Activos en esta página
                </p>
                <p className="text-2xl font-black text-slate-950">
                  {activos}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 shadow-lg shadow-slate-200">
                <PowerOff size={20} className="text-white" />
              </div>

              <div>
                <p className="text-xs font-bold text-slate-400">
                  Inactivos en esta página
                </p>
                <p className="text-2xl font-black text-slate-950">
                  {inactivos}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabla */}
        <div className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 md:flex-row md:items-center md:justify-between md:px-6">
            <div className="relative w-full md:max-w-sm">
              <Search
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                placeholder="Buscar servicio..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#00CCA5] focus:bg-white focus:ring-4 focus:ring-[#00CCA5]/15"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-500">
                Gestión médica
              </span>

              {meta && (
                <span className="rounded-full bg-[#00CCA5]/10 px-3 py-1 text-xs font-black text-[#008f78]">
                  {meta.total} servicio{meta.total !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16">
              <div className="h-9 w-9 animate-spin rounded-full border-2 border-[#00CCA5] border-t-transparent" />
              <p className="text-sm text-slate-400">Cargando servicios...</p>
            </div>
          ) : servicios.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 px-6 py-16">
              <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-slate-100">
                <Activity size={24} className="text-slate-400" />
              </div>

              <div className="text-center">
                <p className="text-sm font-black text-slate-700">
                  No hay servicios registrados
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Crea el primer servicio médico desde el botón superior.
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px]">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/80">
                    <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">
                      Servicio
                    </th>
                    <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">
                      Precio
                    </th>
                    <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">
                      Duración
                    </th>
                    <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">
                      Estado
                    </th>
                    <th className="px-6 py-4 text-right text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">
                      Acciones
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {servicios.map((srv) => (
                    <tr
                      key={srv.id}
                      className="transition-colors hover:bg-slate-50/70"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-[#00CCA5]/10">
                            <Activity size={16} className="text-[#008f78]" />
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-black text-slate-800">
                              {srv.nombre}
                            </p>
                            <p className="text-xs text-slate-400">
                              Servicio médico
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="inline-flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-1.5">
                          <DollarSign size={14} className="text-slate-400" />
                          <span className="text-sm font-black text-slate-800">
                            S/ {srv.precio.toFixed(2)}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600">
                          <Clock size={13} className="text-slate-400" />
                          {srv.duracion} min
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        {srv.activo ? (
                          <span className="inline-flex items-center gap-2 rounded-2xl bg-[#00CCA5]/10 px-3 py-1.5 text-xs font-black text-[#008f78]">
                            <span className="h-2 w-2 rounded-full bg-[#00CCA5]" />
                            Activo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-2 rounded-2xl bg-red-50 px-3 py-1.5 text-xs font-black text-red-700">
                            <span className="h-2 w-2 rounded-full bg-red-500" />
                            Inactivo
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setServicioSeleccionado(srv)
                              setModalEditar(true)
                            }}
                            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-amber-50 hover:text-amber-600"
                            title="Editar"
                          >
                            <Pencil size={15} />
                          </button>

                          <button
                            onClick={() => {
                              setServicioSeleccionado(srv)
                              setModalConfirmar(true)
                            }}
                            className={`flex h-9 w-9 items-center justify-center rounded-xl transition ${
                              srv.activo
                                ? 'text-slate-400 hover:bg-red-50 hover:text-red-600'
                                : 'text-slate-400 hover:bg-emerald-50 hover:text-emerald-600'
                            }`}
                            title={srv.activo ? 'Desactivar' : 'Activar'}
                          >
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
            <ModalCrearServicio
              onClose={() => setModalCrear(false)}
              onSuccess={() => {
                fetchServicios(page, search)
                toast.success('Servicio creado correctamente')
              }}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {modalEditar && servicioSeleccionado && (
            <ModalEditarServicio
              servicio={servicioSeleccionado}
              onClose={() => setModalEditar(false)}
              onSuccess={() => {
                fetchServicios(page, search)
                toast.success('Servicio actualizado correctamente')
              }}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {modalConfirmar && servicioSeleccionado && (
            <ModalConfirmar
              mensaje={
                servicioSeleccionado.activo
                  ? '¿Desactivar este servicio?'
                  : '¿Activar este servicio?'
              }
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