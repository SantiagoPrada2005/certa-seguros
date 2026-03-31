'use client';

import { motion } from 'framer-motion';
import { Shield, CheckCircle, ArrowRight, MousePointer2 } from 'lucide-react';

export const HeroContent = () => {
  return (
    <div className="flex flex-col gap-8 max-w-xl">
      {/* Badge sutil */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 w-fit"
      >
        <Shield className="w-4 h-4 text-blue-400" />
        <span className="text-xs font-semibold tracking-wider text-blue-300 uppercase">
          Seguros de Confianza
        </span>
      </motion.div>

      {/* Titulares */}
      <div className="flex flex-col gap-4">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl md:text-6xl font-bold font-montserrat text-white leading-tight"
        >
          Protección real para lo que <span className="text-blue-500">más valoras.</span>
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg text-blue-100/70 font-poppins leading-relaxed"
        >
          En Certa Seguros, simplificamos lo complejo. Obtén la cobertura 
          ideal con expertos que hablan tu mismo idioma y te acompañan 
          en cada paso.
        </motion.p>
      </div>

      {/* Trust Badges - Vertical Spacing */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="flex flex-col gap-4 pt-4"
      >
        <p className="text-xs font-bold text-blue-400/60 uppercase tracking-widest">
          Avalados por líderes del mercado
        </p>
        <div className="flex flex-wrap gap-x-8 gap-y-4 items-center">
          {['Allianz', 'Sura', 'Bolívar', 'Mapfre'].map((brand, i) => (
            <div key={brand} className="flex items-center gap-2 group">
              <CheckCircle className="w-4 h-4 text-blue-500/40 group-hover:text-blue-500 transition-colors" />
              <span className="text-sm font-semibold text-blue-100/40 group-hover:text-blue-100 transition-colors">
                {brand}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* "Desliza para cotizar" text notice instead of CTA button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.6 }}
        className="mt-8 flex items-center gap-4 group"
      >
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-blue-500 font-bold tracking-tighter text-lg uppercase">
              Desliza para cotizar
            </span>
            <motion.div
              animate={{ x: [0, 5, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <ArrowRight className="w-5 h-5 text-blue-500" />
            </motion.div>
          </div>
          <p className="text-[10px] text-blue-100/30 uppercase tracking-[0.2em] font-medium">
            Descubre tu plan personalizado
          </p>
        </div>
      </motion.div>
    </div>
  );
};
