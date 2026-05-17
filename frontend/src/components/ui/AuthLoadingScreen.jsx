import { motion, AnimatePresence } from 'framer-motion'
import { HeartPulse, ShieldCheck, CheckCircle2 } from 'lucide-react'

export default function AuthLoadingScreen({
  show = false,
  stage = 'loading', // 'loading' | 'success'
  roleLabel = 'tu panel'
}) {
  const isSuccess = stage === 'success'

  return (
    <AnimatePresence>
      {show && (
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28, ease: 'easeOut' }}
          className="fixed inset-0 z-[9999] flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-[#000089] via-[#071299] to-[#008f78] text-white"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,204,165,0.34),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.14),transparent_36%)]" />
          <div className="absolute -right-24 top-20 h-72 w-72 rounded-full border border-white/10" />
          <div className="absolute -bottom-28 left-14 h-80 w-80 rounded-full border border-white/10" />
          <div className="absolute bottom-36 right-28 h-24 w-24 rotate-12 rounded-[2rem] bg-white/5" />

          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.985 }}
            transition={{ duration: 0.38, ease: 'easeOut' }}
            className="relative z-10 flex w-full max-w-xl flex-col items-center px-6 text-center"
          >
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08, duration: 0.35 }}
              className="mb-8 inline-flex rounded-2xl bg-white/95 px-5 py-3 shadow-xl shadow-black/10 ring-1 ring-white/40"
            >
              <img
                src="/branding/luminamedic-full.png"
                alt="LuminaMedic"
                className="h-12 w-auto object-contain"
                onError={(e) => {
                  e.target.style.display = 'none'
                  e.target.parentNode.innerHTML =
                    '<span class="text-2xl font-black text-[#000089]">LuminaMedic</span>'
                }}
              />
            </motion.div>

            {/* Icono central */}
            <div className="relative mb-7 flex h-28 w-28 items-center justify-center">
              {!isSuccess ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                    className="absolute inset-0 rounded-full border-[6px] border-white/15 border-t-[#00CCA5] border-r-white/80"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.08, 1] }}
                    transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut' }}
                    className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white/12 text-[#00CCA5] backdrop-blur"
                  >
                    <HeartPulse size={34} />
                  </motion.div>
                </>
              ) : (
                <>
                  <motion.div
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                    className="absolute inset-0 rounded-full border-[6px] border-emerald-300/35"
                  />
                  <motion.div
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: [0.9, 1.06, 1], opacity: 1 }}
                    transition={{ duration: 0.45, ease: 'easeOut' }}
                    className="flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-400/15 text-[#00CCA5] backdrop-blur"
                  >
                    <CheckCircle2 size={34} />
                  </motion.div>
                </>
              )}
            </div>

            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.14, duration: 0.35 }}
              className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-black text-white/90 backdrop-blur"
            >
              <ShieldCheck size={14} />
              {isSuccess ? 'Acceso verificado' : 'Acceso seguro'}
            </motion.div>

            {/* Texto */}
            <motion.h2
              key={`title-${stage}-${roleLabel}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="text-3xl font-black tracking-tight sm:text-4xl"
            >
              {isSuccess ? `Bienvenido al ${roleLabel}` : 'Preparando tu acceso'}
            </motion.h2>

            <motion.p
              key={`subtitle-${stage}-${roleLabel}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.06 }}
              className="mt-3 max-w-md text-sm leading-6 text-white/70"
            >
              {isSuccess
                ? 'Tu sesión fue validada correctamente. Estamos ingresando al sistema.'
                : `Validando tus credenciales y preparando ${roleLabel}.`}
            </motion.p>

            {/* Barra */}
            <div className="mt-8 w-full max-w-sm overflow-hidden rounded-full bg-white/15">
              {!isSuccess ? (
                <motion.div
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 1.8, ease: 'easeInOut' }}
                  className="h-2 rounded-full bg-gradient-to-r from-white via-[#00CCA5] to-white"
                />
              ) : (
                <motion.div
                  initial={{ width: '82%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                  className="h-2 rounded-full bg-gradient-to-r from-[#00CCA5] via-white to-[#00CCA5]"
                />
              )}
            </div>

            <motion.p
              animate={{ opacity: [0.45, 1, 0.45] }}
              transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut' }}
              className="mt-5 text-xs font-bold text-white/60"
            >
              Claridad, confianza y acompañamiento
            </motion.p>
          </motion.div>
        </motion.section>
      )}
    </AnimatePresence>
  )
}