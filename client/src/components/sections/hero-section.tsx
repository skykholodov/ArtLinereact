import { useLanguage } from "@/hooks/use-language";
import { translate } from "@/lib/i18n";
import { Button } from "@/components/ui/button";

export default function HeroSection() {
  const { language } = useLanguage();

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      const headerHeight = document.querySelector("header")?.offsetHeight || 0;
      const top = section.offsetTop - headerHeight;
      window.scrollTo({
        top,
        behavior: "smooth",
      });
    }
  };

  return (
    <section 
      className="relative min-h-[500px] h-[85vh] md:h-screen flex items-center hero-bg"
    >
      <div className="absolute inset-0 bg-primary bg-opacity-70"></div>
      <div className="container mx-auto px-4 sm:px-6 py-16 sm:py-20 md:py-24 relative z-10">
        <div className="max-w-xl sm:max-w-2xl animate-fadeIn">
          <h1 className="font-montserrat font-bold text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white leading-tight mb-4 sm:mb-6">
            {translate("hero.title", language)}
          </h1>
          <div className="text-gray-100 text-base sm:text-lg md:text-xl mb-4 sm:mb-6 md:mb-8">
            <p className="mb-1 sm:mb-2">{translate("hero.subtitle", language)}</p>
            <p>{translate("hero.subtitle2", language)}</p>
          </div>
          <p className="text-white text-sm sm:text-base md:text-lg mb-6 sm:mb-8 max-w-xl">
            {translate("hero.description", language)}
          </p>
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
            <Button
              onClick={() => scrollToSection("contacts")}
              className="bg-secondary hover:bg-secondary/90 text-white px-4 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4 rounded text-sm sm:text-base"
              size="default"
            >
              {translate("hero.callToAction", language)}
            </Button>
            <Button
              onClick={() => scrollToSection("services")}
              className="bg-white hover:bg-gray-100 text-primary px-4 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4 rounded text-sm sm:text-base"
              variant="outline"
            >
              {translate("hero.learnMore", language)}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
