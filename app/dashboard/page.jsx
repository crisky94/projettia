'use client';

import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import ProjectDashboard from '../components/projects/ProjectDashboard';

export default function DashboardPage() {
    const { userId, isLoaded, isSignedIn } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (isLoaded && !isSignedIn) {
            router.replace('/');
        }
    }, [isLoaded, isSignedIn, router]);

    // Mostrar un estado de carga elegante mientras se verifica la autenticación
    if (!isLoaded || !isSignedIn) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="flex flex-col items-center space-y-4">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-600 text-lg">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <ProjectDashboard userId={userId} />
        </div>
    );
}
