import React, { createContext, useContext, useState, useEffect } from "react";

const ListContext = createContext(null);

// Demo seed data so the app feels alive on first load
const SEED = [
  {
    id: 1,
    title: "Attack on Titan",
    type: "Anime",
    status: "Completed",
    progress: 87,
    total: 87,
    rating: 9.5,
    note: "Incredible ending arc. A modern masterpiece.",
    img: "https://cdn.myanimelist.net/images/anime/10/47347.jpg",
    addedAt: Date.now() - 86400000 * 5,
  },
  {
    id: 2,
    title: "Berserk",
    type: "Manga",
    status: "Watching",
    progress: 210,
    total: 364,
    rating: 9,
    note: "Peak dark fantasy. Gut's journey is unmatched.",
    img: "https://cdn.myanimelist.net/images/manga/1/157897.jpg",
    addedAt: Date.now() - 86400000 * 3,
  },
  {
    id: 3,
    title: "Demon Slayer",
    type: "Anime",
    status: "Completed",
    progress: 44,
    total: 44,
    rating: 8.5,
    note: "Stunning animation, especially in Mugen Train.",
    img: "https://cdn.myanimelist.net/images/anime/1286/99889.jpg",
    addedAt: Date.now() - 86400000 * 7,
  },
  {
    id: 4,
    title: "Solo Leveling",
    type: "Manhwa",
    status: "Completed",
    progress: 179,
    total: 179,
    rating: 8,
    note: "Great power fantasy. Art is top tier.",
    img: "https://cdn.myanimelist.net/images/manga/3/222295.jpg",
    addedAt: Date.now() - 86400000 * 10,
  },
  {
    id: 5,
    title: "One Piece",
    type: "Anime",
    status: "Watching",
    progress: 1100,
    total: 0,
    rating: 9,
    note: "The journey IS the destination.",
    img: "https://cdn.myanimelist.net/images/anime/6/73245.jpg",
    addedAt: Date.now() - 86400000 * 1,
  },
  {
    id: 6,
    title: "Vinland Saga",
    type: "Anime",
    status: "Plan to Watch",
    progress: 0,
    total: 48,
    rating: 0,
    note: "",
    img: "https://cdn.myanimelist.net/images/anime/1500/103005.jpg",
    addedAt: Date.now() - 86400000 * 2,
  },
];

export function ListProvider({ children }) {
  const [list, setList] = useState(() => {
    try {
      const saved = localStorage.getItem("anitrack_list");
      return saved ? JSON.parse(saved) : SEED;
    } catch {
      return SEED;
    }
  });

  // Persist to localStorage whenever list changes
  useEffect(() => {
    localStorage.setItem("anitrack_list", JSON.stringify(list));
  }, [list]);

  const addOrUpdate = (entry) => {
    setList((prev) => {
      const idx = prev.findIndex((x) => x.id === entry.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...entry, updatedAt: Date.now() };
        return next;
      }
      return [{ ...entry, addedAt: Date.now() }, ...prev];
    });
  };

  const remove = (id) => {
    setList((prev) => prev.filter((x) => x.id !== id));
  };

  const getItem = (id) => list.find((x) => x.id === id) || null;

  return (
    <ListContext.Provider value={{ list, addOrUpdate, remove, getItem }}>
      {children}
    </ListContext.Provider>
  );
}

export function useList() {
  return useContext(ListContext);
}
