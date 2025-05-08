import { useState, useRef } from "react";
import { useLanguage } from "@/hooks/use-language";
import { translate } from "@/lib/i18n";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { UploadCloud, Image, X, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";

type ImageUploadProps = {
  category?: string;
  onUploadComplete?: (uploadedFile: any) => void;
  maxFileSize?: number; // in MB
  acceptedFileTypes?: string[];
  multiple?: boolean;
};

export default function ImageUpload({
  category = "general",
  onUploadComplete,
  maxFileSize = 2, // Default 2MB
  acceptedFileTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"],
  multiple = false,
}: ImageUploadProps) {
  const { language } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [selectedCategory, setSelectedCategory] = useState<string>(category);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const categoryOptions = [
    { value: "portfolio", label: language === "ru" ? "Портфолио" : language === "kz" ? "Портфолио" : "Portfolio" },
    { value: "services", label: language === "ru" ? "Услуги" : language === "kz" ? "Қызметтер" : "Services" },
    { value: "about", label: language === "ru" ? "О нас" : language === "kz" ? "Біз туралы" : "About Us" },
    { value: "banner", label: language === "ru" ? "Баннеры" : language === "kz" ? "Баннерлер" : "Banners" },
    { value: "general", label: language === "ru" ? "Общие" : language === "kz" ? "Жалпы" : "General" },
  ];

  // Upload file mutation
  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      setUploadProgress(0);
      
      const xhr = new XMLHttpRequest();
      
      const promise = new Promise((resolve, reject) => {
        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable) {
            const percentComplete = Math.round((event.loaded / event.total) * 100);
            setUploadProgress(percentComplete);
          }
        });
        
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            reject(new Error(xhr.statusText || "Upload failed"));
          }
        };
        
        xhr.onerror = () => {
          reject(new Error("Network error"));
        };
      });
      
      xhr.open("POST", "/api/upload");
      xhr.send(formData);
      
      return promise;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/media"] });
      toast({
        title: language === "ru" ? "Загрузка успешна" : 
               language === "kz" ? "Жүктеу сәтті" : 
               "Upload successful",
        description: language === "ru" ? "Файл(ы) успешно загружен(ы)" : 
                     language === "kz" ? "Файл(дар) сәтті жүктелді" : 
                     "File(s) successfully uploaded",
      });
      setSelectedFiles([]);
      setUploadProgress(0);
      
      if (onUploadComplete) {
        onUploadComplete(data);
      }
    },
    onError: (error: Error) => {
      toast({
        title: language === "ru" ? "Ошибка загрузки" : 
               language === "kz" ? "Жүктеу қатесі" : 
               "Upload error",
        description: error.message,
        variant: "destructive",
      });
      setUploadProgress(0);
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const files = Array.from(event.target.files);
      validateAndSetFiles(files);
    }
  };

  const validateAndSetFiles = (files: File[]) => {
    setError(null);
    
    // Check file types
    const invalidTypeFiles = files.filter(file => !acceptedFileTypes.includes(file.type));
    if (invalidTypeFiles.length > 0) {
      setError(language === "ru" ? "Неподдерживаемый тип файла. Поддерживаются только изображения." : 
             language === "kz" ? "Қолдау көрсетілмейтін файл түрі. Тек суреттерге ғана қолдау көрсетіледі." : 
             "Unsupported file type. Only images are supported.");
      return;
    }
    
    // Check file sizes
    const oversizedFiles = files.filter(file => file.size > maxFileSize * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      setError(`${language === "ru" ? "Файл слишком большой. Максимальный размер" : 
              language === "kz" ? "Файл тым үлкен. Максималды өлшемі" : 
              "File is too large. Maximum size is"} ${maxFileSize}MB.`);
      return;
    }
    
    // Limit number of files if not multiple
    if (!multiple && files.length > 1) {
      setSelectedFiles([files[0]]);
    } else {
      setSelectedFiles(files);
    }
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files) {
      const files = Array.from(e.dataTransfer.files);
      validateAndSetFiles(files);
    }
  };

  const handleSubmit = () => {
    if (selectedFiles.length === 0) return;
    
    const formData = new FormData();
    selectedFiles.forEach(file => {
      formData.append("files", file);
    });
    formData.append("category", selectedCategory);
    
    uploadMutation.mutate(formData);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {language === "ru" ? "Загрузка изображений" : 
           language === "kz" ? "Суреттерді жүктеу" : 
           "Upload Images"}
        </CardTitle>
        <CardDescription>
          {language === "ru" ? `Максимальный размер файла: ${maxFileSize}MB` : 
           language === "kz" ? `Файлдың максималды өлшемі: ${maxFileSize}MB` : 
           `Maximum file size: ${maxFileSize}MB`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="category">
              {language === "ru" ? "Категория" : 
               language === "kz" ? "Санат" : 
               "Category"}
            </Label>
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
              disabled={uploadMutation.isPending}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={
                  language === "ru" ? "Выберите категорию" : 
                  language === "kz" ? "Санатты таңдаңыз" : 
                  "Select a category"
                } />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center hover:bg-muted/50 transition-colors cursor-pointer",
              dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/20",
              uploadMutation.isPending && "pointer-events-none opacity-60"
            )}
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="rounded-full bg-primary/10 p-4">
                <UploadCloud className="h-8 w-8 text-primary" />
              </div>
              <div>
                <p className="font-medium">
                  {language === "ru" ? "Перетащите файлы сюда или нажмите для выбора" : 
                   language === "kz" ? "Файлдарды осы жерге сүйреңіз немесе таңдау үшін басыңыз" : 
                   "Drag and drop files here or click to browse"}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {multiple 
                    ? (language === "ru" ? "Можно загрузить несколько файлов" : 
                       language === "kz" ? "Бірнеше файлды жүктеуге болады" : 
                       "You can upload multiple files")
                    : (language === "ru" ? "Можно загрузить только один файл" : 
                       language === "kz" ? "Тек бір файлды жүктеуге болады" : 
                       "You can only upload one file")}
                </p>
              </div>
            </div>
            <input
              ref={fileInputRef}
              id="file-upload"
              type="file"
              accept={acceptedFileTypes.join(",")}
              multiple={multiple}
              className="hidden"
              onChange={handleFileChange}
              disabled={uploadMutation.isPending}
            />
          </div>
          
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {selectedFiles.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-medium">
                {language === "ru" ? "Выбранные файлы:" : 
                 language === "kz" ? "Таңдалған файлдар:" : 
                 "Selected files:"}
              </p>
              <div className="space-y-2">
                {selectedFiles.map((file, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-2 bg-muted rounded-md"
                  >
                    <div className="flex items-center space-x-3">
                      <Image className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium truncate max-w-[200px]">
                          {file.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(index);
                      }}
                      disabled={uploadMutation.isPending}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {uploadMutation.isPending && (
            <div className="space-y-2">
              <Progress value={uploadProgress} className="h-2" />
              <p className="text-xs text-center text-muted-foreground">
                {uploadProgress}%
              </p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button
          onClick={handleSubmit}
          disabled={selectedFiles.length === 0 || uploadMutation.isPending}
        >
          {uploadMutation.isPending ? (
            <div className="flex items-center">
              <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
              {language === "ru" ? "Загрузка..." : 
               language === "kz" ? "Жүктелуде..." : 
               "Uploading..."}
            </div>
          ) : (
            <div className="flex items-center">
              <UploadCloud className="h-4 w-4 mr-2" />
              {language === "ru" ? "Загрузить" : 
               language === "kz" ? "Жүктеу" : 
               "Upload"}
            </div>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
