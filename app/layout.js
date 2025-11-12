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
  viewport: 'width=device-width, initial-scale=1.1, maximum-scale=3, user-scalable=yes, viewport-fit=cover',
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
    <ClerkProvider>
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
          <header className="flex justify-between items-center px-4 py-3 bg-card border-b border-border relative w-full z-50">
            <div className="flex items-center gap-3">
              <Image src="/logo.png" width={48} height={48} alt="Projettia logo" priority />
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <SignedOut>
                <div className="flex gap-2">
                  <SignInButton>
                    <button className="text-sm px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors">
                      Sign In
                    </button>
                  </SignInButton>
                  <SignUpButton>
                    <button className="bg-primary text-primary-foreground rounded-lg font-medium text-sm px-4 py-2 hover:opacity-90 transition-opacity">
                      Sign Up
                    </button>
                  </SignUpButton>
                </div>
              </SignedOut>
              <SignedIn>
                <UserButton
                  signOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: "w-8 h-8",
                      userButtonBox: "w-12 h-8",
                      userButtonTrigger: "w-12 h-12"
                    }
                  }}
                />
              </SignedIn>
            </div>
          </header>
          <SignedIn>
            <AuthRedirect />
          </SignedIn>
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