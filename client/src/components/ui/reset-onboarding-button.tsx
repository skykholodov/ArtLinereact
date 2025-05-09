import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/use-language";
import { translate } from "@/lib/i18n";
import { RefreshCw } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

export default function ResetOnboardingButton() {
  const { language } = useLanguage();
  const [isResetting, setIsResetting] = useState(false);

  const handleResetOnboarding = () => {
    setIsResetting(true);
    // Удаляем localStorage запись о том, что пользователь уже видел онбординг
    localStorage.removeItem('hasSeenOnboarding');
    
    // Показываем сообщение об успешном сбросе
    toast({
      title: language === "ru" ? "Онбординг сброшен" : language === "kz" ? "Онбординг қалпына келтірілді" : "Onboarding reset",
      description: language === "ru" 
        ? "Перезагрузите страницу, чтобы начать заново" 
        : language === "kz" 
        ? "Қайта бастау үшін бетті жаңартыңыз" 
        : "Reload the page to start again",
      duration: 3000,
    });
    
    setTimeout(() => {
      setIsResetting(false);
      // Опционально, перезагружаем страницу автоматически после небольшой задержки
      window.location.reload();
    }, 1000);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className="flex items-center space-x-1 fixed bottom-4 right-4 bg-white bg-opacity-75 z-50"
      onClick={handleResetOnboarding}
      disabled={isResetting}
    >
      <RefreshCw className={`h-4 w-4 ${isResetting ? 'animate-spin' : ''}`} />
      <span className="hidden md:inline-block">
        {language === "ru" 
          ? "Начать онбординг заново" 
          : language === "kz" 
          ? "Онбордингты қайта бастау" 
          : "Restart onboarding"}
      </span>
      <span className="md:hidden">
        {language === "ru" 
          ? "Онбординг" 
          : language === "kz" 
          ? "Онбординг" 
          : "Onboarding"}
      </span>
    </Button>
  );
}