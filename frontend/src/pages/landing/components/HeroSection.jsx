import { motion } from 'framer-motion'
import { MessageCircle, ArrowRight } from 'lucide-react'

import { scrollToSection } from '../utils/scrollToSection'

const fadeUp = {
  hidden: {
    opacity: 0,
    y: 28
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.65,
      ease: 'easeOut'
    }
  }
}

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.12
    }
  }
}

export default function HeroSection() {
  return (
    <section
      id="inicio"
      className="relative overflow-hidden bg-white"
    >
      <div className="mx-auto grid max-w-[1500px] items-center gap-12 px-6 py-14 md:px-10 lg:grid-cols-[0.95fr_1.05fr] lg:py-20 xl:px-16">
        {/* Texto principal */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="relative z-10"
        >
          <motion.h1
            variants={fadeUp}
            className="max-w-[620px] text-5xl font-black leading-[1.08] tracking-tight text-[#000089] md:text-6xl xl:text-[4.6rem]"
          >
            Tu salud no debería dejarte con{' '}
            <span className="text-[#00a98a]">más dudas</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="mt-7 max-w-[560px] text-base font-medium leading-8 text-slate-600 md:text-lg"
          >
            Llegó LuminaMedic, una propuesta médica que prioriza la claridad,
            la confianza y el acompañamiento en cada etapa de tu atención.
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="mt-9 flex flex-col gap-4 sm:flex-row"
          >
            <motion.button
              type="button"
              onClick={() => scrollToSection('contacto')}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex min-h-14 items-center justify-center rounded-xl bg-[#00a98a] px-8 text-sm font-black text-white shadow-lg shadow-[#00CCA5]/20 transition hover:bg-[#008f78]"
            >
              Muy pronto podrás conocernos
            </motion.button>

            <motion.button
              type="button"
              onClick={() => scrollToSection('contacto')}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex min-h-14 items-center justify-center gap-3 rounded-xl border border-[#00a98a] bg-white px-8 text-sm font-black text-[#008f78] transition hover:bg-[#00CCA5]/10"
            >
              <MessageCircle size={18} />
              Síguenos y conoce más
              <ArrowRight size={16} />
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Imagen principal */}
        <motion.div
          initial={{ opacity: 0, x: 34 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.75, ease: 'easeOut', delay: 0.15 }}
          className="relative"
        >
          <div className="absolute inset-y-0 left-0 z-10 hidden w-[34%] bg-gradient-to-r from-white via-white/80 to-transparent lg:block" />

          <div className="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-br from-[#00CCA5]/10 via-white to-[#000089]/5 blur-2xl" />

          <img
            src="/landing/doctora.png"
            alt="Doctora conversando con paciente"
            className="relative h-[340px] w-full rounded-[1.8rem] object-cover object-center shadow-xl shadow-slate-200/70 md:h-[420px] lg:h-[460px] xl:h-[500px]"
          />
        </motion.div>
      </div>
    </section>
  )
}