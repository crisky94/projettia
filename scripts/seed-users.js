const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedUsers() {
  try {
    // Crear usuarios de prueba (algunos con iniciales repetidas)
    const testUsers = [
      {
        id: 'user_test_1',
        name: 'María García',
        email: 'maria.garcia@example.com'
      },
      {
        id: 'user_test_2',
        name: 'Miguel González',
        email: 'miguel.gonzalez@example.com'
      },
      {
        id: 'user_test_3',
        name: 'Ana Martínez',
        email: 'ana.martinez@example.com'
      },
      {
        id: 'user_test_4',
        name: 'Antonio Morales',
        email: 'antonio.morales@example.com'
      },
      {
        id: 'user_test_5',
        name: 'Juan Pérez',
        email: 'juan.perez@example.com'
      },
      {
        id: 'user_test_6',
        name: 'Julia Palomo',
        email: 'julia.palomo@example.com'
      }
    ];

    console.log('Creando usuarios de prueba...');

    for (const user of testUsers) {
      await prisma.user.upsert({
        where: { email: user.email },
        update: user,
        create: user,
      });
      console.log(`✓ Usuario creado: ${user.name}`);
    }

    // Obtener el proyecto existente (asumiendo que hay uno)
    const existingProject = await prisma.project.findFirst();

    if (existingProject) {
      console.log(`\nAgregando usuarios al proyecto: ${existingProject.name}`);

      // Agregar usuarios al proyecto
      for (const user of testUsers) {
        await prisma.projectUser.upsert({
          where: {
            userId_projectId: {
              userId: user.id,
              projectId: existingProject.id
            }
          },
          update: {},
          create: {
            userId: user.id,
            projectId: existingProject.id,
            role: 'MEMBER'
          }
        });
        console.log(`✓ ${user.name} agregado al proyecto como MEMBER`);
      }
    } else {
      console.log('No se encontró ningún proyecto. Crea uno primero.');
    }

    console.log('\n🎉 Datos de prueba creados exitosamente!');
  } catch (error) {
    console.error('Error creando datos de prueba:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedUsers();
