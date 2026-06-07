import React, { useState, useEffect } from "react";
import { useList } from "../context/ListContext";

const STATUSES = ["Watching","Completed","Plan to Watch","On Hold","Dropped"];

function StarRating({value,onChange}) {
  const [hover,setHover]=useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1,2,3,4,5,6,7,8,9,10].map(n=>(
        <button key={n} type="button" className={`text-lg transition-colors ${n<=(hover||value)?"text-yellow-400":"text-white/15"}`}
          onMouseEnter={()=>setHover(n)} onMouseLeave={()=>setHover(0)} onClick={()=>onChange(n)}>★</button>
      ))}
      {value>0&&<span className="ml-2 text-sm" style={{color:"var(--text3)"}}>{value}/10</span>}
    </div>
  );
}

export default function AddEditModal({item,onClose}) {
  const {addOrUpdate,getItem,remove}=useList();
  const existing=item?getItem(item.id):null;
  const [status,setStatus]=useState(existing?.status||"Plan to Watch");
  const [progress,setProgress]=useState(existing?.progress??0);
  const [total,setTotal]=useState(existing?.total??item?.episodes??0);
  const [rating,setRating]=useState(existing?.rating??0);
  const [note,setNote]=useState(existing?.note??"");

  useEffect(()=>{
    const handler=(e)=>{if(e.key==="Escape")onClose();};
    document.addEventListener("keydown",handler);
    return()=>document.removeEventListener("keydown",handler);
  },[onClose]);

  if(!item)return null;
  const pct=total>0?Math.min(100,Math.round((progress/total)*100)):0;
  const statusColors={"Watching":"bg-blue-500/20 text-blue-300 border-blue-500/30","Completed":"bg-accent/20 text-accent border-accent/30","Plan to Watch":"bg-yellow-500/20 text-yellow-300 border-yellow-500/30","On Hold":"bg-purple-500/20 text-purple-300 border-purple-500/30","Dropped":"bg-red-500/20 text-red-300 border-red-500/30"};

  const handleSave=()=>{
    addOrUpdate({id:item.id,title:item.title,type:item.type,img:item.img,total,status,progress,rating,note});
    onClose();
  };
  const handleRemove=()=>{remove(item.id);onClose();};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop bg-black/60"
      onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div className="rounded-2xl w-full max-w-md shadow-2xl fade-up" style={{background:"var(--bg2)",border:"0.5px solid var(--border2)"}}>
        <div className="flex items-start gap-4 p-5" style={{borderBottom:"0.5px solid var(--border)"}}>
          <img src={item.img} alt={item.title} className="w-14 h-20 rounded-lg object-cover flex-shrink-0" style={{background:"var(--bg3)"}} onError={e=>{e.target.style.display="none";}}/>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-base leading-tight" style={{color:"var(--text)"}}>{item.title}</p>
            <span className="badge badge-type mt-1.5">{item.type}</span>
          </div>
          <button onClick={onClose} className="text-lg leading-none flex-shrink-0" style={{color:"var(--text3)"}}>✕</button>
        </div>
        <div className="p-5 flex flex-col gap-5">
          <div>
            <label className="section-label block mb-2">Status</label>
            <div className="flex flex-wrap gap-2">
              {STATUSES.map(s=>(
                <button key={s} type="button" onClick={()=>setStatus(s)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all ${status===s?statusColors[s]:"border-border text-text3 hover:border-border-hover"}`}
                  style={status!==s?{borderColor:"var(--border2)",color:"var(--text3)"}:{}}>{s}</button>
              ))}
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="section-label">Progress</label>
              {total>0&&<span className="text-xs" style={{color:"var(--text3)"}}>{pct}%</span>}
            </div>
            <div className="flex items-center gap-3">
              <input type="number" value={progress} min={0} onChange={e=>setProgress(Number(e.target.value))} className="input w-20 text-center"/>
              <span style={{color:"var(--text3)"}}>/</span>
              <input type="number" value={total} min={0} onChange={e=>setTotal(Number(e.target.value))} className="input w-20 text-center"/>
            </div>
            {total>0&&<div className="progress-bar mt-2"><div className="progress-fill" style={{width:`${pct}%`}}/></div>}
          </div>
          <div>
            <label className="section-label block mb-2">Your Rating</label>
            <StarRating value={rating} onChange={setRating}/>
            {rating>0&&<button type="button" onClick={()=>setRating(0)} className="text-xs mt-1.5 transition-colors" style={{color:"var(--text3)"}}>Clear rating</button>}
          </div>
          <div>
            <label className="section-label block mb-2">Notes</label>
            <textarea value={note} onChange={e=>setNote(e.target.value)} placeholder="Your thoughts..." rows={3} className="input resize-none"/>
          </div>
        </div>
        <div className="flex items-center gap-3 px-5 pb-5">
          {existing&&<button onClick={handleRemove} className="btn-danger">Remove</button>}
          <div className="flex-1"/>
          <button onClick={onClose} className="btn-ghost">Cancel</button>
          <button onClick={handleSave} className="btn-primary">{existing?"Update":"Add to List"}</button>
        </div>
      </div>
    </div>
  );
}
