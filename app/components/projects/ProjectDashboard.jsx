'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-toastify';

export default function ProjectDashboard({ userId }) {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [projectName, setProjectName] = useState('');
    const [projectDescription, setProjectDescription] = useState('');
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [creating, setCreating] = useState(false);
    const router = useRouter();

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch('/api/projects');
            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }
            const data = await response.json();
            setProjects(data);
        } catch (error) {
            console.error('Error fetching projects:', error);
            setError('Failed to load projects. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateProject = async (e) => {
        e.preventDefault();
        try {
            setCreating(true);
            setError(null);
            const response = await fetch('/api/projects', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: projectName,
                    description: projectDescription,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to create project');
            }

            const project = await response.json();
            setProjects([...projects, project]);
            setShowCreateModal(false);
            setProjectName('');
            setProjectDescription('');

            // Mostrar notificación de éxito
            toast.success('¡Proyecto creado exitosamente!', {
                position: 'top-right',
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });

            // Redirigir al nuevo proyecto
            router.push(`/projects/${project.id}`);
        } catch (error) {
            console.error('Error creating project:', error);

            // Mostrar notificación de error
            toast.error(error.message || 'Error al crear el proyecto', {
                position: 'top-right',
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        } finally {
            setCreating(false);
        }
    };

    const LoadingSpinner = () => (
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20 bg-background">
                <LoadingSpinner />
            </div>
        );
    }

    if (error && !loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-background">
                <div className="text-destructive mb-4">{error}</div>
                <button
                    onClick={fetchProjects}
                    className="button-professional min-h-[44px] touch-action-manipulation flex items-center justify-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Try Again</span>
                </button>
            </div>
        );
    }

    return (
        <div className="w-full max-w-7xl mx-auto py-4 px-4 sm:py-6 sm:px-6 lg:px-8 bg-background">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">My Projects</h1>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="button-professional"
                >
                    + Create Project
                </button>
            </div>

            {projects.length === 0 ? (
                <div className="text-center py-12 px-4">
                    <h3 className="text-lg sm:text-xl text-muted-foreground mb-4">No projects yet</h3>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="text-primary hover:opacity-80 transition-opacity text-sm sm:text-base"
                    >
                        Create your first project
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {projects.map((project) => (
                        <Link
                            key={project.id}
                            href={`/projects/${project.id}`}
                            className="card-professional hover:shadow-theme-lg transition-all duration-200 active:scale-95"
                        >
                                    <div className="p-4 sm:p-6">
                                        <h2 className="text-lg sm:text-xl font-semibold text-card-foreground mb-2 line-clamp-1">
                                            {project.name}
                                        </h2>
                                        {project.description && (
                                            <p className="text-muted-foreground mb-3 sm:mb-4 line-clamp-2 text-sm sm:text-base">
                                                {project.description}
                                            </p>
                                        )}
                                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0 text-xs sm:text-sm text-muted-foreground">
                                            <div className="flex items-center gap-2">
                                                <svg
                                                    className="w-3 h-3 sm:w-4 sm:h-4"
                                                    fill="none"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                                                </svg>
                                                <span>{project._count?.tasks || 0} tasks</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <svg
                                                    className="w-3 h-3 sm:w-4 sm:h-4"
                                                    fill="none"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                                                </svg>
                                                <span>{project._count?.members || 0} members</span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="card-professional p-4 sm:p-6 w-full max-w-lg shadow-theme-xl">
                        <h2 className="text-lg sm:text-xl font-bold mb-4 text-card-foreground">Create New Project</h2>
                        <form onSubmit={handleCreateProject}>
                            <div className="mb-4">
                                <label htmlFor="projectName" className="block text-card-foreground text-sm font-bold mb-2">
                                    Project Name
                                </label>
                                <input
                                    id="projectName"
                                    type="text"
                                    value={projectName}
                                    onChange={(e) => setProjectName(e.target.value)}
                                    className="input-professional text-lg py-4 px-4 min-h-[56px] w-full"
                                    required
                                    disabled={creating}
                                />
                            </div>
                            <div className="mb-6">
                                <label htmlFor="projectDescription" className="block text-card-foreground text-sm font-bold mb-2">
                                    Description (optional)
                                </label>
                                <textarea
                                    id="projectDescription"
                                    value={projectDescription}
                                    onChange={(e) => setProjectDescription(e.target.value)}
                                    className="input-professional resize-none text-lg py-4 px-4 min-h-[120px] w-full"
                                    rows={4}
                                    disabled={creating}
                                />
                            </div>
                            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 sm:gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="button-professional-secondary"
                                    disabled={creating}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className={`button-professional ${creating ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    disabled={creating}
                                >
                                    {creating ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            Creating...
                                        </>
                                    ) : (
                                        'Create Project'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
