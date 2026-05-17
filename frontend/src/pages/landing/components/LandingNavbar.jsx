import { Link } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import { scrollToSection } from '../utils/scrollToSection'
import { motion, AnimatePresence } from 'framer-motion'

const BRAND = {
  name: 'LuminaMedic',
  full: '/branding/luminamedic-full.png'
}

const navItems = [
  { label: 'Inicio', id: 'inicio' },
  { label: 'Nuestra propuesta', id: 'propuesta' },
  { label: 'Servicios', id: 'servicios' },
  { label: 'Acompañamiento', id: 'acompanamiento' },
  { label: 'Contacto', id: 'contacto' }
]

const containerMobile = {
  hidden: {
    opacity: 0,
    height: 0
  },
  visible: {
    opacity: 1,
    height: 'auto',
    transition: {
      duration: 0.28,
      ease: 'easeOut',
      staggerChildren: 0.045
    }
  },
  exit: {
    opacity: 0,
    height: 0,
    transition: {
      duration: 0.2,
      ease: 'easeIn'
    }
  }
}

const itemMobile = {
  hidden: {
    opacity: 0,
    y: -8
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.22,
      ease: 'easeOut'
    }
  }
}

export default function LandingNavbar() {
  const [open, setOpen] = useState(false)

  const handleNavigate = (id) => {
    setOpen(false)
    scrollToSection(id)
  }

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 backdrop-blur-xl"
    >
      <nav className="mx-auto flex h-20 max-w-[1500px] items-center justify-between px-6 md:px-10 xl:px-16">
        {/* Logo */}
        <motion.a
          href="#inicio"
          onClick={(e) => {
            e.preventDefault()
            handleNavigate('inicio')
          }}
          className="flex items-center gap-3"
          whileHover={{ scale: 1.025 }}
          transition={{ duration: 0.2 }}
        >
          <img
            src={BRAND.full}
            alt={BRAND.name}
            className="h-12 w-auto object-contain"
            onError={(e) => {
              e.target.style.display = 'none'
              e.target.parentNode.innerHTML = `<span class="text-xl font-black text-[#000089]">${BRAND.name}</span>`
            }}
          />
        </motion.a>

        {/* Desktop nav */}
        <div className="hidden items-center gap-9 lg:flex">
          {navItems.map((item) => (
            <motion.a
              key={item.id}
              href={`#${item.id}`}
              onClick={(e) => {
                e.preventDefault()
                handleNavigate(item.id)
              }}
              whileHover={{ y: -2 }}
              transition={{ duration: 0.18 }}
              className="group relative text-sm font-black text-[#000089] transition hover:text-[#00a98a]"
            >
              {item.label}

              <span className="absolute -bottom-2 left-1/2 h-0.5 w-0 -translate-x-1/2 rounded-full bg-[#00CCA5] transition-all duration-300 group-hover:w-full" />
            </motion.a>
          ))}
        </div>

        {/* Acciones desktop */}
        <div className="hidden items-center gap-3 lg:flex">
          <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
            <Link
              to="/login"
              className="inline-flex rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-[#000089] transition hover:border-[#00CCA5]/50 hover:bg-[#00CCA5]/10 hover:text-[#008f78]"
            >
              Ingresar
            </Link>
          </motion.div>

          <motion.button
            type="button"
            onClick={() => handleNavigate('contacto')}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="rounded-xl bg-[#00a98a] px-6 py-3 text-sm font-black text-white shadow-lg shadow-[#00CCA5]/20 transition hover:bg-[#008f78]"
          >
            Conoce más
          </motion.button>
        </div>

        {/* Mobile button */}
        <motion.button
          type="button"
          onClick={() => setOpen(!open)}
          whileTap={{ scale: 0.94 }}
          className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 lg:hidden"
          aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
        >
          <AnimatePresence mode="wait" initial={false}>
            {open ? (
              <motion.span
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.18 }}
              >
                <X size={20} />
              </motion.span>
            ) : (
              <motion.span
                key="menu"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.18 }}
              >
                <Menu size={20} />
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </nav>

      {/* Mobile nav */}
      <AnimatePresence>
        {open && (
          <motion.div
            variants={containerMobile}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="overflow-hidden border-t border-slate-100 bg-white lg:hidden"
          >
            <div className="px-5 py-5">
              <div className="flex flex-col gap-2">
                {navItems.map((item) => (
                  <motion.a
                    key={item.id}
                    variants={itemMobile}
                    href={`#${item.id}`}
                    onClick={(e) => {
                      e.preventDefault()
                      handleNavigate(item.id)
                    }}
                    className="rounded-2xl px-4 py-3 text-sm font-black text-[#000089] transition hover:bg-[#00CCA5]/10 hover:text-[#008f78]"
                  >
                    {item.label}
                  </motion.a>
                ))}
              </div>

              <motion.div
                variants={itemMobile}
                className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2"
              >
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-center text-sm font-black text-[#000089] transition hover:bg-[#00CCA5]/10"
                >
                  Ingresar
                </Link>

                <button
                  type="button"
                  onClick={() => handleNavigate('contacto')}
                  className="rounded-2xl bg-[#00a98a] px-5 py-3 text-center text-sm font-black text-white shadow-lg shadow-[#00CCA5]/20"
                >
                  Conoce más
                </button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}