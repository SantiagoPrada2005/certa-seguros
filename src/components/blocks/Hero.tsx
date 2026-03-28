'use client';

import React from 'react';
import { HeroSection } from '@/components/hero-section-with-smooth-bg-shader';
import ScrollExpandMedia from '@/components/ui/scroll-expansion-hero';


const Hero = () => {
  return (
    <div className="min-h-screen font-poppins">
      <ScrollExpandMedia
        mediaType="image"
        mediaSrc="/images/hero-person.png"
        backgroundNode={
          <HeroSection
            colors={["#001f54", "#034078", "#0d548d", "#0a1128", "#000000"]}
            distortion={0.4}
            speed={0.2}
            title=""
            description=""
            buttonText=""
            veilOpacity="bg-transparent"
            className="h-full"
          />
        }
        title="Certa Seguros"
        date="Tu tranquilidad es nuestro compromiso"
        scrollToExpand="Desliza para conocer más"
      >
        <div className="max-w-4xl mx-auto text-center font-poppins">
          <h2 className="text-4xl md:text-6xl font-extrabold mb-8 text-white font-montserrat tracking-tight">
            Protegiendo lo que más importa
          </h2>
          <p className="text-xl md:text-2xl text-blue-50 font-bold leading-relaxed max-w-2xl mx-auto">
            En Certa Seguros, ofrecemos soluciones personalizadas para asegurar tu futuro y el de tu familia. Con más de 20 años de experiencia, somos tu socio de confianza en cada paso.
          </p>
        </div>
      </ScrollExpandMedia>
    </div>
  );
};

export default Hero;
