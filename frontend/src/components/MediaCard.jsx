import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiPlay, FiStar } from 'react-icons/fi';

export default function MediaCard({ item, type }) {
  const id = item.id;
  const cardType = type || item.media_type || 'movie';

  const title = item.title || item.name;

  const poster = item.poster_path
    ? `https://image.tmdb.org/t/p/w342${item.poster_path}`
    : 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=342&auto=format&fit=crop';

  const year = (item.release_date || item.first_air_date || '').substring(0, 4);
  const rating = item.vote_average ? item.vote_average.toFixed(1) : 'N/A';

  return (
    <Link to={`/details/${cardType}/${id}`}>
      <motion.div
        whileHover={{ scale: 1.05 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="relative aspect-2/3 w-full rounded-2xl overflow-hidden bg-surface-dark border border-white/5 cursor-pointer shadow-lg group hover:border-purple-500/40 hover:shadow-purple-500/10"
      >
        {/* Poster Image */}
        <img
          src={poster}
          alt={title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-black via-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">

          {/* Play Button Icon */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-purple-500/90 text-white flex items-center justify-center shadow-lg transform scale-75 group-hover:scale-100 transition-transform duration-300 hover:bg-purple-400">
            <FiPlay className="w-6 h-6 fill-white ml-0.5" />
          </div>

          {/* Details */}
          <div className="space-y-1 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
            <span className="inline-block px-2 py-0.5 text-[10px] font-extrabold uppercase bg-purple-500/20 text-purple-300 rounded border border-purple-500/30 tracking-wider">
              {cardType === 'tv' ? 'TV Show' : cardType}
            </span>

            <h4 className="text-sm font-bold text-white line-clamp-2 leading-tight">
              {title}
            </h4>

            <div className="flex items-center justify-between text-xs text-gray-400 pt-1">
              <span>{year}</span>
              {rating !== 'N/A' && (
                <div className="flex items-center gap-1 text-amber-400">
                  <FiStar className="w-3.5 h-3.5 fill-amber-400" />
                  <span className="font-semibold">{rating}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Static badges */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5 pointer-events-none">
          {rating !== 'N/A' && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-amber-400 text-xs font-bold shadow-md">
              <FiStar className="w-3 h-3 fill-amber-400" />
              <span>{rating}</span>
            </div>
          )}
        </div>
      </motion.div>
    </Link>
  );
}
