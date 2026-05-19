import { useState } from 'react';
import api from '../services/api';

export default function ScanModal({ isOpen, onClose, onCreateAll }) {
  const [files, setFiles] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [results, setResults] = useState([]);
  const [progress, setProgress] = useState(0);

  const handleFileSelect = (e) => {
    const selected = Array.from(e.target.files);
    setFiles(selected);
    setResults([]);
  };

  const startScan = async () => {
    if (files.length === 0) return;
    setScanning(true);
    setResults([]);
    try {
      const form = new FormData();
      files.forEach(f => form.append('images', f));
      const res = await api.post('/scan', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(percent);
        },
      });
      setResults(res.data.data || []);
    } catch (err) {
      console.error(err);
      alert('Erreur lors du scan');
    } finally {
      setScanning(false);
    }
  };

  const handleCreateAll = () => {
    onCreateAll(results);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto">
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-100 rounded-t-2xl flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900">Scanner et créer des annonces</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-800 cursor-pointer">&times;</button>
        </div>
        <div className="p-6">
          {results.length === 0 ? (
            <>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="mb-4"
              />
              {files.length > 0 && (
                <p className="text-sm text-gray-600 mb-4">{files.length} image(s) sélectionnée(s).</p>
              )}
              {scanning && (
                <div className="mb-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-emerald-600 h-2 rounded-full transition-all" style={{ width: `${progress}%` }}></div>
                  </div>
                </div>
              )}
              <button
                onClick={startScan}
                disabled={files.length === 0 || scanning}
                className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-emerald-700 disabled:opacity-50 cursor-pointer"
              >
                {scanning ? 'Analyse en cours...' : 'Lancer le scan'}
              </button>
            </>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">{results.length} annonce(s) prête(s) :</p>
              {results.map((item, idx) => (
                <div key={idx} className="border rounded-xl p-4">
                  <div className="flex flex-wrap items-center gap-4">
                    {item.imageName && (
                      <img src={URL.createObjectURL(files[idx])} alt="" className="w-16 h-16 object-cover rounded-lg" />
                    )}
                    <div className="flex-1">
                      <p className="font-semibold">{item.title}</p>
                      <p className="text-sm text-gray-500">{item.offerType} · {item.city} · {item.pricePerM2?.toLocaleString()} FCFA/m²</p>
                      <p className="text-xs text-gray-400">Surface: {item.surface} m² · Commission: {item.commission}%</p>
                    </div>
                  </div>
                </div>
              ))}
              <div className="flex justify-end gap-3">
                <button onClick={() => { setFiles([]); setResults([]); }} className="text-gray-600 hover:text-gray-800 cursor-pointer">Réinitialiser</button>
                <button
                  onClick={handleCreateAll}
                  className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 cursor-pointer"
                >
                  Créer toutes les annonces
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
