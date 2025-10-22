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
      select: { id: true, userId: true, projectId: true }
    });

    if (!message || message.projectId !== projectId) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    if (message.userId !== userId) {
      return NextResponse.json({ error: 'Not authorized to edit this message' }, { status: 403 });
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
