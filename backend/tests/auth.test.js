const request = require('supertest')
const app = require('../src/index')
const prisma = require('../src/prisma/client')
const bcrypt = require('bcryptjs')

// ─── Helpers ──────────────────────────────────────────
const crearUsuario = async ({ email, role = 'PACIENTE', activo = true }) => {
  const password = await bcrypt.hash('Test1234!', 10)
  const usuario = await prisma.usuario.create({
    data: {
      nombre: 'Test',
      apellido: 'Usuario',
      email,
      password,
      role,
      activo
    }
  })
  if (role === 'PACIENTE') {
    await prisma.paciente.create({
      data: {
        usuarioId: usuario.id,
        numeroDocumento: `TEST${Date.now()}`,
        tipoDocumento: 'DNI'
      }
    })
  }
  return usuario
}

const limpiar = async (emails) => {
  for (const email of emails) {
    const u = await prisma.usuario.findUnique({ where: { email } })
    if (!u) continue
    if (u.role === 'PACIENTE') {
      const p = await prisma.paciente.findUnique({ where: { usuarioId: u.id } })
      if (p) await prisma.paciente.delete({ where: { id: p.id } })
    }
    await prisma.usuario.delete({ where: { id: u.id } })
  }
}

// ─── Tests ────────────────────────────────────────────
describe('Auth — registro', () => {
  const email = `test_registro_${Date.now()}@test.com`

  afterAll(async () => {
    await limpiar([email])
  })

  it('registro ignora el role del body — siempre crea PACIENTE', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        nombre: 'Test',
        apellido: 'Registro',
        email,
        password: 'Tr0ub4dor&3',
        telefono: '999999999',
        tipoDocumento: 'DNI',
        numeroDocumento: `REG${Date.now()}`,
        fechaNac: '1990-01-01',
        role: 'ADMIN' // ← intenta crear ADMIN
      })

    expect(res.status).toBe(201)

    const usuario = await prisma.usuario.findUnique({ where: { email } })
    expect(usuario.role).toBe('PACIENTE') // ← siempre PACIENTE
  })
})

describe('Auth — login', () => {
  const emailActivo   = `test_activo_${Date.now()}@test.com`
  const emailInactivo = `test_inactivo_${Date.now()}@test.com`

  beforeAll(async () => {
    await crearUsuario({ email: emailActivo,   activo: true  })
    await crearUsuario({ email: emailInactivo, activo: false })
  })

  afterAll(async () => {
    await limpiar([emailActivo, emailInactivo])
  })

  it('usuario activo puede hacer login', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: emailActivo, password: 'Test1234!' })

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('token')
  })

  it('usuario inactivo no puede hacer login → 403', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: emailInactivo, password: 'Test1234!' })

    expect(res.status).toBe(403)
    expect(res.body.message).toMatch(/desactivada/i)
  })
})