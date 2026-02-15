/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                "primary": "#135bec", // Chosen this one as it's common
                "background-light": "#f6f6f8",
                "background-dark": "#101622",
                "status-yellow": "#fbbf24",
                "status-green": "#10b981",
                "status-red": "#ef4444",
            },
            fontFamily: {
                "display": ["Public Sans", "Manrope", "sans-serif"]
            },
            borderRadius: {
                "DEFAULT": "0.25rem",
                "lg": "0.5rem",
                "xl": "0.75rem",
                "full": "9999px"
            },
        },
    },
    plugins: [],
}
