// ===== VITE ENTRY POINT =====
import "./config.js";
import "./api.js";
import "./favorites.js";
import "./utils.js";
import "./search.js";
import "./app.js";

export { movieAPI } from "./api.js";
export { favoritesService } from "./favorites.js";
export { initSearch, getSearchManager } from "./search.js";