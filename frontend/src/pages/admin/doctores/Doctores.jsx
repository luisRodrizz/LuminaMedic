import { useState, useEffect } from 'react'
import { Plus, Search, Eye, Pencil, UserX, Stethoscope } from 'lucide-react'
import { AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import AdminLayout from '../../../components/AdminLayout'
import Pagination from '../../../components/Pagination'
import ModalConfirmar from '../../../components/ModalConfirmar'
import ModalCrearDoctor from './ModalCrearDoctor'
import ModalEditarDoctor from './ModalEditarDoctor'
import ModalVerDoctor from './ModalVerDoctor'
import api from '../../../services/api'

export default function Doctores() {
  const [doctores, setDoctores] = useState([])
  const [meta, setMeta] = useState(null)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [modalCrear, setModalCrear] = useState(false)
  const [modalEditar, setModalEditar] = useState(false)
  const [modalVer, setModalVer] = useState(false)
  const [modalConfirmar, setModalConfirmar] = useState(false)
  const [doctorSeleccionado, setDoctorSeleccionado] = useState(null)

  const fetchDoctores = async (p = 1, s = '') => {
    try {
      const res = await api.get(`/doctores?page=${p}&limit=10&search=${s}`)
      setDoctores(res.data.data)
      setMeta(res.data.meta)
    } catch {
      toast.error('Error al cargar los doctores')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchDoctores(page, search) }, [page, search])

  const handleEliminar = async () => {
    try {
      await api.delete(`/doctores/${doctorSeleccionado.id}`)
      setModalConfirmar(false)
      fetchDoctores(page, search)
      toast.success(
        doctorSeleccionado.usuario.activo
          ? `Dr. ${doctorSeleccionado.usuario.nombre} desactivado`
          : `Dr. ${doctorSeleccionado.usuario.nombre} activado`
      )
    } catch {
      toast.error('Error al cambiar el estado del doctor')
    }
  }

  return (
    <AdminLayout>
      <div className="page-enter">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <Stethoscope size={20} className="text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Doctores</h1>
              <p className="text-slate-400 text-sm mt-0.5">Gestión del personal médico</p>
            </div>
          </div>
          <button onClick={() => setModalCrear(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 md:px-4 py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm hover:shadow-md">
            <Plus size={16} />
            <span className="hidden sm:inline">Nuevo Doctor</span>
          </button>
        </div>

        {/* Card tabla */}
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 md:px-6 py-4 border-b border-slate-100">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Buscar por nombre, especialidad o documento..."
                value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 w-full sm:w-80 bg-slate-50" />
            </div>
            <p className="text-xs text-slate-400">
              {meta ? `${meta.total} doctor${meta.total !== 1 ? 'es' : ''} registrado${meta.total !== 1 ? 's' : ''}` : ''}
            </p>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-slate-400 text-sm">Cargando doctores...</p>
            </div>
          ) : doctores.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center">
                <Stethoscope size={24} className="text-slate-400" />
              </div>
              <p className="text-slate-500 font-medium">No hay doctores registrados</p>
              <p className="text-slate-400 text-sm">Crea el primer doctor con el botón de arriba</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-4 md:px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Doctor</th>
                    <th className="hidden sm:table-cell px-4 md:px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Especialidad</th>
                    <th className="hidden md:table-cell px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Documento</th>
                    <th className="hidden lg:table-cell px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Teléfono</th>
                    <th className="px-4 md:px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                    <th className="px-4 md:px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {doctores.map((doc) => (
                    <tr key={doc.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 md:px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0 bg-blue-50 flex items-center justify-center">
                            {doc.foto ? (
                              <img src={doc.foto} alt={`${doc.usuario.nombre} ${doc.usuario.apellido}`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = 'none'
                                  e.target.parentNode.innerHTML = `<span class="text-blue-600 text-xs font-bold">${doc.usuario.nombre[0]}${doc.usuario.apellido[0]}</span>`
                                }} />
                            ) : (
                              <span className="text-blue-600 text-xs font-bold">
                                {doc.usuario.nombre[0]}{doc.usuario.apellido[0]}
                              </span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-slate-800 text-sm truncate">
                              Dr. {doc.usuario.nombre} {doc.usuario.apellido}
                            </p>
                            <p className="text-xs text-slate-400 truncate">{doc.usuario.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="hidden sm:table-cell px-4 md:px-6 py-4">
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium">
                          {doc.especialidad}
                        </span>
                      </td>
                      <td className="hidden md:table-cell px-6 py-4">
                        <div>
                          <p className="text-slate-700 text-sm font-mono">{doc.numeroDocumento || '—'}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{doc.tipoDocumento}</p>
                        </div>
                      </td>
                      <td className="hidden lg:table-cell px-6 py-4 text-slate-500 text-sm">
                        {doc.usuario.telefono || '—'}
                      </td>
                      <td className="px-4 md:px-6 py-4">
                        {doc.usuario.activo ? (
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
                          <button onClick={() => { setDoctorSeleccionado(doc); setModalVer(true) }}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Ver detalle">
                            <Eye size={15} />
                          </button>
                          <button onClick={() => { setDoctorSeleccionado(doc); setModalEditar(true) }}
                            className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all" title="Editar">
                            <Pencil size={15} />
                          </button>
                          <button onClick={() => { setDoctorSeleccionado(doc); setModalConfirmar(true) }}
                            className={`p-2 rounded-lg transition-all ${doc.usuario.activo
                              ? 'text-slate-400 hover:text-red-600 hover:bg-red-50'
                              : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'}`}
                            title={doc.usuario.activo ? 'Desactivar' : 'Activar'}>
                            <UserX size={15} />
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
            <ModalCrearDoctor onClose={() => setModalCrear(false)} onSuccess={() => {
              fetchDoctores(page, search)
              toast.success('Doctor creado correctamente')
            }} />
          )}
        </AnimatePresence>
        <AnimatePresence>
          {modalEditar && doctorSeleccionado && (
            <ModalEditarDoctor doctor={doctorSeleccionado} onClose={() => setModalEditar(false)} onSuccess={() => {
              fetchDoctores(page, search)
              toast.success('Doctor actualizado correctamente')
            }} />
          )}
        </AnimatePresence>
        <AnimatePresence>
          {modalVer && doctorSeleccionado && (
            <ModalVerDoctor doctorId={doctorSeleccionado.id} onClose={() => setModalVer(false)} />
          )}
        </AnimatePresence>
        <AnimatePresence>
          {modalConfirmar && doctorSeleccionado && (
            <ModalConfirmar
              mensaje={doctorSeleccionado.usuario.activo ? '¿Desactivar este doctor?' : '¿Activar este doctor?'}
              subMensaje={`Dr. ${doctorSeleccionado.usuario.nombre} ${doctorSeleccionado.usuario.apellido}`}
              onConfirmar={handleEliminar}
              onCancelar={() => setModalConfirmar(false)}
              tipo={doctorSeleccionado.usuario.activo ? 'danger' : 'success'}
            />
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  )
}