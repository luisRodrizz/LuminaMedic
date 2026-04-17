import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

//fallback
import NotFound from './pages/error404/NotFound'

import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword from './pages/auth/ResetPassword'
import PoliticaPrivacidad from './pages/auth/PoliticaPrivacidad'

import Dashboard from './pages/admin/dashboard/Dashboard'
import Doctores from './pages/admin/doctores/Doctores'
import Pacientes from './pages/admin/pacientes/Pacientes'
import Citas from './pages/admin/citas/Citas'
import Servicios from './pages/admin/servicios/Servicios'
import Logs from './pages/admin/logs/Logs'
import Pagos from './pages/admin/pagos/Pagos'
import Perfil from './pages/admin/perfil/Perfil'
import Horarios from './pages/admin/horarios/Horarios'
import SalaEspera from './pages/admin/salaEspera/SalaEspera'
import Reportes from './pages/admin/reportes/Reportes'

import DoctorDashboard from './pages/doctor/dashboard/Dashboard'
import DoctorCitas from './pages/doctor/citas/Citas'
import DoctorPacientes from './pages/doctor/pacientes/Pacientes'
import DoctorPerfil from './pages/doctor/perfil/Perfil'
import DoctorAgenda from './pages/doctor/agenda/Agenda'
import Mishorarios from './pages/doctor/horarios/Mishorarios'
import MisEstadisticas from './pages/doctor/estadisticas/Misestadisticas'
import Notificaciones from './pages/doctor/notificaciones/Notificaciones'

import PacienteDashboard from './pages/paciente/dashboard/Dashboard'
import PacienteCitas from './pages/paciente/citas/Citas'
import Historial from './pages/paciente/historial/Historial'
import PacientePerfil from './pages/paciente/perfil/Perfil'
import NotificacionesPaciente from './pages/paciente/notificaciones/Notificaciones'
import MisEstadisticasPaciente from './pages/paciente/misEstadisticas/MisEstadisticas'


const PrivateRoute = ({ children, roles }) => {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" />
  if (roles && !roles.includes(user.role)) return <Navigate to="/login" />
  return children
}

function App() {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/privacidad" element={<PoliticaPrivacidad />} />

      {/* Admin */}
      <Route path="/admin/dashboard" element={<PrivateRoute roles={['ADMIN']}><Dashboard /></PrivateRoute>} />
      <Route path="/admin/doctores"  element={<PrivateRoute roles={['ADMIN']}><Doctores /></PrivateRoute>} />
      <Route path="/admin/pacientes" element={<PrivateRoute roles={['ADMIN']}><Pacientes /></PrivateRoute>} />
      <Route path="/admin/citas"     element={<PrivateRoute roles={['ADMIN']}><Citas /></PrivateRoute>} />
      <Route path="/admin/servicios" element={<PrivateRoute roles={['ADMIN']}><Servicios /></PrivateRoute>} />
      <Route path="/admin/logs"      element={<PrivateRoute roles={['ADMIN']}><Logs /></PrivateRoute>} />
      <Route path="/admin/pagos"     element={<PrivateRoute roles={['ADMIN']}><Pagos /></PrivateRoute>} />
      <Route path="/admin/perfil"    element={<PrivateRoute roles={['ADMIN']}><Perfil /></PrivateRoute>} />
      <Route path="/admin/horarios"   element={<PrivateRoute roles={['ADMIN']}><Horarios /></PrivateRoute>} />
      <Route path="/admin/reportes"   element={<PrivateRoute roles={['ADMIN']}><Reportes /></PrivateRoute>} />
      <Route path="/admin/sala-espera" element={<PrivateRoute roles={['ADMIN']}><SalaEspera /></PrivateRoute>} /> 

      {/* Doctor */}
      <Route path="/doctor/dashboard" element={<PrivateRoute roles={['DOCTOR']}><DoctorDashboard /></PrivateRoute>} />
      <Route path="/doctor/citas"     element={<PrivateRoute roles={['DOCTOR']}><DoctorCitas /></PrivateRoute>} />
      <Route path="/doctor/pacientes" element={<PrivateRoute roles={['DOCTOR']}><DoctorPacientes /></PrivateRoute>} />
      <Route path="/doctor/perfil"    element={<PrivateRoute roles={['DOCTOR']}><DoctorPerfil /></PrivateRoute>} />
      <Route path="/doctor/agenda"    element={<PrivateRoute roles={['DOCTOR']}><DoctorAgenda /></PrivateRoute>} />
      <Route path="/doctor/horarios"  element={<PrivateRoute roles={['DOCTOR']}><Mishorarios /></PrivateRoute>} />
      <Route path="/doctor/estadisticas" element={<PrivateRoute roles={['DOCTOR']}><MisEstadisticas /></PrivateRoute>} />
      <Route path="/doctor/notificaciones" element={<PrivateRoute roles={['DOCTOR']}><Notificaciones /></PrivateRoute>} />

      {/* Paciente */}
      <Route path="/paciente/dashboard" element={<PrivateRoute roles={['PACIENTE']}><PacienteDashboard /></PrivateRoute>} />
      <Route path="/paciente/citas"     element={<PrivateRoute roles={['PACIENTE']}><PacienteCitas /></PrivateRoute>} />
      <Route path="/paciente/historial" element={<PrivateRoute roles={['PACIENTE']}><Historial /></PrivateRoute>} />
      <Route path="/paciente/perfil"    element={<PrivateRoute roles={['PACIENTE']}><PacientePerfil /></PrivateRoute>} />
      <Route path="/paciente/notificaciones" element={<PrivateRoute roles={['PACIENTE']}><NotificacionesPaciente /></PrivateRoute>} />
      <Route path="/paciente/estadisticas" element={<PrivateRoute roles={['PACIENTE']}><MisEstadisticasPaciente /></PrivateRoute>} />

      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Fallback */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App