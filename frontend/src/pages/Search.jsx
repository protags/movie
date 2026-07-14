import React, { useEffect, useState } from 'react';
import { tmdb } from '../api/tmdb';
import MediaCard from '../components/MediaCard';
import { FiSearch, FiFilm, FiTv, FiSmile, FiSliders } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function Search() {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // all, movie, tv, anime
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (searchQuery) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      let tmdbResults = [];

      // Fetch TMDB search
      const response = await tmdb.searchMulti(searchQuery);
      tmdbResults = response.results || [];

      // Filter and route
      let merged = [];
      if (activeTab === 'all') {
        merged = tmdbResults.filter(
          (x) => x.media_type === 'movie' || x.media_type === 'tv'
        );
      } else if (activeTab === 'movie') {
        merged = tmdbResults.filter((x) => x.media_type === 'movie');
      } else if (activeTab === 'tv') {
        merged = tmdbResults.filter(
          (x) => x.media_type === 'tv' && 
                 !(x.origin_country?.includes('JP') && x.genre_ids?.includes(16))
        );
      } else if (activeTab === 'anime') {
        // In TMDB, Anime are TV shows or movies with original_language = ja and Animation genre (16)
        merged = tmdbResults.filter(
          (x) => (x.original_language === 'ja' || x.origin_country?.includes('JP')) && 
                 (x.genre_ids?.includes(16) || x.genres?.some(g => g.id === 16))
        );
      }

      setResults(merged);
    } catch (err) {
      console.error('Error during search:', err);
      toast.error('Search query failed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      handleSearch(query);
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [query, activeTab]);

  return (
    <div className="min-h-screen bg-background-dark text-white py-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Search input container */}
        <div className="max-w-2xl mx-auto relative">
          <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 w-6 h-6" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search movies, TV series, or anime..."
            className="w-full pl-14 pr-6 py-4 bg-surface-dark border border-border-dark rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400/50 transition-all text-base md:text-lg shadow-xl"
            autoFocus
          />
        </div>

        {/* Filter categories */}
        <div className="flex flex-wrap justify-center gap-2 md:gap-3">
          {[
            { id: 'all', name: 'All Media', icon: <FiSliders className="w-4 h-4" /> },
            { id: 'movie', name: 'Movies', icon: <FiFilm className="w-4 h-4" /> },
            { id: 'tv', name: 'TV Shows', icon: <FiTv className="w-4 h-4" /> },
            { id: 'anime', name: 'Anime', icon: <FiSmile className="w-4 h-4" /> },
          ].map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-bold border transition-all ${
                  isSelected
                    ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-500/20'
                    : 'bg-surface-dark border-border-dark text-gray-400 hover:text-white hover:border-zinc-700'
                }`}
              >
                {tab.icon}
                {tab.name}
              </button>
            );
          })}
        </div>

        {/* Search status & loader */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-10 h-10 border-3 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {results.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                {results.map((item) => (
                  <MediaCard 
                    key={`${item.media_type || activeTab}-${item.id}`} 
                    item={item} 
                    type={item.media_type || (activeTab === 'anime' ? 'tv' : activeTab)} 
                  />
                ))}
              </div>
            ) : (
              query.trim() && (
                <div className="text-center py-16 text-gray-500">
                  <p className="text-lg font-semibold">No titles match your search</p>
                  <p className="text-sm mt-1">Check spelling or select a different category filter</p>
                </div>
              )
            )}
          </>
        )}

      </div>
    </div>
  );
}
