import { Link } from "wouter";
import { useLanguage } from "@/hooks/use-language";
import { translate } from "@/lib/i18n";
import { Phone, Mail, MapPin } from "lucide-react";
import { FaTelegram, FaWhatsapp, FaInstagram } from "react-icons/fa";

// Create an SVG logo component for the footer (white version)
const ArtLineLogoWhite = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36" className="h-16 w-auto footer-logo">
    <path fill="#FFFFFF" d="M18 36L0 18L18 0L36 18L18 36ZM18 6L18 30L28.9 18L18 6Z"/>
    <path fill="#D3AB40" d="M18 12L18 24L24 18L18 12Z"/>
  </svg>
);

export default function Footer() {
  const { language } = useLanguage();
  
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <footer className="bg-primary text-white">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div onClick={scrollToTop} className="block mb-6 cursor-pointer">
              <ArtLineLogoWhite />
            </div>
            <p className="mb-6">
              {language === "ru" && "Рекламное агентство полного цикла с более чем 10-летним опытом работы в сфере рекламы по всему Казахстану."}
              {language === "kz" && "Қазақстан бойынша жарнама саласында 10 жылдан астам тәжірибесі бар толық циклды жарнама агенттігі."}
              {language === "en" && "A full-cycle advertising agency with more than 10 years of experience in advertising throughout Kazakhstan."}
            </p>
            <div className="flex space-x-4">
              <a
                href="https://t.me/AlexanderOspanov"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white bg-opacity-10 flex items-center justify-center hover:bg-secondary transition-colors"
                aria-label="Telegram"
              >
                <FaTelegram />
              </a>
              <a
                href="https://wa.me/77760063819"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white bg-opacity-10 flex items-center justify-center hover:bg-secondary transition-colors"
                aria-label="WhatsApp"
              >
                <FaWhatsapp />
              </a>
              <a
                href="https://instagram.com/izgotovlenie_reklamy"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white bg-opacity-10 flex items-center justify-center hover:bg-secondary transition-colors"
                aria-label="Instagram"
              >
                <FaInstagram />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-montserrat font-semibold text-lg mb-6">
              {translate("footer.services", language)}
            </h4>
            <ul className="space-y-3">
              <li>
                <Link href="/#services" className="hover:text-secondary transition-colors">
                  {language === "ru" && "Разработка и производство вывесок"}
                  {language === "kz" && "Маңдайшаларды әзірлеу және өндіру"}
                  {language === "en" && "Signage Development and Production"}
                </Link>
              </li>
              <li>
                <Link href="/#services" className="hover:text-secondary transition-colors">
                  {language === "ru" && "Брендирование автомобилей"}
                  {language === "kz" && "Автокөліктерді брендтеу"}
                  {language === "en" && "Vehicle Branding"}
                </Link>
              </li>
              <li>
                <Link href="/#services" className="hover:text-secondary transition-colors">
                  {language === "ru" && "Оформление мероприятий"}
                  {language === "kz" && "Іс-шараларды безендіру"}
                  {language === "en" && "Event Decoration"}
                </Link>
              </li>
              <li>
                <Link href="/#services" className="hover:text-secondary transition-colors">
                  {language === "ru" && "Печать баннеров и стикеров"}
                  {language === "kz" && "Баннерлер мен стикерлерді басып шығару"}
                  {language === "en" && "Banner and Sticker Printing"}
                </Link>
              </li>
              <li>
                <Link href="/#services" className="hover:text-secondary transition-colors">
                  {language === "ru" && "Digital-дизайн"}
                  {language === "kz" && "Digital-дизайн"}
                  {language === "en" && "Digital Design"}
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-montserrat font-semibold text-lg mb-6">
              {translate("footer.company", language)}
            </h4>
            <ul className="space-y-3">
              <li>
                <Link href="/#about" className="hover:text-secondary transition-colors">
                  {translate("nav.about", language)}
                </Link>
              </li>
              <li>
                <Link href="/#portfolio" className="hover:text-secondary transition-colors">
                  {translate("nav.portfolio", language)}
                </Link>
              </li>
              <li>
                <Link href="/#testimonials" className="hover:text-secondary transition-colors">
                  {translate("testimonials.title", language)}
                </Link>
              </li>
              <li>
                <Link href="/#contacts" className="hover:text-secondary transition-colors">
                  {translate("nav.contacts", language)}
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-montserrat font-semibold text-lg mb-6">
              {translate("footer.contacts", language)}
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 mt-1 mr-3" />
                <span>ул. Торетай 43, Алматы, Казахстан</span>
              </li>
              <li className="flex items-start">
                <Phone className="h-5 w-5 mt-1 mr-3" />
                <div>
                  <a href="tel:+77760063819" className="hover:text-secondary transition-colors">
                    +7 776 006 38 19
                  </a>
                  <span className="block text-gray-300 dark:text-gray-200 text-sm">Александр Оспанов</span>
                </div>
              </li>
              <li className="flex items-start">
                <Mail className="h-5 w-5 mt-1 mr-3" />
                <div>
                  <a href="mailto:info@art-line.kz" className="hover:text-secondary transition-colors">
                    info@art-line.kz
                  </a>
                </div>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 dark:border-gray-600 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p>{translate("footer.copyright", language)}, {new Date().getFullYear()}.</p>
            <div className="mt-4 md:mt-0">
              <a href="#" className="text-sm hover:text-secondary transition-colors mr-6">
                {translate("footer.privacy", language)}
              </a>
              <a href="#" className="text-sm hover:text-secondary transition-colors">
                {translate("footer.terms", language)}
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
