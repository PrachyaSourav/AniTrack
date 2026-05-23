import React, { useState } from "react";
import { useList } from "../context/ListContext";
export default function MediaCard({ item, onAddClick }) {
  const { getItem } = useList();
  const [imgError, setImgError] = useState(!item.img);
  const [showLinks, setShowLinks] = useState(false);
  const existing = getItem(item.id);
  const statusColor = { Watching:"text-blue-400", Completed:"text-accent", Dropped:"text-red-400", "Plan to Watch":"text-yellow-400", "On Hold":"text-purple-400" };
  return (
    <div className="media-card group flex flex-col">
      <div className="relative aspect-[2/3] overflow-hidden bg-surface-3 cursor-pointer" onClick={()=>onAddClick(item)}>
        {!imgError?<img src={item.img} alt={item.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" onError={()=>setImgError(true)}/>:<div className="w-full h-full flex flex-col items-center justify-center text-white/15 gap-2 bg-surface-3"><span className="text-3xl">{item.type==="Anime"||item.type==="Donghua"?"🎌":item.type==="K-Drama"?"🎭":item.type==="Movie"?"🎬":item.type==="TV Show"?"📺":item.type==="Light Novel"||item.type==="Web Novel"?"📖":"📚"}</span><span className="text-[10px] text-white/20 text-center px-2">{item.title}</span></div>}
        {item.score>0&&<div className="absolute top-2 left-2 bg-black/70 text-yellow-400 text-xs font-semibold px-2 py-0.5 rounded-md">★ {item.score}</div>}
        {existing&&<div className={`absolute top-2 right-2 text-xs font-medium px-2 py-0.5 rounded-md bg-black/70 ${statusColor[existing.status]||"text-white/60"}`}>{existing.status==="Plan to Watch"?"Planned":existing.status}</div>}
        <div className="absolute inset-0 bg-accent/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><div className="bg-accent text-surface text-xs font-bold px-3 py-1.5 rounded-full">{existing?"Edit":"+ Add"}</div></div>
      </div>
      <div className="p-2.5 flex flex-col flex-1">
        <p className="text-sm font-medium text-white/90 leading-tight line-clamp-2 mb-1 cursor-pointer hover:text-white" onClick={()=>onAddClick(item)}>{item.title}</p>
        <div className="flex items-center justify-between mb-2">
          <span className="badge badge-type">{item.type}</span>
          <span className="text-[11px] text-white/30">{item.episodes>1?`${item.episodes} ep`:item.episodes===1?"Film":"Ongoing"}</span>
        </div>
        {item.streamLinks?.length>0&&<div className="mt-auto">
          <button onClick={e=>{e.stopPropagation();setShowLinks(v=>!v);}} className="w-full text-xs py-1.5 rounded-lg border border-border hover:border-accent/40 hover:text-accent text-white/40 transition-all">{showLinks?"Hide links ▲":"▶ Where to watch"}</button>
          {showLinks&&<div className="mt-2 flex flex-col gap-1">{item.streamLinks.map(link=><a key={link.name} href={link.url} target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-surface-3 hover:bg-white/10 text-xs text-white/70 hover:text-white transition-all"><span>{link.icon}</span><span>{link.name}</span><span className="ml-auto text-white/20">↗</span></a>)}</div>}
        </div>}
      </div>
    </div>
  );
}
