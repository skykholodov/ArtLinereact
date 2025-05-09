import { useEffect, useState } from "react";
import { useLanguage } from "@/hooks/use-language";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import HeroSection from "@/components/sections/hero-section";
import ServicesSection from "@/components/sections/services-section";
import PortfolioSection from "@/components/sections/portfolio-section";
import AboutSection from "@/components/sections/about-section";
import TestimonialsSection from "@/components/sections/testimonials-section";
import ContactSection from "@/components/sections/contact-section";
import MapSection from "@/components/sections/map-section";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import ResetOnboardingButton from "@/components/ui/reset-onboarding-button";

export default function HomePage() {
  const { language } = useLanguage();

  // Back to top button functionality
  useEffect(() => {
    const handleScroll = () => {
      const backToTopButton = document.getElementById("back-to-top");
      if (backToTopButton) {
        if (window.scrollY > 500) {
          backToTopButton.classList.remove("opacity-0", "invisible");
          backToTopButton.classList.add("opacity-100", "visible");
        } else {
          backToTopButton.classList.add("opacity-0", "invisible");
          backToTopButton.classList.remove("opacity-100", "visible");
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Проверка, видел ли пользователь онбординг
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean>(false);
  
  useEffect(() => {
    const seenOnboarding = localStorage.getItem('hasSeenOnboarding');
    setHasSeenOnboarding(seenOnboarding === 'true');
  }, []);

  return (
    <>
      <Header />
      
      <main>
        <HeroSection />
        <ServicesSection />
        <PortfolioSection />
        <AboutSection />
        <TestimonialsSection />
        <ContactSection />
        <MapSection />
      </main>
      
      <Footer />
      
      {/* Back to top button */}
      <Button
        id="back-to-top"
        variant="secondary"
        size="icon"
        className="fixed bottom-6 right-6 w-12 h-12 rounded-full shadow-lg flex items-center justify-center opacity-0 invisible transition-all z-50"
        onClick={scrollToTop}
        aria-label={
          language === "ru" ? "Вернуться наверх" : 
          language === "kz" ? "Жоғарыға оралу" : 
          "Back to top"
        }
      >
        <ArrowUp className="h-5 w-5" />
      </Button>
      
      {/* Кнопка сброса онбординга - показывается только если пользователь уже прошел онбординг */}
      {hasSeenOnboarding && <ResetOnboardingButton />}
    </>
  );
}
