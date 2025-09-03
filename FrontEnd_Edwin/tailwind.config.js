/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        'todofarma': {
          'primary': '#1976d2',
          'secondary': '#42a5f5',
          'accent': '#2196f3',
          'success': '#4caf50',
          'warning': '#ff9800',
          'error': '#f44336',
          'light-blue': '#e3f2fd',
          'dark-blue': '#0d47a1'
        }
      },
      fontFamily: {
        'sans': ['Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

