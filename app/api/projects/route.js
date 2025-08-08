import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs';
import prisma from '../../lib/prisma.ts';

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
        let user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            // Si el usuario no existe, obtener los datos de Clerk y crearlo
            const clerkUser = await currentUser();
            user = await prisma.user.create({
                data: {
                    id: userId,
                    email: clerkUser.emailAddresses[0].emailAddress,
                    name: `${clerkUser.firstName} ${clerkUser.lastName}`.trim(),
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
