import React, { useState, useEffect, useRef } from "react";
import MediaCard from "../components/MediaCard";
import AddEditModal from "../components/AddEditModal";
import { searchMedia, getAllTypes } from "../utils/api";
const TYPES = getAllTypes();
const API_SOURCE = { anime:"Jikan (MyAnimeList)", manga:"Jikan (MyAnimeList)", manhwa:"Jikan (MyAnimeList)", manhua:"Jikan (MyAnimeList)", donghua:"Jikan (MyAnimeList)", lightnovel:"Jikan (MyAnimeList)", webnovel:"Jikan (MyAnimeList)", kdrama:"OMDB (IMDb)", movie:"OMDB (IMDb)", show:"OMDB (IMDb)" };
export default function DiscoverPage() {
  const [query, setQuery] = useState(""); const [type, setType] = useState("anime");
  const [results, setResults] = useState([]); const [loading, setLoading] = useState(false);
  const [error, setError] = useState(""); const [modalItem, setModalItem] = useState(null);
  const debounceRef = useRef(null);
  useEffect(()=>{handleSearch("","anime");},[]);
  async function handleSearch(q=query,t=type){
    setLoading(true);setError("");
    try{const res=await searchMedia(q,t);setResults(res);if(res.length===0)setError("No results found. Try a specific title.");}
    catch{setError("Something went wrong. Please try again.");}
    setLoading(false);
  }
  function handleTypeChange(t){setType(t);setQuery("");setResults([]);handleSearch("",t);}
  function handleQueryChange(e){const val=e.target.value;setQuery(val);clearTimeout(debounceRef.current);debounceRef.current=setTimeout(()=>handleSearch(val,type),600);}
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 fade-up">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-1" style={{fontFamily:"'Syne',sans-serif"}}>Discover</h1>
        <p className="text-white/40 text-sm">Search anime, manga, novels, K-dramas, movies, and more.</p>
      </div>
      <div className="flex gap-3 mb-5">
        <div className="relative flex-1">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 select-none">🔍</span>
          <input type="text" value={query} onChange={handleQueryChange} onKeyDown={e=>{if(e.key==="Enter"){clearTimeout(debounceRef.current);handleSearch();}}} placeholder={`Search ${TYPES.find(t=>t.value===type)?.label||""}...`} className="input pl-10"/>
          {loading&&<span className="absolute right-3.5 top-1/2 -translate-y-1/2"><span className="w-4 h-4 border-2 border-white/10 border-t-accent rounded-full animate-spin block"/></span>}
        </div>
        <button onClick={()=>handleSearch()} disabled={loading} className="btn-primary px-6 flex-shrink-0 disabled:opacity-50">Search</button>
      </div>
      <div className="flex gap-2 mb-6 flex-wrap">
        {TYPES.map(t=><button key={t.value} onClick={()=>handleTypeChange(t.value)} className={`chip flex items-center gap-1.5 ${type===t.value?"active":""}`}><span>{t.emoji}</span>{t.label}</button>)}
      </div>
      {loading?<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 stagger">{[...Array(10)].map((_,i)=><div key={i}><div className="skeleton aspect-[2/3] rounded-xl mb-2"/><div className="skeleton h-3 w-3/4 rounded mb-1"/><div className="skeleton h-3 w-1/2 rounded"/></div>)}</div>
      :error?<div className="text-center py-20 text-white/30"><p className="text-4xl mb-3">🔎</p><p className="text-sm">{error}</p></div>
      :<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 stagger">{results.map(item=><MediaCard key={`${item.type}-${item.id}`} item={item} onAddClick={setModalItem}/>)}</div>}
      {!loading&&results.length>0&&<p className="mt-8 text-center text-xs text-white/20">📡 Data from {API_SOURCE[type]}</p>}
      {modalItem&&<AddEditModal item={modalItem} onClose={()=>setModalItem(null)}/>}
    </div>
  );
}
