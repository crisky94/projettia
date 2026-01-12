'use client';

import Link from 'next/link';
import { useState } from 'react';
import PropTypes from 'prop-types';
import { useClerk, SignOutButton } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

export default function Navbar({ user }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { signOut } = useClerk();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(); // cierra sesión en Clerk
    router.push('/'); // redirige manualmente a la página principal
  };

  return (
    <nav className="bg-card shadow border-b border-border">
      <div className="max-w-3xl mx-auto px-4 sm:px-4 lg:px-4">
        <div className="flex justify-between h-14 sm:h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-lg sm:text-xl font-bold text-card-foreground">
                Projettia
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                href="/projects"
                className="text-card-foreground inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-primary transition-colors"
              >
                Projects
              </Link>
            </div>
          </div>

          {/* Desktop menu */}
          <div className="hidden sm:flex sm:items-center">
            {user ? (
              <div className="flex items-center space-y-0 space-x-3 sm:space-x-4">
                <div className="relative group">
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-primary/30 shadow-md flex items-center justify-center overflow-hidden bg-muted transition-all group-hover:border-primary/50">
                    {user.image ? (
                      <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10 text-primary font-bold text-sm">
                        {user.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>
                <span className="text-card-foreground text-sm font-medium hidden sm:block">{user.name}</span>
                <SignOutButton afterSignOutUrl="/">
                  <button className="px-3 py-1.5 sm:px-4 sm:py-2 bg-destructive/10 hover:bg-destructive text-destructive hover:text-destructive-foreground text-xs sm:text-sm font-medium rounded-lg transition-all border border-destructive/20">
                    Logout
                  </button>
                </SignOutButton>
              </div>
            ) : (
              <Link
                href="/login"
                className="text-muted-foreground hover:text-card-foreground transition-colors"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="sm:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-card-foreground p-2 rounded-md transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="sm:hidden border-t border-border bg-card">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                href="/projects"
                className="flex px-3 py-3 text-card-foreground hover:bg-muted rounded-md transition-colors min-h-[44px] items-center"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Projects
              </Link>
              {user ? (
                <>
                  <div className="flex px-3 py-3 items-center space-x-3">
                    <div className="w-10 h-10 rounded-full border-2 border-primary/30 shadow-md flex items-center justify-center overflow-hidden bg-muted">
                      {user.image ? (
                        <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10 text-primary font-bold text-sm">
                          {user.name?.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="text-sm font-medium text-card-foreground">
                      {user.name}
                    </div>
                  </div>
                  <div className="px-3 pb-3">
                    <SignOutButton afterSignOutUrl="/">
                      <button className="w-full px-4 py-2 bg-destructive/10 hover:bg-destructive text-destructive hover:text-destructive-foreground text-sm font-medium rounded-lg transition-all border border-destructive/20 text-center">
                        Logout
                      </button>
                    </SignOutButton>
                  </div>
                </>
              ) : (
                <Link
                  href="/login"
                  className="flex px-3 py-3 text-muted-foreground hover:text-card-foreground transition-colors min-h-[44px] items-center"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

Navbar.propTypes = {
  user: PropTypes.shape({
    name: PropTypes.string.isRequired,
    image: PropTypes.string
  })
};
