'use client';
import { useState, useEffect } from 'react';
import TaskBoard from '../../components/projects/TaskBoard';
import SprintManager from '../../components/projects/SprintManager';
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
    const [activeTab, setActiveTab] = useState('kanban'); // 'kanban' or 'sprints'

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

    // Funciones para manejar actualizaciones de tareas compartidas entre pestañas
    const handleTaskUpdate = (updatedTask) => {
        setTasks(prevTasks =>
            prevTasks.map(task =>
                task.id === updatedTask.id ? updatedTask : task
            )
        );
    };

    const handleTaskDelete = (taskId) => {
        setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
    };

    const handleTaskCreate = (newTask) => {
        setTasks(prevTasks => [newTask, ...prevTasks]);
    };

    const refreshTasks = async () => {
        try {
            const tasksRes = await fetch(`/api/projects/${params.id}/tasks`);
            if (tasksRes.ok) {
                const tasksData = await tasksRes.json();
                setTasks(tasksData);
            }
        } catch (error) {
            console.error('Error refreshing tasks:', error);
        }
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
                        <h1 className="text-3xl font-bold text-gray-900 uppercase">{project.name}</h1>
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

                        <button onClick={() => setShowMembersModal(true)} className="btn bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 px-3 py-2 rounded-lg text-sm font-medium">
                            <span className="flex items-center gap-2">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M17.9281 19.6343H20.0657C20.2539 19.6375 20.4401 19.5951 20.6083 19.5106C20.7766 19.4261 20.9218 19.3021 21.0316 19.1491C21.1413 18.9962 21.2124 18.8189 21.2386 18.6325C21.2649 18.4461 21.2455 18.2561 21.1822 18.0788C20.637 16.9119 19.7739 15.9223 18.692 15.2236C17.6101 14.5248 16.3531 14.1451 15.0652 14.1281" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                    <path d="M15.0652 11.3701C15.5465 11.3701 16.023 11.2754 16.4676 11.0912C16.9122 10.907 17.3161 10.6371 17.6564 10.2968C17.9967 9.95657 18.2666 9.5526 18.4508 9.10801C18.6349 8.66341 18.7297 8.18691 18.7297 7.70568C18.731 7.22366 18.6371 6.74612 18.4535 6.30042C18.2699 5.85473 18.0002 5.44964 17.6598 5.10835C17.3194 4.76706 16.915 4.49628 16.4698 4.31153C16.0246 4.12678 15.5473 4.03168 15.0652 4.03168" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                    <path d="M14.0251 20.8271C14.3771 20.8263 14.7221 20.7281 15.0218 20.5434C15.3215 20.3587 15.5643 20.0947 15.7233 19.7807C15.8823 19.4666 15.9513 19.1146 15.9228 18.7638C15.8942 18.4129 15.7692 18.0767 15.5615 17.7925C14.8329 16.8246 13.8947 16.0342 12.8171 15.4805C11.7396 14.9269 10.5507 14.6243 9.33953 14.5956C8.1284 14.6243 6.93948 14.9269 5.86193 15.4805C4.78437 16.0342 3.84614 16.8246 3.11758 17.7925C2.90988 18.0767 2.78484 18.4129 2.75629 18.7638C2.72774 19.1146 2.79678 19.4666 2.95579 19.7807C3.11481 20.0947 3.35759 20.3587 3.6573 20.5434C3.957 20.7281 4.30195 20.8263 4.65398 20.8271H14.0251Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                    <path d="M9.3395 11.4847C10.4413 11.4822 11.4972 11.0427 12.2754 10.2627C13.0536 9.48267 13.4907 8.42583 13.4907 7.324C13.4907 6.22305 13.0533 5.16718 12.2748 4.38869C11.4963 3.6102 10.4405 3.17285 9.3395 3.17285C8.23855 3.17285 7.18269 3.6102 6.4042 4.38869C5.62571 5.16718 5.18835 6.22305 5.18835 7.324C5.18835 8.42583 5.6254 9.48267 6.40362 10.2627C7.18184 11.0427 8.23768 11.4822 9.3395 11.4847Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                </svg>

                                Members ({members.length})
                            </span>
                        </button>
                        {isProjectOwner && (
                            <button
                                onClick={handleDeleteProject}
                                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                                title="Delete Project"
                            >
                                <span className="flex items-center gap-2">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M5.47058 6.01471V18.5294C5.47058 19.251 5.75721 19.943 6.26742 20.4532C6.77763 20.9634 7.46962 21.25 8.19117 21.25H15.8088C16.5304 21.25 17.2224 20.9634 17.7326 20.4532C18.2428 19.943 18.5294 19.251 18.5294 18.5294V6.01471" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                        <path d="M3.29413 6.01471H20.7059" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                        <path d="M8.73529 6.01471V4.38235C8.73529 3.94943 8.90727 3.53423 9.2134 3.2281C9.51952 2.92198 9.93472 2.75 10.3676 2.75H13.6323C14.0653 2.75 14.4805 2.92198 14.7866 3.2281C15.0927 3.53423 15.2647 3.94943 15.2647 4.38235V6.01471" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                        <path d="M9.82352 16.9915V11.5535" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                        <path d="M14.1765 16.9915V11.5535" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                    </svg>

                                    Delete Project
                                </span>
                            </button>
                        )}
                    </div>
                </div>

                {project.description && (
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                        <p className="text-gray-700">{project.description}</p>
                    </div>
                )}

                {/* Navigation Tabs */}
                <div className="border-b border-gray-200 mb-6">
                    <nav className="flex space-x-8" aria-label="Tabs">
                        <button
                            onClick={() => setActiveTab('kanban')}
                            className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${activeTab === 'kanban'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            📋 Task Board
                        </button>
                        <button
                            onClick={() => setActiveTab('sprints')}
                            className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${activeTab === 'sprints'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            🚀 Sprint Management
                        </button>
                    </nav>
                </div>

                {/* Tab Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        {activeTab === 'kanban' && (
                            <TaskBoard
                                projectId={project.id}
                                initialTasks={tasks}
                                isAdmin={canManageMembers}
                                onTaskUpdate={handleTaskUpdate}
                                onTaskDelete={handleTaskDelete}
                                onTaskCreate={handleTaskCreate}
                            />
                        )}
                        {activeTab === 'sprints' && (
                            <SprintManager
                                projectId={project.id}
                                isAdmin={canManageMembers}
                                allMembers={members}
                                tasks={tasks}
                                onTaskUpdate={handleTaskUpdate}
                                onTaskDelete={handleTaskDelete}
                                onTaskCreate={handleTaskCreate}
                                onRefreshTasks={refreshTasks}
                            />
                        )}
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
