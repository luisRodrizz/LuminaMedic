import { useState, useEffect } from 'react'
import {
  Building2,
  Upload,
  Mail,
  Phone,
  MapPin,
  CheckCircle,
  ImagePlus,
  Save,
  ShieldCheck
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import AdminLayout from '../../../components/AdminLayout'
import api from '../../../services/api'

export default function Perfil() {
  const [clinica, setClinica] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    nombre: '',
    direccion: '',
    telefono: '',
    email: ''
  })
  const [logo, setLogo] = useState(null)
  const [preview, setPreview] = useState(null)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchClinica = async () => {
      try {
        const res = await api.get('/clinica')

        if (res.data) {
          setClinica(res.data)

          setForm({
            nombre: res.data.nombre || '',
            direccion: res.data.direccion || '',
            telefono: res.data.telefono || '',
            email: res.data.email || ''
          })

          if (res.data.logo) setPreview(res.data.logo)
        }
      } catch {
        console.error('Error cargando clínica')
      } finally {
        setLoading(false)
      }
    }

    fetchClinica()
  }, [])

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value })

  const handleLogoChange = (e) => {
    const file = e.target.files[0]

    if (file) {
      setLogo(file)
      setPreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const formData = new FormData()

      formData.append('nombre', form.nombre)
      formData.append('direccion', form.direccion)
      formData.append('telefono', form.telefono)
      formData.append('email', form.email)

      if (logo) formData.append('logo', logo)

      await api.put(`/clinica/${clinica.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      setSuccess('Perfil actualizado correctamente')
      setTimeout(() => setSuccess(''), 3000)
    } catch {
      setError('Error al actualizar el perfil.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex h-64 flex-col items-center justify-center gap-3">
          <div className="h-9 w-9 animate-spin rounded-full border-2 border-[#00CCA5] border-t-transparent" />
          <p className="text-sm text-slate-400">Cargando perfil...</p>
        </div>
      </AdminLayout>
    )
  }

  const inputClass =
    'w-full h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-[#00CCA5] focus:bg-white focus:ring-4 focus:ring-[#00CCA5]/15'

  return (
    <AdminLayout>
      <div className="page-enter">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-black tracking-tight text-slate-950 md:text-3xl">
            Configuración Clínica
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Administra la información institucional que se utilizará en reportes,
            documentos, correos y encabezados del sistema.
          </p>
        </div>

        <div>
          <section className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white shadow-sm">
            <div className="grid grid-cols-1 items-stretch xl:grid-cols-[360px_1fr]">
              {/* Identidad visual */}
              <aside className="flex flex-col border-b border-slate-200 p-8 xl:border-b-0 xl:border-r">
                <div className="mb-7">
                  <h2 className="text-lg font-black text-slate-950">
                    Identidad visual
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-slate-400">
                    Logo institucional visible en reportes y documentos generados.
                  </p>
                </div>

                <div className="flex flex-1 flex-col rounded-[1.75rem] border border-slate-200 bg-slate-50/60 p-6">
                  <div className="mb-5 flex justify-center">
                    <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white p-3">
                      {preview ? (
                        <img
                          src={preview}
                          alt="Logo"
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <Building2 size={38} className="text-slate-300" />
                      )}
                    </div>
                  </div>

                  <div className="mb-5 text-center">
                    <p className="text-sm font-black text-slate-900">
                      {form.nombre || 'Nombre de la clínica'}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      Vista previa del logo actual
                    </p>
                  </div>

                  <div className="mt-auto">
                    <label className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#000089] px-4 text-sm font-black text-white shadow-lg shadow-[#000089]/15 transition hover:bg-[#000070] hover:ring-4 hover:ring-[#00CCA5]/15">
                      <Upload size={16} />
                      Subir logo
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoChange}
                        className="hidden"
                      />
                    </label>

                    <p className="mt-3 text-center text-xs leading-5 text-slate-400">
                      JPG, PNG o WEBP. Recomendado: PNG transparente.
                    </p>
                  </div>
                </div>
              </aside>

              {/* Formulario */}
              <section className="flex flex-col p-8">
                <div className="mb-7">
                  <h2 className="text-lg font-black text-slate-950">
                    Información general
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-slate-400">
                    Datos principales que identifican a la clínica dentro del sistema.
                  </p>
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="mb-5 flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600"
                    >
                      <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-red-500" />
                      <span>{error}</span>
                    </motion.div>
                  )}

                  {success && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="mb-5 flex items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
                    >
                      <CheckCircle size={16} className="mt-0.5 flex-shrink-0" />
                      <span>{success}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleSubmit} className="flex flex-1 flex-col space-y-5">
                  <div>
                    <label className="mb-2 block text-xs font-black text-slate-700">
                      Nombre de la clínica
                    </label>

                    <div className="relative">
                      <Building2
                        size={17}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        name="nombre"
                        value={form.nombre}
                        onChange={handleChange}
                        required
                        placeholder="LuminaMedic"
                        className={`${inputClass} pl-11`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-black text-slate-700">
                      Dirección
                    </label>

                    <div className="relative">
                      <MapPin
                        size={17}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        name="direccion"
                        value={form.direccion}
                        onChange={handleChange}
                        required
                        placeholder="Av. Principal 123, Lima"
                        className={`${inputClass} pl-11`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-xs font-black text-slate-700">
                        Teléfono
                      </label>

                      <div className="relative">
                        <Phone
                          size={17}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                          name="telefono"
                          value={form.telefono}
                          onChange={handleChange}
                          required
                          placeholder="+51 999 999 999"
                          className={`${inputClass} pl-11`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-xs font-black text-slate-700">
                        Email
                      </label>

                      <div className="relative">
                        <Mail
                          size={17}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                          name="email"
                          type="email"
                          value={form.email}
                          onChange={handleChange}
                          required
                          placeholder="contacto@luminamedic.pe"
                          className={`${inputClass} pl-11`}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-auto pt-3">
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#000089] text-sm font-black text-white shadow-lg shadow-[#000089]/20 transition hover:bg-[#000070] hover:ring-4 hover:ring-[#00CCA5]/15 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {saving ? (
                        <>
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                          Guardando...
                        </>
                      ) : (
                        <>
                          <Save size={16} />
                          Guardar cambios
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </section>
            </div>
          </section>
        </div>
      </div>
    </AdminLayout>
  )
}