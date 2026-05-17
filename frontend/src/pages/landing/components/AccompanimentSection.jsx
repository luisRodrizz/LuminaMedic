import { motion } from 'framer-motion'
import { HeartHandshake, CheckCircle2 } from 'lucide-react'

const points = [
  'Orientación clara en cada etapa',
  'Comunicación cercana con el paciente',
  'Seguimiento pensado para tu tranquilidad'
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

const fadeLeft = {
  hidden: {
    opacity: 0,
    x: -28
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6,
      ease: 'easeOut'
    }
  }
}

const fadeRight = {
  hidden: {
    opacity: 0,
    x: 28
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6,
      ease: 'easeOut'
    }
  }
}

export default function AccompanimentSection() {
  return (
    <section
      id="acompanamiento"
      className="relative overflow-hidden bg-gradient-to-br from-white via-[#F8FBFC] to-[#EAF7F5] px-6 py-16 md:px-10 lg:py-20 xl:px-16"
    >
      <div className="absolute -left-32 bottom-10 h-[360px] w-[360px] rounded-full bg-[#00CCA5]/10 blur-3xl" />
      <div className="absolute -right-32 top-10 h-[360px] w-[360px] rounded-full bg-[#000089]/5 blur-3xl" />

      <div className="relative mx-auto grid max-w-[1500px] items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
        {/* Imagen */}
        <motion.div
          variants={fadeLeft}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
          className="relative"
        >
          <div className="absolute -inset-6 rounded-[3rem] bg-white/70 blur-2xl" />

          <div className="relative overflow-hidden rounded-[2rem] shadow-2xl shadow-slate-200/80">
            <img
              src="/landing/pediatra.png"
              alt="Pediatra acompañando a niños"
              className="h-[330px] w-full object-cover object-center md:h-[420px] lg:h-[480px]"
            />

            <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#F8FBFC] via-[#F8FBFC]/70 to-transparent md:w-32" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-[#EAF7F5] via-[#EAF7F5]/60 to-transparent md:w-28" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#F8FBFC]/85 to-transparent" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut', delay: 0.35 }}
            viewport={{ once: true }}
            className="absolute -bottom-6 left-6 hidden rounded-3xl border border-slate-100 bg-white p-5 shadow-xl shadow-slate-200/70 md:block"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#00CCA5]/10 text-[#00a98a]">
                <HeartHandshake size={24} />
              </div>

              <div>
                <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                  Acompañamiento
                </p>
                <p className="mt-1 text-sm font-black text-[#000089]">
                  Atención más humana
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Texto */}
        <motion.div
          variants={fadeRight}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
          className="lg:pl-6"
        >
          <motion.div
            variants={fadeUp}
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#00CCA5]/20 bg-white px-4 py-2 shadow-sm"
          >
            <span className="h-2 w-2 rounded-full bg-[#00CCA5]" />
            <span className="text-xs font-black uppercase tracking-[0.14em] text-[#008f78]">
              Atención con propósito
            </span>
          </motion.div>

          <motion.h2
            variants={fadeUp}
            className="max-w-2xl text-4xl font-black leading-tight tracking-tight text-[#000089] md:text-5xl"
          >
            Más claridad. Más confianza.
            <span className="block text-[#00a98a]">
              Más acompañamiento.
            </span>
          </motion.h2>

          <motion.p
            variants={fadeUp}
            className="mt-6 max-w-xl text-base font-medium leading-8 text-slate-600 md:text-lg"
          >
            Eso es lo que llega con LuminaMedic: una forma distinta de vivir tu
            atención médica, con información comprensible, orientación cercana y
            un trato pensado para cada paciente.
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="mt-8 grid gap-4"
          >
            {points.map((point) => (
              <div
                key={point}
                className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white px-5 py-4 shadow-sm"
              >
                <CheckCircle2
                  size={20}
                  className="flex-shrink-0 text-[#00CCA5]"
                />

                <span className="text-sm font-black text-slate-700">
                  {point}
                </span>
              </div>
            ))}
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="mt-8 inline-flex rounded-full bg-[#00CCA5]/10 px-6 py-3 text-sm font-black text-[#008f78]"
          >
            No solo te atendemos. Te acompañamos.
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}