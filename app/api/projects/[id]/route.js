import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import prisma from '@/lib/prisma';

export async function GET(request, { params }) {
    try {
        const { userId } = auth();
        
        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Verificar que el ID existe
        if (!params.id) {
            console.error('Missing project ID');
            return NextResponse.json(
                { error: 'Missing project ID' },
                { status: 400 }
            );
        }

        // Buscar el proyecto con sus tareas y miembros
        const project = await prisma.project.findUnique({
            where: {
                id: params.id
            },
            include: {
                owner: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true
                            }
                        }
                    }
                },
                tasks: {
                    include: {
                        assignee: {
                            select: {
                                id: true,
                                name: true,
                                email: true
                            }
                        }
                    }
                }
            }
        });

        if (!project) {
            console.error('Project not found:', params.id);
            return NextResponse.json(
                { error: 'Project not found' },
                { status: 404 }
            );
        }

        // Verificar si el usuario tiene acceso al proyecto
        const isOwner = project.ownerId === userId;
        const isMember = project.members.some(member => member.userId === userId);

        if (!isOwner && !isMember) {
            console.error('User not authorized:', userId);
            return NextResponse.json(
                { error: 'Not authorized to view this project' },
                { status: 403 }
            );
        }

        return NextResponse.json(project);
    } catch (error) {
        console.error('Error fetching project:', error);
        return NextResponse.json(
            { 
                error: 'Error fetching project',
                message: error.message || 'An unexpected error occurred'
            },
            { status: 500 }
        );
    }
}
