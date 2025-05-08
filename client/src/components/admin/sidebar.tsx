import { Link, useLocation } from "wouter";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/hooks/use-auth";
import { translate } from "@/lib/i18n";
import { 
  LayoutDashboard,
  FileText,
  Image,
  Users,
  MessageSquare,
  Info,
  LogOut,
  Globe,
  ChevronDown,
  MapPin
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Create an SVG logo component
const ArtLineLogo = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36" className="h-10 w-auto">
    <path fill="#D3AB40" d="M18 36L0 18L18 0L36 18L18 36ZM18 6L18 30L28.9 18L18 6Z"/>
    <path fill="#2C3E50" d="M18 12L18 24L24 18L18 12Z"/>
  </svg>
);

type NavItemProps = {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
};

const NavItem = ({ href, icon, children }: NavItemProps) => {
  const [location] = useLocation();
  const isActive = location === href;

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center px-4 py-3 text-sm font-medium rounded-md group",
        isActive
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:text-primary hover:bg-primary/5"
      )}
    >
      <span className={cn("mr-3", isActive ? "text-primary" : "text-muted-foreground group-hover:text-primary")}>{icon}</span>
      {children}
    </Link>
  );
};

export default function Sidebar() {
  const { language, setLanguage } = useLanguage();
  const { user, logoutMutation } = useAuth();
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // Language name mapping
  const languageNames = {
    ru: "Русский",
    kz: "Қазақша",
    en: "English",
  };

  return (
    <div className="w-64 bg-card border-r min-h-screen p-4 flex flex-col">
      <div className="flex items-center space-x-2 px-2 mb-8">
        <ArtLineLogo />
        <span className="font-montserrat font-bold text-primary text-xl">ART-LINE</span>
      </div>
      
      <div className="mb-6">
        <p className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          {language === "ru" ? "Меню" : 
           language === "kz" ? "Мәзір" : 
           "Menu"}
        </p>
        <nav className="space-y-1">
          <NavItem href="/admin" icon={<LayoutDashboard size={20} />}>
            {translate("admin.dashboard", language)}
          </NavItem>
          <NavItem href="/admin/services" icon={<FileText size={20} />}>
            {translate("admin.services", language)}
          </NavItem>
          <NavItem href="/admin/portfolio" icon={<Image size={20} />}>
            {translate("admin.portfolio", language)}
          </NavItem>
          <NavItem href="/admin/about" icon={<Info size={20} />}>
            {translate("admin.about", language)}
          </NavItem>
          <NavItem href="/admin/testimonials" icon={<Users size={20} />}>
            {translate("admin.testimonials", language)}
          </NavItem>
          <NavItem href="/admin/contacts" icon={<MessageSquare size={20} />}>
            {translate("admin.contacts", language)}
          </NavItem>
          <NavItem href="/admin/map" icon={<MapPin size={20} />}>
            {language === "ru" ? "Карта" : 
             language === "kz" ? "Карта" : 
             "Map"}
          </NavItem>
        </nav>
      </div>
      
      <div className="mt-auto space-y-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              className="w-full justify-between"
            >
              <div className="flex items-center">
                <Globe className="mr-2 h-4 w-4" />
                {languageNames[language]}
              </div>
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[200px]">
            <DropdownMenuItem onClick={() => setLanguage("ru")}>
              Русский
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLanguage("kz")}>
              Қазақша
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLanguage("en")}>
              English
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <div className="px-4 py-3 text-sm text-muted-foreground">
          <div className="font-medium">{user?.name || user?.username}</div>
          <div className="truncate">{user?.isAdmin ? "Администратор" : "Пользователь"}</div>
        </div>
        
        <Button 
          variant="ghost" 
          className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
        >
          <LogOut className="mr-2 h-4 w-4" />
          {translate("admin.logout", language)}
        </Button>
      </div>
    </div>
  );
}
