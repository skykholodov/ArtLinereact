import { useLanguage } from "@/hooks/use-language";
import { translate } from "@/lib/i18n";
import { 
  Palette, Store, Car, CalendarDays, Printer, Laptop 
} from "lucide-react";

// Icon mapping for easy rendering
const iconMap: Record<string, React.ReactNode> = {
  "palette": <Palette className="text-accent text-2xl" />,
  "store-alt": <Store className="text-accent text-2xl" />,
  "car": <Car className="text-accent text-2xl" />,
  "calendar-alt": <CalendarDays className="text-accent text-2xl" />,
  "print": <Printer className="text-accent text-2xl" />,
  "laptop-code": <Laptop className="text-accent text-2xl" />
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
    <section id="services" className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl mb-4">{translate("services.title", language)}</h2>
          <p className="max-w-2xl mx-auto text-lg">
            {translate("services.description", language)}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Mapping through service items from translations */}
          {translate("services.items", language) && Array.isArray(JSON.parse(JSON.stringify(translate("services.items", language)))) && 
            JSON.parse(JSON.stringify(translate("services.items", language))).map((item: any, index: number) => (
              <div 
                key={index}
                className="bg-background rounded-lg shadow-md overflow-hidden transition-transform hover:transform hover:scale-105"
              >
                <img 
                  src={serviceImages[index]} 
                  alt={item.title} 
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <h3 className="font-montserrat font-semibold text-xl mb-3">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              </div>
            ))
          }
        </div>
        
        <div className="mt-16">
          <h3 className="font-montserrat font-bold text-2xl md:text-3xl text-center mb-12">
            {translate("services.sectionTitle", language)}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Mapping through service features from translations */}
            {translate("services.features", language) && Array.isArray(JSON.parse(JSON.stringify(translate("services.features", language)))) && 
              JSON.parse(JSON.stringify(translate("services.features", language))).map((feature: any, index: number) => (
                <div 
                  key={index}
                  className="p-6 bg-background rounded-lg shadow-sm flex flex-col items-center text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                    {iconMap[feature.icon]}
                  </div>
                  <h4 className="font-montserrat font-semibold text-lg mb-2">{feature.title}</h4>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))
            }
          </div>
        </div>
      </div>
    </section>
  );
}
