import { motion } from 'framer-motion'
import {
  MessagesSquare,
  ShieldCheck,
  UsersRound,
  MonitorCheck
} from 'lucide-react'

const proposalCards = [
  {
    icon: MessagesSquare,
    title: 'Claridad médica',
    text: 'Explicaciones claras y comprensibles para que cada paciente sepa qué ocurre, qué necesita y cuál es el siguiente paso.'
  },
  {
    icon: ShieldCheck,
    title: 'Confianza profesional',
    text: 'Atención brindada por profesionales comprometidos con el bienestar, la seguridad y la calidad médica.'
  },
  {
    icon: UsersRound,
    title: 'Acompañamiento constante',
    text: 'Una experiencia pensada para acompañarte antes, durante y después de cada consulta.'
  },
  {
    icon: MonitorCheck,
    title: 'Experiencia moderna',
    text: 'Procesos más simples, información organizada y una atención médica apoyada en herramientas digitales.'
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
      duration: 0.55,
      ease: 'easeOut'
    }
  }
}

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08
    }
  }
}

export default function ProposalSection() {
  return (
    <section
      id="propuesta"
      className="relative overflow-hidden bg-white px-6 py-16 md:px-10 lg:py-20 xl:px-16"
    >
      <div className="absolute left-[-180px] top-20 h-[360px] w-[360px] rounded-full bg-[#00CCA5]/8 blur-3xl" />
      <div className="absolute right-[-180px] bottom-10 h-[360px] w-[360px] rounded-full bg-[#000089]/5 blur-3xl" />

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
            Una nueva forma de vivir tu atención médica
          </h2>

          <div className="mx-auto mt-5 h-1 w-12 rounded-full bg-[#00CCA5]" />

          <p className="mt-5 text-base leading-7 text-slate-600 md:text-lg">
            LuminaMedic nace para transformar la atención médica en una
            experiencia más clara, cercana y confiable.
          </p>
        </motion.div>

        {/* Cards */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {proposalCards.map((card) => {
            const Icon = card.icon

            return (
              <motion.article
                key={card.title}
                variants={fadeUp}
                whileHover={{ y: -7 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
                className="group relative overflow-hidden rounded-3xl border border-slate-100 bg-white p-7 text-center shadow-xl shadow-slate-100/80 transition hover:border-[#00CCA5]/30 hover:shadow-2xl hover:shadow-slate-200/70"
              >
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#000089] via-[#0017b8] to-[#00CCA5] opacity-0 transition duration-300 group-hover:opacity-100" />

                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#00CCA5]/10 text-[#00a98a] transition duration-300 group-hover:bg-[#000089] group-hover:text-white">
                  <Icon size={32} strokeWidth={1.8} />
                </div>

                <h3 className="mt-6 text-lg font-black text-[#000089]">
                  {card.title}
                </h3>

                <p className="mt-4 text-sm font-medium leading-7 text-slate-600">
                  {card.text}
                </p>
              </motion.article>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}