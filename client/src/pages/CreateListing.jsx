import { useState, useRef } from 'react';
import api from '../services/api';

const COMMISSION_OPTIONS = [2.5, 3, 4, 5];
const CAMEROON_REGIONS = [
  'Adamaoua', 'Centre', 'Est', 'Extrême‑Nord', 'Littoral',
  'Nord', 'Nord‑Ouest', 'Ouest', 'Sud', 'Sud‑Ouest'
];
const OFFER_TYPES = ['Immeuble', 'Terrain', 'Villa', 'Maison', 'Appartement', 'Bureau'];

const DURATION_OPTIONS = [
  { id: 'week1', label: '1 semaine', price: 5000 },
  { id: 'week2', label: '2 semaines', price: 10000 },
  { id: 'week3', label: '3 semaines', price: 14000 },
  { id: 'month1', label: '1 mois', price: 20000 },
];

export default function CreateListing({ embedded = false, onSuccess, offlineMode = false, onSaveDraft }) {
  const [formData, setFormData] = useState({
    title: '',
    offerType: 'Villa',
    pricePerM2: '',
    surface: '',
    commission: 2.5,
    region: '',
    city: '',
    district: '',
    titreFoncier: false,
    viabilise: false,
    cloture: false,
    accesFacile: false,
    eauElectricite: false,
    fullName: '',
    phone: '',
    email: '',
    description: '',
    featured: false,
    featuredDuration: 'week1',
  });
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const descRef = useRef(null);

  const pricePerM2Num = parseFloat(formData.pricePerM2) || 0;
  const surfaceNum = parseFloat(formData.surface) || 0;
  const totalPrice = pricePerM2Num * surfaceNum;
  const commissionAmount = totalPrice * (formData.commission / 100);

  const selectedDuration = DURATION_OPTIONS.find(d => d.id === formData.featuredDuration);
  const featuredPrice = formData.featured ? (selectedDuration?.price || 0) : 0;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleDescriptionKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const { selectionStart, selectionEnd, value } = descRef.current;
      const before = value.substring(0, selectionStart);
      const after = value.substring(selectionEnd);
      const newValue = before + '\n- ' + after;
      setFormData(prev => ({ ...prev, description: newValue }));
      setTimeout(() => {
        descRef.current.selectionStart = descRef.current.selectionEnd = selectionStart + 3;
      }, 0);
    }
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 7) {
      setMessage({ type: 'error', text: 'Maximum 7 images autorisées.' });
      return;
    }
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImages(prev => [...prev, ...files]);
    setImagePreviews(prev => [...prev, ...newPreviews]);
  };

  const removeImage = (index) => {
    URL.revokeObjectURL(imagePreviews[index]);
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setImages(newImages);
    setImagePreviews(newPreviews);
  };

  const validate = () => {
    const errors = {};
    if (!formData.title.trim()) errors.title = 'Titre requis';
    if (!formData.pricePerM2 || isNaN(pricePerM2Num) || pricePerM2Num <= 0)
      errors.pricePerM2 = 'Prix au m² invalide';
    if (!formData.surface || isNaN(surfaceNum) || surfaceNum <= 0)
      errors.surface = 'Surface invalide';
    if (!formData.region) errors.region = 'Région requise';
    if (!formData.city.trim()) errors.city = 'Ville requise';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (offlineMode) {
      const draft = { ...formData, createdAt: new Date().toISOString() };
      if (onSaveDraft) onSaveDraft(draft);
      setMessage({ type: 'success', text: 'Brouillon sauvegardé localement.' });
      resetForm();
      return;
    }

    setSubmitting(true);
    setMessage({ type: '', text: '' });
    try {
      const form = new FormData();
      form.append('title', formData.title);
      form.append('offerType', formData.offerType);
      form.append('pricePerM2', pricePerM2Num.toString());
      form.append('surface', surfaceNum.toString());
      form.append('commission', formData.commission.toString());
      form.append('region', formData.region);
      form.append('city', formData.city);
      form.append('district', formData.district || '');
      form.append('description', formData.description || '');
      form.append('featured', formData.featured ? 'true' : 'false');
      if (formData.featured) {
        form.append('featuredDuration', formData.featuredDuration);
        form.append('featuredPrice', featuredPrice.toString());
      }
      form.append('fullName', formData.fullName || '');
      form.append('phone', formData.phone || '');
      form.append('email', formData.email || '');
      form.append('titreFoncier', formData.titreFoncier ? 'true' : 'false');
      form.append('viabilise', formData.viabilise ? 'true' : 'false');
      form.append('cloture', formData.cloture ? 'true' : 'false');
      form.append('accesFacile', formData.accesFacile ? 'true' : 'false');
      form.append('eauElectricite', formData.eauElectricite ? 'true' : 'false');

      images.forEach(img => form.append('images', img));

      const res = await api.post('/properties', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        setMessage({ type: 'success', text: 'Annonce soumise avec succès. En attente de validation.' });
        resetForm();
        if (onSuccess) onSuccess();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Erreur lors de la soumission.';
      setMessage({ type: 'error', text: msg });
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '', offerType: 'Villa', pricePerM2: '', surface: '', commission: 2.5,
      region: '', city: '', district: '', titreFoncier: false, viabilise: false,
      cloture: false, accesFacile: false, eauElectricite: false,
      fullName: '', phone: '', email: '', description: '', featured: false,
      featuredDuration: 'week1',
    });
    setImages([]);
    setImagePreviews([]);
  };

  const inputClass = "w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 shadow-sm transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none";
  const selectClass = "w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 shadow-sm transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none";

  return (
    <div className={embedded ? '' : 'max-w-3xl mx-auto px-4 py-8'}>
      {!embedded && (
        <>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Publier une annonce</h1>
          <p className="text-gray-600 mb-8">Remplissez le formulaire ci‑dessous.</p>
        </>
      )}

      {message.text && (
        <div className={`mb-6 p-4 rounded-xl ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        {/* Section 1: Informations principales */}
        <FormSection title="Informations principales">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label>Type d'offre *</Label>
              <select name="offerType" value={formData.offerType} onChange={handleChange} className={selectClass}>
                {OFFER_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <Label>Titre de l'annonce *</Label>
              <input name="title" value={formData.title} onChange={handleChange} className={inputClass} />
              {fieldErrors.title && <ErrorText>{fieldErrors.title}</ErrorText>}
            </div>
            <div>
              <Label>Prix au m² *</Label>
              <input type="number" name="pricePerM2" value={formData.pricePerM2} onChange={handleChange} className={inputClass} min="0" />
              {fieldErrors.pricePerM2 && <ErrorText>{fieldErrors.pricePerM2}</ErrorText>}
            </div>
            <div>
              <Label>Surface (m²) *</Label>
              <input type="number" name="surface" value={formData.surface} onChange={handleChange} className={inputClass} min="0" />
              {fieldErrors.surface && <ErrorText>{fieldErrors.surface}</ErrorText>}
            </div>
          </div>
          <div className="mt-4 p-4 bg-emerald-50 rounded-xl border border-emerald-200">
            <p className="text-sm text-gray-700">Prix total estimé : <span className="font-bold text-emerald-800">{totalPrice.toLocaleString()} FCFA</span></p>
            <p className="text-sm text-gray-700">Commission ({formData.commission}%) : <span className="font-bold">{commissionAmount.toLocaleString()} FCFA</span></p>
          </div>
        </FormSection>

        {/* Section 2: Commission */}
        <FormSection title="Commission">
          <div className="flex flex-wrap gap-4">
            {COMMISSION_OPTIONS.map(opt => (
              <label key={opt} className="flex items-center space-x-2 cursor-pointer">
                <input type="radio" name="commission" value={opt} checked={formData.commission === opt} onChange={handleChange} className="cursor-pointer" />
                <span className="text-gray-900 select-none">{opt}%</span>
              </label>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">Choisissez le pourcentage de commission.</p>
        </FormSection>

        {/* Section 3: Localisation */}
        <FormSection title="Localisation">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Région *</Label>
              <select name="region" value={formData.region} onChange={handleChange} className={selectClass}>
                <option value="">Sélectionnez une région</option>
                {CAMEROON_REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              {fieldErrors.region && <ErrorText>{fieldErrors.region}</ErrorText>}
            </div>
            <div>
              <Label>Ville *</Label>
              <input name="city" value={formData.city} onChange={handleChange} className={inputClass} />
              {fieldErrors.city && <ErrorText>{fieldErrors.city}</ErrorText>}
            </div>
            <div className="md:col-span-2">
              <Label>Quartier (optionnel)</Label>
              <input name="district" value={formData.district} onChange={handleChange} className={inputClass} />
            </div>
          </div>
        </FormSection>

        {/* Section 4: Caractéristiques */}
        <FormSection title="Caractéristiques">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { name: 'titreFoncier', label: 'Titre foncier' },
              { name: 'viabilise', label: 'Viabilisé' },
              { name: 'cloture', label: 'Clôture' },
              { name: 'accesFacile', label: 'Accès facile' },
              { name: 'eauElectricite', label: 'Eau / Électricité' },
            ].map(feat => (
              <label key={feat.name} className="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" name={feat.name} checked={formData[feat.name]} onChange={handleChange} />
                <span className="text-gray-900 text-sm select-none">{feat.label}</span>
              </label>
            ))}
          </div>
        </FormSection>

        {/* Section 5: Contact */}
        <FormSection title="Contact (optionnel)">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Nom complet</Label>
              <input name="fullName" value={formData.fullName} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <Label>Téléphone</Label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <Label>Email</Label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} className={inputClass} />
            </div>
          </div>
        </FormSection>

        {/* Section 6: Description */}
        <FormSection title="Description">
          <textarea
            ref={descRef}
            name="description"
            value={formData.description}
            onChange={handleChange}
            onKeyDown={handleDescriptionKeyDown}
            rows={5}
            className={inputClass}
            placeholder="Décrivez votre bien... (appuyez sur Entrée pour ajouter un tiret)"
          />
          <p className="text-xs text-gray-500 mt-1">Pressez Entrée pour insérer automatiquement "- ".</p>
        </FormSection>

        {/* Section 7: Images */}
        <FormSection title="Images (max 7)">
          <div className="flex flex-wrap gap-4 mb-4">
            {imagePreviews.map((preview, idx) => (
              <div key={idx} className="relative w-24 h-24 border rounded-xl overflow-hidden shadow-sm">
                <img src={preview} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute top-0 right-0 bg-red-600 text-white w-5 h-5 flex items-center justify-center text-xs hover:bg-red-700 cursor-pointer"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <input type="file" accept="image/*" multiple onChange={handleImageSelect} className="block text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer" />
        </FormSection>

        {/* Section 8: Visibilité */}
        <FormSection title="Visibilité">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input type="checkbox" name="featured" checked={formData.featured} onChange={handleChange} />
            <span className="text-gray-900 select-none">Mettre en avant (affichage prioritaire)</span>
          </label>

          {formData.featured && (
            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <p className="text-sm font-semibold text-amber-900 mb-3">Choisissez la durée :</p>
              <div className="flex flex-wrap gap-3">
                {DURATION_OPTIONS.map(option => (
                  <label key={option.id} className="flex items-center space-x-2 cursor-pointer bg-white rounded-lg px-3 py-2 border border-amber-300 hover:border-amber-500 transition text-gray-900">
                    <input
                      type="radio"
                      name="featuredDuration"
                      value={option.id}
                      checked={formData.featuredDuration === option.id}
                      onChange={handleChange}
                      className="cursor-pointer"
                    />
                    <span className="text-sm font-medium">{option.label} – {option.price.toLocaleString()} FCFA</span>
                  </label>
                ))}
              </div>
              <p className="text-xs text-amber-800 mt-2">
                Prix de la mise en avant : <strong>{featuredPrice.toLocaleString()} FCFA</strong>
              </p>
            </div>
          )}
        </FormSection>

        <div className="mt-8 flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className={`bg-emerald-700 hover:bg-emerald-800 text-white px-8 py-3 rounded-full font-medium disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg cursor-pointer ${offlineMode ? 'bg-gray-600 hover:bg-gray-700' : ''}`}
          >
            {offlineMode ? 'Sauvegarder en brouillon' : submitting ? 'Soumission...' : "Publier l'annonce"}
          </button>
        </div>
      </form>
    </div>
  );
}

function FormSection({ title, children }) {
  return (
    <fieldset className="bg-white border border-gray-200 rounded-2xl p-6 mb-6 shadow-sm">
      <legend className="text-lg font-semibold text-gray-900 px-3 py-1 bg-emerald-100 rounded-full">
        {title}
      </legend>
      {children}
    </fieldset>
  );
}

function Label({ children }) {
  return <label className="block text-sm font-medium text-gray-800 mb-1">{children}</label>;
}

function ErrorText({ children }) {
  return <p className="text-red-600 text-sm mt-1">{children}</p>;
}
