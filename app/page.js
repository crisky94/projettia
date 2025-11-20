'use client';

import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.replace('/dashboard');
    }
  }, [isLoaded, isSignedIn, router]);

  const handleDemoClick = () => {
    router.push('/demo');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 py-8">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
          Welcome to Projettia
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
          Collaborate with your team in real-time, manage tasks efficiently, and communicate seamlessly.
        </p>

        {/* Demo Button - Prominente */}
        <div className="mb-8">
          <button
            onClick={handleDemoClick}
            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-4 px-8 rounded-lg text-lg transition-all duration-200 transform hover:scale-105 shadow-lg mb-4"
          >
            🚀 Try Application Demo
          </button>
          <p className="text-sm text-muted-foreground">
            Explore all features without registration • 30-minute demo
          </p>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 h-px bg-border"></div>
          <span className="text-sm text-muted-foreground px-3">OR</span>
          <div className="flex-1 h-px bg-border"></div>
        </div>

        <div className="space-y-4 sm:space-y-6">
          <h2 className="text-xl sm:text-2xl font-semibold text-foreground">Get Started</h2>
          <p className="text-muted-foreground leading-relaxed">
            Sign in or create an account to begin collaborating with your team.
          </p>
        </div>
      </div>
    </div>
  );
}
