'use client';

import { useAuth, SignInButton, SignUpButton } from '@clerk/nextjs';
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
    <div className="relative min-h-[calc(100vh-5rem)] flex flex-col items-center justify-center overflow-hidden">
      {/* Premium Background Elements */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-[-15%] left-[-15%] w-[60%] h-[60%] bg-primary/30 rounded-full blur-[160px] animate-pulse"></div>
        <div className="absolute bottom-[0%] right-[-10%] w-[50%] h-[50%] bg-accent/20 rounded-full blur-[140px] animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-[20%] right-[20%] w-[20%] h-[20%] bg-orange/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="relative z-10 text-center max-w-7xl mx-auto px-6 py-20 animate-fade-in-up">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-base font-semibold mb-12 hover:bg-primary/20 transition-all duration-300 transform hover:scale-110 cursor-default">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
          </span>
          Next-Gen Real-time Collaboration
        </div>

        {/* Hero Title */}
        <h1 className="text-6xl sm:text-8xl md:text-9xl lg:text-[10rem] font-black tracking-tighter mb-10 leading-[0.9]">
          <span className="block text-foreground drop-shadow-xl">Manage with</span>
          <span className="block gradient-text drop-shadow-2xl brightness-110">Projettia</span>
        </h1>

        {/* Description */}
        <p className="text-2xl sm:text-3xl md:text-4xl text-muted-foreground/90 mb-16 max-w-4xl mx-auto leading-relaxed font-light">
          Experience the pinnacle of team productivity.
          Real-time <span className="text-foreground font-medium">Kanban</span>, advanced <span className="text-foreground font-medium">Sprint planning</span>, and <span className="text-foreground font-medium">seamless synergy</span>.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-8 mb-32">
          <SignUpButton mode="modal">
            <button className="btn-gradient w-full sm:w-auto text-xl px-14 py-6 rounded-3xl shadow-[0_20px_50px_rgba(139,92,246,0.3)] hover:shadow-[0_25px_60px_rgba(139,92,246,0.4)] hover:scale-110 active:scale-95 transition-all duration-300 font-bold">
              Launch Now — It's Free
            </button>
          </SignUpButton>
          <SignInButton mode="modal">
            <button className="w-full sm:w-auto text-xl px-14 py-6 rounded-3xl border-2 border-border bg-card/40 backdrop-blur-md hover:bg-card/60 hover:border-primary/50 transition-all duration-300 hover:scale-110 font-bold">
              Member Sign In
            </button>
          </SignInButton>
        </div>

        {/* Social Proof / Features Preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-left mt-24 pt-24 border-t border-border/20">
          <div className="space-y-4 p-8 rounded-3xl glass-morphism hover:bg-white/5 transition-colors group cursor-default">
            <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center text-primary transform group-hover:rotate-12 transition-transform duration-300">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <h3 className="text-2xl font-black">Ultra-Fast Sync</h3>
            <p className="text-xl text-muted-foreground leading-snug">Zero-latency state synchronization powered by advanced WebSocket protocols.</p>
          </div>
          <div className="space-y-4 p-8 rounded-3xl glass-morphism hover:bg-white/5 transition-colors group cursor-default">
            <div className="w-16 h-16 rounded-2xl bg-accent/20 flex items-center justify-center text-accent transform group-hover:-rotate-12 transition-transform duration-300">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
            </div>
            <h3 className="text-2xl font-black">Agile Mastery</h3>
            <p className="text-xl text-muted-foreground leading-snug">Elite-grade Kanban boards and Sprints tailored for high-velocity engineering teams.</p>
          </div>
          <div className="space-y-4 p-8 rounded-3xl glass-morphism hover:bg-white/5 transition-colors group cursor-default">
            <div className="w-16 h-16 rounded-2xl bg-orange/20 flex items-center justify-center text-orange transform group-hover:scale-110 transition-transform duration-300">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            </div>
            <h3 className="text-2xl font-black">Global Scale</h3>
            <p className="text-xl text-muted-foreground leading-snug">Permission architectures designed to secure enterprise-level project collaboration.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
