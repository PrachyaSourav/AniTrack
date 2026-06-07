export function getRecommendations(userList) {
  if (!userList.length) return { topGenres:[], topTypes:[] };
  const genreScore={}, typeScore={};
  userList.forEach(item=>{
    const w=item.status==="Completed"?2:item.status==="Watching"?1.5:item.rating>=8?2:1;
    typeScore[item.type]=(typeScore[item.type]||0)+w;
  });
  return { topGenres:[], topTypes:Object.entries(typeScore).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([t])=>t) };
}
export function buildRecommendationReasons(userList) {
  return userList.filter(x=>x.status==="Completed"&&x.rating>=7).slice(0,3).map(x=>x.title);
}
