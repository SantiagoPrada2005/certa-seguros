'use client';

import React from 'react';
import ScrollExpandMedia from '@/components/ui/scroll-expansion-hero';

const Hero = () => {
  return (
    <div className="min-h-screen">
      <ScrollExpandMedia
        mediaType="image"
        mediaSrc="/images/hero-person.png"
        bgImageSrc="/images/hero-bg.png"
        title="Certa Seguros"
        date="Tu tranquilidad es nuestro compromiso"
        scrollToExpand="Desliza para conocer más"
        textBlend
      >
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-8 text-white">
            Protegiendo lo que más importa
          </h2>
          <p className="text-xl md:text-2xl text-blue-100 leading-relaxed max-w-2xl mx-auto">
            En Certa Seguros, ofrecemos soluciones personalizadas para asegurar tu futuro y el de tu familia. Con más de 20 años de experiencia, somos tu socio de confianza en cada paso.
          </p>
        </div>
      </ScrollExpandMedia>
    </div>
  );
};

export default Hero;
