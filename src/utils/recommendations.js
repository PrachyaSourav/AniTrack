// Recommendation engine — suggests titles based on user's list
// Uses genre matching and score weighting

export function getRecommendations(userList, searchResults = []) {
  if (userList.length === 0) return [];

  // Build genre preference map from completed/watching items
  const genreScore = {};
  const typeScore = {};
  const seenIds = new Set(userList.map((x) => x.id));

  userList.forEach((item) => {
    const weight = item.status === "Completed" ? 2 :
                   item.status === "Watching" ? 1.5 :
                   item.rating >= 8 ? 2 : 1;

    // Type preference
    typeScore[item.type] = (typeScore[item.type] || 0) + weight;

    // Genre preference from title keywords
    const titleLower = (item.title || "").toLowerCase();
    const inferredGenres = [];
    if (titleLower.includes("sword") || titleLower.includes("blade")) inferredGenres.push("Action");
    if (titleLower.includes("love") || titleLower.includes("heart")) inferredGenres.push("Romance");
    if (titleLower.includes("demon") || titleLower.includes("devil")) inferredGenres.push("Supernatural");
    if (titleLower.includes("hero") || titleLower.includes("hero")) inferredGenres.push("Action");
    inferredGenres.forEach((g) => { genreScore[g] = (genreScore[g] || 0) + weight; });
  });

  // Top genres and types
  const topGenres = Object.entries(genreScore).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([g]) => g);
  const topTypes = Object.entries(typeScore).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([t]) => t);

  return { topGenres, topTypes };
}

// Build "because you watched X" recommendations
export function buildRecommendationReasons(userList) {
  const completed = userList.filter((x) => x.status === "Completed" && x.rating >= 7);
  const watching = userList.filter((x) => x.status === "Watching");
  const sample = [...completed, ...watching].slice(0, 3);
  return sample.map((x) => x.title);
}

// Score a search result against user preferences
export function scoreItem(item, topGenres, userList) {
  let score = item.score || 0;
  const seenIds = new Set(userList.map((x) => x.id));
  if (seenIds.has(item.id)) return -1; // already in list

  // Boost if genres match preferences
  (item.genres || []).forEach((g) => {
    if (topGenres.includes(g)) score += 1;
  });

  return score;
}
