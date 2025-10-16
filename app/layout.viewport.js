// Viewport configuration for mobile-first design
export const viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: 'cover',
    themeColor: [
        { media: '(prefers-color-scheme: light)', color: '#0f172a' },
        { media: '(prefers-color-scheme: dark)', color: '#0f172a' }
    ]
}