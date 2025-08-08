import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request, { params }) {
    try {
        const members = await prisma.projectUser.findMany({
            where: {
                projectId: params.id,
            },
            include: {
                user: true,
            },
        });

        return NextResponse.json(members);
    } catch (error) {
        console.error('Error fetching members:', error);
        return NextResponse.json(
            { error: 'Error fetching members' },
            { status: 500 }
        );
    }
}

export async function POST(request, { params }) {
    try {
        const { email } = await request.json();

        // Buscar usuario por email
        const user = await prisma.user.findUnique({
            where: {
                email,
            },
        });

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Verificar si ya es miembro
        const existingMember = await prisma.projectUser.findUnique({
            where: {
                userId_projectId: {
                    userId: user.id,
                    projectId: params.id,
                },
            },
        });

        if (existingMember) {
            return NextResponse.json(
                { error: 'User is already a member' },
                { status: 400 }
            );
        }

        // Agregar usuario como miembro
        const member = await prisma.projectUser.create({
            data: {
                userId: user.id,
                projectId: params.id,
                role: 'USER',
            },
            include: {
                user: true,
            },
        });

        return NextResponse.json(member);
    } catch (error) {
        console.error('Error adding member:', error);
        return NextResponse.json(
            { error: 'Error adding member' },
            { status: 500 }
        );
    }
}
