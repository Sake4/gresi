/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_PUBLISHABLE_KEY: string;
  readonly VITE_ENV?: 'dev' | 'preprod' | 'prod';
  readonly VITE_DELAI_ANTI_REBOND_MS?: string;
  readonly VITE_DUREE_RESULTAT_MS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
