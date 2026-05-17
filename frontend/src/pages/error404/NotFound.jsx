import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Home,
  Activity,
  SearchX,
  Stethoscope
} from 'lucide-react'

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <div
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white px-6"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Fondo decorativo muy sutil */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-[#00CCA5]/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-[#000089]/5 blur-3xl" />
        <div className="absolute left-1/2 top-1/2 h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-slate-100/70 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="relative mx-auto w-full max-w-3xl text-center"
      >
        {/* Marca */}
        {/* Marca */}
        <div className="mb-10 flex justify-center">
          <div className="flex items-center justify-center rounded-3xl bg-white px-6 py-4 shadow-sm ring-1 ring-slate-100">
            <img
              src="/branding/luminamedic-full.png"
              alt="LuminaMedic"
              className="h-12 w-auto object-contain"
            />
          </div>
        </div>

        {/* 404 protagonista */}
        <div className="relative">
          <motion.h1
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.08, duration: 0.35, ease: 'easeOut' }}
            className="select-none text-[150px] font-black leading-none tracking-[-10px] text-[#000089] sm:text-[190px] md:text-[230px]"
          >
            404
          </motion.h1>

          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: '100%', opacity: 1 }}
            transition={{ delay: 0.22, duration: 0.55, ease: 'easeOut' }}
            className="mx-auto mt-1 h-1 max-w-52 rounded-full bg-[#00CCA5]"
          />
        </div>

        {/* Mensaje */}
        <div className="mx-auto mt-8 max-w-xl">
          <div className="mb-5 flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-slate-50 ring-1 ring-slate-100">
              <SearchX size={25} className="text-[#008f78]" />
            </div>
          </div>

          <h2 className="text-2xl font-black text-slate-950">
            Página no encontrada
          </h2>

          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
            La ruta que intentas abrir no existe, fue movida o ya no está disponible
            dentro del sistema.
          </p>

          <div className="mx-auto mt-5 inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5">
            <Activity size={13} className="text-[#008f78]" />
            <span className="font-mono text-xs font-bold text-slate-400">
              Error 404 · Ruta no encontrada
            </span>
          </div>
        </div>

        {/* Acciones */}
        <div className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row">
          <button
            onClick={() => navigate(-1)}
            className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
          >
            <ArrowLeft size={15} />
            Volver atrás
          </button>

          <button
            onClick={() => navigate('/login')}
            className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#000089] px-4 text-sm font-black text-white shadow-lg shadow-[#000089]/20 transition hover:bg-[#000070] hover:ring-4 hover:ring-[#00CCA5]/15"
          >
            <Home size={15} />
            Ir al inicio
          </button>
        </div>

        <p className="mt-10 text-xs font-bold text-slate-400">
          LuminaMedic © {new Date().getFullYear()}
        </p>
      </motion.div>
    </div>
  )
}