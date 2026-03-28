'use client';

import React from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

const ContactSection = () => {
  return (
    <section className="py-24 bg-white dark:bg-zinc-950" id="contacto">
      <div className="container mx-auto px-6">
        <div className="bg-blue-600 rounded-[3rem] overflow-hidden shadow-2xl flex flex-col lg:flex-row">
          <div className="lg:w-1/2 p-12 lg:p-20 text-white">
            <h2 className="text-4xl font-bold mb-8">Hablemos de tu tranquilidad</h2>
            <p className="text-xl text-blue-100 mb-12 leading-relaxed">
              Estamos aquí para responder todas tus dudas y ayudarte a encontrar la mejor opción para ti. Contáctanos por cualquiera de estos medios.
            </p>

            <div className="space-y-8">
              <div className="flex items-center gap-6">
                <div className="bg-white/10 p-4 rounded-2xl">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-blue-100 text-sm font-medium">Llámanos</div>
                  <div className="text-xl font-semibold">+1 (800) CERTA-SOS</div>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="bg-white/10 p-4 rounded-2xl">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-blue-100 text-sm font-medium">Escríbenos</div>
                  <div className="text-xl font-semibold">info@certaseguros.com</div>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="bg-white/10 p-4 rounded-2xl">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-blue-100 text-sm font-medium">Visítanos</div>
                  <div className="text-xl font-semibold">Av. Principal 123, Centro Financiero</div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:w-1/2 bg-white dark:bg-zinc-900 p-12 lg:p-20">
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Nombre Completo</label>
                  <input
                    type="text"
                    placeholder="Tu nombre"
                    className="w-full px-5 py-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Correo Electrónico</label>
                  <input
                    type="email"
                    placeholder="email@ejemplo.com"
                    className="w-full px-5 py-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Tipo de Seguro</label>
                <select className="w-full px-5 py-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all">
                  <option>Salud</option>
                  <option>Auto</option>
                  <option>Vida</option>
                  <option>Hogar</option>
                  <option>Otro</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Mensaje</label>
                <textarea
                  placeholder="¿Cómo podemos ayudarte?"
                  rows={4}
                  className="w-full px-5 py-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-5 rounded-xl flex items-center justify-center gap-3 transition-all shadow-lg hover:shadow-blue-500/30"
              >
                <Send className="w-5 h-5" />
                Enviar Mensaje
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
