'use client';

import React from 'react';
import { motion, Variants } from 'framer-motion';
import { CheckCircle2, Star, Users, PhoneCall } from 'lucide-react';

const stats = [
  { label: 'Clientes Felices', value: '10,000+', icon: Users },
  { label: 'Años de Experiencia', value: '20+', icon: Star },
  { label: 'Reclamaciones Pagadas', value: '98%', icon: CheckCircle2 },
  { label: 'Soporte 24/7', value: 'En Vivo', icon: PhoneCall },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 100, damping: 15 }
  },
};

const textFadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' }
  }
};

const TrustSection = () => {
  return (
    <section className="py-24 bg-zinc-50 dark:bg-zinc-900 font-poppins overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-16">

          <motion.div
            className="lg:w-1/2"
            variants={textFadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            <section className="py-16 px-6 md:px-12"> {/* Padding lateral para móvil y tablet */}
              <div className="max-w-4xl mx-auto"> {/* Limita el ancho y centra el contenido */}

                <h2 className="text-4xl font-extrabold text-[#182e6b] dark:text-white mb-8 font-montserrat">
                  ¿Por qué elegir Certa Seguros?
                </h2>

                <p className="text-xl text-[#515151] dark:text-zinc-400 mb-10 leading-relaxed font-bold">
                  Nos enfocamos en brindar seguridad real a través de procesos transparentes y atención personalizada.
                  No solo vendemos pólizas, construimos relaciones de confianza.
                </p>

              </div>
            </section>

            {/* Contenedor principal con padding lateral para que no toque los bordes del celular */}
            <motion.div className="max-w-4xl mx-auto px-6 md:px-12 -mt-6">

              <ul className="space-y-6">
                {[
                  'Cotizaciones instantáneas y personalizadas.',
                  'Acompañamiento jurídico en caso de siniestros.',
                  'Flexibilidad en los métodos de pago.',
                  'Acceso a red preferencial de proveedores.',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3"> {/* Cambié a items-start por si el texto ocupa 2 líneas */}

                    <div className="bg-[#182e6b]/10 dark:bg-blue-900/30 p-2 rounded-full shrink-0">
                      <CheckCircle2 className="w-6 h-6 text-[#182e6b]" />
                    </div>

                    <span className="text-lg text-[#0f1d42] dark:text-white font-bold leading-tight pt-1">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>

            </motion.div>
          </motion.div>

          {/* Right Content (Staggered Stat Cards) */}
          <motion.div
            className="lg:w-1/2 grid grid-cols-2 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-200px" }}
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="bg-white dark:bg-zinc-800 p-8 rounded-3xl shadow-sm border border-zinc-100 dark:border-zinc-700 flex flex-col items-center text-center group hover:-translate-y-2 transition-transform duration-300"
              >
                <div className="bg-blue-50 text-[#1c80a8] dark:bg-blue-900/20 p-4 rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  <stat.icon className="w-10 h-10 text-[#1c80a8] dark:text-[#1c80a8]" />
                </div>
                <div className="text-3xl font-extrabold text-zinc-900 dark:text-white mb-1 font-montserrat">{stat.value}</div>
                <div className="text-zinc-500 dark:text-zinc-400 font-bold">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default TrustSection;
