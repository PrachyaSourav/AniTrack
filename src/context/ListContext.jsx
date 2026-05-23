import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "../utils/supabase";
import { useAuth } from "./AuthContext";
const ListContext = createContext(null);
export function ListProvider({ children }) {
  const { user } = useAuth();
  const [list, setList] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const fromDb = (row) => ({ id: row.media_id, dbId: row.id, title: row.title, type: row.type, img: row.img, status: row.status, progress: row.progress, total: row.total, rating: row.rating, note: row.note, addedAt: new Date(row.added_at).getTime() });
  const fetchList = useCallback(async () => {
    if (!user) { setList([]); return; }
    setLoadingList(true);
    const { data, error } = await supabase.from("media_list").select("*").eq("user_id", user.id).order("added_at", { ascending: false });
    if (!error && data) setList(data.map(fromDb));
    setLoadingList(false);
  }, [user]);
  useEffect(() => { fetchList(); }, [fetchList]);
  const addOrUpdate = async (entry) => {
    if (!user) return;
    const existing = list.find(x => x.id === entry.id);
    if (existing?.dbId) {
      const { error } = await supabase.from("media_list").update({ status: entry.status, progress: entry.progress, total: entry.total, rating: entry.rating, note: entry.note, img: entry.img, updated_at: new Date().toISOString() }).eq("id", existing.dbId);
      if (!error) setList(prev => prev.map(x => x.id === entry.id ? { ...x, ...entry, dbId: existing.dbId } : x));
      return { error };
    } else {
      const { data, error } = await supabase.from("media_list").insert({ user_id: user.id, media_id: entry.id, title: entry.title, type: entry.type, img: entry.img||"", status: entry.status, progress: entry.progress||0, total: entry.total||0, rating: entry.rating||0, note: entry.note||"" }).select().single();
      if (!error && data) setList(prev => [fromDb(data), ...prev]);
      return { error };
    }
  };
  const remove = async (id) => {
    if (!user) return;
    const existing = list.find(x => x.id === id);
    if (!existing?.dbId) return;
    const { error } = await supabase.from("media_list").delete().eq("id", existing.dbId);
    if (!error) setList(prev => prev.filter(x => x.id !== id));
  };
  const getItem = (id) => list.find(x => x.id === id) || null;
  return <ListContext.Provider value={{ list, loadingList, addOrUpdate, remove, getItem, fetchList }}>{children}</ListContext.Provider>;
}
export function useList() { return useContext(ListContext); }
