// app/dashboard/page.tsx
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation' // Importar redirect desde next/navigation para redirección
export default async function DashboardPage() {

    if (!(await auth()).isAuthenticated) {
        // Redirigir si no hay usuario
        return redirect('/')
    }

    return (
        <div>
            <h1>Bienvenido al Dashboard</h1>
        </div>
    )
}
