import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { tmdb } from '../api/tmdb';
import Carousel from '../components/Carousel';
import MediaCard from '../components/MediaCard';
import { FiPlay, FiInfo, FiTrendingUp } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const [heroSlides, setHeroSlides] = useState([]);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [trendingTV, setTrendingTV] = useState([]);
  const [trendingAnime, setTrendingAnime] = useState([]);
  const [upcomingMovies, setUpcomingMovies] = useState([]);
  const [topRatedTV, setTopRatedTV] = useState([]);
  const [actionMovies, setActionMovies] = useState([]);
  const [comedyMovies, setComedyMovies] = useState([]);
  const [sciFiMovies, setSciFiMovies] = useState([]);
  const [horrorMovies, setHorrorMovies] = useState([]);
  const [romanceMovies, setRomanceMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [
          movies,
          tvShows,
          anime,
          upcoming,
          topTV,
          action,
          comedy,
          sciFi,
          horror,
          romance
        ] = await Promise.all([
          tmdb.getTrendingMovies(),
          tmdb.getTrendingTV(),
          tmdb.getTrendingAnime(),
          tmdb.getUpcomingMovies(),
          tmdb.getTopRatedTV(),
          tmdb.getActionMovies(),
          tmdb.getComedyMovies(),
          tmdb.getSciFiMovies(),
          tmdb.getHorrorMovies(),
          tmdb.getRomanceMovies()
        ]);

        setTrendingMovies(movies || []);
        setTrendingTV(tvShows || []);
        setTrendingAnime(anime || []);
        setUpcomingMovies(upcoming || []);
        setTopRatedTV(topTV || []);
        setActionMovies(action || []);
        setComedyMovies(comedy || []);
        setSciFiMovies(sciFi || []);
        setHorrorMovies(horror || []);
        setRomanceMovies(romance || []);

        // Fetch detailed info for top 6 movies to power the slideshow billboard
        if (movies && movies.length > 0) {
          const top6List = movies.slice(0, 6);
          const top6Details = await Promise.all(
            top6List.map(async (m) => {
              try {
                const details = await tmdb.getMovieDetails(m.id);
                return { ...details, media_type: 'movie' };
              } catch (e) {
                return { ...m, media_type: 'movie' };
              }
            })
          );
          setHeroSlides(top6Details);
        }
      } catch (err) {
        console.error('Error loading Netflix home feed:', err);
        toast.error('Failed to load home categories.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Slideshow auto-rotation effect (every 6 seconds)
  useEffect(() => {
    if (heroSlides.length === 0) return;
    const interval = setInterval(() => {
      setActiveSlideIndex((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [heroSlides]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#141414]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 font-semibold text-sm">Loading CINETAG universe...</p>
        </div>
      </div>
    );
  }

  const currentHero = heroSlides[activeSlideIndex];

  return (
    <div className="pb-16 bg-[#141414] text-white overflow-x-hidden min-h-screen">
      
      {/* Netflix Billboard / Hero Section Slideshow */}
      {currentHero && (
        <div className="relative w-full h-[65vh] md:h-[85vh] bg-[#141414] overflow-hidden flex items-end">
          {/* Backdrop Banner with smooth cross-fade */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentHero.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="absolute inset-0 z-0"
            >
              <img
                src={`https://image.tmdb.org/t/p/original${currentHero.backdrop_path}`}
                alt={currentHero.title || currentHero.name}
                className="w-full h-full object-cover object-top scale-100"
              />
              {/* Ambient vignette layers to boost text readability */}
              <div className="absolute inset-0 bg-linear-to-t from-[#141414] via-[#141414]/40 to-transparent" />
              <div className="absolute inset-0 bg-linear-to-r from-[#141414] via-[#141414]/30 to-transparent" />
              <div className="absolute inset-0 bg-black/10" />
            </motion.div>
          </AnimatePresence>

          {/* Billboard Info Overlay */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentHero.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.6 }}
              className="relative z-10 max-w-7xl mx-auto w-full px-4 md:px-8 pb-16 md:pb-24 space-y-4 md:space-y-6"
            >
              {/* Trending Badge */}
              <div className="flex items-center gap-2 bg-red-600/90 text-white font-extrabold uppercase text-[10px] md:text-xs tracking-wider px-3 py-1 rounded-sm w-fit border border-red-500/30 shadow-md">
                <FiTrendingUp className="w-3.5 h-3.5" />
                <span>No. {activeSlideIndex + 1} in Movies Today</span>
              </div>

              {/* Billboard Title */}
              <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-tight max-w-3xl drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] uppercase">
                {currentHero.title || currentHero.name}
              </h1>

              {/* Tagline / Genres */}
              {currentHero.tagline && (
                <p className="text-xs md:text-sm font-semibold text-purple-400 italic drop-shadow-md">
                  "{currentHero.tagline}"
                </p>
              )}

              {/* Billboard Overview */}
              <p className="text-sm md:text-base text-gray-200 max-w-2xl line-clamp-3 leading-relaxed drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                {currentHero.overview}
              </p>

              {/* Play & Info Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <Link
                  to={`/watch/movie/${currentHero.id}`}
                  className="flex items-center gap-2 px-6 py-3 rounded-md bg-white hover:bg-white/85 text-black font-extrabold transition-all shadow-lg text-sm md:text-base"
                >
                  <FiPlay className="w-5 h-5 fill-black text-black" /> Play
                </Link>

                <Link
                  to={`/details/movie/${currentHero.id}`}
                  className="flex items-center gap-2 px-6 py-3 rounded-md bg-[#515151]/75 hover:bg-[#515151]/55 text-white font-extrabold transition-all backdrop-blur-sm border border-white/10 text-sm md:text-base"
                >
                  <FiInfo className="w-5 h-5" /> More Info
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Interactive Slideshow Indicators */}
          <div className="absolute right-4 md:right-8 bottom-16 md:bottom-24 flex gap-2.5 z-30">
            {heroSlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveSlideIndex(idx)}
                className={`w-2 h-2 md:w-2.5 md:h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                  idx === activeSlideIndex
                    ? 'bg-red-600 w-6 md:w-8'
                    : 'bg-white/40 hover:bg-white/70'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Grid of Netflix scrolling rows */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-12 mt-6 relative z-20">

        {/* Netflix Top 10 Movies Today Row */}
        {trendingMovies.length > 0 && (
          <div className="relative py-2">
            <h2 className="text-lg md:text-2xl font-extrabold text-white mb-4 tracking-wide">
              Top 10 Movies Today
            </h2>
            <Carousel>
              {trendingMovies.slice(0, 10).map((item, index) => (
                <div key={item.id} className="relative flex items-end shrink-0 w-[210px] md:w-[270px] mr-6 select-none group">
                  {/* Big rank number behind poster */}
                  <div
                    className="absolute left-[-15px] bottom-[-20px] md:bottom-[-30px] text-[130px] md:text-[190px] font-black select-none leading-none z-10 pointer-events-none transition-colors duration-300"
                    style={{
                      color: 'transparent',
                      WebkitTextStroke: '3px rgba(120, 120, 120, 0.7)',
                      fontFamily: 'Impact, sans-serif'
                    }}
                  >
                    {index + 1}
                  </div>
                  {/* Poster wrapper overlapping the number */}
                  <div className="ml-[65px] md:ml-[95px] w-[130px] md:w-[160px] z-20 transition-transform duration-300 group-hover:scale-105">
                    <MediaCard item={item} type="movie" />
                  </div>
                </div>
              ))}
            </Carousel>
          </div>
        )}

        {/* Trending TV Shows */}
        {trendingTV.length > 0 && (
          <Carousel title="Popular TV Series">
            {trendingTV.map((item) => (
              <div key={item.id} className="w-[150px] md:w-[195px] shrink-0">
                <MediaCard item={item} type="tv" />
              </div>
            ))}
          </Carousel>
        )}

        {/* Action Movies */}
        {actionMovies.length > 0 && (
          <Carousel title="Action Thrillers">
            {actionMovies.map((item) => (
              <div key={item.id} className="w-[150px] md:w-[195px] shrink-0">
                <MediaCard item={item} type="movie" />
              </div>
            ))}
          </Carousel>
        )}

        {/* Japanese Anime */}
        {trendingAnime.length > 0 && (
          <Carousel title="Trending Anime Series">
            {trendingAnime.map((item) => (
              <div key={item.id} className="w-[150px] md:w-[195px] shrink-0">
                <MediaCard item={item} type="tv" />
              </div>
            ))}
          </Carousel>
        )}

        {/* Sci-Fi & Fantasy */}
        {sciFiMovies.length > 0 && (
          <Carousel title="Sci-Fi & Fantasy Movies">
            {sciFiMovies.map((item) => (
              <div key={item.id} className="w-[150px] md:w-[195px] shrink-0">
                <MediaCard item={item} type="movie" />
              </div>
            ))}
          </Carousel>
        )}

        {/* Top Rated TV Shows */}
        {topRatedTV.length > 0 && (
          <Carousel title="Critically Acclaimed TV Shows">
            {topRatedTV.map((item) => (
              <div key={item.id} className="w-[150px] md:w-[195px] shrink-0">
                <MediaCard item={item} type="tv" />
              </div>
            ))}
          </Carousel>
        )}

        {/* Comedy Hits */}
        {comedyMovies.length > 0 && (
          <Carousel title="Comedy Hits">
            {comedyMovies.map((item) => (
              <div key={item.id} className="w-[150px] md:w-[195px] shrink-0">
                <MediaCard item={item} type="movie" />
              </div>
            ))}
          </Carousel>
        )}

        {/* Horror Night */}
        {horrorMovies.length > 0 && (
          <Carousel title="Horror Night Thrillers">
            {horrorMovies.map((item) => (
              <div key={item.id} className="w-[150px] md:w-[195px] shrink-0">
                <MediaCard item={item} type="movie" />
              </div>
            ))}
          </Carousel>
        )}

        {/* Romance & Drama */}
        {romanceMovies.length > 0 && (
          <Carousel title="Romance & Drama">
            {romanceMovies.map((item) => (
              <div key={item.id} className="w-[150px] md:w-[195px] shrink-0">
                <MediaCard item={item} type="movie" />
              </div>
            ))}
          </Carousel>
        )}

        {/* Upcoming Movies */}
        {upcomingMovies.length > 0 && (
          <Carousel title="Upcoming Releases">
            {upcomingMovies.map((item) => (
              <div key={item.id} className="w-[150px] md:w-[195px] shrink-0">
                <MediaCard item={item} type="movie" />
              </div>
            ))}
          </Carousel>
        )}

      </div>
    </div>
  );
}
