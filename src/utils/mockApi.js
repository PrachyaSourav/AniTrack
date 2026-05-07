// Phase 3 will replace this with real Jikan + TMDB API calls.
// For now these simulate what the API would return so the UI is fully functional.

const MOCK_DB = {
  anime: [
    { id: 101, title: "Attack on Titan", type: "Anime", score: 9.0, episodes: 87, year: 2013, img: "https://cdn.myanimelist.net/images/anime/10/47347.jpg", genres: ["Action", "Drama"] },
    { id: 102, title: "Fullmetal Alchemist: Brotherhood", type: "Anime", score: 9.1, episodes: 64, year: 2009, img: "https://cdn.myanimelist.net/images/anime/1223/96541.jpg", genres: ["Action", "Adventure"] },
    { id: 103, title: "Jujutsu Kaisen", type: "Anime", score: 8.7, episodes: 48, year: 2020, img: "https://cdn.myanimelist.net/images/anime/1171/109222.jpg", genres: ["Action", "Supernatural"] },
    { id: 104, title: "Hunter x Hunter (2011)", type: "Anime", score: 9.0, episodes: 148, year: 2011, img: "https://cdn.myanimelist.net/images/anime/1337/99013.jpg", genres: ["Action", "Adventure"] },
    { id: 105, title: "Demon Slayer", type: "Anime", score: 8.6, episodes: 44, year: 2019, img: "https://cdn.myanimelist.net/images/anime/1286/99889.jpg", genres: ["Action", "Supernatural"] },
    { id: 106, title: "Vinland Saga", type: "Anime", score: 8.7, episodes: 48, year: 2019, img: "https://cdn.myanimelist.net/images/anime/1500/103005.jpg", genres: ["Action", "History"] },
    { id: 107, title: "Steins;Gate", type: "Anime", score: 9.1, episodes: 24, year: 2011, img: "https://cdn.myanimelist.net/images/anime/5/73199.jpg", genres: ["Sci-Fi", "Thriller"] },
    { id: 108, title: "One Piece", type: "Anime", score: 8.7, episodes: 0, year: 1999, img: "https://cdn.myanimelist.net/images/anime/6/73245.jpg", genres: ["Action", "Adventure"] },
    { id: 109, title: "Cowboy Bebop", type: "Anime", score: 8.8, episodes: 26, year: 1998, img: "https://cdn.myanimelist.net/images/anime/4/19644.jpg", genres: ["Action", "Sci-Fi"] },
    { id: 110, title: "Chainsaw Man", type: "Anime", score: 8.6, episodes: 12, year: 2022, img: "https://cdn.myanimelist.net/images/anime/1806/126216.jpg", genres: ["Action", "Horror"] },
  ],
  manga: [
    { id: 201, title: "Berserk", type: "Manga", score: 9.4, episodes: 364, year: 1989, img: "https://cdn.myanimelist.net/images/manga/1/157897.jpg", genres: ["Action", "Dark Fantasy"] },
    { id: 202, title: "Vagabond", type: "Manga", score: 9.1, episodes: 327, year: 1998, img: "https://cdn.myanimelist.net/images/manga/1/259070.jpg", genres: ["Action", "Historical"] },
    { id: 203, title: "Chainsaw Man", type: "Manga", score: 8.7, episodes: 165, year: 2018, img: "https://cdn.myanimelist.net/images/manga/3/216464.jpg", genres: ["Action", "Horror"] },
    { id: 204, title: "One Piece", type: "Manga", score: 9.2, episodes: 1100, year: 1997, img: "https://cdn.myanimelist.net/images/manga/2/253146.jpg", genres: ["Adventure", "Comedy"] },
    { id: 205, title: "Vinland Saga", type: "Manga", score: 8.9, episodes: 204, year: 2005, img: "https://cdn.myanimelist.net/images/manga/2/188925.jpg", genres: ["Action", "Historical"] },
    { id: 206, title: "Jujutsu Kaisen", type: "Manga", score: 8.6, episodes: 250, year: 2018, img: "https://cdn.myanimelist.net/images/manga/3/237253.jpg", genres: ["Action", "Supernatural"] },
  ],
  manhwa: [
    { id: 301, title: "Solo Leveling", type: "Manhwa", score: 8.5, episodes: 179, year: 2018, img: "https://cdn.myanimelist.net/images/manga/3/222295.jpg", genres: ["Action", "Fantasy"] },
    { id: 302, title: "Tower of God", type: "Manhwa", score: 8.3, episodes: 550, year: 2010, img: "https://cdn.myanimelist.net/images/manga/2/177123.jpg", genres: ["Action", "Fantasy"] },
    { id: 303, title: "The God of High School", type: "Manhwa", score: 8.0, episodes: 570, year: 2011, img: "https://cdn.myanimelist.net/images/manga/2/235823.jpg", genres: ["Action", "Martial Arts"] },
  ],
  manhua: [
    { id: 401, title: "Battle Through the Heavens", type: "Manhua", score: 7.5, episodes: 500, year: 2016, img: "https://cdn.myanimelist.net/images/manga/2/214860.jpg", genres: ["Action", "Fantasy"] },
    { id: 402, title: "Martial Peak", type: "Manhua", score: 7.8, episodes: 3600, year: 2019, img: "https://cdn.myanimelist.net/images/manga/1/216185.jpg", genres: ["Action", "Fantasy"] },
  ],
  movie: [
    { id: 501, title: "Your Name", type: "Movie", score: 9.0, episodes: 1, year: 2016, img: "https://cdn.myanimelist.net/images/anime/5/87048.jpg", genres: ["Romance", "Supernatural"] },
    { id: 502, title: "Spirited Away", type: "Movie", score: 9.1, episodes: 1, year: 2001, img: "https://cdn.myanimelist.net/images/anime/6/79597.jpg", genres: ["Fantasy", "Adventure"] },
    { id: 503, title: "Princess Mononoke", type: "Movie", score: 8.9, episodes: 1, year: 1997, img: "https://cdn.myanimelist.net/images/anime/7/75919.jpg", genres: ["Fantasy", "Adventure"] },
    { id: 504, title: "Akira", type: "Movie", score: 8.1, episodes: 1, year: 1988, img: "https://cdn.myanimelist.net/images/anime/7/83541.jpg", genres: ["Sci-Fi", "Action"] },
  ],
  show: [
    { id: 601, title: "Breaking Bad", type: "TV Show", score: 9.5, episodes: 62, year: 2008, img: "https://m.media-amazon.com/images/M/MV5BYmQ4YWMxYjUtNjZmYi00MDdmLWJjOTUtYjc1NjMyZjkzNTJlXkEyXkFqcGdeQXVyMTMzNDExODE5._V1_FMjpg_UX640_.jpg", genres: ["Crime", "Drama"] },
    { id: 602, title: "Arcane", type: "TV Show", score: 9.0, episodes: 18, year: 2021, img: "https://m.media-amazon.com/images/M/MV5BYmU5OWM4ZmMtZjU2NC00NmE4LWFmNDYtNWU3MDY5NWI4NzUyXkEyXkFqcGdeQXVyMTkxNjUyNQ@@._V1_FMjpg_UX640_.jpg", genres: ["Action", "Fantasy"] },
    { id: 603, title: "The Last of Us", type: "TV Show", score: 8.7, episodes: 17, year: 2023, img: "https://m.media-amazon.com/images/M/MV5BZGUzYTI3M2EtZmM0Yy00NGUyLWI4ODEtN2Q3ZGJlYzhhZjU3XkEyXkFqcGdeQXVyNTM0OTY1OQ@@._V1_FMjpg_UX640_.jpg", genres: ["Drama", "Horror"] },
    { id: 604, title: "Cyberpunk: Edgerunners", type: "TV Show", score: 8.7, episodes: 10, year: 2022, img: "https://cdn.myanimelist.net/images/anime/1818/126435.jpg", genres: ["Action", "Sci-Fi"] },
  ],
};

// Simulate async search with slight delay (like a real API)
export async function searchMedia(query, type) {
  await new Promise((r) => setTimeout(r, 400));
  const pool = MOCK_DB[type] || [];
  if (!query.trim()) return pool.slice(0, 8);
  const q = query.toLowerCase();
  return pool.filter((item) => item.title.toLowerCase().includes(q));
}

export function getAllTypes() {
  return [
    { value: "anime", label: "Anime" },
    { value: "manga", label: "Manga" },
    { value: "manhwa", label: "Manhwa" },
    { value: "manhua", label: "Manhua" },
    { value: "movie", label: "Movies" },
    { value: "show", label: "TV Shows" },
  ];
}
