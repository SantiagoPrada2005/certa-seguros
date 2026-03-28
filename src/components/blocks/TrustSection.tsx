'use client';

import React from 'react';
import { CheckCircle2, Star, Users, PhoneCall } from 'lucide-react';

const stats = [
  { label: 'Clientes Felices', value: '10,000+', icon: Users },
  { label: 'Años de Experiencia', value: '20+', icon: Star },
  { label: 'Reclamaciones Pagadas', value: '98%', icon: CheckCircle2 },
  { label: 'Soporte 24/7', value: 'En Vivo', icon: PhoneCall },
];

const TrustSection = () => {
  return (
    <section className="py-24 bg-zinc-50 dark:bg-zinc-900 font-poppins">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="lg:w-1/2">
            <h2 className="text-4xl font-extrabold text-zinc-900 dark:text-white mb-6 font-montserrat">
              ¿Por qué elegir Certa Seguros?
            </h2>
            <p className="text-xl text-zinc-600 dark:text-zinc-400 mb-10 leading-relaxed font-bold">
              Nos enfocamos en brindar seguridad real a través de procesos transparentes y atención personalizada. No solo vendemos pólizas, construimos relaciones de confianza.
            </p>

            <ul className="space-y-6">
              {[
                'Cotizaciones instantáneas y personalizadas.',
                'Acompañamiento jurídico en caso de siniestros.',
                'Flexibilidad en los métodos de pago.',
                'Acceso a red preferencial de proveedores.',
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-4">
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-1 rounded-full">
                    <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-lg text-zinc-700 dark:text-zinc-300 font-bold">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:w-1/2 grid grid-cols-2 gap-6">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-white dark:bg-zinc-800 p-8 rounded-3xl shadow-sm border border-zinc-100 dark:border-zinc-700 flex flex-col items-center text-center group hover:-translate-y-2 transition-transform duration-300"
              >
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  <stat.icon className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-3xl font-extrabold text-zinc-900 dark:text-white mb-1 font-montserrat">{stat.value}</div>
                <div className="text-zinc-500 dark:text-zinc-400 font-bold">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustSection;
