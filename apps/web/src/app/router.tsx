import { createBrowserRouter } from 'react-router';
import { MiseEnPageParticipant } from '@/components/layout/MiseEnPageParticipant';
import { MiseEnPagePublique } from '@/components/layout/MiseEnPagePublique';
import { MiseEnPageScan } from '@/components/layout/MiseEnPageScan';
import ActivitesPage from '@/features/activites/pages/ActivitesPage';
import GestionActivitesPage from '@/features/admin/gestion-activites/pages/GestionActivitesPage';
import JournalPage from '@/features/admin/journal/pages/JournalPage';
import ParticipantsPage from '@/features/admin/participants/pages/ParticipantsPage';
import PersonnelPage from '@/features/admin/personnel/pages/PersonnelPage';
import StatistiquesPage from '@/features/admin/statistiques/pages/StatistiquesPage';
import GestionAnnoncesPage from '@/features/annonces/pages/GestionAnnoncesPage';
import ConnexionPage from '@/features/auth/pages/ConnexionPage';
import FinaliserInscriptionPage from '@/features/auth/pages/FinaliserInscriptionPage';
import InscriptionPage from '@/features/auth/pages/InscriptionPage';
import MotDePasseOubliePage from '@/features/auth/pages/MotDePasseOubliePage';
import MonEspacePage from '@/features/espace-participant/pages/MonEspacePage';
import QrPage from '@/features/espace-participant/pages/QrPage';
import ScanPage from '@/features/scan/pages/ScanPage';
import { RequireRole } from './guards/RequireRole';
import { Accueil, EspaceAdmin, PageIntrouvable } from './RoutesSpeciales';

/** Toutes les routes de l'application (cahier des charges technique §3.3) */
export const router = createBrowserRouter([
  { path: '/', element: <Accueil /> },

  // Public
  {
    element: <MiseEnPagePublique />,
    children: [
      { path: '/connexion', element: <ConnexionPage /> },
      { path: '/inscription', element: <InscriptionPage /> },
      { path: '/inscription/finaliser', element: <FinaliserInscriptionPage /> },
      { path: '/mot-de-passe-oublie', element: <MotDePasseOubliePage /> },
    ],
  },

  // Participant
  {
    path: '/mon-espace',
    element: (
      <RequireRole roles={['participant']}>
        <MiseEnPageParticipant />
      </RequireRole>
    ),
    children: [
      { index: true, element: <MonEspacePage /> },
      { path: 'activites', element: <ActivitesPage /> },
      { path: 'qr', element: <QrPage /> },
    ],
  },

  // Distributeur
  {
    path: '/scan',
    element: (
      <RequireRole roles={['distributeur']}>
        <MiseEnPageScan />
      </RequireRole>
    ),
    children: [{ index: true, element: <ScanPage /> }],
  },

  // Admin et admin supérieur
  {
    path: '/admin',
    element: <EspaceAdmin />,
    children: [
      { index: true, element: <StatistiquesPage /> },
      { path: 'participants', element: <ParticipantsPage /> },
      { path: 'annonces', element: <GestionAnnoncesPage /> },
      {
        path: 'activites',
        element: (
          <RequireRole roles={['admin_superieur']}>
            <GestionActivitesPage />
          </RequireRole>
        ),
      },
      {
        path: 'personnel',
        element: (
          <RequireRole roles={['admin_superieur']}>
            <PersonnelPage />
          </RequireRole>
        ),
      },
      {
        path: 'journal',
        element: (
          <RequireRole roles={['admin_superieur']}>
            <JournalPage />
          </RequireRole>
        ),
      },
    ],
  },

  { path: '*', element: <PageIntrouvable /> },
]);
