'use client';
import { useState, useEffect } from 'react';
import TaskBoard from '../../components/projects/TaskBoard';
import SprintManager from '../../components/projects/SprintManager';
import MinimizableChat from '../../components/chat/MinimizableChat';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';

export default function ProjectPage({ params }) {
    const [project, setProject] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [sprints, setSprints] = useState([]);
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

                // Fetch sprints
                const sprintsRes = await fetch(`/api/projects/${params.id}/sprints`);
                const sprintsData = await sprintsRes.json();
                if (!sprintsRes.ok) {
                    console.error('Sprints API error:', sprintsData);
                    setSprints([]);
                } else {
                    console.log('Sprints data:', sprintsData);
                    setSprints(Array.isArray(sprintsData) ? sprintsData : []);
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

            // Update members list
            const newMember = await response.json();
            setMembers([...members, newMember]);
            setShowAddMemberModal(false);
            setNewMemberEmail('');

            // Show success notification
            toast.success('Member added successfully!', {
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

            // Show error notification
            toast.error(error.message || 'Error adding member', {
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

            // Update members list
            setMembers(members.filter(member => member.userId !== memberToRemove.userId));

            // Show success notification
            toast.success('Member removed from project!', {
                position: 'top-right',
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        } catch (error) {
            console.error('Error removing member:', error);

            // Show error notification
            toast.error(error.message || 'Error removing member', {
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

            // Show success notification
            toast.success('Project updated successfully!', {
                position: 'top-right',
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        } catch (error) {
            console.error('Error updating project:', error);

            // Show error notification
            toast.error(error.message || 'Error updating project', {
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

        // Second confirmation - proceed with deletion
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

            // Show success notification before redirecting
            toast.success('Project deleted successfully!', {
                position: 'top-right',
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: false,
                draggable: true,
                onClose: () => {
                    // Redirect to dashboard after showing notification
                    window.location.href = '/dashboard';
                }
            });

            // Also redirect after timeout as fallback
            setTimeout(() => {
                window.location.href = '/dashboard';
            }, 2500);
        } catch (error) {
            console.error('Error deleting project:', error);
            setLoading(false);

            // Show error notification
            toast.error(error.message || 'Error deleting project', {
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

    // Eliminar sprint y actualizar tareas que lo tenían asignado
    const handleDeleteSprint = async (sprintId) => {
        try {
            const response = await fetch(`/api/projects/${project.id}/sprints/${sprintId}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error deleting sprint');
            }
            // Actualizar sprints
            await refreshSprints();
            // Quitar el sprint de las tareas que lo tenían asignado
            setTasks(prevTasks => prevTasks.map(task =>
                task.sprintId === sprintId ? { ...task, sprintId: null, sprint: null } : task
            ));
            toast.success('Sprint deleted and tasks updated!');
        } catch (error) {
            console.error('Error deleting sprint:', error);
            toast.error(error.message || 'Error deleting sprint');
        }
    };
    const handleTaskUpdate = (updatedTask) => {
        const oldTask = tasks.find(task => task.id === updatedTask.id);

        setTasks(prevTasks =>
            prevTasks.map(task =>
                task.id === updatedTask.id ? updatedTask : task
            )
        );

        // If sprint assignment changed, refresh sprints to update task counts
        if (oldTask && oldTask.sprintId !== updatedTask.sprintId) {
            refreshSprints();
        }
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

    const refreshSprints = async () => {
        try {
            const sprintsRes = await fetch(`/api/projects/${params.id}/sprints`);
            if (sprintsRes.ok) {
                const sprintsData = await sprintsRes.json();
                setSprints(Array.isArray(sprintsData) ? sprintsData : []);
            }
        } catch (error) {
            console.error('Error refreshing sprints:', error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center">
                <div className="text-destructive mb-4">{error}</div>
                <button
                    onClick={() => window.location.reload()}
                    className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
                >
                    Try Again
                </button>
            </div>
        );
    }

    if (!project || !user) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-muted-foreground">Project not found</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-7xl mx-auto py-4 px-4 sm:py-6 sm:px-6 lg:px-8">
                <div className="flex flex-col gap-4 mb-6">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => window.location.href = '/projects'}
                            className="px-3 py-2 bg-card hover:bg-muted text-card-foreground rounded-lg font-medium shadow-sm transition-all duration-200 flex items-center gap-2 border border-border"
                        >
                            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            <span className="hidden sm:inline">Volver a proyectos</span>
                            <span className="sm:hidden">Volver</span>
                        </button>
                        {canManageMembers && (
                            <button
                                onClick={handleEditProject}
                                className="text-muted-foreground hover:text-foreground p-2 rounded transition-colors"
                                title="Edit project"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                            </button>
                        )}
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground uppercase line-clamp-2">{project.name}</h1>
                        <div className="flex flex-col sm:flex-row gap-2">

                            <button onClick={() => setShowMembersModal(true)} className="w-full sm:w-auto bg-card text-card-foreground hover:bg-muted border border-border px-4 py-3 sm:py-2 rounded-lg text-sm font-medium transition-colors">
                                <span className="flex items-center justify-center gap-2">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M17.9281 19.6343H20.0657C20.2539 19.6375 20.4401 19.5951 20.6083 19.5106C20.7766 19.4261 20.9218 19.3021 21.0316 19.1491C21.1413 18.9962 21.2124 18.8189 21.2386 18.6325C21.2649 18.4461 21.2455 18.2561 21.1822 18.0788C20.637 16.9119 19.7739 15.9223 18.692 15.2236C17.6101 14.5248 16.3531 14.1451 15.0652 14.1281" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M15.0652 11.3701C15.5465 11.3701 16.023 11.2754 16.4676 11.0912C16.9122 10.907 17.3161 10.6371 17.6564 10.2968C17.9967 9.95657 18.2666 9.5526 18.4508 9.10801C18.6349 8.66341 18.7297 8.18691 18.7297 7.70568C18.731 7.22366 18.6371 6.74612 18.4535 6.30042C18.2699 5.85473 18.0002 5.44964 17.6598 5.10835C17.3194 4.76706 16.915 4.49628 16.4698 4.31153C16.0246 4.12678 15.5473 4.03168 15.0652 4.03168" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M14.0251 20.8271C14.3771 20.8263 14.7221 20.7281 15.0218 20.5434C15.3215 20.3587 15.5643 20.0947 15.7233 19.7807C15.8823 19.4666 15.9513 19.1146 15.9228 18.7638C15.8942 18.4129 15.7692 18.0767 15.5615 17.7925C14.8329 16.8246 13.8947 16.0342 12.8171 15.4805C11.7396 14.9269 10.5507 14.6243 9.33953 14.5956C8.1284 14.6243 6.93948 14.9269 5.86193 15.4805C4.78437 16.0342 3.84614 16.8246 3.11758 17.7925C2.90988 18.0767 2.78484 18.4129 2.75629 18.7638C2.72774 19.1146 2.79678 19.4666 2.95579 19.7807C3.11481 20.0947 3.35759 20.3587 3.6573 20.5434C3.957 20.7281 4.30195 20.8263 4.65398 20.8271H14.0251Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M9.3395 11.4847C10.4413 11.4822 11.4972 11.0427 12.2754 10.2627C13.0536 9.48267 13.4907 8.42583 13.4907 7.324C13.4907 6.22305 13.0533 5.16718 12.2748 4.38869C11.4963 3.6102 10.4405 3.17285 9.3395 3.17285C8.23855 3.17285 7.18269 3.6102 6.4042 4.38869C5.62571 5.16718 5.18835 6.22305 5.18835 7.324C5.18835 8.42583 5.6254 9.48267 6.40362 10.2627C7.18184 11.0427 8.23768 11.4822 9.3395 11.4847Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    <span className="hidden sm:inline">Members ({members.length})</span>
                                    <span className="sm:hidden">Members</span>
                                </span>
                            </button>
                            {isProjectOwner && (
                                <button
                                    onClick={handleDeleteProject}
                                    className="w-full sm:w-auto bg-destructive text-destructive-foreground px-4 py-3 sm:py-2 rounded-lg hover:opacity-90 transition-opacity"
                                    title="Delete Project"
                                >
                                    <span className="flex items-center justify-center gap-2">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M5.47058 6.01471V18.5294C5.47058 19.251 5.75721 19.943 6.26742 20.4532C6.77763 20.9634 7.46962 21.25 8.19117 21.25H15.8088C16.5304 21.25 17.2224 20.9634 17.7326 20.4532C18.2428 19.943 18.5294 19.251 18.5294 18.5294V6.01471" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M3.29413 6.01471H20.7059" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M8.73529 6.01471V4.38235C8.73529 3.94943 8.90727 3.53423 9.2134 3.2281C9.51952 2.92198 9.93472 2.75 10.3676 2.75H13.6323C14.0653 2.75 14.4805 2.92198 14.7866 3.2281C15.0927 3.53423 15.2647 3.94943 15.2647 4.38235V6.01471" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M9.82352 16.9915V11.5535" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M14.1765 16.9915V11.5535" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                        <span className="hidden sm:inline">Delete Project</span>
                                        <span className="sm:hidden">Delete</span>
                                    </span>
                                </button>
                            )}
                        </div>
                    </div>

                    {project.description && (
                        <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-card rounded-lg border border-border">
                            <p className="text-card-foreground text-sm sm:text-base">{project.description}</p>
                        </div>
                    )}

                    {/* Navigation Tabs */}
                    <div className="border-b border-border mb-4 sm:mb-6">
                        <nav className="flex space-x-2 sm:space-x-8 overflow-x-auto" aria-label="Tabs">
                            <button
                                onClick={() => setActiveTab('kanban')}
                                className={`py-3 px-3 sm:px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors flex-shrink-0 ${activeTab === 'kanban'
                                    ? 'border-blue-700 text-blue-700 dark:border-blue-400 dark:text-blue-400'
                                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                                    }`}
                            >
                                <span className="flex items-center gap-2">
                                    <span>📋</span>
                                    <span className="hidden sm:inline">Task Board</span>
                                    <span className="sm:hidden">Tasks</span>
                                </span>
                            </button>
                            <button
                                onClick={() => setActiveTab('sprints')}
                                className={`py-3 px-3 sm:px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors flex-shrink-0 ${activeTab === 'sprints'
                                    ? 'border-blue-700 text-blue-700 dark:border-blue-400 dark:text-blue-400'
                                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                                    }`}
                            >
                                <span className="flex items-center gap-2">
                                    <span>🚀</span>
                                    <span className="hidden sm:inline">Sprint Management</span>
                                    <span className="sm:hidden">Sprints</span>
                                </span>
                            </button>
                        </nav>
                    </div>

                    {/* Tab Content */}
                    <div className="w-full max-w-7xl mx-auto">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
                            <div className="lg:col-span-2 w-full max-w-none mx-auto">
                                {activeTab === 'kanban' && (
                                    <TaskBoard
                                        projectId={project.id}
                                        initialTasks={tasks}
                                        isAdmin={canManageMembers}
                                        currentUserId={user.id}
                                        sprints={sprints}
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
                                        onRefreshSprints={refreshSprints}
                                        onDeleteSprint={handleDeleteSprint}
                                    />
                                )}
                            </div>
                            <div>
                                {/* <Chat projectId={project.id} user={user} /> */}
                            </div>
                        </div>
                    </div>

                    {/* Modal to view/manage members */}
                    {showMembersModal && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                            <div className="bg-card p-4 sm:p-6 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto border border-border">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-lg sm:text-xl font-bold text-card-foreground">Project Members</h2>
                                    <button
                                        onClick={() => setShowMembersModal(false)}
                                        className="text-muted-foreground hover:text-card-foreground transition-colors p-2 -m-2"
                                    >
                                        ✕
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    {Array.isArray(members) && members.length > 0 ? (
                                        members.map((member) => (
                                            <div key={member.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border border-border rounded-lg bg-background gap-3">
                                                <div className="flex-1">
                                                    <div className="font-medium text-foreground">{member.user.name}</div>
                                                    <div className="text-sm text-muted-foreground truncate">{member.user.email}</div>
                                                    <div className="text-xs text-muted-foreground">
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
                                                        className={`w-full sm:w-auto text-destructive hover:opacity-90 px-3 py-2 rounded transition-opacity text-sm ${removingMember === member.userId ? 'opacity-50 cursor-not-allowed' : ''
                                                            }`}
                                                    >
                                                        {removingMember === member.userId ? 'Removing...' : 'Remove'}
                                                    </button>
                                                )}
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-4 text-muted-foreground">
                                            No members in this project
                                        </div>
                                    )}
                                </div>
                                {canManageMembers && (
                                    <div className="mt-4 pt-4 border-t border-border">
                                        <button
                                            onClick={() => {
                                                setShowMembersModal(false);
                                                setShowAddMemberModal(true);
                                            }}
                                            className="w-full bg-primary text-primary-foreground px-4 py-3 rounded-lg hover:opacity-90 transition-opacity font-medium"
                                        >
                                            + Add New Member
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {showAddMemberModal && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                            <div className="bg-card p-4 sm:p-6 rounded-lg w-full max-w-md border border-border">
                                <h2 className="text-lg sm:text-xl font-bold mb-4 text-card-foreground">Add Member</h2>
                                <form onSubmit={handleAddMember}>
                                    <input
                                        type="email"
                                        value={newMemberEmail}
                                        onChange={(e) => setNewMemberEmail(e.target.value)}
                                        placeholder="Enter member's email"
                                        className="w-full p-3 border border-border rounded-lg mb-4 bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent text-base"
                                        required
                                    />
                                    <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 sm:gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setShowAddMemberModal(false)}
                                            className="w-full sm:w-auto px-4 py-3 sm:py-2 text-muted-foreground hover:text-card-foreground transition-colors border border-border rounded-lg"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="w-full sm:w-auto bg-primary text-primary-foreground px-4 py-3 sm:py-2 rounded-lg hover:opacity-90 transition-opacity font-medium"
                                        >
                                            Add Member
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Modal to edit project */}
                    {showEditProjectModal && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <div className="bg-card p-6 rounded-lg w-96 max-w-[90vw] border border-border">
                                <h2 className="text-xl font-bold mb-4 text-card-foreground">Edit Project</h2>
                                <form onSubmit={handleSaveProject}>
                                    <div className="mb-4">
                                        <label htmlFor="editProjectName" className="block text-card-foreground text-sm font-bold mb-2">
                                            Project Name
                                        </label>
                                        <input
                                            id="editProjectName"
                                            type="text"
                                            value={editProjectData.name}
                                            onChange={(e) => setEditProjectData(prev => ({ ...prev, name: e.target.value }))}
                                            className="w-full p-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                                            required
                                            disabled={editingProject}
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label htmlFor="editProjectDescription" className="block text-card-foreground text-sm font-bold mb-2">
                                            Description (optional)
                                        </label>
                                        <textarea
                                            id="editProjectDescription"
                                            value={editProjectData.description}
                                            onChange={(e) => setEditProjectData(prev => ({ ...prev, description: e.target.value }))}
                                            className="w-full p-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                                            rows={3}
                                            disabled={editingProject}
                                        />
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setShowEditProjectModal(false)}
                                            className="px-4 py-2 text-muted-foreground hover:text-card-foreground transition-colors"
                                            disabled={editingProject}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className={`${editingProject
                                                ? 'bg-primary opacity-50 cursor-not-allowed'
                                                : 'bg-primary hover:opacity-90'
                                                } text-primary-foreground px-4 py-2 rounded-lg transition-opacity flex items-center gap-2`}
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

                    {/* Project deletion confirmation modal */}
                    {showDeleteConfirmModal && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <div className="bg-card p-6 rounded-lg w-96 max-w-[90vw] border border-border">
                                <div className="flex items-center mb-4">
                                    <div className="flex-shrink-0 w-10 h-10 mx-auto flex items-center justify-center rounded-full bg-destructive/20">
                                        <svg className="w-6 h-6 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                        </svg>
                                    </div>
                                    <div className="ml-4">
                                        <h3 className="text-lg font-medium text-card-foreground">
                                            {deleteConfirmStep === 1 ? 'Confirm Deletion' : 'Final Confirmation'}
                                        </h3>
                                    </div>
                                </div>
                                <div className="mb-6">
                                    {deleteConfirmStep === 1 ? (
                                        <p className="text-sm text-muted-foreground">
                                            Are you sure you want to delete this project? This action cannot be undone and will remove all associated tasks, members, and messages.
                                        </p>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">
                                            <strong className="text-destructive">WARNING:</strong> This action will PERMANENTLY delete the project "{project.name}" and all its data. Continue?
                                        </p>
                                    )}
                                </div>
                                <div className="flex justify-end gap-3">
                                    <button
                                        onClick={handleCancelDelete}
                                        className="px-4 py-2 text-muted-foreground hover:text-card-foreground border border-border rounded-lg hover:bg-muted transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleConfirmDelete}
                                        className={`px-4 py-2 rounded-lg text-white font-medium transition-opacity ${deleteConfirmStep === 1
                                            ? 'bg-warning hover:opacity-90'
                                            : 'bg-destructive hover:opacity-90'
                                            }`}
                                    >
                                        {deleteConfirmStep === 1 ? 'Continue' : 'Delete Permanently'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Confirmation modal to remove member */}
                    {showRemoveMemberModal && memberToRemove && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <div className="bg-card p-6 rounded-lg w-96 max-w-[90vw] border border-border">
                                <div className="flex items-center mb-4">
                                    <div className="flex-shrink-0 w-10 h-10 mx-auto flex items-center justify-center rounded-full bg-destructive/20">
                                        <svg className="w-6 h-6 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                        </svg>
                                    </div>
                                    <div className="ml-4">
                                        <h3 className="text-lg font-medium text-card-foreground">
                                            Remove Member
                                        </h3>
                                    </div>
                                </div>
                                <div className="mb-6">
                                    <p className="text-sm text-muted-foreground">
                                        Are you sure you want to remove <strong className="text-card-foreground">{memberToRemove.user.name}</strong> ({memberToRemove.user.email}) from the project?
                                    </p>
                                </div>
                                <div className="flex justify-end gap-3">
                                    <button
                                        onClick={handleCancelRemoveMember}
                                        className="px-4 py-2 text-muted-foreground hover:text-card-foreground border border-border rounded-lg hover:bg-muted transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleConfirmRemoveMember}
                                        className="px-4 py-2 bg-destructive hover:opacity-90 text-destructive-foreground rounded-lg font-medium transition-opacity"
                                    >
                                        Remove Member
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Minimizable Chat Component */}
            {user && (
                <MinimizableChat
                    projectId={project.id}
                    user={user}
                    projectName={project.name}
                />
            )}
        </div>
    );
}

ProjectPage.propTypes = {
    params: PropTypes.shape({
        id: PropTypes.string.isRequired,
    }).isRequired,
};
