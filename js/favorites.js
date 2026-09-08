// ===== FAVORITES SERVICE =====
export class FavoritesService {
    constructor() {
        this.storageKey = 'mymovie_favorites';
        this.favorites = this.load();
    }

    load() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Failed to load favorites:', error);
            return [];
        }
    }

    save() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.favorites));
        } catch (error) {
            console.error('Failed to save favorites:', error);
        }
    }

    add(movie) {
        if (!this.isFavorite(movie.id)) {
            this.favorites.push({
                id: movie.id,
                title: movie.title,
                poster_path: movie.poster_path,
                backdrop_path: movie.backdrop_path,
                overview: movie.overview,
                release_date: movie.release_date,
                vote_average: movie.vote_average,
                vote_count: movie.vote_count,
                genre_ids: movie.genre_ids || [],
                original_title: movie.original_title,
                popularity: movie.popularity,
                added_at: new Date().toISOString()
            });
            this.save();
            return true;
        }
        return false;
    }

    remove(movieId) {
        const index = this.favorites.findIndex(fav => fav.id === movieId);
        if (index !== -1) {
            this.favorites.splice(index, 1);
            this.save();
            return true;
        }
        return false;
    }

    toggle(movie) {
        if (this.isFavorite(movie.id)) {
            this.remove(movie.id);
            return false;
        } else {
            this.add(movie);
            return true;
        }
    }

    isFavorite(movieId) {
        return this.favorites.some(fav => fav.id === movieId);
    }

    getAll() {
        return this.favorites;
    }

    getCount() {
        return this.favorites.length;
    }

    getFavoritesByGenre(genreId) {
        return this.favorites.filter(movie => 
            movie.genre_ids && movie.genre_ids.includes(genreId)
        );
    }

    searchFavorites(query) {
        const searchTerm = query.toLowerCase().trim();
        if (!searchTerm) return this.favorites;
        return this.favorites.filter(movie => 
            movie.title.toLowerCase().includes(searchTerm)
        );
    }

    clearAll() {
        this.favorites = [];
        this.save();
    }

    // Get favorite movie by ID
    getById(movieId) {
        return this.favorites.find(fav => fav.id === movieId);
    }

    // Get sorted favorites (by date added, newest first)
    getSortedByDate() {
        return [...this.favorites].sort((a, b) => 
            new Date(b.added_at) - new Date(a.added_at)
        );
    }

    // Get sorted favorites (by rating, highest first)
    getSortedByRating() {
        return [...this.favorites].sort((a, b) => 
            (b.vote_average || 0) - (a.vote_average || 0)
        );
    }

    // Get sorted favorites (by title)
    getSortedByTitle() {
        return [...this.favorites].sort((a, b) => 
            a.title.localeCompare(b.title)
        );
    }
}

// ===== CREATE SINGLETON INSTANCE =====
export const favoritesService = new FavoritesService();

// ===== AUTO-SAVE ON PAGE CLOSE =====
window.addEventListener('beforeunload', () => {
    favoritesService.save();
});