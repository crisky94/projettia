import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs';
import prisma from '../../lib/prisma.js';

export async function GET() {
    try {
        const { userId } = auth();

        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get the current user from Clerk
        const user = await currentUser();

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Get or create the user in our database
        const dbUser = await prisma.user.upsert({
            where: { id: userId },
            update: {
                name: user.firstName + ' ' + user.lastName,
                email: user.emailAddresses[0].emailAddress,
            },
            create: {
                id: userId,
                name: user.firstName + ' ' + user.lastName,
                email: user.emailAddresses[0].emailAddress,
            },
        });

        // Return the user data
        return NextResponse.json({
            id: dbUser.id,
            name: dbUser.name,
            email: dbUser.email,
        });

    } catch (error) {
        console.error('Error fetching user:', error);
        return NextResponse.json(
            {
                error: 'Error fetching user',
                message: error.message || 'An unexpected error occurred'
            },
            { status: 500 }
        );
    }
}
