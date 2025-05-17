/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './views/**/*.ejs',
        './public/css/*.css'
    ],
    theme: {
        extend: {
            colors: {
                'brand-text': '#000000',
                'brand-primary': '#4F46E5',
                'brand-bg': '#F5F5F5'
            }
        },
    },
    plugins: [
        {
            tailwindcss: {},
            autoprefixer: {},
        },
    ],
};
