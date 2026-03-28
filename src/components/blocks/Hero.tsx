'use client';

import React from 'react';
import { HeroSection } from '@/components/hero-section-with-smooth-bg-shader';
import ScrollExpandMedia from '@/components/ui/scroll-expansion-hero';


const Hero = () => {
  return (
    <div className="min-h-screen font-poppins bg-[#041c32]">
      <ScrollExpandMedia
        mediaType="image"
        mediaSrc="/images/hero-person.png"
        title="CERTA SEGUROS"
        scrollToExpand="Desliza para proteger tu futuro"
        leftContent={
          <div className="space-y-8">
            <h3 className="text-3xl md:text-5xl font-bold text-white leading-tight font-montserrat">
              Protección integral para lo que más valoras.
            </h3>
            <p className="text-lg md:text-xl text-[#E0E0E0] max-w-lg leading-relaxed font-montserrat font-normal">
              Aseguramos tu vida, tu hogar, tus vehiculos y el crecimiento de tu PYME con el respaldo y la confianza que mereces.
            </p>
            <button className="bg-[#00A8CC] hover:bg-[#0092b3] text-white font-bold py-4 px-10 rounded-full transition-all transform hover:scale-105 shadow-xl uppercase tracking-widest text-sm">
              COTIZA TU PÓLIZA AQUÍ
            </button>
          </div>
        }
      >
        <div className="max-w-4xl mx-auto text-center font-poppins">
          {/* Main content is now elegantly handled by the split-layout leftContent area */}
        </div>
      </ScrollExpandMedia>
    </div>
  );
};

export default Hero;
