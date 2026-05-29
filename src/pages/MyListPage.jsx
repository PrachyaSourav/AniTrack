import React, { useState, useMemo } from "react";
import { useList } from "../context/ListContext";
import ListItem from "../components/ListItem";
import AddEditModal from "../components/AddEditModal";
const STATUS_FILTERS=["All","Watching","Completed","Plan to Watch","On Hold","Dropped"];
const TYPE_FILTERS=["All Types","Anime","Manga","Manhwa","Manhua","Donghua","Light Novel","Web Novel","K-Drama","C-Drama","J-Drama","Thai Drama","Movie","TV Show"];
const SORT_OPTIONS=[{value:"addedAt",label:"Recently added"},{value:"rating",label:"Rating"},{value:"title",label:"Title A–Z"},{value:"progress",label:"Progress"}];
export default function MyListPage() {
  const { list } = useList();
  const [statusFilter,setStatusFilter]=useState("All");const [typeFilter,setTypeFilter]=useState("All Types");
  const [sortBy,setSortBy]=useState("addedAt");const [searchQ,setSearchQ]=useState("");const [modalItem,setModalItem]=useState(null);
  const filtered=useMemo(()=>{
    let items=[...list];
    if(statusFilter!=="All")items=items.filter(x=>x.status===statusFilter);
    if(typeFilter!=="All Types")items=items.filter(x=>x.type===typeFilter);
    if(searchQ.trim()){const q=searchQ.toLowerCase();items=items.filter(x=>x.title.toLowerCase().includes(q));}
    items.sort((a,b)=>{if(sortBy==="addedAt")return(b.addedAt||0)-(a.addedAt||0);if(sortBy==="rating")return(b.rating||0)-(a.rating||0);if(sortBy==="title")return a.title.localeCompare(b.title);if(sortBy==="progress"){const ap=a.total>0?a.progress/a.total:0;const bp=b.total>0?b.progress/b.total:0;return bp-ap;}return 0;});
    return items;
  },[list,statusFilter,typeFilter,sortBy,searchQ]);
  const counts=useMemo(()=>{const c={};STATUS_FILTERS.forEach(s=>{c[s]=s==="All"?list.length:list.filter(x=>x.status===s).length;});return c;},[list]);
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 fade-up">
      <div className="mb-8"><h1 className="text-3xl font-bold text-white mb-1" style={{fontFamily:"'Syne',sans-serif"}}>My List</h1><p className="text-white/40 text-sm">{list.length} item{list.length!==1?"s":""} tracked</p></div>
      <div className="flex flex-col gap-4 mb-6">
        <input type="text" value={searchQ} onChange={e=>setSearchQ(e.target.value)} placeholder="Search your list..." className="input"/>
        <div className="flex gap-2 flex-wrap">{STATUS_FILTERS.map(s=><button key={s} onClick={()=>setStatusFilter(s)} className={`chip flex items-center gap-1.5 ${statusFilter===s?"active":""}`}>{s}<span className="text-[10px] opacity-60">{counts[s]}</span></button>)}</div>
        <div className="flex gap-3 flex-wrap">
          <select value={typeFilter} onChange={e=>setTypeFilter(e.target.value)} className="input w-auto text-sm">{TYPE_FILTERS.map(t=><option key={t}>{t}</option>)}</select>
          <select value={sortBy} onChange={e=>setSortBy(e.target.value)} className="input w-auto text-sm">{SORT_OPTIONS.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}</select>
        </div>
      </div>
      {filtered.length===0?<div className="text-center py-20 text-white/30"><p className="text-4xl mb-3">{list.length===0?"📋":"🔍"}</p><p className="text-sm">{list.length===0?"Your list is empty. Head to Discover to add something!":"No items match your filters."}</p></div>
      :<div className="flex flex-col gap-3 stagger">{filtered.map(item=><ListItem key={item.id} item={item} onEdit={()=>setModalItem(item)}/>)}</div>}
      {modalItem&&<AddEditModal item={modalItem} onClose={()=>setModalItem(null)}/>}
    </div>
  );
}
