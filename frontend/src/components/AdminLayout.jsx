import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard,
  Stethoscope,
  Users,
  Calendar,
  Activity,
  DollarSign,
  ScrollText,
  Building2,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Bell,
  Clock,
  FileText,
  MonitorCheck,
  Menu,
  X,
  ShieldCheck
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../services/api'

const BRAND = {
  name: 'LuminaMedic',
  subtitle: 'Sistema de Gestión Clínica',
  symbol: '/branding/luminamedic-symbol.png',
  full: '/branding/luminamedic-full.png',
  wordmark: '/branding/luminamedic-wordmark.png'
}

const MENU_SECTIONS = [
  {
    title: 'Vista general',
    items: [
      { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' }
    ]
  },
  {
    title: 'Gestión clínica',
    items: [
      { path: '/admin/doctores', icon: Stethoscope, label: 'Doctores' },
      { path: '/admin/pacientes', icon: Users, label: 'Pacientes' },
      { path: '/admin/citas', icon: Calendar, label: 'Citas', badge: true },
      { path: '/admin/horarios', icon: Clock, label: 'Horarios' },
      { path: '/admin/servicios', icon: Activity, label: 'Servicios' }
    ]
  },
  {
    title: 'Administración',
    items: [
      { path: '/admin/pagos', icon: DollarSign, label: 'Pagos' },
      { path: '/admin/reportes', icon: FileText, label: 'Reportes' },
      { path: '/admin/sala-espera', icon: MonitorCheck, label: 'Sala de espera' },
      { path: '/admin/logs', icon: ScrollText, label: 'Logs' }
    ]
  },
  {
    title: 'Configuración',
    items: [
      { path: '/admin/perfil', icon: Building2, label: 'Config. Clínica' }
    ]
  }
]

function SidebarContent({
  collapsed,
  isOverlay,
  citasPendientes,
  onToggle,
  onClose,
  onNavClick,
  user,
  clinica,
  onLogout
}) {
  const expanded = !collapsed || isOverlay

  return (
    <>
      {/* Brand */}
      <div className="border-b border-slate-200 px-6 py-6">
        <div className="flex items-center justify-center">
          {expanded ? (
            <img
              src={BRAND.full}
              alt={BRAND.name}
              className="h-10 w-auto object-contain"
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
      </div>

      {/* Menu */}
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

                          {item.badge && citasPendientes > 0 && collapsed && !isOverlay && (
                            <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-black text-white">
                              {citasPendientes > 99 ? '99+' : citasPendientes}
                            </span>
                          )}
                        </div>

                        {expanded && (
                          <>
                            <span className="flex-1 font-bold">{item.label}</span>

                            {item.badge && citasPendientes > 0 && (
                              <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-black text-white">
                                {citasPendientes > 99 ? '99+' : citasPendientes}
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

      {/* User / Session */}
      <div className={`border-t border-slate-200 p-3 ${collapsed && !isOverlay ? 'flex justify-center' : ''}`}>
        {expanded ? (
          <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-3 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                Sesión activa
              </span>

              <span className="flex items-center gap-1 rounded-full bg-[#00CCA5]/10 px-2 py-1 text-[10px] font-black text-[#008f78]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#00CCA5]" />
                Online
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl border border-[#00CCA5]/20 bg-[#00CCA5]/10">
                <span className="text-xs font-black text-[#008f78]">
                  {user?.nombre?.[0]}
                  {user?.apellido?.[0]}
                </span>
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-black text-slate-900">
                  {user?.nombre} {user?.apellido}
                </p>
                <p className="mt-0.5 truncate text-[11px] font-bold uppercase text-slate-400">
                  {user?.role || 'ADMIN'}
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

export default function AdminLayout({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem('sidebar-collapsed') === 'true'
  )
  const [mobileOpen, setMobileOpen] = useState(false)
  const [citasPendientes, setCitasPendientes] = useState(0)
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
        const res = await api.get('/citas?estado=PENDIENTE&page=1&limit=1')
        setCitasPendientes(res.data.meta?.total || 0)
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

    fetchPendientes()
    fetchClinica()

    const interval = setInterval(fetchPendientes, 60000)
    return () => clearInterval(interval)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const toggleCollapsed = () => {
    const next = !collapsed
    setCollapsed(next)
    localStorage.setItem('sidebar-collapsed', next)
  }

  const sidebarProps = {
    collapsed,
    citasPendientes,
    onToggle: toggleCollapsed,
    onClose: () => setMobileOpen(false),
    onNavClick: () => setMobileOpen(false),
    user,
    clinica,
    onLogout: handleLogout
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
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

      {/* Sidebar móvil */}
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
            {/* Botón móvil */}
            <button
              onClick={() => setMobileOpen(true)}
              className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 md:hidden"
            >
              <Menu size={20} />
            </button>

            {/* Botón desktop para contraer/expandir sidebar */}
            <button
              onClick={toggleCollapsed}
              className="hidden rounded-xl border border-slate-200 bg-white p-2 text-slate-500 transition hover:border-[#00CCA5]/40 hover:bg-slate-50 hover:text-[#000089] md:flex"
              title={collapsed ? 'Expandir menú' : 'Contraer menú'}
            >
              {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
            </button>

            <div>
              <h2 className="text-sm font-black text-slate-900">
                Panel de Administración
              </h2>
              <p className="hidden text-xs text-slate-400 sm:block">
                Bienvenido, {user?.nombre} · Gestión general de LuminaMedic
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            {citasPendientes > 0 && (
              <div className="flex items-center gap-1.5 rounded-2xl border border-red-100 bg-red-50 px-3 py-1.5">
                <Bell size={13} className="text-red-500" />
                <span className="hidden text-xs font-bold text-red-600 sm:inline">
                  {citasPendientes} pendiente{citasPendientes !== 1 ? 's' : ''}
                </span>
                <span className="text-xs font-black text-red-600 sm:hidden">
                  {citasPendientes}
                </span>
              </div>
            )}

            <div className="hidden items-center gap-2 rounded-2xl border border-[#00CCA5]/20 bg-[#00CCA5]/10 px-3 py-1.5 sm:flex">
              <div className="h-2 w-2 rounded-full bg-[#00CCA5] shadow-sm shadow-[#00CCA5]/40" />
              <span className="text-xs font-bold text-[#008f78]">
                Sistema activo
              </span>
            </div>

            <div className="hidden h-8 w-8 items-center justify-center rounded-2xl bg-slate-100 md:flex">
              <ShieldCheck size={15} className="text-slate-500" />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </div>
    </motion.div>
  )
}