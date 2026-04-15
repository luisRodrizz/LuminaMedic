const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body)
  if (!result.success) {
    console.error('VALIDATE ERROR:', JSON.stringify(result.error, null, 2))
    const errors = result.error?.errors?.map(e => ({
      campo: e.path.join('.'),
      mensaje: e.message
    })) || []
    return res.status(400).json({ message: 'Datos inválidos', errors })
  }
  req.body = result.data
  next()
}

module.exports = validate