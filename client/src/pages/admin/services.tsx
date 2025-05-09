import { useEffect, useState } from "react";
import { useLanguage } from "@/hooks/use-language";
import { translate } from "@/lib/i18n";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/admin/sidebar";
import ContentForm from "@/components/admin/content-form";
import ImageUpload from "@/components/admin/image-upload";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Content } from "@shared/schema";

type ServicesSectionData = {
  ru: Content | null;
  kz: Content | null;
  en: Content | null;
};

export default function AdminServices() {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<string>("section");
  
  // Fetch services content
  const { data: sectionData, isLoading: sectionLoading } = useQuery<ServicesSectionData>({
    queryKey: ["/api/content", "services", "main"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/content?sectionType=services&sectionKey=main");
        if (!res.ok) {
          return { ru: null, kz: null, en: null };
        }
        return await res.json();
      } catch (error) {
        console.error("Error fetching services content:", error);
        return { ru: null, kz: null, en: null };
      }
    },
  });
  
  // Fetch services items
  const { data: servicesData, isLoading: servicesLoading } = useQuery<ServicesSectionData>({
    queryKey: ["/api/content", "services", "items"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/content?sectionType=services&sectionKey=items");
        if (!res.ok) {
          return { ru: null, kz: null, en: null };
        }
        return await res.json();
      } catch (error) {
        console.error("Error fetching services items:", error);
        return { ru: null, kz: null, en: null };
      }
    },
  });
  
  // Fetch services features
  const { data: featuresData, isLoading: featuresLoading } = useQuery<ServicesSectionData>({
    queryKey: ["/api/content", "services", "features"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/content?sectionType=services&sectionKey=features");
        if (!res.ok) {
          return { ru: null, kz: null, en: null };
        }
        return await res.json();
      } catch (error) {
        console.error("Error fetching services features:", error);
        return { ru: null, kz: null, en: null };
      }
    },
  });

  // Set page title
  useEffect(() => {
    document.title = language === "ru" ? "Управление услугами | Art Line" : 
                     language === "kz" ? "Қызметтерді басқару | Art Line" : 
                     "Services Management | Art Line";
  }, [language]);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">
              {translate("admin.services", language)}
            </h1>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="section">
                {language === "ru" ? "Основная секция" : 
                 language === "kz" ? "Негізгі бөлім" : 
                 "Main Section"}
              </TabsTrigger>
              <TabsTrigger value="items">
                {language === "ru" ? "Услуги" : 
                 language === "kz" ? "Қызметтер" : 
                 "Services"}
              </TabsTrigger>
              <TabsTrigger value="features">
                {language === "ru" ? "Особенности" : 
                 language === "kz" ? "Ерекшеліктер" : 
                 "Features"}
              </TabsTrigger>
              <TabsTrigger value="images">
                {language === "ru" ? "Изображения" : 
                 language === "kz" ? "Суреттер" : 
                 "Images"}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="section" className="space-y-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">
                  {language === "ru" ? "Основная информация о секции услуг" : 
                   language === "kz" ? "Қызметтер бөлімі туралы негізгі ақпарат" : 
                   "Main information about services section"}
                </h2>
                
                {sectionLoading ? (
                  <div className="flex justify-center p-8">
                    <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <ContentForm
                    sectionType="services"
                    sectionKey="main"
                    initialData={sectionData}
                    fields={[
                      {
                        name: "title",
                        label: language === "ru" ? "Заголовок" : 
                                language === "kz" ? "Тақырып" : 
                                "Title",
                        type: "text",
                      },
                      {
                        name: "description",
                        label: language === "ru" ? "Описание" : 
                                language === "kz" ? "Сипаттама" : 
                                "Description",
                        type: "textarea",
                      },
                      {
                        name: "sectionTitle",
                        label: language === "ru" ? "Заголовок подсекции" : 
                                language === "kz" ? "Бөлімше тақырыбы" : 
                                "Subsection Title",
                        type: "text",
                      },
                    ]}
                  />
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="items" className="space-y-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">
                  {language === "ru" ? "Управление списком услуг" : 
                   language === "kz" ? "Қызметтер тізімін басқару" : 
                   "Manage services list"}
                </h2>
                
                {servicesLoading ? (
                  <div className="flex justify-center p-8">
                    <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <ContentForm
                    sectionType="services"
                    sectionKey="items"
                    initialData={servicesData}
                    fields={[
                      {
                        name: "items",
                        label: language === "ru" ? "Список услуг (JSON)" : 
                                language === "kz" ? "Қызметтер тізімі (JSON)" : 
                                "Services list (JSON)",
                        type: "textarea",
                        description: language === "ru" ? "Введите массив услуг в формате JSON. Каждая услуга должна иметь поля title и description." : 
                                    language === "kz" ? "JSON пішіміндегі қызметтер массивін енгізіңіз. Әр қызметте title және description өрістері болуы керек." : 
                                    "Enter an array of services in JSON format. Each service should have title and description fields.",
                      }
                    ]}
                  />
                )}
                
                <div className="mt-4 p-4 bg-muted rounded-md">
                  <h3 className="text-sm font-medium mb-2">
                    {language === "ru" ? "Пример JSON формата" : 
                     language === "kz" ? "JSON пішімінің мысалы" : 
                     "Example JSON format"}
                  </h3>
                  <pre className="text-xs overflow-auto p-2 bg-background rounded">
                    {`[
  {
    "title": "Разработка и производство вывесок",
    "description": "Создаём уникальные и привлекательные вывески, которые помогут вашему бизнесу выделиться и привлечь внимание клиентов."
  },
  {
    "title": "Брендирование автомобилей и оформление мероприятий",
    "description": "Превращаем автомобили в мобильные рекламные носители и создаём запоминающееся оформление для мероприятий."
  },
  {
    "title": "Печать баннеров и стикеров, digital-дизайн",
    "description": "Печатаем качественные баннеры и стикеры, а также разрабатываем эффективный дизайн для цифровых платформ."
  }
]`}
                  </pre>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="features" className="space-y-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">
                  {language === "ru" ? "Управление особенностями услуг" : 
                   language === "kz" ? "Қызметтер ерекшеліктерін басқару" : 
                   "Manage service features"}
                </h2>
                
                {featuresLoading ? (
                  <div className="flex justify-center p-8">
                    <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <ContentForm
                    sectionType="services"
                    sectionKey="features"
                    initialData={featuresData}
                    fields={[
                      {
                        name: "features",
                        label: language === "ru" ? "Особенности услуг (JSON)" : 
                                language === "kz" ? "Қызмет ерекшеліктері (JSON)" : 
                                "Service features (JSON)",
                        type: "textarea",
                        description: language === "ru" ? "Введите массив особенностей в формате JSON. Каждая особенность должна иметь поля icon, title и description." : 
                                    language === "kz" ? "JSON пішіміндегі ерекшеліктер массивін енгізіңіз. Әр ерекшелікте icon, title және description өрістері болуы керек." : 
                                    "Enter an array of features in JSON format. Each feature should have icon, title and description fields.",
                      }
                    ]}
                  />
                )}
                
                <div className="mt-4 p-4 bg-muted rounded-md">
                  <h3 className="text-sm font-medium mb-2">
                    {language === "ru" ? "Пример JSON формата" : 
                     language === "kz" ? "JSON пішімінің мысалы" : 
                     "Example JSON format"}
                  </h3>
                  <pre className="text-xs overflow-auto p-2 bg-background rounded">
                    {`[
  {
    "icon": "palette",
    "title": "Разработка дизайна",
    "description": "Создаём уникальные и запоминающиеся визуальные концепции для вашего бренда."
  },
  {
    "icon": "store-alt",
    "title": "Изготовление вывесок",
    "description": "Выразительные и функциональные вывески, которые привлекут внимание к вашему бизнесу."
  },
  {
    "icon": "car",
    "title": "Брендирование автомобилей",
    "description": "Превращаем автомобили в движущуюся рекламу вашего бренда."
  }
]`}
                  </pre>
                  <p className="text-xs text-muted-foreground mt-2">
                    {language === "ru" ? "Доступные иконки: palette, store-alt, car, calendar-alt, print, laptop-code" : 
                     language === "kz" ? "Қол жетімді белгішелер: palette, store-alt, car, calendar-alt, print, laptop-code" : 
                     "Available icons: palette, store-alt, car, calendar-alt, print, laptop-code"}
                  </p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="images" className="space-y-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">
                  {language === "ru" ? "Изображения для секции услуг" : 
                   language === "kz" ? "Қызметтер бөлімі үшін суреттер" : 
                   "Images for services section"}
                </h2>
                
                <ImageUpload 
                  category="services"
                  onUploadComplete={(data) => {
                    console.log("Upload complete:", data);
                  }}
                />
                
                <div className="mt-6 p-4 bg-muted rounded-md">
                  <h3 className="text-sm font-medium mb-2">
                    {language === "ru" ? "Рекомендации по изображениям" : 
                     language === "kz" ? "Суреттер бойынша ұсыныстар" : 
                     "Image recommendations"}
                  </h3>
                  <ul className="text-sm space-y-1">
                    <li>• {language === "ru" ? "Оптимальный размер: 600x400 пикселей" : 
                           language === "kz" ? "Оңтайлы өлшемі: 600x400 пиксель" : 
                           "Optimal size: 600x400 pixels"}</li>
                    <li>• {language === "ru" ? "Формат: JPG, PNG или WebP" : 
                           language === "kz" ? "Пішімі: JPG, PNG немесе WebP" : 
                           "Format: JPG, PNG or WebP"}</li>
                    <li>• {language === "ru" ? "Максимальный размер файла: 2 МБ" : 
                           language === "kz" ? "Файлдың максималды өлшемі: 2 МБ" : 
                           "Maximum file size: 2 MB"}</li>
                    <li>• {language === "ru" ? "Используйте изображения, отражающие предоставляемые услуги" : 
                           language === "kz" ? "Көрсетілетін қызметтерді көрсететін суреттерді пайдаланыңыз" : 
                           "Use images that reflect the services provided"}</li>
                  </ul>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
