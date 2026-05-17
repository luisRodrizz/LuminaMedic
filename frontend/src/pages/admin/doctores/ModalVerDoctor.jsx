import { useState, useEffect } from 'react'
import {
  X,
  Mail,
  Phone,
  Stethoscope,
  Calendar,
  Users,
  Building2,
  CreditCard,
  ShieldCheck,
  ShieldAlert,
  ShieldOff,
  UserRound,
  ClipboardList
} from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import api from '../../../services/api'

const estadoColors = {
  PENDIENTE: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    dot: 'bg-amber-400'
  },
  CONFIRMADA: {
    bg: 'bg-[#000089]/10',
    text: 'text-[#000089]',
    dot: 'bg-[#000089]'
  },
  COMPLETADA: {
    bg: 'bg-[#00CCA5]/10',
    text: 'text-[#008f78]',
    dot: 'bg-[#00CCA5]'
  },
  CANCELADA: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    dot: 'bg-red-500'
  }
}

const validacionBadge = {
  VALIDADO: {
    bg: 'bg-[#00CCA5]/10',
    text: 'text-[#008f78]',
    dot: 'bg-[#00CCA5]',
    label: 'Validado RENIEC',
    Icon: ShieldCheck
  },
  PENDIENTE: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    dot: 'bg-amber-400',
    label: 'Pendiente',
    Icon: ShieldAlert
  },
  NO_APLICA: {
    bg: 'bg-slate-100',
    text: 'text-slate-500',
    dot: 'bg-slate-400',
    label: 'No aplica',
    Icon: ShieldOff
  }
}

const tipoLabel = {
  DNI: 'DNI',
  CE: 'Carné Ext.',
  PASAPORTE: 'Pasaporte'
}

export default function ModalVerDoctor({ doctorId, onClose }) {
  const [doctor, setDoctor] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('info')

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const res = await api.get(`/doctores/${doctorId}`)
        setDoctor(res.data)
      } catch {
        toast.error('Error al cargar el doctor')
      } finally {
        setLoading(false)
      }
    }

    fetchDoctor()
  }, [doctorId])

  const formatFecha = (fecha) =>
    fecha ? new Date(fecha).toLocaleDateString('es-PE') : '—'

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 16 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-[2rem] border border-white/70 bg-white shadow-2xl shadow-slate-950/20"
      >
        {/* Header */}
        <div className="relative flex-shrink-0 border-b border-slate-100 px-6 py-6">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#000089] via-[#00A98A] to-[#00CCA5]" />

          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#00CCA5]/10">
                <Stethoscope size={21} className="text-[#008f78]" />
              </div>

              <div>
                <h2 className="text-lg font-black text-slate-950">
                  Perfil del Doctor
                </h2>
                <p className="mt-0.5 text-xs text-slate-400">
                  Información completa del profesional médico.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Loading / Error */}
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16">
            <div className="h-9 w-9 animate-spin rounded-full border-2 border-[#00CCA5] border-t-transparent" />
            <p className="text-sm text-slate-400">Cargando información...</p>
          </div>
        ) : !doctor ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16">
            <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-slate-100">
              <Stethoscope size={24} className="text-slate-400" />
            </div>
            <p className="text-sm font-black text-slate-500">
              No se encontró el doctor
            </p>
          </div>
        ) : (
          <>
            {/* Perfil superior */}
            <div className="flex flex-shrink-0 items-center gap-4 border-b border-slate-100 bg-slate-50/70 px-6 py-5">
              <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-3xl bg-[#00CCA5]/10">
                {doctor.foto ? (
                  <img
                    src={doctor.foto}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-base font-black text-[#008f78]">
                    {doctor.usuario.nombre[0]}
                    {doctor.usuario.apellido[0]}
                  </span>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="truncate text-base font-black text-slate-900">
                  Dr. {doctor.usuario.nombre} {doctor.usuario.apellido}
                </h3>

                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <span className="inline-flex rounded-2xl border border-slate-200 bg-white px-3 py-1 text-xs font-black text-slate-600">
                    {doctor.especialidad}
                  </span>

                  {doctor.usuario.activo ? (
                    <span className="inline-flex items-center gap-2 rounded-2xl bg-[#00CCA5]/10 px-3 py-1 text-xs font-black text-[#008f78]">
                      <span className="h-2 w-2 rounded-full bg-[#00CCA5]" />
                      Activo
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2 rounded-2xl bg-red-50 px-3 py-1 text-xs font-black text-red-700">
                      <span className="h-2 w-2 rounded-full bg-red-500" />
                      Inactivo
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex flex-shrink-0 border-b border-slate-100 px-6">
              <button
                onClick={() => setTab('info')}
                className={`mr-6 border-b-2 px-1 py-4 text-sm font-black transition-all ${
                  tab === 'info'
                    ? 'border-[#000089] text-[#000089]'
                    : 'border-transparent text-slate-400 hover:text-slate-700'
                }`}
              >
                Información
              </button>

              <button
                onClick={() => setTab('citas')}
                className={`flex items-center gap-2 border-b-2 px-1 py-4 text-sm font-black transition-all ${
                  tab === 'citas'
                    ? 'border-[#000089] text-[#000089]'
                    : 'border-transparent text-slate-400 hover:text-slate-700'
                }`}
              >
                Citas
                <span
                  className={`rounded-xl px-2 py-0.5 text-xs font-black ${
                    tab === 'citas'
                      ? 'bg-[#000089]/10 text-[#000089]'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {doctor.citas?.length || 0}
                </span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {/* Tab Información */}
              {tab === 'info' &&
                (() => {
                  const vBadge =
                    validacionBadge[doctor.validacionReniec] ||
                    validacionBadge.PENDIENTE
                  const BadgeIcon = vBadge.Icon
                  const tipo = tipoLabel[doctor.tipoDocumento] || doctor.tipoDocumento

                  return (
                    <div className="space-y-4 px-6 py-5">
                      {/* Documento */}
                      <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5">
                        <div className="mb-4 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white">
                              <CreditCard size={18} className="text-slate-500" />
                            </div>

                            <div>
                              <p className="text-sm font-black text-slate-900">
                                Identidad profesional
                              </p>
                              <p className="text-xs text-slate-400">
                                Documento y validación registrada
                              </p>
                            </div>
                          </div>

                          <span
                            className={`inline-flex items-center gap-2 rounded-2xl px-3 py-1.5 text-xs font-black ${vBadge.bg} ${vBadge.text}`}
                          >
                            <BadgeIcon size={13} />
                            <span className={`h-2 w-2 rounded-full ${vBadge.dot}`} />
                            {vBadge.label}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                            <p className="text-xs font-bold text-slate-400">
                              Tipo de documento
                            </p>
                            <p className="mt-1 text-sm font-black text-slate-800">
                              {tipo || '—'}
                            </p>
                          </div>

                          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                            <p className="text-xs font-bold text-slate-400">
                              Número
                            </p>
                            <p className="mt-1 font-mono text-sm font-black text-slate-800">
                              {doctor.numeroDocumento || '—'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Datos */}
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {[
                          {
                            icon: Mail,
                            label: 'Correo',
                            value: doctor.usuario.email,
                            full: true
                          },
                          {
                            icon: Phone,
                            label: 'Teléfono',
                            value: doctor.usuario.telefono || '—',
                            full: false
                          },
                          {
                            icon: Calendar,
                            label: 'Registro',
                            value: new Date(
                              doctor.usuario.createdAt
                            ).toLocaleDateString('es-PE'),
                            full: false
                          },
                          {
                            icon: Building2,
                            label: 'Clínica',
                            value: doctor.clinica?.nombre || '—',
                            full: true
                          }
                        ].map((item, i) => (
                          <div
                            key={i}
                            className={`rounded-2xl border border-slate-200 bg-white px-4 py-3 ${
                              item.full ? 'sm:col-span-2' : ''
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-2xl bg-slate-100">
                                <item.icon size={15} className="text-slate-400" />
                              </div>

                              <div className="min-w-0">
                                <p className="text-xs font-bold text-slate-400">
                                  {item.label}
                                </p>
                                <p className="mt-0.5 truncate text-sm font-black text-slate-800">
                                  {item.value}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Descripción */}
                      {doctor.descripcion && (
                        <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5">
                          <div className="mb-3 flex items-center gap-2">
                            <ClipboardList size={16} className="text-[#008f78]" />
                            <p className="text-sm font-black text-slate-800">
                              Descripción
                            </p>
                          </div>

                          <p className="text-sm leading-6 text-slate-600">
                            {doctor.descripcion}
                          </p>
                        </div>
                      )}
                    </div>
                  )
                })()}

              {/* Tab Citas */}
              {tab === 'citas' && (
                <div className="px-6 py-5">
                  {!doctor.citas?.length ? (
                    <div className="flex flex-col items-center justify-center gap-3 py-12">
                      <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-slate-100">
                        <Users size={22} className="text-slate-400" />
                      </div>

                      <div className="text-center">
                        <p className="text-sm font-black text-slate-600">
                          Sin citas registradas
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          Las citas asignadas al doctor aparecerán aquí.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {doctor.citas.map((cita) => {
                        const cfg = estadoColors[cita.estado] || estadoColors.PENDIENTE

                        return (
                          <div
                            key={cita.id}
                            className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-black text-slate-800">
                                  {cita.servicio.nombre}
                                </p>

                                <p className="mt-1 text-xs text-slate-400">
                                  {cita.paciente?.usuario?.nombre}{' '}
                                  {cita.paciente?.usuario?.apellido} ·{' '}
                                  {formatFecha(cita.fecha)}
                                </p>
                              </div>

                              <span
                                className={`inline-flex flex-shrink-0 items-center gap-2 rounded-2xl px-3 py-1.5 text-xs font-black ${cfg.bg} ${cfg.text}`}
                              >
                                <span className={`h-2 w-2 rounded-full ${cfg.dot}`} />
                                {cita.estado}
                              </span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {/* Footer */}
        <div className="flex-shrink-0 border-t border-slate-100 px-6 py-4">
          <button
            onClick={onClose}
            type="button"
            className="flex h-11 w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
          >
            Cerrar
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}