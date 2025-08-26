# Funcionalidad de Eliminación - Tareas y Proyectos

## Descripción

Se ha implementado la funcionalidad completa para eliminar tanto tareas como
proyectos creados, con las correspondientes validaciones de permisos y
seguridad.

## 🗑️ **Eliminación de Tareas**

### Backend (API)

**Archivo:** `/app/api/projects/[id]/tasks/[taskId]/route.js`

#### Método DELETE

- **Ruta:** `DELETE /api/projects/[id]/tasks/[taskId]`
- **Validaciones:**
  - ✅ Usuario autenticado
  - ✅ Proyecto existe
  - ✅ Usuario es propietario o administrador del proyecto
  - ✅ Tarea existe y pertenece al proyecto
- **Respuesta exitosa:**

```json
{
    "message": "Task deleted successfully",
    "taskId": "uuid"
}
```

### Frontend (TaskBoard)

**Archivo:** `/app/components/projects/TaskBoard.jsx`

#### Características:

- **Botón de eliminar:** Aparece al hacer hover sobre cada tarea (solo para
  administradores)
- **Confirmación:** Diálogo de confirmación antes de eliminar
- **Actualización inmediata:** La tarea se remueve del estado local
- **Manejo de errores:** Alertas informativas en caso de error

#### Flujo de eliminación:

1. Usuario hace hover sobre la tarea → Aparece botón "×"
2. Clic en botón → Confirmación "¿Estás seguro...?"
3. Confirmación → Llamada a API DELETE
4. Éxito → Tarea removida de la lista
5. Error → Mensaje de error mostrado

---

## 🗑️ **Eliminación de Proyectos**

### Backend (API)

**Archivo:** `/app/api/projects/[id]/route.js`

#### Método DELETE

- **Ruta:** `DELETE /api/projects/[id]`
- **Validaciones:**
  - ✅ Usuario autenticado
  - ✅ Proyecto existe
  - ✅ Solo el propietario puede eliminar el proyecto
- **Eliminación en cascada:** Usa transacciones de Prisma para eliminar:
  1. Todas las tareas del proyecto
  2. Todos los mensajes del proyecto
  3. Todos los miembros del proyecto
  4. El proyecto mismo

- **Respuesta exitosa:**

```json
{
    "message": "Project deleted successfully",
    "projectId": "uuid",
    "deletedCounts": {
        "tasks": 5,
        "members": 3,
        "messages": 12
    }
}
```

### Frontend (ProjectPage)

**Archivo:** `/app/projects/[id]/page.jsx`

#### Características:

- **Botón de eliminar:** Solo visible para el propietario del proyecto
- **Doble confirmación:** Dos diálogos de confirmación para prevenir
  eliminaciones accidentales
- **Redirección automática:** Redirige al dashboard después de la eliminación
- **Estado de carga:** Interfaz bloqueada durante la eliminación

#### Flujo de eliminación:

1. Solo propietario ve el botón "Delete Project"
2. Clic → Primera confirmación general
3. Confirmación → Segunda confirmación (datos permanentes)
4. Confirmación → Llamada a API DELETE
5. Éxito → Redirección a /dashboard
6. Error → Mensaje de error y vuelta al proyecto

---

## 🔐 **Permisos y Seguridad**

### Eliminación de Tareas:

- ✅ **Propietarios del proyecto:** Pueden eliminar cualquier tarea
- ✅ **Administradores del proyecto:** Pueden eliminar cualquier tarea
- ❌ **Miembros regulares:** No pueden eliminar tareas
- ❌ **Usuarios no autenticados:** Acceso denegado

### Eliminación de Proyectos:

- ✅ **Solo el propietario:** Puede eliminar el proyecto
- ❌ **Administradores:** No pueden eliminar proyectos (solo editar)
- ❌ **Miembros:** No pueden eliminar proyectos
- ❌ **Usuarios no autenticados:** Acceso denegado

---

## 🎯 **Experiencia de Usuario**

### Para Tareas:

- **Visual:** Botón de eliminar solo aparece al hacer hover
- **Intuitivo:** Icono "×" universalmente reconocido
- **Seguro:** Confirmación antes de eliminar
- **Inmediato:** Actualización instantánea de la interfaz

### Para Proyectos:

- **Claro:** Botón rojo "Delete Project" solo para propietarios
- **Seguro:** Doble confirmación con advertencias claras
- **Informativo:** Explica que se eliminarán todos los datos
- **Automático:** Redirección al dashboard tras eliminación

---

## 📋 **Casos de Uso**

### Eliminación de Tareas:

1. **Tarea completada incorrectamente:** Admin puede eliminar en lugar de mover
   a "Completed"
2. **Tarea duplicada:** Eliminar duplicados manteniendo solo una
3. **Tarea obsoleta:** Remover tareas que ya no son relevantes
4. **Limpieza de proyecto:** Eliminar tareas de prueba o temporales

### Eliminación de Proyectos:

1. **Proyecto cancelado:** Eliminar completamente un proyecto que no continuará
2. **Proyecto de prueba:** Remover proyectos creados para testing
3. **Proyecto duplicado:** Eliminar duplicados manteniendo el correcto
4. **Limpieza de cuenta:** Remover proyectos antiguos o no utilizados

---

## 🔧 **Implementación Técnica**

### API Endpoints:

```javascript
// Eliminar tarea
DELETE / api / projects / [projectId] / tasks / [taskId];

// Eliminar proyecto
DELETE / api / projects / [projectId];
```

### Componentes Frontend:

```jsx
// Botón eliminar tarea (en TaskCard)
{
    isAdmin && onDeleteTask && (
        <button onClick={() => onDeleteTask(task.id)}>×</button>
    );
}

// Botón eliminar proyecto (en ProjectPage)
{
    isProjectOwner && (
        <button onClick={handleDeleteProject}>Delete Project</button>
    );
}
```

### Manejo de Estados:

```javascript
// Actualización local tras eliminar tarea
setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));

// Redirección tras eliminar proyecto
window.location.href = "/dashboard";
```

---

## ⚠️ **Consideraciones Importantes**

### Seguridad:

- **Validación doble:** Backend y frontend validan permisos
- **Transacciones:** Eliminación atómica en base de datos
- **Confirmaciones:** Múltiples confirmaciones para acciones destructivas

### Datos:

- **Eliminación permanente:** No hay papelera de reciclaje
- **Cascada completa:** Proyectos eliminan todos sus datos relacionados
- **Sin recuperación:** Los datos eliminados no se pueden restaurar

### Rendimiento:

- **Transacciones:** Eliminación rápida y consistente
- **UI inmediata:** Actualización optimista de la interfaz
- **Mínimas llamadas:** Solo una API call por eliminación

---

## 🚀 **Próximas Mejoras**

### Posibles funcionalidades futuras:

1. **Papelera de reciclaje:** Eliminación suave con posibilidad de restaurar
2. **Logs de auditoría:** Registrar quién eliminó qué y cuándo
3. **Eliminación masiva:** Seleccionar y eliminar múltiples tareas
4. **Confirmación por email:** Enviar confirmación de eliminaciones importantes
5. **Exportar antes de eliminar:** Backup automático antes de eliminar proyectos
6. **Archivado:** Alternativa a la eliminación para proyectos completados

---

## 🧪 **Testing**

### Para probar la funcionalidad:

#### Tareas:

1. Crear un proyecto y agregar tareas
2. Como admin/propietario: hover sobre tarea → clic "×" → confirmar
3. Como miembro regular: no debería ver botones de eliminar
4. Verificar que la tarea desaparece inmediatamente

#### Proyectos:

1. Como propietario: ver botón "Delete Project"
2. Clic → confirmar dos veces → verificar redirección
3. Como admin/miembro: no debería ver el botón
4. Verificar que el proyecto ya no existe en el dashboard

La funcionalidad está completamente implementada y lista para usar! 🎉
