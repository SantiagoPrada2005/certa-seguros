'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, Variants, useInView } from 'framer-motion';
import { Users, Star, CheckCircle2, PhoneCall } from 'lucide-react';

// ─── Counter-up hook ─────────────────────────────────────────────────────────
function useCountUp(target: number, duration = 1800, shouldStart = false) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!shouldStart) return;
    let startTime: number | null = null;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  }, [shouldStart, target, duration]);

  return count;
}

// ─── Stat data ────────────────────────────────────────────────────────────────
const stats = [
  { label: 'Clientes Felices',        numeric: 10000, display: '+', suffix: '',  icon: Users,         large: true },
  { label: 'Años de Experiencia',     numeric: 20,    display: '+', suffix: '',  icon: Star,          large: false },
  { label: 'Reclamaciones Pagadas',   numeric: 98,    display: '%', suffix: '',  icon: CheckCircle2,  large: false },
  { label: 'Soporte disponible',      numeric: 0,     display: '',  suffix: '24/7', icon: PhoneCall,  large: false },
];

const benefits = [
  'Cotizaciones instantáneas y personalizadas.',
  'Acompañamiento jurídico en caso de siniestros.',
  'Flexibilidad en los métodos de pago.',
  'Acceso a red preferencial de proveedores.',
];

// ─── Variants ─────────────────────────────────────────────────────────────────
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, scale: 0.88, y: 24 },
  visible: {
    opacity: 1, scale: 1, y: 0,
    transition: { type: 'spring', stiffness: 90, damping: 14 },
  },
};

const textFadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: 'easeOut' } },
};

const benefitVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.45, ease: 'easeOut' } },
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ stat, shouldStart }: { stat: typeof stats[0]; shouldStart: boolean }) {
  const count = useCountUp(stat.numeric, 1800, shouldStart && stat.numeric > 0);
  const Icon = stat.icon;

  const displayValue = stat.numeric === 0
    ? stat.suffix
    : `${stat.numeric >= 10000
        ? count >= 10000 ? '10,000' : count.toLocaleString()
        : count
      }${stat.display}`;

  return (
    <motion.div
      variants={cardVariants}
      className="group relative flex flex-col items-center text-center p-8 rounded-3xl
                 bg-white/5 border border-white/10 backdrop-blur-sm
                 hover:border-cyan-400/40 hover:bg-white/8
                 transition-all duration-400 cursor-default"
      style={{ willChange: 'transform' }}
    >
      {/* Glow on hover */}
      <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-400
                      shadow-[0_0_30px_-5px_rgba(47,171,203,0.3)]" />

      {/* Icon */}
      <div className="relative mb-5 p-4 rounded-2xl bg-cyan-400/10 border border-cyan-400/20
                      group-hover:bg-cyan-400/20 group-hover:scale-110 transition-all duration-300">
        <Icon className="w-8 h-8 text-cyan-400" />
        <div className="absolute inset-0 rounded-2xl bg-cyan-400/20 blur-md opacity-0 group-hover:opacity-60 transition-opacity duration-300" />
      </div>

      {/* Number */}
      <div className="font-montserrat text-4xl font-black text-white mb-1 tracking-tight leading-none">
        {displayValue}
      </div>

      {/* Label */}
      <div className="text-sm text-white/50 font-medium tracking-wide mt-1">{stat.label}</div>
    </motion.div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
const TrustSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: '-120px' });

  return (
    <section
      ref={sectionRef}
      className="relative py-28 overflow-hidden font-poppins"
      style={{ background: 'linear-gradient(135deg, #0f1d42 0%, #162552 40%, #1a3a6e 70%, #0d2040 100%)' }}
    >
      {/* ── Background decorations ── */}
      {/* Grid pattern */}
      <svg className="absolute inset-0 h-full w-full opacity-[0.035] pointer-events-none" aria-hidden="true">
        <defs>
          <pattern id="trust-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#trust-grid)" />
      </svg>

      {/* Ambient glows */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] rounded-full bg-cyan-500/8 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[350px] h-[350px] rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />

      {/* Large decorative icon in background */}
      <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-[0.04] pointer-events-none hidden lg:block">
        <Users className="w-[340px] h-[340px] text-white" />
      </div>

      <div className="relative z-10 container mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-20">

          {/* ── Left column ── */}
          <motion.div
            className="lg:w-1/2 flex flex-col justify-center"
            variants={textFadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-400/10 border border-cyan-400/20 w-fit mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-xs font-bold tracking-widest text-cyan-300 uppercase">
                Nuestra promesa
              </span>
            </div>

            {/* Heading */}
            <h2 className="font-montserrat text-4xl lg:text-5xl font-extrabold text-white mb-6 leading-tight">
              ¿Por qué elegir{' '}
              <span className="text-cyan-400 relative">
                Certa Seguros?
                <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-cyan-400/40 rounded-full" />
              </span>
            </h2>

            {/* Subparagraph — regular weight, good line-height */}
            <p className="text-lg text-white/60 font-normal leading-relaxed mb-10 max-w-lg">
              Nos enfocamos en brindar seguridad real a través de procesos transparentes
              y atención personalizada. No solo vendemos pólizas, construimos relaciones de confianza.
            </p>

            {/* Vertical accent line + benefits */}
            <div className="relative pl-6 border-l-2 border-cyan-400/30">
              <motion.ul
                className="space-y-5"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-80px' }}
              >
                {benefits.map((item, i) => (
                  <motion.li key={i} variants={benefitVariants} className="flex items-start gap-3 group">
                    {/* Glowing check bullet */}
                    <div className="relative shrink-0 mt-0.5 w-6 h-6 rounded-full bg-cyan-400/15 border border-cyan-400/30 flex items-center justify-center
                                    group-hover:bg-cyan-400/25 group-hover:border-cyan-400/60 transition-all duration-300">
                      <svg className="w-3 h-3 text-cyan-400" fill="none" viewBox="0 0 10 10">
                        <path d="M2 5l2 2 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <div className="absolute inset-0 rounded-full bg-cyan-400/30 blur-[6px] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    <span className="text-white/80 font-normal leading-snug group-hover:text-white transition-colors duration-200">
                      {item}
                    </span>
                  </motion.li>
                ))}
              </motion.ul>
            </div>
          </motion.div>

          {/* ── Right column: Stat cards ── */}
          <motion.div
            className="lg:w-1/2 grid grid-cols-2 gap-5"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-150px' }}
          >
            {stats.map((stat, index) => (
              <StatCard key={index} stat={stat} shouldStart={inView} />
            ))}
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default TrustSection;
