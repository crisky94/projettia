# Gestión de Miembros del Proyecto

## Descripción

Se ha implementado la funcionalidad para que los administradores puedan eliminar
miembros de los proyectos. Solo los usuarios con permisos de administrador
(propietarios del proyecto o usuarios con rol ADMIN) pueden eliminar miembros.

## Funcionalidades Implementadas

### 1. API Backend (`/app/api/projects/[id]/members/route.js`)

#### Método GET

- Actualizado para incluir información sobre los permisos del usuario actual
- Devuelve:
  - `members`: Lista de miembros del proyecto
  - `permissions`: Objeto con información sobre permisos del usuario actual
    - `canManageMembers`: Si el usuario puede gestionar miembros
    - `isProjectOwner`: Si el usuario es el propietario del proyecto
    - `isProjectAdmin`: Si el usuario tiene rol de administrador

#### Método DELETE (Nuevo)

- Permite eliminar miembros del proyecto
- Validaciones implementadas:
  - Verificar que el usuario está autenticado
  - Verificar que el usuario tiene permisos (es propietario o administrador)
  - No permitir eliminar al propietario del proyecto
  - Verificar que el miembro existe en el proyecto
- Devuelve información del miembro eliminado tras la operación exitosa

### 2. Frontend (`/app/projects/[id]/page.jsx`)

#### Nuevas funcionalidades:

- **Modal de gestión de miembros**: Botón "Ver Miembros" que muestra lista
  completa de miembros
- **Botón eliminar miembro**: Solo visible para administradores y no disponible
  para el propietario
- **Estados de carga**: Indicador visual durante la eliminación
- **Confirmación de eliminación**: Diálogo de confirmación antes de eliminar
- **Interfaz multiidioma**: Textos en español

#### Componentes actualizados:

- Lista de miembros con roles claramente identificados
  (Propietario/Administrador/Miembro)
- Botones de acción contextuales según permisos
- Gestión mejorada de estados de carga y errores

## Permisos y Roles

### Roles del Sistema:

- **Propietario del proyecto**: Usuario que creó el proyecto (`project.ownerId`)
- **Administrador**: Usuario con `role: 'ADMIN'` en `ProjectUser`
- **Miembro**: Usuario con `role: 'USER'` en `ProjectUser`

### Permisos de eliminación:

- ✅ **Propietario**: Puede eliminar cualquier miembro excepto a sí mismo
- ✅ **Administrador**: Puede eliminar miembros regulares (no puede eliminar al
  propietario)
- ❌ **Miembro**: No puede eliminar a otros miembros

### Restricciones:

- El propietario del proyecto no puede ser eliminado
- Solo usuarios con permisos administrativos pueden acceder a las funciones de
  eliminación
- Se requiere confirmación explícita antes de eliminar un miembro

## Uso

### Para Administradores:

1. Acceder a la página del proyecto
2. Hacer clic en "Ver Miembros (X)" para abrir el modal de gestión
3. Localizar el miembro a eliminar
4. Hacer clic en "Eliminar" junto al miembro deseado
5. Confirmar la acción en el diálogo de confirmación
6. El miembro será removido inmediatamente de la lista

### Para Miembros Regulares:

- Solo pueden ver la lista de miembros
- No tienen acceso a funciones de eliminación
- Pueden ver los roles de cada miembro

## Seguridad

- Todas las validaciones se realizan tanto en frontend como backend
- Autenticación requerida para todas las operaciones
- Verificación de permisos en cada request
- Prevención de eliminación accidental del propietario
- Logs de errores para monitoreo y debugging

## Estructura de Datos

### ProjectUser Model (Prisma):

```prisma
model ProjectUser {
  id        String   @id @default(uuid())
  userId    String
  projectId String
  role      UserRole @default(USER)
  user      User     @relation(fields: [userId], references: [id])
  project   Project  @relation(fields: [projectId], references: [id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([userId, projectId])
}

enum UserRole {
  ADMIN
  USER
}
```

## API Endpoints

### GET `/api/projects/[id]/members`

Obtiene la lista de miembros con información de permisos.

**Response:**

```json
{
  "members": [
    {
      "id": "uuid",
      "userId": "uuid",
      "projectId": "uuid",
      "role": "USER|ADMIN",
      "user": {
        "id": "uuid",
        "name": "string",
        "email": "string"
      }
    }
  ],
  "permissions": {
    "canManageMembers": boolean,
    "isProjectOwner": boolean,
    "isProjectAdmin": boolean
  }
}
```

### DELETE `/api/projects/[id]/members`

Elimina un miembro del proyecto.

**Request Body:**

```json
{
  "userId": "uuid"
}
```

**Response:**

```json
{
  "message": "Member removed successfully",
  "removedMember": {
    "id": "uuid",
    "userId": "uuid",
    "user": {
      "name": "string",
      "email": "string"
    }
  }
}
```

## Posibles Mejoras Futuras

1. **Asignación de roles**: Permitir cambiar roles de miembros (USER ↔ ADMIN)
2. **Transferencia de propiedad**: Permitir transferir la propiedad del proyecto
3. **Logs de auditoría**: Registrar quién eliminó a qué miembro y cuándo
4. **Notificaciones**: Notificar al miembro eliminado via email
5. **Eliminación en lote**: Permitir eliminar múltiples miembros a la vez
6. **Permisos granulares**: Roles más específicos con permisos detallados

## Testing

Para probar la funcionalidad:

1. Crear un proyecto como propietario
2. Agregar algunos miembros al proyecto
3. Intentar eliminar miembros como propietario (debería funcionar)
4. Cambiar a una cuenta de miembro regular e intentar eliminar (debería fallar)
5. Intentar eliminar al propietario (debería mostrar error)
6. Verificar que los miembros eliminados ya no aparecen en la lista
