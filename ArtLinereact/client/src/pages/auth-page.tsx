import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/hooks/use-language";
import { translate } from "@/lib/i18n";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ShieldCheck, KeyRound, UserRound } from "lucide-react";

// Login form schema
const loginSchema = z.object({
  username: z.string().min(3, {
    message: "Username must be at least 3 characters long",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters long",
  }),
});

// Registration form schema
const registerSchema = z.object({
  username: z.string().min(3, {
    message: "Username must be at least 3 characters long",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters long",
  }),
  confirmPassword: z.string(),
  name: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const { language } = useLanguage();
  const [, navigate] = useLocation();
  
  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (user) {
      navigate("/admin");
    }
  }, [user, navigate]);

  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Registration form
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      name: "",
    },
  });

  // Form submission handlers
  const onLoginSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(data);
  };

  const onRegisterSubmit = (data: RegisterFormValues) => {
    const { confirmPassword, ...registerData } = data;
    registerMutation.mutate(registerData);
  };

  // If already logged in, show nothing while redirecting
  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="grid gap-6 w-full max-w-6xl grid-cols-1 lg:grid-cols-2">
        {/* Left column: Auth form */}
        <div className="flex flex-col justify-center">
          <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
            <div className="flex flex-col space-y-2 text-center">
              <h1 className="text-2xl font-semibold tracking-tight">
                {translate("auth.adminPanel", language)}
              </h1>
              <p className="text-sm text-muted-foreground">
                {translate("auth.adminDescription", language)}
              </p>
            </div>
            
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">
                  {translate("auth.login", language)}
                </TabsTrigger>
                <TabsTrigger value="register">
                  {translate("auth.register", language)}
                </TabsTrigger>
              </TabsList>
              
              {/* Login Tab */}
              <TabsContent value="login">
                <Card>
                  <CardHeader>
                    <CardTitle>{translate("auth.loginTitle", language)}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Form {...loginForm}>
                      <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                        <FormField
                          control={loginForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{translate("auth.username", language)}</FormLabel>
                              <FormControl>
                                <Input placeholder="username" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={loginForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{translate("auth.password", language)}</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="••••••••" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <Button 
                          type="submit" 
                          className="w-full"
                          disabled={loginMutation.isPending}
                        >
                          {loginMutation.isPending ? (
                            <div className="flex items-center justify-center">
                              <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                              {language === "ru" ? "Вход..." : 
                               language === "kz" ? "Кіру..." : 
                               "Logging in..."}
                            </div>
                          ) : (
                            <div className="flex items-center justify-center">
                              <KeyRound className="mr-2 h-4 w-4" />
                              {translate("auth.loginButton", language)}
                            </div>
                          )}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Register Tab */}
              <TabsContent value="register">
                <Card>
                  <CardHeader>
                    <CardTitle>{translate("auth.registerTitle", language)}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Form {...registerForm}>
                      <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                        <FormField
                          control={registerForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{translate("auth.username", language)}</FormLabel>
                              <FormControl>
                                <Input placeholder="username" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={registerForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{translate("auth.name", language)}</FormLabel>
                              <FormControl>
                                <Input placeholder="John Doe" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={registerForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{translate("auth.password", language)}</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="••••••••" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={registerForm.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{translate("auth.confirmPassword", language)}</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="••••••••" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <Button 
                          type="submit" 
                          className="w-full"
                          disabled={registerMutation.isPending}
                        >
                          {registerMutation.isPending ? (
                            <div className="flex items-center justify-center">
                              <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                              {language === "ru" ? "Регистрация..." : 
                               language === "kz" ? "Тіркелу..." : 
                               "Registering..."}
                            </div>
                          ) : (
                            <div className="flex items-center justify-center">
                              <UserRound className="mr-2 h-4 w-4" />
                              {translate("auth.registerButton", language)}
                            </div>
                          )}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
        
        {/* Right column: Hero/art image with info */}
        <div className="hidden lg:flex items-center justify-center relative overflow-hidden rounded-lg bg-primary p-10 text-white">
          <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/70"></div>
          <div className="relative z-10 flex flex-col items-center text-center space-y-6">
            <div className="bg-white/10 p-6 rounded-full">
              <ShieldCheck className="h-20 w-20" />
            </div>
            
            <div>
              <h2 className="text-3xl font-bold">Art Line</h2>
              <p className="text-lg mt-2">
                {language === "ru" ? "Панель управления контентом" : 
                 language === "kz" ? "Мазмұнды басқару панелі" : 
                 "Content Management Panel"}
              </p>
            </div>
            
            <div className="max-w-md space-y-4">
              <div className="bg-white/10 p-4 rounded-lg">
                <p className="text-md">
                  {language === "ru" ? "Управляйте всем контентом сайта в одном месте. Загружайте изображения, редактируйте текст и следите за обновлениями." : 
                   language === "kz" ? "Сайттың барлық мазмұнын бір жерде басқарыңыз. Суреттерді жүктеңіз, мәтінді өңдеңіз және жаңартуларды қадағалаңыз." : 
                   "Manage all site content in one place. Upload images, edit text, and track updates."}
                </p>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white/10 p-3 rounded-lg text-center">
                  <p className="text-sm font-medium">
                    {language === "ru" ? "3 языка" : 
                     language === "kz" ? "3 тіл" : 
                     "3 languages"}
                  </p>
                </div>
                <div className="bg-white/10 p-3 rounded-lg text-center">
                  <p className="text-sm font-medium">
                    {language === "ru" ? "Управление медиа" : 
                     language === "kz" ? "Медиа басқару" : 
                     "Media management"}
                  </p>
                </div>
                <div className="bg-white/10 p-3 rounded-lg text-center">
                  <p className="text-sm font-medium">
                    {language === "ru" ? "История версий" : 
                     language === "kz" ? "Нұсқалар тарихы" : 
                     "Version history"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
