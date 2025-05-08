import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { useLanguage } from "@/hooks/use-language";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Upload } from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { type Language } from "@/lib/i18n";

// Схема для формы массового импорта
const bulkImportSchema = z.object({
  sectionType: z.enum(["portfolio", "services", "testimonials"]),
  format: z.enum(["json", "csv"]),
  content: z.string().min(5, "Содержимое не может быть пустым"),
  language: z.enum(["ru", "kz", "en"])
});

type BulkImportFormData = z.infer<typeof bulkImportSchema>;

// Примеры данных для разных типов секций
const examples = {
  portfolio: {
    json: `[
  {
    "title": "Рекламная кампания для ТОО \"Альфа\"",
    "description": "Разработка комплексной рекламной стратегии",
    "category": "branding",
    "image": "https://example.com/image1.jpg",
    "date": "2023-05-15"
  },
  {
    "title": "Редизайн упаковки для линейки продуктов",
    "description": "Создание современного дизайна упаковки",
    "category": "packaging",
    "image": "https://example.com/image2.jpg",
    "date": "2023-03-10"
  }
]`,
    csv: `title,description,category,image,date
"Рекламная кампания для ТОО \"Альфа\"","Разработка комплексной рекламной стратегии",branding,https://example.com/image1.jpg,2023-05-15
"Редизайн упаковки для линейки продуктов","Создание современного дизайна упаковки",packaging,https://example.com/image2.jpg,2023-03-10`
  },
  services: {
    json: `[
  {
    "title": "Брендинг и айдентика",
    "description": "Создание уникального визуального стиля",
    "icon": "palette",
    "price": "от 150 000 ₸" 
  },
  {
    "title": "Дизайн упаковки",
    "description": "Разработка привлекательной упаковки",
    "icon": "box",
    "price": "от 100 000 ₸"
  }
]`,
    csv: `title,description,icon,price
"Брендинг и айдентика","Создание уникального визуального стиля",palette,"от 150 000 ₸"
"Дизайн упаковки","Разработка привлекательной упаковки",box,"от 100 000 ₸"`
  },
  testimonials: {
    json: `[
  {
    "author": "Динара Камилова",
    "position": "Маркетинг-директор, ТОО \"БетаСтрой\"",
    "text": "Отличная работа! Команда Art Line превзошла все наши ожидания.",
    "rating": 5,
    "company": "БетаСтрой"
  },
  {
    "author": "Алексей Петров",
    "position": "CEO, Bright Solutions",
    "text": "Результаты рекламной кампании впечатляют, продажи выросли на 30%.",
    "rating": 5,
    "company": "Bright Solutions"
  }
]`,
    csv: `author,position,text,rating,company
"Динара Камилова","Маркетинг-директор, ТОО \"БетаСтрой\"","Отличная работа! Команда Art Line превзошла все наши ожидания.",5,БетаСтрой
"Алексей Петров","CEO, Bright Solutions","Результаты рекламной кампании впечатляют, продажи выросли на 30%.",5,"Bright Solutions"`
  }
};

export default function BulkImportForm() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("json");
  const [selectedType, setSelectedType] = useState<"portfolio" | "services" | "testimonials">("portfolio");
  const [importLanguage, setImportLanguage] = useState<Language>("ru");
  
  const form = useForm<BulkImportFormData>({
    resolver: zodResolver(bulkImportSchema),
    defaultValues: {
      sectionType: "portfolio",
      format: "json",
      content: examples.portfolio.json,
      language: "ru"
    }
  });
  
  // Обновление примера контента при изменении типа секции или формата
  const updateExampleContent = (type: "portfolio" | "services" | "testimonials", format: "json" | "csv") => {
    setSelectedType(type);
    setActiveTab(format);
    form.setValue("sectionType", type);
    form.setValue("format", format);
    form.setValue("content", examples[type][format]);
  };
  
  // Обновление языка импорта
  const updateLanguage = (lang: Language) => {
    setImportLanguage(lang);
    form.setValue("language", lang);
  };

  // Мутация для отправки данных на сервер
  const importMutation = useMutation({
    mutationFn: async (data: BulkImportFormData) => {
      const res = await apiRequest("POST", "/api/bulk-import", data);
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Импорт завершен успешно",
        description: `Импортировано ${data.importedCount} записей.`,
      });
      
      // Инвалидируем запросы, чтобы обновить данные
      queryClient.invalidateQueries({ queryKey: ["/api/portfolio"] });
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      queryClient.invalidateQueries({ queryKey: ["/api/testimonials"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Ошибка импорта",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Обработчик отправки формы
  const onSubmit = (data: BulkImportFormData) => {
    importMutation.mutate(data);
  };
  
  return (
    <Card className="w-full mb-8">
      <CardHeader>
        <CardTitle>
          {language === "ru" ? "Массовый импорт" : 
           language === "kz" ? "Жаппай импорт" : 
           "Bulk Import"}
        </CardTitle>
        <CardDescription>
          {language === "ru" ? "Импортируйте несколько записей за один раз в формате JSON или CSV" : 
           language === "kz" ? "JSON немесе CSV форматындағы бірнеше жазбаларды бір уақытта импорттаңыз" : 
           "Import multiple records at once in JSON or CSV format"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="sectionType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {language === "ru" ? "Тип раздела" : 
                       language === "kz" ? "Бөлім түрі" : 
                       "Section Type"}
                    </FormLabel>
                    <Select 
                      value={field.value}
                      onValueChange={(value: "portfolio" | "services" | "testimonials") => {
                        field.onChange(value);
                        updateExampleContent(value, form.getValues("format") as "json" | "csv");
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="portfolio">
                          {language === "ru" ? "Портфолио" : 
                           language === "kz" ? "Портфолио" : 
                           "Portfolio"}
                        </SelectItem>
                        <SelectItem value="services">
                          {language === "ru" ? "Услуги" : 
                           language === "kz" ? "Қызметтер" : 
                           "Services"}
                        </SelectItem>
                        <SelectItem value="testimonials">
                          {language === "ru" ? "Отзывы" : 
                           language === "kz" ? "Пікірлер" : 
                           "Testimonials"}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="format"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {language === "ru" ? "Формат данных" : 
                       language === "kz" ? "Деректер форматы" : 
                       "Data Format"}
                    </FormLabel>
                    <Select 
                      value={field.value}
                      onValueChange={(value: "json" | "csv") => {
                        field.onChange(value);
                        updateExampleContent(selectedType, value);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="json">JSON</SelectItem>
                        <SelectItem value="csv">CSV</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {language === "ru" ? "Язык контента" : 
                       language === "kz" ? "Мазмұн тілі" : 
                       "Content Language"}
                    </FormLabel>
                    <Select 
                      value={field.value}
                      onValueChange={(value: Language) => {
                        field.onChange(value);
                        updateLanguage(value);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ru">Русский</SelectItem>
                        <SelectItem value="kz">Қазақша</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <Tabs value={activeTab} onValueChange={(value) => updateExampleContent(selectedType, value as "json" | "csv")}>
              <TabsList className="mb-4">
                <TabsTrigger value="json">JSON</TabsTrigger>
                <TabsTrigger value="csv">CSV</TabsTrigger>
              </TabsList>
              
              <TabsContent value={activeTab}>
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {language === "ru" ? "Данные для импорта" : 
                         language === "kz" ? "Импорттау деректері" : 
                         "Import Data"}
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          className="font-mono text-sm min-h-[260px] resize-y"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        {language === "ru" ? "Формат данных зависит от выбранного типа раздела" : 
                         language === "kz" ? "Деректер форматы таңдалған бөлім түріне байланысты" : 
                         "Data format depends on the selected section type"}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
            </Tabs>
            
            <Button 
              type="submit" 
              className="gap-2"
              disabled={importMutation.isPending}
            >
              {importMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {language === "ru" ? "Импортирую..." : 
                   language === "kz" ? "Импорттау..." : 
                   "Importing..."}
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  {language === "ru" ? "Импортировать" : 
                   language === "kz" ? "Импорттау" : 
                   "Import"}
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}