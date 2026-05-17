import { useState } from 'react'
import { X, Lock, Eye, EyeOff, CheckCircle, AlertCircle, ShieldCheck } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../services/api'

const colorMap = {
  emerald: {
    btn: 'bg-[#00A98A] hover:bg-[#008f78] shadow-[#00A98A]/20',
    ring: 'focus:ring-[#00CCA5]/15 focus:border-[#00CCA5]',
    icon: 'bg-[#00CCA5]/10',
    iconText: 'text-[#008f78]',
    accent: 'from-[#00CCA5] to-[#00A98A]'
  },
  blue: {
    btn: 'bg-[#000089] hover:bg-[#000070] shadow-[#000089]/20',
    ring: 'focus:ring-[#00CCA5]/15 focus:border-[#00CCA5]',
    icon: 'bg-[#000089]/10',
    iconText: 'text-[#000089]',
    accent: 'from-[#000089] to-[#00CCA5]'
  },
}

export default function ModalCambiarPassword({ onClose, color = 'blue' }) {
  const c = colorMap[color] || colorMap.blue

  const [passwordActual, setPasswordActual] = useState('')
  const [passwordNueva, setPasswordNueva] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [showActual, setShowActual] = useState(false)
  const [showNueva, setShowNueva] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (passwordNueva !== passwordConfirm) {
      setError('Las contraseñas nuevas no coinciden')
      return
    }

    if (passwordNueva.length < 8) {
      setError('La nueva contraseña debe tener al menos 8 caracteres')
      return
    }

    if (passwordActual === passwordNueva) {
      setError('La nueva contraseña debe ser diferente a la actual')
      return
    }

    setSaving(true)

    try {
      await api.patch('/auth/cambiar-password', {
        passwordActual,
        passwordNueva
      })

      setSuccess('Contraseña actualizada correctamente')
      setPasswordActual('')
      setPasswordNueva('')
      setPasswordConfirm('')

      setTimeout(() => onClose(), 2000)
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cambiar la contraseña')
    } finally {
      setSaving(false)
    }
  }

  const inputBase = `h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 pr-11 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:bg-white focus:ring-4 ${c.ring}`

  const PasswordField = ({
    label,
    value,
    setValue,
    show,
    setShow,
    autoComplete,
    placeholder
  }) => (
    <div>
      <label className="mb-2 block text-xs font-black text-slate-700">
        {label}
      </label>

      <div className="relative">
        <Lock
          size={16}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          required
          autoComplete={autoComplete}
          placeholder={placeholder}
          className={`${inputBase} pl-11`}
        />

        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  )

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 16 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="w-full max-w-md overflow-hidden rounded-[2rem] border border-white/70 bg-white shadow-2xl shadow-slate-950/20"
      >
        {/* Header */}
        <div className="relative border-b border-slate-100 px-6 py-6">
          <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${c.accent}`} />

          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${c.icon}`}>
                <ShieldCheck size={21} className={c.iconText} />
              </div>

              <div>
                <h2 className="text-lg font-black text-slate-950">
                  Cambiar contraseña
                </h2>
                <p className="mt-0.5 text-xs text-slate-400">
                  Actualiza tu clave de acceso de forma segura.
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

        {/* Body */}
        <div className="px-6 py-6">
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mb-5 flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600"
              >
                <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            {success && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mb-5 flex items-start gap-3 rounded-2xl border border-[#00CCA5]/20 bg-[#00CCA5]/10 px-4 py-3 text-sm text-[#008f78]"
              >
                <CheckCircle size={16} className="mt-0.5 flex-shrink-0" />
                <span>{success}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4">
            <PasswordField
              label="Contraseña actual"
              value={passwordActual}
              setValue={setPasswordActual}
              show={showActual}
              setShow={setShowActual}
              autoComplete="current-password"
              placeholder="Ingresa tu contraseña actual"
            />

            <PasswordField
              label="Nueva contraseña"
              value={passwordNueva}
              setValue={setPasswordNueva}
              show={showNueva}
              setShow={setShowNueva}
              autoComplete="new-password"
              placeholder="Mínimo 8 caracteres"
            />

            <PasswordField
              label="Confirmar nueva contraseña"
              value={passwordConfirm}
              setValue={setPasswordConfirm}
              show={showConfirm}
              setShow={setShowConfirm}
              autoComplete="new-password"
              placeholder="Repite la nueva contraseña"
            />

            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs leading-5 text-slate-500">
                Usa una contraseña diferente a la actual y evita claves fáciles de adivinar.
              </p>
            </div>

            {/* Botones */}
            <div className="flex flex-col-reverse gap-3 pt-1 sm:flex-row">
              <button
                type="button"
                onClick={onClose}
                className="flex h-11 flex-1 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={saving}
                className={`flex h-11 flex-1 items-center justify-center rounded-xl px-4 text-sm font-black text-white shadow-lg transition disabled:cursor-not-allowed disabled:opacity-50 ${c.btn}`}
              >
                {saving ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Actualizando...
                  </span>
                ) : (
                  'Actualizar'
                )}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  )
}