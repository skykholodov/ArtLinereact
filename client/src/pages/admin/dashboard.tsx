import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/hooks/use-language";
import { translate } from "@/lib/i18n";
import Sidebar from "@/components/admin/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  ImageIcon,
  Users,
  FileText,
  MessageSquare,
  HelpCircle,
  Globe,
} from "lucide-react";

export default function AdminDashboard() {
  const { language } = useLanguage();
  
  // Fetch dashboard stats
  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/stats"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/stats");
        if (!res.ok) {
          return {
            sections: { hero: 0, services: 0, portfolio: 0, about: 0, testimonials: 0 },
            contentEntries: 0,
            mediaFiles: 0,
            contentRevisions: 0,
            contactSubmissions: 0,
            languages: { ru: 0, kz: 0, en: 0 },
          };
        }
        return await res.json();
      } catch (error) {
        console.error("Error fetching stats:", error);
        return {
          sections: { hero: 0, services: 0, portfolio: 0, about: 0, testimonials: 0 },
          contentEntries: 0,
          mediaFiles: 0,
          contentRevisions: 0,
          contactSubmissions: 0,
          languages: { ru: 0, kz: 0, en: 0 },
        };
      }
    },
  });

  // Set page title
  useEffect(() => {
    document.title = language === "ru" ? "Панель управления | Art Line" : 
                     language === "kz" ? "Басқару панелі | Art Line" : 
                     "Dashboard | Art Line";
  }, [language]);

  return (
    <div className="flex flex-col lg:flex-row h-screen overflow-hidden">
      <Sidebar />
      
      <div className="flex-1 overflow-auto">
        <div className="p-4 md:p-6 lg:p-8">
          <div className="flex flex-wrap items-center justify-between mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-0">
              {translate("admin.dashboard", language)}
            </h1>
          </div>
          
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {language === "ru" ? "Секции контента" : 
                   language === "kz" ? "Мазмұн бөлімдері" : 
                   "Content Sections"}
                </CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? (
                    <div className="h-8 w-24 bg-muted animate-pulse rounded"></div>
                  ) : (
                    stats?.contentEntries || 0
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {language === "ru" ? "Общее количество секций контента" : 
                   language === "kz" ? "Мазмұн бөлімдерінің жалпы саны" : 
                   "Total content sections"}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {language === "ru" ? "Медиа файлы" : 
                   language === "kz" ? "Медиа файлдар" : 
                   "Media Files"}
                </CardTitle>
                <ImageIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? (
                    <div className="h-8 w-24 bg-muted animate-pulse rounded"></div>
                  ) : (
                    stats?.mediaFiles || 0
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {language === "ru" ? "Изображения в галерее" : 
                   language === "kz" ? "Галереядағы суреттер" : 
                   "Images in gallery"}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {language === "ru" ? "Истории изменений" : 
                   language === "kz" ? "Өзгерістер тарихы" : 
                   "Content Revisions"}
                </CardTitle>
                <BarChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? (
                    <div className="h-8 w-24 bg-muted animate-pulse rounded"></div>
                  ) : (
                    stats?.contentRevisions || 0
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {language === "ru" ? "Сохраненные версии контента" : 
                   language === "kz" ? "Сақталған мазмұн нұсқалары" : 
                   "Saved content versions"}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {language === "ru" ? "Заявки обратной связи" : 
                   language === "kz" ? "Кері байланыс өтініштері" : 
                   "Contact Submissions"}
                </CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? (
                    <div className="h-8 w-24 bg-muted animate-pulse rounded"></div>
                  ) : (
                    stats?.contactSubmissions || 0
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {language === "ru" ? "Полученные обращения клиентов" : 
                   language === "kz" ? "Клиенттерден алынған өтініштер" : 
                   "Received client inquiries"}
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mt-6 lg:mt-8">
            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle className="text-base md:text-lg">
                  {language === "ru" ? "Языковой охват" : 
                   language === "kz" ? "Тілдік қамту" : 
                   "Language Coverage"}
                </CardTitle>
                <CardDescription className="text-xs md:text-sm">
                  {language === "ru" ? "Контент по языкам" : 
                   language === "kz" ? "Тілдер бойынша мазмұн" : 
                   "Content by language"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="ru">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="ru" className="text-xs sm:text-sm">Русский</TabsTrigger>
                    <TabsTrigger value="kz" className="text-xs sm:text-sm">Қазақша</TabsTrigger>
                    <TabsTrigger value="en" className="text-xs sm:text-sm">English</TabsTrigger>
                  </TabsList>
                  <TabsContent value="ru" className="space-y-4 mt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs sm:text-sm font-medium">
                          {language === "ru" ? "Секции на русском" : 
                           language === "kz" ? "Орыс тіліндегі бөлімдер" : 
                           "Russian sections"}
                        </span>
                      </div>
                      <span className="text-xs sm:text-sm font-bold">
                        {isLoading ? "..." : stats?.languages?.ru || 0}
                      </span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full"
                        style={{ width: isLoading ? "0%" : `${Math.min(100, (stats?.languages?.ru || 0) / (stats?.contentEntries || 1) * 100)}%` }}
                      ></div>
                    </div>
                  </TabsContent>
                  <TabsContent value="kz" className="space-y-4 mt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs sm:text-sm font-medium">
                          {language === "ru" ? "Секции на казахском" : 
                           language === "kz" ? "Қазақ тіліндегі бөлімдер" : 
                           "Kazakh sections"}
                        </span>
                      </div>
                      <span className="text-xs sm:text-sm font-bold">
                        {isLoading ? "..." : stats?.languages?.kz || 0}
                      </span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full"
                        style={{ width: isLoading ? "0%" : `${Math.min(100, (stats?.languages?.kz || 0) / (stats?.contentEntries || 1) * 100)}%` }}
                      ></div>
                    </div>
                  </TabsContent>
                  <TabsContent value="en" className="space-y-4 mt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs sm:text-sm font-medium">
                          {language === "ru" ? "Секции на английском" : 
                           language === "kz" ? "Ағылшын тіліндегі бөлімдер" : 
                           "English sections"}
                        </span>
                      </div>
                      <span className="text-xs sm:text-sm font-bold">
                        {isLoading ? "..." : stats?.languages?.en || 0}
                      </span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full"
                        style={{ width: isLoading ? "0%" : `${Math.min(100, (stats?.languages?.en || 0) / (stats?.contentEntries || 1) * 100)}%` }}
                      ></div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
            
            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle className="text-base md:text-lg">
                  {language === "ru" ? "Разделы сайта" : 
                   language === "kz" ? "Сайт бөлімдері" : 
                   "Website Sections"}
                </CardTitle>
                <CardDescription className="text-xs md:text-sm">
                  {language === "ru" ? "Секции с контентом" : 
                   language === "kz" ? "Мазмұны бар бөлімдер" : 
                   "Sections with content"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 gap-5 sm:gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs sm:text-sm font-medium">
                          {language === "ru" ? "Услуги" : 
                           language === "kz" ? "Қызметтер" : 
                           "Services"}
                        </span>
                      </div>
                      <span className="text-xs sm:text-sm font-bold">
                        {isLoading ? "..." : stats?.sections?.services || 0}
                      </span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-secondary rounded-full"
                        style={{ width: `${isLoading ? 0 : Math.min(100, ((stats?.sections?.services || 0) / 10) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <ImageIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs sm:text-sm font-medium">
                          {language === "ru" ? "Портфолио" : 
                           language === "kz" ? "Портфолио" : 
                           "Portfolio"}
                        </span>
                      </div>
                      <span className="text-xs sm:text-sm font-bold">
                        {isLoading ? "..." : stats?.sections?.portfolio || 0}
                      </span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-secondary rounded-full"
                        style={{ width: `${isLoading ? 0 : Math.min(100, ((stats?.sections?.portfolio || 0) / 10) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <HelpCircle className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs sm:text-sm font-medium">
                          {language === "ru" ? "О нас" : 
                           language === "kz" ? "Біз туралы" : 
                           "About Us"}
                        </span>
                      </div>
                      <span className="text-xs sm:text-sm font-bold">
                        {isLoading ? "..." : stats?.sections?.about || 0}
                      </span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-secondary rounded-full"
                        style={{ width: `${isLoading ? 0 : Math.min(100, ((stats?.sections?.about || 0) / 5) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs sm:text-sm font-medium">
                          {language === "ru" ? "Отзывы" : 
                           language === "kz" ? "Пікірлер" : 
                           "Testimonials"}
                        </span>
                      </div>
                      <span className="text-xs sm:text-sm font-bold">
                        {isLoading ? "..." : stats?.sections?.testimonials || 0}
                      </span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-secondary rounded-full"
                        style={{ width: `${isLoading ? 0 : Math.min(100, ((stats?.sections?.testimonials || 0) / 5) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>
                  {language === "ru" ? "Руководство по использованию" : 
                   language === "kz" ? "Қолдану бойынша нұсқаулық" : 
                   "User Guide"}
                </CardTitle>
                <CardDescription>
                  {language === "ru" ? "Как управлять содержимым сайта" : 
                   language === "kz" ? "Сайт мазмұнын қалай басқаруға болады" : 
                   "How to manage website content"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="rounded-lg border p-4">
                    <h3 className="font-medium mb-2">
                      {language === "ru" ? "1. Навигация по админ-панели" : 
                       language === "kz" ? "1. Әкімші панелін шарлау" : 
                       "1. Navigating the Admin Panel"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {language === "ru" ? "Используйте боковое меню для перемещения между разделами. Каждый раздел соответствует определенной части сайта." : 
                       language === "kz" ? "Бөлімдер арасында жылжу үшін бүйірлік мәзірді пайдаланыңыз. Әр бөлім сайттың белгілі бір бөлігіне сәйкес келеді." : 
                       "Use the sidebar menu to navigate between sections. Each section corresponds to a specific part of the website."}
                    </p>
                  </div>
                  
                  <div className="rounded-lg border p-4">
                    <h3 className="font-medium mb-2">
                      {language === "ru" ? "2. Редактирование контента" : 
                       language === "kz" ? "2. Мазмұнды өңдеу" : 
                       "2. Editing Content"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {language === "ru" ? "В каждом разделе вы можете редактировать контент для трех языков: русского, казахского и английского. Не забывайте сохранять изменения." : 
                       language === "kz" ? "Әр бөлімде үш тілде мазмұнды өңдей аласыз: орыс, қазақ және ағылшын. Өзгерістерді сақтауды ұмытпаңыз." : 
                       "In each section, you can edit content for three languages: Russian, Kazakh, and English. Don't forget to save your changes."}
                    </p>
                  </div>
                  
                  <div className="rounded-lg border p-4">
                    <h3 className="font-medium mb-2">
                      {language === "ru" ? "3. Управление медиа" : 
                       language === "kz" ? "3. Медианы басқару" : 
                       "3. Managing Media"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {language === "ru" ? "Загружайте изображения в соответствующие категории. Максимальный размер файла — 2 МБ. Поддерживаются форматы JPG, PNG, GIF, WebP и SVG." : 
                       language === "kz" ? "Тиісті санаттарға суреттерді жүктеңіз. Файлдың максималды өлшемі — 2 МБ. JPG, PNG, GIF, WebP және SVG пішімдеріне қолдау көрсетіледі." : 
                       "Upload images to the appropriate categories. Maximum file size is 2MB. Supported formats are JPG, PNG, GIF, WebP, and SVG."}
                    </p>
                  </div>
                  
                  <div className="rounded-lg border p-4">
                    <h3 className="font-medium mb-2">
                      {language === "ru" ? "4. История изменений" : 
                       language === "kz" ? "4. Өзгерістер тарихы" : 
                       "4. Revision History"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {language === "ru" ? "Каждое изменение контента сохраняется в истории. Вы можете просматривать предыдущие версии и восстанавливать их при необходимости." : 
                       language === "kz" ? "Мазмұнның әр өзгерісі тарихта сақталады. Алдыңғы нұсқаларды қарап, қажет болған жағдайда оларды қалпына келтіре аласыз." : 
                       "Each content change is saved in the history. You can view previous versions and restore them if needed."}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
