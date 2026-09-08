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
    }

    setupPlayer() {
        this.videoElement = document.getElementById("videoPlayer");
        if (!this.videoElement) return;
        this.videoElement.controls = true;
        this.videoElement.preload = "metadata";
    }

    async loadMovie() {
        try {
            // Get movie details and videos
            const movie = await movieAPI.getMovieDetails(this.movieId);
            const videos = await movieAPI.getMovieVideos(this.movieId);

            // Set title
            document.getElementById("playerTitle").textContent = movie.title;

            // Set poster as video thumbnail
            if (movie.poster_path && this.videoElement) {
                this.videoElement.poster = movieAPI.getPosterUrl(movie.poster_path);
            }

            // Get trailer URL using the helper method
            const trailerUrl = movieAPI.getTrailerUrl(videos);

            if (trailerUrl) {
                // Load trailer in video player
                this.videoElement.src = trailerUrl;
                this.videoElement.load();
                
                // Show message
                showToast("🎬 Playing trailer. Full movie coming soon!", "info", 4000);
            } else {
                this.showError("No trailer available for this movie");
            }

        } catch (error) {
            console.error("Failed to load movie:", error);
            this.showError(error.message);
        }
    }

    setupControls() {
        // Back button
        document.getElementById("backBtn")?.addEventListener("click", () => {
            window.history.back();
        });

        // Keyboard shortcuts
        document.addEventListener("keydown", (e) => {
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
            if (e.key === "f" || e.key === "F") {
                if (this.videoElement && this.videoElement.requestFullscreen) {
                    this.videoElement.requestFullscreen();
                }
            }
        });

        // Mobile nav
        const toggle = document.getElementById("navToggle");
        const navCenter = document.querySelector(".nav-center");
        toggle?.addEventListener("click", () => {
            navCenter?.classList.toggle("open");
        });
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

document.addEventListener("DOMContentLoaded", () => {
    new VideoPlayer();
});