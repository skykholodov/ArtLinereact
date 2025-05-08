import { useLanguage } from "@/hooks/use-language";
import { translate } from "@/lib/i18n";
import { Check, Factory, TrendingUp } from "lucide-react";

// Icon mapping for features with responsive sizes
const iconMap: Record<string, React.ReactNode> = {
  "check": <Check className="text-white h-4 w-4 sm:h-5 sm:w-5" />,
  "industry": <Factory className="text-white h-4 w-4 sm:h-5 sm:w-5" />,
  "chart-line": <TrendingUp className="text-white h-4 w-4 sm:h-5 sm:w-5" />
};

export default function AboutSection() {
  const { language } = useLanguage();

  // About section images
  const aboutImages = [
    "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=500&q=80",
    "https://images.unsplash.com/photo-1551184451-76b762941ad6?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=500&q=80",
    "https://images.unsplash.com/photo-1531538606174-0f90ff5dce83?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=500&q=80",
    "https://images.unsplash.com/photo-1527689368864-3a821dbccc34?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=500&q=80"
  ];

  return (
    <section id="about" className="py-12 sm:py-16 md:py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10 lg:gap-12 items-center">
          <div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl mb-4 sm:mb-6 font-bold">{translate("about.title", language)}</h2>
            <p className="text-base sm:text-lg mb-4 sm:mb-6 text-gray-700">
              {translate("about.description", language)}
            </p>
            
            <h3 className="font-montserrat font-semibold text-xl sm:text-2xl mb-4 sm:mb-6">{translate("about.chooseUsTitle", language)}</h3>
            <p className="mb-6 sm:mb-8 text-gray-600">
              {translate("about.chooseUsDescription", language)}
            </p>
            
            <div className="space-y-4 sm:space-y-6">
              {/* Mapping through about features from translations */}
              {translate("about.features", language) && Array.isArray(JSON.parse(JSON.stringify(translate("about.features", language)))) && 
                JSON.parse(JSON.stringify(translate("about.features", language))).map((feature: any, index: number) => (
                  <div key={index} className="flex">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-secondary flex items-center justify-center">
                        {iconMap[feature.icon]}
                      </div>
                    </div>
                    <div className="ml-3 sm:ml-4">
                      <h4 className="font-montserrat font-semibold text-base sm:text-lg mb-1 sm:mb-2">{feature.title}</h4>
                      <p className="text-gray-600 text-sm sm:text-base">{feature.description}</p>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
          
          {/* Image grid with mobile-optimized layout */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 mt-6 lg:mt-0">
            <img 
              src={aboutImages[0]} 
              alt="Команда Art Line за работой" 
              className="rounded-lg shadow-md w-full h-32 sm:h-48 md:h-56 lg:h-64 object-cover"
              loading="lazy"
            />
            
            <img 
              src={aboutImages[1]} 
              alt="Производственный цех" 
              className="rounded-lg shadow-md w-full h-32 sm:h-48 md:h-56 lg:h-64 object-cover mt-4 sm:mt-6 md:mt-8"
              loading="lazy"
            />
            
            <img 
              src={aboutImages[2]} 
              alt="Дизайн-процесс" 
              className="rounded-lg shadow-md w-full h-32 sm:h-48 md:h-56 lg:h-64 object-cover"
              loading="lazy"
            />
            
            <img 
              src={aboutImages[3]} 
              alt="Монтаж рекламных конструкций" 
              className="rounded-lg shadow-md w-full h-32 sm:h-48 md:h-56 lg:h-64 object-cover mt-4 sm:mt-6 md:mt-8"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
