// Get embeddable trailer URL
getEmbedTrailerUrl(videos) {
    if (!videos || !videos.results) return null;
    
    let trailer = videos.results.find(
        v => v.type === "Trailer" && v.site === "YouTube" && v.official
    );
    
    if (!trailer) {
        trailer = videos.results.find(
            v => v.type === "Trailer" && v.site === "YouTube"
        );
    }
    
    if (!trailer) return null;
    return `https://www.youtube.com/embed/${trailer.key}`;
}