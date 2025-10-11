import pluginNestTyped from '@darraghor/eslint-plugin-nestjs-typed'
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
      '@nestjs-typed': pluginNestTyped
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_' }
      ],
      'prefer-const': 'warn'
    }
  }
]
