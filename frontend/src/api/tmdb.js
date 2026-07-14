import axios from 'axios';

const BASE_URL = 'https://movie-chi-beryl.vercel.app/api';
// const BASE_URL = 'http://localhost:3000/api';

const getClient = () => {
  return axios.create({
    baseURL: BASE_URL,
  });
};

export const tmdb = {
  getTrendingMovies: async () => {
    const res = await getClient().get('/trending/movie/week');
    return res.data.results;
  },
  getTrendingTV: async () => {
    const res = await getClient().get('/trending/tv/week');
    return res.data.results;
  },
  searchMulti: async (query, page = 1) => {
    const res = await getClient().get('/search/multi', {
      params: { query, page }
    });
    return res.data;
  },
  getMovieDetails: async (id) => {
    const res = await getClient().get(`/movie/${id}`, {
      params: { append_to_response: 'credits,recommendations,similar,videos' }
    });
    return res.data;
  },
  getTVDetails: async (id) => {
    const res = await getClient().get(`/tv/${id}`, {
      params: { append_to_response: 'credits,recommendations,similar,videos' }
    });
    return res.data;
  },
  getTVSeason: async (id, seasonNum) => {
    const res = await getClient().get(`/tv/${id}/season/${seasonNum}`);
    return res.data;
  },
  getPopularMovies: async (page = 1) => {
    const res = await getClient().get('/movie/popular', { params: { page } });
    return res.data.results;
  },
  getPopularTV: async (page = 1) => {
    const res = await getClient().get('/tv/popular', { params: { page } });
    return res.data.results;
  },
  getMovieGenres: async () => {
    const res = await getClient().get('/genre/movie/list');
    return res.data.genres;
  },
  getTVGenres: async () => {
    const res = await getClient().get('/genre/tv/list');
    return res.data.genres;
  },
  discoverMovies: async (genreId, page = 1) => {
    const res = await getClient().get('/discover/movie', {
      params: { with_genres: genreId, page }
    });
    return res.data.results;
  },
  discoverTV: async (genreId, page = 1) => {
    const res = await getClient().get('/discover/tv', {
      params: { with_genres: genreId, page }
    });
    return res.data.results;
  },
  getTrendingAnime: async () => {
    const res = await getClient().get('/discover/tv', {
      params: {
        with_genres: 16,
        with_original_language: 'ja',
        sort_by: 'popularity.desc'
      }
    });
    return res.data.results;
  },
  getPopularAnime: async (page = 1) => {
    const res = await getClient().get('/discover/tv', {
      params: {
        with_genres: 16,
        with_original_language: 'ja',
        sort_by: 'popularity.desc',
        page
      }
    });
    return res.data.results;
  },
  getTopRatedMovies: async () => {
    const res = await getClient().get('/movie/top_rated');
    return res.data.results;
  },
  getTopRatedTV: async () => {
    const res = await getClient().get('/tv/top_rated');
    return res.data.results;
  },
  getUpcomingMovies: async () => {
    const res = await getClient().get('/movie/upcoming');
    return res.data.results;
  },
  getActionMovies: async () => {
    const res = await getClient().get('/discover/movie', {
      params: { with_genres: 28 }
    });
    return res.data.results;
  },
  getComedyMovies: async () => {
    const res = await getClient().get('/discover/movie', {
      params: { with_genres: 35 }
    });
    return res.data.results;
  },
  getSciFiMovies: async () => {
    const res = await getClient().get('/discover/movie', {
      params: { with_genres: 878 }
    });
    return res.data.results;
  },
  getHorrorMovies: async () => {
    const res = await getClient().get('/discover/movie', {
      params: { with_genres: 27 }
    });
    return res.data.results;
  },
  getRomanceMovies: async () => {
    const res = await getClient().get('/discover/movie', {
      params: { with_genres: 10749 }
    });
    return res.data.results;
  }
};
