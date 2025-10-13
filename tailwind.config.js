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
                primary: 'rgb(var(--primary))',
                'primary-foreground': 'rgb(var(--primary-foreground))',
                muted: 'rgb(var(--muted))',
                'muted-foreground': 'rgb(var(--muted-foreground))',
                accent: 'rgb(var(--accent))',
                destructive: 'rgb(var(--destructive))',
                success: 'rgb(var(--success))',
                warning: 'rgb(var(--warning))',
            },
            fontFamily: {
                sans: ['var(--font-inter)'],
                mono: ['var(--font-jetbrains-mono)'],
            },
        },
    },
    plugins: [],
}
