'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TaskBoard from '../../components/projects/TaskBoard';
import SprintManager from '../../components/projects/SprintManager';
import MinimizableChat from '../../components/chat/MinimizableChat';
import { toast } from 'react-toastify';

export default function DemoProjectPage({ params }) {
    const router = useRouter();
    const [timeLeft, setTimeLeft] = useState(0);
    const [isValidDemo, setIsValidDemo] = useState(false);

    // States similar to the real application
    const [project, setProject] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [sprints, setSprints] = useState([]);
    const [members, setMembers] = useState([]);
    const [memberPermissions, setMemberPermissions] = useState({ canManageMembers: true, isProjectOwner: true, isProjectAdmin: true });
    const [user, setUser] = useState({ id: 'demo_user', name: 'Demo User', email: 'demo@projettia.com' });
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
    const [activeTab, setActiveTab] = useState('kanban');

    // Enhanced demo data - starts empty, user creates everything
    const getDemoData = (projectId) => {
        // Try to load from localStorage first
        const savedData = localStorage.getItem(`demo-project-${projectId}`);
        if (savedData) {
            return JSON.parse(savedData);
        }

        // Create empty project structure if none exists
        const demoMembers = [
            {
                id: '1',
                userId: 'demo_user',
                user: { id: 'demo_user', name: 'Demo User', email: 'demo@projettia.com' },
                role: 'OWNER',
                joinedAt: new Date().toISOString()
            }
        ];

        // Return empty project structure based on projectId
        const projectsData = {
            'demo-1': {
                id: 'demo-1',
                name: 'E-commerce Platform',
                description: 'Building a modern online shopping platform with React and Node.js',
                ownerId: 'demo_user',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                members: demoMembers,
                tasks: [], // Start with empty tasks
                sprints: [] // Start with empty sprints
            },
            'demo-2': {
                id: 'demo-2',
                name: 'Mobile App Design',
                description: 'UI/UX design for a fitness tracking mobile application',
                ownerId: 'demo_user',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                members: demoMembers,
                tasks: [], // Start with empty tasks
                sprints: [] // Start with empty sprints
            },
            'demo-3': {
                id: 'demo-3',
                name: 'API Development',
                description: 'RESTful API for customer management system',
                ownerId: 'demo_user',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                members: demoMembers,
                tasks: [], // Start with empty tasks
                sprints: [] // Start with empty sprints
            }
        };

        return projectsData[projectId] || null;
    };

    // Save demo data to localStorage
    const saveDemoData = (projectData) => {
        localStorage.setItem(`demo-project-${projectData.id}`, JSON.stringify(projectData));
    };

    useEffect(() => {
        // Check if there's an active demo session
        const savedDemoTime = localStorage.getItem('demoStartTime');
        if (savedDemoTime) {
            const startTime = Number.parseInt(savedDemoTime);
            const elapsed = Date.now() - startTime;
            const demoDuration = 30 * 60 * 1000; // 30 minutes

            if (elapsed < demoDuration) {
                setIsValidDemo(true);
                setTimeLeft(demoDuration - elapsed);

                // Load demo data
                const demoData = getDemoData(params.id);
                if (demoData) {
                    setProject(demoData);
                    setTasks(demoData.tasks);
                    setSprints(demoData.sprints);
                    setMembers(demoData.members);
                    setEditProjectData({
                        name: demoData.name,
                        description: demoData.description
                    });
                }
                setLoading(false);
            } else {
                // Demo expired
                localStorage.removeItem('demoStartTime');
                toast.error('Demo has expired');
                router.push('/');
            }
        } else {
            // No demo session
            toast.error('You must start the demo first');
            router.push('/demo');
        }
    }, [router, params.id]);

    useEffect(() => {
        if (isValidDemo && timeLeft > 0) {
            const timer = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1000) {
                        localStorage.removeItem('demoStartTime');
                        toast.info('Demo has ended. Sign up to continue!');
                        router.push('/');
                        return 0;
                    }
                    return prev - 1000;
                });
            }, 1000);

            return () => clearInterval(timer);
        }
    }, [isValidDemo, timeLeft, router]);

    // Demo functions that simulate real functions
    const refreshTasks = async () => {
        // Save current state to localStorage
        if (project) {
            const updatedProject = {
                ...project,
                tasks,
                sprints,
                members,
                updatedAt: new Date().toISOString()
            };
            saveDemoData(updatedProject);
        }
        toast.info('Changes saved to demo session');
    };

    const updateTaskStatus = async (taskId, newStatus) => {
        // Simulate task update
        const updatedTasks = tasks.map(task =>
            task.id === taskId ? { ...task, status: newStatus, updatedAt: new Date().toISOString() } : task
        );
        setTasks(updatedTasks);

        // Save to localStorage
        if (project) {
            const updatedProject = {
                ...project,
                tasks: updatedTasks,
                sprints,
                members,
                updatedAt: new Date().toISOString()
            };
            saveDemoData(updatedProject);
        }
        toast.success('Task updated (demo)');
    };

    const handleEditProject = async (e) => {
        e.preventDefault();
        const updatedProject = {
            ...project,
            name: editProjectData.name,
            description: editProjectData.description,
            updatedAt: new Date().toISOString()
        };
        setProject(updatedProject);
        saveDemoData({ ...updatedProject, tasks, sprints, members });
        setShowEditProjectModal(false);
        setEditingProject(false);
        toast.success('Project updated (demo)');
    };

    // New task functions
    const handleCreateTask = (newTaskData) => {
        const newTask = {
            id: Date.now(),
            title: newTaskData.title,
            description: newTaskData.description || '',
            status: newTaskData.status || 'PENDING',
            priority: newTaskData.priority || 'MEDIUM',
            assignee: newTaskData.assigneeId ? members.find(m => m.userId === newTaskData.assigneeId)?.user : null,
            sprint: newTaskData.sprintId ? sprints.find(s => s.id === Number.parseInt(newTaskData.sprintId)) : null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            projectId: project.id
        };

        const updatedTasks = [...tasks, newTask];
        setTasks(updatedTasks);

        // Save to localStorage
        const updatedProject = {
            ...project,
            tasks: updatedTasks,
            sprints,
            members,
            updatedAt: new Date().toISOString()
        };
        saveDemoData(updatedProject);
        toast.success('Task created (demo)');
    };

    const handleUpdateTask = (taskId, updatedData) => {
        const updatedTasks = tasks.map(task => {
            if (task.id === taskId) {
                return {
                    ...task,
                    ...updatedData,
                    assignee: updatedData.assigneeId ? members.find(m => m.userId === updatedData.assigneeId)?.user : task.assignee,
                    sprint: updatedData.sprintId ? sprints.find(s => s.id === Number.parseInt(updatedData.sprintId)) : task.sprint,
                    updatedAt: new Date().toISOString()
                };
            }
            return task;
        });

        setTasks(updatedTasks);

        // Save to localStorage
        const updatedProject = {
            ...project,
            tasks: updatedTasks,
            sprints,
            members,
            updatedAt: new Date().toISOString()
        };
        saveDemoData(updatedProject);
        toast.success('Task updated (demo)');
    };

    const handleDeleteTask = (taskId) => {
        const updatedTasks = tasks.filter(task => task.id !== taskId);
        setTasks(updatedTasks);

        // Save to localStorage
        const updatedProject = {
            ...project,
            tasks: updatedTasks,
            sprints,
            members,
            updatedAt: new Date().toISOString()
        };
        saveDemoData(updatedProject);
        toast.success('Task deleted (demo)');
    };

    // Sprint functions
    const handleCreateSprint = (newSprintData) => {
        const newSprint = {
            id: Date.now(),
            name: newSprintData.name,
            status: newSprintData.status || 'PLANNED',
            startDate: newSprintData.startDate || new Date().toISOString(),
            endDate: newSprintData.endDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
            projectId: project.id
        };

        const updatedSprints = [...sprints, newSprint];
        setSprints(updatedSprints);

        // Save to localStorage
        const updatedProject = {
            ...project,
            tasks,
            sprints: updatedSprints,
            members,
            updatedAt: new Date().toISOString()
        };
        saveDemoData(updatedProject);
        toast.success('Sprint created (demo)');
    };

    const handleUpdateSprint = (sprintId, updatedData) => {
        const updatedSprints = sprints.map(sprint => {
            if (sprint.id === sprintId) {
                return {
                    ...sprint,
                    ...updatedData
                };
            }
            return sprint;
        });

        setSprints(updatedSprints);

        // Also update tasks that reference this sprint
        const updatedTasks = tasks.map(task => {
            if (task.sprint && task.sprint.id === sprintId) {
                const updatedSprint = updatedSprints.find(s => s.id === sprintId);
                return {
                    ...task,
                    sprint: updatedSprint
                };
            }
            return task;
        });
        setTasks(updatedTasks);

        // Save to localStorage
        const updatedProject = {
            ...project,
            tasks: updatedTasks,
            sprints: updatedSprints,
            members,
            updatedAt: new Date().toISOString()
        };
        saveDemoData(updatedProject);
        toast.success('Sprint updated (demo)');
    };

    const refreshSprints = async () => {
        // Save current state to localStorage
        if (project) {
            const updatedProject = {
                ...project,
                tasks,
                sprints,
                members,
                updatedAt: new Date().toISOString()
            };
            saveDemoData(updatedProject);
        }
        toast.info('Sprint changes saved to demo session');
    };

    const formatTime = (ms) => {
        const minutes = Math.floor(ms / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const handleAddMember = async (e) => {
        e.preventDefault();
        toast.info('In demo mode, real members cannot be added');
        setShowAddMemberModal(false);
        setNewMemberEmail('');
    };

    if (loading || !isValidDemo || !project) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="flex flex-col items-center space-y-4">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-foreground text-lg">Loading demo project...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-destructive mb-4">Error</h2>
                    <p className="text-muted-foreground mb-4">{error}</p>
                    <button
                        onClick={() => router.push('/demo')}
                        className="bg-primary text-primary-foreground px-4 py-2 rounded hover:opacity-90"
                    >
                        Back to Demo
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-background min-h-screen">
            {/* Demo Timer Header */}
            <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-3 text-center">
                <div className="flex items-center justify-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                        <span className="font-semibold">DEMO MODE</span>
                    </div>
                    <div className="font-mono text-lg">
                        {formatTime(timeLeft)} remaining
                    </div>
                    <button
                        onClick={() => router.push('/demo')}
                        className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded transition-colors text-sm"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                {/* Project Header - Identical to the real app */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                <button
                                    onClick={() => router.push('/demo')}
                                    className="hover:text-primary"
                                >
                                    Demo Dashboard
                                </button>
                                <span>/</span>
                                <span>{project.name}</span>
                            </div>
                            <h1 className="text-3xl font-bold text-foreground mb-2">{project.name}</h1>
                            {project.description && (
                                <p className="text-muted-foreground">{project.description}</p>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setShowMembersModal(true)}
                                className="px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors"
                            >
                                <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                Members ({members.length})
                            </button>
                            {memberPermissions.isProjectOwner && (
                                <button
                                    onClick={() => setShowEditProjectModal(true)}
                                    className="px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors"
                                >
                                    <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                    Edit Project
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Demo Notice */}
                    <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <h3 className="font-semibold text-blue-900 dark:text-blue-100">Demo Project</h3>
                        </div>
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                            Welcome to your demo project! Create tasks, sprints, and explore all features. Everything is saved in your demo session.
                        </p>
                    </div>
                </div>

                {/* Tabs - Exactly like in the real app */}
                <div className="mb-6">
                    <div className="border-b border-border">
                        <nav className="-mb-px flex space-x-8">
                            <button
                                onClick={() => setActiveTab('kanban')}
                                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'kanban'
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
                                    }`}
                            >
                                <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 0v10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2H9z" />
                                </svg>
                                Kanban Board
                            </button>
                            <button
                                onClick={() => setActiveTab('sprints')}
                                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'sprints'
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
                                    }`}
                            >
                                <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                Sprint Management
                            </button>
                        </nav>
                    </div>
                </div>

                {/* Content using real components */}
                {activeTab === 'kanban' && (
                    <TaskBoard
                        initialTasks={tasks}
                        members={members}
                        sprints={sprints}
                        isAdmin={memberPermissions.isProjectAdmin}
                        currentUserId={user.id}
                        projectId={project.id}
                        onUpdateTask={updateTaskStatus}
                        refreshTasks={refreshTasks}
                        onDeleteTask={handleDeleteTask}
                        onViewTask={handleUpdateTask}
                        onCreateTask={handleCreateTask}
                        isDemo={true}
                    />
                )}

                {activeTab === 'sprints' && (
                    <SprintManager
                        sprints={sprints}
                        tasks={tasks}
                        members={members}
                        isAdmin={memberPermissions.isProjectAdmin}
                        currentUserId={user.id}
                        projectId={project.id}
                        refreshSprints={refreshSprints}
                        refreshTasks={refreshTasks}
                        onCreateSprint={handleCreateSprint}
                        onUpdateSprint={handleUpdateSprint}
                        isDemo={true}
                    />
                )}

                {/* Chat Component - Exactly like in the real app */}
                <MinimizableChat
                    projectId={project.id}
                    currentUserId={user.id}
                    members={members}
                    isDemo={true}
                />

                {/* All modals exactly like in the real app */}
                {/* Members Modal */}
                {showMembersModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-card-foreground">Project Members</h2>
                                <button
                                    onClick={() => setShowMembersModal(false)}
                                    className="text-muted-foreground hover:text-foreground"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <div className="space-y-3 mb-4">
                                {members.map(member => (
                                    <div key={member.id} className="flex items-center justify-between p-3 bg-background rounded border">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                                                {member.user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="font-medium text-sm">{member.user.name}</div>
                                                <div className="text-xs text-muted-foreground">{member.user.email}</div>
                                            </div>
                                        </div>
                                        <span className={`text-xs px-2 py-1 rounded ${member.role === 'OWNER'
                                                ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
                                                : member.role === 'ADMIN'
                                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                                                    : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                            }`}>
                                            {member.role === 'OWNER' ? 'Owner' : member.role === 'ADMIN' ? 'Admin' : 'Member'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            {memberPermissions.canManageMembers && (
                                <button
                                    onClick={() => {
                                        setShowMembersModal(false);
                                        setShowAddMemberModal(true);
                                    }}
                                    className="w-full bg-primary text-primary-foreground py-2 px-4 rounded hover:opacity-90"
                                >
                                    Add Member
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Add Member Modal */}
                {showAddMemberModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md">
                            <h2 className="text-xl font-bold text-card-foreground mb-4">Add Member</h2>
                            <form onSubmit={handleAddMember}>
                                <div className="mb-4">
                                    <label htmlFor="memberEmail" className="block text-sm font-medium mb-2">Member email</label>
                                    <input
                                        id="memberEmail"
                                        type="email"
                                        value={newMemberEmail}
                                        onChange={(e) => setNewMemberEmail(e.target.value)}
                                        className="w-full p-3 border border-border rounded bg-background"
                                        placeholder="user@email.com"
                                        required
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowAddMemberModal(false);
                                            setNewMemberEmail('');
                                        }}
                                        className="flex-1 px-4 py-2 border border-border rounded hover:bg-muted"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 bg-primary text-primary-foreground px-4 py-2 rounded hover:opacity-90"
                                    >
                                        Add
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Edit Project Modal */}
                {showEditProjectModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md">
                            <h2 className="text-xl font-bold text-card-foreground mb-4">Edit Project</h2>
                            <form onSubmit={handleEditProject}>
                                <div className="mb-4">
                                    <label htmlFor="editProjectName" className="block text-sm font-medium mb-2">Project name</label>
                                    <input
                                        id="editProjectName"
                                        type="text"
                                        value={editProjectData.name}
                                        onChange={(e) => setEditProjectData({ ...editProjectData, name: e.target.value })}
                                        className="w-full p-3 border border-border rounded bg-background"
                                        required
                                    />
                                </div>
                                <div className="mb-4">
                                    <label htmlFor="editProjectDescription" className="block text-sm font-medium mb-2">Description</label>
                                    <textarea
                                        id="editProjectDescription"
                                        value={editProjectData.description}
                                        onChange={(e) => setEditProjectData({ ...editProjectData, description: e.target.value })}
                                        className="w-full p-3 border border-border rounded bg-background"
                                        rows={3}
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowEditProjectModal(false)}
                                        className="flex-1 px-4 py-2 border border-border rounded hover:bg-muted"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 bg-primary text-primary-foreground px-4 py-2 rounded hover:opacity-90"
                                        disabled={editingProject}
                                    >
                                        {editingProject ? 'Saving...' : 'Save'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}