import { useEffect, useState } from "react";
import { useLanguage } from "@/hooks/use-language";
import { translate } from "@/lib/i18n";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/admin/sidebar";
import ContentForm from "@/components/admin/content-form";
import ImageUpload from "@/components/admin/image-upload";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Content } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Image as ImageIcon } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type AboutData = {
  ru: Content | null;
  kz: Content | null;
  en: Content | null;
};

export default function AdminAbout() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("section");
  
  // Fetch about section content
  const { data: sectionData, isLoading: sectionLoading } = useQuery<AboutData>({
    queryKey: ["/api/content", "about", "main"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/content?sectionType=about&sectionKey=main");
        if (!res.ok) {
          return { ru: null, kz: null, en: null };
        }
        return await res.json();
      } catch (error) {
        console.error("Error fetching about content:", error);
        return { ru: null, kz: null, en: null };
      }
    },
  });
  
  // Fetch about features
  const { data: featuresData, isLoading: featuresLoading } = useQuery<AboutData>({
    queryKey: ["/api/content", "about", "features"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/content?sectionType=about&sectionKey=features");
        if (!res.ok) {
          return { ru: null, kz: null, en: null };
        }
        return await res.json();
      } catch (error) {
        console.error("Error fetching about features:", error);
        return { ru: null, kz: null, en: null };
      }
    },
  });
  
  // Fetch media for about
  const { data: mediaFiles, isLoading: mediaLoading, refetch: refetchMedia } = useQuery({
    queryKey: ["/api/media", "about"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/media?category=about");
        if (!res.ok) {
          return [];
        }
        return await res.json();
      } catch (error) {
        console.error("Error fetching media:", error);
        return [];
      }
    },
  });

  // Delete media file
  const handleDeleteMedia = async (id: number) => {
    try {
      await apiRequest("DELETE", `/api/media/${id}`);
      toast({
        title: "Media deleted",
        description: "Media file deleted successfully",
      });
      refetchMedia();
    } catch (error) {
      toast({
        title: "Error deleting media",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  };

  // Set page title
  useEffect(() => {
    document.title = language === "ru" ? "Управление разделом О нас | Art Line" : 
                     language === "kz" ? "Біз туралы бөлімін басқару | Art Line" : 
                     "About Us Management | Art Line";
  }, [language]);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">
              {translate("admin.about", language)}
            </h1>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="section">
                {language === "ru" ? "Основная информация" : 
                 language === "kz" ? "Негізгі ақпарат" : 
                 "Main Information"}
              </TabsTrigger>
              <TabsTrigger value="features">
                {language === "ru" ? "Преимущества" : 
                 language === "kz" ? "Артықшылықтар" : 
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
                  {language === "ru" ? "Основная информация о компании" : 
                   language === "kz" ? "Компания туралы негізгі ақпарат" : 
                   "Main information about the company"}
                </h2>
                
                {sectionLoading ? (
                  <div className="flex justify-center p-8">
                    <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <ContentForm
                    sectionType="about"
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
                        label: language === "ru" ? "Основной текст" : 
                                language === "kz" ? "Негізгі мәтін" : 
                                "Main text",
                        type: "textarea",
                      },
                      {
                        name: "chooseUsTitle",
                        label: language === "ru" ? "Заголовок блока 'Выбирайте нас'" : 
                                language === "kz" ? "'Бізді таңдаңыз' блогының тақырыбы" : 
                                "'Choose Us' block title",
                        type: "text",
                      },
                      {
                        name: "chooseUsDescription",
                        label: language === "ru" ? "Описание блока 'Выбирайте нас'" : 
                                language === "kz" ? "'Бізді таңдаңыз' блогының сипаттамасы" : 
                                "'Choose Us' block description",
                        type: "textarea",
                      }
                    ]}
                  />
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="features" className="space-y-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">
                  {language === "ru" ? "Преимущества компании" : 
                   language === "kz" ? "Компания артықшылықтары" : 
                   "Company features"}
                </h2>
                
                {featuresLoading ? (
                  <div className="flex justify-center p-8">
                    <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <ContentForm
                    sectionType="about"
                    sectionKey="features"
                    initialData={featuresData}
                    fields={[
                      {
                        name: "features",
                        label: language === "ru" ? "Преимущества (JSON)" : 
                                language === "kz" ? "Артықшылықтар (JSON)" : 
                                "Features (JSON)",
                        type: "textarea",
                        description: language === "ru" ? "Введите массив преимуществ в формате JSON. Каждое преимущество должно иметь поля icon, title и description." : 
                                    language === "kz" ? "JSON пішіміндегі артықшылықтар массивін енгізіңіз. Әр артықшылықта icon, title және description өрістері болуы керек." : 
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
    "icon": "check",
    "title": "Комплексные услуги под ключ",
    "description": "Мы предлагаем полный спектр рекламных услуг: от дизайна до монтажа и печати."
  },
  {
    "icon": "industry",
    "title": "Собственное производство",
    "description": "Высокое качество и контроль процесса на каждом этапе благодаря нашим производственным мощностям."
  },
  {
    "icon": "chart-line",
    "title": "Эффективные рекламные кампании",
    "description": "Создаём креативные и результативные решения, которые помогут достичь ваших бизнес-целей."
  }
]`}
                  </pre>
                  <p className="text-xs text-muted-foreground mt-2">
                    {language === "ru" ? "Доступные иконки: check, industry, chart-line" : 
                     language === "kz" ? "Қол жетімді белгішелер: check, industry, chart-line" : 
                     "Available icons: check, industry, chart-line"}
                  </p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="images" className="space-y-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">
                  {language === "ru" ? "Изображения для раздела О нас" : 
                   language === "kz" ? "Біз туралы бөлімі үшін суреттер" : 
                   "Images for About Us section"}
                </h2>
                
                <ImageUpload 
                  category="about"
                  onUploadComplete={() => {
                    refetchMedia();
                  }}
                  multiple={true}
                />
                
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-4">
                    {language === "ru" ? "Загруженные изображения" : 
                     language === "kz" ? "Жүктелген суреттер" : 
                     "Uploaded images"}
                  </h3>
                  
                  {mediaLoading ? (
                    <div className="flex justify-center p-8">
                      <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
                    </div>
                  ) : mediaFiles && mediaFiles.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {mediaFiles.map((file: any) => (
                        <Card key={file.id} className="overflow-hidden">
                          <CardHeader className="p-2">
                            <div className="flex justify-between items-center">
                              <CardTitle className="text-sm truncate">
                                {file.originalName}
                              </CardTitle>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteMedia(file.id)}
                                className="h-6 w-6 p-0"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="p-0">
                            {file.mimeType.startsWith("image/") ? (
                              <img
                                src={`/uploads/${file.filename}`}
                                alt={file.originalName}
                                className="w-full h-36 object-cover"
                              />
                            ) : (
                              <div className="w-full h-36 flex items-center justify-center bg-muted">
                                <ImageIcon className="h-10 w-10 text-muted-foreground" />
                              </div>
                            )}
                            <div className="p-2 text-xs text-muted-foreground">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-8 bg-muted rounded-md">
                      <ImageIcon className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                      <p>
                        {language === "ru" ? "Нет загруженных изображений" : 
                         language === "kz" ? "Жүктелген суреттер жоқ" : 
                         "No uploaded images"}
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="mt-6 p-4 bg-muted rounded-md">
                  <h3 className="text-sm font-medium mb-2">
                    {language === "ru" ? "Рекомендации по изображениям" : 
                     language === "kz" ? "Суреттер бойынша ұсыныстар" : 
                     "Image recommendations"}
                  </h3>
                  <ul className="text-sm space-y-1">
                    <li>• {language === "ru" ? "Рекомендуемый размер: 600x500 пикселей" : 
                           language === "kz" ? "Ұсынылатын өлшемі: 600x500 пиксель" : 
                           "Recommended size: 600x500 pixels"}</li>
                    <li>• {language === "ru" ? "Загрузите изображения офиса, команды, рабочего процесса и производства" : 
                           language === "kz" ? "Кеңсе, команда, жұмыс процесі және өндіріс суреттерін жүктеңіз" : 
                           "Upload images of office, team, work process, and production"}</li>
                    <li>• {language === "ru" ? "Используйте качественные фотографии с хорошим освещением" : 
                           language === "kz" ? "Жақсы жарықтандырылған сапалы фотосуреттерді пайдаланыңыз" : 
                           "Use high-quality photos with good lighting"}</li>
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
