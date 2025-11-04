// Viewport configuration for mobile-first design with moderate scaling
export const viewport = {
    width: 'device-width',
    initialScale: 1.1,
    maximumScale: 2,
    userScalable: true,
    viewportFit: 'cover',
    themeColor: [
        { media: '(prefers-color-scheme: light)', color: '#0f172a' },
        { media: '(prefers-color-scheme: dark)', color: '#0f172a' }
    ]
}