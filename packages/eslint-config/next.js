import pluginReactHooks from 'eslint-plugin-react-hooks'
import pluginReact from 'eslint-plugin-react'
import globals from 'globals'
import pluginNext from '@next/eslint-plugin-next'
import importPlugin from 'eslint-plugin-import'
import { eslintConfig as baseConfig } from './base.js'

/** @type {import("eslint").Linter.Config[]} */
export const eslintConfig = [
  ...baseConfig,
  { ignores: ['.next/**', 'node_modules/**'] },
  {
    ...pluginReact.configs.flat.recommended,
    languageOptions: {
      ...pluginReact.configs.flat.recommended.languageOptions,
      globals: {
        ...globals.serviceworker
      }
    }
  },
  {
    plugins: {
      '@next/next': pluginNext,
      import: importPlugin
    },
    rules: {
      ...pluginNext.configs.recommended.rules,
      ...pluginNext.configs['core-web-vitals'].rules,
      '@typescript-eslint/triple-slash-reference': 'off',
      '@next/next/no-html-link-for-pages': ['error', 'apps/web/src/app'],
      'react/jsx-sort-props': [
        'error',
        {
          callbacksLast: true,
          shorthandFirst: true,
          noSortAlphabetically: false,
          reservedFirst: true
        }
      ],
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
            'object',
            'type'
          ],
          pathGroups: [
            {
              pattern: '{react,react-dom/**,react-router-dom/**}',
              group: 'builtin',
              position: 'before'
            }
          ],
          pathGroupsExcludedImportTypes: ['builtin'],
          alphabetize: {
            order: 'asc'
          },
          'newlines-between': 'always'
        }
      ]
    }
  },
  {
    plugins: {
      'react-hooks': pluginReactHooks
    },
    settings: { react: { version: 'detect' } },
    rules: {
      ...pluginReactHooks.configs.recommended.rules,
      // React scope no longer necessary with new JSX transform.
      'react/react-in-jsx-scope': 'off'
    }
  }
]
