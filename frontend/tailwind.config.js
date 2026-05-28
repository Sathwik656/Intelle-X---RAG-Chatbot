/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary':   '#0a0a0a',
        'bg-secondary': '#111111',
        'bg-card':      '#1a1a1a',
        'bg-hover':     '#222222',
        'accent-cyan':  '#00e5ff',
        'accent-lime':  '#c6f135',
        'accent-pink':  '#ff0066',
        'accent-yellow':'#ffd700',
        'border-brutal':'#000000',
        'text-primary': '#ffffff',
        'text-muted':   '#888888',
        'text-dim':     '#555555',
      },
      fontFamily: {
        grotesk: ['"Space Grotesk"', 'sans-serif'],
        inter:   ['"Inter"', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        brutal:     '4px 4px 0px #000000',
        'brutal-sm':'2px 2px 0px #000000',
        'brutal-lg':'6px 6px 0px #000000',
        'brutal-xl':'8px 8px 0px #000000',
        'cyan':     '4px 4px 0px #00e5ff',
        'lime':     '4px 4px 0px #c6f135',
        'pink':     '4px 4px 0px #ff0066',
      },
      borderWidth: {
        '3': '3px',
      },
      animation: {
        'pulse-fast':    'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-up':      'slideUp 0.3s ease-out',
        'fade-in':       'fadeIn 0.2s ease-out',
        'typing':        'typing 1.2s steps(3) infinite',
        'shimmer':       'shimmer 2s linear infinite',
        'border-pulse':  'borderPulse 2s ease-in-out infinite',
      },
      keyframes: {
        slideUp: {
          '0%':   { transform: 'translateY(12px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',     opacity: '1' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition:  '200% 0' },
        },
        borderPulse: {
          '0%, 100%': { borderColor: '#00e5ff' },
          '50%':       { borderColor: '#c6f135' },
        },
      },
    },
  },
  plugins: [],
}
