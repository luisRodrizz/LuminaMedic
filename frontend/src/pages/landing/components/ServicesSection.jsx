import { motion } from 'framer-motion'
import {
  Stethoscope,
  Baby,
  Venus,
  HeartPulse,
  Bone,
  Apple,
  Brain,
  TestTube2,
  ScanLine,
  Syringe,
  Activity,
  ShieldCheck
} from 'lucide-react'

const services = [
  {
    icon: Stethoscope,
    title: 'Medicina general'
  },
  {
    icon: Baby,
    title: 'Pediatría'
  },
  {
    icon: Venus,
    title: 'Ginecología'
  },
  {
    icon: HeartPulse,
    title: 'Cardiología'
  },
  {
    icon: Bone,
    title: 'Traumatología'
  },
  {
    icon: Apple,
    title: 'Nutrición'
  },
  {
    icon: Brain,
    title: 'Psicología'
  },
  {
    icon: TestTube2,
    title: 'Laboratorio clínico'
  },
  {
    icon: ScanLine,
    title: 'Diagnóstico por imágenes'
  },
  {
    icon: Syringe,
    title: 'Procedimientos ambulatorios'
  },
  {
    icon: Activity,
    title: 'Chequeos preventivos'
  },
  {
    icon: ShieldCheck,
    title: 'Seguimiento médico'
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
      staggerChildren: 0.055
    }
  }
}

export default function ServicesSection() {
  return (
    <section
      id="servicios"
      className="relative overflow-hidden bg-white px-6 py-16 md:px-10 lg:py-20 xl:px-16"
    >
      <div className="absolute left-0 top-1/2 h-[360px] w-[360px] -translate-y-1/2 rounded-full bg-[#00CCA5]/8 blur-3xl" />
      <div className="absolute right-[-180px] top-10 h-[360px] w-[360px] rounded-full bg-[#000089]/5 blur-3xl" />

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
            Servicios pensados para cuidar tu salud con claridad
          </h2>

          <div className="mx-auto mt-5 h-1 w-12 rounded-full bg-[#00CCA5]" />

          <p className="mt-5 text-base leading-7 text-slate-600 md:text-lg">
            Especialidades y servicios médicos orientados a una atención más
            cercana, ordenada y comprensible.
          </p>
        </motion.div>

        {/* Grid servicios */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6"
        >
          {services.map((service) => {
            const Icon = service.icon

            return (
              <motion.article
                key={service.title}
                variants={fadeUp}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="group relative flex min-h-[120px] flex-col items-center justify-center rounded-2xl border border-slate-100 bg-white px-4 py-6 text-center shadow-sm transition hover:border-[#00CCA5]/40 hover:shadow-xl hover:shadow-slate-100"
              >
                <div className="absolute inset-x-6 top-0 h-0.5 rounded-full bg-[#00CCA5] opacity-0 transition duration-300 group-hover:opacity-100" />

                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#00CCA5]/10 text-[#00a98a] transition duration-300 group-hover:bg-[#000089] group-hover:text-white">
                  <Icon size={30} strokeWidth={1.8} />
                </div>

                <h3 className="text-sm font-black leading-snug text-[#000089]">
                  {service.title}
                </h3>
              </motion.article>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}