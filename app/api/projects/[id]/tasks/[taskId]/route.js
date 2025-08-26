import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import prisma from '../../../../../lib/prisma.js';

export async function PATCH(request, { params }) {
    try {
        const { userId } = auth();

        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { id: projectId, taskId } = params;
        const { status } = await request.json();

        // Verificar que el proyecto existe y el usuario tiene acceso
        const project = await prisma.project.findUnique({
            where: { id: projectId },
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

        // Verificar que la tarea existe y pertenece al proyecto
        const existingTask = await prisma.task.findFirst({
            where: {
                id: taskId,
                projectId: projectId
            }
        });

        if (!existingTask) {
            return NextResponse.json(
                { error: 'Task not found' },
                { status: 404 }
            );
        }

        // Actualizar la tarea
        const updatedTask = await prisma.task.update({
            where: {
                id: taskId
            },
            data: {
                status: status || existingTask.status
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

        // Convertir el ID a string para consistencia con el frontend
        const taskWithStringId = {
            ...updatedTask,
            id: updatedTask.id.toString(),
            assignee: updatedTask.assignee ? {
                ...updatedTask.assignee,
                id: updatedTask.assignee.id.toString()
            } : null
        };

        return NextResponse.json(taskWithStringId);
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

export async function DELETE(request, { params }) {
    try {
        const { userId } = auth();

        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { id: projectId, taskId } = params;

        // Verificar que el proyecto existe y el usuario tiene acceso
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: {
                members: {
                    where: {
                        userId: userId
                    }
                }
            }
        });

        if (!project) {
            return NextResponse.json(
                { error: 'Project not found' },
                { status: 404 }
            );
        }

        // Verificar si el usuario tiene permisos para eliminar tareas
        const isOwner = project.ownerId === userId;
        const isAdmin = project.members.length > 0 && project.members[0].role === 'ADMIN';

        if (!isOwner && !isAdmin) {
            return NextResponse.json(
                { error: 'Not authorized to delete tasks in this project' },
                { status: 403 }
            );
        }

        // Verificar que la tarea existe y pertenece al proyecto
        const existingTask = await prisma.task.findFirst({
            where: {
                id: taskId,
                projectId: projectId
            }
        });

        if (!existingTask) {
            return NextResponse.json(
                { error: 'Task not found' },
                { status: 404 }
            );
        }

        // Eliminar la tarea
        await prisma.task.delete({
            where: {
                id: taskId
            }
        });

        return NextResponse.json({
            message: 'Task deleted successfully',
            taskId: taskId
        });
    } catch (error) {
        console.error('Error deleting task:', error);
        return NextResponse.json(
            {
                error: 'Error deleting task',
                message: error.message || 'An unexpected error occurred'
            },
            { status: 500 }
        );
    }
}
