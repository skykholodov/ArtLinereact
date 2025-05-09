import { useEffect, useState } from "react";
import { useLanguage } from "@/hooks/use-language";
import { translate } from "@/lib/i18n";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/admin/sidebar";
import ContentForm from "@/components/admin/content-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Content } from "@shared/schema";
import { Pencil, Plus, Trash2, Star } from "lucide-react";

type TestimonialsData = {
  ru: Content | null;
  kz: Content | null;
  en: Content | null;
};

// Schema for testimonial form validation
const testimonialFormSchema = z.object({
  id: z.number().optional(),
  text: z.string().min(10, {
    message: "Testimonial text must be at least 10 characters.",
  }),
  author: z.string().min(2, {
    message: "Author name must be at least 2 characters.",
  }),
  position: z.string().min(2, {
    message: "Position must be at least 2 characters.",
  }),
  rating: z.number().min(1).max(5),
});

type TestimonialFormData = z.infer<typeof testimonialFormSchema>;

export default function AdminTestimonials() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<string>("section");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<TestimonialFormData | null>(null);
  
  // Form for adding/editing testimonials
  const form = useForm<TestimonialFormData>({
    resolver: zodResolver(testimonialFormSchema),
    defaultValues: {
      id: undefined,
      text: "",
      author: "",
      position: "",
      rating: 5,
    }
  });
  
  // Reset form when opening dialog or changing editing testimonial
  useEffect(() => {
    if (editingTestimonial) {
      form.reset(editingTestimonial);
    } else {
      form.reset({
        id: undefined,
        text: "",
        author: "",
        position: "",
        rating: 5,
      });
    }
  }, [form, editingTestimonial, isDialogOpen]);
  
  // Fetch testimonials section content
  const { data: sectionData, isLoading: sectionLoading } = useQuery<TestimonialsData>({
    queryKey: ["/api/content", "testimonials", "main"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/content?sectionType=testimonials&sectionKey=main");
        if (!res.ok) {
          return { ru: null, kz: null, en: null };
        }
        return await res.json();
      } catch (error) {
        console.error("Error fetching testimonials content:", error);
        return { ru: null, kz: null, en: null };
      }
    },
  });
  
  // Fetch testimonials items
  const { data: testimonialsData, isLoading: testimonialsLoading, refetch: refetchTestimonials } = useQuery<TestimonialsData>({
    queryKey: ["/api/content", "testimonials", "items"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/content?sectionType=testimonials&sectionKey=items");
        if (!res.ok) {
          return { ru: null, kz: null, en: null };
        }
        return await res.json();
      } catch (error) {
        console.error("Error fetching testimonials items:", error);
        return { ru: null, kz: null, en: null };
      }
    },
  });

  // Mutation for saving testimonial data
  const saveTestimonialsMutation = useMutation({
    mutationFn: async (data: { items: TestimonialFormData[] }) => {
      const activeLanguageData = testimonialsData && testimonialsData[language as keyof TestimonialsData];
      const userId = 1; // Default to 1 if not authenticated
      
      return apiRequest("POST", "/api/content", {
        sectionType: "testimonials",
        sectionKey: "items",
        language,
        content: { items: data.items },
        createdBy: userId,
        updatedBy: userId
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/content", "testimonials", "items"] });
      toast({
        title: "Testimonials saved",
        description: "Testimonials have been updated successfully",
      });
      setIsDialogOpen(false);
      setEditingTestimonial(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error saving testimonials",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const onSubmit = (formData: TestimonialFormData) => {
    const currentItems = getCurrentItems();
    
    if (formData.id) {
      // Update existing testimonial
      const updatedItems = currentItems.map(item => 
        item.id === formData.id ? formData : item
      );
      saveTestimonialsMutation.mutate({ items: updatedItems });
    } else {
      // Add new testimonial with generated ID
      const newId = Math.max(0, ...currentItems.map(item => item.id || 0)) + 1;
      const newTestimonial = { ...formData, id: newId };
      saveTestimonialsMutation.mutate({ items: [...currentItems, newTestimonial] });
    }
  };

  // Delete testimonial
  const handleDeleteTestimonial = (id?: number) => {
    if (!id) return;
    
    const currentItems = getCurrentItems();
    const updatedItems = currentItems.filter(item => item.id !== id);
    
    saveTestimonialsMutation.mutate({ items: updatedItems });
  };

  // Get current items based on active language
  const getCurrentItems = (): TestimonialFormData[] => {
    const activeLanguageData = testimonialsData && testimonialsData[language as keyof TestimonialsData];
    if (!activeLanguageData || !activeLanguageData.content) return [];
    
    const content = activeLanguageData.content as { items?: TestimonialFormData[] };
    return content.items || [];
  };

  // Set page title
  useEffect(() => {
    document.title = language === "ru" ? "Управление отзывами | Art Line" : 
                     language === "kz" ? "Пікірлерді басқару | Art Line" : 
                     "Testimonials Management | Art Line";
  }, [language]);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">
              {translate("admin.testimonials", language)}
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
                {language === "ru" ? "Отзывы клиентов" : 
                 language === "kz" ? "Клиенттер пікірлері" : 
                 "Client Testimonials"}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="section" className="space-y-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">
                  {language === "ru" ? "Основная информация о секции отзывов" : 
                   language === "kz" ? "Пікірлер бөлімі туралы негізгі ақпарат" : 
                   "Main information about testimonials section"}
                </h2>
                
                {sectionLoading ? (
                  <div className="flex justify-center p-8">
                    <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <ContentForm
                    sectionType="testimonials"
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
                      }
                    ]}
                  />
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="items" className="space-y-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">
                    {language === "ru" ? "Отзывы клиентов" : 
                     language === "kz" ? "Клиенттер пікірлері" : 
                     "Client Testimonials"}
                  </h2>
                  
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        onClick={() => setEditingTestimonial(null)}
                        className="flex items-center"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        {language === "ru" ? "Добавить отзыв" : 
                         language === "kz" ? "Пікір қосу" : 
                         "Add Testimonial"}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>
                          {editingTestimonial 
                            ? (language === "ru" ? "Редактировать отзыв" : 
                               language === "kz" ? "Пікірді өңдеу" : 
                               "Edit Testimonial")
                            : (language === "ru" ? "Добавить новый отзыв" : 
                               language === "kz" ? "Жаңа пікір қосу" : 
                               "Add New Testimonial")}
                        </DialogTitle>
                        <DialogDescription>
                          {language === "ru" ? "Заполните форму ниже, чтобы добавить отзыв клиента." : 
                           language === "kz" ? "Клиенттің пікірін қосу үшін төмендегі форманы толтырыңыз." : 
                           "Fill out the form below to add a client testimonial."}
                        </DialogDescription>
                      </DialogHeader>
                      
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                          <FormField
                            control={form.control}
                            name="text"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  {language === "ru" ? "Текст отзыва" : 
                                   language === "kz" ? "Пікір мәтіні" : 
                                   "Testimonial text"}
                                </FormLabel>
                                <FormControl>
                                  <Textarea 
                                    {...field} 
                                    rows={5}
                                    placeholder={
                                      language === "ru" ? "Введите текст отзыва..." : 
                                      language === "kz" ? "Пікір мәтінін енгізіңіз..." : 
                                      "Enter testimonial text..."
                                    }
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="author"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  {language === "ru" ? "Автор" : 
                                   language === "kz" ? "Автор" : 
                                   "Author"}
                                </FormLabel>
                                <FormControl>
                                  <Input 
                                    {...field} 
                                    placeholder={
                                      language === "ru" ? "Имя автора" : 
                                      language === "kz" ? "Автордың аты" : 
                                      "Author name"
                                    }
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="position"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  {language === "ru" ? "Должность/Описание" : 
                                   language === "kz" ? "Лауазымы/Сипаттамасы" : 
                                   "Position/Description"}
                                </FormLabel>
                                <FormControl>
                                  <Input 
                                    {...field} 
                                    placeholder={
                                      language === "ru" ? "Должность или описание" : 
                                      language === "kz" ? "Лауазымы немесе сипаттамасы" : 
                                      "Position or description"
                                    }
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="rating"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  {language === "ru" ? "Рейтинг" : 
                                   language === "kz" ? "Рейтинг" : 
                                   "Rating"}
                                </FormLabel>
                                <FormControl>
                                  <Select
                                    value={String(field.value)}
                                    onValueChange={(value) => field.onChange(parseInt(value))}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder={
                                        language === "ru" ? "Выберите рейтинг" : 
                                        language === "kz" ? "Рейтингті таңдаңыз" : 
                                        "Select rating"
                                      } />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {[1, 2, 3, 4, 5].map((rating) => (
                                        <SelectItem key={rating} value={String(rating)}>
                                          {rating} {rating === 1 
                                            ? (language === "ru" ? "звезда" : 
                                               language === "kz" ? "жұлдыз" : 
                                               "star") 
                                            : (language === "ru" ? "звезд" : 
                                               language === "kz" ? "жұлдыз" : 
                                               "stars")}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <DialogFooter>
                            <Button 
                              type="button" 
                              variant="outline" 
                              onClick={() => setIsDialogOpen(false)}
                            >
                              {language === "ru" ? "Отмена" : 
                               language === "kz" ? "Болдырмау" : 
                               "Cancel"}
                            </Button>
                            <Button 
                              type="submit"
                              disabled={saveTestimonialsMutation.isPending}
                            >
                              {saveTestimonialsMutation.isPending ? (
                                <div className="flex items-center">
                                  <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                                  {language === "ru" ? "Сохранение..." : 
                                   language === "kz" ? "Сақталуда..." : 
                                   "Saving..."}
                                </div>
                              ) : (
                                language === "ru" ? "Сохранить" : 
                                language === "kz" ? "Сақтау" : 
                                "Save"
                              )}
                            </Button>
                          </DialogFooter>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>
                
                {testimonialsLoading ? (
                  <div className="flex justify-center p-8">
                    <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <div>
                    {getCurrentItems().length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>
                              {language === "ru" ? "Автор" : 
                               language === "kz" ? "Автор" : 
                               "Author"}
                            </TableHead>
                            <TableHead>
                              {language === "ru" ? "Текст" : 
                               language === "kz" ? "Мәтін" : 
                               "Text"}
                            </TableHead>
                            <TableHead>
                              {language === "ru" ? "Рейтинг" : 
                               language === "kz" ? "Рейтинг" : 
                               "Rating"}
                            </TableHead>
                            <TableHead className="text-right">
                              {language === "ru" ? "Действия" : 
                               language === "kz" ? "Әрекеттер" : 
                               "Actions"}
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {getCurrentItems().map((testimonial) => (
                            <TableRow key={testimonial.id}>
                              <TableCell className="font-medium">
                                <div>
                                  {testimonial.author}
                                  <div className="text-xs text-muted-foreground">
                                    {testimonial.position}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="max-w-xs truncate">
                                {testimonial.text}
                              </TableCell>
                              <TableCell>
                                <div className="flex">
                                  {Array.from({ length: 5 }).map((_, index) => (
                                    <Star
                                      key={index}
                                      className={`h-4 w-4 ${
                                        index < testimonial.rating
                                          ? "fill-yellow-400 text-yellow-400"
                                          : "text-gray-300"
                                      }`}
                                    />
                                  ))}
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end space-x-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setEditingTestimonial(testimonial);
                                      setIsDialogOpen(true);
                                    }}
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteTestimonial(testimonial.id)}
                                  >
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="text-center p-8 bg-muted rounded-md">
                        <p>
                          {language === "ru" ? "Нет добавленных отзывов" : 
                           language === "kz" ? "Қосылған пікірлер жоқ" : 
                           "No testimonials added"}
                        </p>
                        <Button
                          variant="outline"
                          className="mt-4"
                          onClick={() => {
                            setEditingTestimonial(null);
                            setIsDialogOpen(true);
                          }}
                        >
                          {language === "ru" ? "Добавить первый отзыв" : 
                           language === "kz" ? "Бірінші пікірді қосу" : 
                           "Add first testimonial"}
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
