import { useNavigate } from 'react-router';
import { supabase } from '@/lib/supabase';
import { queryClient } from '@/lib/queryClient';

export function BoutonDeconnexion({ className = '' }: { className?: string }) {
  const navigate = useNavigate();

  async function handleDeconnexion() {
    await supabase.auth.signOut();
    queryClient.clear(); // aucune donnée du compte précédent ne reste en mémoire
    navigate('/connexion', { replace: true });
  }

  return (
    <button
      type="button"
      onClick={handleDeconnexion}
      className={`text-sm underline-offset-4 hover:underline ${className}`}
    >
      Se déconnecter
    </button>
  );
}
