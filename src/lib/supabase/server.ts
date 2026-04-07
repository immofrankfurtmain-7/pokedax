import { createServerClient } from "@supabase/ssr";
import { createClient as createAnonClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

// Standard server client (for Server Components, uses cookies)
export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(c) {
          try { c.forEach(({name,value,options}) => cookieStore.set(name,value,options)); }
          catch {}
        },
      },
    }
  );
}

// Route handler client: tries cookie auth first, then Bearer token from header
export async function createRouteClient(request?: NextRequest) {
  const cookieStore = await cookies();
  const client = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(c) {
          try { c.forEach(({name,value,options}) => cookieStore.set(name,value,options)); }
          catch {}
        },
      },
    }
  );

  // If a request is provided, also try Bearer token auth
  if (request) {
    const authHeader = request.headers.get("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.slice(7);
      const { data: { user } } = await client.auth.getUser(token);
      if (user) {
        // Return a client with this user's token set
        const tokenClient = createAnonClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          { global: { headers: { Authorization: `Bearer ${token}` } } }
        );
        return tokenClient;
      }
    }
  }

  return client;
}
