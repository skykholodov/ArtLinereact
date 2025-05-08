import { useLanguage } from "@/hooks/use-language";
import { translate } from "@/lib/i18n";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertContactSubmissionSchema } from "@shared/schema";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Phone, Mail, MapPin } from "lucide-react";
import { FaTelegram, FaWhatsapp, FaInstagram } from "react-icons/fa";

// Extended schema with validation
const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  phone: z.string().min(5, {
    message: "Phone number must be at least 5 characters.",
  }),
  email: z.string().email().optional().or(z.literal("")),
  service: z.string().optional(),
  message: z.string().optional(),
  privacy: z.boolean().refine(val => val === true, {
    message: "You must agree to the privacy policy.",
  }),
});

type FormValues = z.infer<typeof formSchema>;

export default function ContactSection() {
  const { language } = useLanguage();
  const { toast } = useToast();

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      service: "",
      message: "",
      privacy: false,
    },
  });

  // Form submission mutation
  const mutation = useMutation({
    mutationFn: async (data: Omit<FormValues, "privacy">) => {
      const res = await apiRequest("POST", "/api/contact", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: language === "ru" ? "Заявка отправлена!" : 
               language === "kz" ? "Өтінім жіберілді!" : 
               "Request submitted!",
        description: language === "ru" ? "Мы свяжемся с вами в ближайшее время" : 
                     language === "kz" ? "Біз сізбен жақын арада байланысамыз" : 
                     "We will contact you soon",
      });
      form.reset();
    },
    onError: (error) => {
      toast({
        title: language === "ru" ? "Ошибка отправки" : 
               language === "kz" ? "Жіберу қатесі" : 
               "Submission error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Form submission handler
  const onSubmit = (data: FormValues) => {
    const { privacy, ...contactData } = data;
    mutation.mutate(contactData);
  };

  return (
    <section id="contacts" className="py-20 bg-primary text-white">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h2 className="text-3xl md:text-4xl mb-6">{translate("contact.title", language)}</h2>
            <p className="text-lg mb-8">
              {translate("contact.description", language)}
            </p>
            
            <div className="space-y-6 mb-10">
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-10 h-10 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                    <Phone className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="ml-4">
                  <h4 className="font-montserrat font-semibold text-lg mb-1">{translate("contact.phone", language)}</h4>
                  <p>
                    <a href="tel:+77760063819" className="hover:text-secondary transition-colors">
                      +7 776 006 38 19
                    </a>
                    <span className="block text-gray-300 text-sm">Александр Оспанов</span>
                  </p>
                  <p className="mt-2">
                    <a href="tel:+77272277544" className="hover:text-secondary transition-colors">
                      +7 (727) 227-75-44
                    </a>
                    <span className="block text-gray-300 text-sm">{translate("contact.office", language)}</span>
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-10 h-10 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                    <Mail className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="ml-4">
                  <h4 className="font-montserrat font-semibold text-lg mb-1">{translate("contact.email", language)}</h4>
                  <p>
                    <a href="mailto:info@art-line.kz" className="hover:text-secondary transition-colors">
                      info@art-line.kz
                    </a>
                  </p>
                  <p className="mt-1">
                    <a href="mailto:art-line.kz@mail.ru" className="hover:text-secondary transition-colors">
                      art-line.kz@mail.ru
                    </a>
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-10 h-10 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="ml-4">
                  <h4 className="font-montserrat font-semibold text-lg mb-1">{translate("contact.address", language)}</h4>
                  <p>
                    ул. Торетай 43, Алматы, Казахстан
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-4">
              <a 
                href="https://t.me/AlexanderOspanov" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full bg-white bg-opacity-10 flex items-center justify-center hover:bg-secondary transition-colors"
                aria-label="Telegram"
              >
                <FaTelegram className="text-lg" />
              </a>
              <a 
                href="https://wa.me/77760063819" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full bg-white bg-opacity-10 flex items-center justify-center hover:bg-secondary transition-colors"
                aria-label="WhatsApp"
              >
                <FaWhatsapp className="text-lg" />
              </a>
              <a 
                href="https://instagram.com/izgotovlenie_reklamy" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full bg-white bg-opacity-10 flex items-center justify-center hover:bg-secondary transition-colors"
                aria-label="Instagram"
              >
                <FaInstagram className="text-lg" />
              </a>
            </div>
          </div>
          
          <div className="bg-white text-foreground rounded-lg shadow-lg p-8">
            <h3 className="font-montserrat font-semibold text-2xl mb-6">
              {translate("contact.form.title", language)}
            </h3>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{translate("contact.form.name", language)}</FormLabel>
                      <FormControl>
                        <Input placeholder="" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{translate("contact.form.phone", language)}</FormLabel>
                      <FormControl>
                        <Input placeholder="+7 (___) ___-__-__" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{translate("contact.form.email", language)}</FormLabel>
                      <FormControl>
                        <Input placeholder="email@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="service"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{translate("contact.form.service", language)}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={translate("contact.form.selectService", language)} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="signage">
                            {language === "ru" ? "Разработка и производство вывесок" : 
                             language === "kz" ? "Маңдайшаларды әзірлеу және өндіру" : 
                             "Signage Development and Production"}
                          </SelectItem>
                          <SelectItem value="branding">
                            {language === "ru" ? "Брендирование автомобилей" : 
                             language === "kz" ? "Автокөліктерді брендтеу" : 
                             "Vehicle Branding"}
                          </SelectItem>
                          <SelectItem value="events">
                            {language === "ru" ? "Оформление мероприятий" : 
                             language === "kz" ? "Іс-шараларды безендіру" : 
                             "Event Decoration"}
                          </SelectItem>
                          <SelectItem value="print">
                            {language === "ru" ? "Печать баннеров и стикеров" : 
                             language === "kz" ? "Баннерлер мен стикерлерді басып шығару" : 
                             "Banner and Sticker Printing"}
                          </SelectItem>
                          <SelectItem value="digital">
                            {language === "ru" ? "Digital-дизайн" : 
                             language === "kz" ? "Digital-дизайн" : 
                             "Digital Design"}
                          </SelectItem>
                          <SelectItem value="other">
                            {language === "ru" ? "Другое" : 
                             language === "kz" ? "Басқа" : 
                             "Other"}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{translate("contact.form.message", language)}</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="" 
                          className="resize-none" 
                          rows={4}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="privacy"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          id="privacy"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm font-normal">
                          {translate("contact.form.agreement", language)}{" "}
                          <a href="#" className="text-accent hover:underline">
                            {translate("contact.form.privacy", language)}
                          </a>
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
                
                <Button
                  type="submit"
                  className="w-full bg-secondary hover:bg-secondary/90 text-white"
                  disabled={mutation.isPending}
                >
                  {mutation.isPending 
                    ? (language === "ru" ? "Отправка..." : 
                       language === "kz" ? "Жіберілуде..." : 
                       "Submitting...") 
                    : translate("contact.form.submit", language)}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </section>
  );
}
