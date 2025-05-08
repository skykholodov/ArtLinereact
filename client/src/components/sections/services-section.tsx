import { useLanguage } from "@/hooks/use-language";
import { translate } from "@/lib/i18n";
import { 
  Palette, Store, Car, CalendarDays, Printer, Laptop 
} from "lucide-react";

// Icon mapping for easy rendering
// Responsive icon sizes for different screen sizes
const iconMap: Record<string, React.ReactNode> = {
  "palette": <Palette className="text-accent text-xl sm:text-2xl" />,
  "store-alt": <Store className="text-accent text-xl sm:text-2xl" />,
  "car": <Car className="text-accent text-xl sm:text-2xl" />,
  "calendar-alt": <CalendarDays className="text-accent text-xl sm:text-2xl" />,
  "print": <Printer className="text-accent text-xl sm:text-2xl" />,
  "laptop-code": <Laptop className="text-accent text-xl sm:text-2xl" />
};

export default function ServicesSection() {
  const { language } = useLanguage();

  // Placeholder images for services
  const serviceImages = [
    "https://images.unsplash.com/photo-1570857502809-08184874388e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80",
    "https://images.unsplash.com/photo-1609709295948-17d77cb2a69b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80",
    "https://images.unsplash.com/photo-1581070198684-6440091ff2f2?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80"
  ];

  return (
    <section id="services" className="py-12 sm:py-16 md:py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-10 sm:mb-12 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl mb-3 md:mb-4 font-bold">{translate("services.title", language)}</h2>
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-gray-700">
            {translate("services.description", language)}
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Mapping through service items from translations */}
          {translate("services.items", language) && Array.isArray(JSON.parse(JSON.stringify(translate("services.items", language)))) && 
            JSON.parse(JSON.stringify(translate("services.items", language))).map((item: any, index: number) => (
              <div 
                key={index}
                className="bg-background rounded-lg shadow-md overflow-hidden transition-transform hover:transform hover:scale-105"
              >
                <img 
                  src={serviceImages[index % serviceImages.length]} // Use modulo to handle case with more items than images
                  alt={item.title} 
                  className="w-full h-40 sm:h-44 md:h-48 object-cover"
                  loading="lazy"
                />
                <div className="p-4 sm:p-5 md:p-6">
                  <h3 className="font-montserrat font-semibold text-lg sm:text-xl mb-2 sm:mb-3 line-clamp-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm sm:text-base line-clamp-3">{item.description}</p>
                </div>
              </div>
            ))
          }
        </div>
        
        <div className="mt-12 sm:mt-14 md:mt-16">
          <h3 className="font-montserrat font-bold text-xl sm:text-2xl md:text-3xl text-center mb-8 sm:mb-10 md:mb-12">
            {translate("services.sectionTitle", language)}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
            {/* Mapping through service features from translations */}
            {translate("services.features", language) && Array.isArray(JSON.parse(JSON.stringify(translate("services.features", language)))) && 
              JSON.parse(JSON.stringify(translate("services.features", language))).map((feature: any, index: number) => (
                <div 
                  key={index}
                  className="p-4 sm:p-5 md:p-6 bg-background rounded-lg shadow-sm flex flex-col items-center text-center"
                >
                  <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-accent/10 flex items-center justify-center mb-3 sm:mb-4">
                    {iconMap[feature.icon]}
                  </div>
                  <h4 className="font-montserrat font-semibold text-base sm:text-lg mb-1 sm:mb-2 line-clamp-2">{feature.title}</h4>
                  <p className="text-gray-600 text-sm sm:text-base line-clamp-3">{feature.description}</p>
                </div>
              ))
            }
          </div>
        </div>
      </div>
    </section>
  );
}
