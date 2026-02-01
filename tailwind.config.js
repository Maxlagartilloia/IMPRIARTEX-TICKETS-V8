/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Definición de colores según manual de marca Enterprise
        primary: {
          900: '#0f172a', // Navy Blue para Sidebars y Headers
          800: '#1e293b',
          600: '#2563eb', // Azul brillante para botones y acciones
        },
        slate: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          500: '#64748b',
          800: '#1e293b',
          900: '#0f172a',
        }
      },
      fontFamily: {
        // Fuente Inter para máxima legibilidad en reportes
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'enterprise': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      }
    },
  },
  plugins: [],
}
