'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Film {
  FILM_ID: number;
  TITRE: string;
  ANNEE_SORTIE: number;
  DUREE_MINUTES: number;
  AFFICHE_URL?: string;
  COPIES_DISPONIBLES: number;
}

export function FilmCard({ film }: { film: Film }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  const louerFilm = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      const response = await fetch('/api/rent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filmId: film.FILM_ID })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setMessage(`Film loué avec succès! Copie: ${data.location.copieId}`);
        // Refresh automatique pour mettre à jour les disponibilités
        router.refresh();
      } else {
        setMessage(`Erreur: ${data.error}`);
      }
    } catch (error) {
      setMessage('Erreur de connexion');
    }
    
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="h-64 bg-gray-200 flex items-center justify-center">
        {film.AFFICHE_URL ? (
          <img 
            src={film.AFFICHE_URL} 
            alt={film.TITRE}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-gray-500">Pas d'affiche</span>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2">{film.TITRE}</h3>
        <p className="text-gray-600 text-sm mb-2">
          {film.ANNEE_SORTIE} • {film.DUREE_MINUTES} min
        </p>
        
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-green-600 font-medium">
            {film.COPIES_DISPONIBLES} copie(s) disponible(s)
          </span>
        </div>
        
        <button
          onClick={louerFilm}
          disabled={loading || film.COPIES_DISPONIBLES === 0}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Location...' : 'Louer ce film'}
        </button>
        
        {message && (
          <div className={`mt-2 text-sm p-2 rounded ${
            message.includes('succès') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
