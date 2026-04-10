"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
export function usePremium() {
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);
  useEffect(()=>{
    createClient().auth.getSession().then(async({data:{session}})=>{
      if(!session?.user){setLoading(false);return;}
      const{data}=await createClient().from("profiles").select("is_premium").eq("id",session.user.id).single();
      setIsPremium(data?.is_premium??false);
      setLoading(false);
    });
  },[]);
  return {isPremium, loading};
}
