import { Link } from 'react-router-dom'
import {
  ShieldCheck,
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  FileText,
  LockKeyhole,
  UserCheck,
  HeartPulse,
  Scale,
  Database,
  Clock,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react'

const FECHA_ACTUALIZACION = '5 de mayo de 2026'

const Seccion = ({ numero, titulo, children }) => (
  <section
    id={`seccion-${numero}`}
    className="scroll-mt-28 border-b border-slate-100 pb-8 last:border-b-0"
  >
    <div className="mb-4 flex items-start gap-4">
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-2xl bg-[#00CCA5]/10 text-sm font-black text-[#008f78]">
        {numero}
      </div>

      <div>
        <h2 className="text-lg font-black leading-tight text-[#000089]">
          {titulo}
        </h2>
      </div>
    </div>

    <div className="space-y-4 pl-0 text-sm leading-7 text-slate-600 md:pl-13">
      {children}
    </div>
  </section>
)

const summaryCards = [
  {
    icon: LockKeyhole,
    title: 'Datos protegidos',
    text: 'La información médica se trata como dato sensible y se protege mediante controles de acceso.'
  },
  {
    icon: UserCheck,
    title: 'Derechos del titular',
    text: 'Puedes ejercer acceso, rectificación, cancelación u oposición cuando corresponda.'
  },
  {
    icon: FileText,
    title: 'Uso del sistema',
    text: 'Aplica al registro, citas, historial clínico, pagos y comunicaciones vinculadas a la atención.'
  }
]

const quickLinks = [
  { label: 'Responsable', id: 'seccion-1' },
  { label: 'Datos recopilados', id: 'seccion-2' },
  { label: 'Finalidades', id: 'seccion-3' },
  { label: 'Derechos del titular', id: 'seccion-7' },
  { label: 'Seguridad', id: 'seccion-8' },
  { label: 'Contacto', id: 'contacto-privacidad' }
]

export default function PoliticaPrivacidad() {
  return (
    <main
      className="min-h-screen bg-[#F8FBFC] text-slate-900"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Header legal */}
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-5 py-4 md:px-8 xl:px-12">
          <div className="flex w-full items-center justify-between gap-3">
            <Link
              to="/"
              className="min-w-0 inline-flex items-center transition hover:scale-[1.02]"
            >
              <img
                src="/branding/luminamedic-full.png"
                alt="LuminaMedic"
                className="h-9 w-auto max-w-[210px] object-contain sm:h-11 sm:max-w-none"
                onError={(e) => {
                  e.target.style.display = 'none'
                  e.target.parentNode.innerHTML = `<span class="text-xl font-black text-[#000089]">LuminaMedic</span>`
                }}
              />
            </Link>

            <div className="hidden flex-1 text-center md:block">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#008f78]">
                Documento legal
              </p>
              <p className="mt-1 text-xs font-medium text-slate-500">
                Actualizada el {FECHA_ACTUALIZACION}
              </p>
            </div>

            <Link
              to="/register"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-2 text-[11px] font-black text-slate-600 shadow-sm transition hover:border-[#00CCA5]/40 hover:text-[#000089] sm:gap-2 sm:px-4 sm:text-xs"
            >
              <ArrowLeft size={13} className="sm:size-[14px]" />
              Volver
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-slate-100 bg-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,204,165,0.16),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(0,0,137,0.08),transparent_32%)]" />

        <div className="relative mx-auto max-w-[1500px] px-5 py-14 md:px-8 lg:py-16 xl:px-12">
          <div className="grid gap-10 lg:grid-cols-[1fr_380px] lg:items-end">
            <div className="max-w-3xl">
              <span className="mb-5 inline-flex items-center gap-2 rounded-full bg-[#00CCA5]/10 px-4 py-2 text-xs font-black text-[#008f78]">
                <ShieldCheck size={14} />
                Protección de datos personales
              </span>

              <h1 className="text-4xl font-black leading-tight tracking-tight text-[#000089] md:text-5xl">
                Política de Privacidad
              </h1>

              <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-600 md:text-base">
                En LuminaMedic cuidamos la confidencialidad de la información
                personal y médica registrada en el sistema. Esta política explica
                qué datos tratamos, con qué finalidad, cómo los protegemos y cómo
                puedes ejercer tus derechos como titular de datos personales.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-slate-600 shadow-sm">
                  <Scale size={16} className="text-[#000089]" />
                  Ley N.° 29733
                </div>

                <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-slate-600 shadow-sm">
                  <Database size={16} className="text-[#00a98a]" />
                  Datos personales y sensibles
                </div>

                <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-slate-600 shadow-sm">
                  <Clock size={16} className="text-[#000089]" />
                  Actualizada el {FECHA_ACTUALIZACION}
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-[#00CCA5]/20 bg-[#00CCA5]/10 p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#008f78]">
                <LockKeyhole size={24} />
              </div>

              <p className="text-sm font-black text-[#000089]">
                Información médica protegida
              </p>

              <p className="mt-2 text-xs leading-6 text-slate-600">
                Los datos de salud son tratados como información sensible y solo
                deben ser accedidos por usuarios autorizados según su rol dentro
                del sistema.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contenido */}
      <section className="mx-auto max-w-[1500px] px-5 py-10 md:px-8 lg:py-12 xl:px-12">
        <div className="grid gap-8 lg:grid-cols-[1fr_330px]">
          {/* Documento */}
          <article className="rounded-[2rem] border border-white/80 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] md:p-8 lg:p-10">
            <div className="mb-10 rounded-[1.5rem] border border-[#00CCA5]/20 bg-[#00CCA5]/10 p-5">
              <div className="flex gap-4">
                <div className="hidden h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-white text-[#008f78] sm:flex">
                  <ShieldCheck size={22} />
                </div>

                <p className="text-sm leading-7 text-slate-700">
                  En cumplimiento de la{' '}
                  <strong>
                    Ley N.° 29733 — Ley de Protección de Datos Personales
                  </strong>
                  , LuminaMedic informa a sus usuarios sobre el tratamiento de
                  sus datos personales. Esta política aplica al uso del Sistema
                  de Gestión Clínica, incluyendo el registro de pacientes,
                  reserva de citas, historial clínico, pagos y comunicaciones
                  vinculadas a la atención médica.
                </p>
              </div>
            </div>

            <div className="space-y-8">
              <Seccion numero="1" titulo="Responsable del tratamiento">
                <p>
                  <strong>LuminaMedic</strong> es responsable del tratamiento de
                  los datos personales registrados en el sistema, conforme a la
                  Ley N.° 29733 y la normativa peruana aplicable en materia de
                  protección de datos personales.
                </p>

                <p>
                  La información registrada será utilizada únicamente para
                  finalidades relacionadas con la prestación de servicios médicos,
                  gestión administrativa, comunicación con pacientes y cumplimiento
                  de obligaciones legales aplicables.
                </p>
              </Seccion>

              <Seccion numero="2" titulo="Datos personales que recopilamos">
                <p>Podemos recopilar y tratar los siguientes datos personales:</p>

                <ul className="list-disc space-y-2 pl-5">
                  <li>
                    <strong>Datos de identificación:</strong> nombres, apellidos,
                    tipo y número de documento, fecha de nacimiento.
                  </li>
                  <li>
                    <strong>Datos de contacto:</strong> correo electrónico,
                    teléfono y dirección cuando corresponda.
                  </li>
                  <li>
                    <strong>Datos de cuenta:</strong> credenciales de acceso, rol
                    del usuario, estado de la cuenta y registros de actividad.
                  </li>
                  <li>
                    <strong>Datos de atención:</strong> citas, servicios
                    solicitados, doctores asignados, pagos y comprobantes.
                  </li>
                  <li>
                    <strong>Datos de salud:</strong> diagnósticos, tratamientos,
                    recetas, observaciones médicas, notas clínicas e historial
                    clínico registrado por personal autorizado.
                  </li>
                  <li>
                    <strong>Datos de menores de edad:</strong> cuando corresponda,
                    datos del paciente menor y del tutor o responsable registrado
                    por la clínica.
                  </li>
                </ul>

                <div className="mt-5 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-amber-800">
                  <div className="flex gap-3">
                    <AlertTriangle size={18} className="mt-0.5 flex-shrink-0" />
                    <p>
                      <strong>Datos sensibles:</strong> la información relacionada
                      con salud recibe protección reforzada y solo debe ser
                      accedida por usuarios autorizados según su rol dentro del
                      sistema.
                    </p>
                  </div>
                </div>
              </Seccion>

              <Seccion numero="3" titulo="Finalidades del tratamiento">
                <p>
                  Los datos personales son tratados para las siguientes
                  finalidades:
                </p>

                <ul className="list-disc space-y-2 pl-5">
                  <li>Crear y administrar cuentas de usuario.</li>
                  <li>
                    Identificar al paciente y validar la información registrada.
                  </li>
                  <li>
                    Gestionar reservas, cancelaciones y reprogramaciones de citas
                    médicas.
                  </li>
                  <li>Mantener el historial clínico del paciente.</li>
                  <li>
                    Registrar notas clínicas, diagnósticos, tratamientos y recetas.
                  </li>
                  <li>
                    Enviar confirmaciones, recordatorios y comunicaciones
                    relacionadas con citas.
                  </li>
                  <li>
                    Registrar pagos, emitir reportes y gestionar comprobantes.
                  </li>
                  <li>
                    Brindar seguimiento u orientación posterior cuando el servicio
                    lo contemple.
                  </li>
                  <li>
                    Cumplir obligaciones legales, sanitarias, administrativas o
                    regulatorias.
                  </li>
                  <li>
                    Mejorar la seguridad, funcionamiento y calidad del sistema.
                  </li>
                </ul>
              </Seccion>

              <Seccion numero="4" titulo="Base legal del tratamiento">
                <p>
                  El tratamiento de datos personales se realiza sobre la base del
                  consentimiento otorgado por el titular al registrarse, la
                  ejecución de la relación de prestación de servicios médicos, el
                  cumplimiento de obligaciones legales aplicables y la atención de
                  finalidades legítimas vinculadas a la seguridad y administración
                  del sistema.
                </p>
              </Seccion>

              <Seccion numero="5" titulo="Acceso y compartición de datos">
                <p>
                  LuminaMedic no vende ni cede datos personales a terceros con
                  fines comerciales. La información podrá ser accedida o
                  compartida únicamente cuando sea necesario para la prestación del
                  servicio o por obligación legal.
                </p>

                <p>Los datos podrán ser tratados por:</p>

                <ul className="list-disc space-y-2 pl-5">
                  <li>Personal administrativo autorizado.</li>
                  <li>
                    Médicos o profesionales de salud involucrados en la atención
                    del paciente.
                  </li>
                  <li>
                    Proveedores tecnológicos que brinden soporte al sistema bajo
                    deberes de confidencialidad.
                  </li>
                  <li>
                    Autoridades competentes cuando exista requerimiento legal.
                  </li>
                </ul>

                <p>
                  El acceso dentro del sistema se controla por roles:
                  administrador, doctor y paciente. Cada usuario solo debe acceder
                  a la información necesaria para cumplir sus funciones.
                </p>
              </Seccion>

              <Seccion numero="6" titulo="Plazo de conservación">
                <p>
                  Los datos personales serán conservados durante el tiempo
                  necesario para cumplir las finalidades descritas, atender
                  obligaciones legales, resolver incidencias, mantener trazabilidad
                  administrativa y preservar la continuidad de la atención médica.
                </p>

                <p>
                  Cuando los datos dejen de ser necesarios, podrán ser bloqueados,
                  anonimizados o eliminados conforme a los procedimientos internos
                  y a la normativa aplicable.
                </p>
              </Seccion>

              <Seccion numero="7" titulo="Derechos del titular de datos personales">
                <p>
                  Como titular de datos personales, puedes ejercer los derechos
                  reconocidos por la normativa peruana de protección de datos
                  personales, incluyendo:
                </p>

                <ul className="list-disc space-y-2 pl-5">
                  <li>
                    <strong>Acceso:</strong> solicitar información sobre los datos
                    personales tratados.
                  </li>
                  <li>
                    <strong>Rectificación:</strong> solicitar la corrección de
                    datos inexactos o incompletos.
                  </li>
                  <li>
                    <strong>Cancelación:</strong> solicitar la supresión de datos
                    cuando corresponda.
                  </li>
                  <li>
                    <strong>Oposición:</strong> oponerte al tratamiento en los
                    casos permitidos por ley.
                  </li>
                </ul>

                <p>
                  Para ejercer estos derechos, puedes utilizar los canales de
                  contacto indicados al final de esta política.
                </p>
              </Seccion>

              <Seccion numero="8" titulo="Seguridad de la información">
                <p>
                  LuminaMedic aplica medidas técnicas y organizativas orientadas a
                  proteger la información registrada en el sistema. Estas medidas
                  incluyen control de acceso por roles, cifrado de contraseñas,
                  comunicaciones seguras mediante HTTPS, registros de auditoría y
                  restricciones de acceso a información sensible.
                </p>

                <p>
                  Ningún sistema informático es completamente invulnerable; por
                  ello, LuminaMedic mantiene prácticas de revisión y mejora
                  continua para reducir riesgos de acceso, pérdida, alteración o
                  uso no autorizado de la información.
                </p>
              </Seccion>

              <Seccion numero="9" titulo="Menores de edad">
                <p>
                  Los menores de 18 años no pueden registrarse de forma autónoma
                  en el sistema. Su registro debe ser realizado por la clínica con
                  la información del tutor, padre, madre o responsable autorizado.
                </p>

                <p>
                  El tratamiento de datos de menores se realizará únicamente para
                  finalidades vinculadas a la atención médica y gestión
                  administrativa correspondiente.
                </p>
              </Seccion>

              <Seccion numero="10" titulo="Cambios en esta política">
                <p>
                  LuminaMedic podrá actualizar esta Política de Privacidad para
                  reflejar cambios normativos, técnicos, operativos o de servicio.
                  Cuando el cambio sea relevante, se informará a los usuarios
                  mediante el portal, correo electrónico u otro canal disponible.
                </p>
              </Seccion>
            </div>

            {/* Contacto */}
            <div
              id="contacto-privacidad"
              className="mt-10 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#000089]/10 text-[#000089]">
                  <Mail size={21} />
                </div>

                <div>
                  <p className="text-sm font-black text-slate-800">
                    Contacto para consultas o ejercicio de derechos
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Puedes comunicarte por los siguientes canales.
                  </p>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                  <Mail size={16} className="mb-2 text-[#000089]" />
                  <p className="text-xs font-black text-slate-700">Correo</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    privacidad@luminamedic.pe
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                  <Phone size={16} className="mb-2 text-[#000089]" />
                  <p className="text-xs font-black text-slate-700">Teléfono</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Central telefónica de LuminaMedic
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                  <MapPin size={16} className="mb-2 text-[#000089]" />
                  <p className="text-xs font-black text-slate-700">Dirección</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Dirección registrada de LuminaMedic
                  </p>
                </div>
              </div>
            </div>

            <p className="mt-8 text-center text-xs text-slate-400">
              Última actualización: {FECHA_ACTUALIZACION} · LuminaMedic Sistema
              de Gestión Clínica
            </p>
          </article>

          {/* Sidebar informativo */}
          <aside className="hidden lg:block">
            <div className="sticky top-28 space-y-5">
              <div className="rounded-[1.5rem] border border-white/80 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.07)]">
                <p className="mb-4 text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                  Índice
                </p>

                <nav className="space-y-2">
                  {quickLinks.map((item) => (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      className="block rounded-xl px-3 py-2 text-xs font-bold text-slate-500 transition hover:bg-[#00CCA5]/10 hover:text-[#008f78]"
                    >
                      {item.label}
                    </a>
                  ))}
                </nav>
              </div>

              {summaryCards.map((card) => {
                const Icon = card.icon

                return (
                  <div
                    key={card.title}
                    className="rounded-[1.5rem] border border-white/80 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.07)]"
                  >
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#00CCA5]/10">
                      <Icon size={22} className="text-[#008f78]" />
                    </div>

                    <p className="text-sm font-black text-slate-900">
                      {card.title}
                    </p>

                    <p className="mt-2 text-xs leading-5 text-slate-500">
                      {card.text}
                    </p>
                  </div>
                )
              })}

              <div className="rounded-[1.5rem] border border-[#000089]/10 bg-[#000089]/5 p-5">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-white">
                  <HeartPulse size={22} className="text-[#000089]" />
                </div>

                <p className="text-sm font-black text-[#000089]">
                  LuminaMedic
                </p>

                <p className="mt-2 text-xs leading-5 text-slate-600">
                  Claridad, confianza y acompañamiento también en el tratamiento
                  responsable de la información.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  )
}