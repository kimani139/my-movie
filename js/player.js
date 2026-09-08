// ===== VIDEO PLAYER =====
import { movieAPI } from "./api.js";
import { getQueryParam, showToast } from "./utils.js";

class VideoPlayer {
    constructor() {
        this.movieId = getQueryParam("id");
        this.init();
    }

    async init() {
        if (!this.movieId) {
            this.showError("No movie selected");
            return;
        }

        await this.loadMovie();
        this.setupControls();
    }

    async loadMovie() {
        try {
            // Show loading
            document.getElementById("playerTitle").textContent = "Loading...";
            
            // Get movie details and videos
            const movie = await movieAPI.getMovieDetails(this.movieId);
            const videos = await movieAPI.getMovieVideos(this.movieId);

            // Set title
            document.getElementById("playerTitle").textContent = movie.title;

            // Get embeddable trailer URL
            const trailerUrl = this.getBestVideo(videos);

            if (trailerUrl) {
                // Create iframe for YouTube trailer
                const container = document.getElementById("playerContainer");
                container.innerHTML = `
                    <div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; border-radius: 12px; background: #000;">
                        <iframe 
                            src="${trailerUrl}?autoplay=1&rel=0&modestbranding=1&showinfo=0"
                            style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowfullscreen
                            frameborder="0"
                        ></iframe>
                    </div>
                    <div style="margin-top: 16px; display: flex; gap: 12px; flex-wrap: wrap;">
                        <button class="btn btn-primary" onclick="document.querySelector('iframe')?.contentWindow.postMessage('{"event":"command","func":"play","args":""}','*')">
                            <i class="fas fa-play"></i> Play
                        </button>
                        <button class="btn btn-secondary" onclick="document.querySelector('iframe')?.contentWindow.postMessage('{"event":"command","func":"pause","args":""}','*')">
                            <i class="fas fa-pause"></i> Pause
                        </button>
                        <button class="btn btn-secondary" onclick="document.querySelector('iframe')?.requestFullscreen()">
                            <i class="fas fa-expand"></i> Fullscreen
                        </button>
                    </div>
                `;
                
                showToast("🎬 Now playing: " + movie.title, "success", 3000);
            } else {
                this.showError("No trailer available for this movie");
            }

        } catch (error) {
            console.error("Failed to load movie:", error);
            this.showError(error.message);
        }
    }

    getBestVideo(videos) {
        if (!videos || !videos.results) return null;
        
        // Priority order: Official Trailer > Trailer > Teaser > Any video
        const priority = [
            { type: "Trailer", official: true },
            { type: "Trailer", official: false },
            { type: "Teaser", official: true },
            { type: "Teaser", official: false },
            { type: "Clip", official: true },
            { type: "Clip", official: false },
            { type: "Featurette", official: true },
            { type: "Featurette", official: false },
        ];

        for (const criteria of priority) {
            const video = videos.results.find(
                v => v.site === "YouTube" && 
                     v.type === criteria.type && 
                     v.official === criteria.official
            );
            if (video) {
                return `https://www.youtube.com/embed/${video.key}`;
            }
        }

        // Fallback: any YouTube video
        const anyVideo = videos.results.find(v => v.site === "YouTube");
        if (anyVideo) {
            return `https://www.youtube.com/embed/${anyVideo.key}`;
        }

        return null;
    }

    setupControls() {
        // Back button
        document.getElementById("backBtn")?.addEventListener("click", () => {
            window.history.back();
        });

        // Mobile nav
        const toggle = document.getElementById("navToggle");
        const navCenter = document.querySelector(".nav-center");
        toggle?.addEventListener("click", () => {
            navCenter?.classList.toggle("open");
        });

        // Keyboard shortcuts
        document.addEventListener("keydown", (e) => {
            if (e.key === "f" || e.key === "F") {
                const iframe = document.querySelector('iframe');
                if (iframe) {
                    iframe.requestFullscreen().catch(() => {});
                }
            }
        });
    }

    showError(message) {
        const container = document.getElementById("playerContainer");
        if (container) {
            container.innerHTML = `
                <div class="player-error" style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 400px; gap: 16px; text-align: center; background: var(--bg-card); border-radius: 12px; padding: 40px;">
                    <i class="fas fa-exclamation-circle" style="font-size: 4rem; color: var(--accent);"></i>
                    <h2 style="color: var(--text-primary);">Something went wrong</h2>
                    <p style="color: var(--text-secondary);">${message || "Failed to load video"}</p>
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