import { useState } from "react";
import { useLanguage } from "@/hooks/use-language";
import { translate } from "@/lib/i18n";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";

type PortfolioItem = {
  id: number;
  title: string;
  description: string;
  category: string;
  image: string;
};

type PortfolioCategory = "all" | "signage" | "branding" | "events" | "digital";

export default function PortfolioSection() {
  const { language } = useLanguage();
  const [activeFilter, setActiveFilter] = useState<PortfolioCategory>("all");

  // Fetch portfolio data from API
  const { data: portfolioItems = [], isLoading } = useQuery<PortfolioItem[]>({
    queryKey: ["/api/portfolio", language],
    // Fallback to demo data if API call fails
    placeholderData: [
      {
        id: 1,
        title: language === "ru" ? "Вывеска для ресторана" : 
               language === "kz" ? "Мейрамхана үшін маңдайша" : 
               "Restaurant Signage",
        description: language === "ru" ? "Световая вывеска с объемными буквами для нового ресторана в центре Алматы." : 
                     language === "kz" ? "Алматы орталығындағы жаңа мейрамхана үшін көлемді әріптері бар жарық маңдайша." : 
                     "Illuminated signage with 3D letters for a new restaurant in the center of Almaty.",
        category: "signage",
        image: "https://images.unsplash.com/photo-1521791055366-0d553872125f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80"
      },
      {
        id: 2,
        title: language === "ru" ? "Брендирование автопарка" : 
               language === "kz" ? "Автопаркті брендтеу" : 
               "Fleet Branding",
        description: language === "ru" ? "Комплексное брендирование корпоративного автопарка логистической компании." : 
                     language === "kz" ? "Логистикалық компанияның корпоративтік автопаркін кешенді брендтеу." : 
                     "Comprehensive branding of a logistics company's corporate fleet.",
        category: "branding",
        image: "https://images.unsplash.com/photo-1609709295948-17d77cb2a69b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80"
      },
      {
        id: 3,
        title: language === "ru" ? "Оформление мероприятия" : 
               language === "kz" ? "Іс-шараны безендіру" : 
               "Event Decoration",
        description: language === "ru" ? "Полное оформление корпоративного события с брендированными материалами." : 
                     language === "kz" ? "Брендтелген материалдары бар корпоративтік іс-шараны толық безендіру." : 
                     "Complete decoration of a corporate event with branded materials.",
        category: "events",
        image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80"
      },
      {
        id: 4,
        title: language === "ru" ? "Диджитал-кампания" : 
               language === "kz" ? "Цифрлық науқан" : 
               "Digital Campaign",
        description: language === "ru" ? "Разработка и реализация комплексной диджитал-кампании для бренда одежды." : 
                     language === "kz" ? "Киім бренді үшін кешенді цифрлық науқанды әзірлеу және іске асыру." : 
                     "Development and implementation of a comprehensive digital campaign for a clothing brand.",
        category: "digital",
        image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80"
      },
      {
        id: 5,
        title: language === "ru" ? "Наружная реклама" : 
               language === "kz" ? "Сыртқы жарнама" : 
               "Outdoor Advertising",
        description: language === "ru" ? "Разработка и размещение наружной рекламы для крупного торгового центра." : 
                     language === "kz" ? "Үлкен сауда орталығы үшін сыртқы жарнаманы әзірлеу және орналастыру." : 
                     "Development and placement of outdoor advertising for a large shopping center.",
        category: "signage",
        image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80"
      },
      {
        id: 6,
        title: language === "ru" ? "Брендирование транспорта" : 
               language === "kz" ? "Көлікті брендтеу" : 
               "Vehicle Branding",
        description: language === "ru" ? "Оклейка специализированного транспорта для службы доставки продуктов." : 
                     language === "kz" ? "Өнімдерді жеткізу қызметі үшін мамандандырылған көлікті жапсыру." : 
                     "Wrapping of specialized vehicles for a grocery delivery service.",
        category: "branding",
        image: "https://images.unsplash.com/photo-1581068506097-9eb0677b95af?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80"
      }
    ]
  });

  // Filter the portfolio items based on the active filter
  const filteredItems = activeFilter === "all" 
    ? portfolioItems 
    : portfolioItems.filter(item => item.category === activeFilter);

  return (
    <section id="portfolio" className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl mb-4">{translate("portfolio.title", language)}</h2>
          <p className="max-w-2xl mx-auto text-lg">
            {translate("portfolio.description", language)}
          </p>
        </div>
        
        <div className="flex flex-wrap justify-center mb-8">
          {Object.entries(JSON.parse(JSON.stringify(translate("portfolio.filters", language)))).map(([key, value]) => (
            <Button
              key={key}
              onClick={() => setActiveFilter(key as PortfolioCategory)}
              variant={activeFilter === key ? "default" : "outline"}
              className={`m-2 ${activeFilter === key 
                ? 'bg-primary text-white' 
                : 'bg-white text-primary hover:bg-gray-100'}`}
            >
              {value as string}
            </Button>
          ))}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            // Loading skeleton
            Array(6).fill(0).map((_, index) => (
              <div key={index} className="bg-white rounded-lg overflow-hidden shadow-md animate-pulse">
                <div className="w-full h-64 bg-gray-300"></div>
                <div className="p-6">
                  <div className="h-6 bg-gray-300 rounded w-3/4 mb-3"></div>
                  <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-5/6"></div>
                </div>
              </div>
            ))
          ) : (
            filteredItems.map((item) => (
              <div 
                key={item.id}
                className="portfolio-item bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow"
                data-category={item.category}
              >
                <div className="relative overflow-hidden group">
                  <img 
                    src={item.image} 
                    alt={item.title} 
                    className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-primary bg-opacity-60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button
                      className="bg-white text-primary transform -translate-y-4 group-hover:translate-y-0 transition-transform"
                    >
                      {translate("portfolio.viewProject", language)}
                    </Button>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-montserrat font-semibold text-xl mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              </div>
            ))
          )}
        </div>
        
        <div className="text-center mt-12">
          <Button 
            className="inline-flex items-center justify-center bg-primary text-white"
            size="lg"
          >
            {translate("portfolio.viewAll", language)}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
