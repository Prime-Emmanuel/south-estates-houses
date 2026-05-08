import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import FeaturedBanner from './FeaturedBanner';
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelope,
} from 'react-icons/fa';

const navLinks = [
  { id: 'accueil', label: 'Accueil' },
  { id: 'services', label: 'Services' },
  { id: 'apropos', label: 'À propos' },
  { id: 'contact', label: 'Contact' },
];

export default function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAdmin } = useAdminAuth();
  const sidebarRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setSidebarOpen(false);
      }
    };
    if (sidebarOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [sidebarOpen]);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

  const handleNavClick = (sectionId) => {
    if (location.pathname === '/') {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/', { state: { scrollTo: sectionId } });
    }
    setSidebarOpen(false);
  };

  const showBanner = location.pathname === '/';

  return (
    <div className="min-h-screen flex flex-col">
      {showBanner && <FeaturedBanner />}

      <header
        className={`fixed inset-x-0 z-40 flex justify-center px-4 pt-4 ${
          showBanner ? 'top-10' : 'top-0'
        }`}
      >
        <nav className="w-full max-w-6xl flex items-center justify-between px-6 py-3 bg-white/70 backdrop-blur-xl rounded-full border border-white/40 shadow-lg shadow-black/5">
          <Link to="/" className="flex items-center space-x-3">
            <img src="/logo.jpg" alt="Logo" className="h-10 w-10 rounded-full object-cover" />
            <span className="text-lg font-bold text-gray-900 hidden sm:inline">
              South Estates & Houses
            </span>
          </Link>

          <ul className="hidden md:flex items-center space-x-8 text-sm font-medium text-gray-700">
            {navLinks.map((link) => (
              <li key={link.id}>
                <button
                  onClick={() => handleNavClick(link.id)}
                  className="relative hover:text-emerald-600 transition-colors after:absolute after:left-0 after:bottom-0 after:h-0.5 after:w-0 after:bg-emerald-500 after:transition-all hover:after:w-full cursor-pointer"
                >
                  {link.label}
                </button>
              </li>
            ))}
          </ul>

          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden text-gray-700 focus:outline-none p-2 rounded-full hover:bg-gray-100 transition cursor-pointer"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </nav>
      </header>

      <div
        className={`fixed inset-0 z-50 transition-opacity duration-300 ${
          sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)}></div>
        <aside
          ref={sidebarRef}
          className={`absolute top-0 right-0 h-full w-72 bg-white shadow-2xl transform transition-transform duration-300 ${
            sidebarOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex justify-end p-4">
            <button onClick={() => setSidebarOpen(false)} className="text-gray-600 hover:text-gray-900 text-3xl leading-none cursor-pointer">
              &times;
            </button>
          </div>
          <nav className="px-8 py-4">
            <ul className="space-y-6">
              {navLinks.map((link) => (
                <li key={link.id}>
                  <button
                    onClick={() => handleNavClick(link.id)}
                    className="block w-full text-left text-xl text-gray-800 hover:text-emerald-600 transition-colors font-medium cursor-pointer"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
      </div>

      <main className={`flex-1 ${showBanner ? 'pt-28 md:pt-32' : 'pt-24 md:pt-28'}`}>
        {children}
      </main>

      <footer className="bg-gray-900 text-gray-300 pt-16 pb-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <a
                href="/admin"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-3 mb-4 cursor-pointer hover:opacity-80 transition-opacity"
              >
                <img src="/logo.jpg" alt="Logo" className="h-10 w-10 rounded-full" />
                <span className="text-white font-bold text-lg">South Estates & Houses</span>
              </a>
              <p className="text-sm">
                Votre partenaire de confiance pour la vente et l'achat de biens immobiliers au Cameroun.
              </p>
            </div>

            <div>
              <h4 className="text-white text-sm font-semibold mb-4 uppercase tracking-wider">Liens rapides</h4>
              <ul className="space-y-2 text-sm">
                {navLinks.map((link) => (
                  <li key={link.id}>
                    <button
                      onClick={() => handleNavClick(link.id)}
                      className="hover:text-white transition-colors cursor-pointer"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-white text-sm font-semibold mb-4 uppercase tracking-wider">Contact</h4>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-2">
                  <FaMapMarkerAlt className="text-emerald-400" />
                  Douala, Cameroun
                </li>
                <li className="flex items-center gap-2">
                  <FaPhoneAlt className="text-emerald-400" />
                  +237 699 949 266
                </li>
                <li className="flex items-center gap-2">
                  <FaEnvelope className="text-emerald-400" />
                  Southestates@gmail.com
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white text-sm font-semibold mb-4 uppercase tracking-wider">Suivez-nous</h4>
              <div className="flex space-x-4 mb-6">
                <a href="#" className="text-gray-400 hover:text-white transition cursor-pointer"><FaFacebookF /></a>
                <a href="#" className="text-gray-400 hover:text-white transition cursor-pointer"><FaTwitter /></a>
                <a href="#" className="text-gray-400 hover:text-white transition cursor-pointer"><FaInstagram /></a>
                <a href="#" className="text-gray-400 hover:text-white transition cursor-pointer"><FaLinkedinIn /></a>
              </div>
              <p className="text-xs text-gray-500">
                &copy; {new Date().getFullYear()} South Estates & Houses. Tous droits réservés.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}