// ===== VIDEO PLAYER =====
import { movieAPI } from "./api.js";
import { getQueryParam, showToast } from "./utils.js";

class VideoPlayer {
    constructor() {
        this.movieId = getQueryParam("id");
        this.videoElement = null;
        this.init();
    }

    async init() {
        if (!this.movieId) {
            this.showError("No movie selected");
            return;
        }

        this.setupPlayer();
        await this.loadMovie();
        this.setupControls();
        this.setupNavigation();
    }

    setupPlayer() {
        this.videoElement = document.getElementById("videoPlayer");
        if (!this.videoElement) return;
        
        // Enable native controls
        this.videoElement.controls = true;
        this.videoElement.preload = "metadata";
        
        // Add event listeners for video state
        this.videoElement.addEventListener("play", () => {
            console.log("Video playing");
        });
        
        this.videoElement.addEventListener("pause", () => {
            console.log("Video paused");
        });
        
        this.videoElement.addEventListener("ended", () => {
            console.log("Video ended");
        });
        
        this.videoElement.addEventListener("error", (e) => {
            console.error("Video error:", e);
            this.showError("Failed to load video. Please try again later.");
        });
    }

    async loadMovie() {
        try {
            const movie = await movieAPI.getMovieDetails(this.movieId);
            const videos = await movieAPI.getMovieVideos(this.movieId);

            // Set movie title
            const titleElement = document.getElementById("playerTitle");
            if (titleElement) {
                titleElement.textContent = movie.title;
            }

            // Set poster as video thumbnail
            if (movie.poster_path && this.videoElement) {
                this.videoElement.poster = movieAPI.getPosterUrl(movie.poster_path);
            }

            // Get trailer URL
            const trailerUrl = movieAPI.getTrailerUrl(videos);

            if (trailerUrl && this.videoElement) {
                // Set video source to trailer
                this.videoElement.src = trailerUrl;
                this.videoElement.load();
                
                // Show a message that this is a trailer
                showToast("🎬 Playing trailer (demo mode). In production, this would play the full movie.", "info", 4000);
            } else {
                // No trailer available - show placeholder
                this.showError("No video available for this movie");
            }

        } catch (error) {
            console.error("Failed to load movie:", error);
            this.showError(error.message);
        }
    }

    setupControls() {
        // Keyboard shortcuts
        document.addEventListener("keydown", (e) => {
            // Space bar: Play/Pause
            if (e.key === " " || e.key === "Space") {
                e.preventDefault();
                if (this.videoElement) {
                    if (this.videoElement.paused) {
                        this.videoElement.play();
                    } else {
                        this.videoElement.pause();
                    }
                }
            }
            
            // F key: Fullscreen
            if (e.key === "f" || e.key === "F") {
                if (this.videoElement && this.videoElement.requestFullscreen) {
                    this.videoElement.requestFullscreen();
                }
            }
            
            // M key: Mute/Unmute
            if (e.key === "m" || e.key === "M") {
                if (this.videoElement) {
                    this.videoElement.muted = !this.videoElement.muted;
                }
            }
            
            // Arrow keys: Skip forward/backward
            if (e.key === "ArrowRight" && this.videoElement) {
                this.videoElement.currentTime += 10;
                e.preventDefault();
            }
            if (e.key === "ArrowLeft" && this.videoElement) {
                this.videoElement.currentTime -= 10;
                e.preventDefault();
            }
        });
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

        // Navbar scroll effect
        window.addEventListener("scroll", () => {
            const navbar = document.getElementById("navbar");
            if (window.scrollY > 50) {
                navbar?.classList.add("scrolled");
            } else {
                navbar?.classList.remove("scrolled");
            }
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

        // Watch next (load another random movie)
        document.getElementById("watchNextBtn")?.addEventListener("click", () => {
            this.loadRandomMovie();
        });
    }

    async loadRandomMovie() {
        try {
            const data = await movieAPI.getPopularMovies();
            if (data.results && data.results.length > 0) {
                // Pick a random movie
                const randomIndex = Math.floor(Math.random() * data.results.length);
                const randomMovie = data.results[randomIndex];
                // Navigate to it
                window.location.href = `/watch.html?id=${randomMovie.id}`;
            }
        } catch (error) {
            console.error("Failed to load random movie:", error);
            showToast("Failed to load next movie", "error");
        }
    }

    showError(message) {
        const container = document.getElementById("playerContainer");
        if (container) {
            container.innerHTML = `
                <div class="player-error">
                    <i class="fas fa-exclamation-circle"></i>
                    <h2>Something went wrong</h2>
                    <p>${message || "Failed to load video"}</p>
                    <div style="display: flex; gap: 12px; margin-top: 16px; flex-wrap: wrap; justify-content: center;">
                        <button class="btn btn-primary" onclick="window.history.back()">
                            <i class="fas fa-arrow-left"></i> Go Back
                        </button>
                        <button class="btn btn-secondary" onclick="window.location.reload()">
                            <i class="fas fa-sync"></i> Retry
                        </button>
                    </div>
                </div>
            `;
        }
    }
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
    new VideoPlayer();
});