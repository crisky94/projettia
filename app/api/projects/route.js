import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs';
import prisma from '../../lib/prisma.js';

export async function GET() {
    try {
        const { userId } = auth();
        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const projects = await prisma.project.findMany({
            where: {
                OR: [
                    { ownerId: userId },
                    {
                        members: {
                            some: {
                                userId: userId,
                            },
                        },
                    },
                ],
            },
            include: {
                tasks: {
                    select: {
                        status: true
                    }
                },
                _count: {
                    select: {
                        tasks: true,
                        members: true,
                    },
                },
            },
            orderBy: {
                updatedAt: 'desc',
            },
        });

        return NextResponse.json(projects);
    } catch (error) {
        console.error('Error fetching projects:', error);
        return NextResponse.json(
            {
                error: 'Error fetching projects',
                message: error.message || 'An unexpected error occurred while fetching projects'
            },
            { status: 500 }
        );
    }
}

export async function POST(request) {
    try {
        const { userId } = auth();
        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { name, description } = await request.json();

        // Primero, asegurarse de que el usuario existe
        // Usamos una lógica más robusta para evitar conflictos de email en producción
        let user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            // Si el usuario no existe, obtener los datos de Clerk y crearlo
            const clerkUser = await currentUser();
            const email = clerkUser.emailAddresses[0].emailAddress;
            const name = `${clerkUser.firstName} ${clerkUser.lastName}`.trim();

            // Verificar si ya existe un usuario con este email pero diferente ID
            const existingUserByEmail = await prisma.user.findUnique({
                where: { email }
            });

            if (existingUserByEmail) {
                console.log(`Detectada colisión de email para ${email}. ID antiguo: ${existingUserByEmail.id}, ID nuevo: ${userId}`);
                // Si el email ya está en uso por otro registro (ID diferente),
                // renombramos el email del registro antiguo para liberar el email real.
                // Esto permite que el usuario actual pueda iniciar sesión/crear proyectos.
                try {
                    await prisma.user.update({
                        where: { id: existingUserByEmail.id },
                        data: { email: `${email}_old_${Date.now()}` }
                    });
                } catch (updateError) {
                    console.error('Error al renombrar usuario conflictivo:', updateError);
                }
            }

            user = await prisma.user.create({
                data: {
                    id: userId,
                    email: email,
                    name: name,
                    role: 'USER',
                }
            });
        }

        // Ahora crear el proyecto
        const project = await prisma.project.create({
            data: {
                name,
                description,
                ownerId: userId,
                members: {
                    create: {
                        userId,
                        role: 'ADMIN',
                    },
                },
            },
            include: {
                tasks: {
                    select: {
                        status: true
                    }
                },
                _count: {
                    select: {
                        tasks: true,
                        members: true,
                    },
                },
            },
        });

        return NextResponse.json(project);
    } catch (error) {
        console.error('Error creating project:', error);
        return NextResponse.json(
            {
                error: 'Error creating project',
                message: error.message || 'An unexpected error occurred while creating the project'
            },
            { status: 500 }
        );
    }
}
