import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import prettier from 'eslint-config-prettier';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig([
  globalIgnores([
    '**/dist/**',
    '**/dev-dist/**',
    '**/node_modules/**',
    'packages/shared/src/types/database.types.ts',
    'supabase/functions/**', // code Deno : vérifié par `deno check` (voir README)
    'scripts/test-charge/**', // script k6
  ]),

  {
    files: ['**/*.{ts,tsx}'],
    extends: [js.configs.recommended, tseslint.configs.recommended],
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/consistent-type-imports': 'error',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },

  // Application web
  {
    files: ['apps/web/**/*.{ts,tsx}'],
    extends: [reactHooks.configs.flat['recommended-latest'], reactRefresh.configs.vite],
    languageOptions: { globals: globals.browser },
    rules: {
      // Un domaine n'importe pas le code interne d'un autre domaine (§3.2)
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/features/*/components/*', '**/features/*/hooks/*'],
              message:
                'Ne pas importer les composants/hooks internes d’un autre domaine : remonter le code partagé dans components/ ou packages/shared.',
            },
          ],
        },
      ],
    },
  },

  // Scripts Node
  {
    files: ['scripts/**/*.ts', '*.config.{js,ts}', 'apps/web/vite.config.ts'],
    languageOptions: { globals: globals.node },
    rules: { 'no-console': 'off' },
  },

  prettier,
]);
