/** @type {import('tailwindcss').Config} */
/**
 * TailwindCSS design tokens for JobHub.
 * Palette, typography and radii are derived from docs/06_HOMEPAGE_SPEC.md
 * §5 (Color Palette) and §6 (Typography).
 */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Primary — deep corporate blue (#0F4C81)
        primary: {
          50: '#eff6fc',
          100: '#d8e9f7',
          200: '#b3d2ed',
          300: '#7faedc',
          400: '#4a85c2',
          500: '#2b66a0',
          DEFAULT: '#0F4C81',
          600: '#0F4C81',
          700: '#0c3d68',
          800: '#0a3255',
          900: '#082845',
          950: '#051a2e',
        },
        // Secondary — growth green (#00A86B)
        secondary: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          DEFAULT: '#00A86B',
          600: '#00A86B',
          700: '#00855a',
          800: '#066b48',
          900: '#06523a',
          950: '#022e21',
        },
        // Neutral surface
        canvas: '#F8FAFC',
        ink: {
          DEFAULT: '#0f172a',
          soft: '#334155',
          muted: '#64748b',
        },
      },
      fontFamily: {
        sans: [
          'Plus Jakarta Sans',
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Arial',
          'sans-serif',
        ],
        display: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
      fontSize: {
        // 8pt grid friendly type scale
        body: ['1rem', { lineHeight: '1.7' }],
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1rem',
        '3xl': '1.25rem',
        '4xl': '1.5rem',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(15, 76, 129, 0.04), 0 4px 16px rgba(15, 23, 42, 0.06)',
        card: '0 1px 3px rgba(15, 23, 42, 0.05), 0 10px 30px -12px rgba(15, 23, 42, 0.12)',
        elevated: '0 18px 50px -16px rgba(15, 76, 129, 0.28)',
        focus: '0 0 0 4px rgba(15, 76, 129, 0.15)',
      },
      maxWidth: {
        content: '1200px',
      },
      spacing: {
        18: '4.5rem',
        22: '5.5rem',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.6s ease-out both',
        float: 'float 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
