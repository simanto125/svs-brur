/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#f0f4fa',
          100: '#dbe5f1',
          200: '#bcd0e8',
          300: '#8fb0da',
          400: '#5e8ac8',
          500: '#3d6cb0',
          600: '#2e5390',
          700: '#264373',
          800: '#1d325c',
          900: '#15233f',
          950: '#0c1729',
        },
        saffron: {
          50: '#fdf8ed',
          100: '#faedce',
          200: '#f5d896',
          300: '#efbd5a',
          400: '#eba02f',
          500: '#e58419',
          600: '#cf6512',
          700: '#ab4a12',
          800: '#873b16',
          900: '#6f3115',
          950: '#3f1908',
        },
        cream: {
          50: '#fdfcfa',
          100: '#faf7f0',
          200: '#f5efe0',
        },
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 40px -10px rgba(229, 132, 25, 0.35)',
        soft: '0 10px 40px -15px rgba(21, 35, 63, 0.25)',
      },
      animation: {
        'fade-up': 'fadeUp 0.7s ease-out forwards',
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        float: 'float 6s ease-in-out infinite',
        shimmer: 'shimmer 3s linear infinite',
        blob: 'blob 16s ease-in-out infinite',
        'blob-slow': 'blob 22s ease-in-out infinite reverse',
        'gradient-shift': 'gradientShift 4s linear infinite',
        'spin-slow': 'spin 14s linear infinite',
        'spin-reverse-slow': 'spin 20s linear infinite reverse',
        'seal-pulse': 'sealPulse 3s ease-in-out infinite',
        'hue-shift': 'hueShift 8s linear infinite',
        'text-wave': 'textWave 3s ease-in-out infinite',
        'ribbon-sheen': 'ribbonSheen 4s ease-in-out infinite',
        'welcome-glow': 'welcomeGlow 2s ease-in-out both',
        'particle-orbit': 'particleOrbit 2s linear infinite',
      },
      keyframes: {
        sealPulse: {
          '0%, 100%': { transform: 'scale(1)', filter: 'drop-shadow(0 0 0 rgba(212,160,23,0))' },
          '50%': { transform: 'scale(1.04)', filter: 'drop-shadow(0 0 14px rgba(212,160,23,0.55))' },
        },
        hueShift: {
          '0%': { filter: 'hue-rotate(0deg)' },
          '100%': { filter: 'hue-rotate(360deg)' },
        },
        textWave: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        ribbonSheen: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        welcomeGlow: {
          '0%': { opacity: '0', transform: 'scale(0.75)' },
          '30%': { opacity: '1', transform: 'scale(1)' },
          '100%': { opacity: '0', transform: 'scale(1.12)' },
        },
        particleOrbit: {
          '0%': { transform: 'rotate(0deg) translateX(80px) rotate(0deg)' },
          '100%': { transform: 'rotate(360deg) translateX(80px) rotate(-360deg)' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        blob: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(40px, -30px) scale(1.1)' },
          '66%': { transform: 'translate(-30px, 20px) scale(0.95)' },
        },
        gradientShift: {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '300% 50%' },
        },
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #efbd5a 0%, #e58419 50%, #cf6512 100%)',
        'navy-gradient': 'linear-gradient(135deg, #0c1729 0%, #1d325c 50%, #264373 100%)',
      },
    },
  },
  plugins: [],
};
