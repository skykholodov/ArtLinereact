import { useEffect, useState } from "react";
import { useLanguage } from "@/hooks/use-language";
import { translate } from "@/lib/i18n";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/admin/sidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import {
  Eye,
  CheckCircle,
  XCircle,
  FileText,
  Phone,
  Mail,
  Calendar,
  MessageSquare,
  Filter,
} from "lucide-react";
import ContentForm from "@/components/admin/content-form";
import { Content } from "@shared/schema";

type ContactsData = {
  ru: Content | null;
  kz: Content | null;
  en: Content | null;
};

type ContactSubmission = {
  id: number;
  name: string;
  phone: string;
  email: string;
  service: string;
  message: string;
  createdAt: string;
  processed: boolean;
};

export default function AdminContacts() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<string>("submissions");
  const [viewingSubmission, setViewingSubmission] = useState<ContactSubmission | null>(null);
  const [filterProcessed, setFilterProcessed] = useState<string>("all");
  const [confirmProcessSubmission, setConfirmProcessSubmission] = useState<ContactSubmission | null>(null);
  
  // Fetch contacts section content
  const { data: sectionData, isLoading: sectionLoading } = useQuery<ContactsData>({
    queryKey: ["/api/content", "contacts", "main"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/content?sectionType=contacts&sectionKey=main");
        if (!res.ok) {
          return { ru: null, kz: null, en: null };
        }
        return await res.json();
      } catch (error) {
        console.error("Error fetching contacts content:", error);
        return { ru: null, kz: null, en: null };
      }
    },
  });
  
  // Fetch contact submissions
  const { data: submissions = [], isLoading: submissionsLoading, refetch: refetchSubmissions } = useQuery<ContactSubmission[]>({
    queryKey: ["/api/contact"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/contact");
        if (!res.ok) {
          return [];
        }
        return await res.json();
      } catch (error) {
        console.error("Error fetching contact submissions:", error);
        return [];
      }
    },
  });

  // Update submission processed status
  const updateSubmissionMutation = useMutation({
    mutationFn: async ({ id, processed }: { id: number; processed: boolean }) => {
      return apiRequest("PATCH", `/api/contact/${id}`, { processed });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contact"] });
      toast({
        title: language === "ru" ? "Статус обновлен" : 
               language === "kz" ? "Күй жаңартылды" : 
               "Status updated",
        description: language === "ru" ? "Статус заявки успешно обновлен" : 
                     language === "kz" ? "Өтінім күйі сәтті жаңартылды" : 
                     "Contact submission status successfully updated",
      });
      setConfirmProcessSubmission(null);
    },
    onError: (error: Error) => {
      toast({
        title: language === "ru" ? "Ошибка обновления" : 
               language === "kz" ? "Жаңарту қатесі" : 
               "Update error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle marking submission as processed/unprocessed
  const handleToggleProcessed = (submission: ContactSubmission) => {
    setConfirmProcessSubmission(submission);
  };

  // Confirm processing status change
  const confirmProcessingChange = () => {
    if (confirmProcessSubmission) {
      updateSubmissionMutation.mutate({
        id: confirmProcessSubmission.id,
        processed: !confirmProcessSubmission.processed
      });
    }
  };

  // Filter submissions by processed status
  const filteredSubmissions = submissions.filter(submission => {
    if (filterProcessed === "all") return true;
    if (filterProcessed === "processed") return submission.processed;
    if (filterProcessed === "unprocessed") return !submission.processed;
    return true;
  });

  // Set page title
  useEffect(() => {
    document.title = language === "ru" ? "Управление контактами | Art Line" : 
                     language === "kz" ? "Байланыстарды басқару | Art Line" : 
                     "Contacts Management | Art Line";
  }, [language]);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">
              {translate("admin.contacts", language)}
            </h1>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="submissions">
                {language === "ru" ? "Заявки" : 
                 language === "kz" ? "Өтінімдер" : 
                 "Submissions"}
              </TabsTrigger>
              <TabsTrigger value="section">
                {language === "ru" ? "Раздел контактов" : 
                 language === "kz" ? "Байланыс бөлімі" : 
                 "Contact Section"}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="submissions" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>
                        {language === "ru" ? "Заявки обратной связи" : 
                         language === "kz" ? "Кері байланыс өтінімдері" : 
                         "Contact Form Submissions"}
                      </CardTitle>
                      <CardDescription>
                        {language === "ru" ? "Управление заявками, полученными через форму обратной связи" : 
                         language === "kz" ? "Кері байланыс формасы арқылы алынған өтінімдерді басқару" : 
                         "Manage submissions received through the contact form"}
                      </CardDescription>
                    </div>
                    
                    <div className="flex items-center">
                      <Select
                        value={filterProcessed}
                        onValueChange={setFilterProcessed}
                      >
                        <SelectTrigger className="w-[180px]">
                          <Filter className="h-4 w-4 mr-2" />
                          <SelectValue placeholder={
                            language === "ru" ? "Фильтр" : 
                            language === "kz" ? "Сүзгі" : 
                            "Filter"
                          } />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">
                            {language === "ru" ? "Все заявки" : 
                             language === "kz" ? "Барлық өтінімдер" : 
                             "All submissions"}
                          </SelectItem>
                          <SelectItem value="processed">
                            {language === "ru" ? "Обработанные" : 
                             language === "kz" ? "Өңделген" : 
                             "Processed"}
                          </SelectItem>
                          <SelectItem value="unprocessed">
                            {language === "ru" ? "Необработанные" : 
                             language === "kz" ? "Өңделмеген" : 
                             "Unprocessed"}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {submissionsLoading ? (
                    <div className="flex justify-center p-8">
                      <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
                    </div>
                  ) : filteredSubmissions.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>
                            {language === "ru" ? "Имя" : 
                             language === "kz" ? "Аты" : 
                             "Name"}
                          </TableHead>
                          <TableHead>
                            {language === "ru" ? "Контакты" : 
                             language === "kz" ? "Байланыстар" : 
                             "Contacts"}
                          </TableHead>
                          <TableHead>
                            {language === "ru" ? "Дата" : 
                             language === "kz" ? "Күні" : 
                             "Date"}
                          </TableHead>
                          <TableHead>
                            {language === "ru" ? "Статус" : 
                             language === "kz" ? "Күйі" : 
                             "Status"}
                          </TableHead>
                          <TableHead className="text-right">
                            {language === "ru" ? "Действия" : 
                             language === "kz" ? "Әрекеттер" : 
                             "Actions"}
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredSubmissions.map((submission) => (
                          <TableRow key={submission.id}>
                            <TableCell className="font-medium">
                              {submission.name}
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <div className="flex items-center">
                                  <Phone className="h-3 w-3 mr-1 text-muted-foreground" />
                                  <a href={`tel:${submission.phone}`} className="text-sm hover:underline">
                                    {submission.phone}
                                  </a>
                                </div>
                                {submission.email && (
                                  <div className="flex items-center">
                                    <Mail className="h-3 w-3 mr-1 text-muted-foreground" />
                                    <a href={`mailto:${submission.email}`} className="text-sm hover:underline">
                                      {submission.email}
                                    </a>
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <Calendar className="h-3 w-3 mr-1 text-muted-foreground" />
                                <span className="text-sm">
                                  {format(new Date(submission.createdAt), "dd.MM.yyyy HH:mm")}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {submission.processed ? (
                                <div className="flex items-center text-green-600">
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  <span>
                                    {language === "ru" ? "Обработана" : 
                                     language === "kz" ? "Өңделген" : 
                                     "Processed"}
                                  </span>
                                </div>
                              ) : (
                                <div className="flex items-center text-amber-500">
                                  <XCircle className="h-4 w-4 mr-1" />
                                  <span>
                                    {language === "ru" ? "Не обработана" : 
                                     language === "kz" ? "Өңделмеген" : 
                                     "Unprocessed"}
                                  </span>
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setViewingSubmission(submission)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant={submission.processed ? "outline" : "default"}
                                  size="sm"
                                  onClick={() => handleToggleProcessed(submission)}
                                >
                                  {submission.processed ? (
                                    <XCircle className="h-4 w-4 mr-2" />
                                  ) : (
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                  )}
                                  {submission.processed ? (
                                    language === "ru" ? "Отменить" : 
                                    language === "kz" ? "Болдырмау" : 
                                    "Unmark"
                                  ) : (
                                    language === "ru" ? "Обработать" : 
                                    language === "kz" ? "Өңдеу" : 
                                    "Process"
                                  )}
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center p-8 bg-muted rounded-md">
                      <MessageSquare className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                      <p>
                        {language === "ru" ? "Нет заявок обратной связи" : 
                         language === "kz" ? "Кері байланыс өтінімдері жоқ" : 
                         "No contact form submissions"}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="section" className="space-y-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">
                  {language === "ru" ? "Раздел контактов" : 
                   language === "kz" ? "Байланыс бөлімі" : 
                   "Contact Section"}
                </h2>
                
                {sectionLoading ? (
                  <div className="flex justify-center p-8">
                    <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <ContentForm
                    sectionType="contacts"
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
                        name: "phone",
                        label: language === "ru" ? "Основной телефон" : 
                                language === "kz" ? "Негізгі телефон" : 
                                "Main phone",
                        type: "text",
                      },
                      {
                        name: "phoneSecondary",
                        label: language === "ru" ? "Дополнительный телефон" : 
                                language === "kz" ? "Қосымша телефон" : 
                                "Secondary phone",
                        type: "text",
                      },
                      {
                        name: "email",
                        label: language === "ru" ? "Email" : 
                                language === "kz" ? "Email" : 
                                "Email",
                        type: "text",
                      },
                      {
                        name: "address",
                        label: language === "ru" ? "Адрес" : 
                                language === "kz" ? "Мекенжай" : 
                                "Address",
                        type: "text",
                      },
                      {
                        name: "mapCoordinates",
                        label: language === "ru" ? "Координаты для карты (lat,lng)" : 
                                language === "kz" ? "Карта үшін координаттар (lat,lng)" : 
                                "Map coordinates (lat,lng)",
                        type: "text",
                        description: language === "ru" ? "Формат: 43.246223,76.944383" : 
                                    language === "kz" ? "Пішімі: 43.246223,76.944383" : 
                                    "Format: 43.246223,76.944383",
                      }
                    ]}
                  />
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* View submission details dialog */}
      {viewingSubmission && (
        <Dialog open={!!viewingSubmission} onOpenChange={() => setViewingSubmission(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {language === "ru" ? "Детали заявки" : 
                 language === "kz" ? "Өтінім мәліметтері" : 
                 "Submission Details"}
              </DialogTitle>
              <DialogDescription>
                ID: {viewingSubmission.id} | {format(new Date(viewingSubmission.createdAt), "dd.MM.yyyy HH:mm")}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  {language === "ru" ? "Имя" : 
                   language === "kz" ? "Аты" : 
                   "Name"}
                </h3>
                <p className="text-lg font-medium">{viewingSubmission.name}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  {language === "ru" ? "Телефон" : 
                   language === "kz" ? "Телефон" : 
                   "Phone"}
                </h3>
                <p className="text-lg">
                  <a href={`tel:${viewingSubmission.phone}`} className="text-accent hover:underline">
                    {viewingSubmission.phone}
                  </a>
                </p>
              </div>
              
              {viewingSubmission.email && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    {language === "ru" ? "Email" : 
                     language === "kz" ? "Email" : 
                     "Email"}
                  </h3>
                  <p className="text-lg">
                    <a href={`mailto:${viewingSubmission.email}`} className="text-accent hover:underline">
                      {viewingSubmission.email}
                    </a>
                  </p>
                </div>
              )}
              
              {viewingSubmission.service && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    {language === "ru" ? "Интересующая услуга" : 
                     language === "kz" ? "Қызығушылық тудыратын қызмет" : 
                     "Service of Interest"}
                  </h3>
                  <p>{viewingSubmission.service}</p>
                </div>
              )}
              
              {viewingSubmission.message && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    {language === "ru" ? "Сообщение" : 
                     language === "kz" ? "Хабарлама" : 
                     "Message"}
                  </h3>
                  <div className="bg-muted p-3 rounded-md">
                    <p className="whitespace-pre-wrap">{viewingSubmission.message}</p>
                  </div>
                </div>
              )}
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  {language === "ru" ? "Статус" : 
                   language === "kz" ? "Күйі" : 
                   "Status"}
                </h3>
                <div className="flex items-center">
                  {viewingSubmission.processed ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                      <span className="text-green-600 font-medium">
                        {language === "ru" ? "Обработана" : 
                         language === "kz" ? "Өңделген" : 
                         "Processed"}
                      </span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5 text-amber-500 mr-2" />
                      <span className="text-amber-500 font-medium">
                        {language === "ru" ? "Не обработана" : 
                         language === "kz" ? "Өңделмеген" : 
                         "Unprocessed"}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setViewingSubmission(null)}
              >
                {language === "ru" ? "Закрыть" : 
                 language === "kz" ? "Жабу" : 
                 "Close"}
              </Button>
              <Button
                variant={viewingSubmission.processed ? "outline" : "default"}
                onClick={() => {
                  setConfirmProcessSubmission(viewingSubmission);
                  setViewingSubmission(null);
                }}
              >
                {viewingSubmission.processed ? (
                  <>
                    <XCircle className="h-4 w-4 mr-2" />
                    {language === "ru" ? "Отменить обработку" : 
                     language === "kz" ? "Өңдеуді болдырмау" : 
                     "Mark as Unprocessed"}
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {language === "ru" ? "Отметить как обработанную" : 
                     language === "kz" ? "Өңделген деп белгілеу" : 
                     "Mark as Processed"}
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Confirm process status change */}
      <AlertDialog 
        open={!!confirmProcessSubmission} 
        onOpenChange={(open) => !open && setConfirmProcessSubmission(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmProcessSubmission?.processed ? (
                language === "ru" ? "Отменить обработку заявки?" : 
                language === "kz" ? "Өтінімді өңдеуді болдырмау керек пе?" : 
                "Mark submission as unprocessed?"
              ) : (
                language === "ru" ? "Отметить заявку как обработанную?" : 
                language === "kz" ? "Өтінімді өңделген деп белгілеу керек пе?" : 
                "Mark submission as processed?"
              )}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmProcessSubmission?.processed ? (
                language === "ru" ? "Заявка будет отмечена как необработанная. Вы уверены?" : 
                language === "kz" ? "Өтінім өңделмеген деп белгіленеді. Сенімдісіз бе?" : 
                "This submission will be marked as unprocessed. Are you sure?"
              ) : (
                language === "ru" ? "Заявка будет отмечена как обработанная. Вы уверены?" : 
                language === "kz" ? "Өтінім өңделген деп белгіленеді. Сенімдісіз бе?" : 
                "This submission will be marked as processed. Are you sure?"
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {language === "ru" ? "Отмена" : 
               language === "kz" ? "Болдырмау" : 
               "Cancel"}
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmProcessingChange}>
              {language === "ru" ? "Да, подтверждаю" : 
               language === "kz" ? "Иә, растаймын" : 
               "Yes, confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
