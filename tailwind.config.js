/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                background: 'rgb(var(--background))',
                foreground: 'rgb(var(--foreground))',
                card: 'rgb(var(--card))',
                'card-foreground': 'rgb(var(--card-foreground))',
                border: 'rgb(var(--border))',
                input: 'rgb(var(--input))',
                ring: 'rgb(var(--ring))',
                primary: {
                    DEFAULT: 'rgb(var(--primary))',
                    foreground: 'rgb(var(--primary-foreground))',
                },
                muted: {
                    DEFAULT: 'rgb(var(--muted))',
                    foreground: 'rgb(var(--muted-foreground))',
                },
                accent: {
                    DEFAULT: 'rgb(var(--accent))',
                    foreground: 'rgb(var(--accent-foreground))',
                },
                destructive: {
                    DEFAULT: 'rgb(var(--destructive))',
                    foreground: 'rgb(var(--destructive-foreground))',
                },
                success: 'rgb(var(--success))',
                warning: 'rgb(var(--warning))',
            },
            screens: {
                'xs': '475px',  // Extra small devices
                // Mobile-first approach - default styles apply to mobile
                // sm: '640px' // Small devices (default Tailwind)
                // md: '768px' // Medium devices (default Tailwind)  
                // lg: '1024px' // Large devices (default Tailwind)
                // xl: '1280px' // Extra large devices (default Tailwind)
                '2xl': '1400px', // Override default 2xl
            },
            spacing: {
                '18': '4.5rem',   // 72px
                '88': '22rem',    // 352px
                '128': '32rem',   // 512px
                'safe-top': 'env(safe-area-inset-top)',
                'safe-bottom': 'env(safe-area-inset-bottom)',
                'safe-left': 'env(safe-area-inset-left)',
                'safe-right': 'env(safe-area-inset-right)',
            },
            minHeight: {
                '44': '2.75rem',  // iOS recommended touch target
                'screen-safe': 'calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom))',
            },
            minWidth: {
                '44': '2.75rem',  // iOS recommended touch target
            },
            fontSize: {
                'xs': ['0.75rem', { lineHeight: '1rem' }],
                'sm': ['0.875rem', { lineHeight: '1.25rem' }],
                'base': ['1rem', { lineHeight: '1.5rem' }],
                'lg': ['1.125rem', { lineHeight: '1.75rem' }],
                'xl': ['1.25rem', { lineHeight: '1.75rem' }],
                '2xl': ['1.5rem', { lineHeight: '2rem' }],
                '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
            },
            animation: {
                'fade-in': 'fadeIn 0.2s ease-in-out',
                'slide-up': 'slideUp 0.3s ease-out',
                'scale-in': 'scaleIn 0.2s ease-out',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(100%)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                scaleIn: {
                    '0%': { transform: 'scale(0.95)', opacity: '0' },
                    '100%': { transform: 'scale(1)', opacity: '1' },
                },
            },
            fontFamily: {
                sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
                mono: ['SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'monospace'],
            },
        },
    },
    plugins: [],
}
