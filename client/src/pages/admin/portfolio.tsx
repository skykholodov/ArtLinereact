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

type PortfolioData = {
  ru: Content | null;
  kz: Content | null;
  en: Content | null;
};

export default function AdminPortfolio() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("section");
  
  // Fetch portfolio section content
  const { data: sectionData, isLoading: sectionLoading } = useQuery<PortfolioData>({
    queryKey: ["/api/content", "portfolio", "main"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/content?sectionType=portfolio&sectionKey=main");
        if (!res.ok) {
          return { ru: null, kz: null, en: null };
        }
        return await res.json();
      } catch (error) {
        console.error("Error fetching portfolio content:", error);
        return { ru: null, kz: null, en: null };
      }
    },
  });
  
  // Fetch portfolio items
  const { data: portfolioData, isLoading: portfolioLoading, refetch: refetchPortfolio } = useQuery<PortfolioData>({
    queryKey: ["/api/content", "portfolio", "items"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/content?sectionType=portfolio&sectionKey=items");
        if (!res.ok) {
          return { ru: null, kz: null, en: null };
        }
        return await res.json();
      } catch (error) {
        console.error("Error fetching portfolio items:", error);
        return { ru: null, kz: null, en: null };
      }
    },
  });
  
  // Fetch media for portfolio
  const { data: mediaFiles, isLoading: mediaLoading, refetch: refetchMedia } = useQuery({
    queryKey: ["/api/media", "portfolio"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/media?category=portfolio");
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
    document.title = language === "ru" ? "Управление портфолио | Art Line" : 
                     language === "kz" ? "Портфолионы басқару | Art Line" : 
                     "Portfolio Management | Art Line";
  }, [language]);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">
              {translate("admin.portfolio", language)}
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
                {language === "ru" ? "Проекты" : 
                 language === "kz" ? "Жобалар" : 
                 "Projects"}
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
                  {language === "ru" ? "Основная информация о секции портфолио" : 
                   language === "kz" ? "Портфолио бөлімі туралы негізгі ақпарат" : 
                   "Main information about portfolio section"}
                </h2>
                
                {sectionLoading ? (
                  <div className="flex justify-center p-8">
                    <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <ContentForm
                    sectionType="portfolio"
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
                        name: "filters",
                        label: language === "ru" ? "Фильтры (JSON)" : 
                                language === "kz" ? "Сүзгілер (JSON)" : 
                                "Filters (JSON)",
                        type: "textarea",
                        description: language === "ru" ? "Введите фильтры в формате JSON. Объект с ключами all, signage, branding, events, digital." : 
                                    language === "kz" ? "JSON пішіміндегі сүзгілерді енгізіңіз. Келесі кілттері бар объект: all, signage, branding, events, digital." : 
                                    "Enter filters in JSON format. Object with keys all, signage, branding, events, digital.",
                      }
                    ]}
                  />
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="items" className="space-y-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">
                  {language === "ru" ? "Управление проектами портфолио" : 
                   language === "kz" ? "Портфолио жобаларын басқару" : 
                   "Manage portfolio projects"}
                </h2>
                
                {portfolioLoading ? (
                  <div className="flex justify-center p-8">
                    <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <ContentForm
                    sectionType="portfolio"
                    sectionKey="items"
                    initialData={portfolioData}
                    fields={[
                      {
                        name: "items",
                        label: language === "ru" ? "Проекты портфолио (JSON)" : 
                                language === "kz" ? "Портфолио жобалары (JSON)" : 
                                "Portfolio projects (JSON)",
                        type: "textarea",
                        description: language === "ru" ? "Введите массив проектов в формате JSON. Каждый проект должен иметь поля id, title, description, category, image." : 
                                    language === "kz" ? "JSON пішіміндегі жобалар массивін енгізіңіз. Әр жобада id, title, description, category, image өрістері болуы керек." : 
                                    "Enter an array of projects in JSON format. Each project should have id, title, description, category, image fields.",
                      }
                    ]}
                    onSaved={refetchPortfolio}
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
    "id": 1,
    "title": "Вывеска для ресторана",
    "description": "Световая вывеска с объемными буквами для нового ресторана в центре Алматы.",
    "category": "signage",
    "image": "https://images.unsplash.com/photo-1521791055366-0d553872125f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80"
  },
  {
    "id": 2,
    "title": "Брендирование автопарка",
    "description": "Комплексное брендирование корпоративного автопарка логистической компании.",
    "category": "branding",
    "image": "https://images.unsplash.com/photo-1609709295948-17d77cb2a69b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80"
  }
]`}
                  </pre>
                  <p className="text-xs text-muted-foreground mt-2">
                    {language === "ru" ? "Категории: signage, branding, events, digital" : 
                     language === "kz" ? "Санаттар: signage, branding, events, digital" : 
                     "Categories: signage, branding, events, digital"}
                  </p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="images" className="space-y-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">
                  {language === "ru" ? "Управление изображениями портфолио" : 
                   language === "kz" ? "Портфолио суреттерін басқару" : 
                   "Manage portfolio images"}
                </h2>
                
                <ImageUpload 
                  category="portfolio"
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
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
