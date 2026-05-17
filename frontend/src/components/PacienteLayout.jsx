import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard, Calendar, ClipboardList,
  LogOut, Stethoscope, PanelLeftClose, PanelLeftOpen,
  Bell, UserCircle, TrendingUp, Menu, X
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../services/api'

const BRAND = {
  name: 'LuminaMedic',
  subtitle: 'Portal del Paciente',
  symbol: '/branding/luminamedic-symbol.png',
  full: '/branding/luminamedic-full.png',
  wordmark: '/branding/luminamedic-wordmark.png'
}

const MENU_SECTIONS = [
  {
    title: 'Vista general',
    items: [
      { path: '/paciente/dashboard', icon: LayoutDashboard, label: 'Inicio' }
    ]
  },
  {
    title: 'Atención médica',
    items: [
      { path: '/paciente/citas', icon: Calendar, label: 'Mis Citas' },
      { path: '/paciente/historial', icon: ClipboardList, label: 'Historial' }
    ]
  },
  {
    title: 'Seguimiento',
    items: [
      { path: '/paciente/estadisticas', icon: TrendingUp, label: 'Estadísticas' },
      { path: '/paciente/notificaciones', icon: Bell, label: 'Notificaciones', badge: true }
    ]
  },
  {
    title: 'Configuración',
    items: [
      { path: '/paciente/perfil', icon: UserCircle, label: 'Mi Perfil' }
    ]
  }
]

function SidebarContent({
  collapsed,
  isOverlay,
  noLeidas,
  onToggle,
  onClose,
  onNavClick,
  user,
  clinica,
  fotoPerfil,
  onLogout
}) {
  const compact = collapsed && !isOverlay

  return (
    <>
      {/* Brand */}
      <div className="relative border-b border-slate-200 px-6 py-6">
        <div className="flex items-center justify-center">
          {!compact ? (
            <img
              src={BRAND.full}
              alt={BRAND.name}
              className="h-12 w-auto max-w-[220px] object-contain"
              onError={(e) => {
                e.target.style.display = 'none'
                e.target.parentNode.innerHTML = `<p class="truncate text-xl font-black leading-none text-slate-900">${BRAND.name}</p>`
              }}
            />
          ) : (
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
              <img
                src={BRAND.symbol}
                alt={BRAND.name}
                className="h-8 w-8 object-contain"
                onError={(e) => {
                  e.target.style.display = 'none'
                  e.target.parentNode.innerHTML = '<span class="text-[#008f78]"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 2v20"/><path d="M2 11h20"/></svg></span>'
                }}
              />
            </div>
          )}
        </div>

        {isOverlay && (
          <button
            onClick={onClose}
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-5 overflow-y-auto px-2 py-4">
        {MENU_SECTIONS.map((section) => (
          <div key={section.title}>
            {!compact && (
              <p className="mb-2 px-3 text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">
                {section.title}
              </p>
            )}

            <div className="space-y-1">
              {section.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  title={item.label}
                  onClick={onNavClick}
                  className={({ isActive }) =>
                    `group relative flex items-center gap-3 rounded-2xl px-3 py-2.5 transition-all duration-150 ${
                      isActive
                        ? 'border border-[#00CCA5]/30 bg-[#00CCA5]/10 text-[#000089]'
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                    } ${compact ? 'justify-center' : ''}`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && !compact && (
                        <span className="absolute left-0 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r-full bg-[#00CCA5]" />
                      )}

                      <div className="relative flex-shrink-0">
                        <item.icon
                          size={18}
                          className={isActive ? 'text-[#000089]' : 'text-slate-400 group-hover:text-slate-700'}
                        />

                        {item.badge && noLeidas > 0 && compact && (
                          <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-black text-white ring-2 ring-white">
                            {noLeidas > 99 ? '99+' : noLeidas}
                          </span>
                        )}
                      </div>

                      {!compact && (
                        <>
                          <span className="flex-1 text-sm font-black">
                            {item.label}
                          </span>

                          {item.badge && noLeidas > 0 && (
                            <span className="ml-auto flex min-w-6 items-center justify-center rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-black text-white">
                              {noLeidas > 99 ? '99+' : noLeidas}
                            </span>
                          )}
                        </>
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}

        {compact && (
          <button
            onClick={onToggle}
            className="flex w-full justify-center rounded-2xl px-3 py-2.5 text-slate-400 transition hover:bg-slate-50 hover:text-slate-700"
          >
            <PanelLeftOpen size={18} />
          </button>
        )}
      </nav>

      {/* User */}
      <div className={`border-t border-slate-200 p-3 ${compact ? 'flex justify-center' : ''}`}>
        {!compact ? (
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-3">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">
                Sesión paciente
              </p>

              <div className="flex items-center gap-1.5 rounded-full bg-[#00CCA5]/10 px-2.5 py-1">
                <span className="h-1.5 w-1.5 rounded-full bg-[#00CCA5]" />
                <span className="text-[10px] font-black text-[#008f78]">
                  Online
                </span>
              </div>
            </div>

            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[#00CCA5]/20 bg-[#00CCA5]/10">
                {fotoPerfil ? (
                  <img
                    src={fotoPerfil}
                    alt={`${user?.nombre} ${user?.apellido}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-xs font-black text-[#008f78]">
                    {user?.nombre?.[0]}{user?.apellido?.[0]}
                  </span>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-black text-slate-900">
                  {user?.nombre} {user?.apellido}
                </p>
                <p className="mt-0.5 text-xs font-black uppercase tracking-[0.08em] text-slate-400">
                  Paciente
                </p>
              </div>

              <button
                onClick={onLogout}
                title="Cerrar sesión"
                className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-red-50 hover:text-red-600"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={onLogout}
            title="Cerrar sesión"
            className="flex h-10 w-10 items-center justify-center rounded-2xl text-slate-400 transition hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={17} />
          </button>
        )}
      </div>
    </>
  )
}

export default function PacienteLayout({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('paciente-sidebar-collapsed') === 'true')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [noLeidas, setNoLeidas] = useState(0)
  const [fotoPerfil, setFotoPerfil] = useState(() => {
    try {
      return localStorage.getItem('paciente-profile-photo') || null
    } catch {
      return null
    }
  })

  const [clinica, setClinica] = useState(() => {
    try {
      const saved = localStorage.getItem('clinica-branding')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  useEffect(() => {
    const fetchPendientes = async () => {
      try {
        const res = await api.get('/notificaciones/paciente')
        setNoLeidas(res.data.noLeidas)
      } catch {
        console.error('Error cargando badge')
      }
    }

    const fetchClinica = async () => {
      try {
        const res = await api.get('/clinica')
        setClinica(res.data)
        localStorage.setItem('clinica-branding', JSON.stringify(res.data))
      } catch {
        console.error('Error cargando clínica')
      }
    }

    const fetchMiPerfil = async () => {
      try {
        const res = await api.get('/pacientes/perfil/me')
        const foto = res.data?.foto || null
        setFotoPerfil(foto)

        if (foto) {
          localStorage.setItem('paciente-profile-photo', foto)
        } else {
          localStorage.removeItem('paciente-profile-photo')
        }
      } catch {
        console.error('Error cargando perfil del paciente')
      }
    }

    fetchPendientes()
    fetchClinica()
    fetchMiPerfil()

    const interval = setInterval(fetchPendientes, 60000)
    return () => clearInterval(interval)
  }, [])

  const handleLogout = () => { logout(); navigate('/login') }
  const toggleCollapsed = () => {
    const next = !collapsed
    setCollapsed(next)
    localStorage.setItem('paciente-sidebar-collapsed', next)
  }

  const sidebarProps = {
    collapsed,
    noLeidas,
    onToggle: toggleCollapsed,
    onClose: () => setMobileOpen(false),
    onNavClick: () => setMobileOpen(false),
    user,
    clinica,
    fotoPerfil,
    onLogout: handleLogout,
  }

  return (
    <div
      className="flex min-h-screen bg-[#F8FBFC]"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Sidebar desktop */}
      <aside
        className={`hidden flex-shrink-0 flex-col border-r border-slate-200 bg-white transition-all duration-300 md:flex ${
          collapsed ? 'w-[72px]' : 'w-72'
        }`}
      >
        <SidebarContent {...sidebarProps} />
      </aside>

      {/* Sidebar móvil overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm md:hidden"
              onClick={() => setMobileOpen(false)}
            />

            <motion.aside
              initial={{ x: -288 }}
              animate={{ x: 0 }}
              exit={{ x: -288 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="fixed left-0 top-0 z-50 flex h-full w-72 flex-col border-r border-slate-200 bg-white md:hidden"
            >
              <SidebarContent {...sidebarProps} isOverlay />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur-xl md:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 md:hidden"
            >
              <Menu size={20} />
            </button>

            <button
              onClick={toggleCollapsed}
              className="hidden h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 shadow-sm transition hover:bg-slate-50 hover:text-slate-700 md:flex"
              title={collapsed ? 'Expandir menú' : 'Contraer menú'}
            >
              {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
            </button>

            <div className="min-w-0">
              <h2 className="truncate text-sm font-black text-slate-900">
                Portal del Paciente
              </h2>
              <p className="hidden text-xs font-medium text-slate-400 sm:block">
                Bienvenido, {user?.nombre}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            {noLeidas > 0 && (
              <div className="flex items-center gap-2 rounded-2xl border border-red-100 bg-red-50 px-3 py-2">
                <Bell size={14} className="text-red-500" />
                <span className="hidden text-xs font-black text-red-600 sm:inline">
                  {noLeidas} notificación{noLeidas !== 1 ? 'es' : ''}
                </span>
                <span className="text-xs font-black text-red-600 sm:hidden">
                  {noLeidas}
                </span>
              </div>
            )}

            <div className="hidden items-center gap-2 rounded-2xl border border-[#00CCA5]/20 bg-[#00CCA5]/10 px-3 py-2 sm:flex">
              <div className="h-2 w-2 animate-pulse rounded-full bg-[#00CCA5]" />
              <span className="text-xs font-black text-[#008f78]">
                En línea
              </span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}