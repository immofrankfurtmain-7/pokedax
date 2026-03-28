"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface PremiumState {
  isPremium: boolean;
  loading:   boolean;
  userId:    string | null;
}

export function usePremium(): PremiumState {
  const [state, setState] = useState<PremiumState>({
    isPremium: false,
    loading:   true,
    userId:    null,
  });

  useEffect(() => {
    const sb = createClient();
    sb.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        setState({ isPremium: false, loading: false, userId: null });
        return;
      }
      sb.from("profiles")
        .select("is_premium, premium_until")
        .eq("id", user.id)
        .single()
        .then(({ data }) => {
          // Check if premium_until is in the future
          const until = data?.premium_until
            ? new Date(data.premium_until)
            : null;
          const isPremium =
            data?.is_premium === true &&
            (until === null || until > new Date());

          setState({ isPremium, loading: false, userId: user.id });
        });
    });
  }, []);

  return state;
}
