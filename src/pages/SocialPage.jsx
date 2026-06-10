import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useProfile } from "../context/ProfileContext";
import { useNotifications } from "../context/NotificationContext";
import { useList } from "../context/ListContext";
import { searchUsers, getFriendships, sendFriendRequest, acceptFriendRequest, removeFriend, getUserList, getFriendshipStatus } from "../utils/friends";

function Avatar({ name, color = "#00C896", size = "w-10 h-10", text = "text-base" }) {
  return (
    <div className={`${size} rounded-full flex items-center justify-center font-bold ${text} flex-shrink-0`} style={{ background: color + "33", color }}>
      {(name || "?")[0].toUpperCase()}
    </div>
  );
}

function FriendListModal({ friend, onClose }) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { getUserList(friend.id).then((d) => { setList(d); setLoading(false); }); }, [friend.id]);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop bg-black/60" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-surface-2 border border-border rounded-2xl w-full max-w-lg shadow-2xl fade-up max-h-[80vh] flex flex-col">
        <div className="flex items-center gap-3 p-5 border-b border-border">
          <Avatar name={friend.display_name || friend.username} color={friend.avatar_color} />
          <div><p className="font-semibold text-white">{friend.display_name || friend.username}</p><p className="text-xs text-white/40">@{friend.username} · {list.length} items</p></div>
          <button onClick={onClose} className="ml-auto text-white/30 hover:text-white text-lg">✕</button>
        </div>
        <div className="overflow-y-auto flex-1 p-4 flex flex-col gap-3">
          {loading ? [...Array(4)].map((_, i) => <div key={i} className="skeleton h-14 rounded-xl" />) :
           list.length === 0 ? <p className="text-center text-white/30 text-sm py-8">Empty list.</p> :
           list.map((item) => (
            <div key={item.id} className="flex items-center gap-3 p-3 bg-surface-3 rounded-xl">
              <img src={item.img} alt={item.title} className="w-10 h-14 rounded-lg object-cover bg-surface-2 flex-shrink-0" onError={(e) => { e.target.style.display="none"; }} />
              <div className="flex-1 min-w-0"><p className="text-sm font-medium text-white/90 truncate">{item.title}</p><div className="flex items-center gap-2 mt-1"><span className="text-xs text-white/40">{item.status}</span>{item.rating > 0 && <span className="text-xs text-yellow-400">★ {item.rating}</span>}</div></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function SocialPage() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { addNotification } = useNotifications();
  const { list } = useList();
  const [tab, setTab] = useState("Friends");
  const [friendships, setFriendships] = useState([]);
  const [searchQ, setSearchQ] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [viewingFriend, setViewingFriend] = useState(null);
  const [copied, setCopied] = useState(false);
  const [statuses, setStatuses] = useState({});

  useEffect(() => { loadFriendships(); }, []);

  const loadFriendships = async () => { const data = await getFriendships(user.id); setFriendships(data); };

  const handleSearch = async () => {
    if (!searchQ.trim()) return;
    setSearching(true);
    const results = await searchUsers(searchQ);
    const filtered = results.filter((u) => u.id !== user.id);
    const statusMap = {};
    await Promise.all(filtered.map(async (u) => { const fs = await getFriendshipStatus(user.id, u.id); statusMap[u.id] = fs; }));
    setStatuses(statusMap);
    setSearchResults(filtered);
    setSearching(false);
  };

  const handleSendRequest = async (targetUser) => {
    const { error } = await sendFriendRequest(user.id, targetUser.id);
    if (!error) { await addNotification(targetUser.id, "friend_request", "New friend request", `${profile?.display_name || profile?.username} wants to follow you!`); setStatuses((p) => ({ ...p, [targetUser.id]: { status: "pending", requester_id: user.id } })); }
  };

  const handleAccept = async (friendship) => { await acceptFriendRequest(friendship.id); loadFriendships(); };
  const handleRemove = async (friendshipId) => { await removeFriend(friendshipId); loadFriendships(); };

  const shareUrl = `${window.location.origin}/user/${profile?.username}`;
  const handleCopy = () => { navigator.clipboard.writeText(shareUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  const accepted = friendships.filter((f) => f.status === "accepted");
  const pending = friendships.filter((f) => f.status === "pending");
  const incoming = pending.filter((f) => f.addressee_id === user.id);
  const outgoing = pending.filter((f) => f.requester_id === user.id);
  const getFriendProfile = (f) => f.requester_id === user.id ? f.addressee : f.requester;
  const stats = { completed: list.filter((x) => x.status === "Completed").length, watching: list.filter((x) => x.status === "Watching").length, total: list.length };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 fade-up">
      <div className="mb-8"><h1 className="text-3xl font-bold text-white mb-1" style={{ fontFamily: "'Syne', sans-serif" }}>Social</h1><p className="text-white/40 text-sm">Connect with friends and share your list</p></div>
      <div className="flex gap-2 mb-8 flex-wrap">
        {["Friends","Find People","Share My List"].map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`chip ${tab === t ? "active" : ""}`}>
            {t === "Friends" ? "👥" : t === "Find People" ? "🔍" : "🔗"} {t}
            {t === "Friends" && incoming.length > 0 && <span className="bg-accent text-surface text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-1">{incoming.length}</span>}
          </button>
        ))}
      </div>

      {tab === "Friends" && (
        <div className="flex flex-col gap-6">
          {incoming.length > 0 && (
            <div className="panel"><p className="section-label mb-4">📬 Requests ({incoming.length})</p>
              <div className="flex flex-col gap-3">{incoming.map((f) => { const fp = getFriendProfile(f); return (
                <div key={f.id} className="flex items-center gap-3"><Avatar name={fp?.display_name || fp?.username} color={fp?.avatar_color} /><div className="flex-1"><p className="text-sm font-medium text-white/90">{fp?.display_name}</p><p className="text-xs text-white/40">@{fp?.username}</p></div><button onClick={() => handleAccept(f)} className="btn-primary text-xs px-3 py-1.5">Accept</button><button onClick={() => handleRemove(f.id)} className="btn-ghost text-xs px-3 py-1.5">Decline</button></div>
              ); })}</div>
            </div>
          )}
          <div className="panel"><p className="section-label mb-4">👥 Friends ({accepted.length})</p>
            {accepted.length === 0 ? <div className="text-center py-8 text-white/30"><p className="text-3xl mb-2">👥</p><p className="text-sm">No friends yet.</p><button onClick={() => setTab("Find People")} className="btn-primary mt-4 text-sm">Find People</button></div> :
             <div className="flex flex-col gap-3">{accepted.map((f) => { const fp = getFriendProfile(f); return (
              <div key={f.id} className="flex items-center gap-3 p-3 bg-surface-3 rounded-xl"><Avatar name={fp?.display_name || fp?.username} color={fp?.avatar_color} /><div className="flex-1"><p className="text-sm font-medium text-white/90">{fp?.display_name}</p><p className="text-xs text-white/40">@{fp?.username}</p></div><button onClick={() => setViewingFriend(fp)} className="btn-ghost text-xs px-3 py-1.5">View List</button><button onClick={() => handleRemove(f.id)} className="text-xs text-red-400 px-2">Remove</button></div>
            ); })}</div>}
          </div>
        </div>
      )}

      {tab === "Find People" && (
        <div className="flex flex-col gap-6">
          <div className="flex gap-3"><input type="text" value={searchQ} onChange={(e) => setSearchQ(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSearch()} placeholder="Search by username..." className="input flex-1" /><button onClick={handleSearch} disabled={searching} className="btn-primary px-6">{searching ? "..." : "Search"}</button></div>
          {searchResults.length > 0 && <div className="panel flex flex-col gap-3">{searchResults.map((u) => { const fs = statuses[u.id]; const isFriend = fs?.status === "accepted"; const isPending = fs?.status === "pending"; const isRequester = fs?.requester_id === user.id; return (
            <div key={u.id} className="flex items-center gap-3"><Avatar name={u.display_name || u.username} color={u.avatar_color} /><div className="flex-1"><p className="text-sm font-medium text-white/90">{u.display_name}</p><p className="text-xs text-white/40">@{u.username}</p></div>
              {isFriend ? <span className="text-xs text-accent px-3">✓ Friends</span> : isPending && isRequester ? <span className="text-xs text-white/30 px-3">Pending...</span> : <button onClick={() => handleSendRequest(u)} className="btn-primary text-xs px-3 py-1.5">+ Follow</button>}
            </div>); })}</div>}
        </div>
      )}

      {tab === "Share My List" && (
        <div className="flex flex-col gap-6">
          <div className="panel"><p className="section-label mb-4">📊 Your stats</p>
            <div className="grid grid-cols-3 gap-4 mb-6">{[{label:"Total",value:stats.total},{label:"Completed",value:stats.completed},{label:"Watching",value:stats.watching}].map((s) => (<div key={s.label} className="bg-surface-3 rounded-xl p-4 text-center"><p className="text-2xl font-bold text-accent">{s.value}</p><p className="text-xs text-white/40 mt-1">{s.label}</p></div>))}</div>
            <p className="section-label mb-3">🔗 Your link</p>
            <div className="flex gap-3"><div className="input flex-1 text-white/50 text-sm truncate">{shareUrl}</div><button onClick={handleCopy} className="btn-primary px-4 flex-shrink-0">{copied ? "✓ Copied!" : "Copy"}</button></div>
          </div>
        </div>
      )}
      {viewingFriend && <FriendListModal friend={viewingFriend} onClose={() => setViewingFriend(null)} />}
    </div>
  );
}
