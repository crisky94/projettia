import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import prisma from '@/lib/prisma';

export async function GET(request, { params }) {
    try {
        const { userId } = auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const projectId = params.id;

        // Verificar que el usuario es miembro del proyecto
        const membership = await prisma.projectUser.findFirst({
            where: {
                projectId,
                userId: userId
            }
        });

        if (!membership) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Obtener los sprints del proyecto con sus tareas
        const sprints = await prisma.sprint.findMany({
            where: {
                projectId
            },
            include: {
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
                },
                _count: {
                    select: {
                        tasks: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json(sprints);
    } catch (error) {
        console.error('Error fetching sprints:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request, { params }) {
    try {
        const { userId } = auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const projectId = params.id;
        const { name, description, startDate, endDate } = await request.json();

        if (!name || !startDate || !endDate) {
            return NextResponse.json({ error: 'Name, start date, and end date are required' }, { status: 400 });
        }

        // Verificar que el usuario es admin del proyecto
        const membership = await prisma.projectUser.findFirst({
            where: {
                projectId,
                userId: userId,
                role: 'ADMIN'
            }
        });

        const project = await prisma.project.findUnique({
            where: { id: projectId }
        });

        if (!membership && (!project || project.ownerId !== userId)) {
            return NextResponse.json({ error: 'Forbidden - Only admins can create sprints' }, { status: 403 });
        }

        // Validar fechas
        const start = new Date(startDate);
        const end = new Date(endDate);

        if (start >= end) {
            return NextResponse.json({ error: 'Start date must be before end date' }, { status: 400 });
        }

        // Crear el sprint
        const sprint = await prisma.sprint.create({
            data: {
                name,
                description,
                startDate: start,
                endDate: end,
                projectId,
                status: 'PLANNING'
            },
            include: {
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
                },
                _count: {
                    select: {
                        tasks: true
                    }
                }
            }
        });

        return NextResponse.json(sprint, { status: 201 });
    } catch (error) {
        console.error('Error creating sprint:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
