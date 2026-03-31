'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Mail, Phone, MapPin, CheckCircle, Loader, Check, ChevronDown } from 'lucide-react';
import { NeonButton } from "@/components/ui/neon-button";

type FormState = 'idle' | 'submitting' | 'success';

interface FormValues {
  nombre: string;
  cedula: string;
  email: string;
  celular: string;
  servicios: string[];
}

interface FormErrors {
  nombre?: string;
  cedula?: string;
  email?: string;
  celular?: string;
  servicios?: string[];
}

const serviceOptions = [
  { id: 'soat', label: 'SOAT (Carro y Moto)', category: 'Seguros y ARL' },
  { id: 'vehicular', label: 'Seguro Vehicular (Todo Riesgo)', category: 'Seguros y ARL' },
  { id: 'vida', label: 'Póliza de Vida', category: 'Seguros y ARL' },
  { id: 'salud', label: 'Póliza de Salud', category: 'Seguros y ARL' },
  { id: 'rc', label: 'Póliza de Responsabilidad Civil', category: 'Seguros y ARL' },
  { id: 'pyme', label: 'Seguro para Empresas (PYME)', category: 'Seguros y ARL' },
  { id: 'arl', label: 'ARL (Riesgos Laborales)', category: 'Seguros y ARL' },
  { id: 'traspasos', label: 'Traspasos de Propiedad', category: 'Asesoría y Trámites de Tránsito' },
  { id: 'traslados', label: 'Traslados de Cuenta', category: 'Asesoría y Trámites de Tránsito' },
  { id: 'impuestos', label: 'Pago de Impuestos Vehiculares', category: 'Asesoría y Trámites de Tránsito' },
  { id: 'otros', label: 'Otros trámites de tránsito', category: 'Asesoría y Trámites de Tránsito' },
];

const ContactSection = () => {
  const [formState, setFormState] = useState<FormState>('idle');
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [values, setValues] = useState<FormValues>({
    nombre: '',
    cedula: '',
    email: '',
    celular: '',
    servicios: [],
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const validate = (data: FormValues): FormErrors => {
    const e: FormErrors = {};
    if (!data.nombre.trim()) e.nombre = 'Ingresa tu nombre o razón social.';
    if (!data.cedula.trim()) e.cedula = 'Ingresa tu número de identificación.';
    if (!data.email.trim()) e.email = 'Ingresa tu correo electrónico.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) e.email = 'El correo no es válido.';
    if (!data.celular.trim()) e.celular = 'Ingresa tu número de celular.';
    if (data.servicios.length === 0) e.servicios = ['Selecciona al menos un servicio.'];
    return e;
  };

  const handleBlur = (field: string) => {
    setTouched((t) => ({ ...t, [field]: true }));
    setErrors(validate(values));
  };

  const handleChange = (field: keyof FormValues, value: any) => {
    const next = { ...values, [field]: value };
    setValues(next);
    if (touched[field]) setErrors(validate(next));
  };

  const toggleService = (id: string) => {
    const nextServicios = values.servicios.includes(id)
      ? values.servicios.filter(s => s !== id)
      : [...values.servicios, id];
    handleChange('servicios', nextServicios);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate(values);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setTouched({ nombre: true, cedula: true, email: true, celular: true, servicios: true });
      return;
    }
    setFormState('submitting');
    await new Promise((r) => setTimeout(r, 1600));
    setFormState('success');
  };

  const fieldState = (field: keyof FormErrors, value: string) => {
    const hasError = errors[field] && touched[field];
    const isValid = touched[field] && !errors[field] && value.trim().length > 0;
    if (hasError) return 'border-red-400 bg-red-50 focus-visible:ring-red-300';
    if (isValid) return 'border-green-400 bg-green-50 focus-visible:ring-green-300';
    return 'border-gray-200 hover:border-gray-300 focus-visible:ring-[#1c80a8]';
  };

  const baseInput = 'w-full px-4 py-3.5 rounded-xl border text-[#182e6b] text-sm transition-all outline-none focus-visible:ring-2 focus-visible:ring-offset-1 font-poppins';

  const FieldLabel = ({ children, required }: { children: React.ReactNode; required?: boolean }) => (
    <label className="block text-xs font-bold text-[#182e6b] uppercase tracking-wider mb-2 font-montserrat">
      {children}{required && <span className="text-red-500 ml-0.5" aria-hidden="true">*</span>}
    </label>
  );

  const ValidCheck = ({ field, value }: { field: keyof FormErrors; value: string }) =>
    touched[field] && !errors[field] && value.trim() ? (
      <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500 pointer-events-none" />
    ) : null;

  return (
    <section className="py-24 bg-[#f8fafc] font-poppins" id="contacto">
      <div className="container mx-auto px-6">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-5xl font-black text-[#182e6b] mb-4 font-montserrat uppercase tracking-tight">
            ¡Solicita tu Cotización al Instante!
          </h2>
          <p className="text-[#4977b8] text-base md:text-lg max-w-xl mx-auto font-normal leading-relaxed">
            Completa tus datos y uno de nuestros expertos se pondrá en contacto contigo para brindarte la mejor asesoría.
          </p>
          <div className="w-24 h-1 bg-[#1c80a8] mx-auto rounded-full mt-6" />
        </div>

        <div className="max-w-6xl mx-auto bg-white rounded-[2.5rem] shadow-[0_20px_60px_rgba(24,46,107,0.10)] flex flex-col lg:flex-row">
          <div className="lg:w-5/12 bg-[#182e6b] p-10 lg:p-14 text-white flex flex-col justify-between rounded-t-[2.5rem] lg:rounded-none lg:rounded-l-[2.5rem]">
            <div>
              <p className="text-[#2fabcb] text-xs uppercase tracking-widest font-bold mb-3">Contáctanos</p>
              <h3 className="text-2xl font-bold font-montserrat mb-4 leading-tight">
                Asesoría personalizada, sin compromiso.
              </h3>
              <p className="text-blue-100/80 text-sm leading-relaxed mb-10">
                Nuestros asesores certificados te guiarán paso a paso para elegir la póliza ideal para ti, tu familia o tu negocio.
              </p>

              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5 text-[#2fabcb]" />
                  </div>
                  <div>
                    <p className="text-[#2fabcb] text-xs mb-0.5 font-montserrat font-bold uppercase tracking-wider">Llámanos</p>
                    <p className="font-semibold text-sm">+57 3178837156</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5 text-[#2fabcb]" />
                  </div>
                  <div>
                    <p className="text-[#2fabcb] text-xs mb-0.5 font-montserrat font-bold uppercase tracking-wider">Escríbenos</p>
                    <p className="font-semibold text-sm">maria.zapata@asesorsura.com  mfz.asesoriasempresariales@gmail.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-[#2fabcb]" />
                  </div>
                  <div>
                    <p className="text-[#2fabcb] text-xs mb-0.5 font-montserrat font-bold uppercase tracking-wider">Visítanos</p>
                    <p className="font-semibold text-sm">Roldanillo </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:w-7/12 p-10 lg:p-14">
            {formState === 'success' ? (
              <div className="h-full flex flex-col items-center justify-center text-center gap-4 py-16">
                <CheckCircle className="w-16 h-16 text-[#1c80a8]" />
                <h3 className="text-2xl font-bold text-[#182e6b] font-montserrat">¡Cotización Solicitada!</h3>
                <p className="text-gray-500 max-w-xs text-sm leading-relaxed">
                  Un asesor de Certa Seguros se comunicará contigo en las próximas horas por WhatsApp o correo.
                </p>
                <button
                  onClick={() => {
                    setFormState('idle');
                    setValues({ nombre: '', cedula: '', email: '', celular: '', servicios: [] });
                    setTouched({});
                    setErrors({});
                  }}
                  className="mt-4 text-[#1c80a8] text-sm font-bold uppercase tracking-widest hover:opacity-70 transition-opacity"
                >
                  Nueva cotización
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                  <div>
                    <FieldLabel required>Nombre o Razón Social</FieldLabel>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Ej: Juan Pérez"
                        value={values.nombre}
                        onChange={(e) => handleChange('nombre', e.target.value)}
                        onBlur={() => handleBlur('nombre')}
                        className={`${baseInput} ${fieldState('nombre', values.nombre)}`}
                      />
                      <ValidCheck field="nombre" value={values.nombre} />
                    </div>
                    {touched.nombre && errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre}</p>}
                  </div>
                  <div>
                    <FieldLabel required>Cédula / NIT</FieldLabel>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Número de ID"
                        value={values.cedula}
                        onChange={(e) => handleChange('cedula', e.target.value)}
                        onBlur={() => handleBlur('cedula')}
                        className={`${baseInput} ${fieldState('cedula', values.cedula)}`}
                      />
                      <ValidCheck field="cedula" value={values.cedula} />
                    </div>
                    {touched.cedula && errors.cedula && <p className="text-red-500 text-xs mt-1">{errors.cedula}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                  <div>
                    <FieldLabel required>Correo Electrónico</FieldLabel>
                    <div className="relative">
                      <input
                        type="email"
                        placeholder="ejemplo@correo.com"
                        value={values.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        onBlur={() => handleBlur('email')}
                        className={`${baseInput} ${fieldState('email', values.email)}`}
                      />
                      <ValidCheck field="email" value={values.email} />
                    </div>
                    {touched.email && errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                  </div>
                  <div>
                    <FieldLabel required>Número de Celular</FieldLabel>
                    <div className="relative">
                      <input
                        type="tel"
                        placeholder="Tu celular"
                        value={values.celular}
                        onChange={(e) => handleChange('celular', e.target.value)}
                        onBlur={() => handleBlur('celular')}
                        className={`${baseInput} ${fieldState('celular', values.celular)}`}
                      />
                      <ValidCheck field="celular" value={values.celular} />
                    </div>
                    {touched.celular && errors.celular && <p className="text-red-500 text-xs mt-1">{errors.celular}</p>}
                  </div>
                </div>

                {/* Custom Multi-select Dropdown */}
                <div className="mb-10 relative" ref={dropdownRef}>
                  <FieldLabel required>Tipo de Servicio (Múltiple)</FieldLabel>
                  <button
                    type="button"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    onBlur={() => handleBlur('servicios')}
                    className={`${baseInput} text-left flex items-center justify-between ${touched.servicios && errors.servicios ? 'border-red-400 bg-red-50' : 'border-gray-200'
                      }`}
                  >
                    <span className={`truncate ${values.servicios.length === 0 ? 'text-gray-400' : 'text-[#182e6b]'}`}>
                      {values.servicios.length === 0
                        ? 'Selecciona los servicios'
                        : values.servicios.length === 1
                          ? serviceOptions.find(o => o.id === values.servicios[0])?.label
                          : `${values.servicios.length} servicios seleccionados`}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {dropdownOpen && (
                    <div className="absolute z-50 left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden max-h-[320px] overflow-y-auto anima-in fade-in slide-in-from-top-2 duration-200">
                      <div className="p-2 space-y-1">
                        {/* Categoría: Seguros y ARL */}
                        <div className="px-3 py-2 text-[10px] font-black text-[#1c80a8] uppercase tracking-[0.2em] bg-gray-50/50 rounded-lg mb-1">
                          Seguros y ARL
                        </div>
                        {serviceOptions.filter(o => o.category === 'Seguros y ARL').map((option) => (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() => toggleService(option.id)}
                            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-[#f8fafc] transition-colors group"
                          >
                            <span className="text-sm font-medium text-[#182e6b]">{option.label}</span>
                            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${values.servicios.includes(option.id)
                              ? 'bg-[#1c80a8] border-[#1c80a8]'
                              : 'border-gray-200 group-hover:border-[#1c80a8]'
                              }`}>
                              {values.servicios.includes(option.id) && <Check className="w-3.5 h-3.5 text-white" />}
                            </div>
                          </button>
                        ))}

                        {/* Categoría: Tránsito */}
                        <div className="mt-4 px-3 py-2 text-[10px] font-black text-[#1c80a8] uppercase tracking-[0.2em] bg-gray-50/50 rounded-lg mb-1">
                          Asesoría y Trámites de Tránsito
                        </div>
                        {serviceOptions.filter(o => o.category === 'Asesoría y Trámites de Tránsito').map((option) => (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() => toggleService(option.id)}
                            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-[#f8fafc] transition-colors group"
                          >
                            <span className="text-sm font-medium text-[#182e6b]">{option.label}</span>
                            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${values.servicios.includes(option.id)
                              ? 'bg-[#1c80a8] border-[#1c80a8]'
                              : 'border-gray-200 group-hover:border-[#1c80a8]'
                              }`}>
                              {values.servicios.includes(option.id) && <Check className="w-3.5 h-3.5 text-white" />}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {touched.servicios && errors.servicios && <p className="text-red-500 text-xs mt-1">{errors.servicios}</p>}
                </div>

                <NeonButton
                  type="submit"
                  disabled={formState === 'submitting'}
                  className="w-full bg-[#1c80a8] hover:bg-[#182e6b] disabled:opacity-60 text-white font-black py-4 border-transparent flex items-center justify-center gap-3 transition-all shadow-lg hover:shadow-[#1c80a8]/30 uppercase tracking-widest text-sm font-montserrat"
                >
                  {formState === 'submitting' ? (
                    <><Loader className="w-5 h-5 animate-spin" /> Enviando...</>
                  ) : (
                    'Solicitar Asesoría'
                  )}
                </NeonButton>
                <p className="text-gray-400 text-[10px] text-center mt-4">Al enviar aceptas nuestra política de privacidad.</p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
