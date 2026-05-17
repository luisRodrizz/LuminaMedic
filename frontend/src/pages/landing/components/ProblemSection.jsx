import { motion } from 'framer-motion'
import { MessageCircleQuestion } from 'lucide-react'

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

export default function ProblemSection() {
  return (
    <section className="relative overflow-hidden border-y border-slate-100 bg-white">
      <div className="absolute left-0 top-0 h-full w-1/3 bg-gradient-to-r from-[#00CCA5]/8 to-transparent" />
      <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-[#000089]/5 to-transparent" />

      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.35 }}
        className="relative mx-auto grid max-w-[1500px] items-center gap-8 px-6 py-10 md:px-10 lg:grid-cols-[110px_1fr_1fr] lg:py-12 xl:px-16"
      >
        {/* Ícono */}
        <div className="flex justify-center lg:justify-start">
          <motion.div
            whileHover={{ y: -4, scale: 1.03 }}
            transition={{ duration: 0.2 }}
            className="flex h-24 w-24 items-center justify-center rounded-full border border-slate-100 bg-white shadow-xl shadow-slate-200/70"
          >
            <MessageCircleQuestion
              size={42}
              strokeWidth={1.8}
              className="text-[#00a98a]"
            />
          </motion.div>
        </div>

        {/* Frase principal */}
        <div className="text-center lg:text-left">
          <h2 className="text-2xl font-black leading-snug tracking-tight text-[#000089] md:text-3xl">
            Muchas veces, una consulta médica termina dejando más preguntas
            que respuestas
          </h2>
        </div>

        {/* Texto secundario */}
        <div className="text-center lg:border-l lg:border-slate-200 lg:pl-10 lg:text-left">
          <p className="text-base font-medium leading-8 text-slate-600 md:text-lg">
            En LuminaMedic creemos que la atención médica debe ser clara,
            cercana y comprensible.
          </p>
        </div>
      </motion.div>
    </section>
  )
}