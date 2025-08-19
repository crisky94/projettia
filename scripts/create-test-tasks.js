const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createTestTasks() {
  try {
    // Obtener el proyecto existente
    const project = await prisma.project.findFirst();
    
    if (!project) {
      console.log('No se encontró ningún proyecto.');
      return;
    }

    // Obtener usuarios de prueba
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { email: { contains: 'example.com' } },
          { email: 'criistiiniilla.1994@gmail.com' }
        ]
      }
    });

    if (users.length === 0) {
      console.log('No se encontraron usuarios de prueba.');
      return;
    }

    console.log(`Creando tareas de prueba en el proyecto: ${project.name}`);
    console.log(`Usuarios disponibles: ${users.length}`);

    // Crear tareas de prueba
    const testTasks = [
      {
        title: 'Revisar documentación',
        description: 'Revisar y actualizar la documentación del proyecto',
        assigneeId: users.find(u => u.name.includes('María'))?.id || users[0].id,
        status: 'PENDING'
      },
      {
        title: 'Implementar autenticación',
        description: 'Implementar sistema de autenticación con JWT',
        assigneeId: users.find(u => u.name.includes('Miguel'))?.id || users[1]?.id || users[0].id,
        status: 'IN_PROGRESS'
      },
      {
        title: 'Diseñar interfaz',
        description: 'Crear mockups y diseños de la interfaz de usuario',
        assigneeId: users.find(u => u.name.includes('Ana'))?.id || users[2]?.id || users[0].id,
        status: 'PENDING'
      },
      {
        title: 'Configurar base de datos',
        description: 'Configurar y optimizar la base de datos',
        assigneeId: users.find(u => u.name.includes('Antonio'))?.id || users[3]?.id || users[0].id,
        status: 'COMPLETED'
      },
      {
        title: 'Testing unitario',
        description: 'Escribir tests unitarios para los componentes principales',
        assigneeId: users.find(u => u.name.includes('Juan'))?.id || users[4]?.id || users[0].id,
        status: 'IN_PROGRESS'
      },
      {
        title: 'Optimizar rendimiento',
        description: 'Optimizar el rendimiento de la aplicación',
        assigneeId: users.find(u => u.name.includes('Julia'))?.id || users[5]?.id || users[0].id,
        status: 'PENDING'
      }
    ];

    for (const task of testTasks) {
      await prisma.task.create({
        data: {
          ...task,
          projectId: project.id,
        },
      });
      console.log(`✓ Tarea creada: ${task.title} (asignada a ID: ${task.assigneeId})`);
    }

    console.log('\n🎉 Tareas de prueba creadas exitosamente!');
    console.log('\nResumen:');
    console.log(`- ${testTasks.filter(t => t.status === 'PENDING').length} tareas pendientes`);
    console.log(`- ${testTasks.filter(t => t.status === 'IN_PROGRESS').length} tareas en progreso`);
    console.log(`- ${testTasks.filter(t => t.status === 'COMPLETED').length} tareas completadas`);

  } catch (error) {
    console.error('Error creando tareas de prueba:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestTasks();
