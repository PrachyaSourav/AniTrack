import { createClient } from "@supabase/supabase-js";
const SUPABASE_URL = "https://xceliwjwhujowcdnwpbh.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhjZWxpd2p3aHVqb3djZG53cGJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwNjE0OTksImV4cCI6MjA5MzYzNzQ5OX0.O-if47LxATHYwbfFnyQ6qe8K7zMWKzr1feS7ZNWVGjc";
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
