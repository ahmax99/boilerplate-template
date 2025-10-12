import pluginNestTyped from '@darraghor/eslint-plugin-nestjs-typed'
import importPlugin from 'eslint-plugin-import'
import { eslintConfig as baseConfig } from './base.js'

/** @type {import("eslint").Linter.Config[]} */
export const eslintConfig = [
  ...baseConfig,
  {
    ignores: ['node_modules/**', 'dist/**', 'build/**', '**/*.js', '**/*.d.ts']
  },
  {
    files: ['**/*.ts'],
    plugins: {
      '@nestjs-typed': pluginNestTyped,
      import: importPlugin
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_' }
      ],
      'prefer-const': 'warn',
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
              pattern: '@nestjs/**',
              group: 'builtin',
              position: 'before'
            },
            {
              pattern: '@/**',
              group: 'internal',
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
  }
]
