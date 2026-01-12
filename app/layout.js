import './globals.css';
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs';
import AuthRedirect from './components/auth/AuthRedirect';
import Image from 'next/image';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ThemeToggle from './components/ThemeToggle';

export const metadata = {
  title: 'Projettia',
  description: 'Team collaboration platform',
  viewport: 'width=device-width, initial-scale=1.0, maximum-scale=5, user-scalable=yes, viewport-fit=cover',
  themeColor: '#0f172a',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Projettia',
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/icon.png',
    apple: '/icon.png',
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'msapplication-TileColor': '#0f172a',
    'msapplication-config': '/browserconfig.xml',
  },
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider afterSignOutUrl="/">
      <html lang="en" className="h-full">
        <head>
          {/* Set initial theme early to avoid FOUC */}
          <script dangerouslySetInnerHTML={{
            __html: `(() => { try {
            var t = localStorage.getItem('theme');
            if (!t) {
              var m = globalThis.matchMedia ? globalThis.matchMedia('(prefers-color-scheme: dark)') : null;
              t = m && m.matches ? 'dark' : 'light';
            }
            document.documentElement.dataset.theme = t;
          } catch (e) {} })();` }} />
          <meta name="viewport" content="width=device-width, initial-scale=1.02, maximum-scale=2, user-scalable=yes, viewport-fit=fit" />
          <meta name="theme-color" content="#0f172a" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="default" />
          <meta name="format-detection" content="telephone=no" />
        </head>
        <body className="font-sans antialiased bg-background text-foreground h-full overflow-x-hidden">
          <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b border-white/10 shadow-lg rounded-b-[2.5rem] rounded-t-none">
            <div className="flex justify-between items-center px-4 sm:px-6 lg:px-8 py-3">
              <div className="flex items-center gap-3">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
                  <Image
                    src="/logo.png"
                    width={56}
                    height={56}
                    alt="Projettia logo"
                    priority
                    className="relative rounded-xl shadow-lg hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h1 className="text-xl sm:text-2xl font-bold gradient-text hidden sm:block">Projettia</h1>
              </div>
              <div className="flex items-center gap-3">
                <ThemeToggle />
                <SignedOut>
                  <div className="flex gap-2">
                    <SignInButton>
                      <button className="text-sm px-4 py-2 rounded-lg border border-border hover:bg-muted transition-all duration-200 hover-scale font-medium">
                        Sign In
                      </button>
                    </SignInButton>
                    <SignUpButton>
                      <button className="btn-gradient text-sm px-4 py-2">
                        Sign Up
                      </button>
                    </SignUpButton>
                  </div>
                </SignedOut>
                <SignedIn>
                  <UserButton
                    afterSignOutUrl="/"
                    appearance={{
                      elements: {
                        avatarBox: "w-10 h-10 border-2 border-primary/30 hover:border-primary transition-all shadow-md",
                        userButtonBox: "w-12 h-12",
                        userButtonTrigger: "w-12 h-12 hover:scale-105 transition-transform"
                      }
                    }}
                  />
                </SignedIn>
              </div>
            </div>
          </header>
          <AuthRedirect />
          <main className="min-h-screen-safe flex-1 safe-area-inset-bottom relative z-10 pt-4">
            {children}
          </main>
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="dark"
            toastStyle={{
              backgroundColor: 'rgb(var(--card))',
              color: 'rgb(var(--card-foreground))',
              border: '1px solid rgb(var(--border))',
            }}
            className="!top-safe-top"
          />
        </body>
      </html>
    </ClerkProvider>
  );
}