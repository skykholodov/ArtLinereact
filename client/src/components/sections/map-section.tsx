import { useState, useEffect } from "react";
import { useLanguage } from "@/hooks/use-language";
import { useQuery } from "@tanstack/react-query";
import { Loader2, MapPin } from "lucide-react";

interface MapContent {
  mapEmbedCode?: string;
  address: string;
  latitude?: string;
  longitude?: string;
  zoom?: string;
}

export default function MapSection() {
  const { language } = useLanguage();
  const [address, setAddress] = useState("ул. Торетай 43, Алматы");
  
  // Получение контента карты из API
  const { data: mapContent, isLoading } = useQuery({
    queryKey: ["/api/content", { sectionType: "map", sectionKey: "main", language }],
    queryFn: async ({ queryKey }) => {
      const [_path, params] = queryKey as [string, { sectionType: string; sectionKey: string; language: string }];
      const res = await fetch(`/api/content?sectionType=${params.sectionType}&sectionKey=${params.sectionKey}&language=${params.language}`);
      if (!res.ok) {
        if (res.status === 404) return null;
        throw new Error(`Failed to fetch map content: ${res.statusText}`);
      }
      return await res.json();
    }
  });

  // Установка адреса в зависимости от языка и загруженных данных
  useEffect(() => {
    if (mapContent?.content?.address) {
      setAddress(mapContent.content.address);
    } else {
      // Fallback адреса на разных языках
      if (language === "ru") {
        setAddress("ул. Торетай 43, Алматы");
      } else if (language === "kz") {
        setAddress("Торетай к-сі 43, Алматы");
      } else {
        setAddress("43 Toretai St, Almaty");
      }
    }
  }, [mapContent, language]);
  
  // Формирование URL для Google Maps на основе адреса
  const getMapsUrl = () => {
    return `https://maps.google.com/?q=${encodeURIComponent(address)}`;
  };
  
  // Функция для безопасной вставки HTML
  const createMarkup = (html: string) => {
    return { __html: html };
  };
  
  // Рендеринг контента карты
  const renderMapContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-full bg-gray-100">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }
    
    // Если есть HTML-код для встраивания, используем его
    if (mapContent?.content?.mapEmbedCode) {
      return (
        <div 
          dangerouslySetInnerHTML={createMarkup(mapContent.content.mapEmbedCode)} 
          className="w-full h-full"
        />
      );
    }
    
    // Если есть координаты, формируем iframe с Google Maps
    if (mapContent?.content?.latitude && mapContent?.content?.longitude) {
      const { latitude, longitude, zoom = "15" } = mapContent.content;
      return (
        <iframe
          src={`https://maps.google.com/maps?q=${latitude},${longitude}&z=${zoom}&output=embed`}
          width="100%"
          height="100%"
          frameBorder="0"
          style={{ border: 0 }}
          allowFullScreen
          aria-hidden="false"
          tabIndex={0}
          title="Art Line на карте"
        ></iframe>
      );
    }
    
    // Fallback: статичная карта
    return (
      <div className="flex items-center justify-center h-full bg-gray-100">
        <div className="text-center">
          <MapPin className="h-12 w-12 text-secondary mx-auto mb-3" />
          <p className="text-gray-600">{address}</p>
        </div>
      </div>
    );
  };

  return (
    <section className="h-96 relative">
      <div className="absolute inset-0 z-10 pointer-events-none flex items-center">
        <div className="container mx-auto px-6">
          <div className="bg-white w-72 p-6 rounded-lg shadow-lg pointer-events-auto">
            <h3 className="font-montserrat font-semibold text-xl mb-4">
              {language === "ru" ? "Наше местоположение" :
                language === "kz" ? "Біздің орналасқан жеріміз" :
                "Our Location"}
            </h3>
            <p className="mb-4">{address}</p>
            <a 
              href={getMapsUrl()} 
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center font-medium text-accent hover:underline"
            >
              {language === "ru" ? "Проложить маршрут" :
                language === "kz" ? "Маршрут құру" :
                "Get directions"} <MapPin className="h-4 w-4 ml-1" />
            </a>
          </div>
        </div>
      </div>
      
      <div 
        id="map" 
        className="w-full h-full bg-gray-200"
        aria-label="Location map of Art Line office"
      >
        {renderMapContent()}
      </div>
    </section>
  );
}
