/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: '#0F0F11',
                surface: '#1A1A1E',
                primary: '#5FB8A8', // Teal
                secondary: '#FF64A6', // Pink
                accent: '#E1E1E3', // Starlight
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
