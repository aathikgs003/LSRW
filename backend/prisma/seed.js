const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

async function main() {
    const hashedPassword = await bcrypt.hash('password123', 10);

    // 1. Create Organization
    const org = await prisma.organization.upsert({
        where: { subdomain: 'fluent' },
        update: {},
        create: {
            name: 'FluentPro University',
            subdomain: 'fluent',
        },
    });

    console.log('Organization created:', org.name);

    // 2. Create Admin
    const admin = await prisma.user.upsert({
        where: { email: 'admin@fluentpro.com' },
        update: {},
        create: {
            email: 'admin@fluentpro.com',
            password: hashedPassword,
            firstName: 'System',
            lastName: 'Administrator',
            role: 'ADMIN',
            organizationId: org.id,
        },
    });

    // 3. Create Teacher
    const teacher = await prisma.user.upsert({
        where: { email: 'teacher@fluentpro.com' },
        update: {},
        create: {
            email: 'teacher@fluentpro.com',
            password: hashedPassword,
            firstName: 'Sarah',
            lastName: 'Instructor',
            role: 'TEACHER',
            organizationId: org.id,
        },
    });

    // 4. Create Student
    const student = await prisma.user.upsert({
        where: { email: 'student@fluentpro.com' },
        update: {},
        create: {
            email: 'student@fluentpro.com',
            password: hashedPassword,
            firstName: 'Alex',
            lastName: 'Learner',
            role: 'STUDENT',
            organizationId: org.id,
            teacherId: teacher.id,
        },
    });

    // 5. Create some Tasks
    const task1 = await prisma.task.create({
        data: {
            title: 'AI and the Future of Work',
            type: 'WRITING',
            difficulty: 'INTERMEDIATE',
            description: 'Write an essay about the impact of AI on the global workforce.',
            instructions: 'AI future work automation productivity skills economy',
            organizationId: org.id,
            timeLimit: 1800 // 30 mins
        }
    });

    const task2 = await prisma.task.create({
        data: {
            title: 'Cloud Computing Essentials',
            type: 'READING',
            difficulty: 'INTERMEDIATE',
            passage: 'Cloud computing provides on-demand computing resources over the internet...',
            description: 'Understand the core concepts of cloud computing architecture.',
            organizationId: org.id,
            timeLimit: 1200 // 20 mins
        }
    });

    console.log('Seed data created successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
