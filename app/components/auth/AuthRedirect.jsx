// 'use client';

// import { useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import { useAuth } from '@clerk/nextjs';

// export default function AuthRedirect() {
//     const { isSignedIn, isLoaded, userId } = useAuth();
//     const router = useRouter();

//     useEffect(() => {
//         if (isLoaded && isSignedIn && userId) {
//             router.replace('/dashboard');
//         }else{
//             router.replace('/');
//         }
//     }, [isSignedIn, isLoaded, userId, router]);

//     // No renderizar nada mientras se verifica la autenticación
//     if (!isLoaded) return null;

//     return null;
// }

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';

export default function AuthRedirect() {
    const { isSignedIn, isLoaded, userId } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoaded) return;

        if (isSignedIn && userId && router.pathname !== '/dashboard') {
            router.replace('/dashboard');
        } else if ((!isSignedIn || !userId) && router.pathname !== '/') {
            router.replace('/');
        }
    }, [isSignedIn, isLoaded, userId, router]);

    return null; // no renderizamos nada
}
