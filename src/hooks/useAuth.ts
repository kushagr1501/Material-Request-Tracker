import { useEffect, useState } from "react";
import { supabase } from "./../lib/supbase.ts";
import type { User } from "@supabase/supabase-js";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });


    //for my understanding when auth state changes ,supbase call all the registered callbacks and one of them is this
    
    supabase.auth.onAuthStateChange(
      (_event, session) => {
        if(session === null){
          setUser(null);
          return;
        }
        setUser(session.user);
    
      }
    );

  }, []);

  return { user, loading };
}
