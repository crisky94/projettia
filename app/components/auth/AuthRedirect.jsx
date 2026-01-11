'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';

export default function AuthRedirect() {
    const { isSignedIn, isLoaded, userId } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!isLoaded) return;

        if (isSignedIn && userId && pathname !== '/dashboard' && !pathname.startsWith('/projects/')) {
            router.replace('/dashboard');
        } else if (!isSignedIn && pathname !== '/') {
            router.replace('/');
        }
    }, [isSignedIn, isLoaded, userId, router, pathname]);

    return null;
}
