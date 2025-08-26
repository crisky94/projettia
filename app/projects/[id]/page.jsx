'use client';
import { useState, useEffect } from 'react';
import TaskBoard from '../../components/projects/TaskBoard';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';

export default function ProjectPage({ params }) {
    const [project, setProject] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [members, setMembers] = useState([]);
    const [memberPermissions, setMemberPermissions] = useState({ canManageMembers: false, isProjectOwner: false, isProjectAdmin: false });
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddMemberModal, setShowAddMemberModal] = useState(false);
    const [showMembersModal, setShowMembersModal] = useState(false);
    const [showEditProjectModal, setShowEditProjectModal] = useState(false);
    const [newMemberEmail, setNewMemberEmail] = useState('');
    const [removingMember, setRemovingMember] = useState(null);
    const [editingProject, setEditingProject] = useState(false);
    const [editProjectData, setEditProjectData] = useState({
        name: '',
        description: ''
    });
    const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
    const [deleteConfirmStep, setDeleteConfirmStep] = useState(1);
    const [showRemoveMemberModal, setShowRemoveMemberModal] = useState(false);
    const [memberToRemove, setMemberToRemove] = useState(null);

    useEffect(() => {
        async function fetchProjectData() {
            try {
                setLoading(true);
                setError(null);

                // Fetch project data
                const projectRes = await fetch(`/api/projects/${params.id}`);
                const projectData = await projectRes.json();
                if (!projectRes.ok) {
                    throw new Error(projectData.message || projectData.error || 'Failed to load project');
                }
                console.log('Project data:', projectData);
                setProject(projectData);

                // Fetch tasks
                const tasksRes = await fetch(`/api/projects/${params.id}/tasks`);
                const tasksData = await tasksRes.json();
                if (!tasksRes.ok) {
                    throw new Error(tasksData.message || tasksData.error || 'Failed to load tasks');
                }
                console.log('Tasks data:', tasksData);
                if (Array.isArray(tasksData)) {
                    // Ensure all tasks have a status
                    const validatedTasks = tasksData.map(task => ({
                        ...task,
                        status: task.status || 'PENDING' // Default to PENDING if no status
                    }));
                    setTasks(validatedTasks);
                } else {
                    console.error('Tasks data is not an array:', tasksData);
                    setTasks([]);
                }

                // Fetch members
                const membersRes = await fetch(`/api/projects/${params.id}/members`);
                const membersData = await membersRes.json();
                if (!membersRes.ok) {
                    console.error('Members API error:', membersData);
                    // En caso de error, inicializar con valores por defecto
                    setMembers([]);
                    setMemberPermissions({ canManageMembers: false, isProjectOwner: false, isProjectAdmin: false });
                    // No lanzar error aquí para permitir que el resto de la app funcione
                } else {
                    console.log('Members data:', membersData);
                    setMembers(Array.isArray(membersData.members) ? membersData.members : []);
                    setMemberPermissions(membersData.permissions || { canManageMembers: false, isProjectOwner: false, isProjectAdmin: false });
                }

                // Get current user
                const userRes = await fetch('/api/user');
                const userData = await userRes.json();
                if (!userRes.ok) {
                    throw new Error(userData.message || userData.error || 'Failed to load user');
                }
                console.log('User data:', userData);
                setUser(userData);

            } catch (err) {
                setError(err.message);
                console.error('Error fetching project data:', err);
            } finally {
                setLoading(false);
            }
        }

        fetchProjectData();
    }, [params.id]);

    const canManageMembers = memberPermissions?.canManageMembers || false;
    const isProjectOwner = memberPermissions?.isProjectOwner || false;

    const handleAddMember = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`/api/projects/${project.id}/members`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: newMemberEmail,
                }),
            });

            if (!response.ok) throw new Error('Failed to add member');

            // Actualizar la lista de miembros
            const newMember = await response.json();
            setMembers([...members, newMember]);
            setShowAddMemberModal(false);
            setNewMemberEmail('');

            // Mostrar notificación de éxito
            toast.success('¡Miembro agregado exitosamente!', {
                position: 'top-right',
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        } catch (error) {
            console.error('Error adding member:', error);
            setShowAddMemberModal(false);

            // Mostrar notificación de error
            toast.error(error.message || 'Error al agregar miembro', {
                position: 'top-right',
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        }
    };

    const handleRemoveMember = async (userId) => {
        const member = members.find(m => m.userId === userId);
        setMemberToRemove(member);
        setShowRemoveMemberModal(true);
    };

    const handleConfirmRemoveMember = async () => {
        if (!memberToRemove) return;

        try {
            setRemovingMember(memberToRemove.userId);
            setShowRemoveMemberModal(false);

            const response = await fetch(`/api/projects/${project.id}/members`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: memberToRemove.userId,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to remove member');
            }

            // Actualizar la lista de miembros
            setMembers(members.filter(member => member.userId !== memberToRemove.userId));

            // Mostrar notificación de éxito
            toast.success('¡Miembro eliminado del proyecto!', {
                position: 'top-right',
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        } catch (error) {
            console.error('Error removing member:', error);

            // Mostrar notificación de error
            toast.error(error.message || 'Error al eliminar miembro', {
                position: 'top-right',
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        } finally {
            setRemovingMember(null);
            setMemberToRemove(null);
        }
    };

    const handleCancelRemoveMember = () => {
        setShowRemoveMemberModal(false);
        setMemberToRemove(null);
    };

    const handleEditProject = () => {
        setEditProjectData({
            name: project.name,
            description: project.description || ''
        });
        setShowEditProjectModal(true);
    };

    const handleSaveProject = async (e) => {
        e.preventDefault();
        try {
            setEditingProject(true);
            const response = await fetch(`/api/projects/${project.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: editProjectData.name,
                    description: editProjectData.description,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update project');
            }

            const updatedProject = await response.json();
            setProject(updatedProject);
            setShowEditProjectModal(false);
            setEditProjectData({ name: '', description: '' });

            // Mostrar notificación de éxito
            toast.success('¡Proyecto actualizado exitosamente!', {
                position: 'top-right',
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        } catch (error) {
            console.error('Error updating project:', error);

            // Mostrar notificación de error
            toast.error(error.message || 'Error al actualizar el proyecto', {
                position: 'top-right',
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        } finally {
            setEditingProject(false);
        }
    };

    const handleDeleteProject = async () => {
        setShowDeleteConfirmModal(true);
        setDeleteConfirmStep(1);
    };

    const handleConfirmDelete = async () => {
        if (deleteConfirmStep === 1) {
            setDeleteConfirmStep(2);
            return;
        }

        // Segunda confirmación - proceder con la eliminación
        setShowDeleteConfirmModal(false);
        try {
            setLoading(true);
            const response = await fetch(`/api/projects/${project.id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to delete project');
            }

            // Mostrar notificación de éxito antes de redirigir
            toast.success('¡Proyecto eliminado exitosamente!', {
                position: 'top-right',
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: false,
                draggable: true,
                onClose: () => {
                    // Redirigir al dashboard después de mostrar la notificación
                    window.location.href = '/dashboard';
                }
            });

            // También redirigir después de un timeout como fallback
            setTimeout(() => {
                window.location.href = '/dashboard';
            }, 2500);
        } catch (error) {
            console.error('Error deleting project:', error);
            setLoading(false);

            // Mostrar notificación de error
            toast.error(error.message || 'Error al eliminar el proyecto', {
                position: 'top-right',
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        }
    };

    const handleCancelDelete = () => {
        setShowDeleteConfirmModal(false);
        setDeleteConfirmStep(1);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
                <div className="text-red-500 mb-4">{error}</div>
                <button
                    onClick={() => window.location.reload()}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                >
                    Try Again
                </button>
            </div>
        );
    }

    if (!project || !user) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-gray-500">Project not found</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-4">
                        <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
                        {canManageMembers && (
                            <button
                                onClick={handleEditProject}
                                className="text-gray-500 hover:text-gray-700 p-1 rounded"
                                title="Edit project"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                            </button>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowMembersModal(true)}
                            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                        >
                            Members ({members.length})
                        </button>
                        {isProjectOwner && (
                            <button
                                onClick={handleDeleteProject}
                                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                                title="Delete Project"
                            >
                                Delete Project
                            </button>
                        )}
                    </div>
                </div>

                {project.description && (
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                        <p className="text-gray-700">{project.description}</p>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <TaskBoard
                            projectId={project.id}
                            initialTasks={tasks}
                            isAdmin={canManageMembers}
                        />
                    </div>
                    <div>
                        {/* <Chat projectId={project.id} user={user} /> */}
                    </div>
                </div>

                {/* Modal para ver/gestionar miembros */}
                {showMembersModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-lg w-96 max-w-[90vw] max-h-[80vh] overflow-y-auto">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold">Miembros del Proyecto</h2>
                                <button
                                    onClick={() => setShowMembersModal(false)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    ✕
                                </button>
                            </div>
                            <div className="space-y-3">
                                {Array.isArray(members) && members.length > 0 ? (
                                    members.map((member) => (
                                        <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                                            <div>
                                                <div className="font-medium">{member.user.name}</div>
                                                <div className="text-sm text-gray-600">{member.user.email}</div>
                                                <div className="text-xs text-gray-500">
                                                    {(() => {
                                                        if (isProjectOwner && member.userId === project.ownerId) {
                                                            return 'Project Admin';
                                                        } else if (member.role === 'ADMIN') {
                                                            return 'Admin';
                                                        } else {
                                                            return 'Member';
                                                        }
                                                    })()}
                                                </div>
                                            </div>
                                            {canManageMembers && member.userId !== project.ownerId && (
                                                <button
                                                    onClick={() => handleRemoveMember(member.userId)}
                                                    disabled={removingMember === member.userId}
                                                    className={`text-red-500 hover:text-red-700 px-2 py-1 rounded ${removingMember === member.userId ? 'opacity-50 cursor-not-allowed' : ''
                                                        }`}
                                                >
                                                    {removingMember === member.userId ? 'Eliminando...' : 'Eliminar'}
                                                </button>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-4 text-gray-500">
                                        No members in this project
                                    </div>
                                )}
                            </div>
                            {canManageMembers && (
                                <div className="mt-4 pt-4 border-t">
                                    <button
                                        onClick={() => {
                                            setShowMembersModal(false);
                                            setShowAddMemberModal(true);
                                        }}
                                        className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                                    >
                                        Add New Member
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {showAddMemberModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-lg w-96">
                            <h2 className="text-xl font-bold mb-4">Agregar Miembro</h2>
                            <form onSubmit={handleAddMember}>
                                <input
                                    type="email"
                                    value={newMemberEmail}
                                    onChange={(e) => setNewMemberEmail(e.target.value)}
                                    placeholder="Ingresa el email del miembro"
                                    className="w-full p-2 border rounded-lg mb-4"
                                    required
                                />
                                <div className="flex justify-end gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowAddMemberModal(false)}
                                        className="px-4 py-2 text-gray-600 hover:text-gray-800"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                                    >
                                        Agregar
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Modal para editar proyecto */}
                {showEditProjectModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-lg w-96 max-w-[90vw]">
                            <h2 className="text-xl font-bold mb-4">Edit Project</h2>
                            <form onSubmit={handleSaveProject}>
                                <div className="mb-4">
                                    <label htmlFor="editProjectName" className="block text-gray-700 text-sm font-bold mb-2">
                                        Project Name
                                    </label>
                                    <input
                                        id="editProjectName"
                                        type="text"
                                        value={editProjectData.name}
                                        onChange={(e) => setEditProjectData(prev => ({ ...prev, name: e.target.value }))}
                                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                        disabled={editingProject}
                                    />
                                </div>
                                <div className="mb-4">
                                    <label htmlFor="editProjectDescription" className="block text-gray-700 text-sm font-bold mb-2">
                                        Description (optional)
                                    </label>
                                    <textarea
                                        id="editProjectDescription"
                                        value={editProjectData.description}
                                        onChange={(e) => setEditProjectData(prev => ({ ...prev, description: e.target.value }))}
                                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        rows={3}
                                        disabled={editingProject}
                                    />
                                </div>
                                <div className="flex justify-end gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowEditProjectModal(false)}
                                        className="px-4 py-2 text-gray-600 hover:text-gray-800"
                                        disabled={editingProject}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className={`${editingProject
                                            ? 'bg-blue-400 cursor-not-allowed'
                                            : 'bg-blue-500 hover:bg-blue-600'
                                            } text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2`}
                                        disabled={editingProject}
                                    >
                                        {editingProject ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                Saving...
                                            </>
                                        ) : (
                                            'Save Changes'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Modal de confirmación de eliminación de proyecto */}
                {showDeleteConfirmModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-lg w-96 max-w-[90vw]">
                            <div className="flex items-center mb-4">
                                <div className="flex-shrink-0 w-10 h-10 mx-auto flex items-center justify-center rounded-full bg-red-100">
                                    <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-lg font-medium text-gray-900">
                                        {deleteConfirmStep === 1 ? 'Confirmar eliminación' : 'Confirmación final'}
                                    </h3>
                                </div>
                            </div>
                            <div className="mb-6">
                                {deleteConfirmStep === 1 ? (
                                    <p className="text-sm text-gray-500">
                                        ¿Estás seguro de que quieres eliminar este proyecto? Esta acción no se puede deshacer y eliminará todas las tareas, miembros y mensajes asociados.
                                    </p>
                                ) : (
                                    <p className="text-sm text-gray-500">
                                        <strong className="text-red-600">ATENCIÓN:</strong> Esta acción eliminará PERMANENTEMENTE el proyecto "{project.name}" y todos sus datos. ¿Continuar?
                                    </p>
                                )}
                            </div>
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={handleCancelDelete}
                                    className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleConfirmDelete}
                                    className={`px-4 py-2 rounded-lg text-white font-medium ${deleteConfirmStep === 1
                                            ? 'bg-yellow-500 hover:bg-yellow-600'
                                            : 'bg-red-500 hover:bg-red-600'
                                        }`}
                                >
                                    {deleteConfirmStep === 1 ? 'Continuar' : 'Eliminar definitivamente'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal de confirmación para eliminar miembro */}
                {showRemoveMemberModal && memberToRemove && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-lg w-96 max-w-[90vw]">
                            <div className="flex items-center mb-4">
                                <div className="flex-shrink-0 w-10 h-10 mx-auto flex items-center justify-center rounded-full bg-red-100">
                                    <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-lg font-medium text-gray-900">
                                        Eliminar miembro
                                    </h3>
                                </div>
                            </div>
                            <div className="mb-6">
                                <p className="text-sm text-gray-500">
                                    ¿Estás seguro de que quieres eliminar a <strong>{memberToRemove.user.name}</strong> ({memberToRemove.user.email}) del proyecto?
                                </p>
                            </div>
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={handleCancelRemoveMember}
                                    className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleConfirmRemoveMember}
                                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium"
                                >
                                    Eliminar miembro
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

ProjectPage.propTypes = {
    params: PropTypes.shape({
        id: PropTypes.string.isRequired,
    }).isRequired,
};
