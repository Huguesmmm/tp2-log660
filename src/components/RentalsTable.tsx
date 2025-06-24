'use client';           /* ← si tu veux un composant côté client, sinon retire   */
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Rental {
  LOCATION_ID:          number;
  COPIE_ID:             string;
  TITRE:                string;
  DATE_LOCATION:        Date;
  DATE_RETOUR_PREVUE?:  Date | null;
  DATE_RETOUR_REELLE?:  Date | null;
  PENALITE_COURANTE?:   number;
  STATUT?:              string;
}

export default function RentalsTable({ rentals }: { rentals: Rental[] }) {
  const [loadingReturns, setLoadingReturns] = useState<Set<number>>(new Set());
  const [messages, setMessages] = useState<Record<number, string>>({});
  const router = useRouter();

  const retournerFilm = async (locationId: number, copieId: string) => {
    setLoadingReturns(prev => new Set(prev).add(locationId));
    setMessages(prev => ({ ...prev, [locationId]: '' }));
    
    try {
      const response = await fetch('/api/return', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ copieId })
      });
      
      const data = await response.json();
      
      if (data.success) {
        const message = data.penalite > 0 
          ? `Film retourné! Pénalité: $${data.penalite}`
          : 'Film retourné avec succès!';
        setMessages(prev => ({ ...prev, [locationId]: message }));
        // Refresh automatique pour mettre à jour les données
        router.refresh();
      } else {
        setMessages(prev => ({ ...prev, [locationId]: `Erreur: ${data.error}` }));
      }
    } catch (error) {
      setMessages(prev => ({ ...prev, [locationId]: 'Erreur de connexion' }));
    }
    
    setLoadingReturns(prev => {
      const newSet = new Set(prev);
      newSet.delete(locationId);
      return newSet;
    });
  };

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case 'RETOURNEE': return 'text-green-600';
      case 'EN_RETARD': return 'text-red-600';
      case 'EN_COURS': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusText = (statut: string) => {
    switch (statut) {
      case 'RETOURNEE': return 'Retournée';
      case 'EN_RETARD': return 'En retard';
      case 'EN_COURS': return 'En cours';
      default: return 'Inconnu';
    }
  };

  if (rentals.length === 0)
    return <p className="text-gray-500">Aucune location enregistrée</p>;

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="min-w-full text-sm text-left">
        <thead className="bg-gray-100 font-semibold">
          <tr>
            <th className="px-4 py-2">Copie</th>
            <th className="px-4 py-2">Titre</th>
            <th className="px-4 py-2">Loué le</th>
            <th className="px-4 py-2">Retour prévu</th>
            <th className="px-4 py-2">Statut</th>
            <th className="px-4 py-2">Pénalité</th>
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rentals.map(r => (
            <tr key={r.LOCATION_ID} className="border-t">
              <td className="px-4 py-2 whitespace-nowrap">{r.COPIE_ID}</td>
              <td className="px-4 py-2">{r.TITRE}</td>
              <td className="px-4 py-2">
                {new Date(r.DATE_LOCATION).toLocaleDateString()}
              </td>
              <td className="px-4 py-2">
                {r.DATE_RETOUR_PREVUE
                  ? new Date(r.DATE_RETOUR_PREVUE).toLocaleDateString()
                  : '—'}
              </td>
              <td className="px-4 py-2">
                <span className={`font-medium ${getStatusColor(r.STATUT || '')}`}>
                  {getStatusText(r.STATUT || '')}
                </span>
              </td>
              <td className="px-4 py-2">
                {r.PENALITE_COURANTE && r.PENALITE_COURANTE > 0 ? (
                  <span className="text-red-600 font-medium">
                    ${r.PENALITE_COURANTE}
                  </span>
                ) : (
                  <span className="text-green-600">$0</span>
                )}
              </td>
              <td className="px-4 py-2">
                {!r.DATE_RETOUR_REELLE && (
                  <button
                    onClick={() => retournerFilm(r.LOCATION_ID, r.COPIE_ID)}
                    disabled={loadingReturns.has(r.LOCATION_ID)}
                    className="bg-green-500 text-white py-1 px-3 rounded text-xs hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loadingReturns.has(r.LOCATION_ID) ? 'Retour...' : 'Retourner'}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {/* Messages de retour */}
      {Object.entries(messages).map(([locationId, message]) => message && (
        <div key={locationId} className={`mt-2 text-sm p-2 rounded ${
          message.includes('succès') || message.includes('retourné') 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {message}
        </div>
      ))}
    </div>
  );
}
