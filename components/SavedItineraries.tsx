import React, { useState, useMemo } from 'react';
import type { SavedItinerary } from '../types';
import { translations } from '../lib/i18n';
import EyeIcon from './icons/EyeIcon';
import TrashIcon from './icons/TrashIcon';
import SortAscendingIcon from './icons/SortAscendingIcon';
import SortDescendingIcon from './icons/SortDescendingIcon';

interface SavedItinerariesProps {
  itineraries: SavedItinerary[];
  onView: (itinerary: SavedItinerary) => void;
  onDelete: (id: number) => void;
  t: typeof translations.fr;
}

const ITEMS_PER_PAGE = 5;

export default function SavedItineraries({ itineraries, onView, onDelete, t }: SavedItinerariesProps): React.ReactElement {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredAndSortedItineraries = useMemo(() => {
    return itineraries
      .filter(it => it.request.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => {
        if (sortOrder === 'asc') {
          return a.request.name.localeCompare(b.request.name);
        }
        return b.request.name.localeCompare(a.request.name);
      });
  }, [itineraries, searchTerm, sortOrder]);

  const totalPages = Math.ceil(filteredAndSortedItineraries.length / ITEMS_PER_PAGE);
  const paginatedItineraries = filteredAndSortedItineraries.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  
  const handlePageChange = (newPage: number) => {
      if (newPage >= 1 && newPage <= totalPages) {
          setCurrentPage(newPage);
      }
  }

  const toggleSortOrder = () => {
    setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
  };

  return (
    <div className="p-6 sm:p-8 bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-blue-900 mb-4">{t.savedItinerariesTitle}</h2>
        <div className="flex items-center gap-2">
            <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchTerm}
                onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1); // Reset to first page on new search
                }}
                className="flex-grow px-3 py-1.5 bg-white/80 border border-sky-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm"
            />
            <button onClick={toggleSortOrder} title={t.sortByName} className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition">
                {sortOrder === 'asc' ? <SortAscendingIcon className="h-5 w-5" /> : <SortDescendingIcon className="h-5 w-5" />}
            </button>
        </div>
      </div>
      <div className="space-y-3 min-h-[295px]">
        {paginatedItineraries.length > 0 ? paginatedItineraries.map(it => {
          const stepsCount = it.request.parcours.length - 2;
          const stepsText = stepsCount > 0 ? ` (${stepsCount} ${stepsCount > 1 ? t.stepPlural : t.stepSingular})` : '';

          return (
            <div key={it.id} className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
              <button
                onClick={() => onView(it)}
                className="font-semibold text-blue-800 truncate text-left hover:underline focus:outline-none focus:ring-1 focus:ring-blue-300 rounded-sm p-1 -m-1"
                title={`${it.request.name}${stepsText}`}
              >
                {it.request.name}
                {stepsText && <span className="font-normal text-gray-600">{stepsText}</span>}
              </button>
              <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
                <button onClick={() => onView(it)} title={t.viewAndLoad} className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition"><EyeIcon className="h-5 w-5"/></button>
                <button onClick={() => onDelete(it.id)} title={t.delete} className="p-2 text-red-600 hover:bg-red-100 rounded-full transition"><TrashIcon className="h-5 w-5"/></button>
              </div>
            </div>
          );
        }) : (
            <p className="text-center text-gray-500 pt-10">{t.noItinerariesFound}</p>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-sky-200">
            <button 
                onClick={() => handlePageChange(currentPage - 1)} 
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm font-semibold bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition"
            >
                {t.previousPage}
            </button>
            <span className="text-sm text-gray-600">
                {t.page} {currentPage} {t.of} {totalPages}
            </span>
            <button 
                onClick={() => handlePageChange(currentPage + 1)} 
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-sm font-semibold bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition"
            >
                {t.nextPage}
            </button>
        </div>
      )}
    </div>
  );
}
