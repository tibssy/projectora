import type { Config } from 'tailwindcss'
import catppuccin from '@catppuccin/tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [catppuccin({ defaultFlavour: 'mocha' })],
}

export default config
