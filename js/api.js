// ===== TMDB API SERVICE =====
import { CONFIG } from './config.js';

export class MovieAPI {
    constructor() {
        this.apiKey = CONFIG.TMDB_API_KEY;
        this.baseUrl = CONFIG.TMDB_BASE_URL;
        this.imageBase = CONFIG.TMDB_IMAGE_BASE;
        this.posterSize = CONFIG.POSTER_SIZE;
        this.backdropSize = CONFIG.BACKDROP_SIZE;
        this.profileSize = CONFIG.PROFILE_SIZE;
        this.logoSize = CONFIG.LOGO_SIZE;
    }

    // Build image URL
    getImageUrl(path, size = this.posterSize) {
        if (!path) return null;
        return `${this.imageBase}/${size}${path}`;
    }

    // Get full poster URL
    getPosterUrl(path) {
        return this.getImageUrl(path, this.posterSize);
    }

    // Get full backdrop URL
    getBackdropUrl(path) {
        return this.getImageUrl(path, this.backdropSize);
    }

    // Get profile image URL
    getProfileUrl(path) {
        return this.getImageUrl(path, this.profileSize);
    }

    // Fetch with error handling
    async fetchData(endpoint, params = {}) {
        if (!this.apiKey || this.apiKey === 'YOUR_TMDB_API_KEY_HERE') {
            throw new Error('TMDB API key is not configured. Please add your API key to .env file.');
        }

        const url = new URL(`${this.baseUrl}${endpoint}`);
        url.searchParams.append('api_key', this.apiKey);
        url.searchParams.append('language', CONFIG.API_OPTIONS.language);

        Object.keys(params).forEach(key => {
            if (params[key] !== undefined && params[key] !== null) {
                url.searchParams.append(key, params[key]);
            }
        });

        try {
            const response = await fetch(url);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(
                    errorData.status_message || 
                    `API Error: ${response.status} - ${response.statusText}`
                );
            }

            const data = await response.json();

            if (data.errors) {
                throw new Error(data.errors.join(', '));
            }

            return data;
        } catch (error) {
            console.error('TMDB API Error:', error);
            throw error;
        }
    }

    // ===== MOVIE ENDPOINTS =====

    async getTrendingMovies(timeWindow = 'week') {
        return this.fetchData(`/trending/movie/${timeWindow}`);
    }

    async getPopularMovies(page = 1) {
        return this.fetchData('/movie/popular', { page });
    }

    async getTopRatedMovies(page = 1) {
        return this.fetchData('/movie/top_rated', { page });
    }

    async getUpcomingMovies(page = 1) {
        return this.fetchData('/movie/upcoming', { page });
    }

    async getNowPlayingMovies(page = 1) {
        return this.fetchData('/movie/now_playing', { page });
    }

    async getMovieDetails(movieId) {
        return this.fetchData(`/movie/${movieId}`);
    }

    async getMovieCredits(movieId) {
        return this.fetchData(`/movie/${movieId}/credits`);
    }

    async getMovieVideos(movieId) {
        return this.fetchData(`/movie/${movieId}/videos`);
    }

    async getMovieImages(movieId) {
        return this.fetchData(`/movie/${movieId}/images`);
    }

    async getSimilarMovies(movieId) {
        return this.fetchData(`/movie/${movieId}/similar`);
    }

    async getRecommendations(movieId) {
        return this.fetchData(`/movie/${movieId}/recommendations`);
    }

    async searchMovies(query, page = 1) {
        if (!query || !query.trim()) return { results: [] };
        return this.fetchData('/search/movie', { 
            query: query.trim(), 
            page,
            include_adult: false 
        });
    }

    async getMoviesByGenre(genreId, page = 1) {
        return this.fetchData('/discover/movie', { 
            with_genres: genreId, 
            page,
            sort_by: 'popularity.desc'
        });
    }

    async getGenres() {
        return this.fetchData('/genre/movie/list');
    }

    async getMoviesByYear(year, page = 1) {
        return this.fetchData('/discover/movie', {
            primary_release_year: year,
            page,
            sort_by: 'popularity.desc'
        });
    }

    async getMoviesWithCast(actorId, page = 1) {
        return this.fetchData('/discover/movie', {
            with_cast: actorId,
            page
        });
    }

    // ===== HELPER METHODS =====

    // Get a trailer URL if available
    getTrailerUrl(videos) {
        if (!videos || !videos.results) return null;
        
        // Try to find a trailer (prefer official)
        let trailer = videos.results.find(
            v => v.type === 'Trailer' && v.site === 'YouTube' && v.official
        );
        
        if (!trailer) {
            trailer = videos.results.find(
                v => v.type === 'Trailer' && v.site === 'YouTube'
            );
        }
        
        if (!trailer) return null;
        return `https://www.youtube.com/watch?v=${trailer.key}`;
    }

    // Get embeddable trailer URL
    getEmbedTrailerUrl(videos) {
        if (!videos || !videos.results) return null;
        
        let trailer = videos.results.find(
            v => v.type === 'Trailer' && v.site === 'YouTube' && v.official
        );
        
        if (!trailer) {
            trailer = videos.results.find(
                v => v.type === 'Trailer' && v.site === 'YouTube'
            );
        }
        
        if (!trailer) return null;
        return `https://www.youtube.com/embed/${trailer.key}`;
    }

    // Get all YouTube videos for a movie
    getYouTubeVideos(videos) {
        if (!videos || !videos.results) return [];
        return videos.results.filter(v => v.site === 'YouTube');
    }

    // Format runtime to hours and minutes
    formatRuntime(minutes) {
        if (!minutes) return 'N/A';
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (hours === 0) return `${mins}m`;
        return `${hours}h ${mins}m`;
    }

    // Get genre names from genre IDs
    getGenreNames(genreIds) {
        if (!genreIds || !Array.isArray(genreIds)) return [];
        return genreIds
            .map(id => CONFIG.GENRES[id])
            .filter(name => name);
    }

    // Get full genre names string
    getGenreString(genreIds, limit = 3) {
        const names = this.getGenreNames(genreIds);
        return names.slice(0, limit).join(', ');
    }
}

// ===== CREATE SINGLETON INSTANCE =====
export const movieAPI = new MovieAPI();