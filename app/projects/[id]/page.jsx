'use client';
import { useState, useEffect } from 'react';
import TaskBoard from '../../components/projects/TaskBoard';
import Chat from '../../components/chat/Chat';

export default function ProjectPage({ params }) {
    const [project, setProject] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [members, setMembers] = useState([]);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddMemberModal, setShowAddMemberModal] = useState(false);
    const [newMemberEmail, setNewMemberEmail] = useState('');

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
                setTasks(tasksData);

                // Fetch members
                const membersRes = await fetch(`/api/projects/${params.id}/members`);
                const membersData = await membersRes.json();
                if (!membersRes.ok) {
                    throw new Error(membersData.message || membersData.error || 'Failed to load members');
                }
                console.log('Members data:', membersData);
                setMembers(membersData);

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

    const isAdmin = project?.ownerId === user?.id;

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
        } catch (error) {
            console.error('Error adding member:', error);
            setError(error.message || 'Failed to add member');
            setShowAddMemberModal(false);
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
                    <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
                    {isAdmin && (
                        <button
                            onClick={() => setShowAddMemberModal(true)}
                            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                        >
                            Add Member
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <TaskBoard
                            projectId={project.id}
                            tasks={tasks}
                            isAdmin={isAdmin}
                        />
                    </div>
                    <div>
                        <Chat projectId={project.id} user={user} />
                    </div>
                </div>

                {showAddMemberModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <div className="bg-white p-6 rounded-lg w-96">
                            <h2 className="text-xl font-bold mb-4">Add Member</h2>
                            <form onSubmit={handleAddMember}>
                                <input
                                    type="email"
                                    value={newMemberEmail}
                                    onChange={(e) => setNewMemberEmail(e.target.value)}
                                    placeholder="Enter member email"
                                    className="w-full p-2 border rounded-lg mb-4"
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
                                        Add
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
