import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

export async function PATCH(request, { params }) {
    try {
        const { userId } = auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id: projectId, messageId } = params;
        const { content } = await request.json();

        if (!content || !content.trim()) {
            return NextResponse.json({ error: 'Message content is required' }, { status: 400 });
        }

        // Ensure the message exists and belongs to the requesting user within the project
        const message = await prisma.message.findUnique({
            where: { id: messageId },
            select: { id: true, userId: true, projectId: true, content: true }
        });

        if (!message || message.projectId !== projectId) {
            return NextResponse.json({ error: 'Message not found' }, { status: 404 });
        }

        if (message.userId !== userId) {
            return NextResponse.json({ error: 'Not authorized to edit this message' }, { status: 403 });
        }

        // Only allow editing the user's last message in this project
        const lastMessage = await prisma.message.findFirst({
            where: { projectId, userId },
            orderBy: { createdAt: 'desc' },
            select: { id: true, content: true }
        });

        if (!lastMessage || lastMessage.id !== messageId) {
            return NextResponse.json({ error: 'Only your latest message can be edited' }, { status: 403 });
        }

        // Prevent editing a deleted message (empty content indicates deletion)
        if (!lastMessage.content || !lastMessage.content.trim()) {
            return NextResponse.json({ error: 'Cannot edit a deleted message' }, { status: 400 });
        }

        const updated = await prisma.message.update({
            where: { id: messageId },
            data: { content: content.trim() },
            include: {
                user: { select: { id: true, name: true, email: true } }
            }
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error('Error updating message:', error);
        return NextResponse.json({ error: 'Error updating message' }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    try {
        const { userId } = auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id: projectId, messageId } = params;

        // Ensure the message exists and belongs to the requesting user within the project
        const message = await prisma.message.findUnique({
            where: { id: messageId },
            select: { id: true, userId: true, projectId: true }
        });

        if (!message || message.projectId !== projectId) {
            return NextResponse.json({ error: 'Message not found' }, { status: 404 });
        }

        if (message.userId !== userId) {
            return NextResponse.json({ error: 'Not authorized to delete this message' }, { status: 403 });
        }

        // Only allow deleting the user's last message in this project
        const lastMessage = await prisma.message.findFirst({
            where: { projectId, userId },
            orderBy: { createdAt: 'desc' },
            select: { id: true }
        });

        if (!lastMessage || lastMessage.id !== messageId) {
            return NextResponse.json({ error: 'Only your latest message can be deleted' }, { status: 403 });
        }

        // Soft-delete by clearing content; keep record for timeline context
        const deleted = await prisma.message.update({
            where: { id: messageId },
            data: { content: '' },
            include: {
                user: { select: { id: true, name: true, email: true } }
            }
        });

        return NextResponse.json(deleted);
    } catch (error) {
        console.error('Error deleting message:', error);
        return NextResponse.json({ error: 'Error deleting message' }, { status: 500 });
    }
}
