import React from "react";
import { useList } from "../context/ListContext";
import { useAuth } from "../context/AuthContext";
function PhaseCard({ phase, title, done, items }) {
  return (
    <div className={`p-4 rounded-xl border ${done?"border-accent/30 bg-accent/5":"border-border bg-surface-2"}`}>
      <div className="flex items-center gap-3 mb-2">
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${done?"bg-accent/20 text-accent":"bg-white/10 text-white/40"}`}>Phase {phase}</span>
        <span className={`text-xs font-semibold ${done?"text-accent":"text-white/60"}`}>{done?"✓ Complete":"Coming up"}</span>
      </div>
      <p className="text-sm font-medium text-white/80 mb-2">{title}</p>
      <ul className="text-xs text-white/40 space-y-1">{items.map(item=><li key={item}>• {item}</li>)}</ul>
    </div>
  );
}
export default function ProfilePage() {
  const { list } = useList();
  const { user, signOut } = useAuth();
  const avatar = user?.email?.[0]?.toUpperCase()||"U";
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 fade-up">
      <div className="mb-8"><h1 className="text-3xl font-bold text-white mb-1" style={{fontFamily:"'Syne',sans-serif"}}>Profile</h1></div>
      <div className="panel flex items-center gap-5 mb-6">
        <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center text-2xl font-bold text-accent flex-shrink-0" style={{fontFamily:"'Syne',sans-serif"}}>{avatar}</div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white text-lg truncate">{user?.email}</p>
          <p className="text-sm text-white/40">Tracking {list.length} item{list.length!==1?"s":""}</p>
          <p className="text-xs text-accent/60 mt-1">☁️ List synced to cloud</p>
        </div>
        <button onClick={signOut} className="btn-danger flex-shrink-0">Sign out</button>
      </div>
      <p className="section-label mb-4">Build roadmap</p>
      <div className="grid sm:grid-cols-2 gap-4 stagger">
        <PhaseCard phase={1} done title="Frontend UI" items={["React + Tailwind CSS","Discover / search page","My List with filters","Dashboard stats","Add/edit/remove modal"]}/>
        <PhaseCard phase={2} done title="Authentication + Database" items={["Supabase auth","Email/password login","Cloud database sync","Multi-device access"]}/>
        <PhaseCard phase={3} done title="Live API Search" items={["Jikan API for anime/manga/manhwa","OMDB for movies/TV/K-Drama","10 content types","Where to watch links"]}/>
        <PhaseCard phase={4} done title="Deployed on Vercel" items={["Live at ani-track-plum.vercel.app","Serverless Jikan proxy","SEO meta tags","Auto-deploy on push"]}/>
        <PhaseCard phase={5} done title="Trending & Upcoming" items={["Airing today schedule","Trending anime","This season picks","Upcoming releases","Dashboard widgets"]}/>
        <PhaseCard phase={6} title="Coming soon" items={["TMDB for movies/shows","Friend lists & social","Recommendations","Custom domain","PWA / mobile app"]}/>
      </div>
      <div className="panel mt-6">
        <p className="section-label mb-3">Tech stack</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[{name:"React 18",role:"UI framework",icon:"⚛️"},{name:"Tailwind CSS",role:"Styling",icon:"🎨"},{name:"Supabase",role:"Auth + DB",icon:"🔥"},{name:"Vercel",role:"Hosting",icon:"▲"}].map(t=>(
            <div key={t.name} className="bg-surface-3 rounded-lg p-3"><p className="text-xl mb-1">{t.icon}</p><p className="text-sm font-medium text-white/80">{t.name}</p><p className="text-xs text-white/30">{t.role}</p></div>
          ))}
        </div>
      </div>
    </div>
  );
}
