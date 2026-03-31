'use client';

import React, { useEffect, useRef } from 'react';
import { motion, useMotionValue, useAnimationControls } from 'framer-motion';
import Image from 'next/image';

const services = [
  {
    title: "Seguro de Vida y Plenitud",
    description: "No es solo una póliza, es capital para tu jubilación y estabilidad financiera para tus seres queridos. Una solución de ahorro y seguridad que garantiza tranquilidad ante cualquier imprevisto.",
    image: "/images/seguro-de-vida.png",
    accent: "#2fabcb",
  },
  {
    title: "Seguros para tu Negocio (PYME)",
    description: "Asegurar tu empresa es asegurar su crecimiento. Te brindamos protección integral, asistencias especializadas y asesoría personalizada para que la continuidad de tu negocio nunca se detenga.",
    image: "/images/seguro-empresa.png",
    accent: "#2fabcb",
  },
  {
    title: "Seguro de Hogar Integral",
    description: "Tu tranquilidad es lo más importante. Protegemos el valor comercial de tu vivienda y tus enseres contra eventos naturales y daños, con asistencia técnica disponible las 24 horas.",
    image: "/images/seguro-vivienda.png",
    accent: "#2fabcb",
  },
  {
    title: "Movilidad y Vehículos",
    description: "Protegemos tu carro o moto con coberturas de responsabilidad civil y daños. Además, gestionamos tus trámites de tránsito (traspasos y pagos) con agilidad, confianza y sin filas.",
    image: "/images/seguro-carro.png",
    accent: "#2fabcb",
  },
  {
    title: "Salud y Riesgos Laborales (ARL)",
    description: "Cumplimos con la normativa legal para que trabajes con total respaldo. Acceso a servicios médicos de alta calidad y cobertura integral para ti y tus colaboradores.",
    image: "/images/seguro-arl.png",
    accent: "#2fabcb",
  }
];

const duplicatedServices = [...services, ...services, ...services];

// Ancho de cada card + gap
const CARD_WIDTH = 380 + 32; // w-[380px] + gap-8
const TOTAL_WIDTH = services.length * CARD_WIDTH;

const InsuranceServices = () => {
  const x = useMotionValue(0);
  const isDragging = useRef(false);
  const animFrameRef = useRef<number | null>(null);
  const speedRef = useRef(0.6); // px por frame

  const startAutoScroll = () => {
    if (animFrameRef.current) return;

    const step = () => {
      if (!isDragging.current) {
        let current = x.get();
        current -= speedRef.current;

        // Loop: cuando llega al segundo bloque, salta al primero
        if (current <= -TOTAL_WIDTH) {
          current += TOTAL_WIDTH;
        }

        x.set(current);
      }
      animFrameRef.current = requestAnimationFrame(step);
    };

    animFrameRef.current = requestAnimationFrame(step);
  };

  const stopAutoScroll = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
  };

  useEffect(() => {
    startAutoScroll();
    return () => stopAutoScroll();
  }, []);

  const handleDragStart = () => {
    isDragging.current = true;
  };

  const handleDragEnd = () => {
    isDragging.current = false;
    // Normalizar posición para que el loop funcione bien tras el drag
    let current = x.get();
    if (current > 0) x.set(current % -TOTAL_WIDTH - TOTAL_WIDTH);
    if (current < -TOTAL_WIDTH * 2) x.set(current % -TOTAL_WIDTH);
  };

  return (
    <section
      className="py-24 bg-white overflow-hidden relative"
      id="servicios"
      aria-label="Nuestros servicios de protección"
    >
      <div className="container mx-auto px-6 mb-16">
        <h2 className="text-3xl md:text-5xl font-black text-[#182e6b] mb-4 font-montserrat uppercase tracking-tight text-center">
          Nuestros Servicios de Protección
        </h2>
        <p className="text-center text-[#2fabcb] font-poppins text-lg mb-6 max-w-2xl mx-auto font-normal">
          Soluciones integrales diseñadas para proteger lo que más te importa.
        </p>
        <div className="w-24 h-1 bg-[#182e6b] mx-auto rounded-full" />
      </div>

      <div className="relative flex overflow-hidden cursor-grab active:cursor-grabbing">
        <motion.div
          className="flex gap-8 py-6 px-4"
          role="list"
          style={{ x }}
          drag="x"
          dragConstraints={{ left: -TOTAL_WIDTH * 2, right: 0 }}
          dragElastic={0.05}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          {duplicatedServices.map((service, index) => (
            <div
              key={index}
              role="listitem"
              className="shrink-0 w-[380px] bg-white rounded-3xl overflow-hidden transition-all duration-500 hover:-translate-y-2 select-none flex flex-col"
              style={{
                boxShadow: '0 8px 40px rgba(24, 46, 107, 0.15), 0 2px 12px rgba(24, 46, 107, 0.10)',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.boxShadow =
                  '0 20px 60px rgba(47, 171, 203, 0.28), 0 4px 20px rgba(47, 171, 203, 0.18)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.boxShadow =
                  '0 8px 40px rgba(24, 46, 107, 0.15), 0 2px 12px rgba(24, 46, 107, 0.10)';
              }}
            >
              {/* Imagen del servicio */}
              <div className="relative w-full h-[140px] overflow-hidden bg-white flex items-center justify-center p-4">
                <Image
                  src={service.image}
                  alt={service.title}
                  fill
                  sizes="380px"
                  className="object-contain transition-transform duration-500 hover:scale-105 p-3"
                />
              </div>

              <div className="p-8 pt-6 flex flex-col grow">
                <h3 className="text-xl font-bold text-[#041c32] mb-3 font-montserrat leading-tight">
                  {service.title}
                </h3>
                <p className="text-gray-700 text-sm leading-relaxed font-poppins grow">
                  {service.description}
                </p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Gradient fade edges */}
      <div className="absolute inset-y-0 left-0 w-20 bg-linear-to-r from-white to-transparent z-10 pointer-events-none" aria-hidden="true" />
      <div className="absolute inset-y-0 right-0 w-20 bg-linear-to-l from-white to-transparent z-10 pointer-events-none" aria-hidden="true" />
    </section>
  );
};

export default InsuranceServices;