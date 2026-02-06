/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // HeartBased.ai Brand System
                hb: {
                    pink: '#FF64A6',
                    'pink-hover': '#FF7AB5',
                    'pink-dark': '#DE4083',
                    teal: '#03BFAE',
                    'teal-dark': '#009688',
                    'bg-start': '#0D1117',
                    'bg-end': '#1A1F24',
                },
                // Semantic aliases
                background: '#0D1117',
                surface: '#1A1F24',
                primary: '#FF64A6',
                secondary: '#03BFAE',
                accent: '#E1E1E3',
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
