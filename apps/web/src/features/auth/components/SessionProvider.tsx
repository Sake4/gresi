import type { Session } from '@supabase/supabase-js';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState, type ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { chargerRole } from '../api';
import { ContexteSession } from '../contexte';

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [sessionChargee, setSessionChargee] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setSessionChargee(true);
    });
    const { data } = supabase.auth.onAuthStateChange((_evenement, nouvelleSession) => {
      setSession(nouvelleSession);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const userId = session?.user.id;
  const requeteRole = useQuery({
    queryKey: ['session', 'role', userId],
    queryFn: () => chargerRole(userId!),
    enabled: Boolean(userId),
    staleTime: Infinity,
  });

  const chargement = !sessionChargee || (Boolean(userId) && requeteRole.isPending);

  return (
    <ContexteSession.Provider value={{ session, role: requeteRole.data ?? null, chargement }}>
      {children}
    </ContexteSession.Provider>
  );
}
