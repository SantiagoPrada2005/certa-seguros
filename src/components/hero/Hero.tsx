'use client';


import ScrollExpandMedia from '@/components/ui/scroll-expansion-hero';
import { HeroContent } from './HeroContent';

/**
 * HeroBackground
 * Fondo con atmósfera — radial gradient + patrón de puntos sutil.
 * Se pasa como backgroundNode para no modificar ScrollExpandMedia.
 * El bg-[#041c32] del wrapper de ScrollExpandMedia actúa como fallback.
 */
const HeroBackground = () => (
  <div className="absolute inset-0 w-full h-full">
    {/* Capa 1: Radial gradient — luz desde arriba izquierda */}
    <div
      className="absolute inset-0"
      style={{
        background:
          'radial-gradient(ellipse 70% 60% at 15% 20%, #0a2d52 0%, #041c32 65%)',
      }}
    />
    {/* Capa 2: Acento cian muy sutil en esquina derecha */}
    <div
      className="absolute inset-0"
      style={{
        background:
          'radial-gradient(ellipse 40% 40% at 90% 80%, rgba(37,99,235,0.07) 0%, transparent 70%)',
      }}
    />
    {/* Capa 3: Patrón de puntos — profundidad sin distracción */}
    <div
      className="absolute inset-0"
      style={{
        backgroundImage:
          'radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)',
        backgroundSize: '28px 28px',
      }}
    />
  </div>
);

const Hero = () => {
  return (
    <div className="font-poppins bg-[#041c32]">
      <ScrollExpandMedia
        mediaType="image"
        mediaSrc="/images/hero-person.png"
        title="CERTA SEGUROS"
        scrollToExpand="Desliza para descubrir tu cobertura"
        leftContent={<HeroContent />}
        backgroundNode={<HeroBackground />}
      />
    </div>
  );
};

export default Hero;