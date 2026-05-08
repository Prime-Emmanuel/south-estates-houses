import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';
import CreateListing from './CreateListing';
import SectionDivider from '../components/SectionDivider';
import PublicPropertyModal from '../components/PublicPropertyModal';
import { FiShield, FiUploadCloud, FiSearch, FiCheckCircle, FiZap, FiLock, FiEye } from 'react-icons/fi';

const fadeIn = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

export default function Home() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchRef, setSearchRef] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searching, setSearching] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const location = useLocation();
  const scrollTo = location.state?.scrollTo;

  useEffect(() => {
    if (scrollTo) {
      const el = document.getElementById(scrollTo);
      if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  }, [scrollTo]);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const res = await api.get('/properties');
        setProperties(res.data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchRef.trim()) return;
    setSearching(true);
    setSearchResult(null);
    try {
      const res = await api.get('/properties');
      const allApproved = res.data.data;
      const found = allApproved.find(p => p.reference_number === searchRef.trim());
      setSearchResult(found || null);
    } catch (err) {
      console.error(err);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section
        id="accueil"
        className="relative bg-cover bg-center min-h-[70vh] flex items-center justify-center text-white"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1950&q=80')`,
        }}
      >
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="relative max-w-4xl mx-auto text-center px-4 pt-20">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-6xl font-extrabold font-serif tracking-tight mb-6"
          >
            Découvrez des propriétés d'exception au Cameroun
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-lg md:text-xl text-gray-200 mb-10"
          >
            Terrains, villas, appartements – votre bien idéal vous attend.
          </motion.p>
          <form onSubmit={handleSearch} className="flex justify-center">
            <div className="flex w-full max-w-lg bg-white rounded-full overflow-hidden shadow-2xl">
              <input
                type="text"
                placeholder="Rechercher par référence (ex: SE-001-05-26)"
                className="flex-1 px-6 py-4 text-gray-800 placeholder-gray-400 focus:outline-none"
                value={searchRef}
                onChange={(e) => setSearchRef(e.target.value)}
              />
              <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 font-medium transition cursor-pointer">
                Rechercher
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Search Result */}
      {searchResult && (
        <section className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Propriété trouvée</h2>
            <div className="flex flex-wrap items-center gap-4">
              {searchResult.property_images?.[0] && (
                <img src={searchResult.property_images[0].image_url} alt="" className="w-24 h-24 object-cover rounded-xl" />
              )}
              <div>
                <p className="font-bold text-lg">{searchResult.title}</p>
                <p className="text-gray-600">{searchResult.city}, {searchResult.region}</p>
                <p className="text-emerald-700 font-semibold">{searchResult.total_price.toLocaleString()} FCFA</p>
                <p className="text-xs text-gray-500">Réf : {searchResult.reference_number}</p>
                <button
                  onClick={() => setSelectedProperty(searchResult)}
                  className="mt-2 inline-block bg-emerald-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-emerald-700 cursor-pointer"
                >
                  Voir détails
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      <SectionDivider />

      {/* Services Section */}
      <motion.section id="services" className="py-20" {...fadeIn}>
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold font-serif text-gray-900 mb-4">Nos Services</h2>
          <div className="w-20 h-1.5 bg-amber-500 mx-auto mb-16 rounded-full"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <ServiceCard icon={<FiShield className="text-emerald-700 text-3xl" />} title="Annonces vérifiées" desc="Toutes nos offres sont contrôlées." />
            <ServiceCard icon={<FiUploadCloud className="text-emerald-700 text-3xl" />} title="Publication simplifiée" desc="Publiez votre bien en quelques minutes." />
            <ServiceCard icon={<FiSearch className="text-emerald-700 text-3xl" />} title="Recherche rapide" desc="Trouvez un bien par référence." />
          </div>
        </div>
      </motion.section>

      <SectionDivider />

      {/* Biens disponibles */}
      <motion.section className="py-20" {...fadeIn}>
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-extrabold font-serif text-gray-900 mb-4 text-center">Biens disponibles</h2>
          <div className="w-20 h-1.5 bg-amber-500 mx-auto mb-16 rounded-full"></div>
          {loading && (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-700"></div>
            </div>
          )}
          {!loading && properties.length === 0 && (
            <p className="text-gray-500 italic text-center py-12 text-lg">Aucune propriété disponible pour le moment.</p>
          )}
          {!loading && properties.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {properties.map((property) => (
                <motion.div
                  key={property.id}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all border border-gray-100"
                >
                  {property.property_images?.[0] && (
                    <img src={property.property_images[0].image_url} alt={property.title} className="w-full h-60 object-cover" />
                  )}
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-bold text-xl text-gray-900">{property.title}</h3>
                      {property.featured && (
                        <span className="text-xs bg-amber-500 text-white px-2 py-0.5 rounded-full font-bold">En vedette</span>
                      )}
                    </div>
                    <p className="text-gray-500 text-sm">{property.city}, {property.region}</p>
                    <p className="text-gray-400 text-xs mt-1">Réf : {property.reference_number}</p>
                    <p className="text-emerald-700 font-bold mt-3 text-2xl">{property.total_price.toLocaleString()} FCFA</p>
                    <div className="flex items-center justify-between mt-4">
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-medium rounded-full">{property.offer_type}</span>
                      <button
                        onClick={() => setSelectedProperty(property)}
                        className="flex items-center gap-1 text-emerald-700 hover:text-emerald-900 text-sm font-medium cursor-pointer"
                      >
                        <FiEye className="text-base" /> Voir détails
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.section>

      <SectionDivider />

      {/* Publier une annonce */}
      <motion.section className="py-20" {...fadeIn}>
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-extrabold font-serif text-gray-900 mb-4 text-center">Publier une annonce</h2>
          <div className="w-20 h-1.5 bg-amber-500 mx-auto mb-16 rounded-full"></div>
          <CreateListing embedded />
        </div>
      </motion.section>

      <SectionDivider />

      {/* Pourquoi nous choisir */}
      <motion.section id="apropos" className="py-20 bg-gradient-to-r from-amber-500 to-yellow-500 text-white" {...fadeIn}>
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold font-serif mb-4">Pourquoi nous choisir ?</h2>
          <div className="w-20 h-1.5 bg-white mx-auto mb-16 rounded-full"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <WhyCard icon={<FiCheckCircle className="text-white text-3xl" />} title="Annonces vérifiées" desc="Nous validons chaque annonce." />
            <WhyCard icon={<FiZap className="text-white text-3xl" />} title="Mise en relation rapide" desc="Contact direct." />
            <WhyCard icon={<FiLock className="text-white text-3xl" />} title="Gratuit et sécurisé" desc="Publication gratuite." />
          </div>
        </div>
      </motion.section>

      <SectionDivider />

      {/* Comment ça marche */}
      <motion.section className="py-20" {...fadeIn}>
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-extrabold font-serif text-gray-900 mb-4 text-center">Comment ça marche ?</h2>
          <div className="w-20 h-1.5 bg-amber-500 mx-auto mb-16 rounded-full"></div>
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
            {[
              { step: '1', title: 'Créez votre annonce', desc: 'Remplissez le formulaire.' },
              { step: '2', title: 'Validation', desc: 'Nous vérifions.' },
              { step: '3', title: 'Visibilité immédiate', desc: 'Votre bien apparaît.' },
            ].map((item) => (
              <div key={item.step} className="flex flex-col items-center text-center">
                <div className="w-14 h-14 bg-amber-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-5 shadow-lg">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-600 max-w-xs">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      <SectionDivider />

      {/* Contact */}
      <motion.section id="contact" className="py-20" {...fadeIn}>
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-extrabold font-serif text-gray-900 mb-4 text-center">Contactez-nous</h2>
          <div className="w-20 h-1.5 bg-amber-500 mx-auto mb-16 rounded-full"></div>
          <p className="text-gray-600 text-center mb-10">Une question ? Besoin d'aide ? Écrivez-nous.</p>
          <form className="space-y-6 max-w-2xl mx-auto">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nom complet</label>
              <input type="text" className="mt-1 block w-full bg-white border-gray-300" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input type="email" className="mt-1 block w-full bg-white border-gray-300" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Message</label>
              <textarea rows={5} className="mt-1 block w-full bg-white border-gray-300"></textarea>
            </div>
            <div className="text-center">
              <button type="submit" className="bg-amber-500 hover:bg-amber-600 text-white px-10 py-3 rounded-full font-medium transition shadow-lg hover:shadow-xl cursor-pointer">
                Envoyer
              </button>
            </div>
          </form>
        </div>
      </motion.section>

      {/* Public Property Detail Modal */}
      <PublicPropertyModal property={selectedProperty} onClose={() => setSelectedProperty(null)} />
    </div>
  );
}

function ServiceCard({ icon, title, desc }) {
  return (
    <motion.div whileHover={{ y: -5 }} className="group bg-white border border-gray-100 rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all cursor-pointer">
      <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">{icon}</div>
      <h3 className="text-xl font-semibold mb-3 text-gray-900">{title}</h3>
      <p className="text-gray-600">{desc}</p>
    </motion.div>
  );
}

function WhyCard({ icon, title, desc }) {
  return (
    <motion.div whileHover={{ scale: 1.03 }} className="p-8 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 cursor-pointer">
      <div className="w-16 h-16 bg-white/30 rounded-full flex items-center justify-center mx-auto mb-6">{icon}</div>
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-white/90">{desc}</p>
    </motion.div>
  );
}