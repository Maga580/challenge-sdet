import tsParser from '@typescript-eslint/parser'
import tsPlugin from '@typescript-eslint/eslint-plugin'
import cypressPlugin from 'eslint-plugin-cypress'

export default [
  {
    ignores: [
      'node_modules/**',
      'cypress/screenshots/**',
      'cypress/videos/**',
      'cypress/downloads/**',
    ],
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: cypressPlugin.configs.recommended.languageOptions.globals,
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      cypress: cypressPlugin,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      ...cypressPlugin.configs.recommended.rules,
      'no-unused-expressions': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
    },
  },
  {
    files: ['**/*.js', '**/*.cjs', '**/*.mjs'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: cypressPlugin.configs.recommended.languageOptions.globals,
    },
    plugins: {
      cypress: cypressPlugin,
    },
    rules: cypressPlugin.configs.recommended.rules,
  },
]
