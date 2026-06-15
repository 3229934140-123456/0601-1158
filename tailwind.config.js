/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e6f7ff',
          100: '#bae7ff',
          500: '#1890ff',
          600: '#096dd9',
          700: '#0050b3',
        },
        safety: {
          warning: '#faad14',
          danger: '#ff4d4f',
          success: '#52c41a',
          info: '#13c2c2',
        },
        vr: {
          dark: '#0a0e27',
          panel: 'rgba(20, 30, 60, 0.9)',
          glow: '#00d4ff',
        }
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 5px #00d4ff, 0 0 10px #00d4ff' },
          '50%': { boxShadow: '0 0 20px #00d4ff, 0 0 30px #00d4ff' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}
