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

        // Verificar que el proyecto existe y el usuario tiene acceso
        const project = await prisma.project.findUnique({
            where: { id: params.id },
            include: {
                members: true
            }
        });

        if (!project) {
            return NextResponse.json(
                { error: 'Project not found' },
                { status: 404 }
            );
        }

        // Verificar si el usuario tiene acceso al proyecto
        const isOwner = project.ownerId === userId;
        const isMember = project.members.some(member => member.userId === userId);

        if (!isOwner && !isMember) {
            return NextResponse.json(
                { error: 'Not authorized to view tasks in this project' },
                { status: 403 }
            );
        }

        const rawTasks = await prisma.task.findMany({
            where: {
                projectId: params.id
            },
            include: {
                assignee: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                sprint: {
                    select: {
                        id: true,
                        name: true,
                        status: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Asegurarse de que todas las tareas tengan el formato correcto
        const tasks = rawTasks.map(task => ({
            ...task,
            id: task.id.toString(), // Asegurarse de que el ID sea string
            status: task.status || 'PENDING', // Asegurar que haya un estado
            estimatedHours: task.estimatedHours || null,
            assignee: task.assignee ? {
                id: task.assignee.id.toString(),
                name: task.assignee.name,
                email: task.assignee.email
            } : null,
            sprint: task.sprint ? {
                id: task.sprint.id.toString(),
                name: task.sprint.name,
                status: task.sprint.status
            } : null
        }));

        console.log('Sending tasks:', tasks);

        return NextResponse.json(tasks);
    } catch (error) {
        console.error('Error fetching tasks:', error);
        return NextResponse.json(
            {
                error: 'Error fetching tasks',
                message: error.message || 'An unexpected error occurred'
            },
            { status: 500 }
        );
    }
}

export async function POST(request, { params }) {
    try {
        const { userId } = auth();

        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { title, description, assigneeId, status = 'PENDING', sprintId, estimatedHours } = body;

        // Verificar que el proyecto existe y el usuario tiene acceso
        const project = await prisma.project.findUnique({
            where: { id: params.id },
            include: {
                members: true
            }
        });

        if (!project) {
            return NextResponse.json(
                { error: 'Project not found' },
                { status: 404 }
            );
        }

        // Verificar si el usuario tiene acceso al proyecto
        const isOwner = project.ownerId === userId;
        const isMember = project.members.some(member => member.userId === userId);

        if (!isOwner && !isMember) {
            return NextResponse.json(
                { error: 'Not authorized to create tasks in this project' },
                { status: 403 }
            );
        }

        // Validar estimatedHours si se proporciona
        if (estimatedHours && (estimatedHours < 0 || estimatedHours > 1000)) {
            return NextResponse.json(
                { error: 'Estimated hours must be between 0 and 1000' },
                { status: 400 }
            );
        }

        // Si se proporciona sprintId, verificar que el sprint existe y pertenece al proyecto
        if (sprintId) {
            const sprint = await prisma.sprint.findFirst({
                where: {
                    id: sprintId,
                    projectId: params.id
                }
            });

            if (!sprint) {
                return NextResponse.json(
                    { error: 'Sprint not found or does not belong to this project' },
                    { status: 400 }
                );
            }
        }

        // Si se proporciona un ID de asignación, verificar que el usuario sea miembro
        let finalAssigneeId = null;
        if (assigneeId) {
            // Verificar que el asignado es miembro del proyecto
            const isMember = project.members.some(member => member.userId === assigneeId);
            if (!isMember && assigneeId !== project.ownerId) {
                return NextResponse.json(
                    { error: 'Assignee must be a member of the project' },
                    { status: 400 }
                );
            }
            finalAssigneeId = assigneeId;
        }

        // Crear la tarea
        const task = await prisma.task.create({
            data: {
                title,
                description,
                status,
                estimatedHours: estimatedHours ? parseFloat(estimatedHours) : null,
                sprintId: sprintId || null,
                projectId: params.id,
                assigneeId: finalAssigneeId
            },
            include: {
                assignee: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                sprint: {
                    select: {
                        id: true,
                        name: true,
                        status: true
                    }
                }
            }
        });

        return NextResponse.json(task);
    } catch (error) {
        console.error('Error creating task:', error);
        return NextResponse.json(
            {
                error: 'Error creating task',
                message: error.message || 'An unexpected error occurred'
            },
            { status: 500 }
        );
    }
}

export async function PATCH(request, { params }) {
    try {
        const { userId } = auth();

        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { id, taskId } = params;
        const { status } = await request.json();

        // Verificar que el proyecto existe y el usuario tiene acceso
        const project = await prisma.project.findUnique({
            where: { id },
            include: {
                members: true
            }
        });

        if (!project) {
            return NextResponse.json(
                { error: 'Project not found' },
                { status: 404 }
            );
        }

        // Verificar si el usuario tiene acceso al proyecto
        const isOwner = project.ownerId === userId;
        const isMember = project.members.some(member => member.userId === userId);

        if (!isOwner && !isMember) {
            return NextResponse.json(
                { error: 'Not authorized to update tasks in this project' },
                { status: 403 }
            );
        }

        const task = await prisma.task.update({
            where: {
                id: taskId,
                projectId: id
            },
            data: {
                status
            },
            include: {
                assignee: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });

        return NextResponse.json(task);
    } catch (error) {
        console.error('Error updating task:', error);
        return NextResponse.json(
            {
                error: 'Error updating task',
                message: error.message || 'An unexpected error occurred'
            },
            { status: 500 }
        );
    }
}
