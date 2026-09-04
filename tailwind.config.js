/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Inter"', 'system-ui', 'sans-serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      colors: {
        cream: '#F6F5F2',
        coral: {
          50: '#FFF1EC',
          100: '#FFE1D6',
          200: '#FFC2AD',
          300: '#FF9D7E',
          400: '#FF7A54',
          500: '#F45C34',
          600: '#DE4620',
          700: '#B8371A',
          800: '#8F2C16',
          900: '#6E2313',
        },
        teal: {
          50: '#EBFAF7',
          100: '#D2F3EC',
          200: '#A6E7DA',
          300: '#72D5C1',
          400: '#3FBBA5',
          500: '#259A87',
          600: '#1B7B6D',
          700: '#166257',
          800: '#134E46',
          900: '#0F3E38',
        },
        sun: '#FFC94A',
        plum: '#4A3B52',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
      boxShadow: {
        soft: '0 4px 20px rgba(74, 59, 82, 0.08)',
        card: '0 2px 12px rgba(74, 59, 82, 0.06)',
      },
    },
  },
  plugins: [],
}
