// ─── seed.js — Datos demo Clínica Lúmina ─────────────────────────────────────
// Ubicación: backend/prisma/seed.js
// Ejecutar: node prisma/seed.js
//
// ADVERTENCIA: Este script LIMPIA toda la BD antes de insertar.
// Solo usar en entorno de demo — NUNCA en producción con datos reales.
// ─────────────────────────────────────────────────────────────────────────────

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

// ─── Helpers ──────────────────────────────────────────
const hash = (pwd) => bcrypt.hashSync(pwd, 10)

// Genera una fecha futura o pasada desde hoy
const fechaDesde = (dias, hora, minutos = 0) => {
  const d = new Date()
  d.setDate(d.getDate() + dias)
  d.setHours(hora, minutos, 0, 0)
  return d
}

// ─────────────────────────────────────────────────────
async function main() {
  console.log('🗑️  Limpiando base de datos...')

  // Limpiar en orden correcto (FK constraints)
  await prisma.notificacion.deleteMany()
  await prisma.log.deleteMany()
  await prisma.tokenRecuperacion.deleteMany()
  await prisma.notaClinica.deleteMany()
  await prisma.pago.deleteMany()
  await prisma.cita.deleteMany()
  await prisma.bloqueoHorario.deleteMany()
  await prisma.horario.deleteMany()
  await prisma.servicio.deleteMany()
  await prisma.doctor.deleteMany()
  await prisma.paciente.deleteMany()
  await prisma.clinica.deleteMany()
  await prisma.usuario.deleteMany()

  console.log('✅ BD limpia')

  // ══════════════════════════════════════════════════
  // 1. CLÍNICA
  // ══════════════════════════════════════════════════
  console.log('🏥 Creando clínica...')

  const clinica = await prisma.clinica.create({
    data: {
      nombre:    'Clínica Lúmina',
      direccion: 'Av. Javier Prado Este 1234, San Isidro, Lima',
      telefono:  '(01) 612-3456',
      email:     'contacto@clinicalumina.pe',
    }
  })

  // ══════════════════════════════════════════════════
  // 2. SERVICIOS
  // ══════════════════════════════════════════════════
  console.log('🩺 Creando servicios...')

  const [
    svcConsulta, svcControl, svcEcografia, svcDerma,
    svcPsico, svcPediatria, svcCardiologia, svcNutricion
  ] = await Promise.all([
    prisma.servicio.create({ data: { nombre: 'Consulta General',         precio: 80,  duracion: 30, clinicaId: clinica.id } }),
    prisma.servicio.create({ data: { nombre: 'Control y Seguimiento',    precio: 60,  duracion: 20, clinicaId: clinica.id } }),
    prisma.servicio.create({ data: { nombre: 'Ecografía Abdominal',      precio: 150, duracion: 45, clinicaId: clinica.id } }),
    prisma.servicio.create({ data: { nombre: 'Consulta Dermatológica',   precio: 100, duracion: 30, clinicaId: clinica.id } }),
    prisma.servicio.create({ data: { nombre: 'Sesión de Psicología',     precio: 120, duracion: 60, clinicaId: clinica.id } }),
    prisma.servicio.create({ data: { nombre: 'Consulta Pediátrica',      precio: 90,  duracion: 30, clinicaId: clinica.id } }),
    prisma.servicio.create({ data: { nombre: 'Evaluación Cardiológica',  precio: 180, duracion: 60, clinicaId: clinica.id } }),
    prisma.servicio.create({ data: { nombre: 'Consulta Nutricional',     precio: 85,  duracion: 45, clinicaId: clinica.id } }),
  ])

  // ══════════════════════════════════════════════════
  // 3. ADMIN
  // ══════════════════════════════════════════════════
  console.log('👤 Creando administrador...')

  await prisma.usuario.create({
    data: {
      nombre:   'Carlos',
      apellido: 'Mendoza',
      email:    'admin@clinicalumina.pe',
      password: hash('Admin2025!'),
      telefono: '987654321',
      role:     'ADMIN',
      activo:   true,
    }
  })

  // ══════════════════════════════════════════════════
  // 4. DOCTORES
  // ══════════════════════════════════════════════════
  console.log('👨‍⚕️ Creando doctores...')

  const doctoresData = [
    {
      usuario: { nombre: 'Roberto',  apellido: 'García Ríos',    email: 'rgarcia@clinicalumina.pe',   telefono: '956781234', password: hash('Doctor2025!') },
      doctor:  { especialidad: 'Medicina General',    descripcion: 'Médico con más de 12 años de experiencia en atención primaria y medicina preventiva.', numeroDocumento: '42156789', validacionReniec: 'VALIDADO' },
      horarios: [
        { diaSemana: 0, horaInicio: '08:00', horaFin: '13:00' }, // Lunes
        { diaSemana: 1, horaInicio: '08:00', horaFin: '13:00' }, // Martes
        { diaSemana: 2, horaInicio: '08:00', horaFin: '13:00' }, // Miércoles
        { diaSemana: 3, horaInicio: '08:00', horaFin: '13:00' }, // Jueves
        { diaSemana: 4, horaInicio: '08:00', horaFin: '12:00' }, // Viernes
      ]
    },
    {
      usuario: { nombre: 'María',    apellido: 'Torres Vega',    email: 'mtorres@clinicalumina.pe',   telefono: '945678912', password: hash('Doctor2025!') },
      doctor:  { especialidad: 'Dermatología',        descripcion: 'Especialista en enfermedades de la piel, tratamientos estéticos y dermatología pediátrica.', numeroDocumento: '43267890', validacionReniec: 'VALIDADO' },
      horarios: [
        { diaSemana: 0, horaInicio: '14:00', horaFin: '19:00' }, // Lunes
        { diaSemana: 2, horaInicio: '14:00', horaFin: '19:00' }, // Miércoles
        { diaSemana: 4, horaInicio: '14:00', horaFin: '18:00' }, // Viernes
      ]
    },
    {
      usuario: { nombre: 'Javier',   apellido: 'Romero Castro',  email: 'jromero@clinicalumina.pe',   telefono: '934567823', password: hash('Doctor2025!') },
      doctor:  { especialidad: 'Psicología Clínica',  descripcion: 'Psicólogo clínico con especialización en terapia cognitivo-conductual y manejo del estrés.', numeroDocumento: '44378901', validacionReniec: 'VALIDADO' },
      horarios: [
        { diaSemana: 1, horaInicio: '09:00', horaFin: '18:00' }, // Martes
        { diaSemana: 3, horaInicio: '09:00', horaFin: '18:00' }, // Jueves
        { diaSemana: 5, horaInicio: '09:00', horaFin: '13:00' }, // Sábado
      ]
    },
    {
      usuario: { nombre: 'Ana',      apellido: 'Paredes Luna',   email: 'aparedes@clinicalumina.pe',  telefono: '923456734', password: hash('Doctor2025!') },
      doctor:  { especialidad: 'Pediatría',           descripcion: 'Pediatra con subespecialidad en neonatología y desarrollo infantil. Atención cálida y personalizada.', numeroDocumento: '45489012', validacionReniec: 'VALIDADO' },
      horarios: [
        { diaSemana: 0, horaInicio: '08:00', horaFin: '17:00' }, // Lunes
        { diaSemana: 1, horaInicio: '08:00', horaFin: '17:00' }, // Martes
        { diaSemana: 3, horaInicio: '08:00', horaFin: '17:00' }, // Jueves
        { diaSemana: 5, horaInicio: '08:00', horaFin: '12:00' }, // Sábado
      ]
    },
  ]

  const doctoresCreados = []
  for (const d of doctoresData) {
    const usuario = await prisma.usuario.create({
      data: { ...d.usuario, role: 'DOCTOR', activo: true }
    })
    const doctor = await prisma.doctor.create({
      data: {
        ...d.doctor,
        usuarioId: usuario.id,
        clinicaId: clinica.id,
        tipoDocumento: 'DNI',
        fuenteNombre: 'RENIEC_API',
      }
    })
    for (const h of d.horarios) {
      await prisma.horario.create({ data: { doctorId: doctor.id, ...h, activo: true } })
    }
    doctoresCreados.push({ doctor, usuario })
  }

  const [docGeneral, docDerma, docPsico, docPediatra] = doctoresCreados

  // ══════════════════════════════════════════════════
  // 5. PACIENTES
  // ══════════════════════════════════════════════════
  console.log('🧑‍🤝‍🧑 Creando pacientes...')

  const pacientesData = [
    { nombre: 'Luis',      apellido: 'Quispe Mamani',    email: 'lquispe@gmail.com',    telefono: '987123456', dni: '71234567', fechaNac: '1990-03-15', genero: 'Masculino', direccion: 'Jr. Huallaga 234, Lima' },
    { nombre: 'Rosa',      apellido: 'Flores Ccopa',     email: 'rflores@gmail.com',    telefono: '976543210', dni: '72345678', fechaNac: '1985-07-22', genero: 'Femenino',  direccion: 'Av. Colonial 567, Breña' },
    { nombre: 'Jorge',     apellido: 'Huamán Díaz',      email: 'jhuaman@gmail.com',    telefono: '965432109', dni: '73456789', fechaNac: '1978-11-08', genero: 'Masculino', direccion: 'Calle Los Pinos 89, Surco' },
    { nombre: 'Carmen',    apellido: 'Vargas Ortiz',     email: 'cvargas@gmail.com',    telefono: '954321098', dni: '74567890', fechaNac: '1995-02-28', genero: 'Femenino',  direccion: 'Av. Arequipa 1234, Lince', alergias: 'Penicilina' },
    { nombre: 'Pedro',     apellido: 'Salinas Rojas',    email: 'psalinas@gmail.com',   telefono: '943210987', dni: '75678901', fechaNac: '1982-09-14', genero: 'Masculino', direccion: 'Jr. Camaná 456, Cercado' },
    { nombre: 'Lucía',     apellido: 'Mendoza Chávez',   email: 'lmendoza@gmail.com',   telefono: '932109876', dni: '76789012', fechaNac: '1993-05-30', genero: 'Femenino',  direccion: 'Av. Brasil 789, Pueblo Libre' },
    { nombre: 'Antonio',   apellido: 'Ramos Cárdenas',   email: 'aramos@gmail.com',     telefono: '921098765', dni: '77890123', fechaNac: '1970-12-03', genero: 'Masculino', direccion: 'Calle Tacna 321, Miraflores', alergias: 'Aspirina, mariscos' },
    { nombre: 'Patricia',  apellido: 'Gutiérrez Lara',   email: 'pgutierrez@gmail.com', telefono: '910987654', dni: '78901234', fechaNac: '1988-04-17', genero: 'Femenino',  direccion: 'Av. La Marina 654, San Miguel' },
    { nombre: 'Miguel',    apellido: 'Castillo Ponce',   email: 'mcastillo@gmail.com',  telefono: '909876543', dni: '79012345', fechaNac: '2001-08-25', genero: 'Masculino', direccion: 'Jr. Lampa 987, Lima' },
    { nombre: 'Sandra',    apellido: 'Torres Mejía',     email: 'storres@gmail.com',    telefono: '998765432', dni: '70123456', fechaNac: '1975-01-11', genero: 'Femenino',  direccion: 'Av. Universitaria 432, Los Olivos' },
    { nombre: 'Fernando',  apellido: 'López Espinoza',   email: 'flopez@gmail.com',     telefono: '987654320', dni: '41234567', fechaNac: '1965-06-19', genero: 'Masculino', direccion: 'Calle Comercio 765, San Borja', alergias: 'Látex' },
    { nombre: 'Mónica',    apellido: 'Ríos Delgado',     email: 'mrios@gmail.com',      telefono: '976543201', dni: '42345679', fechaNac: '1998-10-07', genero: 'Femenino',  direccion: 'Av. Angamos 543, Surquillo' },
    { nombre: 'Raúl',      apellido: 'Aguilar Benites',  email: 'raguilar@gmail.com',   telefono: '965432100', dni: '43456780', fechaNac: '1987-03-23', genero: 'Masculino', direccion: 'Jr. Ucayali 876, Rímac' },
    { nombre: 'Verónica',  apellido: 'Sánchez Oliva',    email: 'vsanchez@gmail.com',   telefono: '954321009', dni: '44567891', fechaNac: '1992-07-04', genero: 'Femenino',  direccion: 'Av. Túpac Amaru 234, Comas' },
    { nombre: 'Eduardo',   apellido: 'Pizarro Gamboa',   email: 'epizarro@gmail.com',   telefono: '943210998', dni: '45678902', fechaNac: '1980-11-29', genero: 'Masculino', direccion: 'Calle Porta 678, Miraflores' },
  ]

  const pacientesCreados = []
  for (const p of pacientesData) {
    const usuario = await prisma.usuario.create({
      data: {
        nombre: p.nombre, apellido: p.apellido,
        email: p.email, telefono: p.telefono,
        password: hash('Paciente2025!'),
        role: 'PACIENTE', activo: true,
      }
    })
    const paciente = await prisma.paciente.create({
      data: {
        usuarioId: usuario.id,
        tipoDocumento: 'DNI',
        numeroDocumento: p.dni,
        fuenteNombre: 'RENIEC_API',
        validacionReniec: 'VALIDADO',
        fechaNac: new Date(p.fechaNac),
        genero: p.genero,
        direccion: p.direccion,
        alergias: p.alergias || null,
        esMenor: false,
      }
    })
    pacientesCreados.push({ paciente, usuario })
  }

  // ══════════════════════════════════════════════════
  // 6. CITAS PASADAS COMPLETADAS (con nota y pago)
  // ══════════════════════════════════════════════════
  console.log('📅 Creando citas completadas...')

  const citasCompletadas = [
    // Doctor General
    { dias: -30, hora: 9,  min: 0,  docIdx: 0, pacIdx: 0,  svcIdx: 0, monto: 80,  metodo: 'efectivo',      diag: 'Faringitis aguda viral', trat: 'Reposo relativo, hidratación abundante', receta: 'Paracetamol 500mg cada 8 horas por 5 días, Vitamina C 1g/día', obs: 'Paciente con cuadro leve. Recomendado control en 7 días si persisten síntomas.' },
    { dias: -25, hora: 10, min: 0,  docIdx: 0, pacIdx: 1,  svcIdx: 1, monto: 60,  metodo: 'tarjeta',       diag: 'Hipertensión arterial controlada', trat: 'Continuar tratamiento antihipertensivo, reducir ingesta de sodio', receta: 'Losartán 50mg/día (continuar)', obs: 'PA: 130/85 mmHg. Buen control. Próximo control en 3 meses.' },
    { dias: -20, hora: 8,  min: 30, docIdx: 0, pacIdx: 2,  svcIdx: 0, monto: 80,  metodo: 'efectivo',      diag: 'Gastroenteritis aguda', trat: 'Dieta blanda, rehidratación oral', receta: 'Sales de rehidratación oral, Loperamida 2mg si persiste diarrea', obs: 'Descartar causa bacteriana. Mejoría esperada en 48-72 horas.' },
    { dias: -18, hora: 11, min: 0,  docIdx: 0, pacIdx: 3,  svcIdx: 1, monto: 60,  metodo: 'transferencia', diag: 'Cefalea tensional crónica', trat: 'Técnicas de relajación, evitar estrés', receta: 'Ibuprofeno 400mg SOS, Complejo B', obs: 'Se recomienda evaluación por neurología si no mejora con tratamiento.' },
    { dias: -15, hora: 9,  min: 30, docIdx: 0, pacIdx: 4,  svcIdx: 0, monto: 80,  metodo: 'efectivo',      diag: 'Infección urinaria baja', trat: 'Antibioticoterapia, hidratación', receta: 'Ciprofloxacino 500mg cada 12h por 7 días, Fenazopiridina 200mg cada 8h por 3 días', obs: 'Urocultivo pendiente. Control post-tratamiento.' },
    { dias: -12, hora: 8,  min: 0,  docIdx: 0, pacIdx: 5,  svcIdx: 2, monto: 150, metodo: 'tarjeta',       diag: 'Colelitiasis - litiasis vesicular múltiple', trat: 'Dieta baja en grasas, evaluación quirúrgica', receta: 'Ácido ursodesoxicólico 300mg cada 12h', obs: 'Se evidencian múltiples cálculos de hasta 8mm. Referida a cirugía general.' },
    // Doctora Dermatología
    { dias: -28, hora: 14, min: 0,  docIdx: 1, pacIdx: 6,  svcIdx: 3, monto: 100, metodo: 'efectivo',      diag: 'Dermatitis atópica moderada', trat: 'Hidratación cutánea, evitar irritantes', receta: 'Hidrocortisona 1% crema aplicar 2 veces/día, Loratadina 10mg/noche', obs: 'Zona afectada: pliegues del codo y rodilla. Control en 4 semanas.' },
    { dias: -22, hora: 15, min: 0,  docIdx: 1, pacIdx: 7,  svcIdx: 3, monto: 100, metodo: 'tarjeta',       diag: 'Acné vulgar grado III', trat: 'Limpieza facial suave, fotoprotección', receta: 'Tretinoína 0.025% noche, Clindamicina 1% gel mañana', obs: 'Respuesta esperada en 6-8 semanas. Evitar exposición solar sin protector.' },
    { dias: -16, hora: 16, min: 0,  docIdx: 1, pacIdx: 8,  svcIdx: 3, monto: 100, metodo: 'efectivo',      diag: 'Pitiriasis versicolor extensa', trat: 'Higiene adecuada, ropa de algodón', receta: 'Ketoconazol shampoo 2% aplicar en piel por 10 min diario x 3 semanas, Fluconazol 150mg semanal x 4', obs: 'Lesiones hipopigmentadas en tronco y brazos. Buena respuesta esperada.' },
    // Doctor Psicología
    { dias: -35, hora: 10, min: 0,  docIdx: 2, pacIdx: 9,  svcIdx: 4, monto: 120, metodo: 'tarjeta',       diag: 'Trastorno de ansiedad generalizada', trat: 'Terapia cognitivo-conductual, técnicas de respiración', receta: 'Sin medicación por el momento. Seguimiento semanal.', obs: 'Primera sesión de evaluación. Se establece plan terapéutico a 12 sesiones.' },
    { dias: -28, hora: 11, min: 0,  docIdx: 2, pacIdx: 9,  svcIdx: 4, monto: 120, metodo: 'tarjeta',       diag: 'Trastorno de ansiedad generalizada - seguimiento', trat: 'Técnicas de reestructuración cognitiva', receta: 'Continuar práctica de mindfulness 10 min/día', obs: 'Segunda sesión. Paciente reporta leve mejoría. Adherencia al tratamiento buena.' },
    { dias: -21, hora: 10, min: 0,  docIdx: 2, pacIdx: 10, svcIdx: 4, monto: 120, metodo: 'efectivo',      diag: 'Episodio depresivo leve', trat: 'Activación conductual, higiene del sueño', receta: 'Derivación a psiquiatría si no mejora en 4 semanas', obs: 'Paciente con duelo reciente. Se trabaja estrategias de afrontamiento.' },
    // Doctora Pediatría
    { dias: -20, hora: 9,  min: 0,  docIdx: 3, pacIdx: 11, svcIdx: 5, monto: 90,  metodo: 'efectivo',      diag: 'Control del niño sano - 18 meses', trat: 'Vacunación al día, alimentación complementaria adecuada', receta: 'Sulfato ferroso gotas 1ml/día, Vitamina D 400 UI/día', obs: 'Peso: 11.2kg. Talla: 82cm. Desarrollo psicomotor normal para la edad.' },
    { dias: -14, hora: 10, min: 0,  docIdx: 3, pacIdx: 12, svcIdx: 5, monto: 90,  metodo: 'tarjeta',       diag: 'Bronquitis aguda leve', trat: 'Nebulizaciones con suero fisiológico, posición semisentada', receta: 'Salbutamol nebulización 0.15mg/kg cada 6h, Ambroxol jarabe 15mg/5ml', obs: 'Sin signos de dificultad respiratoria severa. Control en 48 horas.' },
    { dias: -10, hora: 8,  min: 30, docIdx: 3, pacIdx: 13, svcIdx: 5, monto: 90,  metodo: 'efectivo',      diag: 'Amigdalitis bacteriana aguda', trat: 'Antibioticoterapia, reposo, líquidos abundantes', receta: 'Amoxicilina 250mg/5ml: 1 cucharadita cada 8h por 10 días, Paracetamol 160mg/5ml SOS fiebre', obs: 'Exudado amigdalino presente. Test strep rápido positivo.' },
  ]

  const citasCompletadasCreadas = []
  for (const c of citasCompletadas) {
    const fecha = fechaDesde(c.dias, c.hora, c.min)
    const cita = await prisma.cita.create({
      data: {
        fecha,
        estado: 'COMPLETADA',
        motivo: 'Consulta médica',
        doctorId:   doctoresCreados[c.docIdx].doctor.id,
        pacienteId: pacientesCreados[c.pacIdx].paciente.id,
        servicioId: [svcConsulta, svcControl, svcEcografia, svcDerma, svcPsico, svcPediatria, svcCardiologia, svcNutricion][c.svcIdx].id,
        recordatorioEnviado: true,
      }
    })
    await prisma.notaClinica.create({
      data: {
        citaId:      cita.id,
        diagnostico: c.diag,
        tratamiento: c.trat,
        receta:      c.receta,
        observacion: c.obs,
      }
    })
    await prisma.pago.create({
      data: {
        citaId: cita.id,
        monto:  c.monto,
        metodo: c.metodo,
      }
    })
    citasCompletadasCreadas.push(cita)
  }

  // ══════════════════════════════════════════════════
  // 7. CITAS CONFIRMADAS (próximas)
  // ══════════════════════════════════════════════════
  console.log('📅 Creando citas confirmadas...')

  const citasConfirmadas = [
    { dias: 1,  hora: 9,  min: 0,  docIdx: 0, pacIdx: 0,  svcIdx: 1, motivo: 'Control post-tratamiento faringitis' },
    { dias: 1,  hora: 10, min: 0,  docIdx: 0, pacIdx: 6,  svcIdx: 0, motivo: 'Malestar general, fiebre' },
    { dias: 1,  hora: 14, min: 0,  docIdx: 1, pacIdx: 7,  svcIdx: 3, motivo: 'Control acné - 4 semanas' },
    { dias: 2,  hora: 9,  min: 0,  docIdx: 3, pacIdx: 11, svcIdx: 5, motivo: 'Control bronquitis' },
    { dias: 2,  hora: 10, min: 0,  docIdx: 2, pacIdx: 9,  svcIdx: 4, motivo: 'Sesión 3 - terapia ansiedad' },
    { dias: 2,  hora: 11, min: 0,  docIdx: 0, pacIdx: 2,  svcIdx: 0, motivo: 'Dolor abdominal recurrente' },
    { dias: 3,  hora: 9,  min: 30, docIdx: 0, pacIdx: 3,  svcIdx: 2, motivo: 'Ecografía de control' },
    { dias: 3,  hora: 14, min: 0,  docIdx: 1, pacIdx: 4,  svcIdx: 3, motivo: 'Manchas en la piel' },
    { dias: 4,  hora: 8,  min: 0,  docIdx: 3, pacIdx: 12, svcIdx: 5, motivo: 'Consulta pediátrica rutina' },
    { dias: 4,  hora: 10, min: 0,  docIdx: 0, pacIdx: 5,  svcIdx: 0, motivo: 'Revisión general anual' },
    { dias: 5,  hora: 9,  min: 0,  docIdx: 2, pacIdx: 10, svcIdx: 4, motivo: 'Sesión 2 - episodio depresivo' },
    { dias: 5,  hora: 15, min: 0,  docIdx: 1, pacIdx: 8,  svcIdx: 3, motivo: 'Control pitiriasis' },
    { dias: 7,  hora: 10, min: 0,  docIdx: 0, pacIdx: 7,  svcIdx: 0, motivo: 'Dolor de cabeza frecuente' },
    { dias: 7,  hora: 14, min: 0,  docIdx: 1, pacIdx: 13, svcIdx: 3, motivo: 'Evaluación dermatológica por primera vez' },
    { dias: 8,  hora: 9,  min: 0,  docIdx: 3, pacIdx: 14, svcIdx: 5, motivo: 'Niño 5 años - tos persistente' },
    { dias: 10, hora: 11, min: 0,  docIdx: 0, pacIdx: 1,  svcIdx: 1, motivo: 'Control hipertensión trimestral' },
    { dias: 10, hora: 10, min: 0,  docIdx: 2, pacIdx: 9,  svcIdx: 4, motivo: 'Sesión 4 - terapia ansiedad' },
    { dias: 12, hora: 9,  min: 0,  docIdx: 0, pacIdx: 4,  svcIdx: 0, motivo: 'Síntomas respiratorios' },
    { dias: 14, hora: 14, min: 0,  docIdx: 1, pacIdx: 6,  svcIdx: 3, motivo: 'Dermatitis - control 4 semanas' },
    { dias: 15, hora: 9,  min: 0,  docIdx: 3, pacIdx: 11, svcIdx: 5, motivo: 'Control niño sano - 19 meses' },
  ]

  for (const c of citasConfirmadas) {
    const fecha = fechaDesde(c.dias, c.hora, c.min)
    await prisma.cita.create({
      data: {
        fecha,
        estado: 'CONFIRMADA',
        motivo: c.motivo,
        doctorId:   doctoresCreados[c.docIdx].doctor.id,
        pacienteId: pacientesCreados[c.pacIdx].paciente.id,
        servicioId: [svcConsulta, svcControl, svcEcografia, svcDerma, svcPsico, svcPediatria, svcCardiologia, svcNutricion][c.svcIdx].id,
        recordatorioEnviado: false,
      }
    })
  }

  // ══════════════════════════════════════════════════
  // 8. CITAS PENDIENTES
  // ══════════════════════════════════════════════════
  console.log('📅 Creando citas pendientes...')

  const citasPendientes = [
    { dias: 6,  hora: 9,  min: 0,  docIdx: 0, pacIdx: 9,  svcIdx: 0, motivo: 'Chequeo general' },
    { dias: 9,  hora: 15, min: 0,  docIdx: 1, pacIdx: 5,  svcIdx: 3, motivo: 'Lunares - evaluación' },
    { dias: 11, hora: 9,  min: 0,  docIdx: 2, pacIdx: 14, svcIdx: 4, motivo: 'Evaluación psicológica inicial' },
    { dias: 13, hora: 8,  min: 0,  docIdx: 3, pacIdx: 13, svcIdx: 5, motivo: 'Vacunas pendientes' },
    { dias: 16, hora: 10, min: 0,  docIdx: 0, pacIdx: 10, svcIdx: 2, motivo: 'Ecografía abdominal preventiva' },
  ]

  for (const c of citasPendientes) {
    const fecha = fechaDesde(c.dias, c.hora, c.min)
    await prisma.cita.create({
      data: {
        fecha,
        estado: 'PENDIENTE',
        motivo: c.motivo,
        doctorId:   doctoresCreados[c.docIdx].doctor.id,
        pacienteId: pacientesCreados[c.pacIdx].paciente.id,
        servicioId: [svcConsulta, svcControl, svcEcografia, svcDerma, svcPsico, svcPediatria, svcCardiologia, svcNutricion][c.svcIdx].id,
        recordatorioEnviado: false,
      }
    })
  }

  // ══════════════════════════════════════════════════
  // 9. CITAS CANCELADAS (historial)
  // ══════════════════════════════════════════════════
  console.log('📅 Creando citas canceladas...')

  const citasCanceladas = [
    { dias: -8,  hora: 10, min: 0,  docIdx: 0, pacIdx: 7,  svcIdx: 0, motivo: 'Consulta general' },
    { dias: -5,  hora: 14, min: 0,  docIdx: 1, pacIdx: 2,  svcIdx: 3, motivo: 'Revisión piel' },
    { dias: -3,  hora: 9,  min: 0,  docIdx: 2, pacIdx: 11, svcIdx: 4, motivo: 'Primera sesión psicología' },
  ]

  for (const c of citasCanceladas) {
    const fecha = fechaDesde(c.dias, c.hora, c.min)
    await prisma.cita.create({
      data: {
        fecha,
        estado: 'CANCELADA',
        motivo: c.motivo,
        doctorId:   doctoresCreados[c.docIdx].doctor.id,
        pacienteId: pacientesCreados[c.pacIdx].paciente.id,
        servicioId: [svcConsulta, svcControl, svcEcografia, svcDerma, svcPsico, svcPediatria, svcCardiologia, svcNutricion][c.svcIdx].id,
        recordatorioEnviado: false,
      }
    })
  }

  // ══════════════════════════════════════════════════
  // 10. NOTIFICACIONES
  // ══════════════════════════════════════════════════
  console.log('🔔 Creando notificaciones...')

  // Notificaciones para doctores
  for (const { doctor } of doctoresCreados) {
    await prisma.notificacion.create({
      data: {
        doctorId: doctor.id,
        titulo:   'Bienvenido a Clínica Lúmina',
        mensaje:  'Tu cuenta ha sido configurada. Ya puedes revisar tu agenda y gestionar tus citas desde este panel.',
        tipo:     'SISTEMA',
        leida:    true,
      }
    })
  }

  // Notificaciones para pacientes
  for (const { paciente } of pacientesCreados.slice(0, 5)) {
    await prisma.notificacion.create({
      data: {
        pacienteId: paciente.id,
        titulo:     'Tienes una cita próximamente',
        mensaje:    'Recuerda llegar 10 minutos antes de tu cita. Ante cualquier inconveniente, comunícate con la clínica.',
        tipo:       'RECORDATORIO',
        leida:      false,
      }
    })
  }

  // ══════════════════════════════════════════════════
  // 11. LOGS
  // ══════════════════════════════════════════════════
  console.log('📋 Creando logs...')

  const adminUser = await prisma.usuario.findFirst({ where: { role: 'ADMIN' } })

  const logsData = [
    { accion: 'LOGIN',           detalle: 'Inicio de sesión exitoso' },
    { accion: 'CREAR_DOCTOR',    detalle: 'Doctor Roberto García creado' },
    { accion: 'CREAR_DOCTOR',    detalle: 'Doctor María Torres creada' },
    { accion: 'CREAR_DOCTOR',    detalle: 'Doctor Javier Romero creado' },
    { accion: 'CREAR_DOCTOR',    detalle: 'Doctor Ana Paredes creada' },
    { accion: 'CREAR_SERVICIO',  detalle: 'Servicio: Consulta General creado' },
    { accion: 'CREAR_PACIENTE',  detalle: 'Paciente Luis Quispe registrado' },
    { accion: 'CREAR_CITA',      detalle: 'Cita agendada para paciente Luis Quispe' },
    { accion: 'REGISTRAR_PAGO',  detalle: 'Pago S/ 80 registrado - efectivo' },
    { accion: 'LOGIN',           detalle: 'Inicio de sesión exitoso' },
    { accion: 'ACTUALIZAR_CLINICA', detalle: 'Perfil de clínica actualizado' },
  ]

  for (const log of logsData) {
    await prisma.log.create({
      data: { usuarioId: adminUser.id, accion: log.accion, detalle: log.detalle }
    })
  }

  // ══════════════════════════════════════════════════
  // RESUMEN FINAL
  // ══════════════════════════════════════════════════
  const totales = {
    clinica:    await prisma.clinica.count(),
    servicios:  await prisma.servicio.count(),
    usuarios:   await prisma.usuario.count(),
    doctores:   await prisma.doctor.count(),
    pacientes:  await prisma.paciente.count(),
    horarios:   await prisma.horario.count(),
    citas:      await prisma.cita.count(),
    notas:      await prisma.notaClinica.count(),
    pagos:      await prisma.pago.count(),
    notifs:     await prisma.notificacion.count(),
    logs:       await prisma.log.count(),
  }

  console.log('\n✅ SEED COMPLETADO — Clínica Lúmina')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`🏥 Clínicas:        ${totales.clinica}`)
  console.log(`🩺 Servicios:       ${totales.servicios}`)
  console.log(`👤 Usuarios totales:${totales.usuarios}  (1 admin + ${totales.doctores} doctores + ${totales.pacientes} pacientes)`)
  console.log(`📅 Citas:           ${totales.citas}  (completadas + confirmadas + pendientes + canceladas)`)
  console.log(`📝 Notas clínicas:  ${totales.notas}`)
  console.log(`💰 Pagos:           ${totales.pagos}`)
  console.log(`🔔 Notificaciones:  ${totales.notifs}`)
  console.log(`📋 Logs:            ${totales.logs}`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('\n🔑 CREDENCIALES DE ACCESO:')
  console.log('  Admin:    admin@clinicalumina.pe  /  Admin2025!')
  console.log('  Doctor 1: rgarcia@clinicalumina.pe  /  Doctor2025!  (Medicina General)')
  console.log('  Doctor 2: mtorres@clinicalumina.pe  /  Doctor2025!  (Dermatología)')
  console.log('  Doctor 3: jromero@clinicalumina.pe  /  Doctor2025!  (Psicología)')
  console.log('  Doctor 4: aparedes@clinicalumina.pe /  Doctor2025!  (Pediatría)')
  console.log('  Paciente: lquispe@gmail.com  /  Paciente2025!')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
}

main()
  .catch((e) => { console.error('❌ Error en seed:', e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })