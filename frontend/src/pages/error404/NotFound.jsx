import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Stethoscope, ArrowLeft, Home, Activity, Heart, Pill } from 'lucide-react'

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center px-4 overflow-hidden"
      style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* Fondo decorativo animado */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-900/20 rounded-full blur-3xl" />

        {/* Íconos flotantes decorativos */}
        {[
          { Icon: Heart,       top: '15%', left: '10%', delay: 0,    size: 20, color: 'text-pink-400/20'   },
          { Icon: Activity,    top: '20%', left: '85%', delay: 0.5,  size: 24, color: 'text-blue-400/20'   },
          { Icon: Pill,        top: '70%', left: '8%',  delay: 1,    size: 18, color: 'text-indigo-400/20' },
          { Icon: Stethoscope, top: '75%', left: '88%', delay: 1.5,  size: 22, color: 'text-blue-400/20'   },
          { Icon: Heart,       top: '45%', left: '5%',  delay: 2,    size: 16, color: 'text-pink-400/15'   },
          { Icon: Activity,    top: '50%', left: '92%', delay: 0.8,  size: 20, color: 'text-indigo-400/20' },
        ].map(({ Icon, top, left, delay, size, color }, i) => (
          <motion.div
            key={i}
            className={`absolute ${color}`}
            style={{ top, left }}
            animate={{ y: [0, -12, 0], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 3, repeat: Infinity, delay, ease: 'easeInOut' }}
          >
            <Icon size={size} />
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative text-center max-w-md w-full"
      >
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center justify-center gap-3 mb-8"
        >
          <div className="w-10 h-10 bg-white/10 backdrop-blur rounded-xl flex items-center justify-center border border-white/10">
            <Stethoscope size={20} className="text-white" />
          </div>
          <span className="text-white font-bold text-xl tracking-tight">MediCare</span>
        </motion.div>

        {/* Número 404 grande */}
        <div className="relative mb-2">
          <motion.h1
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.5, ease: 'easeOut' }}
            className="text-[160px] font-black leading-none select-none"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 0 40px rgba(59,130,246,0.3))',
              letterSpacing: '-8px'
            }}
          >
            404
          </motion.h1>

          {/* Línea de ECG animada encima del 404 */}
          <motion.div
            className="absolute top-1/2 left-0 right-0 -translate-y-1/2 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <svg viewBox="0 0 300 60" className="w-72 h-14 opacity-30">
              <motion.polyline
                points="0,30 40,30 55,30 65,5 75,55 85,20 95,40 105,30 300,30"
                fill="none"
                stroke="#60a5fa"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ delay: 0.5, duration: 1.2, ease: 'easeInOut' }}
              />
            </svg>
          </motion.div>
        </div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.25, duration: 0.4, ease: 'easeOut' }}
          className="bg-white/95 backdrop-blur rounded-3xl shadow-2xl px-8 py-7 mx-auto border border-white/20"
        >
          {/* Ícono con pulso */}
          <div className="relative w-16 h-16 mx-auto mb-5">
            <div className="absolute inset-0 bg-blue-100 rounded-2xl animate-ping opacity-30" />
            <div className="relative w-16 h-16 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl flex items-center justify-center shadow-sm">
              <Stethoscope size={28} className="text-blue-600" />
            </div>
          </div>

          <h2 className="text-xl font-bold text-slate-800 mb-2">Página no encontrada</h2>
          <p className="text-slate-400 text-sm mb-1">
            La dirección que buscas no existe en nuestro sistema.
          </p>
          <p className="text-slate-400 text-sm mb-6">
            Puede que haya sido movida o eliminada.
          </p>

          {/* Código de error */}
          <div className="flex items-center justify-center gap-2 bg-slate-50 rounded-xl px-4 py-2.5 mb-6 border border-slate-100">
            <Activity size={13} className="text-slate-400" />
            <span className="text-xs text-slate-400 font-mono">Error 404 · Ruta no encontrada</span>
          </div>

          <div className="flex flex-col gap-2.5">
            <button onClick={() => navigate(-1)}
              className="flex items-center justify-center gap-2 w-full px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50 transition-all">
              <ArrowLeft size={15} />
              Volver atrás
            </button>
            <button onClick={() => navigate('/login')}
              className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl text-sm font-medium transition-all shadow-sm hover:shadow-md">
              <Home size={15} />
              Ir al inicio
            </button>
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-slate-500 text-xs mt-6"
        >
          Sistema de Gestión Clínica © {new Date().getFullYear()}
        </motion.p>
      </motion.div>
    </div>
  )
}