import { useLanguage } from "@/hooks/use-language";
import { Language } from "@/lib/i18n";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Globe } from "lucide-react";

type LanguageTabsProps = {
  activeLanguage: Language;
  onLanguageChange: (lang: Language) => void;
};

export default function LanguageTabs({
  activeLanguage,
  onLanguageChange,
}: LanguageTabsProps) {
  const { language } = useLanguage();

  return (
    <div className="flex items-center space-x-2">
      <Globe className="h-4 w-4 text-muted-foreground" />
      <span className="text-sm font-medium text-muted-foreground">
        {language === "ru" ? "Редактирование языка:" : 
         language === "kz" ? "Тілді өңдеу:" : 
         "Editing language:"}
      </span>
      <Tabs value={activeLanguage} onValueChange={(value) => onLanguageChange(value as Language)}>
        <TabsList>
          <TabsTrigger value="ru">
            Русский
          </TabsTrigger>
          <TabsTrigger value="kz">
            Қазақша
          </TabsTrigger>
          <TabsTrigger value="en">
            English
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
