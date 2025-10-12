import type { Config } from 'tailwindcss'
import catppuccin from '@catppuccin/tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        base: "#f5e0dc",
        surface: "#e6ccb2",
        text: "#1e1e2e",
        "base-dark": "#1e1e2e",
        "surface-dark": "#313244",
        "text-dark": "#cdd6f4",
        mauve: "#cba6f7",
        lavender: "#b4befe",
      },
    },
  },
  plugins: [catppuccin({ defaultFlavour: 'mocha' })],
}

export default config
