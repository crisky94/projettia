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

        // Get or create the user in our database with robust conflict handling
        const email = user.emailAddresses[0].emailAddress;
        const name = user.firstName + ' ' + user.lastName;

        let dbUser = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!dbUser) {
            // Check for record with same email but different ID
            const existingByEmail = await prisma.user.findUnique({
                where: { email }
            });

            if (existingByEmail) {
                console.log(`Clashing email detected: ${email}. Releasing email from old ID ${existingByEmail.id}`);
                await prisma.user.update({
                    where: { id: existingByEmail.id },
                    data: { email: `${email}_old_${Date.now()}` }
                });
            }

            dbUser = await prisma.user.create({
                data: {
                    id: userId,
                    name,
                    email,
                },
            });
        } else {
            // Update existing user
            dbUser = await prisma.user.update({
                where: { id: userId },
                data: { name, email }
            });
        }

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
