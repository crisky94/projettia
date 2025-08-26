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
        const { status, title, description, assigneeId, sprintId, estimatedHours } = await request.json();

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

        // Validaciones adicionales
        if (estimatedHours && (estimatedHours < 0 || estimatedHours > 1000)) {
            return NextResponse.json(
                { error: 'Estimated hours must be between 0 and 1000' },
                { status: 400 }
            );
        }

        if (sprintId) {
            const sprint = await prisma.sprint.findFirst({
                where: {
                    id: sprintId,
                    projectId: projectId
                }
            });

            if (!sprint) {
                return NextResponse.json(
                    { error: 'Sprint not found or does not belong to this project' },
                    { status: 400 }
                );
            }
        }

        if (assigneeId) {
            const isMember = project.members.some(member => member.userId === assigneeId);
            if (!isMember && assigneeId !== project.ownerId) {
                return NextResponse.json(
                    { error: 'Assignee must be a member of the project' },
                    { status: 400 }
                );
            }
        }

        // Construir datos de actualización
        const updateData = {};
        if (status !== undefined) updateData.status = status;
        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (assigneeId !== undefined) updateData.assigneeId = assigneeId;
        if (sprintId !== undefined) updateData.sprintId = sprintId;
        if (estimatedHours !== undefined) updateData.estimatedHours = estimatedHours ? parseFloat(estimatedHours) : null;
        updateData.updatedAt = new Date();

        // Actualizar la tarea
        const updatedTask = await prisma.task.update({
            where: {
                id: taskId
            },
            data: updateData,
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

        // Convertir el ID a string para consistencia con el frontend
        const taskWithStringId = {
            ...updatedTask,
            id: updatedTask.id.toString(),
            assignee: updatedTask.assignee ? {
                ...updatedTask.assignee,
                id: updatedTask.assignee.id.toString()
            } : null,
            sprint: updatedTask.sprint ? {
                ...updatedTask.sprint,
                id: updatedTask.sprint.id.toString()
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
