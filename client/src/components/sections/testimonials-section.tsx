import { useState, useEffect, useRef } from "react";
import { useLanguage } from "@/hooks/use-language";
import { translate } from "@/lib/i18n";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";

type Testimonial = {
  id: number;
  text: string;
  author: string;
  position: string;
  rating: number;
};

export default function TestimonialsSection() {
  const { language } = useLanguage();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);
  
  // Fetch testimonials from API
  const { data: testimonials = [], isLoading } = useQuery<Testimonial[]>({
    queryKey: ["/api/testimonials", language],
    // Fallback to demo data if API call fails
    placeholderData: [
      {
        id: 1,
        text: language === "ru" ? "Работаем с Art-Line уже третий год — от визиток до брендирования автомобилей. Всегда чётко, быстро и со вкусом. Особенно радует подход к деталям: всё продумано, ничего лишнего. Рекомендуем всем, кто ценит профессионализм!" : 
               language === "kz" ? "Art-Line-мен үшінші жыл жұмыс істеп келеміз — визиткалардан бастап автомобильдерді брендтеуге дейін. Әрқашан анық, жылдам және талғаммен. Әсіресе егжей-тегжейлі тәсіл қуантады: барлығы ойластырылған, артық ештеңе жоқ. Кәсібилікті бағалайтын барлық адамдарға ұсынамыз!" : 
               "We've been working with Art-Line for the third year now - from business cards to vehicle branding. Always precise, fast, and tasteful. The approach to details is especially pleasing: everything is thought out, nothing excessive. We recommend to everyone who values professionalism!",
        author: "Арт Директор",
        position: language === "ru" ? "корпоративный клиент" : 
                  language === "kz" ? "корпоративтік клиент" : 
                  "corporate client",
        rating: 5
      },
      {
        id: 2,
        text: language === "ru" ? "Заказывал разработку дизайна для вывески. Ребята очень креативные, предложили несколько интересных идей. Вывеска получилась просто отличная!" : 
               language === "kz" ? "Маңдайша үшін дизайн әзірлеуге тапсырыс бердім. Жігіттер өте креативті, бірнеше қызықты идеялар ұсынды. Маңдайша керемет шықты!" : 
               "I ordered a design development for a signage. The team is very creative, they offered several interesting ideas. The sign turned out great!",
        author: "Бакытжан",
        position: language === "ru" ? "Разработка дизайна вывески" : 
                  language === "kz" ? "Маңдайша дизайнын әзірлеу" : 
                  "Signage design development",
        rating: 5
      },
      {
        id: 3,
        text: language === "ru" ? "Очень доволен работой агентства. Быстро и профессионально сделали брендирование автомобиля. Рекомендую!" : 
               language === "kz" ? "Агенттіктің жұмысына өте ризамын. Автокөлікті брендтеуді жылдам және кәсіби түрде жасады. Ұсынамын!" : 
               "Very satisfied with the agency's work. They branded the car quickly and professionally. I recommend!",
        author: "Сергей",
        position: language === "ru" ? "Брендирование автомобиля" : 
                  language === "kz" ? "Автомобильді брендтеу" : 
                  "Vehicle branding",
        rating: 5
      },
      {
        id: 4,
        text: language === "ru" ? "Агентство помогло с оформлением мероприятия. Все было сделано оперативно и качественно. Очень благодарна за их профессионализм!" : 
               language === "kz" ? "Агенттік іс-шараны безендіруге көмектесті. Барлығы жедел және сапалы жасалды. Олардың кәсібилігі үшін өте ризамын!" : 
               "The agency helped with the event decoration. Everything was done promptly and with quality. Very grateful for their professionalism!",
        author: "Елена",
        position: language === "ru" ? "Оформление мероприятия" : 
                  language === "kz" ? "Іс-шараны безендіру" : 
                  "Event decoration",
        rating: 5
      }
    ]
  });

  // Move to next slide
  const nextSlide = () => {
    setCurrentSlide((prev) => 
      prev === testimonials.length - 1 ? 0 : prev + 1
    );
  };

  // Move to previous slide
  const prevSlide = () => {
    setCurrentSlide((prev) => 
      prev === 0 ? testimonials.length - 1 : prev - 1
    );
  };

  // Set slide by index
  const setSlide = (index: number) => {
    setCurrentSlide(index);
  };

  // Auto-slide effect
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isMouseDown) {
        nextSlide();
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [isMouseDown, testimonials.length]);

  // Track mouse events for manual sliding
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsMouseDown(true);
    setStartX(e.pageX - (sliderRef.current?.offsetLeft || 0));
    setScrollLeft(sliderRef.current?.scrollLeft || 0);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDown) return;
    e.preventDefault();
    const x = e.pageX - (sliderRef.current?.offsetLeft || 0);
    const walk = (x - startX) * 2; // * 2 for faster sliding
    if (sliderRef.current) {
      sliderRef.current.scrollLeft = scrollLeft - walk;
    }
  };

  const handleMouseUp = () => {
    setIsMouseDown(false);
    // Snap to nearest slide
    if (sliderRef.current) {
      const slideWidth = sliderRef.current.clientWidth;
      const currentIndex = Math.round(sliderRef.current.scrollLeft / slideWidth);
      setCurrentSlide(currentIndex);
      sliderRef.current.scrollLeft = currentIndex * slideWidth;
    }
  };

  // Update scroll position when currentSlide changes
  useEffect(() => {
    if (sliderRef.current) {
      const slideWidth = sliderRef.current.clientWidth;
      sliderRef.current.scrollLeft = currentSlide * slideWidth;
    }
  }, [currentSlide]);

  return (
    <section id="testimonials" className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl mb-4">{translate("testimonials.title", language)}</h2>
          <p className="max-w-2xl mx-auto text-lg">
            {translate("testimonials.description", language)}
          </p>
        </div>
        
        <div className="testimonial-slider relative">
          <div className="overflow-hidden">
            <div 
              ref={sliderRef}
              className="flex transition-transform duration-500 overflow-x-auto scrollbar-hide snap-x snap-mandatory"
              style={{ scrollBehavior: "smooth" }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {isLoading ? (
                // Loading skeleton
                Array(4).fill(0).map((_, index) => (
                  <div 
                    key={index} 
                    className="w-full lg:w-1/2 flex-shrink-0 px-4 snap-center"
                  >
                    <div className="bg-white p-8 rounded-lg shadow-md animate-pulse">
                      <div className="flex items-center mb-6">
                        <div className="bg-gray-300 h-5 w-24 rounded"></div>
                      </div>
                      <div className="space-y-3">
                        <div className="bg-gray-300 h-4 w-full rounded"></div>
                        <div className="bg-gray-300 h-4 w-full rounded"></div>
                        <div className="bg-gray-300 h-4 w-3/4 rounded"></div>
                      </div>
                      <div className="mt-6 flex items-center">
                        <div className="ml-4">
                          <div className="bg-gray-300 h-5 w-32 rounded mb-1"></div>
                          <div className="bg-gray-300 h-4 w-24 rounded"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                testimonials.map((testimonial, index) => (
                  <div 
                    key={testimonial.id} 
                    className="w-full lg:w-1/2 flex-shrink-0 px-4 snap-center"
                  >
                    <div className="bg-white p-8 rounded-lg shadow-md h-full">
                      <div className="flex items-center mb-6">
                        <div className="text-yellow-400 flex">
                          {Array(5).fill(0).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-5 w-5 ${i < testimonial.rating ? 'fill-yellow-400' : 'text-gray-300'}`}
                            />
                          ))}
                        </div>
                      </div>
                      <blockquote className="text-lg italic mb-6">
                        "{testimonial.text}"
                      </blockquote>
                      <div className="flex items-center">
                        <div>
                          <cite className="font-montserrat font-semibold not-italic block">
                            {testimonial.author}
                          </cite>
                          <span className="text-gray-500 text-sm">{testimonial.position}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          
          <Button
            onClick={prevSlide}
            variant="outline"
            size="icon"
            className="absolute top-1/2 -left-4 transform -translate-y-1/2 w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center z-10"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="h-6 w-6 text-primary" />
          </Button>
          
          <Button
            onClick={nextSlide}
            variant="outline"
            size="icon"
            className="absolute top-1/2 -right-4 transform -translate-y-1/2 w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center z-10"
            aria-label="Next testimonial"
          >
            <ChevronRight className="h-6 w-6 text-primary" />
          </Button>
          
          <div className="testimonial-dots flex justify-center mt-8 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setSlide(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  currentSlide === index 
                    ? "bg-primary opacity-100" 
                    : "bg-gray-300 opacity-50"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
