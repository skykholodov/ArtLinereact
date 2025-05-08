import { useState, useEffect } from "react";
import { useLanguage } from "@/hooks/use-language";
import { useForm } from "react-hook-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { InfoIcon, Save } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type Language } from "@/lib/i18n";

const mapScriptSchema = z.object({
  mapEmbedCode: z.string().optional(),
  address: z.string(),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  zoom: z.string().optional(),
});

type MapScriptFormData = z.infer<typeof mapScriptSchema>;

export default function MapScriptForm() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [activeLanguage, setActiveLanguage] = useState<Language>(language);

  // Получение текущего скрипта карты из API
  const { data: mapContent, isLoading } = useQuery({
    queryKey: ["/api/content", { sectionType: "map", sectionKey: "main", language: activeLanguage }],
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

  // Инициализация формы
  const form = useForm<MapScriptFormData>({
    resolver: zodResolver(mapScriptSchema),
    defaultValues: {
      mapEmbedCode: "",
      address: "",
      latitude: "",
      longitude: "",
      zoom: "15"
    },
  });

  // Обновление данных формы при загрузке контента или смене языка
  useEffect(() => {
    if (mapContent) {
      form.reset({
        mapEmbedCode: mapContent.content.mapEmbedCode || "",
        address: mapContent.content.address || "",
        latitude: mapContent.content.latitude || "",
        longitude: mapContent.content.longitude || "",
        zoom: mapContent.content.zoom || "15"
      });
    } else if (!isLoading) {
      form.reset({
        mapEmbedCode: "",
        address: "",
        latitude: "",
        longitude: "",
        zoom: "15"
      });
    }
  }, [mapContent, isLoading, form, activeLanguage]);

  // Мутация для сохранения данных карты
  const saveMutation = useMutation({
    mutationFn: async (data: MapScriptFormData) => {
      const payload = {
        sectionType: "map",
        sectionKey: "main",
        language: activeLanguage,
        content: data
      };

      const res = await apiRequest("POST", "/api/content", payload);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Настройки карты сохранены",
        description: "Изменения будут видны на сайте.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/content"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Ошибка сохранения",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: MapScriptFormData) => {
    saveMutation.mutate(data);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Настройки карты</CardTitle>
        <CardDescription>
          Вы можете использовать готовый HTML-код для встраивания карты или настроить основные параметры отображения.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="ru" onValueChange={(value) => setActiveLanguage(value as Language)}>
          <TabsList className="mb-4">
            <TabsTrigger value="ru">Русский</TabsTrigger>
            <TabsTrigger value="kz">Қазақша</TabsTrigger>
            <TabsTrigger value="en">English</TabsTrigger>
          </TabsList>

          <TabsContent value={activeLanguage}>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="mapEmbedCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>HTML-код карты</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Вставьте HTML-код карты (например, из Google Maps, Yandex Maps или 2GIS)" 
                          className="font-mono text-sm h-40" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription className="flex items-center">
                        <InfoIcon className="h-4 w-4 mr-2" />
                        Если код указан, остальные настройки игнорируются
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="p-4 bg-muted/50 rounded-lg">
                  <h3 className="text-base font-medium mb-4">Или настройте базовые параметры карты</h3>
                  
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Адрес</FormLabel>
                        <FormControl>
                          <Input placeholder="ул. Торетай 43, Алматы, Казахстан" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <FormField
                      control={form.control}
                      name="latitude"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Широта</FormLabel>
                          <FormControl>
                            <Input placeholder="43.246223" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="longitude"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Долгота</FormLabel>
                          <FormControl>
                            <Input placeholder="76.944383" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="zoom"
                    render={({ field }) => (
                      <FormItem className="mt-4">
                        <FormLabel>Масштаб (зум)</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" max="20" placeholder="15" {...field} />
                        </FormControl>
                        <FormDescription>
                          Значение от 1 (мир) до 20 (здание)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="gap-2" 
                  disabled={saveMutation.isPending}
                >
                  <Save className="h-4 w-4" />
                  {saveMutation.isPending ? "Сохранение..." : "Сохранить"}
                </Button>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}