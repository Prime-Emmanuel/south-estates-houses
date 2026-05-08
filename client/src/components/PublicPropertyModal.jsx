import { FiMapPin, FiPhone, FiMail } from 'react-icons/fi';

export default function PublicPropertyModal({ property, onClose }) {
  if (!property) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto">
        {property.property_images?.[0] && (
          <div className="relative h-56 rounded-t-2xl overflow-hidden">
            <img src={property.property_images[0].image_url} alt={property.title} className="w-full h-full object-cover" />
            <button onClick={onClose} className="absolute top-4 right-4 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center hover:bg-white cursor-pointer transition">
              &times;
            </button>
            {property.featured && (
              <span className="absolute bottom-4 left-4 bg-amber-500 text-white px-3 py-1 text-xs font-bold rounded-full">En vedette</span>
            )}
          </div>
        )}
        {!property.property_images?.[0] && (
          <div className="flex justify-end p-4">
            <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl cursor-pointer">&times;</button>
          </div>
        )}

        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">{property.title}</h2>
          <p className="text-gray-500 flex items-center gap-1 mb-6">
            <FiMapPin className="text-emerald-600" />
            {property.city}, {property.region}{property.district ? ` — ${property.district}` : ''}
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <DetailItem label="Type" value={property.offer_type} />
            <DetailItem label="Prix/m²" value={`${property.price_per_m2?.toLocaleString()} FCFA`} />
            <DetailItem label="Surface" value={`${property.surface?.toLocaleString()} m²`} />
            <DetailItem label="Prix total" value={`${property.total_price?.toLocaleString()} FCFA`} className="text-emerald-700 font-bold" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <DetailItem label="Commission" value={`${property.commission}%`} />
            <DetailItem label="Référence" value={property.reference_number || '—'} />
            <DetailItem label="Mise en avant" value={property.featured ? 'Oui' : 'Non'} />
            <DetailItem label="Créé le" value={new Date(property.created_at).toLocaleDateString('fr-FR')} />
          </div>

          {property.property_features && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">Caractéristiques</h3>
              <div className="flex flex-wrap gap-2">
                {[
                  { key: 'titre_foncier', label: 'Titre foncier' },
                  { key: 'viabilise', label: 'Viabilisé' },
                  { key: 'cloture', label: 'Clôture' },
                  { key: 'acces_facile', label: 'Accès facile' },
                  { key: 'eau_electricite', label: 'Eau/Électricité' },
                ].map(f => (
                  <span
                    key={f.key}
                    className={`px-3 py-1 text-xs rounded-full border ${
                      property.property_features[f.key]
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                        : 'bg-gray-50 border-gray-200 text-gray-400'
                    }`}
                  >
                    {f.label}
                  </span>
                ))}
              </div>
            </div>
          )}

          {property.description && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">Description</h3>
              <p className="text-gray-600 whitespace-pre-wrap text-sm bg-gray-50 rounded-xl p-4">{property.description}</p>
            </div>
          )}

          {property.property_images?.length > 1 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">Galerie ({property.property_images.length} images)</h3>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {property.property_images.map((img, i) => (
                  <img key={i} src={img.image_url} alt="" className="w-24 h-24 object-cover rounded-xl flex-shrink-0 border border-gray-200" />
                ))}
              </div>
            </div>
          )}

          {/* Contact card – generic info, not the original poster */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-amber-900 mb-2">Intéressé par ce bien ?</h3>
            <p className="text-sm text-amber-800">Contactez <strong>South Estates & Houses</strong>, votre agent pour cette annonce.</p>
            <div className="flex flex-col sm:flex-row gap-4 mt-3 text-sm">
              <span className="flex items-center gap-1 text-amber-900"><FiPhone /> +237 6 99 94 92 66</span>
              <span className="flex items-center gap-1 text-amber-900"><FiMail /> contact@southestates.cm</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailItem({ label, value, className = '' }) {
  return (
    <div>
      <p className="text-xs text-gray-500 uppercase tracking-wider">{label}</p>
      <p className={`text-sm font-medium mt-1 ${className}`}>{value}</p>
    </div>
  );
}