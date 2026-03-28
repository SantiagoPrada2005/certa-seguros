'use client';

import React, { useState } from 'react';
import { Mail, Phone, MapPin, CheckCircle, Loader } from 'lucide-react';

type FormState = 'idle' | 'submitting' | 'success' | 'error';

interface FormErrors {
  nombre?: string;
  email?: string;
  telefono?: string;
  mensaje?: string;
}

const ContactSection = () => {
  const [formState, setFormState] = useState<FormState>('idle');
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [values, setValues] = useState({
    nombre: '',
    email: '',
    telefono: '',
    tipo: 'Vida',
    mensaje: '',
  });

  const validate = (data: typeof values): FormErrors => {
    const e: FormErrors = {};
    if (!data.nombre.trim()) e.nombre = 'Ingresa tu nombre completo.';
    if (!data.email.trim()) e.email = 'Ingresa tu correo electrónico.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) e.email = 'El correo no es válido.';
    if (!data.mensaje.trim()) e.mensaje = 'Cuéntanos cómo podemos ayudarte.';
    return e;
  };

  const handleBlur = (field: string) => {
    setTouched((t) => ({ ...t, [field]: true }));
    setErrors(validate(values));
  };

  const handleChange = (field: string, value: string) => {
    const next = { ...values, [field]: value };
    setValues(next);
    if (touched[field]) setErrors(validate(next));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate(values);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setTouched({ nombre: true, email: true, telefono: true, mensaje: true });
      return;
    }
    setFormState('submitting');
    // Simulate async submit
    await new Promise((r) => setTimeout(r, 1500));
    setFormState('success');
  };

  const inputClass = (field: keyof FormErrors) =>
    `w-full px-5 py-4 rounded-xl border text-[#041c32] bg-white text-sm font-poppins transition-all outline-none focus-visible:ring-2 focus-visible:ring-[#00A8CC] focus-visible:ring-offset-1 ${
      errors[field] && touched[field]
        ? 'border-red-400 bg-red-50'
        : 'border-gray-200 hover:border-gray-300'
    }`;

  return (
    <section className="py-24 bg-[#f8fafc] font-poppins" id="contacto">
      <div className="container mx-auto px-6">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-5xl font-black text-[#041c32] mb-4 font-montserrat uppercase tracking-tight">
            Hablemos de tu Tranquilidad
          </h2>
          <p className="text-[#0d548d] text-lg max-w-xl mx-auto font-normal">
            Estamos aquí para ayudarte a encontrar la mejor protección. Respuesta en menos de 24 horas.
          </p>
          <div className="w-24 h-1 bg-[#00A8CC] mx-auto rounded-full mt-6" />
        </div>

        <div className="max-w-6xl mx-auto bg-white rounded-[2.5rem] overflow-hidden shadow-[0_20px_60px_rgba(4,28,50,0.10)] flex flex-col lg:flex-row">
          {/* Left info panel */}
          <div className="lg:w-5/12 bg-[#041c32] p-10 lg:p-14 text-white flex flex-col justify-between">
            <div>
              <p className="text-[#00A8CC] text-xs uppercase tracking-widest font-bold mb-3">Contáctanos</p>
              <h3 className="text-2xl font-bold font-montserrat mb-6 leading-tight">
                Asesoría personalizada, sin compromiso.
              </h3>
              <p className="text-blue-200 text-sm leading-relaxed mb-10">
                Nuestros asesores certificados te guiarán paso a paso para elegir la póliza ideal para ti, tu familia o tu negocio.
              </p>

              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-[#00A8CC]" />
                  </div>
                  <div>
                    <p className="text-blue-300 text-xs mb-0.5">Llámanos</p>
                    <p className="font-semibold text-sm">+57 (601) 847-2983</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-[#00A8CC]" />
                  </div>
                  <div>
                    <p className="text-blue-300 text-xs mb-0.5">Escríbenos</p>
                    <p className="font-semibold text-sm">info@certaseguros.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-[#00A8CC]" />
                  </div>
                  <div>
                    <p className="text-blue-300 text-xs mb-0.5">Visítanos</p>
                    <p className="font-semibold text-sm">Av. El Dorado #103-29, Bogotá</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right form panel */}
          <div className="lg:w-7/12 p-10 lg:p-14">
            {formState === 'success' ? (
              <div className="h-full flex flex-col items-center justify-center text-center gap-4 py-16">
                <CheckCircle className="w-16 h-16 text-[#00A8CC]" />
                <h3 className="text-2xl font-bold text-[#041c32] font-montserrat">¡Mensaje enviado!</h3>
                <p className="text-gray-500 max-w-xs text-sm">
                  Un asesor de Certa Seguros se comunicará contigo en las próximas 24 horas.
                </p>
                <button
                  onClick={() => { setFormState('idle'); setValues({ nombre: '', email: '', telefono: '', tipo: 'Vida', mensaje: '' }); setTouched({}); setErrors({}); }}
                  className="mt-4 text-[#00A8CC] text-sm font-bold uppercase tracking-widest hover:opacity-70 transition-opacity"
                >
                  Enviar otro mensaje
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate aria-label="Formulario de contacto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                  {/* Nombre */}
                  <div className="space-y-1.5">
                    <label htmlFor="nombre" className="text-xs font-bold text-[#041c32] uppercase tracking-wider">
                      Nombre Completo <span className="text-red-500" aria-hidden="true">*</span>
                    </label>
                    <input
                      id="nombre"
                      type="text"
                      autoComplete="name"
                      placeholder="Tu nombre"
                      value={values.nombre}
                      onChange={(e) => handleChange('nombre', e.target.value)}
                      onBlur={() => handleBlur('nombre')}
                      className={inputClass('nombre')}
                      aria-required="true"
                      aria-describedby={errors.nombre && touched.nombre ? 'error-nombre' : undefined}
                    />
                    {errors.nombre && touched.nombre && (
                      <p id="error-nombre" className="text-red-500 text-xs mt-1" role="alert">{errors.nombre}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label htmlFor="email" className="text-xs font-bold text-[#041c32] uppercase tracking-wider">
                      Correo Electrónico <span className="text-red-500" aria-hidden="true">*</span>
                    </label>
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder="tu@email.com"
                      value={values.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      onBlur={() => handleBlur('email')}
                      className={inputClass('email')}
                      aria-required="true"
                      aria-describedby={errors.email && touched.email ? 'error-email' : undefined}
                    />
                    {errors.email && touched.email && (
                      <p id="error-email" className="text-red-500 text-xs mt-1" role="alert">{errors.email}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                  {/* Teléfono */}
                  <div className="space-y-1.5">
                    <label htmlFor="telefono" className="text-xs font-bold text-[#041c32] uppercase tracking-wider">
                      Teléfono
                    </label>
                    <input
                      id="telefono"
                      type="tel"
                      autoComplete="tel"
                      placeholder="+57 300 000 0000"
                      value={values.telefono}
                      onChange={(e) => handleChange('telefono', e.target.value)}
                      onBlur={() => handleBlur('telefono')}
                      className="w-full px-5 py-4 rounded-xl border border-gray-200 hover:border-gray-300 text-[#041c32] bg-white text-sm font-poppins transition-all outline-none focus-visible:ring-2 focus-visible:ring-[#00A8CC] focus-visible:ring-offset-1"
                    />
                  </div>

                  {/* Tipo de servicio */}
                  <div className="space-y-1.5">
                    <label htmlFor="tipo" className="text-xs font-bold text-[#041c32] uppercase tracking-wider">
                      Tipo de Servicio
                    </label>
                    <select
                      id="tipo"
                      value={values.tipo}
                      onChange={(e) => handleChange('tipo', e.target.value)}
                      className="w-full px-5 py-4 rounded-xl border border-gray-200 hover:border-gray-300 text-[#041c32] bg-white text-sm font-poppins transition-all outline-none focus-visible:ring-2 focus-visible:ring-[#00A8CC] focus-visible:ring-offset-1 cursor-pointer"
                    >
                      <option>Vida y Plenitud</option>
                      <option>Negocio (PYME)</option>
                      <option>Hogar Integral</option>
                      <option>Movilidad y Vehículos</option>
                      <option>Salud y ARL</option>
                      <option>Otro</option>
                    </select>
                  </div>
                </div>

                {/* Mensaje */}
                <div className="space-y-1.5 mb-8">
                  <label htmlFor="mensaje" className="text-xs font-bold text-[#041c32] uppercase tracking-wider">
                    Mensaje <span className="text-red-500" aria-hidden="true">*</span>
                  </label>
                  <textarea
                    id="mensaje"
                    rows={4}
                    placeholder="¿Cómo podemos ayudarte? Cuéntanos tu situación..."
                    value={values.mensaje}
                    onChange={(e) => handleChange('mensaje', e.target.value)}
                    onBlur={() => handleBlur('mensaje')}
                    className={`${inputClass('mensaje')} resize-none`}
                    aria-required="true"
                    aria-describedby={errors.mensaje && touched.mensaje ? 'error-mensaje' : undefined}
                  />
                  {errors.mensaje && touched.mensaje && (
                    <p id="error-mensaje" className="text-red-500 text-xs mt-1" role="alert">{errors.mensaje}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={formState === 'submitting'}
                  className="w-full bg-[#00A8CC] hover:bg-[#0092b3] disabled:opacity-60 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3 transition-all shadow-lg hover:shadow-[#00A8CC]/30 uppercase tracking-widest text-sm active:scale-[0.98]"
                >
                  {formState === 'submitting' ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    'Solicitar Asesoría Gratuita'
                  )}
                </button>

                <p className="text-gray-400 text-xs text-center mt-4">
                  Al enviar aceptas nuestra política de privacidad. Sin spam, sin compromisos.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
