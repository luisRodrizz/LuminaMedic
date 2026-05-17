import { motion } from 'framer-motion'
import {
  HeartHandshake,
  MessageCircle,
  UserRoundCheck,
  MonitorCheck,
  HeartPulse,
  Leaf
} from 'lucide-react'

const reasons = [
  {
    icon: HeartHandshake,
    title: 'Atención humana y cercana'
  },
  {
    icon: MessageCircle,
    title: 'Comunicación clara'
  },
  {
    icon: UserRoundCheck,
    title: 'Especialistas comprometidos'
  },
  {
    icon: MonitorCheck,
    title: 'Experiencia moderna'
  },
  {
    icon: HeartPulse,
    title: 'Acompañamiento durante el proceso'
  },
  {
    icon: Leaf,
    title: 'Enfoque en bienestar'
  }
]

const fadeUp = {
  hidden: {
    opacity: 0,
    y: 24
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut'
    }
  }
}

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.07
    }
  }
}

export default function WhyLuminaSection() {
  return (
    <section className="relative overflow-hidden bg-white px-6 py-16 md:px-10 lg:py-20 xl:px-16">
      <div className="absolute left-1/2 top-0 h-[260px] w-[520px] -translate-x-1/2 rounded-full bg-[#00CCA5]/8 blur-3xl" />

      <div className="relative mx-auto max-w-[1500px]">
        {/* Header */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.35 }}
          className="mx-auto max-w-3xl text-center"
        >
          <h2 className="text-3xl font-black leading-tight tracking-tight text-[#000089] md:text-4xl">
            ¿Por qué LuminaMedic?
          </h2>

          <div className="mx-auto mt-5 h-1 w-12 rounded-full bg-[#00CCA5]" />

          <p className="mt-5 text-base leading-7 text-slate-600 md:text-lg">
            Porque una buena atención médica no solo depende del diagnóstico,
            también de cómo se informa, se acompaña y se cuida al paciente.
          </p>
        </motion.div>

        {/* Razones */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.18 }}
          className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6"
        >
          {reasons.map((reason) => {
            const Icon = reason.icon

            return (
              <motion.article
                key={reason.title}
                variants={fadeUp}
                whileHover={{ y: -6 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="group relative flex min-h-[170px] flex-col items-center justify-center rounded-3xl border border-slate-100 bg-white px-5 py-7 text-center shadow-sm transition hover:border-[#00CCA5]/40 hover:shadow-xl hover:shadow-slate-100"
              >
                <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#00CCA5]/10 text-[#00a98a] transition duration-300 group-hover:bg-[#000089] group-hover:text-white">
                  <Icon size={34} strokeWidth={1.8} />
                </div>

                <h3 className="text-sm font-black leading-snug text-[#000089]">
                  {reason.title}
                </h3>
              </motion.article>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}