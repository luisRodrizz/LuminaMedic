import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard, Calendar, Users,
  LogOut, Stethoscope, PanelLeftClose, PanelLeftOpen,
  Bell, UserCircle, CalendarDays, Clock, TrendingUp, Menu, X
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../services/api'

const BRAND = {
  name: 'LuminaMedic',
  subtitle: 'Panel Médico',
  symbol: '/branding/luminamedic-symbol.png',
  full: '/branding/luminamedic-full.png',
  wordmark: '/branding/luminamedic-wordmark.png'
}

const MENU_SECTIONS = [
  {
    title: 'Vista general',
    items: [
      { path: '/doctor/dashboard', icon: LayoutDashboard, label: 'Dashboard' }
    ]
  },
  {
    title: 'Atención médica',
    items: [
      { path: '/doctor/citas', icon: Calendar, label: 'Mis Citas' },
      { path: '/doctor/pacientes', icon: Users, label: 'Mis Pacientes' },
      { path: '/doctor/agenda', icon: CalendarDays, label: 'Agenda' },
      { path: '/doctor/horarios', icon: Clock, label: 'Mis Horarios' }
    ]
  },
  {
    title: 'Seguimiento',
    items: [
      { path: '/doctor/estadisticas', icon: TrendingUp, label: 'Estadísticas' },
      { path: '/doctor/notificaciones', icon: Bell, label: 'Notificaciones', badge: true }
    ]
  },
  {
    title: 'Configuración',
    items: [
      { path: '/doctor/perfil', icon: UserCircle, label: 'Mi Perfil' }
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
  fotoPerfil,
  onLogout
}) {
  const expanded = !collapsed || isOverlay

  return (
    <>
      {/* Brand */}
      <div className="relative border-b border-slate-200 px-6 py-6">
        <div className="flex items-center justify-center">
          {expanded ? (
            <img
              src={BRAND.full}
              alt={BRAND.name}
              className="h-12 w-auto max-w-[220px] object-contain"
            />
          ) : (
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
              <img
                src={BRAND.symbol}
                alt={BRAND.name}
                className="h-8 w-8 object-contain"
              />
            </div>
          )}
        </div>

        {isOverlay && (
          <button
            onClick={onClose}
            className="absolute right-4 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            title="Cerrar menú"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-5">
        <div className="space-y-6">
          {MENU_SECTIONS.map((section) => (
            <div key={section.title}>
              {expanded && (
                <p className="mb-2 px-2 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
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
                      [
                        'group relative flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm transition-all duration-150',
                        collapsed && !isOverlay ? 'justify-center' : '',
                        isActive
                          ? 'border border-[#00CCA5]/30 bg-[#00CCA5]/10 text-[#000089] shadow-sm'
                          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                      ].join(' ')
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && expanded && (
                          <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-[#00CCA5]" />
                        )}

                        <div className="relative flex-shrink-0">
                          <item.icon
                            size={18}
                            className={
                              isActive
                                ? 'text-[#00a98a]'
                                : 'text-slate-500 transition group-hover:text-slate-800'
                            }
                          />

                          {item.badge && noLeidas > 0 && collapsed && !isOverlay && (
                            <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-black text-white">
                              {noLeidas > 99 ? '99+' : noLeidas}
                            </span>
                          )}
                        </div>

                        {expanded && (
                          <>
                            <span className="flex-1 font-bold">{item.label}</span>

                            {item.badge && noLeidas > 0 && (
                              <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-black text-white">
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
        </div>

        {collapsed && !isOverlay && (
          <button
            onClick={onToggle}
            className="mt-4 flex w-full justify-center rounded-2xl border border-slate-200 px-3 py-2.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
            title="Expandir menú"
          >
            <PanelLeftOpen size={18} />
          </button>
        )}
      </nav>

      {/* User */}
      <div className={`border-t border-slate-200 p-3 ${collapsed && !isOverlay ? 'flex justify-center' : ''}`}>
        {expanded ? (
          <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-3 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                Sesión médica
              </span>

              <span className="flex items-center gap-1 rounded-full bg-[#00CCA5]/10 px-2 py-1 text-[10px] font-black text-[#008f78]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#00CCA5]" />
                Online
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[#00CCA5]/20 bg-[#00CCA5]/10">
                {fotoPerfil ? (
                  <img
                    src={fotoPerfil}
                    alt={`${user?.nombre} ${user?.apellido}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-xs font-black text-[#008f78]">
                    {user?.nombre?.[0]}
                    {user?.apellido?.[0]}
                  </span>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-black text-slate-900">
                  Dr. {user?.nombre} {user?.apellido}
                </p>
                <p className="mt-0.5 truncate text-[11px] font-bold uppercase text-slate-400">
                  Doctor
                </p>
              </div>

              <button
                onClick={onLogout}
                title="Cerrar sesión"
                className="rounded-xl p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={onLogout}
            title="Cerrar sesión"
            className="rounded-2xl p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-500"
          >
            <LogOut size={18} />
          </button>
        )}
      </div>
    </>
  )
}

export default function DoctorLayout({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('doctor-sidebar-collapsed') === 'true')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [noLeidas, setNoLeidas] = useState(0)
  const [fotoPerfil, setFotoPerfil] = useState(() => {
    try {
      return localStorage.getItem('doctor-profile-photo') || null
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
        const res = await api.get('/notificaciones')
        setNoLeidas(res.data.noLeidas)
      } catch {
        console.error('Error cargando badge')
      }
    }

    const fetchClinica = async () => {
      try {
        const res = await api.get('/clinica')
        const branding = {
          nombre: res.data?.nombre || '',
          logo: res.data?.logo || ''
        }
        setClinica(branding)
        localStorage.setItem('clinica-branding', JSON.stringify(branding))
      } catch {
        console.error('Error cargando clínica')
      }
    }

    const fetchMiPerfil = async () => {
      try {
        const res = await api.get('/doctores/perfil/me')
        const foto = res.data?.foto || null
        setFotoPerfil(foto)

        if (foto) {
          localStorage.setItem('doctor-profile-photo', foto)
        } else {
          localStorage.removeItem('doctor-profile-photo')
        }
      } catch {
        console.error('Error cargando perfil del doctor')
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
    localStorage.setItem('doctor-sidebar-collapsed', next)
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
              className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm md:hidden"
              onClick={() => setMobileOpen(false)}
            />

            <motion.aside
              initial={{ x: -304 }}
              animate={{ x: 0 }}
              exit={{ x: -304 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="fixed left-0 top-0 z-50 flex h-full w-80 flex-col border-r border-slate-200 bg-white md:hidden"
            >
              <SidebarContent {...sidebarProps} isOverlay />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 py-3 backdrop-blur-xl md:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 md:hidden"
              title="Abrir menú"
            >
              <Menu size={20} />
            </button>

            <button
              onClick={toggleCollapsed}
              className="hidden rounded-xl border border-slate-200 bg-white p-2 text-slate-500 transition hover:border-[#00CCA5]/40 hover:bg-slate-50 hover:text-[#000089] md:flex"
              title={collapsed ? 'Expandir menú' : 'Contraer menú'}
            >
              {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
            </button>

            <div>
              <h2 className="text-sm font-black text-slate-900">
                Panel Médico
              </h2>
              <p className="hidden text-xs text-slate-400 sm:block">
                Bienvenido, Dr. {user?.nombre} · Gestión de atención médica
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            {noLeidas > 0 && (
              <div className="flex items-center gap-1.5 rounded-2xl border border-red-100 bg-red-50 px-3 py-1.5">
                <Bell size={13} className="text-red-500" />
                <span className="hidden text-xs font-bold text-red-600 sm:inline">
                  {noLeidas} notificación{noLeidas !== 1 ? 'es' : ''} sin leer
                </span>
                <span className="text-xs font-black text-red-600 sm:hidden">
                  {noLeidas}
                </span>
              </div>
            )}

            <div className="hidden items-center gap-2 rounded-2xl border border-[#00CCA5]/20 bg-[#00CCA5]/10 px-3 py-1.5 sm:flex">
              <div className="h-2 w-2 rounded-full bg-[#00CCA5] shadow-sm shadow-[#00CCA5]/40" />
              <span className="text-xs font-bold text-[#008f78]">
                En línea
              </span>
            </div>

            <div className="hidden h-8 w-8 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 md:flex">
              {fotoPerfil ? (
                <img
                  src={fotoPerfil}
                  alt={`${user?.nombre} ${user?.apellido}`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <Stethoscope size={15} className="text-slate-500" />
              )}
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