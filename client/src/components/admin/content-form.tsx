import { useState } from "react";
import { useLanguage } from "@/hooks/use-language";
import { translate } from "@/lib/i18n";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Content } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Save, Globe, Languages } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import LanguageTabs from "./language-tabs";
import RevisionHistory from "./revision-history";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Schema for content form validation
const contentFormSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  description: z.string().optional(),
  content: z.any().optional(),
});

type ContentFormData = z.infer<typeof contentFormSchema>;

type ContentFormProps = {
  sectionType: string;
  sectionKey: string;
  initialData?: {
    ru: Content | null;
    kz: Content | null;
    en: Content | null;
  };
  fields: Array<{
    name: string;
    label: string;
    type: "text" | "textarea" | "json";
    description?: string;
  }>;
  onSaved?: () => void;
};

export default function ContentForm({
  sectionType,
  sectionKey,
  initialData,
  fields,
  onSaved,
}: ContentFormProps) {
  const { language, setLanguage } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeLanguage, setActiveLanguage] = useState<"ru" | "kz" | "en">(language);
  const [showHistory, setShowHistory] = useState(false);
  const [autoTranslate, setAutoTranslate] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);

  // Initialize forms for each language
  const ruForm = useForm<ContentFormData>({
    resolver: zodResolver(contentFormSchema),
    defaultValues: initialData?.ru?.content as ContentFormData || {
      title: "",
      description: "",
      content: {},
    },
  });

  const kzForm = useForm<ContentFormData>({
    resolver: zodResolver(contentFormSchema),
    defaultValues: initialData?.kz?.content as ContentFormData || {
      title: "",
      description: "",
      content: {},
    },
  });

  const enForm = useForm<ContentFormData>({
    resolver: zodResolver(contentFormSchema),
    defaultValues: initialData?.en?.content as ContentFormData || {
      title: "",
      description: "",
      content: {},
    },
  });

  // Get current form based on active language
  const getCurrentForm = () => {
    switch (activeLanguage) {
      case "ru":
        return ruForm;
      case "kz":
        return kzForm;
      case "en":
        return enForm;
      default:
        return ruForm;
    }
  };

  // Save content mutation
  const saveMutation = useMutation({
    mutationFn: async (data: {
      sectionType: string;
      sectionKey: string;
      language: string;
      content: any;
      autoTranslate?: boolean;
    }) => {
      const res = await apiRequest("POST", "/api/content", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/content"] });
      toast({
        title: "Content saved",
        description: `${sectionType} content has been updated successfully.`,
      });
      if (onSaved) onSaved();
    },
    onError: (error: Error) => {
      toast({
        title: "Error saving content",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation для перевода контента
  const translateMutation = useMutation({
    mutationFn: async (data: {
      content: any;
      fields: string[];
      sourceLang: "ru" | "kz" | "en";
    }) => {
      const res = await apiRequest("POST", "/api/translate/content", data);
      return res.json();
    },
    onSuccess: (data) => {
      // Обновляем формы переводов
      if (data.kz) {
        kzForm.reset(data.kz.content || {});
      }
      if (data.en) {
        enForm.reset(data.en.content || {});
      }

      setIsTranslating(false);
      toast({
        title: "Перевод выполнен",
        description: "Контент успешно переведен на другие языки",
      });
    },
    onError: (error: Error) => {
      setIsTranslating(false);
      toast({
        title: "Ошибка перевода",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleFormSubmit = async (data: ContentFormData) => {
    if (!user) return;

    // Если включен автоперевод и мы сохраняем русский текст
    if (autoTranslate && activeLanguage === 'ru') {
      setIsTranslating(true);

      saveMutation.mutate({
        sectionType,
        sectionKey,
        language: activeLanguage,
        content: data,
        autoTranslate: true, // Добавляем флаг для сервера
      });
    } else {
      // Обычное сохранение без перевода
      saveMutation.mutate({
        sectionType,
        sectionKey,
        language: activeLanguage,
        content: data,
      });
    }
  };

  const currentForm = getCurrentForm();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <LanguageTabs
          activeLanguage={activeLanguage}
          onLanguageChange={setActiveLanguage}
        />
        
        <div className="flex items-center space-x-2">
          {activeLanguage === 'ru' && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center mr-2">
                    <Checkbox
                      id="auto-translate"
                      checked={autoTranslate}
                      onCheckedChange={(checked) => setAutoTranslate(checked as boolean)}
                      disabled={isTranslating || saveMutation.isPending}
                      className="mr-2"
                    />
                    <label
                      htmlFor="auto-translate"
                      className="text-sm flex items-center cursor-pointer select-none"
                    >
                      <Globe className="h-4 w-4 mr-1" />
                      Автоперевод
                    </label>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Автоматически переводить содержимое на казахский и английский языки при сохранении</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          
          <Button
            variant="outline"
            onClick={() => setShowHistory(!showHistory)}
          >
            {showHistory ? translate("admin.cancel", language) : translate("admin.history", language)}
          </Button>
          
          <Button
            onClick={currentForm.handleSubmit(handleFormSubmit)}
            disabled={saveMutation.isPending || isTranslating}
          >
            {saveMutation.isPending || isTranslating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {isTranslating 
              ? "Перевод..." 
              : saveMutation.isPending 
                ? "Сохранение..." 
                : translate("admin.save", language)}
          </Button>
        </div>
      </div>

      {showHistory ? (
        <RevisionHistory
          sectionType={sectionType}
          sectionKey={sectionKey}
          language={activeLanguage}
          onRestore={(content) => {
            switch (activeLanguage) {
              case "ru":
                ruForm.reset(content);
                break;
              case "kz":
                kzForm.reset(content);
                break;
              case "en":
                enForm.reset(content);
                break;
            }
            setShowHistory(false);
            toast({
              title: "Content restored",
              description: "Previous version has been restored to the editor.",
            });
          }}
        />
      ) : (
        <Tabs defaultValue={activeLanguage} value={activeLanguage} onValueChange={(value) => setActiveLanguage(value as "ru" | "kz" | "en")}>
          <TabsContent value="ru" className="mt-0">
            <Form {...ruForm}>
              <form className="space-y-6">
                {fields.map((field) => (
                  <FormField
                    key={field.name}
                    control={ruForm.control}
                    name={field.name as any}
                    render={({ field: formField }) => (
                      <FormItem>
                        <FormLabel>{field.label}</FormLabel>
                        <FormControl>
                          {field.type === "textarea" ? (
                            <Textarea
                              {...formField}
                              rows={5}
                              className="resize-none"
                            />
                          ) : (
                            <Input {...formField} />
                          )}
                        </FormControl>
                        {field.description && (
                          <FormDescription>{field.description}</FormDescription>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </form>
            </Form>
          </TabsContent>
          
          <TabsContent value="kz" className="mt-0">
            <Form {...kzForm}>
              <form className="space-y-6">
                {fields.map((field) => (
                  <FormField
                    key={field.name}
                    control={kzForm.control}
                    name={field.name as any}
                    render={({ field: formField }) => (
                      <FormItem>
                        <FormLabel>{field.label}</FormLabel>
                        <FormControl>
                          {field.type === "textarea" ? (
                            <Textarea
                              {...formField}
                              rows={5}
                              className="resize-none"
                            />
                          ) : (
                            <Input {...formField} />
                          )}
                        </FormControl>
                        {field.description && (
                          <FormDescription>{field.description}</FormDescription>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </form>
            </Form>
          </TabsContent>
          
          <TabsContent value="en" className="mt-0">
            <Form {...enForm}>
              <form className="space-y-6">
                {fields.map((field) => (
                  <FormField
                    key={field.name}
                    control={enForm.control}
                    name={field.name as any}
                    render={({ field: formField }) => (
                      <FormItem>
                        <FormLabel>{field.label}</FormLabel>
                        <FormControl>
                          {field.type === "textarea" ? (
                            <Textarea
                              {...formField}
                              rows={5}
                              className="resize-none"
                            />
                          ) : (
                            <Input {...formField} />
                          )}
                        </FormControl>
                        {field.description && (
                          <FormDescription>{field.description}</FormDescription>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
