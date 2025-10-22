import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
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
                { error: 'Not authorized to view messages in this project' },
                { status: 403 }
            );
        }

        const messages = await prisma.message.findMany({
            where: {
                projectId: params.id,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
            },
            orderBy: {
                createdAt: 'asc',
            },
        });

        return NextResponse.json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        return NextResponse.json(
            { error: 'Error fetching messages' },
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
                { error: 'Not authorized to send messages in this project' },
                { status: 403 }
            );
        }

        const { content } = await request.json();

        if (!content || !content.trim()) {
            return NextResponse.json(
                { error: 'Message content is required' },
                { status: 400 }
            );
        }

        const message = await prisma.message.create({
            data: {
                content: content.trim(),
                userId,
                projectId: params.id,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
            },
        });

        return NextResponse.json(message);
    } catch (error) {
        console.error('Error creating message:', error);
        return NextResponse.json(
            { error: 'Error creating message' },
            { status: 500 }
        );
    }
}
