import { useQuery } from '@tanstack/react-query';
import { chargerMaFiche, chargerMesCreneaux } from '../api';

export function useMaFiche() {
  return useQuery({ queryKey: ['espace-participant', 'fiche'], queryFn: chargerMaFiche });
}

export function useMesCreneaux() {
  return useQuery({ queryKey: ['espace-participant', 'creneaux'], queryFn: chargerMesCreneaux });
}
