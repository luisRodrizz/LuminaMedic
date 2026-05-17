import { useState, useEffect } from 'react'
import {
  Plus,
  Search,
  Eye,
  Pencil,
  UserX,
  Users,
  FileDown,
  UserRound,
  ShieldCheck,
  Activity,
  IdCard,
  Mail,
  Phone
} from 'lucide-react'
import { AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import AdminLayout from '../../../components/AdminLayout'
import Pagination from '../../../components/Pagination'
import ModalConfirmar from '../../../components/ModalConfirmar'
import ModalCrearPaciente from './ModalCrearPaciente'
import ModalEditarPaciente from './ModalEditarPaciente'
import ModalVerPaciente from './ModalVerPaciente'
import api from '../../../services/api'

export default function Pacientes() {
  const [pacientes, setPacientes] = useState([])
  const [meta, setMeta] = useState(null)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [modalCrear, setModalCrear] = useState(false)
  const [modalEditar, setModalEditar] = useState(false)
  const [modalVer, setModalVer] = useState(false)
  const [modalConfirmar, setModalConfirmar] = useState(false)
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null)

  const fetchPacientes = async (p = 1, s = '') => {
    try {
      const res = await api.get(`/pacientes?page=${p}&limit=10&search=${s}`)
      setPacientes(res.data.data)
      setMeta(res.data.meta)
    } catch {
      toast.error('Error al cargar los pacientes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPacientes(page, search)
  }, [page, search])

  const handleEliminar = async () => {
    try {
      await api.delete(`/pacientes/${pacienteSeleccionado.id}`)
      setModalConfirmar(false)
      fetchPacientes(page, search)

      toast.success(
        pacienteSeleccionado.usuario.activo
          ? `${pacienteSeleccionado.usuario.nombre} desactivado`
          : `${pacienteSeleccionado.usuario.nombre} activado`
      )
    } catch {
      toast.error('Error al cambiar el estado del paciente')
    }
  }

  const exportarPDF = async () => {
    const toastId = toast.loading('Generando PDF...')

    try {
      const res = await api.get('/reportes/pacientes', {
        responseType: 'blob'
      })

      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')

      link.href = url
      link.setAttribute('download', 'pacientes.pdf')
      document.body.appendChild(link)
      link.click()
      link.remove()

      toast.success('PDF descargado correctamente', { id: toastId })
    } catch {
      toast.error('Error al exportar el PDF', { id: toastId })
    }
  }

  const activos = pacientes.filter((pac) => pac.usuario.activo).length
  const inactivos = pacientes.filter((pac) => !pac.usuario.activo).length

  return (
    <AdminLayout>
      <div className="page-enter">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-950 md:text-3xl">
              Pacientes
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              Gestiona pacientes registrados, datos de contacto, documentos y estado de actividad.
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
              onClick={() => setModalCrear(true)}
              className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#000089] px-4 text-sm font-black text-white shadow-lg shadow-[#000089]/20 transition hover:bg-[#000070] hover:ring-4 hover:ring-[#00CCA5]/15"
            >
              <Plus size={17} />
              Nuevo Paciente
            </button>
          </div>
        </div>

        {/* Resumen */}
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#000089] shadow-lg shadow-[#000089]/15">
                <Users size={20} className="text-white" />
              </div>

              <div>
                <p className="text-xs font-bold text-slate-400">
                  Pacientes registrados
                </p>
                <p className="text-2xl font-black text-slate-950">
                  {meta?.total ?? pacientes.length}
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
                <Activity size={20} className="text-white" />
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
            <div className="relative w-full md:max-w-md">
              <Search
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                placeholder="Buscar por nombre, email o documento..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#00CCA5] focus:bg-white focus:ring-4 focus:ring-[#00CCA5]/15"
              />
            </div>

            <div className="flex items-center justify-end">
              {meta && (
                <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2">
                  <span className="h-2 w-2 rounded-full bg-[#00CCA5]" />
                  <span className="text-xs font-bold text-slate-500">
                    {meta.total} paciente{meta.total !== 1 ? 's' : ''} registrado
                    {meta.total !== 1 ? 's' : ''}
                  </span>
                </div>
              )}
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16">
              <div className="h-9 w-9 animate-spin rounded-full border-2 border-[#00CCA5] border-t-transparent" />
              <p className="text-sm text-slate-400">Cargando pacientes...</p>
            </div>
          ) : pacientes.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 px-6 py-16">
              <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-slate-100">
                <Users size={24} className="text-slate-400" />
              </div>

              <div className="text-center">
                <p className="text-sm font-black text-slate-700">
                  No hay pacientes registrados
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Crea el primer paciente desde el botón superior.
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px]">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/80">
                    <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">
                      Paciente
                    </th>
                    <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">
                      Documento
                    </th>
                    <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">
                      Teléfono
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
                  {pacientes.map((pac) => (
                    <tr
                      key={pac.id}
                      className="transition-colors hover:bg-slate-50/70"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#00CCA5]/10">
                            {pac.foto ? (
                              <img
                                src={pac.foto}
                                alt={`${pac.usuario.nombre} ${pac.usuario.apellido}`}
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = 'none'
                                  e.target.parentNode.innerHTML = `<span class="text-[#008f78] text-xs font-black">${pac.usuario.nombre[0]}${pac.usuario.apellido[0]}</span>`
                                }}
                              />
                            ) : (
                              <span className="text-xs font-black text-[#008f78]">
                                {pac.usuario.nombre[0]}
                                {pac.usuario.apellido[0]}
                              </span>
                            )}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-black text-slate-800">
                              {pac.usuario.nombre} {pac.usuario.apellido}
                            </p>
                            <p className="text-xs text-slate-400">
                              Paciente
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-2xl bg-slate-100">
                            <IdCard size={15} className="text-slate-400" />
                          </div>

                          <div>
                            <p className="font-mono text-sm font-black text-slate-700">
                              {pac.numeroDocumento || '—'}
                            </p>
                            <p className="text-xs text-slate-400">
                              {pac.tipoDocumento || 'Documento'}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="inline-flex max-w-[240px] items-center gap-2 rounded-2xl bg-slate-100 px-3 py-1.5">
                          <Mail size={13} className="flex-shrink-0 text-slate-400" />
                          <span className="truncate text-sm font-bold text-slate-600">
                            {pac.usuario.email}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-3 py-1.5">
                          <Phone size={13} className="text-slate-400" />
                          <span className="text-sm font-bold text-slate-600">
                            {pac.usuario.telefono || '—'}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        {pac.usuario.activo ? (
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
                              setPacienteSeleccionado(pac)
                              setModalVer(true)
                            }}
                            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-[#00CCA5]/10 hover:text-[#008f78]"
                            title="Ver detalle"
                          >
                            <Eye size={15} />
                          </button>

                          <button
                            onClick={() => {
                              setPacienteSeleccionado(pac)
                              setModalEditar(true)
                            }}
                            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-amber-50 hover:text-amber-600"
                            title="Editar"
                          >
                            <Pencil size={15} />
                          </button>

                          <button
                            onClick={() => {
                              setPacienteSeleccionado(pac)
                              setModalConfirmar(true)
                            }}
                            className={`flex h-9 w-9 items-center justify-center rounded-xl transition ${
                              pac.usuario.activo
                                ? 'text-slate-400 hover:bg-red-50 hover:text-red-600'
                                : 'text-slate-400 hover:bg-emerald-50 hover:text-emerald-600'
                            }`}
                            title={pac.usuario.activo ? 'Desactivar' : 'Activar'}
                          >
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
            <ModalCrearPaciente
              onClose={() => setModalCrear(false)}
              onSuccess={() => {
                fetchPacientes(page, search)
                toast.success('Paciente creado correctamente')
              }}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {modalEditar && pacienteSeleccionado && (
            <ModalEditarPaciente
              paciente={pacienteSeleccionado}
              onClose={() => setModalEditar(false)}
              onSuccess={() => {
                fetchPacientes(page, search)
                toast.success('Paciente actualizado correctamente')
              }}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {modalVer && pacienteSeleccionado && (
            <ModalVerPaciente
              pacienteId={pacienteSeleccionado.id}
              onClose={() => setModalVer(false)}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {modalConfirmar && pacienteSeleccionado && (
            <ModalConfirmar
              mensaje={
                pacienteSeleccionado.usuario.activo
                  ? '¿Desactivar este paciente?'
                  : '¿Activar este paciente?'
              }
              subMensaje={`${pacienteSeleccionado.usuario.nombre} ${pacienteSeleccionado.usuario.apellido}`}
              onConfirmar={handleEliminar}
              onCancelar={() => setModalConfirmar(false)}
              tipo={pacienteSeleccionado.usuario.activo ? 'danger' : 'success'}
            />
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  )
}