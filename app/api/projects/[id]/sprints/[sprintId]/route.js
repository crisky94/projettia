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
        const sprintId = params.sprintId;

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

        // Obtener el sprint con sus tareas
        const sprint = await prisma.sprint.findFirst({
            where: {
                id: sprintId,
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
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                },
                _count: {
                    select: {
                        tasks: true
                    }
                }
            }
        });

        if (!sprint) {
            return NextResponse.json({ error: 'Sprint not found' }, { status: 404 });
        }

        return NextResponse.json(sprint);
    } catch (error) {
        console.error('Error fetching sprint:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PATCH(request, { params }) {
    try {
        const { userId } = auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const projectId = params.id;
        const sprintId = params.sprintId;
        const { name, description, startDate, endDate, status } = await request.json();

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
            return NextResponse.json({ error: 'Forbidden - Only admins can update sprints' }, { status: 403 });
        }

        // Verificar que el sprint existe y pertenece al proyecto
        const existingSprint = await prisma.sprint.findFirst({
            where: {
                id: sprintId,
                projectId
            }
        });

        if (!existingSprint) {
            return NextResponse.json({ error: 'Sprint not found' }, { status: 404 });
        }

        // Validar fechas si se proporcionan
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);

            if (start >= end) {
                return NextResponse.json({ error: 'Start date must be before end date' }, { status: 400 });
            }
        }

        // Construir datos de actualización
        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (description !== undefined) updateData.description = description;
        if (startDate !== undefined) updateData.startDate = new Date(startDate);
        if (endDate !== undefined) updateData.endDate = new Date(endDate);
        if (status !== undefined) updateData.status = status;
        updateData.updatedAt = new Date();

        // Actualizar el sprint
        const updatedSprint = await prisma.sprint.update({
            where: { id: sprintId },
            data: updateData,
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

        return NextResponse.json(updatedSprint);
    } catch (error) {
        console.error('Error updating sprint:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    try {
        const { userId } = auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const projectId = params.id;
        const sprintId = params.sprintId;

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
            return NextResponse.json({ error: 'Forbidden - Only admins can delete sprints' }, { status: 403 });
        }

        // Verificar que el sprint existe y pertenece al proyecto
        const existingSprint = await prisma.sprint.findFirst({
            where: {
                id: sprintId,
                projectId
            }
        });

        if (!existingSprint) {
            return NextResponse.json({ error: 'Sprint not found' }, { status: 404 });
        }

        // Mover las tareas del sprint a "sin sprint" antes de eliminarlo
        await prisma.task.updateMany({
            where: {
                sprintId: sprintId
            },
            data: {
                sprintId: null
            }
        });

        // Eliminar el sprint
        await prisma.sprint.delete({
            where: { id: sprintId }
        });

        return NextResponse.json({ message: 'Sprint deleted successfully' });
    } catch (error) {
        console.error('Error deleting sprint:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
