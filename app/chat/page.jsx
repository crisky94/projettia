// app/dashboard/page.tsx
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
    

    if (!(await auth()).isAuthenticated) {
        // Redirigir si no hay usuario
        return redirect('/')
    }

    return (
        <div>
            <h1>Bienvenido a la Sala del Chat</h1>
        </div>
    )
}
