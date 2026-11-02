import { Navigate } from "react-router-dom";
import type { RouteObject } from "react-router-dom";
import ActiviteDetailPage from "../activites/pages/ActiviteDetailPage";
import ActivitesPage from "../activites/pages/ActivitesPage";
import { EspaceParticipantRacine } from "./EspaceParticipantRacine";
import QrCodePage from "./pages/QrCodePage";

// Pages « enfants » de /mon-espace (à brancher dans router.tsx).
export const enfantsEspaceParticipant: RouteObject[] = [
  {
    element: <EspaceParticipantRacine />,
    children: [
      { index: true, element: <Navigate to="/mon-espace/activites" replace /> },
      { path: "activites", element: <ActivitesPage /> },
      { path: "activites/:activiteId", element: <ActiviteDetailPage /> },
      { path: "qr", element: <QrCodePage /> },
    ],
  },
];
