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

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 py-8">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
          Welcome to Projjetia
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
          Collaborate with your team in real-time, manage tasks efficiently, and communicate seamlessly.
        </p>
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
