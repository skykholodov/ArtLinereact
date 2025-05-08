import { useLanguage } from "@/hooks/use-language";
import { translate } from "@/lib/i18n";
import { Check, Factory, TrendingUp } from "lucide-react";

// Icon mapping for features
const iconMap: Record<string, React.ReactNode> = {
  "check": <Check className="text-white" />,
  "industry": <Factory className="text-white" />,
  "chart-line": <TrendingUp className="text-white" />
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
    <section id="about" className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl mb-6">{translate("about.title", language)}</h2>
            <p className="text-lg mb-6">
              {translate("about.description", language)}
            </p>
            
            <h3 className="font-montserrat font-semibold text-2xl mb-6">{translate("about.chooseUsTitle", language)}</h3>
            <p className="mb-8">
              {translate("about.chooseUsDescription", language)}
            </p>
            
            <div className="space-y-6">
              {/* Mapping through about features from translations */}
              {translate("about.features", language) && Array.isArray(JSON.parse(JSON.stringify(translate("about.features", language)))) && 
                JSON.parse(JSON.stringify(translate("about.features", language))).map((feature: any, index: number) => (
                  <div key={index} className="flex">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                        {iconMap[feature.icon]}
                      </div>
                    </div>
                    <div className="ml-4">
                      <h4 className="font-montserrat font-semibold text-lg mb-2">{feature.title}</h4>
                      <p className="text-gray-600">{feature.description}</p>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <img 
              src={aboutImages[0]} 
              alt="Команда Art Line за работой" 
              className="rounded-lg shadow-md w-full h-64 object-cover"
            />
            
            <img 
              src={aboutImages[1]} 
              alt="Производственный цех" 
              className="rounded-lg shadow-md w-full h-64 object-cover mt-8"
            />
            
            <img 
              src={aboutImages[2]} 
              alt="Дизайн-процесс" 
              className="rounded-lg shadow-md w-full h-64 object-cover"
            />
            
            <img 
              src={aboutImages[3]} 
              alt="Монтаж рекламных конструкций" 
              className="rounded-lg shadow-md w-full h-64 object-cover mt-8"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
