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
        <div className="w-full max-w-7xl mx-auto py-8 px-4 sm:py-12 sm:px-6 lg:px-8 bg-transparent">
            {/* Dashboard Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
                <div className="space-y-2">
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tighter uppercase leading-none">
                        Workspaces
                    </h1>
                    <p className="text-white/50 font-medium text-lg max-w-md italic border-l-2 border-primary/30 pl-4 ml-1">
                        Select a project to continue building or manage your team.
                    </p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="btn-gradient px-8 py-4 rounded-2xl flex items-center justify-center gap-3 group shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300"
                >
                    <div className="h-6 w-6 rounded-lg bg-white/20 flex items-center justify-center group-hover:rotate-90 transition-transform duration-300">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                    </div>
                    <span className="font-extrabold text-sm uppercase tracking-widest text-white">Create Project</span>
                </button>
            </div>

            {projects.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 glass-card border-dashed border-white/10 mx-auto max-w-2xl">
                    <div className="h-20 w-20 rounded-3xl bg-white/5 flex items-center justify-center mb-6 border border-white/10 animate-pulse">
                        <svg className="w-10 h-10 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                    </div>
                    <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2">No active projects</h3>
                    <p className="text-white/40 mb-8 max-w-sm text-center font-medium">
                        Your workspace is quiet. Let's launch your first project and bring your team together.
                    </p>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="text-primary hover:text-white font-bold uppercase tracking-widest text-sm transition-colors border-b-2 border-primary/20 hover:border-primary pb-1 flex items-center gap-2"
                    >
                        <span>Initiate System</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
                    {projects.map((project) => {
                        const taskCount = project._count?.tasks || 0;
                        const completedTasks = project.tasks?.filter(task => task.status === 'COMPLETED')?.length || 0;
                        const progress = taskCount > 0 ? Math.round((completedTasks / taskCount) * 100) : 0;
                        const memberCount = project._count?.members || 0;

                        return (
                            <Link
                                key={project.id}
                                href={`/projects/${project.id}`}
                                className="group relative"
                            >
                                <div className="glass-card hover-lift h-full flex flex-col overflow-hidden border border-white/5 transition-all duration-500 hover:border-primary/30 group-hover:shadow-[0_0_50px_-12px_rgba(139,92,246,0.3)]">
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-primary opacity-0 group-hover:opacity-100 transition-opacity animate-shimmer bg-[length:200%_100%]"></div>

                                    <div className="p-8 sm:p-10 flex-1">
                                        <div className="flex justify-between items-start gap-4 mb-6">
                                            <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight tracking-tight uppercase group-hover:text-primary transition-colors duration-300 line-clamp-2">
                                                {project.name}
                                            </h2>
                                            <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-primary/10 transition-colors duration-500">
                                                <svg className="w-6 h-6 text-white/20 group-hover:text-primary transition-colors duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                                </svg>
                                            </div>
                                        </div>

                                        {project.description && (
                                            <p className="text-white/50 mb-8 line-clamp-2 text-base leading-relaxed font-medium group-hover:text-white/70 transition-colors duration-300">
                                                {project.description}
                                            </p>
                                        )}

                                        {/* Progress Metrics */}
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-end">
                                                <div className="space-y-0.5">
                                                    <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Efficiency</span>
                                                    <div className="text-2xl font-black text-white tabular-nums">
                                                        {progress}<span className="text-primary text-sm ml-0.5">%</span>
                                                    </div>
                                                </div>
                                                <div className="text-right glass-card px-3 py-1 border-white/5 bg-white/5">
                                                    <span className="text-xs font-bold text-white/60 tabular-nums">
                                                        {completedTasks} / {taskCount} <span className="text-[10px] text-white/30 uppercase ml-1">Closed</span>
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="w-full bg-white/5 rounded-full h-3 overflow-hidden border border-white/10 shadow-inner">
                                                <div
                                                    className={`h-full relative transition-all duration-1000 ease-out group-hover:animate-pulse-slow ${progress === 100 ? 'bg-gradient-to-r from-emerald-500 to-green-600' : 'bg-gradient-to-r from-primary to-accent'
                                                        }`}
                                                    style={{ width: `${progress}%` }}
                                                >
                                                    <div className="absolute inset-0 bg-white/20 animate-shimmer bg-[length:200%_100%] opacity-30"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Footer stats */}
                                    <div className="px-8 py-6 bg-white/5 border-t border-white/5 flex items-center justify-between backdrop-blur-sm group-hover:bg-white/10 transition-colors duration-500">
                                        <div className="flex items-center gap-6">
                                            <div className="flex items-center gap-2.5">
                                                <div className="h-8 w-8 rounded-lg bg-pink-500/10 flex items-center justify-center border border-pink-500/20">
                                                    <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                                    </svg>
                                                </div>
                                                <span className="text-sm font-bold text-white/70">
                                                    {memberCount} <span className="text-[10px] text-white/30 uppercase ml-1">Crew</span>
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2.5">
                                                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                                                    <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                    </svg>
                                                </div>
                                                <span className="text-sm font-bold text-white/70">
                                                    {taskCount} <span className="text-[10px] text-white/30 uppercase ml-1">Targets</span>
                                                </span>
                                            </div>
                                        </div>
                                        <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:translate-x-1 group-hover:bg-primary transition-all duration-300">
                                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                    {/* Add Project Card Placeholder */}
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="glass-card border-2 border-dashed border-white/5 hover:border-primary/50 hover:bg-primary/5 transition-all duration-500 group flex flex-col items-center justify-center p-12 min-h-[300px]"
                    >
                        <div className="h-20 w-20 rounded-3xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 mb-6">
                            <svg className="w-10 h-10 text-white/20 group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                        </div>
                        <span className="text-xl font-black text-white/30 uppercase tracking-widest group-hover:text-white transition-colors">Start New Mission</span>
                    </button>
                </div>
            )}

            {/* Premium Create Project Modal */}
            {showCreateModal && (
                <div
                    className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-[9999] p-4 animate-in fade-in duration-300"
                    onClick={() => !creating && setShowCreateModal(false)}
                >
                    <div
                        className="glass-card shadow-2xl rounded-3xl w-full max-w-lg overflow-hidden flex flex-col border border-white/10"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header with Gradient Background */}
                        <div className="relative px-10 py-10 border-b border-white/5 bg-gradient-to-br from-primary/20 via-background to-accent/10">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-primary animate-shimmer bg-[length:200%_100%]"></div>
                            <div className="flex items-center justify-between relative z-10">
                                <div className="space-y-1">
                                    <h2 className="text-3xl font-black text-white uppercase tracking-tight">New Project</h2>
                                    <p className="text-white/40 text-sm font-bold uppercase tracking-widest">Initialization Protocol</p>
                                </div>
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all duration-300 border border-white/10"
                                    title="Cancel"
                                    disabled={creating}
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <form onSubmit={handleCreateProject} className="p-10 space-y-8">
                            <div className="space-y-3">
                                <label htmlFor="projectName" className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">
                                    Strategic Identifier
                                </label>
                                <input
                                    id="projectName"
                                    type="text"
                                    value={projectName}
                                    onChange={(e) => setProjectName(e.target.value)}
                                    className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 text-white text-lg font-bold placeholder:text-white/10 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all shadow-inner"
                                    placeholder="Project Name..."
                                    required
                                    disabled={creating}
                                />
                            </div>

                            <div className="space-y-3">
                                <label htmlFor="projectDescription" className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">
                                    Operational Context
                                </label>
                                <textarea
                                    id="projectDescription"
                                    value={projectDescription}
                                    onChange={(e) => setProjectDescription(e.target.value)}
                                    className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 text-white text-base font-medium placeholder:text-white/10 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all min-h-[140px] shadow-inner resize-none"
                                    placeholder="Brief objectives and scope..."
                                    rows={4}
                                    disabled={creating}
                                />
                            </div>

                            <div className="flex flex-col gap-4 pt-4">
                                <button
                                    type="submit"
                                    disabled={creating}
                                    className={`btn-gradient w-full py-5 rounded-2xl flex items-center justify-center gap-3 shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all group ${creating ? 'opacity-50 cursor-not-allowed' : ''
                                        }`}
                                >
                                    {creating ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                            <span className="font-extrabold uppercase tracking-widest">Encrypting...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span className="font-extrabold uppercase tracking-widest">Deploy Pipeline</span>
                                            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7-7 7" />
                                            </svg>
                                        </>
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="w-full py-4 text-[10px] font-black text-white/30 uppercase tracking-[0.3em] hover:text-white transition-colors"
                                    disabled={creating}
                                >
                                    Cancel Operations
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
