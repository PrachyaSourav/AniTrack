import React,{createContext,useContext,useState,useEffect} from "react";
import {supabase} from "../utils/supabase";
const AuthContext=createContext(null);
export function AuthProvider({children}){
  const [user,setUser]=useState(null);
  const [loading,setLoading]=useState(true);
  useEffect(()=>{
    supabase.auth.getSession().then(({data:{session}})=>{setUser(session?.user??null);setLoading(false);});
    const {data:{subscription}}=supabase.auth.onAuthStateChange((_,session)=>{setUser(session?.user??null);});
    return ()=>subscription.unsubscribe();
  },[]);
  const signUp=async(e,p)=>{const{data,error}=await supabase.auth.signUp({email:e,password:p});return{data,error};};
  const signIn=async(e,p)=>{const{data,error}=await supabase.auth.signInWithPassword({email:e,password:p});return{data,error};};
  const signOut=async()=>{await supabase.auth.signOut();};
  return <AuthContext.Provider value={{user,loading,signUp,signIn,signOut}}>{children}</AuthContext.Provider>;
}
export function useAuth(){return useContext(AuthContext);}
