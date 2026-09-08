// ===== MAIN APPLICATION =====
import { movieAPI } from "./api.js";
import { favoritesService } from "./favorites.js";
import { showToast, getYear, truncateText } from "./utils.js";

class App {
    constructor() {
        this.currentHeroMovie = null;
        this.init();
    }

    async init() {
        this.setupNav();
        await this.loadHomepage();
        this.setupHeroButtons();
    }

    setupNav() {
        const toggle = document.getElementById("navToggle");
        const navCenter = document.querySelector(".nav-center");

        toggle?.addEventListener("click", () => {
            navCenter?.classList.toggle("open");
        });

        document.querySelectorAll(".nav-links a").forEach(link => {
            link.addEventListener("click", () => {
                navCenter?.classList.remove("open");
            });
        });

        window.addEventListener("scroll", () => {
            const navbar = document.getElementById("navbar");
            if (window.scrollY > 50) {
                navbar?.classList.add("scrolled");
            } else {
                navbar?.classList.remove("scrolled");
            }
        });
    }

    async loadHomepage() {
        try {
            const [trending, popular, topRated, upcoming] = await Promise.all([
                movieAPI.getTrendingMovies("week"),
                movieAPI.getPopularMovies(),
                movieAPI.getTopRatedMovies(),
                movieAPI.getUpcomingMovies()
            ]);

            if (trending.results && trending.results.length > 0) {
                this.setHero(trending.results[0]);
            }

            this.renderMovies("trendingRow", trending.results, "Trending");
            this.renderMovies("popularRow", popular.results, "Popular");
            this.renderMovies("topRatedRow", topRated.results, "Top Rated");
            this.renderMovies("upcomingRow", upcoming.results, "Upcoming");

        } catch (error) {
            console.error("Failed to load homepage:", error);
            showToast("Failed to load movies. Please refresh.", "error");
        }
    }

    setHero(movie) {
        this.currentHeroMovie = movie;

        document.getElementById("heroTitle").textContent = movie.title;
        document.getElementById("heroDescription").textContent = truncateText(movie.overview || "No description available.", 150);
        document.getElementById("heroRating").textContent = movie.vote_average?.toFixed(1) || "N/A";
        document.getElementById("heroYear").textContent = getYear(movie.release_date);

        const genreNames = movie.genre_ids ? movieAPI.getGenreNames(movie.genre_ids) : [];
        document.getElementById("heroGenres").textContent = genreNames.slice(0, 3).join(", ") || "N/A";

        const heroBackdrop = document.getElementById("heroBackdrop");
        if (movie.backdrop_path) {
            heroBackdrop.style.backgroundImage = `url(${movieAPI.getBackdropUrl(movie.backdrop_path)})`;
        }

        this.updateHeroFavoriteButton();
    }

    updateHeroFavoriteButton() {
        const btn = document.getElementById("heroFavoriteBtn");
        if (!this.currentHeroMovie) return;

        const isFav = favoritesService.isFavorite(this.currentHeroMovie.id);
        if (isFav) {
            btn.innerHTML = '<i class="fas fa-heart"></i> Remove from Favorites';
            btn.classList.add("favorited");
        } else {
            btn.innerHTML = '<i class="fas fa-heart"></i> Add to Favorites';
            btn.classList.remove("favorited");
        }
    }

    setupHeroButtons() {
        document.getElementById("heroWatchBtn").addEventListener("click", () => {
            if (this.currentHeroMovie) {
                window.location.href = `/watch.html?id=${this.currentHeroMovie.id}`;
            }
        });

        document.getElementById("heroFavoriteBtn").addEventListener("click", () => {
            if (this.currentHeroMovie) {
                const isFav = favoritesService.toggle(this.currentHeroMovie);
                this.updateHeroFavoriteButton();
                showToast(isFav ? "Added to favorites ❤️" : "Removed from favorites 💔");
            }
        });
    }

    renderMovies(containerId, movies, sectionName) {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (!movies || movies.length === 0) {
            container.innerHTML = `<p class="no-results">No ${sectionName.toLowerCase()} movies available</p>`;
            return;
        }

        container.innerHTML = movies.slice(0, 12).map(movie => `
            <div class="movie-card" onclick="window.location.href='/details.html?id=${movie.id}'">
                <div class="movie-card-poster">
                    <img 
                        src="${movieAPI.getPosterUrl(movie.poster_path)}" 
                        alt="${movie.title}"
                        loading="lazy"
                        onerror="this.src='/assets/images/placeholder.jpg'"
                    />
                    <span class="movie-card-rating">
                        <i class="fas fa-star"></i> ${movie.vote_average?.toFixed(1) || "N/A"}
                    </span>
                    <button class="movie-card-favorite" data-id="${movie.id}" onclick="event.stopPropagation()">
                        <i class="${favoritesService.isFavorite(movie.id) ? "fas" : "far"} fa-heart"></i>
                    </button>
                </div>
                <div class="movie-card-info">
                    <h4 class="movie-card-title">${movie.title}</h4>
                    <div class="movie-card-meta">
                        <span>${getYear(movie.release_date)}</span>
                    </div>
                </div>
            </div>
        `).join("");

        container.querySelectorAll(".movie-card-favorite").forEach(btn => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                const movieId = parseInt(btn.dataset.id);
                const movie = movies.find(m => m.id === movieId);
                if (movie) {
                    const isFav = favoritesService.toggle(movie);
                    btn.querySelector("i").className = isFav ? "fas fa-heart" : "far fa-heart";
                    showToast(isFav ? "Added to favorites ❤️" : "Removed from favorites 💔");

                    if (this.currentHeroMovie && this.currentHeroMovie.id === movieId) {
                        this.updateHeroFavoriteButton();
                    }
                }
            });
        });
    }
}

document.addEventListener("DOMContentLoaded", () => {
    new App();
});s