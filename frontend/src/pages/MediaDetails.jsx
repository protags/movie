import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { tmdb } from '../api/tmdb';
import { useStore } from '../store/useStore';
import Carousel from '../components/Carousel';
import MediaCard from '../components/MediaCard';
import { FiPlay, FiBookmark, FiPlus, FiCheck, FiStar, FiCalendar, FiClock } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function MediaDetails() {
  const { type, id } = useParams(); // type: movie or tv
  const navigate = useNavigate();
  const { addToWatchlist, removeFromWatchlist, inWatchlist } = useStore();

  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [watchlistAdded, setWatchlistAdded] = useState(false);

  // TV specific states
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [seasonEpisodes, setSeasonEpisodes] = useState([]);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      try {
        let data;
        if (type === 'movie') {
          data = await tmdb.getMovieDetails(id);
        } else if (type === 'tv') {
          data = await tmdb.getTVDetails(id);
          setSelectedSeason(1);
        }
        if (!data) throw new Error('Content not found');
        setDetails(data);
      } catch (err) {
        console.error('Error fetching details:', err);
        toast.error('Failed to load details.');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [type, id]);

  // Fetch episodes when TV season changes
  useEffect(() => {
    if (type === 'tv' && details && selectedSeason) {
      const fetchEpisodes = async () => {
        setLoadingEpisodes(true);
        try {
          const seasonData = await tmdb.getTVSeason(details.id, selectedSeason);
          setSeasonEpisodes(seasonData.episodes || []);
        } catch (err) {
          console.error('Error fetching season episodes:', err);
        } finally {
          setLoadingEpisodes(false);
        }
      };
      fetchEpisodes();
    }
  }, [type, details, selectedSeason]);

  useEffect(() => {
    if (details) {
      setWatchlistAdded(inWatchlist(details.id, type));
    }
  }, [details, type, inWatchlist]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-dark">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const title = details.title || details.name;
  const bannerImage = details.backdrop_path ? `https://image.tmdb.org/t/p/original${details.backdrop_path}` : '';
  const posterImage = details.poster_path ? `https://image.tmdb.org/t/p/w500${details.poster_path}` : '';
  const overview = details.overview;
  const rating = details.vote_average ? details.vote_average.toFixed(1) : null;
  const releaseDate = (details.release_date || details.first_air_date || '').substring(0, 4);
  const runtime = details.runtime ? `${details.runtime}m` : null;
  const genres = details.genres?.map(g => g.name) || [];

  const handleWatchlistToggle = () => {
    const itemData = {
      id: details.id,
      title: title,
      poster_path: details.poster_path,
      release_date: details.release_date,
      first_air_date: details.first_air_date,
      vote_average: details.vote_average,
      type: type
    };

    if (watchlistAdded) {
      removeFromWatchlist(details.id, type);
      toast.success('Removed from watchlist');
      setWatchlistAdded(false);
    } else {
      addToWatchlist(itemData);
      toast.success('Added to watchlist');
      setWatchlistAdded(true);
    }
  };

  return (
    <div className="pb-16 bg-background-dark text-white min-h-screen">
      {/* Banner Backdrop */}
      {bannerImage && (
        <div className="relative w-full h-[40vh] md:h-[55vh] overflow-hidden">
          <img
            src={bannerImage}
            alt={title}
            className="w-full h-full object-cover object-center scale-105"
          />
          <div className="absolute inset-0 bg-linear-to-t from-background-dark via-background-dark/70 to-transparent" />
        </div>
      )}

      {/* Main Details Wrapper */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 relative -mt-32 md:-mt-48 z-10">
        <div className="flex flex-col md:flex-row gap-8 items-start">

          {/* Poster image card */}
          <div className="w-48 md:w-64 shrink-0 mx-auto md:mx-0 rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-surface-dark aspect-2/3">
            <img src={posterImage} alt={title} className="w-full h-full object-cover" />
          </div>

          {/* Text details */}
          <div className="flex-1 space-y-6 text-center md:text-left">
            <h1 className="text-3xl md:text-5xl font-black tracking-wide leading-tight">
              {title}
            </h1>

            {/* Quick Metadata Info */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-gray-300">
              {rating && (
                <div className="flex items-center gap-1 text-amber-400 font-bold bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full">
                  <FiStar className="w-4 h-4 fill-amber-400" />
                  <span>{rating} / 10</span>
                </div>
              )}
              {releaseDate && (
                <div className="flex items-center gap-1 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full">
                  <FiCalendar className="w-4 h-4 text-purple-400" />
                  <span>{releaseDate}</span>
                </div>
              )}
              {runtime && (
                <div className="flex items-center gap-1 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full">
                  <FiClock className="w-4 h-4 text-cyan-400" />
                  <span>{runtime}</span>
                </div>
              )}
              <span className="px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase text-xs font-bold tracking-wider">
                {type === 'tv' ? 'TV Show' : type}
              </span>
            </div>

            {/* Genres List */}
            <div className="flex flex-wrap justify-center md:justify-start gap-2">
              {genres.map((genre) => (
                <span
                  key={genre}
                  className="px-3 py-1 bg-surface-dark border border-border-dark text-xs font-semibold rounded-lg text-gray-300 hover:text-white transition-colors"
                >
                  {genre}
                </span>
              ))}
            </div>

            {/* Overview / Storyline */}
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white tracking-wide border-l-4 border-purple-500 pl-3">
                Storyline
              </h3>
              <p className="text-gray-400 text-sm md:text-base leading-relaxed text-justify max-w-4xl">
                {overview || 'No description available.'}
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-4 justify-center md:justify-start pt-2">
              {type === 'movie' ? (
                <Link
                  to={`/watch/movie/${details.id}`}
                  className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition-all shadow-lg shadow-purple-500/30 text-base"
                >
                  <FiPlay className="w-5 h-5 fill-white" /> Watch Movie
                </Link>
              ) : (
                <a
                  href="#episodes"
                  className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition-all shadow-lg shadow-purple-500/30 text-base"
                >
                  <FiPlay className="w-5 h-5 fill-white" /> Select Episode
                </a>
              )}

              <button
                onClick={handleWatchlistToggle}
                className={`flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold transition-all backdrop-blur-md border text-base ${watchlistAdded
                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                  : 'bg-white/10 hover:bg-white/20 text-white border-white/10'
                  }`}
              >
                {watchlistAdded ? (
                  <>
                    <FiCheck className="w-5 h-5" /> In Watchlist
                  </>
                ) : (
                  <>
                    <FiBookmark className="w-5 h-5" /> Add to Watchlist
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Series Episode Selector (TV Show / Anime) */}
        {type === 'tv' && details.seasons?.length > 0 && (
          <div id="episodes" className="mt-16 bg-surface-dark/40 border border-white/5 rounded-3xl p-6 md:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-xl md:text-2xl font-extrabold text-white tracking-wide border-l-4 border-purple-500 pl-3">
                  Episodes
                </h3>
                <p className="text-xs text-gray-400 mt-1 pl-4">Select a season and an episode to play</p>
              </div>
              <select
                value={selectedSeason}
                onChange={(e) => setSelectedSeason(Number(e.target.value))}
                className="bg-black/55 border border-border-dark text-white rounded-xl px-4 py-2.5 outline-none focus:border-purple-400 font-semibold cursor-pointer"
              >
                {details.seasons
                  .filter((s) => s.season_number > 0) // filter out specials/season 0
                  .map((season) => (
                    <option key={season.id} value={season.season_number}>
                      Season {season.season_number} ({season.episode_count} Episodes)
                    </option>
                  ))}
              </select>
            </div>

            {loadingEpisodes ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-2 no-scrollbar">
                {seasonEpisodes.map((episode) => (
                  <Link
                    key={episode.id}
                    to={`/watch/tv/${details.id}/${selectedSeason}/${episode.episode_number}`}
                    className="flex gap-4 p-3.5 rounded-2xl bg-black/30 border border-white/5 hover:border-purple-500/40 hover:bg-black/50 transition-all duration-300 group"
                  >
                    {episode.still_path ? (
                      <div className="w-28 md:w-36 aspect-video shrink-0 rounded-lg overflow-hidden border border-white/5 relative">
                        <img
                          src={`https://image.tmdb.org/t/p/w185${episode.still_path}`}
                          alt={episode.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/30 group-hover:bg-purple-500/20 transition-colors flex items-center justify-center">
                          <FiPlay className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    ) : (
                      <div className="w-28 md:w-36 aspect-video shrink-0 rounded-lg bg-surface-dark border border-white/5 flex items-center justify-center">
                        <FiPlay className="w-6 h-6 text-gray-500" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <span className="text-[10px] font-extrabold text-purple-400 tracking-wider">
                        EPISODE {episode.episode_number}
                      </span>
                      <h4 className="text-sm font-bold text-white line-clamp-1 group-hover:text-purple-300 transition-colors">
                        {episode.name}
                      </h4>
                      <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                        {episode.overview || 'No description available for this episode.'}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Cast & Crew Grid */}
        <div className="mt-16">
          <h3 className="text-xl md:text-2xl font-extrabold text-white tracking-wide border-l-4 border-purple-500 pl-3 mb-6">
            Casting Crew
          </h3>

          <Carousel>
            {details.credits?.cast?.slice(0, 15).map((cast) => (
              <div key={cast.id} className="w-[120px] shrink-0 text-center space-y-2">
                <div className="w-20 h-20 mx-auto rounded-full overflow-hidden border border-white/10 shadow-md">
                  <img
                    src={cast.profile_path ? `https://image.tmdb.org/t/p/w185${cast.profile_path}` : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=185&auto=format&fit=crop'}
                    alt={cast.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-white truncate">{cast.name}</h4>
                  <p className="text-[10px] text-gray-500 truncate">{cast.character}</p>
                </div>
              </div>
            ))}
          </Carousel>
        </div>

        {/* Recommendations Section */}
        <div className="mt-16">
          <h3 className="text-xl md:text-2xl font-extrabold text-white tracking-wide border-l-4 border-purple-500 pl-3 mb-6">
            Recommended Titles
          </h3>

          <Carousel>
            {details.recommendations?.results?.slice(0, 12).map((item) => (
              <div key={item.id} className="w-[150px] md:w-[180px] shrink-0">
                <MediaCard item={item} type={type} />
              </div>
            ))}
          </Carousel>
        </div>

      </div>
    </div>
  );
}
