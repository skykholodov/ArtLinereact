import { useEffect, useRef } from "react";
import { useLanguage } from "@/hooks/use-language";
import { translate } from "@/lib/i18n";

declare global {
  interface Window {
    google?: any;
  }
}

export default function MapSection() {
  const { language } = useLanguage();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";
  
  useEffect(() => {
    // Skip map initialization if API key is not provided
    if (!googleMapsApiKey) {
      console.warn("Google Maps API key not provided. Map will not be displayed.");
      return;
    }
    
    // Initialize map only once when component mounts
    if (!mapInstance.current && mapRef.current) {
      // Load Google Maps API
      const loadGoogleMapsApi = () => {
        const existingScript = document.getElementById('google-maps-script');
        if (!existingScript) {
          const script = document.createElement('script');
          script.id = 'google-maps-script';
          script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&callback=initMap`;
          script.async = true;
          script.defer = true;
          document.head.appendChild(script);
          
          // Define global callback function
          window.initMap = () => {
            initializeMap();
          };
        } else if (window.google) {
          // API already loaded
          initializeMap();
        }
      };

      // Initialize the map
      const initializeMap = () => {
        if (!mapRef.current || !window.google) return;
        
        // Coordinates for Art Line office in Almaty
        const artLineLocation = { lat: 43.246223, lng: 76.944383 };
        
        mapInstance.current = new window.google.maps.Map(mapRef.current, {
          center: artLineLocation,
          zoom: 16,
          styles: [
            {
              "featureType": "all",
              "elementType": "geometry.fill",
              "stylers": [{ "weight": "2.00" }]
            },
            {
              "featureType": "all",
              "elementType": "geometry.stroke",
              "stylers": [{ "color": "#9c9c9c" }]
            },
            {
              "featureType": "all",
              "elementType": "labels.text",
              "stylers": [{ "visibility": "on" }]
            },
            {
              "featureType": "administrative",
              "elementType": "all",
              "stylers": [{ "visibility": "on" }]
            },
            {
              "featureType": "landscape",
              "elementType": "all",
              "stylers": [{ "color": "#f2f2f2" }]
            },
            {
              "featureType": "poi",
              "elementType": "all",
              "stylers": [{ "visibility": "off" }]
            },
            {
              "featureType": "road",
              "elementType": "all",
              "stylers": [{ "saturation": -100 }, { "lightness": 45 }]
            },
            {
              "featureType": "transit",
              "elementType": "all",
              "stylers": [{ "visibility": "simplified" }]
            },
            {
              "featureType": "water",
              "elementType": "all",
              "stylers": [{ "color": "#3498db" }, { "visibility": "on" }]
            }
          ],
          disableDefaultUI: true,
          zoomControl: true,
          mapTypeControl: false,
          scaleControl: true,
          streetViewControl: false,
          rotateControl: false,
          fullscreenControl: false
        });
        
        // Add marker for Art Line office
        const marker = new window.google.maps.Marker({
          position: artLineLocation,
          map: mapInstance.current,
          title: "Art Line",
          animation: window.google.maps.Animation.DROP,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            fillColor: '#E74C3C',
            fillOpacity: 1,
            strokeColor: '#FFFFFF',
            strokeWeight: 2,
            scale: 10
          }
        });
        
        // Add info window
        const infoWindow = new window.google.maps.InfoWindow({
          content: `<div style="font-family: 'Montserrat', sans-serif; padding: 8px;">
            <strong>Art Line</strong><br>
            ${language === "ru" ? "ул. Торетай 43, Алматы" : 
              language === "kz" ? "Торетай к-сі 43, Алматы" : 
              "43 Toretai St, Almaty"}
          </div>`
        });
        
        marker.addListener("click", () => {
          infoWindow.open(mapInstance.current, marker);
        });
      };
      
      loadGoogleMapsApi();
    }
    
    // Cleanup function
    return () => {
      const script = document.getElementById('google-maps-script');
      if (script) {
        script.remove();
      }
      delete window.initMap;
    };
  }, []);

  // Update info window content when language changes
  useEffect(() => {
    if (mapInstance.current && window.google) {
      // Re-initialize map when language changes to update info window content
      mapInstance.current = null;
      if (mapRef.current) {
        const initializeMap = window.initMap;
        if (typeof initializeMap === 'function') {
          initializeMap();
        }
      }
    }
  }, [language]);

  return (
    <section className="h-96 relative">
      <div className="absolute inset-0 z-10 pointer-events-none flex items-center">
        <div className="container mx-auto px-6">
          <div className="bg-white w-72 p-6 rounded-lg shadow-lg pointer-events-auto">
            <h3 className="font-montserrat font-semibold text-xl mb-4">
              {translate("contact.map.title", language)}
            </h3>
            <p className="mb-4">ул. Торетай 43, Алматы</p>
            <a 
              href="https://maps.google.com/?q=Алматы,+улица+Торетай+43" 
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center font-medium text-accent hover:underline"
            >
              {translate("contact.map.route", language)} <i className="fas fa-arrow-right ml-1"></i>
            </a>
          </div>
        </div>
      </div>
      
      <div 
        id="map" 
        ref={mapRef}
        className="w-full h-full bg-gray-200"
        aria-label="Location map of Art Line office"
      ></div>
    </section>
  );
}
