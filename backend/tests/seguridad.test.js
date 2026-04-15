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

const crearUsuarioRol = async (email, role) => {
  const password = await bcrypt.hash('Test1234!', 10)
  const usuario = await prisma.usuario.create({
    data: { nombre: 'Test', apellido: role, email, password, role, activo: true }
  })
  if (role === 'PACIENTE') {
    await prisma.paciente.create({
      data: { usuarioId: usuario.id, numeroDocumento: `SEC${Date.now()}${Math.random()}`, tipoDocumento: 'DNI' }
    })
  }
  if (role === 'DOCTOR') {
    const clinica = await prisma.clinica.findFirst()
    await prisma.doctor.create({
      data: {
        usuarioId: usuario.id, especialidad: 'Test', clinicaId: clinica.id,
        numeroDocumento: `SECDOC${Date.now()}${Math.random()}`, tipoDocumento: 'DNI'
      }
    })
  }
  return { usuario, token: crearToken(usuario) }
}

const limpiarUsuario = async (usuario) => {
  await prisma.log.deleteMany({ where: { usuarioId: usuario.id } })
  await prisma.notificacion.deleteMany({ 
    where: { OR: [{ pacienteId: usuario.pacienteId }, { doctorId: usuario.doctorId }] }
  })
  if (usuario.role === 'PACIENTE') {
    const p = await prisma.paciente.findUnique({ where: { usuarioId: usuario.id } })
    if (p) {
      await prisma.notificacion.deleteMany({ where: { pacienteId: p.id } })
      await prisma.paciente.delete({ where: { id: p.id } })
    }
  }
  if (usuario.role === 'DOCTOR') {
    const d = await prisma.doctor.findUnique({ where: { usuarioId: usuario.id } })
    if (d) {
      await prisma.notificacion.deleteMany({ where: { doctorId: d.id } })
      await prisma.doctor.delete({ where: { id: d.id } })
    }
  }
  await prisma.log.deleteMany({ where: { usuarioId: usuario.id } })
  await prisma.usuario.delete({ where: { id: usuario.id } })
}

// ─── Tests ────────────────────────────────────────────
describe('Seguridad — acceso entre roles', () => {
  let paciente, doctor
  const ts = Date.now()

  beforeAll(async () => {
    paciente = await crearUsuarioRol(`sec_pac_${ts}@test.com`, 'PACIENTE')
    doctor   = await crearUsuarioRol(`sec_doc_${ts}@test.com`, 'DOCTOR')
  })

  afterAll(async () => {
    await limpiarUsuario(paciente.usuario)
    await limpiarUsuario(doctor.usuario)
  })

  // ── Sin token ────────────────────────────────────────
  it('request sin token es rechazado → 401', async () => {
    const res = await request(app).get('/api/citas')
    expect(res.status).toBe(401)
  })

  // ── Paciente no accede a rutas de admin ──────────────
  it('paciente puede ver doctores activos para agendar → 200', async () => {
    const res = await request(app)
      .get('/api/doctores')
      .set('Authorization', `Bearer ${paciente.token}`)
    expect(res.status).toBe(200)
  })

  it('paciente no puede ver logs → 403', async () => {
    const res = await request(app)
      .get('/api/logs')
      .set('Authorization', `Bearer ${paciente.token}`)
    expect(res.status).toBe(403)
  })

  it('paciente no puede registrar un pago → 403', async () => {
    const res = await request(app)
      .post('/api/pagos')
      .set('Authorization', `Bearer ${paciente.token}`)
      .send({ citaId: 1, monto: 100, metodo: 'efectivo' })
    expect(res.status).toBe(403)
  })

  it('paciente no puede crear un doctor → 403', async () => {
    const res = await request(app)
      .post('/api/doctores')
      .set('Authorization', `Bearer ${paciente.token}`)
      .send({ nombre: 'Fake', apellido: 'Doctor', email: 'fake@test.com', password: 'Test1234!' })
    expect(res.status).toBe(403)
  })

  // ── Doctor no accede a rutas de admin ───────────────
  it('doctor no puede ver logs → 403', async () => {
    const res = await request(app)
      .get('/api/logs')
      .set('Authorization', `Bearer ${doctor.token}`)
    expect(res.status).toBe(403)
  })

  it('doctor no puede registrar un pago → 403', async () => {
    const res = await request(app)
      .post('/api/pagos')
      .set('Authorization', `Bearer ${doctor.token}`)
      .send({ citaId: 1, monto: 100, metodo: 'efectivo' })
    expect(res.status).toBe(403)
  })

  it('doctor no puede crear otro doctor → 403', async () => {
    const res = await request(app)
      .post('/api/doctores')
      .set('Authorization', `Bearer ${doctor.token}`)
      .send({ nombre: 'Fake', apellido: 'Doctor', email: 'fake2@test.com', password: 'Test1234!' })
    expect(res.status).toBe(403)
  })

  // ── Usuario inactivo con token válido ────────────────
  it('token válido de usuario inactivo es rechazado → 403', async () => {
    const ts2 = Date.now()
    const { usuario, token } = await crearUsuarioRol(`inactivo_${ts2}@test.com`, 'PACIENTE')

    // Desactivar el usuario
    await prisma.usuario.update({ where: { id: usuario.id }, data: { activo: false } })

    const res = await request(app)
      .get('/api/citas')
      .set('Authorization', `Bearer ${token}`)

    expect([401, 403]).toContain(res.status)

    await limpiarUsuario({ ...usuario, activo: false })
  })
})