const request = require('supertest')
const app = require('../src/index')
const prisma = require('../src/prisma/client')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

// ─── Helpers ──────────────────────────────────────────
const crearToken = (usuario) =>
  jwt.sign(
    { id: usuario.id, email: usuario.email, role: usuario.role },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  )

const crearPacienteCompleto = async (email) => {
  const password = await bcrypt.hash('Test1234!', 10)
  const usuario = await prisma.usuario.create({
    data: { nombre: 'Paciente', apellido: 'Test', email, password, role: 'PACIENTE', activo: true }
  })
  const paciente = await prisma.paciente.create({
    data: { usuarioId: usuario.id, numeroDocumento: `DOC${Date.now()}${Math.random()}`, tipoDocumento: 'DNI' }
  })
  return { usuario, paciente, token: crearToken(usuario) }
}

const crearDoctorCompleto = async (email) => {
  const password = await bcrypt.hash('Test1234!', 10)
  const clinica = await prisma.clinica.findFirst()
  const usuario = await prisma.usuario.create({
    data: { nombre: 'Doctor', apellido: 'Test', email, password, role: 'DOCTOR', activo: true }
  })
  const doctor = await prisma.doctor.create({
    data: {
      usuarioId: usuario.id,
      especialidad: 'Test',
      clinicaId: clinica.id,
      numeroDocumento: `DOCDOC${Date.now()}${Math.random()}`,
      tipoDocumento: 'DNI'
    }
  })
  return { usuario, doctor, token: crearToken(usuario) }
}

const crearServicio = async () => {
  const clinica = await prisma.clinica.findFirst()
  return prisma.servicio.create({
    data: { nombre: `Servicio Test ${Date.now()}`, precio: 50, duracion: 30, clinicaId: clinica.id, activo: true }
  })
}

let horaOffset = 0
const crearCita = async (pacienteId, doctorId, servicioId, estado = 'CONFIRMADA') => {
  const fecha = new Date()
  fecha.setDate(fecha.getDate() + 1)
  fecha.setHours(10 + horaOffset, 0, 0, 0)
  horaOffset++
  return prisma.cita.create({
    data: { fecha, estado, motivo: 'Test', pacienteId, doctorId, servicioId }
  })
}

// ─── Tests ────────────────────────────────────────────
describe('Citas — ownership y seguridad', () => {
  let paciente1, paciente2, doctor1, servicio, citaPaciente1

  beforeAll(async () => {
    const ts = Date.now()
    paciente1 = await crearPacienteCompleto(`paciente1_${ts}@test.com`)
    paciente2 = await crearPacienteCompleto(`paciente2_${ts}@test.com`)
    doctor1   = await crearDoctorCompleto(`doctor1_${ts}@test.com`)
    servicio  = await crearServicio()
    citaPaciente1 = await crearCita(paciente1.paciente.id, doctor1.doctor.id, servicio.id)
  })

  afterAll(async () => {
    await prisma.cita.deleteMany({ where: { servicioId: servicio.id } })
    await prisma.servicio.delete({ where: { id: servicio.id } })
    for (const p of [paciente1, paciente2]) {
      await prisma.log.deleteMany({ where: { usuarioId: p.usuario.id } })
      await prisma.notificacion.deleteMany({ where: { pacienteId: p.paciente.id } })
      await prisma.paciente.delete({ where: { id: p.paciente.id } })
      await prisma.usuario.delete({ where: { id: p.usuario.id } })
    }
    await prisma.log.deleteMany({ where: { usuarioId: doctor1.usuario.id } })
    await prisma.notificacion.deleteMany({ where: { doctorId: doctor1.doctor.id } })
    await prisma.doctor.delete({ where: { id: doctor1.doctor.id } })
    await prisma.usuario.delete({ where: { id: doctor1.usuario.id } })
  })

  it('paciente no puede ver cita ajena → 403', async () => {
    const res = await request(app)
      .get(`/api/citas/${citaPaciente1.id}`)
      .set('Authorization', `Bearer ${paciente2.token}`)

    expect(res.status).toBe(403)
  })

  it('paciente puede ver su propia cita → 200', async () => {
    const res = await request(app)
      .get(`/api/citas/${citaPaciente1.id}`)
      .set('Authorization', `Bearer ${paciente1.token}`)

    expect(res.status).toBe(200)
    expect(res.body.id).toBe(citaPaciente1.id)
  })

  it('doctor no puede cambiar estado de cita ajena → 403', async () => {
    const ts = Date.now()
    const doctor2 = await crearDoctorCompleto(`doctor2_${ts}@test.com`)

    const res = await request(app)
      .patch(`/api/citas/${citaPaciente1.id}/estado`)
      .set('Authorization', `Bearer ${doctor2.token}`)
      .send({ estado: 'COMPLETADA' })

    expect(res.status).toBe(403)

    await prisma.doctor.delete({ where: { id: doctor2.doctor.id } })
    await prisma.usuario.delete({ where: { id: doctor2.usuario.id } })
  })
})

describe('Citas — cancelación', () => {
  let paciente, doctor, servicio

  beforeAll(async () => {
    const ts = Date.now()
    paciente = await crearPacienteCompleto(`pac_cancel_${ts}@test.com`)
    doctor   = await crearDoctorCompleto(`doc_cancel_${ts}@test.com`)
    servicio = await crearServicio()
  })

  afterAll(async () => {
    await prisma.cita.deleteMany({ where: { servicioId: servicio.id } })
    await prisma.servicio.delete({ where: { id: servicio.id } })
    await prisma.log.deleteMany({ where: { usuarioId: paciente.usuario.id } })
    await prisma.notificacion.deleteMany({ where: { pacienteId: paciente.paciente.id } })
    await prisma.paciente.delete({ where: { id: paciente.paciente.id } })
    await prisma.usuario.delete({ where: { id: paciente.usuario.id } })
    await prisma.log.deleteMany({ where: { usuarioId: doctor.usuario.id } })
    await prisma.notificacion.deleteMany({ where: { doctorId: doctor.doctor.id } })
    await prisma.doctor.delete({ where: { id: doctor.doctor.id } })
    await prisma.usuario.delete({ where: { id: doctor.usuario.id } })
  })

  it('paciente puede cancelar cita CONFIRMADA → 200', async () => {
    const cita = await crearCita(paciente.paciente.id, doctor.doctor.id, servicio.id, 'CONFIRMADA')

    const res = await request(app)
      .patch(`/api/citas/${cita.id}/cancelar`)
      .set('Authorization', `Bearer ${paciente.token}`)

    expect(res.status).toBe(200)
  })

  it('paciente puede cancelar cita PENDIENTE → 200', async () => {
    const cita = await crearCita(paciente.paciente.id, doctor.doctor.id, servicio.id, 'PENDIENTE')

    const res = await request(app)
      .patch(`/api/citas/${cita.id}/cancelar`)
      .set('Authorization', `Bearer ${paciente.token}`)

    expect(res.status).toBe(200)
  })

  it('paciente no puede cancelar cita COMPLETADA → 400', async () => {
    const cita = await crearCita(paciente.paciente.id, doctor.doctor.id, servicio.id, 'COMPLETADA')

    const res = await request(app)
      .patch(`/api/citas/${cita.id}/cancelar`)
      .set('Authorization', `Bearer ${paciente.token}`)

    expect(res.status).toBe(400)
  })

  it('paciente no puede cancelar cita ya CANCELADA → 400', async () => {
    const cita = await crearCita(paciente.paciente.id, doctor.doctor.id, servicio.id, 'CANCELADA')

    const res = await request(app)
      .patch(`/api/citas/${cita.id}/cancelar`)
      .set('Authorization', `Bearer ${paciente.token}`)

    expect(res.status).toBe(400)
  })
})