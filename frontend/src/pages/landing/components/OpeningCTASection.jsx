import { motion } from 'framer-motion'
import { CalendarCheck, ArrowRight } from 'lucide-react'

import { scrollToSection } from '../utils/scrollToSection'

const fadeUp = {
  hidden: {
    opacity: 0,
    y: 24
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: 'easeOut'
    }
  }
}

export default function OpeningCTASection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-[#EAF7F5] via-white to-[#EAF7F5] px-6 py-12 md:px-10 lg:py-14 xl:px-16">
      <div className="absolute left-10 top-1/2 h-40 w-40 -translate-y-1/2 rounded-full bg-[#00CCA5]/10 blur-3xl" />
      <div className="absolute right-10 top-1/2 h-44 w-44 -translate-y-1/2 rounded-full bg-[#000089]/5 blur-3xl" />

      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.35 }}
        className="relative mx-auto grid max-w-[1500px] items-center gap-8 rounded-[2rem] border border-white/80 bg-white/75 px-6 py-8 shadow-xl shadow-slate-200/60 backdrop-blur md:grid-cols-[110px_1fr] md:px-8 lg:grid-cols-[120px_1fr_auto]"
      >
        <div className="flex justify-center md:justify-start">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white text-[#00a98a] shadow-xl shadow-slate-200/70">
            <CalendarCheck size={42} strokeWidth={1.8} />
          </div>
        </div>

        <div className="text-center md:text-left">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#008f78]">
            Próxima apertura
          </p>

          <h2 className="mt-2 text-3xl font-black leading-tight tracking-tight text-[#000089] md:text-4xl">
            Muy pronto abriremos nuestras puertas
          </h2>

          <p className="mt-3 max-w-3xl text-base font-medium leading-7 text-slate-600">
            Estamos preparando una experiencia médica diferente, donde la
            claridad, la confianza y el acompañamiento serán parte de cada
            atención.
          </p>
        </div>

        <div className="flex justify-center lg:justify-end">
          <motion.button
            type="button"
            onClick={() => scrollToSection('contacto')}
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex min-h-14 items-center justify-center gap-3 rounded-xl bg-[#00a98a] px-8 text-sm font-black text-white shadow-lg shadow-[#00CCA5]/20 transition hover:bg-[#008f78]"
          >
            Quiero recibir información
            <ArrowRight size={17} />
          </motion.button>
        </div>
      </motion.div>
    </section>
  )
}