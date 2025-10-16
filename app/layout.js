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
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="font-sans antialiased bg-background text-foreground">
          <header className="flex justify-between items-center p-3 sm:p-4 gap-2 sm:gap-4 h-14 sm:h-16 bg-card border-b border-border">
            <div className="flex items-center">
              <h1 className="text-lg sm:text-xl font-bold text-foreground">WER Team</h1>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <SignedOut>
                <SignInButton>
                  <button className="text-sm px-3 py-2 rounded-lg border border-border hover:bg-muted transition-colors">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton>
                  <button className="bg-primary text-primary-foreground rounded-lg font-medium text-sm px-3 py-2 cursor-pointer hover:opacity-90 transition-opacity">
                    Sign Up
                  </button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <UserButton signOutUrl="/" />
              </SignedIn>
            </div>
          </header>
          <SignedIn>
            <AuthRedirect />
          </SignedIn>
          <main className="min-h-[calc(100vh-3.5rem)] sm:min-h-[calc(100vh-4rem)]">
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
            theme="light"
          />
        </body>
      </html>
    </ClerkProvider>
  );
}