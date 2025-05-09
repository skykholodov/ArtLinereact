import { useEffect } from "react";
import { useLanguage } from "@/hooks/use-language";
import Sidebar from "@/components/admin/sidebar";
import MapScriptForm from "@/components/admin/map-script-form";

export default function AdminMapPage() {
  const { language } = useLanguage();
  
  // Set page title
  useEffect(() => {
    document.title = language === "ru" ? "Управление картой | Art Line" : 
                     language === "kz" ? "Картаны басқару | Art Line" : 
                     "Map Management | Art Line";
  }, [language]);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">
              {language === "ru" ? "Управление картой" : 
               language === "kz" ? "Картаны басқару" : 
               "Map Management"}
            </h1>
          </div>
          
          <div className="space-y-6">
            <MapScriptForm />
          </div>
        </div>
      </div>
    </div>
  );
}