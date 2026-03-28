import Hero from "@/components/blocks/Hero";
import InsuranceServices from "@/components/blocks/InsuranceServices";
import TrustSection from "@/components/blocks/TrustSection";
import ContactSection from "@/components/blocks/ContactSection";

export default function Home() {
  return (
    <main className="min-h-screen bg-black">
      <Hero />
      <InsuranceServices />
      <TrustSection />
      <ContactSection />
      
      {/* Footer minimalista */}
      <footer className="py-12 bg-zinc-900 text-center border-t border-zinc-800">
        <p className="text-zinc-500">
          &copy; {new Date().getFullYear()} Certa Seguros. Todos los derechos reservados.
        </p>
      </footer>
    </main>
  );
}
