'use client';

import React from 'react';
import { motion, useAnimationControls } from 'framer-motion';
import { Heart, ShieldCheck, Home, CarFront, Briefcase } from 'lucide-react';

const services = [
  {
    title: "Seguro de Vida y Plenitud",
    description: "No es solo una póliza, es capital para tu jubilación y estabilidad financiera para tus seres queridos. Una solución de ahorro y seguridad que garantiza tranquilidad ante cualquier imprevisto.",
    icon: Heart,
    accent: "#00A8CC",
  },
  {
    title: "Seguros para tu Negocio (PYME)",
    description: "Asegurar tu empresa es asegurar su crecimiento. Te brindamos protección integral, asistencias especializadas y asesoría personalizada para que la continuidad de tu negocio nunca se detenga.",
    icon: Briefcase,
    accent: "#00A8CC",
  },
  {
    title: "Seguro de Hogar Integral",
    description: "Tu tranquilidad es lo más importante. Protegemos el valor comercial de tu vivienda y tus enseres contra eventos naturales y daños, con asistencia técnica disponible las 24 horas.",
    icon: Home,
    accent: "#00A8CC",
  },
  {
    title: "Movilidad y Vehículos",
    description: "Protegemos tu carro o moto con coberturas de responsabilidad civil y daños. Además, gestionamos tus trámites de tránsito (traspasos y pagos) con agilidad, confianza y sin filas.",
    icon: CarFront,
    accent: "#00A8CC",
  },
  {
    title: "Salud y Riesgos Laborales (ARL)",
    description: "Cumplimos con la normativa legal para que trabajes con total respaldo. Acceso a servicios médicos de alta calidad y cobertura integral para ti y tus colaboradores.",
    icon: ShieldCheck,
    accent: "#00A8CC",
  }
];

const duplicatedServices = [...services, ...services, ...services];

const InsuranceServices = () => {
  const controls = useAnimationControls();

  const startAutoScroll = () => {
    controls.start({
      x: ['0%', '-33.33%'],
      transition: {
        repeat: Infinity,
        repeatType: 'loop',
        duration: 60,
        ease: 'linear',
      },
    });
  };

  const pauseAutoScroll = () => {
    controls.stop();
  };

  return (
    <section
      className="py-24 bg-white overflow-hidden relative"
      id="servicios"
      aria-label="Nuestros servicios de protección"
    >
      <div className="container mx-auto px-6 mb-16">
        <h2 className="text-3xl md:text-5xl font-black text-[#041c32] mb-4 font-montserrat uppercase tracking-tight text-center">
          Nuestros Servicios de Protección
        </h2>
        <p className="text-center text-[#0d548d] font-poppins text-lg mb-6 max-w-2xl mx-auto font-normal">
          Soluciones integrales diseñadas para proteger lo que más te importa.
        </p>
        <div className="w-24 h-1 bg-[#00A8CC] mx-auto rounded-full" />
      </div>

      <div
        className="relative flex overflow-hidden cursor-grab active:cursor-grabbing"
        onMouseEnter={pauseAutoScroll}
        onMouseLeave={startAutoScroll}
        onFocus={pauseAutoScroll}
        onBlur={startAutoScroll}
      >
        <motion.div
          className="flex gap-8 py-6 px-4"
          role="list"
          drag="x"
          dragConstraints={{ left: -3000, right: 0 }}
          onViewportEnter={startAutoScroll}
          onDragStart={pauseAutoScroll}
          onDragEnd={startAutoScroll}
          animate={controls}
        >
          {duplicatedServices.map((service, index) => (
            <div
              key={index}
              role="listitem"
              className="flex-shrink-0 w-[380px] bg-white rounded-3xl p-8 transition-all duration-500 hover:-translate-y-2 select-none flex flex-col"
              style={{
                boxShadow: '0 8px 40px rgba(2, 10, 30, 0.13), 0 2px 12px rgba(1, 5, 20, 0.09)',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.boxShadow =
                  '0 20px 60px rgba(2, 10, 30, 0.22), 0 4px 20px rgba(1, 5, 20, 0.14)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.boxShadow =
                  '0 8px 40px rgba(2, 10, 30, 0.13), 0 2px 12px rgba(1, 5, 20, 0.09)';
              }}
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-300"
                style={{
                  backgroundColor: service.accent + '18',
                  border: `1.5px solid ${service.accent}35`,
                }}
                aria-hidden="true"
              >
                <service.icon className="w-7 h-7" style={{ color: service.accent }} />
              </div>

              <h3 className="text-xl font-bold text-[#041c32] mb-3 font-montserrat leading-tight">
                {service.title}
              </h3>

              <p className="text-gray-700 text-sm leading-relaxed font-poppins flex-grow">
                {service.description}
              </p>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Gradient fade edges */}
      <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" aria-hidden="true" />
      <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" aria-hidden="true" />
    </section>
  );
};

export default InsuranceServices;
