import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request, { params }) {
    try {
        const messages = await prisma.message.findMany({
            where: {
                projectId: params.id,
            },
            include: {
                user: true,
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
        const { content, userId } = await request.json();
        const message = await prisma.message.create({
            data: {
                content,
                userId,
                projectId: params.id,
            },
            include: {
                user: true,
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
