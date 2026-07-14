import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { tmdb } from '../api/tmdb';
import { useStore } from '../store/useStore';
import { FiArrowLeft, FiGrid, FiMaximize2, FiMinimize2, FiPlay, FiServer, FiStar, FiCalendar } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function Watch() {
  const { type, id, season, episode } = useParams(); // type: movie or tv
  const navigate = useNavigate();
  const { updateWatchHistory } = useStore();

  const seasonNum = parseInt(season) || 1;
  const episodeNum = parseInt(episode) || 1;

  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theaterMode, setTheaterMode] = useState(false);
  const [seasonEpisodes, setSeasonEpisodes] = useState([]);

  const [currentTitle, setCurrentTitle] = useState('');
  const [currentPoster, setCurrentPoster] = useState('');

  // Player server selection state (default to 'filmu')
  const [activeServer, setActiveServer] = useState('filmu');

  // Ref to track last updated timestamp to throttle history saving
  const lastUpdatedTimeRef = useRef(0);

  // Reset the throttle tracking when switching media items/episodes
  useEffect(() => {
    lastUpdatedTimeRef.current = 0;
  }, [id, seasonNum, episodeNum]);

  // Fetch media details
  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      try {
        let data;
        if (type === 'movie') {
          data = await tmdb.getMovieDetails(id);
          setCurrentTitle(data.title);
        } else {
          data = await tmdb.getTVDetails(id);
          setCurrentTitle(data.name);
        }
        if (!data) throw new Error('Content not found');
        setDetails(data);
        setCurrentPoster(data.poster_path ? `https://image.tmdb.org/t/p/w185${data.poster_path}` : '');
      } catch (err) {
        console.error('Error loading media details:', err);
        toast.error('Could not load stream details.');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [type, id]);

  // Fetch episodes list for Sidebar (TV Series only)
  useEffect(() => {
    if (type === 'tv' && details && seasonNum) {
      const fetchEpisodes = async () => {
        try {
          const seasonData = await tmdb.getTVSeason(details.id, seasonNum);
          setSeasonEpisodes(seasonData.episodes || []);
        } catch (err) {
          console.error('Error fetching season episodes:', err);
        }
      };
      fetchEpisodes();
    }
  }, [type, details, seasonNum]);

  // Listen to postMessage event payloads from FilmU and Vidking players to update watch progress
  useEffect(() => {
    if (!details || !currentTitle) return;

    const handlePlayerMessage = (event) => {
      // 1. Filmu SYNC_HISTORY payload
      if (event.data?.type === 'SYNC_HISTORY') {
        const { media_id, duration, watched, season: eventSeason, episode: eventEpisode } = event.data.data;
        const currentWatched = parseFloat(watched) || 0;

        // Throttle updates: only save if progress has advanced by 5s or starts at 0
        if (Math.abs(currentWatched - lastUpdatedTimeRef.current) >= 5 || currentWatched === 0) {
          lastUpdatedTimeRef.current = currentWatched;
          updateWatchHistory({
            id: parseInt(media_id) || parseInt(id),
            type: type,
            title: currentTitle,
            poster: currentPoster,
            watched: currentWatched,
            duration: parseFloat(duration) || 1,
            season: type === 'movie' ? null : (parseInt(eventSeason) || seasonNum),
            episode: type === 'movie' ? null : (parseInt(eventEpisode) || episodeNum),
          });
        }
      }

      // 2. Filmu PLAYER_EVENT payload
      if (event.data?.type === 'FILMU_PLAYER_EVENT') {
        const { event: playerEvent, currentTime, duration } = event.data.data;
        const currentWatched = parseFloat(currentTime) || 0;

        // Always save on play/pause/ended, throttle the continuous timeupdate
        if (playerEvent === 'play' || playerEvent === 'pause' || playerEvent === 'ended' ||
          (playerEvent === 'timeupdate' && Math.abs(currentWatched - lastUpdatedTimeRef.current) >= 5)) {

          lastUpdatedTimeRef.current = currentWatched;
          updateWatchHistory({
            id: parseInt(id),
            type: type,
            title: currentTitle,
            poster: currentPoster,
            watched: currentWatched,
            duration: parseFloat(duration) || 1,
            season: type === 'movie' ? null : seasonNum,
            episode: type === 'movie' ? null : episodeNum,
          });
        }
      }

      // 3. Vidking PLAYER_EVENT payload
      if (event.data?.type === 'PLAYER_EVENT') {
        const { event: playerEvent, currentTime, duration } = event.data.data;
        const currentWatched = parseFloat(currentTime) || 0;

        // Always save on play/pause/ended, throttle the continuous timeupdate
        if (playerEvent === 'play' || playerEvent === 'pause' || playerEvent === 'ended' ||
          (playerEvent === 'timeupdate' && Math.abs(currentWatched - lastUpdatedTimeRef.current) >= 5)) {

          lastUpdatedTimeRef.current = currentWatched;
          updateWatchHistory({
            id: parseInt(id),
            type: type,
            title: currentTitle,
            poster: currentPoster,
            watched: currentWatched,
            duration: parseFloat(duration) || 1,
            season: type === 'movie' ? null : seasonNum,
            episode: type === 'movie' ? null : episodeNum,
          });
        }
      }
    };

    window.addEventListener('message', handlePlayerMessage);
    return () => window.removeEventListener('message', handlePlayerMessage);
  }, [details, currentTitle, currentPoster, id, type, seasonNum, episodeNum]);

  // Handle auto-landscape lock on fullscreen entry
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFullscreen = document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement;

      if (isFullscreen) {
        if (screen.orientation && screen.orientation.lock) {
          screen.orientation.lock('landscape-primary')
            .catch(() => {
              screen.orientation.lock('landscape').catch((err) => {
                console.warn('Orientation lock failed:', err);
              });
            });
        }
      } else {
        if (screen.orientation && screen.orientation.unlock) {
          screen.orientation.unlock();
        }
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Build the embed player source URL dynamically based on activeServer selection
  const embedUrl = activeServer === 'vidking'
    ? (type === 'movie'
      ? `https://www.vidking.net/embed/movie/${id}`
      : `https://www.vidking.net/embed/tv/${id}/${seasonNum}/${episodeNum}`)
    : (type === 'movie'
      ? `https://embed.filmu.in/movie/${id}`
      : `https://embed.filmu.in/tv/${id}/${seasonNum}/${episodeNum}`);

  return (
    <div className="min-h-screen bg-black text-white pb-16 relative overflow-x-hidden">

      {/* Cinematic ambient background glow */}
      <div className="absolute top-[-10%] left-[20%] w-[60%] h-[30%] bg-purple-600/10 blur-[140px] rounded-full pointer-events-none z-0" />
      <div className="absolute top-[10%] left-[10%] w-[40%] h-[20%] bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none z-0" />

      {/* Top Header Controls */}
      <div className="relative z-10 px-4 py-4 md:px-8 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-900/60 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to={`/details/${type}/${id}`}
            className="p-2.5 rounded-xl bg-zinc-900/60 hover:bg-zinc-800 text-gray-300 hover:text-white transition-colors border border-white/5"
          >
            <FiArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="text-sm md:text-base font-extrabold text-white leading-tight">
              {currentTitle}
            </h2>
            {type !== 'movie' && (
              <p className="text-xs text-purple-400 font-semibold mt-0.5">
                Season {seasonNum} &bull; Episode {episodeNum}
              </p>
            )}
          </div>
        </div>

        <button
          onClick={() => setTheaterMode(!theaterMode)}
          className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-xs font-bold text-gray-300 transition-colors cursor-pointer"
        >
          {theaterMode ? (
            <>
              <FiMinimize2 className="w-4 h-4" /> Exit Theater Mode
            </>
          ) : (
            <>
              <FiMaximize2 className="w-4 h-4" /> Theater Mode
            </>
          )}
        </button>
      </div>

      {/* Main Cinema Grid Layout */}
      <div className={`relative z-10 mx-auto px-4 md:px-8 mt-6 ${theaterMode ? 'w-full max-w-none' : 'max-w-7xl'}`}>
        <div className={`grid grid-cols-1 ${theaterMode ? '' : 'lg:grid-cols-4'} gap-6`}>

          {/* Player Iframe container */}
          <div className={`${theaterMode ? 'lg:col-span-4' : 'lg:col-span-3'} space-y-5`}>
            <div className="relative w-full aspect-video rounded-3xl overflow-hidden bg-zinc-950 border border-zinc-800 shadow-2xl shadow-purple-500/5">
              <iframe
                src={embedUrl}
                title="Cinema Player Embed"
                width="100%"
                height="100%"
                frameBorder="0"
                allowFullScreen
                allow="autoplay; encrypted-media; picture-in-picture"
                className="w-full h-full absolute inset-0"
              />
            </div>

            {/* Server Selector Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-950/70 border border-zinc-900/60 p-4 rounded-2xl backdrop-blur-sm shadow-xl">
              <div className="flex items-center gap-2">
                <FiServer className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-extrabold tracking-wider text-gray-400 uppercase">Select Server:</span>
              </div>
              <div className="flex gap-2">
                {[
                  { id: 'filmu', name: 'Server 1', desc: 'Default server' },
                  { id: 'vidking', name: 'Server 2', desc: 'Alternative server' }
                ].map((server) => {
                  const isActive = activeServer === server.id;
                  return (
                    <button
                      key={server.id}
                      onClick={() => setActiveServer(server.id)}
                      className={`px-5 py-2 rounded-xl text-xs font-extrabold tracking-wide transition-all border cursor-pointer ${isActive
                        ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-500/25'
                        : 'bg-zinc-900/60 border-zinc-800 text-gray-400 hover:text-white hover:border-zinc-700'
                        }`}
                      title={server.desc}
                    >
                      {server.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Show title/details details below player */}
            {details && (
              <div className="p-6 bg-zinc-950/70 border border-zinc-900/80 rounded-3xl backdrop-blur-sm shadow-xl flex flex-col md:flex-row gap-6 items-start">

                {/* Cover Image on the Left */}
                {details.poster_path && (
                  <div className="w-32 md:w-40 shrink-0 aspect-2/3 rounded-2xl overflow-hidden border border-zinc-850 shadow-lg bg-zinc-900">
                    <img
                      src={`https://image.tmdb.org/t/p/w342${details.poster_path}`}
                      alt={currentTitle}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Details on the Right */}
                <div className="flex-1 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <h3 className="text-xl md:text-3xl font-black text-white leading-tight">{currentTitle}</h3>

                    {/* Rating / Date Metadata */}
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      {details.vote_average > 0 && (
                        <span className="flex items-center gap-1 text-amber-400 font-bold bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full">
                          <FiStar className="w-3.5 h-3.5 fill-amber-400" />
                          {details.vote_average.toFixed(1)}
                        </span>
                      )}
                      {(details.release_date || details.first_air_date) && (
                        <span className="flex items-center gap-1 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full">
                          <FiCalendar className="w-3.5 h-3.5 text-purple-400" />
                          {(details.release_date || details.first_air_date).substring(0, 4)}
                        </span>
                      )}
                      <span className="px-2.5 py-1 rounded-full bg-purple-500/15 border border-purple-500/20 text-purple-300 uppercase font-black text-[10px]">
                        {type}
                      </span>
                    </div>
                  </div>

                  {details.tagline && (
                    <p className="text-xs md:text-sm font-semibold text-purple-400 italic">
                      "{details.tagline}"
                    </p>
                  )}

                  <p className="text-sm text-gray-400 leading-relaxed text-justify">
                    {details.overview || 'No storyline description is available for this title.'}
                  </p>

                  {/* Genre Tags */}
                  <div className="flex flex-wrap gap-2 pt-3 border-t border-zinc-900/60">
                    {details.genres?.map(genre => (
                      <span key={genre.id} className="text-xs font-semibold px-3 py-1 bg-zinc-900/40 text-gray-300 border border-zinc-800 rounded-lg">
                        {genre.name}
                      </span>
                    ))}
                  </div>
                </div>

              </div>
            )}
          </div>

          {/* Sidebar selectors for Episodes (TV Series only) */}
          {type !== 'movie' && (
            <div className={`${theaterMode ? 'lg:col-span-4' : 'lg:col-span-1'} bg-zinc-950/80 border border-zinc-900/80 rounded-3xl p-5 h-[580px] flex flex-col backdrop-blur-sm shadow-xl`}>
              <div className="flex items-center gap-2 pb-4 mb-4 border-b border-zinc-900/80 shrink-0">
                <FiGrid className="w-4 h-4 text-purple-400" />
                <h3 className="font-extrabold text-xs tracking-wider text-white uppercase">Episode Index</h3>
              </div>

              {/* Scrolling lists of episodes */}
              <div className="flex-1 overflow-y-auto no-scrollbar space-y-2.5 pr-1">
                {seasonEpisodes.map((ep) => {
                  const isCurrent = ep.episode_number === episodeNum;
                  return (
                    <Link
                      key={ep.id}
                      to={`/watch/tv/${id}/${seasonNum}/${ep.episode_number}`}
                      className={`flex gap-3.5 p-3 rounded-2xl border text-left transition-all duration-300 ${isCurrent
                        ? 'bg-purple-600/15 border-purple-500/40 text-purple-300 font-extrabold shadow-md shadow-purple-500/5'
                        : 'bg-zinc-900/30 border-transparent hover:border-zinc-800 text-gray-400 hover:text-white'
                        }`}
                    >
                      <div className={`text-xs font-mono font-black self-center shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${isCurrent ? 'bg-purple-600 text-white' : 'bg-zinc-900 border border-zinc-800'
                        }`}>
                        {ep.episode_number}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-bold truncate">{ep.name}</h4>
                        <p className="text-[10px] text-gray-500 line-clamp-1 mt-0.5">{ep.overview || 'No synopsis'}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
