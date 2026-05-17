import { Link } from 'react-router-dom'
import { scrollToSection } from '../utils/scrollToSection'
import { motion } from 'framer-motion'
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Facebook,
  Instagram,
  MessageCircle,
  HeartPulse,
  ArrowUpRight
} from 'lucide-react'

const BRAND = {
  name: 'LuminaMedic',
  full: '/branding/luminamedic-full.png'
}

const links = [
  { label: 'Inicio', id: 'inicio' },
  { label: 'Nuestra propuesta', id: 'propuesta' },
  { label: 'Servicios', id: 'servicios' },
  { label: 'Acompañamiento', id: 'acompanamiento' },
  { label: 'Contacto', id: 'contacto' }
]

const services = [
  'Medicina General',
  'Pediatría',
  'Ginecología',
  'Cardiología',
  'Psicología',
  'Laboratorio Clínico'
]

const socialLinks = [
  { icon: Facebook, label: 'Facebook', href: '#' },
  { icon: Instagram, label: 'Instagram', href: '#' },
  { icon: MessageCircle, label: 'WhatsApp', href: '#' }
]

const contactItems = [
  {
    icon: MapPin,
    title: 'San Isidro, Lima, Perú',
    text: 'Próxima apertura',
    className: 'bg-[#00CCA5]/10 text-[#008f78]'
  },
  {
    icon: Phone,
    title: '+51 999 999 999',
    text: 'Información y consultas',
    className: 'bg-white/10 text-[#00CCA5]'
  },
  {
    icon: Mail,
    title: 'contacto@luminamedic.pe',
    text: 'Canal de contacto',
    className: 'bg-white/10 text-[#00CCA5]'
  },
  {
    icon: Clock,
    title: 'Muy pronto',
    text: 'Abriremos nuestras puertas',
    className: 'bg-white/10 text-[#00CCA5]'
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
      staggerChildren: 0.1,
      delayChildren: 0.05
    }
  }
}

export default function LandingFooter() {
  return (
    <motion.footer
      id="contacto"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      variants={staggerContainer}
      className="relative overflow-hidden bg-[#000089] text-white"
    >
      <div className="absolute left-[-160px] top-[-160px] h-[380px] w-[380px] rounded-full bg-[#00CCA5]/20 blur-3xl" />
      <div className="absolute bottom-[-180px] right-[-160px] h-[420px] w-[420px] rounded-full bg-white/10 blur-3xl" />

      <div className="relative mx-auto max-w-[1500px] px-6 py-14 md:px-10 lg:py-16 xl:px-16">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_0.75fr_0.75fr_1fr]">
          {/* Marca */}
          <motion.div variants={fadeUp}>
            <button
              type="button"
              onClick={() => scrollToSection('inicio')}
              className="inline-flex items-center"
            >
              <img
                src={BRAND.full}
                alt={BRAND.name}
                className="h-14 w-auto object-contain brightness-0 invert"
                onError={(e) => {
                  e.target.style.display = 'none'
                  e.target.parentNode.innerHTML = `<span class="text-2xl font-black text-white">${BRAND.name}</span>`
                }}
              />
            </button>

            <p className="mt-5 max-w-sm text-sm font-medium leading-7 text-white/70">
              LuminaMedic llega como una propuesta médica enfocada en brindar
              atención clara, humana y acompañada, para que cada paciente viva
              su salud con mayor confianza.
            </p>

            <div className="mt-6 inline-flex rounded-full bg-[#00CCA5]/15 px-5 py-3 text-sm font-black text-[#00CCA5]">
              No solo te atendemos. Te acompañamos.
            </div>

            <div className="mt-6 flex items-center gap-3">
              {socialLinks.map((item) => {
                const Icon = item.icon

                return (
                  <motion.a
                    key={item.label}
                    href={item.href}
                    aria-label={item.label}
                    whileHover={{ y: -3 }}
                    whileTap={{ scale: 0.96 }}
                    className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/15 bg-white/5 text-white/70 transition hover:border-[#00CCA5]/50 hover:bg-[#00CCA5]/15 hover:text-[#00CCA5]"
                  >
                    <Icon size={18} />
                  </motion.a>
                )
              })}
            </div>
          </motion.div>

          {/* Navegación */}
          <motion.div variants={fadeUp}>
            <h3 className="text-sm font-black uppercase tracking-[0.14em] text-white">
              Navegación
            </h3>

            <div className="mt-5 flex flex-col gap-3">
              {links.map((item) => (
                <motion.a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={(e) => {
                    e.preventDefault()
                    scrollToSection(item.id)
                  }}
                  whileHover={{ x: 3 }}
                  className="text-sm font-bold text-white/60 transition hover:text-[#00CCA5]"
                >
                  {item.label}
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Servicios */}
          <motion.div variants={fadeUp}>
            <h3 className="text-sm font-black uppercase tracking-[0.14em] text-white">
              Servicios
            </h3>

            <div className="mt-5 flex flex-col gap-3">
              {services.map((service) => (
                <motion.a
                  key={service}
                  href="#servicios"
                  onClick={(e) => {
                    e.preventDefault()
                    scrollToSection('servicios')
                  }}
                  whileHover={{ x: 3 }}
                  className="text-sm font-bold text-white/60 transition hover:text-[#00CCA5]"
                >
                  {service}
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Contacto */}
          <motion.div variants={fadeUp}>
            <h3 className="text-sm font-black uppercase tracking-[0.14em] text-white">
              Contacto
            </h3>

            <div className="mt-5 space-y-4">
              {contactItems.map((item) => {
                const Icon = item.icon

                return (
                  <motion.div
                    key={item.title}
                    whileHover={{ x: 3 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className="flex gap-3"
                  >
                    <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl ${item.className}`}>
                      <Icon size={18} />
                    </div>

                    <div>
                      <p className="text-sm font-black text-white">
                        {item.title}
                      </p>
                      <p className="mt-1 text-xs font-medium leading-5 text-white/50">
                        {item.text}
                      </p>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        </div>

        {/* Separador inferior */}
        <motion.div
          variants={fadeUp}
          className="mt-12 border-t border-white/10 pt-6"
        >
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00CCA5]/15">
                <HeartPulse size={19} className="text-[#00CCA5]" />
              </div>

              <p className="text-xs font-bold text-white/50">
                © {new Date().getFullYear()} LuminaMedic. Todos los derechos reservados.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link
                to="/privacidad"
                className="inline-flex items-center gap-1 text-xs font-bold text-white/50 transition hover:text-[#00CCA5]"
              >
                Política de privacidad
                <ArrowUpRight size={13} />
              </Link>

              <Link
                to="/login"
                className="inline-flex items-center gap-1 text-xs font-bold text-white/50 transition hover:text-[#00CCA5]"
              >
                Ingresar al sistema
                <ArrowUpRight size={13} />
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.footer>
  )
}