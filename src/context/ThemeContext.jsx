import React,{createContext,useContext,useState,useEffect} from "react";
const ThemeContext=createContext(null);
export function ThemeProvider({children}){
  const [theme,setTheme]=useState(()=>localStorage.getItem("anitrack_theme")||"dark");
  useEffect(()=>{
    const root=document.documentElement;
    if(theme==="light"){root.classList.add("light-mode");root.classList.remove("dark-mode");}
    else{root.classList.remove("light-mode");root.classList.add("dark-mode");}
    localStorage.setItem("anitrack_theme",theme);
  },[theme]);
  const toggleTheme=()=>setTheme(t=>t==="dark"?"light":"dark");
  return <ThemeContext.Provider value={{theme,toggleTheme}}>{children}</ThemeContext.Provider>;
}
export function useTheme(){return useContext(ThemeContext);}
