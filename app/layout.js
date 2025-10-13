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
          <header className="flex justify-end items-center p-4 gap-4 h-16 bg-card border-b border-border">
            <SignedOut>
              <SignInButton />
              <SignUpButton>
                <button className="bg-primary text-primary-foreground rounded-full font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 cursor-pointer hover:opacity-90 transition-opacity">
                  Sign Up
                </button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <UserButton signOutUrl="/" />
            </SignedIn>
          </header>
          <SignedIn>
            <AuthRedirect />
          </SignedIn>
          <main className="min-h-[calc(100vh-4rem)]">
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