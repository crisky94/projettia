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
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const metadata = {
  title: 'WER Team Work',
  description: 'Team collaboration platform',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover',
  themeColor: '#0f172a',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'WER Team Work',
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-icon.png',
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
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
          <meta name="theme-color" content="#0f172a" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="default" />
          <meta name="format-detection" content="telephone=no" />
        </head>
        <body className="font-sans antialiased bg-background text-foreground h-full overflow-x-hidden">
          <header className="flex justify-between items-center p-3 sm:p-4 gap-2 sm:gap-4 min-h-14 sm:min-h-16 bg-card border-b border-border safe-area-inset-top">
            <div className="flex items-center">
              <h1 className="text-lg sm:text-xl font-bold text-foreground truncate">WER Team</h1>
            </div>
            <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
              <SignedOut>
                <div className="flex flex-col xs:flex-row gap-2">
                  <SignInButton>
                    <button className="text-sm px-3 py-2 rounded-lg border border-border hover:bg-muted transition-colors min-h-44 min-w-44">
                      Sign In
                    </button>
                  </SignInButton>
                  <SignUpButton>
                    <button className="bg-primary text-primary-foreground rounded-lg font-medium text-sm px-3 py-2 cursor-pointer hover:opacity-90 transition-opacity min-h-44 min-w-44">
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
                      avatarBox: "w-8 h-8 sm:w-10 sm:h-10"
                    }
                  }}
                />
              </SignedIn>
            </div>
          </header>
          <SignedIn>
            <AuthRedirect />
          </SignedIn>
          <main className="min-h-screen-safe flex-1 safe-area-inset-bottom">
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