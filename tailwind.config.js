/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Paleta corporativa CHANDO
        primary: {
          DEFAULT: '#E91E63', // rosa/coral principal
          light: '#F8BBD0',   // rosa claro
          dark: '#C2185B',    // rosa oscuro (hover)
        },
        secondary: {
          DEFAULT: '#D4AF37', // dorado
          light: '#E8D48A',   // dorado claro
        },
        dark: '#1F2937',  // gris oscuro
        light: '#FFF8F3', // blanco/cream
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Avenir', 'Helvetica', 'Arial', 'sans-serif'],
        serif: ['Georgia', 'Cambria', 'serif'],
      },
      boxShadow: {
        soft: '0 4px 20px -4px rgba(233, 30, 99, 0.12)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-fast': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.4s ease-out both',
        'fade-in-fast': 'fade-in-fast 0.25s ease-out both',
      },
    },
  },
  plugins: [],
}
