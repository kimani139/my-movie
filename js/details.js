// ===== DETAILS PAGE =====
import { movieAPI } from "./api.js";
import { favoritesService } from "./favorites.js";
import { showToast, getYear, truncateText, getQueryParam } from "./utils.js";

class DetailsPage {
    constructor() {
        this.movieId = getQueryParam("id");
        this.movieData = null;
        this.init();
    }

    async init() {
        if (!this.movieId) {
            this.showError("No movie ID provided");
            return;
        }

        this.setupNavigation();
        await this.loadMovieDetails();
        this.setupButtons();
    }

    setupNavigation() {
        // Back button
        document.getElementById("backBtn")?.addEventListener("click", () => {
            window.history.back();
        });

        // Mobile nav toggle
        const toggle = document.getElementById("navToggle");
        const navCenter = document.querySelector(".nav-center");
        toggle?.addEventListener("click", () => {
            navCenter?.classList.toggle("open");
        });

        // Close mobile nav on link click
        document.querySelectorAll(".nav-links a").forEach(link => {
            link.addEventListener("click", () => {
                navCenter?.classList.remove("open");
            });
        });

        // Search redirect
        const searchInput = document.getElementById("searchInput");
        const searchBtn = document.getElementById("searchBtn");
        
        searchInput?.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                const query = searchInput.value.trim();
                if (query.length >= 2) {
                    window.location.href = `/movies.html?search=${encodeURIComponent(query)}`;
                }
            }
        });
        
        searchBtn?.addEventListener("click", () => {
            const query = searchInput.value.trim();
            if (query.length >= 2) {
                window.location.href = `/movies.html?search=${encodeURIComponent(query)}`;
            }
        });

        // Navbar scroll effect
        window.addEventListener("scroll", () => {
            const navbar = document.getElementById("navbar");
            if (window.scrollY > 50) {
                navbar?.classList.add("scrolled");
            } else {
                navbar?.classList.remove("scrolled");
            }
        });
    }

    async loadMovieDetails() {
        try {
            this.showLoading();

            const [details, credits, videos, similar] = await Promise.all([
                movieAPI.getMovieDetails(this.movieId),
                movieAPI.getMovieCredits(this.movieId),
                movieAPI.getMovieVideos(this.movieId),
                movieAPI.getSimilarMovies(this.movieId)
            ]);

            this.movieData = { ...details, credits, videos, similar };
            this.renderDetails();
            this.renderSimilarMovies(similar.results);

            this.hideLoading();
            this.showContent();

        } catch (error) {
            console.error("Failed to load details:", error);
            this.showError(error.message);
        }
    }

    renderDetails() {
        const movie = this.movieData;

        // Set backdrop
        const hero = document.getElementById("detailsHero");
        if (movie.backdrop_path) {
            hero.style.backgroundImage = `url(${movieAPI.getBackdropUrl(movie.backdrop_path)})`;
        }

        // Poster
        const poster = document.getElementById("detailPoster");
        poster.src = movieAPI.getPosterUrl(movie.poster_path) || "/assets/images/placeholder.jpg";
        poster.alt = movie.title;

        // Title
        document.getElementById("detailTitle").textContent = movie.title;

        // Rating
        document.getElementById("detailRating").textContent = movie.vote_average?.toFixed(1) || "N/A";

        // Year
        document.getElementById("detailYear").textContent = getYear(movie.release_date);

        // Runtime
        const runtime = movie.runtime;
        if (runtime) {
            const hours = Math.floor(runtime / 60);
            const mins = runtime % 60;
            document.getElementById("detailRuntime").textContent = `${hours}h ${mins}m`;
        } else {
            document.getElementById("detailRuntime").textContent = "N/A";
        }

        // Genres
        const genresContainer = document.getElementById("detailGenres");
        if (movie.genres && movie.genres.length > 0) {
            genresContainer.innerHTML = movie.genres.map(genre =>
                `<span class="genre-tag">${genre.name}</span>`
            ).join("");
        } else {
            genresContainer.innerHTML = "<span class='genre-tag'>N/A</span>";
        }

        // Overview
        document.getElementById("detailOverview").textContent = movie.overview || "No description available.";

        // Cast
        this.renderCast(movie.credits);

        // Update favorite button
        this.updateFavoriteButton();

        // Watch button
        document.getElementById("detailWatchBtn").onclick = () => {
            window.location.href = `/watch.html?id=${movie.id}`;
        };

        // Trailer button
        const trailerBtn = document.getElementById("detailTrailerBtn");
        const trailerUrl = movieAPI.getTrailerUrl(movie.videos);
        if (trailerUrl) {
            trailerBtn.style.display = "flex";
            trailerBtn.onclick = () => {
                window.open(trailerUrl, "_blank");
            };
        } else {
            trailerBtn.style.display = "none";
        }
    }

    renderCast(credits) {
        const castList = document.getElementById("castList");
        if (!credits || !credits.cast || credits.cast.length === 0) {
            castList.innerHTML = "<p class='no-cast'>Cast information not available</p>";
            return;
        }

        const topCast = credits.cast.slice(0, 8);
        castList.innerHTML = topCast.map(person => `
            <div class="cast-item">
                <img 
                    src="${movieAPI.getImageUrl(person.profile_path, "w185") || "/assets/images/avatar.jpg"}" 
                    alt="${person.name}"
                    onerror="this.src='/assets/images/avatar.jpg'"
                />
                <div class="cast-info">
                    <p class="cast-name">${person.name}</p>
                    <p class="cast-character">${person.character}</p>
                </div>
            </div>
        `).join("");
    }

    renderSimilarMovies(movies) {
        const container = document.getElementById("similarRow");
        if (!movies || movies.length === 0) {
            container.innerHTML = "<p class='no-results'>No similar movies found</p>";
            return;
        }

        container.innerHTML = movies.slice(0, 10).map(movie => `
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
                }
            });
        });
    }

    updateFavoriteButton() {
        const btn = document.getElementById("detailFavoriteBtn");
        if (!this.movieData) return;

        const isFav = favoritesService.isFavorite(this.movieId);
        if (isFav) {
            btn.innerHTML = '<i class="fas fa-heart"></i> Remove from Favorites';
            btn.classList.add("favorited");
        } else {
            btn.innerHTML = '<i class="fas fa-heart"></i> Add to Favorites';
            btn.classList.remove("favorited");
        }
    }

    setupButtons() {
        document.getElementById("detailFavoriteBtn").addEventListener("click", () => {
            if (this.movieData) {
                const isFav = favoritesService.toggle(this.movieData);
                this.updateFavoriteButton();
                showToast(isFav ? "Added to favorites ❤️" : "Removed from favorites 💔");
            }
        });
    }

    showLoading() {
        document.getElementById("detailsLoading").style.display = "flex";
        document.getElementById("detailsContent").style.display = "none";
        document.getElementById("detailsError").style.display = "none";
    }

    hideLoading() {
        document.getElementById("detailsLoading").style.display = "none";
    }

    showContent() {
        document.getElementById("detailsContent").style.display = "block";
    }

    showError(message) {
        document.getElementById("detailsLoading").style.display = "none";
        document.getElementById("detailsContent").style.display = "none";
        document.getElementById("detailsError").style.display = "block";
        document.getElementById("errorMessage").textContent = message || "Failed to load movie details";

        document.getElementById("retryBtn").onclick = () => {
            this.loadMovieDetails();
        };
    }
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
    new DetailsPage();
});