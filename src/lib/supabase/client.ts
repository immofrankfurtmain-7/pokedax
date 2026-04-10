import { createClient as c } from "@supabase/supabase-js";
export function createClient() {
  return c(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
}