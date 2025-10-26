import type { StorybookConfig } from '@storybook/nextjs'

const config = {
  stories: ['../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [],
  framework: {
    name: '@storybook/nextjs',
    options: {}
  },
  docs: {}
} satisfies StorybookConfig

export default config
