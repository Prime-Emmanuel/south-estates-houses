import { useRef, useEffect, useState } from 'react';
import api from '../services/api';

export default function FeaturedBanner() {
  const [featured, setFeatured] = useState([]);
  const trackRef = useRef(null);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await api.get('/properties');
        const approved = res.data.data || [];
        setFeatured(approved.filter(p => p.featured));
      } catch (err) {
        console.error(err);
      }
    };
    fetchFeatured();
  }, []);

  const duplicated = featured.length > 0 ? [...featured, ...featured] : [];

  return (
    <div className="fixed top-0 left-0 right-0 h-10 bg-emerald-600 text-white z-50 shadow-md overflow-hidden">
      {featured.length > 0 ? (
        <div
          ref={trackRef}
          className="flex items-center h-full space-x-8 animate-scroll"
          style={{ width: `${featured.length * 2 * 200}px` }}
        >
          {duplicated.map((property, idx) => (
            <div key={`${property.id}-${idx}`} className="flex items-center space-x-2 flex-shrink-0 px-2">
              <div className="w-6 h-6 rounded-full overflow-hidden border border-white flex-shrink-0">
                {property.property_images?.[0] ? (
                  <img src={property.property_images[0].image_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-emerald-500 flex items-center justify-center text-xs">🏠</div>
                )}
              </div>
              <span className="text-sm font-medium truncate max-w-[150px]">{property.title}</span>
              <span className="text-xs text-emerald-100 font-semibold">{property.total_price?.toLocaleString()} FCFA</span>
              <span className="text-xs text-white/70 hidden sm:inline">{property.city}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center h-full text-sm font-medium animate-pulse">
          ✨ Publiez une annonce et activez « Mettre en avant » pour apparaître ici ! ✨
        </div>
      )}

      <style>{`
        .animate-scroll {
          animation: scrollLeft ${featured.length * 8 + 10}s linear infinite;
        }
        @keyframes scrollLeft {
          from { transform: translateX(100vw); }
          to { transform: translateX(-100%); }
        }
      `}</style>
    </div>
  );
}