import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../utils/supabase";
import { useAuth } from "./AuthContext";

const ProfileContext = createContext(null);

export function ProfileProvider({ children }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setProfile(null); setLoading(false); return; }
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (data) {
      setProfile(data);
    } else {
      const username = user.email.split("@")[0].replace(/[^a-z0-9]/gi, "").toLowerCase() + Math.floor(Math.random() * 999);
      const { data: newProfile } = await supabase
        .from("profiles")
        .insert({ id: user.id, username, display_name: username, list_public: true })
        .select()
        .single();
      setProfile(newProfile);
    }
    setLoading(false);
  };

  const updateProfile = async (updates) => {
    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user.id)
      .select()
      .single();
    if (!error && data) setProfile(data);
    return { error };
  };

  return (
    <ProfileContext.Provider value={{ profile, loading, updateProfile, fetchProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  return useContext(ProfileContext);
}
