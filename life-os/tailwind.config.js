/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Design system
        bg: {
          base: '#09090b',
          card: '#111116',
          elevated: '#18181b',
          hover: '#1c1c22',
        },
        border: {
          DEFAULT: 'rgba(255,255,255,0.07)',
          strong: 'rgba(255,255,255,0.12)',
        },
        accent: {
          DEFAULT: '#7c3aed',
          light: '#a78bfa',
          glow: 'rgba(124,58,237,0.15)',
        },
        // Semantic
        success: '#22c55e',
        warning: '#f59e0b',
        danger: '#ef4444',
        info: '#3b82f6',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        card: '0 0 0 1px rgba(255,255,255,0.06), 0 4px 24px rgba(0,0,0,0.4)',
        glow: '0 0 20px rgba(124,58,237,0.25)',
        'glow-sm': '0 0 10px rgba(124,58,237,0.15)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
