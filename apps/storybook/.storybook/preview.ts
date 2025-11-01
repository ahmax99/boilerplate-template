import type { Preview } from '@storybook/nextjs-vite'

import '@/styles/globals.css'

const preview = {
  parameters: {
    nextjs: {
      appDirectory: true
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/
      }
    }
  }
} satisfies Preview

export default preview
