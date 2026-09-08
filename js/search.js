// ===== SEARCH MODULE =====
import { movieAPI } from "./api.js";
import { favoritesService } from "./favorites.js";
import { showToast, debounce } from "./utils.js";

let searchManager = null;

export function initSearch() {
    if (!searchManager) {
        searchManager = new SearchManager();
    }
    return searchManager;
}

export function getSearchManager() {
    return searchManager;
}

class SearchManager {
    constructor() {
        this.searchInput = document.getElementById("searchInput");
        this.searchBtn = document.getElementById("searchBtn");
        this.currentQuery = "";
        this.init();
    }

    init() {
        if (!this.searchInput) return;
        this.createResultsContainer();
        this.setupListeners();
    }

    createResultsContainer() {
        if (!document.getElementById("searchResults")) {
            const container = document.createElement("div");
            container.id = "searchResults";
            container.className = "search-results-dropdown";
            container.style.display = "none";
            const searchContainer = document.querySelector(".search-container");
            if (searchContainer) {
                searchContainer.parentNode.insertBefore(container, searchContainer.nextSibling);
            }
        }
    }

    setupListeners() {
        const debouncedSearch = debounce((e) => {
            const query = e.target.value.trim();
            this.handleSearch(query);
        }, 400);

        this.searchInput.addEventListener("input", debouncedSearch);

        this.searchBtn?.addEventListener("click", () => {
            const query = this.searchInput.value.trim();
            if (query.length >= 2) {
                this.handleSearch(query);
            } else {
                showToast("Please enter at least 2 characters", "info");
            }
        });

        this.searchInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                const query = this.searchInput.value.trim();
                if (query.length >= 2) {
                    this.handleSearch(query);
                } else {
                    showToast("Please enter at least 2 characters", "info");
                }
            }
            if (e.key === "Escape") {
                this.clearSearch();
            }
        });

        // Close dropdown when clicking outside
        document.addEventListener("click", (e) => {
            const results = document.getElementById("searchResults");
            if (results && !e.target.closest(".search-container") && !e.target.closest("#searchResults")) {
                results.style.display = "none";
            }
        });

        // Focus event to show results
        this.searchInput.addEventListener("focus", () => {
            if (this.currentQuery.length >= 2) {
                const results = document.getElementById("searchResults");
                if (results) {
                    results.style.display = "block";
                }
            }
        });
    }

    async handleSearch(query) {
        this.currentQuery = query;
        if (query.length < 2) {
            this.clearSearch();
            return;
        }

        const results = document.getElementById("searchResults");
        if (results) {
            results.innerHTML = `<div class="search-loading"><div class="spinner-small"></div><p>Searching...</p></div>`;
            results.style.display = "block";
        }

        try {
            const data = await movieAPI.searchMovies(query);
            this.displayResults(data.results);
        } catch (error) {
            console.error("Search failed:", error);
            this.showError(error.message);
        }
    }

    displayResults(movies) {
        const results = document.getElementById("searchResults");
        if (!results) return;

        results.innerHTML = "";

        if (!movies || movies.length === 0) {
            results.innerHTML = `
                <div class="search-empty">
                    <i class="fas fa-search"></i>
                    <p>No movies found for "<strong>${this.currentQuery}</strong>"</p>
                    <span class="search-hint">Try different keywords</span>
                </div>
            `;
            results.style.display = "block";
            return;
        }

        const list = document.createElement("div");
        list.className = "search-results-list";

        movies.slice(0, 8).forEach(movie => {
            const item = this.createResultItem(movie);
            list.appendChild(item);
        });

        if (movies.length > 8) {
            const viewAll = document.createElement("div");
            viewAll.className = "search-view-all";
            viewAll.innerHTML = `
                <a href="/movies.html?search=${encodeURIComponent(this.currentQuery)}">
                    View all ${movies.length} results <i class="fas fa-arrow-right"></i>
                </a>
            `;
            list.appendChild(viewAll);
        }

        results.appendChild(list);
        results.style.display = "block";
    }

    createResultItem(movie) {
        const item = document.createElement("div");
        item.className = "search-result-item";

        const posterUrl = movie.poster_path
            ? movieAPI.getPosterUrl(movie.poster_path)
            : "/assets/images/placeholder.jpg";

        const year = movie.release_date
            ? new Date(movie.release_date).getFullYear()
            : "N/A";

        const isFavorite = favoritesService.isFavorite(movie.id);

        item.innerHTML = `
            <img src="${posterUrl}" alt="${movie.title}" loading="lazy" onerror="this.src='/assets/images/placeholder.jpg'" />
            <div class="search-result-info">
                <h4>${movie.title}</h4>
                <div class="search-result-meta">
                    <span>${year}</span>
                    <span class="search-result-rating"><i class="fas fa-star"></i> ${movie.vote_average?.toFixed(1) || "N/A"}</span>
                </div>
            </div>
            <button class="search-result-fav ${isFavorite ? "active" : ""}" data-id="${movie.id}">
                <i class="${isFavorite ? "fas" : "far"} fa-heart"></i>
            </button>
        `;

        // Click to go to details page
        item.addEventListener("click", (e) => {
            if (e.target.closest(".search-result-fav")) return;
            window.location.href = `/details.html?id=${movie.id}`;
        });

        // Favorite button toggle
        const favBtn = item.querySelector(".search-result-fav");
        favBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            const isNowFavorite = favoritesService.toggle(movie);
            const icon = favBtn.querySelector("i");
            icon.className = isNowFavorite ? "fas fa-heart" : "far fa-heart";
            favBtn.classList.toggle("active", isNowFavorite);
            showToast(isNowFavorite ? `Added "${movie.title}" to favorites ❤️` : `Removed "${movie.title}" from favorites 💔`);
        });

        return item;
    }

    showError(message) {
        const results = document.getElementById("searchResults");
        if (!results) return;
        results.innerHTML = `
            <div class="search-error">
                <i class="fas fa-exclamation-circle"></i>
                <p>${message || "Search failed. Please try again."}</p>
                <button class="search-retry" onclick="window.location.reload()">Retry</button>
            </div>
        `;
        results.style.display = "block";
    }

    clearSearch() {
        this.searchInput.value = "";
        this.currentQuery = "";
        const results = document.getElementById("searchResults");
        if (results) {
            results.innerHTML = "";
            results.style.display = "none";
        }
    }

    // Public method to trigger search from other components
    search(query) {
        if (query && query.trim().length >= 2) {
            this.searchInput.value = query;
            this.handleSearch(query.trim());
        }
    }
}

// Auto-initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("searchInput")) {
        initSearch();
    }
});