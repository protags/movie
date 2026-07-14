import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { tmdb } from '../api/tmdb';
import MediaCard from '../components/MediaCard';
import { FiGrid, FiFilm, FiSmile, FiTv } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function Discover() {
  const { type } = useParams(); // movies, tv, anime
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState('');
  const [loading, setLoading] = useState(true);

  // Normalize route variables
  const mediaType = type === 'movies' ? 'movie' : type === 'tv' ? 'tv' : 'anime';

  useEffect(() => {
    // Reset states when changing type
    setItems([]);
    setGenres([]);
    setSelectedGenre('');
    
    const fetchGenresAndPopular = async () => {
      setLoading(true);
      try {
        if (mediaType === 'anime') {
          // Fetch popular anime from TMDB discover
          const popularList = await tmdb.getPopularAnime();
          setItems(popularList || []);
        } else if (mediaType === 'movie') {
          const [genreList, popularList] = await Promise.all([
            tmdb.getMovieGenres(),
            tmdb.getPopularMovies()
          ]);
          setGenres(genreList || []);
          setItems(popularList || []);
        } else if (mediaType === 'tv') {
          const [genreList, popularList] = await Promise.all([
            tmdb.getTVGenres(),
            tmdb.getPopularTV()
          ]);
          setGenres(genreList || []);
          setItems(popularList || []);
        }
      } catch (err) {
        console.error('Error in Discovery fetch:', err);
        toast.error('Failed to load discovery page.');
      } finally {
        setLoading(false);
      }
    };

    fetchGenresAndPopular();
  }, [type]);

  // Handle genre filter for movies & tv shows
  useEffect(() => {
    if (mediaType === 'anime' || !selectedGenre) return;

    const fetchFiltered = async () => {
      setLoading(true);
      try {
        let data = [];
        if (mediaType === 'movie') {
          data = await tmdb.discoverMovies(selectedGenre);
        } else if (mediaType === 'tv') {
          data = await tmdb.discoverTV(selectedGenre);
        }
        setItems(data || []);
      } catch (err) {
        console.error('Error fetching filtered list:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFiltered();
  }, [selectedGenre, mediaType]);

  if (loading && items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-dark">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const getPageTitle = () => {
    if (mediaType === 'movie') return 'Discover Movies';
    if (mediaType === 'tv') return 'Discover TV Series';
    return 'Popular Japanese Anime';
  };

  const getPageIcon = () => {
    if (mediaType === 'movie') return <FiFilm className="w-6 h-6 text-purple-400" />;
    if (mediaType === 'tv') return <FiTv className="w-6 h-6 text-purple-400" />;
    return <FiSmile className="w-6 h-6 text-purple-400" />;
  };

  return (
    <div className="min-h-screen bg-background-dark text-white py-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Title Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20">
              {getPageIcon()}
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black tracking-wide">{getPageTitle()}</h1>
              <p className="text-xs text-gray-400 mt-0.5">Explore popular and top category titles</p>
            </div>
          </div>

          {/* Genre selector for Movie/TV */}
          {mediaType !== 'anime' && genres.length > 0 && (
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="bg-surface-dark border border-border-dark text-white rounded-xl px-4 py-2.5 outline-none focus:border-purple-400 font-semibold cursor-pointer text-sm"
            >
              <option value="">All Genres / Popular</option>
              {genres.map((genre) => (
                <option key={genre.id} value={genre.id}>
                  {genre.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Display Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-3 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {items.map((item) => (
              <MediaCard 
                key={`${mediaType}-${item.id}`} 
                item={item} 
                type={mediaType === 'anime' ? 'tv' : mediaType} 
              />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
