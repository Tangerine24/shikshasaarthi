/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#F4F7FA',
        surface: '#FFFFFF',
        primary: {
          DEFAULT: '#1F6FEB',
          dark: '#12304A',
          light: '#E8F0FE',
        },
        accent: {
          DEFAULT: '#0F766E',
          light: '#ECFDF5',
        },
        text: {
          primary: '#243447',
          secondary: '#4A5E73',
          muted: '#607080',
        },
        border: '#D9E2EC',
        success: '#198754',
        warning: '#D97706',
        danger: '#B42318',
        info: '#4A6FA5',
        highlight: '#E8F0FE',
        'surface-muted': '#F4F7FA',
      },
      fontFamily: {
        body: ['Inter', 'sans-serif'],
        heading: ['Lexend', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '6px',
        input: '8px',
        card: '12px',
        badge: '4px',
      },
      spacing: {
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '8': '32px',
        '10': '40px',
        '12': '48px',
        '16': '64px',
      },
    },
  },
  plugins: [],
}
