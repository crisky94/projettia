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
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center">
      <div className="text-center max-w-2xl mx-auto px-4">
        <h1 className="text-4xl sm:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Welcome to WE Team Work
        </h1>
        <p className="text-lg sm:text-xl text-gray-600 mb-8">
          Collaborate with your team in real-time, manage tasks efficiently, and communicate seamlessly.
        </p>
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-800">Get Started</h2>
          <p className="text-gray-600">
            Sign in or create an account to begin collaborating with your team.
          </p>
        </div>
      </div>
    </div>
  );
}
