import { create } from 'zustand';

export const useStore = create((set, get) => ({
  // TMDB API Key State
  tmdbApiKey: localStorage.getItem('tmdb_api_key') || 'd5ce1d8a4f90be42feb1f870322f2739',
  setTmdbApiKey: (key) => {
    localStorage.setItem('tmdb_api_key', key);
    set({ tmdbApiKey: key });
  },

  // Watchlist State
  watchlist: JSON.parse(localStorage.getItem('watchlist')) || [],
  addToWatchlist: (item) => {
    const currentList = get().watchlist;
    if (currentList.some((x) => x.id === item.id && x.type === item.type)) return;
    const updatedList = [item, ...currentList];
    localStorage.setItem('watchlist', JSON.stringify(updatedList));
    set({ watchlist: updatedList });
  },
  removeFromWatchlist: (id, type) => {
    const currentList = get().watchlist;
    const updatedList = currentList.filter((x) => !(x.id === id && x.type === type));
    localStorage.setItem('watchlist', JSON.stringify(updatedList));
    set({ watchlist: updatedList });
  },
  inWatchlist: (id, type) => {
    return get().watchlist.some((x) => x.id === id && x.type === type);
  },

  // Watch History State
  watchHistory: JSON.parse(localStorage.getItem('watch_history')) || [],
  updateWatchHistory: (historyItem) => {
    const currentHistory = get().watchHistory;
    // unique key to match identical items (include season/episode for tv/anime to keep track of individual episode progress if desired,
    // or just track show-level progress. Let's track at show level, but update season/episode details, so we can display "Continue: S1 E3")
    const existingIndex = currentHistory.findIndex(
      (x) => x.id === historyItem.id && x.type === historyItem.type
    );

    const progress = historyItem.duration > 0 
      ? Math.min(Math.round((historyItem.watched / historyItem.duration) * 100), 100) 
      : 0;

    const newHistoryItem = {
      ...historyItem,
      progress,
      timestamp: Date.now()
    };

    let updatedHistory = [...currentHistory];
    if (existingIndex > -1) {
      // Update existing item and move to the top
      updatedHistory.splice(existingIndex, 1);
    }
    
    updatedHistory = [newHistoryItem, ...updatedHistory];
    localStorage.setItem('watch_history', JSON.stringify(updatedHistory));
    set({ watchHistory: updatedHistory });
  },
  removeFromHistory: (id, type) => {
    const currentHistory = get().watchHistory;
    const updatedHistory = currentHistory.filter((x) => !(x.id === id && x.type === type));
    localStorage.setItem('watch_history', JSON.stringify(updatedHistory));
    set({ watchHistory: updatedHistory });
  },
  clearHistory: () => {
    localStorage.removeItem('watch_history');
    set({ watchHistory: [] });
  }
}));
