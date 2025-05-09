import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";
import { translate } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, X, ChevronDown, Globe, LogIn, User, Moon, Sun, Laptop } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

// Create an SVG logo component
const ArtLineLogo = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36" className="h-10 w-auto svg-logo">
    <path fill="#D3AB40" d="M18 36L0 18L18 0L36 18L18 36ZM18 6L18 30L28.9 18L18 6Z"/>
    <path fill="#2C3E50" d="M18 12L18 24L24 18L18 12Z"/>
  </svg>
);

export default function Header() {
  const [location] = useLocation();
  const { language, setLanguage } = useLanguage();
  const { user } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Handle scroll to change header styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Smooth scroll to section when clicking on nav links
  const scrollToSection = (sectionId: string) => {
    setIsMobileMenuOpen(false);
    if (location !== "/") {
      // If not on home page, navigate to home first
      window.location.href = `/#${sectionId}`;
      return;
    }
    
    const section = document.getElementById(sectionId);
    if (section) {
      const headerHeight = document.querySelector("header")?.offsetHeight || 0;
      const top = section.offsetTop - headerHeight;
      window.scrollTo({
        top,
        behavior: "smooth",
      });
    }
  };

  // Language name mapping
  const languageNames = {
    ru: "RU",
    kz: "KZ",
    en: "EN",
  };

  return (
    <header
      className={`fixed w-full bg-background z-50 transition-all duration-300 ${
        isScrolled ? "shadow-md py-2" : "py-4"
      }`}
    >
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link href="/" className="flex items-center">
          <span className="flex items-center space-x-2">
            <ArtLineLogo />
            <span className="font-montserrat font-bold text-primary text-lg sm:text-xl hidden xs:inline-block">ART-LINE</span>
          </span>
        </Link>

        {/* Mobile Menu Button */}
        <div className="flex items-center space-x-2 lg:hidden">
          {!isMobileMenuOpen && (
            <>
              <ThemeToggle />
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-1 h-8 w-8">
                    <Globe className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-28">
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
            </>
          )}
          
          <button
            className="focus:outline-none"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6 text-primary" />
            ) : (
              <Menu className="h-6 w-6 text-primary" />
            )}
          </button>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex space-x-8 items-center">
          <button
            onClick={() => scrollToSection("services")}
            className="font-montserrat font-medium hover:text-secondary transition-colors"
          >
            {translate("nav.services", language)}
          </button>
          <button
            onClick={() => scrollToSection("portfolio")}
            className="font-montserrat font-medium hover:text-secondary transition-colors"
          >
            {translate("nav.portfolio", language)}
          </button>
          <button
            onClick={() => scrollToSection("about")}
            className="font-montserrat font-medium hover:text-secondary transition-colors"
          >
            {translate("nav.about", language)}
          </button>
          <button
            onClick={() => scrollToSection("contacts")}
            className="font-montserrat font-medium hover:text-secondary transition-colors"
          >
            {translate("nav.contacts", language)}
          </button>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Language Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center space-x-1 language-dropdown">
                <Globe className="h-4 w-4" />
                <span>{languageNames[language]}</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
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

          {/* Admin button */}
          {user ? (
            <Link href="/admin">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center space-x-1 border-primary text-primary mr-2"
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {language === "ru" ? "Админ" : language === "kz" ? "Әкімші" : "Admin"}
                </span>
              </Button>
            </Link>
          ) : (
            <Link href="/auth">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center space-x-1 mr-2"
              >
                <LogIn className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {language === "ru" ? "Войти" : language === "kz" ? "Кіру" : "Login"}
                </span>
              </Button>
            </Link>
          )}
          
          <Button
            onClick={() => scrollToSection("contacts")}
            className="bg-secondary hover:bg-secondary/90 text-white"
          >
            {translate("nav.order", language)}
          </Button>
        </nav>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-background w-full border-t border-border shadow-md animate-fadeIn">
          <div className="container mx-auto px-4 py-3 sm:py-4">
            <nav className="flex flex-col space-y-3">
              <div className="flex flex-col space-y-0">
                {/* Main navigation links */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => scrollToSection("services")}
                    className="font-montserrat font-medium hover:text-secondary transition-colors py-2 text-left"
                  >
                    {translate("nav.services", language)}
                  </button>
                  <button
                    onClick={() => scrollToSection("portfolio")}
                    className="font-montserrat font-medium hover:text-secondary transition-colors py-2 text-left"
                  >
                    {translate("nav.portfolio", language)}
                  </button>
                  <button
                    onClick={() => scrollToSection("about")}
                    className="font-montserrat font-medium hover:text-secondary transition-colors py-2 text-left"
                  >
                    {translate("nav.about", language)}
                  </button>
                  <button
                    onClick={() => scrollToSection("contacts")}
                    className="font-montserrat font-medium hover:text-secondary transition-colors py-2 text-left"
                  >
                    {translate("nav.contacts", language)}
                  </button>
                </div>
              </div>

              {/* Theme Options */}
              <div className="border-t border-border pt-3 mt-1">
                <p className="text-sm text-muted-foreground mb-2">
                  {language === "ru" ? "Тема:" : language === "kz" ? "Тақырып:" : "Theme:"}
                </p>
                <div className="flex items-center space-x-4 mb-3">
                  <ThemeToggle />
                </div>
              </div>

              {/* Language Options */}
              <div className="border-t border-border pt-3 mt-1">
                <p className="text-sm text-muted-foreground mb-2">
                  {language === "ru" ? "Язык:" : language === "kz" ? "Тіл:" : "Language:"}
                </p>
                <div className="flex space-x-4">
                  <button
                    onClick={() => setLanguage("ru")}
                    className={`font-medium ${
                      language === "ru" ? "text-secondary" : "hover:text-secondary"
                    }`}
                  >
                    RU
                  </button>
                  <button
                    onClick={() => setLanguage("kz")}
                    className={`font-medium ${
                      language === "kz" ? "text-secondary" : "hover:text-secondary"
                    }`}
                  >
                    KZ
                  </button>
                  <button
                    onClick={() => setLanguage("en")}
                    className={`font-medium ${
                      language === "en" ? "text-secondary" : "hover:text-secondary"
                    }`}
                  >
                    EN
                  </button>
                </div>
              </div>

              {/* Admin/Login button for mobile */}
              <div className="pt-1">
                {user ? (
                  <Link href="/admin" className="block w-full">
                    <Button
                      variant="outline"
                      className="w-full flex items-center justify-center space-x-2 border-primary text-primary"
                      size="sm"
                    >
                      <User className="h-4 w-4" />
                      <span>
                        {language === "ru" ? "Панель администратора" : 
                         language === "kz" ? "Әкімші панелі" : 
                         "Admin Dashboard"}
                      </span>
                    </Button>
                  </Link>
                ) : (
                  <Link href="/auth" className="block w-full">
                    <Button
                      variant="outline"
                      className="w-full flex items-center justify-center space-x-2"
                      size="sm"
                    >
                      <LogIn className="h-4 w-4" />
                      <span>
                        {language === "ru" ? "Войти в систему" : 
                         language === "kz" ? "Жүйеге кіру" : 
                         "Login"}
                      </span>
                    </Button>
                  </Link>
                )}
              </div>

              <Button
                onClick={() => scrollToSection("contacts")}
                className="bg-secondary hover:bg-secondary/90 text-white w-full mt-2"
                size="sm"
              >
                {translate("nav.order", language)}
              </Button>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
