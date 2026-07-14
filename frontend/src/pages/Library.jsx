import React from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import MediaCard from '../components/MediaCard';
import { FiBookmark, FiTrash2, FiPlay, FiRefreshCw, FiFilm } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function Library() {
  const { watchlist, watchHistory, removeFromHistory, clearHistory } = useStore();

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear your entire watch history?')) {
      clearHistory();
      toast.success('Watch history cleared');
    }
  };

  return (
    <div className="min-h-screen bg-background-dark text-white py-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto space-y-16">

        {/* Continue Watching Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
                <FiRefreshCw className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-black tracking-wide text-white">Continue Watching</h2>
                <p className="text-xs text-gray-400 mt-0.5">Resume your progress from where you left off</p>
              </div>
            </div>

            {watchHistory.length > 0 && (
              <button
                onClick={handleClearHistory}
                className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 font-bold transition-colors border border-red-500/20 hover:border-red-500/40 px-3 py-1.5 rounded-lg bg-red-500/5"
              >
                <FiTrash2 className="w-3.5 h-3.5" /> Clear History
              </button>
            )}
          </div>

          {watchHistory.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {watchHistory.map((item) => {
                // Generate path to watch room
                const watchPath = item.type === 'movie'
                  ? `/watch/movie/${item.id}`
                  : `/watch/${item.type}/${item.id}/${item.season || 1}/${item.episode || 1}`;

                return (
                  <div
                    key={`${item.type}-${item.id}`}
                    className="group relative rounded-2xl overflow-hidden bg-surface-dark border border-white/5 shadow-lg flex flex-col hover:border-purple-500/30 transition-all duration-300"
                  >
                    {/* Media Card Preview */}
                    <div className="relative aspect-video w-full overflow-hidden bg-zinc-950">
                      <img
                        src={item.poster || 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=342&auto=format&fit=crop'}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/45 group-hover:bg-black/20 transition-colors" />

                      {/* Play Button */}
                      <Link
                        to={watchPath}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-all duration-300 hover:bg-purple-500"
                      >
                        <FiPlay className="w-5 h-5 fill-white ml-0.5" />
                      </Link>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeFromHistory(item.id, item.type)}
                        className="absolute top-3 right-3 p-2 rounded-lg bg-black/60 hover:bg-red-500 text-gray-300 hover:text-white transition-colors"
                        title="Remove from history"
                      >
                        <FiTrash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Meta info & Progress Bar */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <span className="text-[9px] font-extrabold uppercase tracking-wider text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded">
                          {item.type}
                        </span>
                        <h3 className="font-bold text-sm text-white line-clamp-1 mt-2 group-hover:text-purple-300 transition-colors">
                          {item.title}
                        </h3>
                        {item.type !== 'movie' && (
                          <p className="text-xs text-gray-400 font-semibold mt-0.5">
                            Season {item.season} &bull; Episode {item.episode}
                          </p>
                        )}
                      </div>

                      {/* Progress bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-gray-500">
                          <span>{item.progress}% completed</span>
                          <span>
                            {Math.round(item.watched / 60)}m / {Math.round(item.duration / 60)}m
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className="bg-linear-to-r from-purple-500 to-cyan-400 h-full rounded-full"
                            style={{ width: `${item.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 bg-surface-dark/25 border border-white/5 rounded-2xl text-gray-500">
              <FiFilm className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-semibold">Your watching list is empty</p>
              <p className="text-xs mt-0.5">Start streaming titles to track your history</p>
            </div>
          )}
        </section>

        {/* Watchlist Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
              <FiBookmark className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-black tracking-wide text-white">My Watchlist</h2>
              <p className="text-xs text-gray-400 mt-0.5">Titles you've saved to watch later</p>
            </div>
          </div>

          {watchlist.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {watchlist.map((item) => (
                <MediaCard key={`${item.type}-${item.id}`} item={item} type={item.type} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-surface-dark/25 border border-white/5 rounded-2xl text-gray-500">
              <FiBookmark className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-semibold">Your watchlist is empty</p>
              <p className="text-xs mt-0.5">Click the bookmark icon on details pages to add them here</p>
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
