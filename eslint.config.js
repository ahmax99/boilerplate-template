import { eslintConfig as nextConfig } from '@repo/eslint-config/next'
import { eslintConfig as nestConfig } from '@repo/eslint-config/nest'

export default [
  {
    ignores: [
      '**/dist/**',
      '**/build/**',
      '**/.next/**',
      '**/coverage/**',
      '**/node_modules/**',
      '**/*.d.ts',
      '**/turbo.json',
      '**/tsconfig*.json',
      '**/pnpm-lock.yaml',
      '**/package-lock.json',
      '**/yarn.lock',
      'packages/trpc/src/server/**',
      '**/storybook-static/**'
    ]
  },

  ...nextConfig,
  ...nestConfig
]
