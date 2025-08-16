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
            assignee: task.assignee ? {
                id: task.assignee.id.toString(),
                name: task.assignee.name,
                email: task.assignee.email
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
        const { title, description, assigneeEmail, status = 'PENDING' } = body;

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

        // Si se proporciona un email de asignación, buscar el usuario
        let assigneeId = null;
        if (assigneeEmail) {
            const assignee = await prisma.user.findFirst({
                where: { email: assigneeEmail }
            });
            if (!assignee) {
                return NextResponse.json(
                    { error: 'Assignee not found' },
                    { status: 404 }
                );
            }
            // Verificar que el asignado es miembro del proyecto
            const isMember = project.members.some(member => member.userId === assignee.id);
            if (!isMember && assignee.id !== project.ownerId) {
                return NextResponse.json(
                    { error: 'Assignee must be a member of the project' },
                    { status: 400 }
                );
            }
            assigneeId = assignee.id;
        }

        // Crear la tarea
        const task = await prisma.task.create({
            data: {
                title,
                description,
                status,
                projectId: params.id,
                assigneeId
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
