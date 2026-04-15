import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, ArrowLeft, Stethoscope, CheckCircle } from 'lucide-react'
import api from '../../services/api'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await api.post('/auth/forgot-password', { email })
      setEnviado(true)
    } catch {
      setError('Error al procesar la solicitud. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center px-4"
      style={{ fontFamily: "'DM Sans', sans-serif" }}>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative w-full max-w-md"
      >
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">

          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-8 text-center">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Stethoscope size={28} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">MediCare</h1>
            <p className="text-blue-200 text-sm mt-1">Recuperación de contraseña</p>
          </div>

          <div className="px-8 py-8">
            <AnimatePresence mode="wait">
              {!enviado ? (
                <motion.div
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <h2 className="text-xl font-bold text-slate-800 mb-1">¿Olvidaste tu contraseña?</h2>
                  <p className="text-slate-400 text-sm mb-6">
                    Ingresa tu correo y te enviaremos un link para restablecerla.
                  </p>

                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                        className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl mb-5">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0" />{error}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                        Correo electrónico
                      </label>
                      <div className="relative">
                        <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                          placeholder="correo@ejemplo.com" required
                          className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-slate-50 transition-all"
                        />
                      </div>
                    </div>

                    <button type="submit" disabled={loading}
                      className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl transition-all shadow-sm hover:shadow-md">
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Enviando...
                        </span>
                      ) : 'Enviar instrucciones'}
                    </button>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-4"
                >
                  <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <CheckCircle size={32} className="text-emerald-500" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-2">Revisa tu correo</h3>
                  <p className="text-slate-400 text-sm mb-2">
                    Si el correo <span className="font-medium text-slate-600">{email}</span> está registrado, recibirás las instrucciones en unos minutos.
                  </p>
                  <p className="text-slate-400 text-xs">
                    El link expira en 30 minutos. Revisa también tu carpeta de spam.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <Link to="/login"
              className="flex items-center justify-center gap-2 mt-6 text-sm text-slate-500 hover:text-slate-700 transition-colors">
              <ArrowLeft size={15} />
              Volver al inicio de sesión
            </Link>
          </div>
        </div>

        <p className="text-center text-xs text-slate-500 mt-5">
          Sistema de Gestión Clínica © {new Date().getFullYear()}
        </p>
      </motion.div>
    </div>
  )
}