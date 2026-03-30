'use client';

import { motion, Variants } from 'framer-motion';

const TRUST_ITEMS = [
    { icon: '✓', label: 'Licencia Superfinanciera' },
    { icon: '✓', label: 'Familias aseguradas' },
    { icon: '✓', label: 'Trámites 100% digitales' },
];

const containerVariants: Variants = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.12,
            delayChildren: 0.2,
        },
    },
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
};

export const HeroContent = () => {
    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6 max-w-xl"
        >
            {/* Eyebrow */}
            <motion.div variants={itemVariants}>
                <span
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontWeight: 600,
                        fontSize: '11px',
                        letterSpacing: '0.2em',
                        textTransform: 'uppercase',
                        color: '#2563eb',
                        textShadow: '0 0 12px rgba(37,99,235,0.25), 0 2px 8px rgba(0,0,0,0.85)',
                    }}
                >
                    <span
                        style={{
                            display: 'inline-block',
                            width: '28px',
                            height: '1.5px',
                            background: '#2563eb',
                        }}
                    />
                    Seguros · Protección · Confianza
                </span>
            </motion.div>

            {/* Headline */}
            <motion.h2
                variants={itemVariants}
                style={{
                    fontWeight: 800,
                    fontSize: 'clamp(2rem, 3.5vw, 3rem)',
                    lineHeight: 1.15,
                    color: '#ffffff',
                    letterSpacing: '-0.02em',
                    margin: 0,
                    textShadow: '0 2px 4px rgba(0,0,0,0.9), 0 8px 24px rgba(0,0,0,0.7)',
                }}
            >
                Protegemos lo que{' '}
                <span style={{
                    color: '#2563eb',
                    textShadow: '0 0 16px rgba(37,99,235,0.2), 0 2px 6px rgba(0,0,0,0.85)',
                }}>
                    más importa.
                </span>
            </motion.h2>

            {/* Subheadline */}
            <motion.p
                variants={itemVariants}
                style={{
                    fontWeight: 300,
                    fontSize: 'clamp(0.95rem, 1.2vw, 1.1rem)',
                    color: 'rgba(224,224,224,0.85)',
                    lineHeight: 1.7,
                    margin: 0,
                    maxWidth: '440px',
                    textShadow: '0 1px 3px rgba(0,0,0,0.95), 0 4px 16px rgba(0,0,0,0.8)',
                }}
            >
                Vida, hogar, vehículo y PYME — cobertura integral con respaldo
                experto y trámites desde tu celular.
            </motion.p>

            {/* Trust badges */}
            <motion.ul
                variants={itemVariants}
                style={{
                    listStyle: 'none',
                    margin: 0,
                    padding: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    marginTop: '40px',
                }}
            >
                {TRUST_ITEMS.map((item) => (
                    <li
                        key={item.label}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            fontSize: '13px',
                            fontWeight: 400,
                            color: 'rgba(200,220,230,0.9)',
                            textShadow: '0 1px 3px rgba(0,0,0,0.95), 0 3px 10px rgba(0,0,0,0.7)',
                        }}
                    >
                        <span
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '18px',
                                height: '18px',
                                borderRadius: '50%',
                                background: 'rgba(37, 99, 235, 0.15)',
                                border: '1px solid rgba(37, 99, 235, 0.4)',
                                color: '#2563eb',
                                fontSize: '15px',
                                fontWeight: 700,
                                flexShrink: 0,
                            }}
                        >
                            {item.icon}
                        </span>
                        {item.label}
                    </li>
                ))}
            </motion.ul>

            {/* CTA hint */}
            <motion.div
                variants={itemVariants}
                style={{ paddingTop: '8px' }}
            >
                <span
                    style={{
                        fontSize: '15px',
                        fontWeight: 500,
                        color: 'rgba(200,220,230,0.9)',
                        letterSpacing: '0.05em',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        marginTop: '20px',
                        textShadow: '0 1px 3px rgba(0,0,0,0.95), 0 3px 12px rgba(0,0,0,0.75)',
                    }}
                >
                    <motion.span
                        animate={{ y: [0, 5, 0] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        style={{ color: '#2563eb' }}
                    >
                        ↓
                    </motion.span>
                    Desliza para cotizar
                </span>
            </motion.div>
        </motion.div>
    );
};