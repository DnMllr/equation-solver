module.exports = {
  purge: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
  theme: {
    extend: {
      boxShadow: {
        'light': '20px 20px 60px #bebebe, -20px -20px 60px #ffffff'
      }
    }
  }
};
