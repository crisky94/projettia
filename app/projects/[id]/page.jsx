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
            toast.success('Project updated successfully! ', {
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
            toast.error(error.message || 'Error updating project ', {
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
            <div className="fixed inset-0 bg-background flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-background py-20 flex flex-col items-center justify-center">
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
            <div className="bg-background py-20 flex items-center justify-center">
                <div className="text-muted-foreground">Project not found</div>
            </div>
        );
    }

    return (
        <div className="bg-background min-h-screen">
            <div className="w-full mx-auto py-4 px-4 sm:py-6 sm:px-6 lg:px-12">
                <div className="flex flex-col gap-6 mb-8">
                    <div className="flex items-center justify-between w-full">
                        <button
                            onClick={() => window.location.href = '/dashboard'}
                            className="glass-card hover-lift px-5 py-2.5 text-sm font-semibold flex items-center gap-2.5 border border-white/10 group active:scale-95 transition-all"
                        >
                            <svg className="w-5 h-5 text-primary group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                            </svg>
                            <span className="hidden sm:inline">Back to Projects</span>
                            <span className="sm:hidden">Back</span>
                        </button>
                        {canManageMembers && (
                            <button
                                onClick={handleEditProject}
                                className="h-14 w-14 flex items-center justify-center rounded-2xl bg-white/10 hover:bg-primary/20 text-white/70 hover:text-primary transition-all duration-300 border border-white/20 hover-lift shadow-2xl group relative z-20"
                                title="Edit Project Settings"
                            >
                                <svg className="w-9 h-9 group-hover:rotate-90 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </button>
                        )}
                    </div>

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="max-w-2xl">
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight uppercase leading-none mb-3">
                                {project.name}
                            </h1>
                            {project.description && (
                                <p className="text-lg text-white/60 font-medium leading-relaxed line-clamp-2 md:line-clamp-none">
                                    {project.description}
                                </p>
                            )}
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setShowMembersModal(true)}
                                className="glass-card hover-lift px-6 py-3 flex items-center justify-center gap-3 border border-white/5 active:scale-95 transition-all shadow-xl group"
                            >
                                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                </div>
                                <div className="text-left">
                                    <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest leading-none mb-1">Team Hub</div>
                                    <div className="text-sm font-bold text-white leading-none">
                                        <span className="hidden sm:inline">Members ({members.length})</span>
                                        <span className="sm:hidden">Members</span>
                                    </div>
                                </div>
                            </button>

                            {isProjectOwner && (
                                <button
                                    onClick={handleDeleteProject}
                                    className="bg-red-500/10 hover:bg-red-500/20 px-6 py-3 rounded-2xl flex items-center gap-3 border border-red-500/20 hover:border-red-500/40 transition-all duration-300 hover-lift active:scale-95 group shadow-xl"
                                    title="Delete Project Permanently"
                                >
                                    <div className="h-8 w-8 rounded-lg bg-red-500/20 flex items-center justify-center group-hover:bg-red-500/30 transition-colors">
                                        <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </div>
                                    <div className="text-left">
                                        <div className="text-[10px] font-bold text-red-500/50 uppercase tracking-widest leading-none mb-1">Danger Zone</div>
                                        <div className="text-sm font-bold text-red-500 leading-none">
                                            <span className="hidden sm:inline">Delete Project</span>
                                            <span className="sm:hidden">Delete</span>
                                        </div>
                                    </div>
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {project.description && (
                    <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-card rounded-lg border border-border">
                        <p className="text-card-foreground text-sm sm:text-base">{project.description}</p>
                    </div>
                )}

                {/* Navigation Tabs */}
                <div className="mb-10">
                    <div className="flex p-1.5 glass-card border border-white/5 w-fit gap-2">
                        <button
                            onClick={() => setActiveTab('kanban')}
                            className={`px-8 py-3 rounded-xl font-bold text-sm transition-all duration-300 flex items-center gap-3 ${activeTab === 'kanban'
                                ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105'
                                : 'text-white/40 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <svg className={`w-5 h-5 ${activeTab === 'kanban' ? 'text-white' : 'text-primary'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 0v10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2H9z" />
                            </svg>
                            <span>Kanban Board</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('sprints')}
                            className={`px-8 py-3 rounded-xl font-bold text-sm transition-all duration-300 flex items-center gap-3 ${activeTab === 'sprints'
                                ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20 scale-105'
                                : 'text-white/40 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <svg className={`w-5 h-5 ${activeTab === 'sprints' ? 'text-white' : 'text-violet-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            <span>Timeline & Sprints</span>
                        </button>
                    </div>
                </div>

                {/* Tab Content */}
                <div className="w-full mx-auto pb-12">
                    <div className="grid grid-cols-1 gap-4">
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
                                    disableCreate={false}
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
                                    disableCreate={false}
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
                    <div className="fixed inset-2 bg-black bg-opacity-50 flex items-start justify-center z-50 p-4 pt-32">
                        <div className="bg-card p-4 sm:p-6 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto border border-border">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-card-foreground">Project Members</h2>
                                <button
                                    onClick={() => setShowMembersModal(false)}
                                    className="h-8 w-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-foreground transition-all duration-300 border border-white/10"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
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
                                <div className="mt-6 pt-6 border-t border-white/5">
                                    <button
                                        onClick={() => {
                                            setShowMembersModal(false);
                                            setShowAddMemberModal(true);
                                        }}
                                        className="w-full btn-gradient py-4 rounded-2xl flex items-center justify-center gap-2 group transition-all"
                                    >
                                        <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                        <span>Invite New Member</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {showAddMemberModal && (
                    <div className="fixed inset-2 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-card p-4 sm:p-6 rounded-lg w-full max-w-md border border-border">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-card-foreground">Add Member</h2>
                                <button
                                    onClick={() => setShowAddMemberModal(false)}
                                    className="h-8 w-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-foreground transition-all duration-300 border border-white/10"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
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
                                        className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-sm text-white/40 hover:text-white hover:bg-white/5 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="w-full sm:w-auto btn-gradient px-8 py-2.5 rounded-xl font-bold text-sm transition-all"
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
                    <div className="fixed inset-2 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-card p-6 rounded-lg w-96 max-w-[90vw] border border-border">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-card-foreground">Edit Project</h2>
                                <button
                                    onClick={() => setShowEditProjectModal(false)}
                                    disabled={editingProject}
                                    className="h-8 w-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-foreground transition-all duration-300 border border-white/10 disabled:opacity-50"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
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
                                <div className="flex justify-end gap-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setShowEditProjectModal(false)}
                                        className="px-6 py-2.5 rounded-xl font-bold text-sm text-white/40 hover:text-white hover:bg-white/5 transition-all"
                                        disabled={editingProject}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className={`${editingProject
                                            ? 'opacity-50 cursor-not-allowed'
                                            : 'hover:scale-105 active:scale-95 shadow-lg shadow-primary/20'
                                            } btn-gradient px-8 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2`}
                                        disabled={editingProject}
                                    >
                                        {editingProject ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                <span>Saving...</span>
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                                </svg>
                                                <span>Save Changes</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Project deletion confirmation modal */}
                {showDeleteConfirmModal && (
                    <div className="fixed inset-2 bg-black bg-opacity-50 flex items-start justify-center z-50 pt-32">
                        <div className="bg-card p-6 rounded-lg w-96 max-w-[90vw] border border-border">
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-destructive/20">
                                        <svg className="w-6 h-6 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                        </svg>
                                    </div>
                                    <div className="ml-4">
                                        <h3 className="text-lg font-bold text-card-foreground">
                                            {deleteConfirmStep === 1 ? 'Confirm Deletion' : 'Final Confirmation'}
                                        </h3>
                                    </div>
                                </div>
                                <button
                                    onClick={handleCancelDelete}
                                    className="h-8 w-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-foreground transition-all duration-300 border border-white/10"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
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
                                    className="px-6 py-2.5 rounded-xl font-bold text-sm text-white/60 hover:text-white hover:bg-white/5 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirmRemoveMember}
                                    className="px-8 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-red-500/20 active:scale-95 transition-all"
                                >
                                    Remove Member
                                </button>
                            </div>
                        </div>
                    </div>
                )}
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
