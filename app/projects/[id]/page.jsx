'use client';
import { useState, useEffect } from 'react';
import TaskBoard from '../../components/projects/TaskBoard';
import PropTypes from 'prop-types';

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
    const [newMemberEmail, setNewMemberEmail] = useState('');
    const [removingMember, setRemovingMember] = useState(null);

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
        } catch (error) {
            console.error('Error adding member:', error);
            setError(error.message || 'Failed to add member');
            setShowAddMemberModal(false);
        }
    };

    const handleRemoveMember = async (userId) => {
        if (!window.confirm('¿Estás seguro de que quieres eliminar este miembro del proyecto?')) {
            return;
        }

        try {
            setRemovingMember(userId);
            const response = await fetch(`/api/projects/${project.id}/members`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: userId,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to remove member');
            }

            // Actualizar la lista de miembros
            setMembers(members.filter(member => member.userId !== userId));
        } catch (error) {
            console.error('Error removing member:', error);
            setError(error.message || 'Failed to remove member');
        } finally {
            setRemovingMember(null);
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
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowMembersModal(true)}
                            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                        >
                            Ver Miembros ({members.length})
                        </button>
                        {canManageMembers && (
                            <button
                                onClick={() => setShowAddMemberModal(true)}
                                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                            >
                                Agregar Miembro
                            </button>
                        )}
                    </div>
                </div>

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
                                                            return 'Administrador del proyecto';
                                                        } else if (member.role === 'ADMIN') {
                                                            return 'Administrador';
                                                        } else {
                                                            return 'Miembro';
                                                        }
                                                    })()}
                                                </div>
                                            </div>
                                            {canManageMembers && member.userId !== project.ownerId && (
                                                <button
                                                    onClick={() => handleRemoveMember(member.userId)}
                                                    disabled={removingMember === member.userId}
                                                    className={`text-red-500 hover:text-red-700 px-2 py-1 rounded ${
                                                        removingMember === member.userId ? 'opacity-50 cursor-not-allowed' : ''
                                                    }`}
                                                >
                                                    {removingMember === member.userId ? 'Eliminando...' : 'Eliminar'}
                                                </button>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-4 text-gray-500">
                                        No hay miembros en este proyecto
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
                                        Agregar Nuevo Miembro
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
                                        Cancelar
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
            </div>
        </div>
    );
}

ProjectPage.propTypes = {
    params: PropTypes.shape({
        id: PropTypes.string.isRequired,
    }).isRequired,
};
