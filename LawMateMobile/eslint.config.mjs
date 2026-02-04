// eslint.config.mjs
import { defineConfig } from 'eslint/config';
import expoConfig from 'eslint-config-expo/flat.js';
import pluginI18nJson from 'eslint-plugin-i18n-json';
import pluginUnicorn from 'eslint-plugin-unicorn';
import pluginUnusedImports from 'eslint-plugin-unused-imports';
import tseslint from 'typescript-eslint';

export default defineConfig([
  expoConfig,
  ...tseslint.configs.recommended,

  {
    name: 'custom-rules',
    plugins: {
      unicorn: pluginUnicorn,
      'unused-imports': pluginUnusedImports,
      'i18n-json': pluginI18nJson,
    },

    settings: {
      'import/resolver': {
        typescript: {
          project: './tsconfig.json',
        },
      },
    },

    rules: {
      // General
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-console': 'warn',

      // React Hooks
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // ✅ Import order
      'import/order': [
        'error',
        {
          groups: [
            "builtin", // React is treated as a built-in module
            "external", // External npm modules
            "internal", // Internal project modules (like @assets)
            ["parent", "sibling", "index"], // Parent, sibling, and index files
            "object", // Imports with object destructuring
            "type", // Type-only imports
          ],
          pathGroups: [
            {
              pattern: 'react',
              group: 'external',
              position: 'before',
            },
            {
              pattern: 'react-native',
              group: 'external',
              position: 'before',
            },
          ],
          pathGroupsExcludedImportTypes: ['react'],
          alphabetize: { order: 'asc', caseInsensitive: true },
          'newlines-between': 'never', // no empty lines required
        },
      ],

      // Unicorn plugin
      'unicorn/prevent-abbreviations': 'off',
      'unicorn/filename-case': [
        'warn',
        { cases: { camelCase: true, pascalCase: true } },
      ],

      // Unused imports
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        { vars: 'all', varsIgnorePattern: '^_', argsIgnorePattern: '^_' },
      ],

      // i18n JSON validation
      'i18n-json/valid-message-syntax': 'error',
    },

    ignores: ['dist/*', 'build/*', 'node_modules/*'],
  },
]);

 