import { useState, useEffect } from 'react'
import { Building2, Upload, Mail, Phone, MapPin, CheckCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import AdminLayout from '../../../components/AdminLayout'
import api from '../../../services/api'

export default function Perfil() {
  const [clinica, setClinica] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ nombre: '', direccion: '', telefono: '', email: '' })
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

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleLogoChange = (e) => {
    const file = e.target.files[0]
    if (file) { setLogo(file); setPreview(URL.createObjectURL(file)) }
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

  if (loading) return (
    <AdminLayout>
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 text-sm">Cargando perfil...</p>
      </div>
    </AdminLayout>
  )

  const inputClass = "w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-slate-50 transition-all"

  return (
    <AdminLayout>
      <div className="page-enter">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
            <Building2 size={20} className="text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Perfil de la Clínica</h1>
            <p className="text-slate-400 text-sm mt-0.5">Información y configuración</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Logo card */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 flex flex-col items-center">
            <div className="w-28 h-28 rounded-2xl bg-slate-100 flex items-center justify-center mb-4 overflow-hidden border-2 border-slate-200">
              {preview ? (
                <img src={preview} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <Building2 size={36} className="text-slate-400" />
              )}
            </div>
            <p className="text-sm font-semibold text-slate-800 mb-0.5">{form.nombre || 'Mi Clínica'}</p>
            <p className="text-xs text-slate-400 mb-5">Logo de la clínica</p>

            <label className="flex items-center gap-2 cursor-pointer bg-blue-50 hover:bg-blue-100 text-blue-600 px-4 py-2.5 rounded-xl text-sm font-medium transition-all w-full justify-center">
              <Upload size={15} />
              Subir logo
              <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
            </label>
            <p className="text-xs text-slate-400 mt-2">JPG, PNG o WEBP · Máx 2MB</p>

            {/* Info rápida */}
            <div className="w-full mt-6 space-y-2">
              {[
                { icon: Phone,  value: form.telefono || '—' },
                { icon: Mail,   value: form.email || '—'    },
                { icon: MapPin, value: form.direccion || '—' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl">
                  <item.icon size={13} className="text-slate-400 flex-shrink-0" />
                  <span className="text-xs text-slate-500 truncate">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Formulario */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-6">
            <h2 className="text-base font-semibold text-slate-800 mb-5">Información general</h2>

            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl mb-5">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0" />{error}
                </motion.div>
              )}
              {success && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 text-emerald-600 text-sm px-4 py-3 rounded-xl mb-5">
                  <CheckCircle size={14} className="flex-shrink-0" />{success}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Nombre de la clínica</label>
                <input name="nombre" value={form.nombre} onChange={handleChange} required
                  placeholder="Clínica San Rafael" className={inputClass} />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Dirección</label>
                <input name="direccion" value={form.direccion} onChange={handleChange} required
                  placeholder="Av. Principal 123, Lima" className={inputClass} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Teléfono</label>
                  <input name="telefono" value={form.telefono} onChange={handleChange} required
                    placeholder="+51 999 999 999" className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email</label>
                  <input name="email" type="email" value={form.email} onChange={handleChange} required
                    placeholder="contacto@clinica.com" className={inputClass} />
                </div>
              </div>

              <div className="pt-2">
                <button type="submit" disabled={saving}
                  className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-all shadow-sm hover:shadow-md">
                  {saving ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Guardando...
                    </span>
                  ) : 'Guardar cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>

      </div>
    </AdminLayout>
  )
}