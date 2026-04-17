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

const MENU = [
  { path: '/doctor/dashboard',      icon: LayoutDashboard, label: 'Dashboard'       },
  { path: '/doctor/citas',          icon: Calendar,        label: 'Mis Citas'       },
  { path: '/doctor/pacientes',      icon: Users,           label: 'Mis Pacientes'   },
  { path: '/doctor/perfil',         icon: UserCircle,      label: 'Mi Perfil'       },
  { path: '/doctor/agenda',         icon: CalendarDays,    label: 'Agenda'          },
  { path: '/doctor/horarios',       icon: Clock,           label: 'Mis Horarios'    },
  { path: '/doctor/estadisticas',   icon: TrendingUp,      label: 'Estadísticas'    },
  { path: '/doctor/notificaciones', icon: Bell,            label: 'Notificaciones', badge: true },
]
function SidebarContent({ collapsed, isOverlay, noLeidas, onToggle, onClose, onNavClick, user, clinica, fotoPerfil, onLogout }) {
  return (
    <>
      {/* Logo */}
      <div className="flex items-center justify-between px-3 py-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg overflow-hidden bg-blue-500 flex items-center justify-center flex-shrink-0">
            {clinica?.logo ? (
              <img src={clinica.logo} alt={clinica.nombre || 'Clínica'} className="w-full h-full object-cover" />
            ) : (
              <Stethoscope size={16} className="text-white" />
            )}
          </div>

          {(!collapsed || isOverlay) && (
            <div>
              <p className="text-white font-semibold text-sm leading-none">
                {clinica?.nombre || 'MediCare'}
              </p>
              <p className="text-slate-400 text-xs mt-0.5">Panel Médico</p>
            </div>
          )}
        </div>
        {isOverlay ? (
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/10">
            <X size={17} />
          </button>
        ) : (
          !collapsed && (
            <button onClick={onToggle} className="text-slate-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/10">
              <PanelLeftClose size={17} />
            </button>
          )
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto">
        {(!collapsed || isOverlay) && (
          <p className="text-slate-500 text-xs font-medium uppercase tracking-wider px-3 mb-2">Menú</p>
        )}
        {MENU.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            title={item.label}
            onClick={onNavClick}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group relative ${
                isActive ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
              } ${collapsed && !isOverlay ? 'justify-center' : ''}`
            }
          >
            {({ isActive }) => (
              <>
                <div className="relative flex-shrink-0">
                  <item.icon size={18} className={isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-200'} />
                  {item.badge && noLeidas > 0 && collapsed && !isOverlay && (
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 rounded-full text-white text-[9px] font-bold flex items-center justify-center">
                      {noLeidas > 99 ? '99+' : noLeidas}
                    </span>
                  )}
                </div>
                {(!collapsed || isOverlay) && (
                  <>
                    <span className="text-sm font-medium flex-1">{item.label}</span>
                    {item.badge && noLeidas > 0 && (
                      <span className="ml-auto px-1.5 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-md min-w-[20px] text-center">
                        {noLeidas > 99 ? '99+' : noLeidas}
                      </span>
                    )}
                  </>
                )}
              </>
            )}
          </NavLink>
        ))}
        {collapsed && !isOverlay && (
          <button onClick={onToggle} className="w-full flex justify-center px-3 py-2.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-all mt-2">
            <PanelLeftOpen size={18} />
          </button>
        )}
      </nav>

      {/* User */}
      <div className={`p-3 border-t border-white/10 ${collapsed && !isOverlay ? 'flex justify-center' : ''}`}>
        {(!collapsed || isOverlay) ? (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg overflow-hidden bg-blue-500/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
              {fotoPerfil ? (
                <img src={fotoPerfil} alt={`${user?.nombre} ${user?.apellido}`} className="w-full h-full object-cover" />
              ) : (
                <span className="text-blue-400 text-xs font-bold">
                  {user?.nombre?.[0]}{user?.apellido?.[0]}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-semibold truncate">Dr. {user?.nombre} {user?.apellido}</p>
              <p className="text-slate-500 text-xs">Doctor</p>
            </div>
            <button onClick={onLogout} title="Cerrar sesión" className="text-slate-500 hover:text-red-400 transition-colors">
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <button onClick={onLogout} title="Cerrar sesión" className="text-slate-500 hover:text-red-400 transition-colors">
            <LogOut size={16} />
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
    <div className="flex min-h-screen bg-slate-50" style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* Sidebar desktop (md+) */}
      <aside
        className={`hidden md:flex flex-col flex-shrink-0 transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}
        style={{ background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)' }}
      >
        <SidebarContent {...sidebarProps} />
      </aside>

      {/* Sidebar móvil overlay (< md) */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-slate-900/60 z-40 md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -288 }} animate={{ x: 0 }} exit={{ x: -288 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="fixed top-0 left-0 h-full w-72 flex flex-col z-50 md:hidden"
              style={{ background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)' }}
            >
              <SidebarContent {...sidebarProps} isOverlay />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200 px-4 md:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-all">
              <Menu size={20} />
            </button>
            <div>
              <h2 className="text-slate-800 font-semibold text-sm">Panel Médico</h2>
              <p className="text-slate-400 text-xs hidden sm:block">Bienvenido, Dr. {user?.nombre}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            {noLeidas > 0 && (
              <div className="flex items-center gap-1.5 bg-red-50 border border-red-100 px-2.5 py-1.5 rounded-xl">
                <Bell size={13} className="text-red-500" />
                <span className="text-xs text-red-600 font-medium hidden sm:inline">
                  {noLeidas} notificación{noLeidas !== 1 ? 'es' : ''} sin leer
                </span>
                <span className="text-xs text-red-600 font-bold sm:hidden">{noLeidas}</span>
              </div>
            )}
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-xs text-slate-500">En línea</span>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}