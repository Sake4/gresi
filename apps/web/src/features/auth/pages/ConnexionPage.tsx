import { messageErreur, schemaConnexion, type DonneesConnexion } from '@gresi/shared';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Link, Navigate } from 'react-router';
import { Alerte } from '@/components/ui/Alerte';
import { Bouton } from '@/components/ui/Bouton';
import { Carte } from '@/components/ui/Carte';
import { ChampTexte } from '@/components/ui/ChampTexte';
import { accueilPourRole } from '../accueil';
import { seConnecter } from '../api';
import { useSession } from '../hooks/useSession';

export default function ConnexionPage() {
  const { session, role, chargement } = useSession();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DonneesConnexion>({ resolver: zodResolver(schemaConnexion) });
  const connexion = useMutation({ mutationFn: seConnecter });

  // Déjà connecté (ou connexion réussie) : redirection selon le rôle
  if (session && !chargement) return <Navigate to={accueilPourRole(role)} replace />;

  return (
    <Carte titre="Connexion">
      <form className="flex flex-col gap-4" onSubmit={handleSubmit((d) => connexion.mutate(d))} noValidate>
        {connexion.isError && (
          <Alerte ton="erreur">
            {connexion.error.message === 'Invalid login credentials'
              ? 'Email ou mot de passe incorrect.'
              : messageErreur(connexion.error)}
          </Alerte>
        )}
        <ChampTexte
          libelle="Email"
          type="email"
          autoComplete="email"
          erreur={errors.email?.message}
          {...register('email')}
        />
        <ChampTexte
          libelle="Mot de passe"
          type="password"
          autoComplete="current-password"
          erreur={errors.motDePasse?.message}
          {...register('motDePasse')}
        />
        <Bouton type="submit" enCours={connexion.isPending} pleineLargeur>
          Se connecter
        </Bouton>
      </form>
      <div className="mt-4 flex justify-between text-sm">
        <Link to="/mot-de-passe-oublie" className="text-gresi-bleu hover:underline">
          Mot de passe oublié
        </Link>
        <Link to="/inscription" className="font-medium text-gresi-bleu hover:underline">
          Créer un compte
        </Link>
      </div>
    </Carte>
  );
}
