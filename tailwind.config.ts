import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // PokeDax Brand Colors
        void:    { DEFAULT: '#04020e', 50: '#0d0820', 100: '#150f35', 200: '#1e1650', 300: '#2a1f6e' },
        psychic: { DEFAULT: '#4B0082', light: '#7c3aed', glow: '#a855f7', dim: '#2d0052' },
        cyan:    { DEFAULT: '#00FFFF', soft: '#38bdf8', glow: 'rgba(0,255,255,0.4)' },
        gold:    { DEFAULT: '#FFD700', soft: '#fbbf24', dim: 'rgba(255,215,0,0.3)' },
        // Signals
        buy:  '#00e676',
        sell: '#ff5252',
        hold: '#FFD700',
        // Type colors
        fire:     '#ff5500',
        water:    '#00aaff',
        electric: '#FFD700',
        grass:    '#00cc66',
        psychic2: '#cc44ff',
        dragon:   '#ff9900',
        dark2:    '#666688',
        normal:   '#aaaaaa',
      },
      fontFamily: {
        display: ['Bangers', 'cursive'],
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'void-gradient':    'linear-gradient(135deg, #04020e 0%, #0d0820 40%, #150f35 100%)',
        'psychic-gradient': 'linear-gradient(135deg, #4B0082 0%, #7c3aed 100%)',
        'card-gradient':    'linear-gradient(160deg, rgba(28,18,58,0.96), rgba(8,4,20,0.99))',
        'hero-radial':      'radial-gradient(ellipse 80% 60% at 50% -5%, rgba(75,0,130,0.35) 0%, transparent 65%)',
      },
      animation: {
        'pulse-glow':   'pulseGlow 2s ease-in-out infinite',
        'float':        'float 6s ease-in-out infinite',
        'shimmer':      'shimmer 2.5s ease-in-out infinite',
        'draw-line':    'drawLine 3s ease-in-out forwards',
        'fade-up':      'fadeUp 0.5s ease-out forwards',
        'scan':         'scan 2.5s ease-in-out infinite',
        'hot-pulse':    'hotPulse 2s ease-in-out infinite',
        'spin-slow':    'spin 8s linear infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%,100%': { opacity: '1', transform: 'scale(1)' },
          '50%':     { opacity: '0.6', transform: 'scale(0.95)' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0px)' },
          '50%':     { transform: 'translateY(-12px)' },
        },
        shimmer: {
          '0%,100%': { opacity: '0.7' },
          '50%':     { opacity: '1' },
        },
        drawLine: {
          '0%':   { strokeDashoffset: '1000' },
          '100%': { strokeDashoffset: '0' },
        },
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scan: {
          '0%':   { top: '-3px', opacity: '0' },
          '8%':   { opacity: '1' },
          '92%':  { opacity: '1' },
          '100%': { top: 'calc(100% + 3px)', opacity: '0' },
        },
        hotPulse: {
          '0%,100%': { opacity: '1' },
          '50%':     { opacity: '0.5' },
        },
      },
      boxShadow: {
        'psychic': '0 0 30px rgba(124,58,237,0.4), 0 0 60px rgba(124,58,237,0.15)',
        'cyan':    '0 0 20px rgba(0,255,255,0.35)',
        'card':    '0 4px 24px rgba(0,0,0,0.6)',
        'card-hover': '0 24px 70px rgba(0,0,0,0.8), 0 0 40px rgba(124,58,237,0.2)',
        'gold':    '0 0 20px rgba(255,215,0,0.4)',
      },
      borderRadius: {
        'card': '16px',
        'card-lg': '20px',
      },
    },
  },
  plugins: [],
}

export default config
