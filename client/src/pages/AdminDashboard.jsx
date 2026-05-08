import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import CreateListing from './CreateListing';
import {
  FiList,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiEye,
  FiEdit,
  FiSearch,
  FiFilter,
  FiAlertCircle,
  FiLogOut,
  FiGrid,
  FiTrendingUp,
  FiDollarSign,
  FiMapPin,
  FiCalendar,
  FiCamera,
  FiPlusCircle,
  FiDownload,
  FiWifi,
  FiWifiOff,
  FiSave,
  FiRefreshCw,
  FiTrash2,
} from 'react-icons/fi';

// ---------- SIDEBAR (unchanged) ----------
function Sidebar({ activeTab, setActiveTab, stats, handleLogout }) {
  const navItems = [
    { id: 'dashboard', label: 'Tableau de bord', icon: FiGrid },
    { id: 'pending', label: 'En attente', icon: FiClock, count: stats.pending },
    { id: 'approved', label: 'Approuvées', icon: FiCheckCircle, count: stats.approved },
    { id: 'rejected', label: 'Rejetées', icon: FiXCircle, count: stats.rejected },
    { id: 'sold', label: 'Vendues', icon: FiDollarSign, count: stats.sold },
    { id: 'all', label: 'Toutes', icon: FiList, count: stats.total },
    { id: 'create', label: 'Créer', icon: FiPlusCircle },
    { id: 'drafts', label: 'Brouillons', icon: FiSave, count: stats.drafts },
  ];

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-72 bg-slate-900 text-gray-300 h-screen sticky top-0">
      <div className="px-6 py-8 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <img src="/logo.jpg" alt="Logo" className="h-10 w-10 rounded-full" />
          <div>
            <h1 className="text-white font-bold text-lg">South Estates</h1>
            <p className="text-xs text-gray-500">Admin Panel</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition cursor-pointer ${
              activeTab === item.id ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/25' : 'text-gray-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span className="flex items-center space-x-3"><item.icon className="text-lg" /><span>{item.label}</span></span>
            {item.count !== undefined && (
              <span className={`px-2 py-0.5 text-xs rounded-full ${activeTab === item.id ? 'bg-white/20 text-white' : 'bg-slate-800 text-gray-400'}`}>{item.count}</span>
            )}
          </button>
        ))}
      </nav>
      <div className="px-4 py-6 border-t border-slate-800">
        <button onClick={handleLogout} className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm text-gray-400 hover:text-red-400 hover:bg-slate-800 cursor-pointer">
          <FiLogOut /><span>Se déconnecter</span>
        </button>
      </div>
    </aside>
  );
}

// ---------- MOBILE SIDEBAR (unchanged) ----------
function MobileSidebar({ activeTab, setActiveTab, stats, handleLogout, isOpen, onClose }) {
  if (!isOpen) return null;
  const navItems = [
    { id: 'dashboard', label: 'Tableau de bord', icon: FiGrid },
    { id: 'pending', label: 'En attente', icon: FiClock, count: stats.pending },
    { id: 'approved', label: 'Approuvées', icon: FiCheckCircle, count: stats.approved },
    { id: 'rejected', label: 'Rejetées', icon: FiXCircle, count: stats.rejected },
    { id: 'sold', label: 'Vendues', icon: FiDollarSign, count: stats.sold },
    { id: 'all', label: 'Toutes', icon: FiList, count: stats.total },
    { id: 'create', label: 'Créer', icon: FiPlusCircle },
    { id: 'drafts', label: 'Brouillons', icon: FiSave, count: stats.drafts },
  ];

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
      <aside className="absolute bottom-0 left-0 right-0 bg-slate-900 rounded-t-3xl max-h-[80vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center">
          <div className="flex items-center space-x-3"><img src="/logo.jpg" className="h-8 w-8 rounded-full" /><span className="text-white font-bold">Admin Panel</span></div>
          <button onClick={onClose} className="text-gray-400 hover:text-white cursor-pointer">&times;</button>
        </div>
        <nav className="px-4 py-4 space-y-1">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); onClose(); }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition cursor-pointer ${
                activeTab === item.id ? 'bg-emerald-600 text-white' : 'text-gray-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span className="flex items-center space-x-3"><item.icon /><span>{item.label}</span></span>
              {item.count !== undefined && <span className="px-2 py-0.5 text-xs rounded-full bg-slate-800">{item.count}</span>}
            </button>
          ))}
        </nav>
        <div className="px-4 py-4 border-t border-slate-800">
          <button onClick={handleLogout} className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm text-gray-400 hover:text-red-400 cursor-pointer"><FiLogOut /><span>Se déconnecter</span></button>
        </div>
      </aside>
    </div>
  );
}

// ---------- STAT CARD (unchanged) ----------
function StatCard({ icon: Icon, label, value, trend, color }) {
  const colorMap = {
    emerald: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    amber: 'bg-amber-50 border-amber-200 text-amber-800',
    blue: 'bg-blue-50 border-blue-200 text-blue-800',
    red: 'bg-red-50 border-red-200 text-red-800',
    purple: 'bg-purple-50 border-purple-200 text-purple-800',
    green: 'bg-green-50 border-green-200 text-green-800',
  };
  const iconBg = {
    emerald: 'bg-emerald-600',
    amber: 'bg-amber-500',
    blue: 'bg-blue-500',
    red: 'bg-red-500',
    purple: 'bg-purple-500',
    green: 'bg-green-600',
  };
  return (
    <div className={`rounded-2xl border p-6 ${colorMap[color]} transition-all hover:shadow-lg cursor-pointer`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium opacity-80">{label}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
          {trend && <p className="text-xs mt-2 opacity-75 flex items-center gap-1">{trend > 0 ? <FiTrendingUp className="inline" /> : null}{trend > 0 ? '+' : ''}{trend}%</p>}
        </div>
        <div className={`w-12 h-12 ${iconBg} rounded-xl flex items-center justify-center`}><Icon className="text-white text-xl" /></div>
      </div>
    </div>
  );
}

// ---------- STATUS BADGE (unchanged) ----------
function StatusBadge({ status }) {
  const styles = {
    pending: 'bg-amber-100 text-amber-800 border-amber-200',
    approved: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    rejected: 'bg-red-100 text-red-800 border-red-200',
    sold: 'bg-green-100 text-green-800 border-green-200',
  };
  const labels = { pending: 'En attente', approved: 'Approuvé', rejected: 'Rejeté', sold: 'Vendu' };
  const icons = { pending: <FiClock className="inline mr-1" />, approved: <FiCheckCircle className="inline mr-1" />, rejected: <FiXCircle className="inline mr-1" />, sold: <FiDollarSign className="inline mr-1" /> };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full border ${styles[status]}`}>{icons[status]}{labels[status]}</span>
  );
}

// ---------- PROPERTY DETAIL MODAL (unchanged) ----------
function PropertyDetailModal({ property, onClose }) {
  if (!property) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto">
        {property.property_images?.[0] && (
          <div className="relative h-56 rounded-t-2xl overflow-hidden">
            <img src={property.property_images[0].image_url} alt={property.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <button onClick={onClose} className="absolute top-4 right-4 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center hover:bg-white cursor-pointer">&times;</button>
            <div className="absolute bottom-4 left-4 text-white"><StatusBadge status={property.status} /></div>
          </div>
        )}
        {!property.property_images?.[0] && (
          <div className="flex justify-end p-4"><button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl cursor-pointer">&times;</button></div>
        )}
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">{property.title}</h2>
          <p className="text-gray-500 flex items-center gap-1 mb-6"><FiMapPin className="text-emerald-600" />{property.city}, {property.region}{property.district ? ` — ${property.district}` : ''}</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <DetailItem label="Type" value={property.offer_type} />
            <DetailItem label="Prix/m²" value={`${property.price_per_m2?.toLocaleString()} FCFA`} />
            <DetailItem label="Surface" value={`${property.surface?.toLocaleString()} m²`} />
            <DetailItem label="Prix total" value={`${property.total_price?.toLocaleString()} FCFA`} className="text-emerald-700 font-bold" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <DetailItem label="Commission" value={`${property.commission}%`} />
            <DetailItem label="Montant com." value={`${property.commission_amount?.toLocaleString()} FCFA`} />
            <DetailItem label="Référence" value={property.reference_number || '—'} />
            <DetailItem label="Mise en avant" value={property.featured ? 'Oui' : 'Non'} />
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
                  <span key={f.key} className={`px-3 py-1 text-xs rounded-full border ${property.property_features[f.key] ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-gray-50 border-gray-200 text-gray-400'}`}>{f.label}</span>
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
          <p className="text-xs text-gray-400 flex items-center gap-1"><FiCalendar /> Créé le {new Date(property.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
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

// ---------- CONFIRM MODAL (unchanged) ----------
function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmLabel, confirmColor }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4"><FiAlertCircle className="text-amber-600 text-2xl" /></div>
        <h3 className="text-lg font-bold text-gray-900 text-center mb-2">{title}</h3>
        <p className="text-gray-500 text-center text-sm mb-6">{message}</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer">Annuler</button>
          <button onClick={onConfirm} className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium text-white cursor-pointer ${confirmColor}`}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

// ---------- EDIT PROPERTY MODAL (unchanged, as previous full version) ----------
function EditPropertyModal({ property, onClose, onSave }) {
  const [form, setForm] = useState({
    title: property?.title || '',
    offer_type: property?.offer_type || 'Villa',
    price_per_m2: property?.price_per_m2 || '',
    surface: property?.surface || '',
    commission: property?.commission || 2.5,
    region: property?.region || '',
    city: property?.city || '',
    district: property?.district || '',
    description: property?.description || '',
    featured: property?.featured || false,
    featured_duration: property?.featured_duration || 'week1',
    featured_price: property?.featured_price || 0,
    status: property?.status || 'pending',
  });
  const [existingImages, setExistingImages] = useState(property?.property_images || []);
  const [newImages, setNewImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  if (!property) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    const total = existingImages.length + newImages.length + files.length;
    if (total > 7) {
      setError('Maximum 7 images autorisées.');
      return;
    }
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setNewImages(prev => [...prev, ...files]);
    setImagePreviews(prev => [...prev, ...newPreviews]);
  };

  const removeExistingImage = (index) => {
    const updated = existingImages.filter((_, i) => i !== index);
    setExistingImages(updated);
  };

  const removeNewImage = (index) => {
    URL.revokeObjectURL(imagePreviews[index]);
    const updatedNew = newImages.filter((_, i) => i !== index);
    const updatedPreviews = imagePreviews.filter((_, i) => i !== index);
    setNewImages(updatedNew);
    setImagePreviews(updatedPreviews);
  };

  const DURATION_OPTIONS = [
    { id: 'week1', label: '1 semaine', price: 5000 },
    { id: 'week2', label: '2 semaines', price: 10000 },
    { id: 'week3', label: '3 semaines', price: 14000 },
    { id: 'month1', label: '1 mois', price: 20000 },
  ];

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const total_price = parseFloat(form.price_per_m2) * parseFloat(form.surface);
      const commission_amount = total_price * (parseFloat(form.commission) / 100);

      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('offer_type', form.offer_type);
      formData.append('price_per_m2', form.price_per_m2);
      formData.append('surface', form.surface);
      formData.append('commission', form.commission.toString());
      formData.append('total_price', total_price.toString());
      formData.append('commission_amount', commission_amount.toString());
      formData.append('region', form.region);
      formData.append('city', form.city);
      formData.append('district', form.district || '');
      formData.append('description', form.description || '');
      formData.append('featured', form.featured ? 'true' : 'false');
      formData.append('featured_duration', form.featured ? form.featured_duration : '');
      formData.append('featured_price', form.featured ? (DURATION_OPTIONS.find(d => d.id === form.featured_duration)?.price || 0).toString() : '0');
      formData.append('status', form.status);
      formData.append('existing_images', existingImages.map(img => img.id).join(','));

      newImages.forEach(file => formData.append('images', file));

      await api.put(`/properties/${property.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      onSave();
      onClose();
    } catch (err) {
      setError('Erreur lors de la mise à jour.');
    } finally {
      setSaving(false);
    }
  };

  const OFFER_TYPES = ['Immeuble', 'Terrain', 'Villa', 'Maison', 'Appartement', 'Bureau'];
  const CAMEROON_REGIONS = ['Adamaoua', 'Centre', 'Est', 'Extrême‑Nord', 'Littoral', 'Nord', 'Nord‑Ouest', 'Ouest', 'Sud', 'Sud‑Ouest'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[85vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 rounded-t-2xl flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900">Modifier l'annonce</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-800 cursor-pointer">&times;</button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
            <input name="title" value={form.title} onChange={handleChange} className="w-full" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select name="offer_type" value={form.offer_type} onChange={handleChange}>
                {OFFER_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Commission (%)</label>
              <select name="commission" value={form.commission} onChange={handleChange}>
                {[2.5,3,4,5].map(c => <option key={c} value={c}>{c}%</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Prix/m²</label><input type="number" name="price_per_m2" value={form.price_per_m2} onChange={handleChange} /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Surface (m²)</label><input type="number" name="surface" value={form.surface} onChange={handleChange} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Région</label>
              <select name="region" value={form.region} onChange={handleChange}>
                <option value="">—</option>
                {CAMEROON_REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Ville</label><input name="city" value={form.city} onChange={handleChange} /></div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={3} />
          </div>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input type="checkbox" name="featured" checked={form.featured} onChange={handleChange} />
            <span className="text-sm text-gray-700">Mettre en avant</span>
          </label>
          {form.featured && (
            <div className="mt-4 p-4 bg-blue-50 rounded-xl">
              <p className="text-sm font-semibold text-blue-800 mb-2">Durée de mise en avant</p>
              <select name="featured_duration" value={form.featured_duration} onChange={handleChange}>
                {DURATION_OPTIONS.map(d => <option key={d.id} value={d.id}>{d.label} – {d.price.toLocaleString()} FCFA</option>)}
              </select>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
            <select name="status" value={form.status} onChange={handleChange}>
              <option value="pending">En attente</option>
              <option value="approved">Approuvée</option>
              <option value="rejected">Rejetée</option>
              <option value="sold">Vendue</option>
            </select>
          </div>

          {/* Image management */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Images existantes</label>
            <div className="flex flex-wrap gap-2 mb-4">
              {existingImages.map((img, idx) => (
                <div key={img.id} className="relative w-20 h-20 border rounded-lg overflow-hidden">
                  <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                  <button onClick={() => removeExistingImage(idx)} className="absolute top-0 right-0 bg-red-600 text-white w-4 h-4 flex items-center justify-center text-xs cursor-pointer">×</button>
                </div>
              ))}
              {existingImages.length === 0 && <p className="text-sm text-gray-500">Aucune image</p>}
            </div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ajouter de nouvelles images</label>
            <div className="flex flex-wrap gap-2 mb-4">
              {imagePreviews.map((preview, idx) => (
                <div key={idx} className="relative w-20 h-20 border rounded-lg overflow-hidden">
                  <img src={preview} alt="" className="w-full h-full object-cover" />
                  <button onClick={() => removeNewImage(idx)} className="absolute top-0 right-0 bg-red-600 text-white w-4 h-4 flex items-center justify-center text-xs cursor-pointer">×</button>
                </div>
              ))}
            </div>
            <input type="file" accept="image/*" multiple onChange={handleImageSelect} />
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}
        </div>
        <div className="border-t border-gray-100 px-6 py-4 flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 hover:bg-gray-50 cursor-pointer">Annuler</button>
          <button onClick={handleSave} disabled={saving} className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 cursor-pointer">{saving ? 'Enregistrement...' : 'Enregistrer'}</button>
        </div>
      </div>
    </div>
  );
}

// ---------- MAIN ADMIN DASHBOARD ----------
export default function AdminDashboard() {
  const { isAdmin, login, logout } = useAdminAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState('created_at');
  const [sortDir, setSortDir] = useState('desc');

  const [selectedProperty, setSelectedProperty] = useState(null);
  const [detailModal, setDetailModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: '', property: null });

  const [isOnline, setIsOnline] = useState(navigator.onLine);
  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => { window.removeEventListener('online', goOnline); window.removeEventListener('offline', goOffline); };
  }, []);

  const [drafts, setDrafts] = useState(JSON.parse(localStorage.getItem('drafts') || '[]'));
  const saveDraft = (draft) => {
    const updated = [...drafts, draft];
    localStorage.setItem('drafts', JSON.stringify(updated));
    setDrafts(updated);
  };
  const removeDraft = (index) => {
    const updated = drafts.filter((_, i) => i !== index);
    localStorage.setItem('drafts', JSON.stringify(updated));
    setDrafts(updated);
  };
  const publishDraft = async (draft, index) => {
    if (!isOnline) return alert('Vous devez être en ligne.');
    try {
      const form = new FormData();
      form.append('title', draft.title); form.append('offerType', draft.offerType);
      form.append('pricePerM2', draft.pricePerM2); form.append('surface', draft.surface);
      form.append('commission', draft.commission); form.append('region', draft.region);
      form.append('city', draft.city); form.append('district', draft.district || '');
      form.append('description', draft.description || '');
      form.append('featured', draft.featured ? 'true' : 'false');
      if (draft.featured) { form.append('featuredDuration', draft.featuredDuration); form.append('featuredPrice', draft.featuredPrice); }
      form.append('fullName', draft.fullName || ''); form.append('phone', draft.phone || '');
      form.append('email', draft.email || '');
      form.append('titreFoncier', draft.titreFoncier ? 'true' : 'false');
      form.append('viabilise', draft.viabilise ? 'true' : 'false');
      form.append('cloture', draft.cloture ? 'true' : 'false');
      form.append('accesFacile', draft.accesFacile ? 'true' : 'false');
      form.append('eauElectricite', draft.eauElectricite ? 'true' : 'false');
      const res = await api.post('/properties', form);
      if (res.data.success) { removeDraft(index); fetchProperties(); }
    } catch (err) { console.error(err); }
  };

  const exportCSV = () => {
    const headers = ['Titre', 'Type', 'Ville', 'Région', 'Prix Total', 'Statut', 'Référence'];
    const rows = properties.map(p => [p.title, p.offer_type, p.city, p.region, p.total_price, p.status, p.reference_number || '']);
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'annonces.csv';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  // ====== ENHANCED FETCH WITH TIMEOUT ======
  const fetchProperties = async () => {
    setLoading(true);
    setError(null);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout
      const res = await api.get('/properties/admin', { signal: controller.signal });
      clearTimeout(timeoutId);
      setProperties(res.data.data || []);
    } catch (err) {
      console.error('Fetch error:', err);
      if (err.response?.status === 401) {
        logout();
        navigate('/');
      } else if (err.code === 'ERR_CANCELED') {
        setError('Le serveur met trop de temps à répondre. Veuillez réessayer.');
      } else {
        setError('Impossible de charger les annonces. Vérifiez que le serveur est lancé.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) fetchProperties();
  }, [isAdmin]);

  const handleLogin = async (e) => { e.preventDefault(); setLoginError(''); setLoggingIn(true); const success = await login(username, password); setLoggingIn(false); if (!success) setLoginError('Identifiants incorrects'); };
  const handleLogout = () => { logout(); navigate('/'); };
  const handleApprove = async (p) => { try { await api.put(`/properties/${p.id}/approve`); fetchProperties(); setConfirmModal({ isOpen: false }); } catch(err){console.error(err);} };
  const handleReject = async (p) => { try { await api.put(`/properties/${p.id}/reject`); fetchProperties(); setConfirmModal({ isOpen: false }); } catch(err){console.error(err);} };
  const handleMarkSold = async (p) => { try { await api.put(`/properties/${p.id}/sold`); fetchProperties(); setConfirmModal({ isOpen: false }); } catch(err){console.error(err);} };
  const handleCreateSuccess = () => { fetchProperties(); setActiveTab('all'); };

  const filteredProperties = properties
    .filter(p => {
      if (statusFilter !== 'all' && p.status !== statusFilter) return false;
      if (searchQuery) { const q = searchQuery.toLowerCase(); return p.title?.toLowerCase().includes(q) || p.city?.toLowerCase().includes(q) || p.reference_number?.toLowerCase().includes(q); }
      return true;
    })
    .sort((a,b) => {
      let va = a[sortField], vb = b[sortField];
      if (sortField === 'created_at') { va = new Date(a.created_at).getTime(); vb = new Date(b.created_at).getTime(); }
      else if (sortField === 'total_price') { va = parseFloat(a.total_price)||0; vb = parseFloat(b.total_price)||0; }
      return sortDir === 'asc' ? (va>vb?1:-1) : (va<vb?1:-1);
    });

  const soldProperties = properties.filter(p => p.status === 'sold');
  const totalProfit = soldProperties.reduce((sum, p) => sum + (parseFloat(p.commission_amount)||0), 0);
  const stats = {
    total: properties.length,
    pending: properties.filter(p => p.status==='pending').length,
    approved: properties.filter(p => p.status==='approved').length,
    rejected: properties.filter(p => p.status==='rejected').length,
    sold: soldProperties.length,
    drafts: drafts.length,
    totalProfit,
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-white pt-24 pb-12 px-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <img src="/logo.jpg" alt="Logo" className="h-16 w-16 rounded-full mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800">Accès Administrateur</h2>
            <p className="text-gray-500 text-sm mt-1">Veuillez vous connecter.</p>
          </div>
          <form onSubmit={handleLogin}>
            <div className="mb-3"><label className="block text-sm font-medium text-gray-700">Nom d'utilisateur</label><input type="text" value={username} onChange={e=>setUsername(e.target.value)} required className="mt-1 block w-full" /></div>
            <div className="mb-4"><label className="block text-sm font-medium text-gray-700">Mot de passe</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)} required className="mt-1 block w-full" /></div>
            {loginError && <p className="text-red-600 text-sm mb-3">{loginError}</p>}
            <button type="submit" disabled={loggingIn} className="w-full bg-emerald-700 hover:bg-emerald-800 text-white py-3 rounded-xl font-medium transition disabled:opacity-50 cursor-pointer">{loggingIn ? 'Connexion...' : 'Se connecter'}</button>
          </form>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    if (activeTab === 'create') return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <CreateListing embedded onSuccess={handleCreateSuccess} offlineMode={!isOnline} onSaveDraft={!isOnline ? saveDraft : undefined} />
      </div>
    );
    if (activeTab === 'drafts') return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Brouillons</h2>
        {drafts.length === 0 ? <p className="text-gray-500 text-center py-8">Aucun brouillon.</p> : (
          <div className="space-y-4">
            {drafts.map((draft, idx) => (
              <div key={idx} className="border rounded-xl p-4 flex flex-wrap justify-between items-center">
                <div><p className="font-semibold">{draft.title || 'Sans titre'}</p><p className="text-sm text-gray-500">{draft.city} • {draft.offerType}</p><p className="text-xs text-gray-400">Créé le {new Date(draft.createdAt).toLocaleDateString('fr-FR')}</p></div>
                <div className="flex gap-2 mt-2 sm:mt-0">
                  <button onClick={() => publishDraft(draft, idx)} disabled={!isOnline} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700 disabled:opacity-50 cursor-pointer">Publier</button>
                  <button onClick={() => removeDraft(idx)} className="px-4 py-2 border border-red-200 text-red-600 rounded-lg text-sm hover:bg-red-50 cursor-pointer">Supprimer</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );

    const displayed = activeTab === 'dashboard' ? properties : filteredProperties.filter(p => {
      if (activeTab==='pending') return p.status==='pending';
      if (activeTab==='approved') return p.status==='approved';
      if (activeTab==='rejected') return p.status==='rejected';
      if (activeTab==='sold') return p.status==='sold';
      return true;
    });

    return (
      <>
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            <StatCard icon={FiList} label="Total annonces" value={stats.total} color="purple" />
            <StatCard icon={FiClock} label="En attente" value={stats.pending} color="amber" />
            <StatCard icon={FiCheckCircle} label="Approuvées" value={stats.approved} color="emerald" />
            <StatCard icon={FiXCircle} label="Rejetées" value={stats.rejected} color="red" />
            <StatCard icon={FiDollarSign} label="Vendues" value={stats.sold} color="green" />
            <StatCard icon={FiTrendingUp} label="Profit total" value={`${(stats.totalProfit/1000).toFixed(0)}k FCFA`} color="blue" />
          </div>
        )}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-6 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2"><FiFilter className="text-gray-400" /><span className="text-sm text-gray-600">Filtrer :</span></div>
          {['all','pending','approved','rejected','sold'].map(s => (
            <button key={s} onClick={()=>{ setStatusFilter(s); if(s!=='all') setActiveTab(s); else setActiveTab('all'); }} className={`px-3 py-1.5 text-xs font-medium rounded-full transition cursor-pointer ${statusFilter===s ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {s==='all'?'Tous':s==='pending'?'En attente':s==='approved'?'Approuvées':s==='rejected'?'Rejetées':'Vendues'}
            </button>
          ))}
          <div className="ml-auto text-xs text-gray-500">{displayed.length} résultat(s)</div>
        </div>

        {loading && !error && (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl text-center">
            <p className="mb-3">{error}</p>
            <button onClick={fetchProperties} className="inline-flex items-center gap-1 text-sm bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 cursor-pointer">
              <FiRefreshCw /> Réessayer
            </button>
          </div>
        )}
        {!loading && !error && displayed.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4"><FiList className="text-gray-400 text-2xl" /></div>
            <h3 className="text-lg font-semibold text-gray-700">Aucune annonce trouvée</h3>
            <p className="text-gray-500 text-sm mt-1">Aucune annonce ne correspond à vos critères.</p>
          </div>
        )}
        {!loading && !error && displayed.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-gray-600">Annonce</th>
                    <th className="px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Type</th>
                    <th className="px-4 py-3 font-semibold text-gray-600 hidden lg:table-cell">Localisation</th>
                    <th className="px-4 py-3 font-semibold text-gray-600">Prix</th>
                    <th className="px-4 py-3 font-semibold text-gray-600 hidden sm:table-cell">Statut</th>
                    <th className="px-4 py-3 font-semibold text-gray-600 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {displayed.map(p => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {p.property_images?.[0] ? <img src={p.property_images[0].image_url} className="w-10 h-10 rounded-lg object-cover" /> : <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center"><FiCamera className="text-gray-400" /></div>}
                          <div><p className="font-medium text-gray-900">{p.title}</p><p className="text-xs text-gray-500">{p.reference_number || '—'}</p></div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell"><span className="px-2 py-0.5 bg-gray-100 rounded-full text-xs font-medium">{p.offer_type}</span></td>
                      <td className="px-4 py-3 hidden lg:table-cell text-gray-600 text-xs">{p.city}, {p.region}</td>
                      <td className="px-4 py-3 font-semibold text-gray-900">{p.total_price?.toLocaleString()} <span className="text-xs text-gray-400">FCFA</span></td>
                      <td className="px-4 py-3 hidden sm:table-cell"><StatusBadge status={p.status} /></td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={()=>{setSelectedProperty(p); setDetailModal(true);}} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer" title="Voir"><FiEye /></button>
                          <button onClick={()=>{setSelectedProperty(p); setEditModal(true);}} className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg cursor-pointer" title="Modifier"><FiEdit /></button>
                          {p.status==='pending' && (
                            <>
                              <button onClick={()=>setConfirmModal({isOpen:true, type:'approve', property:p})} className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg cursor-pointer" title="Approuver"><FiCheckCircle /></button>
                              <button onClick={()=>setConfirmModal({isOpen:true, type:'reject', property:p})} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer" title="Rejeter"><FiXCircle /></button>
                            </>
                          )}
                          {p.status==='approved' && (
                            <button onClick={()=>setConfirmModal({isOpen:true, type:'sold', property:p})} className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg cursor-pointer" title="Vendu"><FiDollarSign /></button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="min-h-screen flex">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} stats={stats} handleLogout={handleLogout} />
      <MobileSidebar activeTab={activeTab} setActiveTab={setActiveTab} stats={stats} handleLogout={handleLogout} isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
      <div className="flex-1 flex flex-col min-h-screen bg-gradient-to-br from-amber-50 to-white">
        <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button onClick={() => setMobileMenuOpen(true)} className="lg:hidden text-gray-600 cursor-pointer">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <h1 className="text-xl font-bold text-gray-900">
              {activeTab === 'dashboard' ? 'Tableau de bord' : activeTab === 'create' ? 'Créer une annonce' : activeTab === 'drafts' ? 'Brouillons' : activeTab === 'pending' ? 'En attente' : activeTab === 'approved' ? 'Approuvées' : activeTab === 'rejected' ? 'Rejetées' : activeTab === 'sold' ? 'Vendues' : 'Toutes les annonces'}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <span className={`flex items-center gap-1 text-xs font-medium ${isOnline ? 'text-green-600' : 'text-red-600'}`}>{isOnline ? <FiWifi /> : <FiWifiOff />}{isOnline ? 'En ligne' : 'Hors ligne'}</span>
            {activeTab !== 'create' && activeTab !== 'drafts' && (
              <button onClick={exportCSV} className="flex items-center gap-1 text-sm bg-emerald-600 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-700 cursor-pointer"><FiDownload /> Exporter CSV</button>
            )}
            <div className="h-8 w-px bg-gray-200"></div>
            <div className="flex items-center gap-2">
              <img src="/logo.jpg" alt="Admin" className="h-8 w-8 rounded-full" />
              <div className="hidden sm:block"><p className="text-sm font-medium text-gray-900">Felix Ernest</p><p className="text-xs text-gray-500">Administrateur</p></div>
            </div>
          </div>
        </header>
        <div className="flex-1 p-6">
          {renderContent()}
        </div>
      </div>

      <PropertyDetailModal property={selectedProperty} onClose={() => setDetailModal(false)} />
      <EditPropertyModal property={selectedProperty} onClose={() => setEditModal(false)} onSave={fetchProperties} />
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, type: '', property: null })}
        onConfirm={() => {
          if (confirmModal.type === 'approve') handleApprove(confirmModal.property);
          else if (confirmModal.type === 'reject') handleReject(confirmModal.property);
          else if (confirmModal.type === 'sold') handleMarkSold(confirmModal.property);
        }}
        title={
          confirmModal.type === 'approve' ? 'Approuver cette annonce ?' :
          confirmModal.type === 'reject' ? 'Rejeter cette annonce ?' :
          confirmModal.type === 'sold' ? 'Marquer comme vendu ?' : ''
        }
        message={
          confirmModal.type === 'approve' ? 'Elle sera visible publiquement.' :
          confirmModal.type === 'reject' ? 'Elle sera rejetée.' :
          confirmModal.type === 'sold' ? "L'annonce passera en statut vendu." : ''
        }
        confirmLabel={
          confirmModal.type === 'approve' ? 'Approuver' :
          confirmModal.type === 'reject' ? 'Rejeter' : 'Vendu'
        }
        confirmColor={
          confirmModal.type === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700' :
          confirmModal.type === 'reject' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
        }
      />
    </div>
  );
}