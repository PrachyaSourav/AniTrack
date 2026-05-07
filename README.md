# AniTrack 🎌

Your personal tracker for anime, manga, manhwa, manhua, movies, and TV shows.

## Phase 1 — Frontend (this repo)

### Getting started

**Prerequisites:** Node.js 18+ installed on your computer.  
Download from: https://nodejs.org

**Install & run:**

```bash
# 1. Navigate into the project folder
cd anitrack

# 2. Install dependencies
npm install

# 3. Start the development server
npm start
```

The app will open at **http://localhost:3000** in your browser.

---

## Project structure

```
anitrack/
├── public/
│   └── index.html          ← HTML shell, Google Fonts loaded here
├── src/
│   ├── components/
│   │   ├── Navbar.jsx       ← Top navigation bar
│   │   ├── MediaCard.jsx    ← Card shown in search results
│   │   ├── ListItem.jsx     ← Row shown in My List
│   │   └── AddEditModal.jsx ← Modal for add/edit/remove
│   ├── context/
│   │   └── ListContext.jsx  ← Global list state + localStorage
│   ├── pages/
│   │   ├── DiscoverPage.jsx ← Search & add media
│   │   ├── MyListPage.jsx   ← Your tracked list
│   │   ├── DashboardPage.jsx← Stats & analytics
│   │   └── ProfilePage.jsx  ← Profile & roadmap
│   ├── utils/
│   │   └── mockApi.js       ← Mock search data (replaced in Phase 3)
│   ├── App.jsx              ← Routes & providers
│   ├── index.js             ← React entry point
│   └── index.css            ← Tailwind + custom styles
├── tailwind.config.js
├── postcss.config.js
└── package.json
```

---

## Roadmap

| Phase | What | Status |
|-------|------|--------|
| 1 | Frontend UI (React + Tailwind) | ✅ Done |
| 2 | Auth + Database (Supabase) | 🔜 Next |
| 3 | Live APIs (Jikan + TMDB) | 🔜 |
| 4 | Deploy (Vercel) | 🔜 |

---

## Features

- **Discover** — search across anime, manga, manhwa, manhua, movies, TV shows
- **My List** — filter by status, type; sort by rating, title, progress, or date added
- **Add/Edit** — set status, track progress (ep/ch), rate out of 10, write notes
- **Dashboard** — stats: total tracked, completion rate, avg rating, type breakdown, top rated
- **Persistence** — your list auto-saves to localStorage (survives page refresh)
