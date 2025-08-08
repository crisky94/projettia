import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request, { params }) {
    try {
        const tasks = await prisma.task.findMany({
            where: {
                projectId: params.id,
            },
            include: {
                assignee: true,
            },
        });

        return NextResponse.json(tasks);
    } catch (error) {
        console.error('Error fetching tasks:', error);
        return NextResponse.json(
            { error: 'Error fetching tasks' },
            { status: 500 }
        );
    }
}

export async function POST(request, { params }) {
    try {
        const { title, description, assigneeId } = await request.json();
        const task = await prisma.task.create({
            data: {
                title,
                description,
                projectId: params.id,
                assigneeId,
                status: 'PENDING',
            },
            include: {
                assignee: true,
            },
        });

        return NextResponse.json(task);
    } catch (error) {
        console.error('Error creating task:', error);
        return NextResponse.json(
            { error: 'Error creating task' },
            { status: 500 }
        );
    }
}

export async function PATCH(request, { params }) {
    try {
        const { id, taskId } = params;
        const { status } = await request.json();

        const task = await prisma.task.update({
            where: {
                id: taskId,
                projectId: id,
            },
            data: {
                status,
            },
            include: {
                assignee: true,
            },
        });

        return NextResponse.json(task);
    } catch (error) {
        console.error('Error updating task:', error);
        return NextResponse.json(
            { error: 'Error updating task' },
            { status: 500 }
        );
    }
}
