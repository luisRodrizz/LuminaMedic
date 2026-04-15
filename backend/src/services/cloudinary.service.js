const cloudinary = require('cloudinary').v2
const { CloudinaryStorage } = require('multer-storage-cloudinary')
const multer = require('multer')

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

// Storage para logos de clínica
const storageClinica = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'clinica/logo',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 400, height: 400, crop: 'limit' }]
  }
})

// Storage para fotos de doctores
const storageDoctor = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'clinica/doctores',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }]
  }
})

// Storage para fotos de pacientes
const storagePaciente = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'clinica/pacientes',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }]
  }
})

const uploadClinica  = multer({ storage: storageClinica })
const uploadDoctor   = multer({ storage: storageDoctor })
const uploadPaciente = multer({ storage: storagePaciente })

module.exports = { cloudinary, uploadClinica, uploadDoctor, uploadPaciente }