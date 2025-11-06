import Link from 'next/link';
import { useState } from 'react';
import PropTypes from 'prop-types';

export default function Navbar({ user }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
                            <Link href="/projects" className="text-card-foreground inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-primary transition-colors">
                                Projects
                            </Link>
                        </div>
                    </div>

                    {/* Desktop menu */}
                    <div className="hidden sm:flex sm:items-center">
                        {user ? (
                            <div className="flex items-center space-x-4">
                                <span className="text-card-foreground text-sm">{user.name}</span>
                                <button className="text-muted-foreground hover:text-card-foreground transition-colors">
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <Link href="/login" className="text-muted-foreground hover:text-card-foreground transition-colors">
                                Login
                            </Link>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="sm:hidden flex items-center">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="text-card-foreground  p-2 rounded-md transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
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
                                    <div className="flex px-3 py-3  text-sm min-h-[44px] items-center">
                                        {user.name}
                                    </div>
                                    <button className="flex w-full text-left px-3 py-3 text-muted-foreground hover:text-card-foreground transition-colors min-h-[44px] items-center">
                                        Logout
                                    </button>
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
        name: PropTypes.string.isRequired
    })
};
