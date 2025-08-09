import { PrismaClient } from '@prisma/client';

let prisma;

if (process.env.NODE_ENV === 'production') {
    prisma = new PrismaClient();
} else {
    if (!global.prisma) {
        global.prisma = new PrismaClient({
            log: [
                {
                    emit: 'event',
                    level: 'query',
                },
                {
                    emit: 'event',
                    level: 'error',
                },
                {
                    emit: 'event',
                    level: 'warn',
                },
            ],
        });

        global.prisma.$on('query', (e) => {
            console.log('Query:', e.query);
            console.log('Duration:', e.duration + 'ms');
        });

        global.prisma.$on('error', (e) => {
            console.error('Prisma Error:', e.message);
            console.error('Target:', e.target);
        });

        global.prisma.$on('warn', (e) => {
            console.warn('Prisma Warning:', e.message);
        });
    }
    prisma = global.prisma;
}

export default prisma;
