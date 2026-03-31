import Hero from "@/components/landing/HeroSection";
import InsuranceServices from "@/components/blocks/InsuranceServices";
import TrustSection from "@/components/blocks/TrustSection";
import ContactSection from "@/components/blocks/ContactSection";


export default function Home() {
  return (
    <main className="min-h-screen bg-[#041c32]">
      <Hero />
      <InsuranceServices />
      <TrustSection />
      <ContactSection />

      {/* Footer */}
      <footer className="py-12 bg-[#182e6b] text-center border-t border-white/5">
        <p className="text-white/30 text-sm font-poppins">
          &copy; {new Date().getFullYear()} Certa Seguros. Todos los derechos reservados.
        </p>
      </footer>
    </main>
  );
}
