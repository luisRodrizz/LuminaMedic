import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard, Stethoscope, Users, Calendar,
  Activity, DollarSign, ScrollText, Building2,
  LogOut, PanelLeftClose, PanelLeftOpen, Bell,
  Clock, FileText, MonitorCheck, Menu, X
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../services/api'

const MENU = [
  { path: '/admin/dashboard',   icon: LayoutDashboard, label: 'Dashboard'      },
  { path: '/admin/doctores',    icon: Stethoscope,     label: 'Doctores'       },
  { path: '/admin/pacientes',   icon: Users,           label: 'Pacientes'      },
  { path: '/admin/citas',       icon: Calendar,        label: 'Citas', badge: true },
  { path: '/admin/horarios',    icon: Clock,           label: 'Horarios'       },
  { path: '/admin/servicios',   icon: Activity,        label: 'Servicios'      },
  { path: '/admin/pagos',       icon: DollarSign,      label: 'Pagos'          },
  { path: '/admin/reportes',    icon: FileText,        label: 'Reportes'       },
  { path: '/admin/sala-espera', icon: MonitorCheck,    label: 'Sala de espera' },
  { path: '/admin/logs',        icon: ScrollText,      label: 'Logs'           },
  { path: '/admin/perfil',      icon: Building2,       label: 'Perfil Clínica' },
]

function SidebarContent({ collapsed, isOverlay, citasPendientes, onToggle, onClose, onNavClick, user, onLogout }) {
  return (
    <>
      <div className="flex items-center justify-between px-3 py-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <Stethoscope size={16} className="text-white" />
          </div>
          {(!collapsed || isOverlay) && (
            <div>
              <p className="text-white font-semibold text-sm leading-none">MediCare</p>
              <p className="text-slate-400 text-xs mt-0.5">Sistema Clínico</p>
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

      <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto">
        {(!collapsed || isOverlay) && (
          <p className="text-slate-500 text-xs font-medium uppercase tracking-wider px-3 mb-2">Menú principal</p>
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
                  {item.badge && citasPendientes > 0 && collapsed && !isOverlay && (
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 rounded-full text-white text-[9px] font-bold flex items-center justify-center">
                      {citasPendientes > 99 ? '99+' : citasPendientes}
                    </span>
                  )}
                </div>
                {(!collapsed || isOverlay) && (
                  <>
                    <span className="text-sm font-medium flex-1">{item.label}</span>
                    {item.badge && citasPendientes > 0 && (
                      <span className="ml-auto px-1.5 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-md min-w-[20px] text-center">
                        {citasPendientes > 99 ? '99+' : citasPendientes}
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

      <div className={`p-3 border-t border-white/10 ${collapsed && !isOverlay ? 'flex justify-center' : ''}`}>
        {(!collapsed || isOverlay) ? (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500/20 border border-blue-500/30 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-blue-400 text-xs font-bold">{user?.nombre?.[0]}{user?.apellido?.[0]}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-semibold truncate">{user?.nombre} {user?.apellido}</p>
              <p className="text-slate-500 text-xs">{user?.role}</p>
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

export default function AdminLayout({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('sidebar-collapsed') === 'true')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [citasPendientes, setCitasPendientes] = useState(0)

  useEffect(() => {
    const fetchPendientes = async () => {
      try {
        const res = await api.get('/citas?estado=PENDIENTE&page=1&limit=1')
        setCitasPendientes(res.data.meta?.total || 0)
      } catch {
        console.error('Error cargando badge')
      }
    }
    fetchPendientes()
    const interval = setInterval(fetchPendientes, 60000)
    return () => clearInterval(interval)
  }, [])

  const handleLogout = () => { logout(); navigate('/login') }
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
              <h2 className="text-slate-800 font-semibold text-sm">Panel de Administración</h2>
              <p className="text-slate-400 text-xs hidden sm:block">Bienvenido de vuelta, {user?.nombre}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            {citasPendientes > 0 && (
              <div className="flex items-center gap-1.5 bg-red-50 border border-red-100 px-2.5 py-1.5 rounded-xl">
                <Bell size={13} className="text-red-500" />
                <span className="text-xs text-red-600 font-medium hidden sm:inline">{citasPendientes} pendiente{citasPendientes !== 1 ? 's' : ''}</span>
                <span className="text-xs text-red-600 font-bold sm:hidden">{citasPendientes}</span>
              </div>
            )}
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full" />
              <span className="text-xs text-slate-500">Sistema activo</span>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}