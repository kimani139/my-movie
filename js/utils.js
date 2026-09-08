// ===== UTILITY FUNCTIONS =====; export function debounce(func, wait) { let timeout; return function executedFunction(...args) { const later = () => { clearTimeout(timeout); func(...args); }; clearTimeout(timeout); timeout = setTimeout(later, wait); }; }; export function throttle(func, limit) { let inThrottle; return function(...args) { if (!inThrottle) { func.apply(this, args); inThrottle = true; setTimeout(() => inThrottle = false, limit); } }; }; export function showToast(message, type = "info", duration = 3000) { const toast = document.getElementById("toast"); if (!toast) { const newToast = document.createElement("div"); newToast.id = "toast"; newToast.className = "toast"; document.body.appendChild(newToast); return showToast(message, type, duration); } toast.textContent = message; toast.className = `toast ${type}`; toast.classList.add("show"); clearTimeout(toast._timeout); toast._timeout = setTimeout(() => { toast.classList.remove("show"); }, duration); }; export function formatDate(dateString) { if (!dateString) return "N/A"; try { const date = new Date(dateString); return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }); } catch { return "N/A"; } }; export function getYear(dateString) { if (!dateString) return "N/A"; try { return new Date(dateString).getFullYear(); } catch { return "N/A"; } }; export function truncateText(text, maxLength = 150) { if (!text) return ""; if (text.length <= maxLength) return text; return text.slice(0, maxLength).trim() + "..."; }; export function getRatingColor(rating) { if (!rating) return "#6b6b8a"; if (rating >= 8) return "#22c55e"; if (rating >= 6) return "#f5c518"; if (rating >= 4) return "#f97316"; return "#ef4444"; }; export function getQueryParam(key) { const params = new URLSearchParams(window.location.search); return params.get(key); }; export function isMobile() { return window.innerWidth <= 768; };
// ===== UTILITY FUNCTIONS =====

export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

export function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

export function showToast(message, type = "info", duration = 3000) {
    const toast = document.getElementById("toast");
    if (!toast) {
        const newToast = document.createElement("div");
        newToast.id = "toast";
        newToast.className = "toast";
        document.body.appendChild(newToast);
        return showToast(message, type, duration);
    }

    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.add("show");

    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
        toast.classList.remove("show");
    }, duration);
}

export function formatDate(dateString) {
    if (!dateString) return "N/A";
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric"
        });
    } catch {
        return "N/A";
    }
}

export function getYear(dateString) {
    if (!dateString) return "N/A";
    try {
        return new Date(dateString).getFullYear();
    } catch {
        return "N/A";
    }
}

export function truncateText(text, maxLength = 150) {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength).trim() + "...";
}

export function getRatingColor(rating) {
    if (!rating) return "#6b6b8a";
    if (rating >= 8) return "#22c55e";
    if (rating >= 6) return "#f5c518";
    if (rating >= 4) return "#f97316";
    return "#ef4444";
}

export function getQueryParam(key) {
    const params = new URLSearchParams(window.location.search);
    return params.get(key);
}

export function isMobile() {
    return window.innerWidth <= 768;
}