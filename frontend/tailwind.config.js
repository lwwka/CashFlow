export default {
    content: ['./index.html', './src/**/*.{ts,tsx}'],
    theme: {
        extend: {
            colors: {
                ink: '#08121f',
                tide: '#0f766e',
                reef: '#5eead4',
                coral: '#fb7185',
                sand: '#f7f3e8',
                slate: '#112033'
            },
            boxShadow: {
                float: '0 24px 80px rgba(8, 18, 31, 0.18)'
            },
            backgroundImage: {
                'hero-glow': 'radial-gradient(circle at top left, rgba(94, 234, 212, 0.18), transparent 35%), radial-gradient(circle at top right, rgba(251, 113, 133, 0.18), transparent 30%)'
            },
            fontFamily: {
                display: ['"Aptos Display"', '"Segoe UI Variable Display"', '"Trebuchet MS"', 'sans-serif'],
                body: ['"Aptos"', '"Segoe UI Variable Text"', '"Trebuchet MS"', 'sans-serif']
            }
        }
    },
    plugins: []
};
