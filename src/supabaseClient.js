import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://daksha.jiobase.com";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4c3Bmd2pveHhtbHVod3Fic3ZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5OTIwMzMsImV4cCI6MjA4NjU2ODAzM30.BZftNzIUPWgLGi6BGYfGlD285MVO7vq3ESYj3XTfkH4";

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);
