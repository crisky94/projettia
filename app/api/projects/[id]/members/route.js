import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import prisma from '@/lib/prisma';

export async function GET(request, { params }) {
    try {
        const { userId: currentUserId } = auth();

        if (!currentUserId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const members = await prisma.projectUser.findMany({
            where: {
                projectId: params.id,
            },
            include: {
                user: true,
            },
        });

        // Verificar los permisos del usuario actual
        const project = await prisma.project.findUnique({
            where: {
                id: params.id,
            },
        });

        const currentUserMember = await prisma.projectUser.findUnique({
            where: {
                userId_projectId: {
                    userId: currentUserId,
                    projectId: params.id,
                },
            },
        });

        const isProjectOwner = project?.ownerId === currentUserId;
        const isProjectAdmin = currentUserMember?.role === 'ADMIN';
        const canManageMembers = isProjectOwner || isProjectAdmin;

        return NextResponse.json({
            members,
            permissions: {
                canManageMembers,
                isProjectOwner,
                isProjectAdmin,
            },
        });
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

export async function DELETE(request, { params }) {
    try {
        const { userId: currentUserId } = auth();

        if (!currentUserId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { userId } = await request.json();

        if (!userId) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 400 }
            );
        }

        // Verificar que el usuario actual tenga permisos de administrador en el proyecto
        const currentUserMember = await prisma.projectUser.findUnique({
            where: {
                userId_projectId: {
                    userId: currentUserId,
                    projectId: params.id,
                },
            },
        });

        // También verificar si es el dueño del proyecto
        const project = await prisma.project.findUnique({
            where: {
                id: params.id,
            },
        });

        const isProjectOwner = project?.ownerId === currentUserId;
        const isProjectAdmin = currentUserMember?.role === 'ADMIN';

        if (!isProjectOwner && !isProjectAdmin) {
            return NextResponse.json(
                { error: 'Only project administrators can remove members' },
                { status: 403 }
            );
        }

        // Verificar que el miembro existe
        const memberToRemove = await prisma.projectUser.findUnique({
            where: {
                userId_projectId: {
                    userId: userId,
                    projectId: params.id,
                },
            },
            include: {
                user: true,
            },
        });

        if (!memberToRemove) {
            return NextResponse.json(
                { error: 'Member not found in project' },
                { status: 404 }
            );
        }

        // No permitir que el dueño del proyecto se elimine a sí mismo
        if (project?.ownerId === userId) {
            return NextResponse.json(
                { error: 'Project owner cannot be removed' },
                { status: 400 }
            );
        }

        // Eliminar el miembro del proyecto
        await prisma.projectUser.delete({
            where: {
                userId_projectId: {
                    userId: userId,
                    projectId: params.id,
                },
            },
        });

        return NextResponse.json({
            message: 'Member removed successfully',
            removedMember: memberToRemove,
        });
    } catch (error) {
        console.error('Error removing member:', error);
        return NextResponse.json(
            { error: 'Error removing member' },
            { status: 500 }
        );
    }
}
