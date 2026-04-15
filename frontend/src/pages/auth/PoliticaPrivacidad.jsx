import { Link } from 'react-router-dom'
import { Shield, ArrowLeft, Mail, Phone, MapPin } from 'lucide-react'

const FECHA_ACTUALIZACION = '1 de abril de 2025'

const Seccion = ({ titulo, children }) => (
  <div className="mb-8">
    <h2 className="text-base font-bold text-slate-800 mb-3 flex items-center gap-2">
      <span className="w-1 h-5 bg-blue-500 rounded-full flex-shrink-0" />
      {titulo}
    </h2>
    <div className="text-sm text-slate-600 leading-relaxed space-y-2 pl-3">
      {children}
    </div>
  </div>
)

export default function PoliticaPrivacidad() {
  return (
    <div className="min-h-screen bg-slate-50" style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
              <Shield size={16} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">Política de Privacidad</p>
              <p className="text-xs text-slate-400">Actualizada el {FECHA_ACTUALIZACION}</p>
            </div>
          </div>
          <Link to="/register"
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors">
            <ArrowLeft size={15} />
            Volver al registro
          </Link>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl border border-slate-100 p-6 md:p-8">

          {/* Intro */}
          <div className="mb-8 p-4 bg-blue-50 border border-blue-100 rounded-xl">
            <p className="text-sm text-blue-800 leading-relaxed">
              En cumplimiento de la <strong>Ley N° 29733 — Ley de Protección de Datos Personales del Perú</strong>{' '}
              y su Reglamento aprobado por D.S. N° 003-2013-JUS, MediCare informa a sus usuarios sobre
              el tratamiento de sus datos personales.
            </p>
          </div>

          <Seccion titulo="1. Responsable del tratamiento">
            <p>
              <strong>MediCare</strong> es responsable del banco de datos personales denominado{' '}
              <em>"Pacientes MediCare"</em>, debidamente inscrito ante la Autoridad Nacional de
              Protección de Datos Personales (ANPDP).
            </p>
          </Seccion>

          <Seccion titulo="2. Datos personales que recopilamos">
            <p>Recopilamos los siguientes datos personales de nuestros pacientes:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Datos de identificación: nombre, apellidos, DNI o documento de identidad, fecha de nacimiento</li>
              <li>Datos de contacto: correo electrónico, teléfono, dirección</li>
              <li>Datos de salud: alergias, diagnósticos, tratamientos y notas clínicas registradas por los médicos</li>
              <li>Datos de menores de edad: cuando el paciente es menor, datos del tutor o padre responsable</li>
              <li>Datos de uso del sistema: historial de citas, pagos y accesos al portal</li>
            </ul>
            <p className="mt-2 text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
              <strong>Datos sensibles:</strong> Los datos de salud (diagnósticos, tratamientos, recetas)
              son considerados datos sensibles y reciben protección especial conforme al Artículo 13 de la Ley N° 29733.
            </p>
          </Seccion>

          <Seccion titulo="3. Finalidad del tratamiento">
            <p>Sus datos personales son utilizados exclusivamente para:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Gestionar y coordinar citas médicas</li>
              <li>Mantener el historial clínico del paciente</li>
              <li>Enviar recordatorios y notificaciones sobre sus citas</li>
              <li>Procesar pagos por servicios médicos</li>
              <li>Cumplir obligaciones legales y regulatorias en materia de salud</li>
              <li>Mejorar la calidad de los servicios prestados</li>
            </ul>
          </Seccion>

          <Seccion titulo="4. Base legal del tratamiento">
            <p>El tratamiento de sus datos se realiza bajo las siguientes bases legales:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li><strong>Consentimiento expreso</strong> del titular al momento del registro (Art. 5 Ley 29733)</li>
              <li><strong>Ejecución de una relación contractual</strong> de prestación de servicios médicos</li>
              <li><strong>Cumplimiento de obligaciones legales</strong> en materia de salud pública</li>
            </ul>
          </Seccion>

          <Seccion titulo="5. Compartición de datos">
            <p>Sus datos personales <strong>no son vendidos ni cedidos a terceros</strong> con fines comerciales.</p>
            <p>Pueden ser compartidos únicamente con:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>El personal médico de MediCare directamente involucrado en su atención</li>
              <li>Proveedores tecnológicos que prestan servicios al sistema bajo acuerdos de confidencialidad</li>
              <li>Autoridades competentes cuando sea legalmente requerido</li>
            </ul>
          </Seccion>

          <Seccion titulo="6. Plazo de conservación">
            <p>
              Los datos personales serán conservados durante el tiempo necesario para cumplir con
              las finalidades descritas y conforme a los plazos establecidos por la normativa de salud peruana.
              Los datos de salud se conservan por un mínimo de <strong>5 años</strong> desde la última atención,
              conforme a la regulación vigente.
            </p>
          </Seccion>

          <Seccion titulo="7. Derechos ARCO">
            <p>
              Como titular de datos personales, tiene los siguientes derechos conforme a la Ley N° 29733:
            </p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li><strong>Acceso:</strong> conocer qué datos suyos tenemos almacenados</li>
              <li><strong>Rectificación:</strong> corregir datos inexactos o incompletos</li>
              <li><strong>Cancelación:</strong> solicitar la eliminación de sus datos cuando no sean necesarios</li>
              <li><strong>Oposición:</strong> oponerse al tratamiento de sus datos en determinadas circunstancias</li>
            </ul>
            <p className="mt-2">
              Para ejercer estos derechos, puede contactarnos a través de los canales indicados al final de este documento.
            </p>
          </Seccion>

          <Seccion titulo="8. Seguridad de los datos">
            <p>
              MediCare implementa medidas técnicas y organizativas para proteger sus datos personales,
              incluyendo cifrado de contraseñas, control de acceso por roles, registro de auditoría de
              acciones y comunicaciones seguras mediante HTTPS.
            </p>
          </Seccion>

          <Seccion titulo="9. Menores de edad">
            <p>
              Los menores de 18 años no pueden registrarse de forma autónoma en el sistema.
              Su registro debe ser realizado por un tutor o padre responsable, quien asume la
              responsabilidad del consentimiento en nombre del menor, conforme al Artículo 7
              de la Ley N° 29733.
            </p>
          </Seccion>

          <Seccion titulo="10. Cambios en esta política">
            <p>
              MediCare se reserva el derecho de actualizar esta Política de Privacidad.
              Cualquier cambio significativo será notificado a los usuarios a través del correo
              electrónico registrado o mediante aviso en el portal.
            </p>
          </Seccion>

          {/* Contacto */}
          <div className="mt-8 p-5 bg-slate-50 border border-slate-200 rounded-xl">
            <p className="text-sm font-semibold text-slate-700 mb-3">Contacto para ejercicio de derechos ARCO</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Mail size={14} className="text-blue-500 flex-shrink-0" />
                <span>privacidad@medicare.pe</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Phone size={14} className="text-blue-500 flex-shrink-0" />
                <span>Central telefónica de la clínica</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <MapPin size={14} className="text-blue-500 flex-shrink-0" />
                <span>Dirección de la clínica (ver Perfil de Clínica)</span>
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-400 text-center mt-6">
            Última actualización: {FECHA_ACTUALIZACION} · MediCare Sistema Clínico
          </p>
        </div>
      </div>
    </div>
  )
}