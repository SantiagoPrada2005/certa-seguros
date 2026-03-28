'use client';

import React from 'react';
import { Shield, Car, Heart, Home, Umbrella, Briefcase } from 'lucide-react';

const services = [
  {
    title: 'Seguro de Salud',
    description: 'La mejor cobertura médica para ti y tu familia con acceso a las mejores clínicas.',
    icon: Heart,
    color: 'text-red-500',
  },
  {
    title: 'Seguro de Auto',
    description: 'Protección total para tu vehículo contra accidentes, robo y daños a terceros.',
    icon: Car,
    color: 'text-blue-500',
  },
  {
    title: 'Seguro de Vida',
    description: 'Asegura el bienestar financiero de tus seres queridos en cualquier circunstancia.',
    icon: Shield,
    color: 'text-green-500',
  },
  {
    title: 'Seguro de Hogar',
    description: 'Protege tu casa y tus pertenencias contra incendios, robos y desastres naturales.',
    icon: Home,
    color: 'text-orange-500',
  },
  {
    title: 'Responsabilidad Civil',
    description: 'Cobertura integral para protegerte ante reclamaciones de terceros.',
    icon: Umbrella,
    color: 'text-purple-500',
  },
  {
    title: 'Seguro Empresarial',
    description: 'Soluciones a medida para proteger los activos y el personal de tu empresa.',
    icon: Briefcase,
    color: 'text-slate-500',
  },
];

const InsuranceServices = () => {
  return (
    <section className="py-24 bg-white dark:bg-zinc-950">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-zinc-900 dark:text-white mb-4">
            Nuestros Servicios de Seguros
          </h2>
          <p className="text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
            Ofrecemos una amplia gama de coberturas diseñadas para adaptarse a tus necesidades específicas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div
              key={index}
              className="p-8 rounded-2xl border border-zinc-100 dark:border-zinc-800 hover:shadow-xl transition-all duration-300 bg-zinc-50/50 dark:bg-zinc-900/50 group"
            >
              <div className={`p-3 rounded-xl bg-white dark:bg-zinc-800 w-fit mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                <service.icon className={`w-8 h-8 ${service.color}`} />
              </div>
              <h3 className="text-2xl font-semibold text-zinc-900 dark:text-white mb-4">
                {service.title}
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default InsuranceServices;
