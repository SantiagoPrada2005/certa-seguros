"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useRef } from "react";
import {
  containerVariants,
  itemVariants,
  badgeVariants,
  pulseVariants,
  floatVariants,
} from "@/lib/animations";
import { ADVISOR, HERO, CONTACT } from "@/lib/constants";

function SuraBadge() {
  return (
    <motion.div
      variants={badgeVariants}
      className="relative inline-flex items-center"
    >
      {/* ─── Neon Glow Layers (Blue/Cyan) ─── */}
      <div id="poda" className="group relative flex items-center justify-center">
        {/* Layer 1: Base Glow */}
        <div className="absolute z-[-1] h-full w-full overflow-hidden rounded-full blur-xs 
                        before:absolute before:left-1/2 before:top-1/2 before:h-[300%] before:w-[300%] before:-translate-x-1/2 before:-translate-y-1/2 before:bg-no-repeat before:content-['']
                        before:bg-[conic-gradient(transparent,#0033a0_5%,transparent_38%,transparent_50%,#00d2ff_60%,transparent_87%)] before:animate-spin-slow">
        </div>

        {/* Layer 2: Core Refraction */}
        <div className="absolute z-[-1] h-full w-full overflow-hidden rounded-full blur-[2px] 
                        before:absolute before:left-1/2 before:top-1/2 before:h-[200%] before:w-[200%] before:-translate-x-1/2 before:-translate-y-1/2 before:bg-no-repeat before:content-['']
                        before:bg-[conic-gradient(transparent,#0055ff,transparent_10%,transparent_50%,#00ffff,transparent_60%)] before:animate-spin-slow">
        </div>

        {/* Layer 3: Inner Brightness */}
        <div className="absolute z-[-1] h-full w-full overflow-hidden rounded-full blur-[1px] 
                        before:absolute before:left-1/2 before:top-1/2 before:h-[200%] before:w-[200%] before:-translate-x-1/2 before:-translate-y-1/2 before:bg-no-repeat before:content-['']
                        before:bg-[conic-gradient(transparent_0%,#0033a0_8%,transparent_50%,#00d2ff_58%)] before:brightness-150
                        before:animate-spin-slow">
        </div>

        {/* The Badge Itself */}
        <div className="relative flex items-center gap-3 rounded-full border border-white/20 bg-[#001a4d]/80 px-5 py-2 backdrop-blur-md transition-all duration-500 hover:bg-[#002673]">
          {/* Cyan Mask Glow */}
          <div className="pointer-events-none absolute left-2 top-1/2 h-[15px] w-[20px] -translate-y-1/2 rounded-full bg-cyan-400 opacity-40 blur-xl transition-all duration-1000 group-hover:opacity-0"></div>

          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-400"></span>
          </span>
          <span className="font-poppins text-xs font-bold tracking-widest text-cyan-300 transition-colors group-hover:text-white uppercase">
            {ADVISOR.badge}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Sub-componente: Trust Bar ────────────────────────────────────────────────
function TrustBar() {
  return (
    <motion.div
      variants={itemVariants}
      className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-white/10 pt-6"
    >
      {HERO.trust_items.map((item) => (
        <div key={item} className="flex items-center gap-1.5">
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-cyan-400/20">
            <svg
              className="h-2.5 w-2.5 text-cyan-400"
              fill="none"
              viewBox="0 0 10 10"
            >
              <path
                d="M2 5l2 2 4-4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span className="text-xs text-white/60">{item}</span>
        </div>
      ))}
    </motion.div>
  );
}

// ─── Sub-componente: Fondo geométrico ─────────────────────────────────────────
// SVG puro, sin imágenes externas. Carga instantánea, aspecto premium.
function GeometricBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Glow central cian */}
      <div className="absolute -top-1/4 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-3xl" />
      {/* Glow inferior azul */}
      <div className="absolute -bottom-1/3 right-0 h-[400px] w-[400px] rounded-full bg-blue-500/15 blur-3xl" />

      {/* Círculo giratorio decorativo — top right */}
      <motion.div
        variants={floatVariants}
        animate="animate"
        className="absolute -right-20 -top-20 h-64 w-64 opacity-10"
      >
        <svg viewBox="0 0 200 200" fill="none">
          <circle cx="100" cy="100" r="90" stroke="#2fabcb" strokeWidth="0.5" strokeDasharray="4 6" />
          <circle cx="100" cy="100" r="60" stroke="#4977b8" strokeWidth="0.5" strokeDasharray="2 8" />
        </svg>
      </motion.div>

      {/* Círculo giratorio decorativo — bottom left (más lento) */}
      <motion.div
        animate={{ rotate: [360, 0] }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        className="absolute -bottom-16 -left-16 h-48 w-48 opacity-[0.07]"
      >
        <svg viewBox="0 0 200 200" fill="none">
          <circle cx="100" cy="100" r="90" stroke="#2fabcb" strokeWidth="0.5" strokeDasharray="3 5" />
        </svg>
      </motion.div>

      {/* Grid pattern sutil */}
      <svg
        className="absolute inset-0 h-full w-full opacity-[0.03]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
    </div>
  );
}

// ─── Sub-componente: Imagen Hero ──────────────────────────────────────────────
function HeroImage({ scrollYProgress }: { scrollYProgress: any }) {
  const y = useTransform(scrollYProgress, [0, 1], [0, -100]);

  return (
    <motion.div
      style={{ y }}
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
      className="relative aspect-square w-full max-w-[300px] lg:ml-auto lg:max-w-none"
    >
      <div className="absolute inset-0 rounded-3xl bg-linear-to-tr from-cyan-500/20 to-transparent blur-2xl" />
      <div className="relative h-full w-full overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm">
        <Image
          src="/images/hero-person.png"
          alt="Asesora de Seguros"
          fill
          className="object-cover object-center brightness-110 contrast-110 transition-all duration-1000 hover:scale-105"
          priority
        />
        {/* Decorative elements over image */}
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-[#182e6b] to-transparent" />
        <div className="absolute bottom-8 left-8 flex items-center gap-4">
          <div className="h-12 w-12 overflow-hidden rounded-full border-2 border-cyan-400/50 p-0.5 shadow-lg">
            <div className="h-full w-full overflow-hidden rounded-full">
              <Image
                src="/images/hero-person.png"
                alt="Avatar"
                width={48}
                height={48}
                className="object-cover grayscale-0"
              />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-poppins text-xs font-bold tracking-wider text-white uppercase opacity-80">Asesora Sura</span>
            <span className="font-poppins text-[10px] font-medium text-cyan-300 uppercase tracking-widest underline decoration-cyan-400/30 underline-offset-4">Respaldo Garantizado</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Sub-componente: Scroll Indicator ─────────────────────────────────────────
function ScrollIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.5, duration: 1 }}
      className="absolute bottom-6 left-1/2 flex -translate-x-1/2 flex-col items-center gap-3"
    >
      <span className="font-poppins text-[10px] font-bold tracking-[0.3em] mb-2 uppercase text-cyan-300/60 transition-colors hover:text-cyan-300">
        Desliza para conocer los servicios
      </span>
      <div className="relative h-12 w-px overflow-hidden bg-white/10">
        <motion.div
          animate={{
            y: ["-100%", "100%"],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-0 h-1/2 w-full bg-cyan-400/60"
        />
      </div>
    </motion.div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function HeroSection() {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const textY = useTransform(scrollYProgress, [0, 1], [0, 50]);

  const handleScrollToCotizar = () => {
    document.getElementById("cotizar")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[90vh] overflow-hidden bg-linear-to-br from-[#182e6b] via-[#1c3a7a] to-[#1c80a8]"
    >
      <GeometricBackground />

      {/* Contenido principal */}
      <div className="relative z-10 mx-auto max-w-7xl px-6 py-24 lg:py-32">
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
          <motion.div
            style={{ y: textY }}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col"
          >
            {/* Badge SURA — protagonismo total */}
            <motion.div variants={badgeVariants} className="mb-8">
              <SuraBadge />
            </motion.div>

            {/* Heading en 3 líneas — impactante y cinematográfico */}
            <motion.h1
              variants={containerVariants}
              className="font-montserrat mb-8 text-3xl font-extrabold leading-[0.85] tracking-tighter text-white lg:text-7xl"
            >
              {HERO.heading.map((line, i) => (
                <motion.span
                  key={i}
                  variants={itemVariants}
                  className={`block ${i === HERO.heading.length - 1 ? "text-cyan-400" : ""
                    }`}
                >
                  {line}
                </motion.span>
              ))}
            </motion.h1>

            {/* Subheading — Tipografía refinada y destaque de SURA */}
            <motion.p
              variants={itemVariants}
              className="mb-12 max-w-xl font-poppins text-lg font-medium leading-relaxed text-white/70 md:text-xl lg:text-1.5xl"
            >
              {HERO.subheading.split("SURA").map((text, i, arr) => (
                <span key={i}>
                  {text}
                  {i < arr.length - 1 && (
                    <span className="font-bold text-cyan-400 underline decoration-cyan-400/20 underline-offset-8">
                      SURA
                    </span>
                  )}
                </span>
              ))}
            </motion.p>
          </motion.div>

          {/* Hero Image Section — visible only on desktop or carefully on mobile */}
          <HeroImage scrollYProgress={scrollYProgress} />
        </div>
      </div>

      <ScrollIndicator />

      {/* Degradado de transición hacia la siguiente sección */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-[#182e6b] via-[#182e6b]/50 to-transparent" />
    </section>
  );
}