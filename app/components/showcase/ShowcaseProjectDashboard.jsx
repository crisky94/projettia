'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { showToast } from '../../lib/toast';

const LoadingSpinner = () => (
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
);

export default function ShowcaseProjectDashboard() {
    const [timeLeft, setTimeLeft] = useState(null);

    // Sample showcase projects data
    const showcaseProjects = [
        {
            id: 'showcase-1',
            name: 'E-commerce Platform',
            description: 'Complete online shopping platform with modern UI/UX design and advanced features',
            taskCount: 15,
            completedTasks: 8,
            memberCount: 5,
            _count: { tasks: 15, members: 5 }
        },
        {
            id: 'showcase-2',
            name: 'Mobile Banking App',
            description: 'Secure mobile application for banking operations with biometric authentication',
            taskCount: 12,
            completedTasks: 4,
            memberCount: 4,
            _count: { tasks: 12, members: 4 }
        },
        {
            id: 'showcase-3',
            name: 'AI Analytics Dashboard',
            description: 'Business intelligence dashboard with machine learning insights and real-time data visualization',
            taskCount: 8,
            completedTasks: 6,
            memberCount: 3,
            _count: { tasks: 8, members: 3 }
        }
    ];

    useEffect(() => {
        // Check if showcase session exists and is valid
        const showcaseStart = localStorage.getItem('showcaseStartTime');
        if (!showcaseStart) {
            // Set showcase start time
            localStorage.setItem('showcaseStartTime', Date.now().toString());
        }

        const updateTimer = () => {
            const start = Number.parseInt(localStorage.getItem('showcaseStartTime') || Date.now().toString());
            const elapsed = Date.now() - start;
            const remaining = Math.max(0, 30 * 60 * 1000 - elapsed); // 30 minutes
            
            setTimeLeft(remaining);
            
            if (remaining <= 0) {
                localStorage.removeItem('showcaseStartTime');
                globalThis.location.href = '/';
            }
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, []);

    const formatTime = (ms) => {
        const minutes = Math.floor(ms / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const LoadingSpinner = () => (
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    );

    if (timeLeft === null) {
        return (
            <div className="flex items-center justify-center py-20 bg-background">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="w-full max-w-7xl mx-auto py-4 px-4 sm:py-6 sm:px-6 lg:px-8 bg-background">
            {/* Showcase Timer Banner */}
            <div className="mb-6 p-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg shadow-lg">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                        <h2 className="text-lg font-bold">🚀 Showcase Mode Active</h2>
                        <p className="text-sm opacity-90">Explore the full functionality of our project management platform</p>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-mono font-bold">{formatTime(timeLeft)}</div>
                        <div className="text-xs opacity-90">Time remaining</div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Showcase Projects</h1>
                <button
                    onClick={() => {
                        showToast.info('Project creation is disabled in showcase mode');
                    }}
                    className="bg-gray-400 text-white px-4 py-2 rounded-lg cursor-default opacity-60"
                    disabled
                >
                    + Create Project (Disabled)
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {showcaseProjects.map((project) => {
                    const taskCount = project.taskCount;
                    const completedTasks = project.completedTasks;
                    const progress = taskCount > 0 ? Math.round((completedTasks / taskCount) * 100) : 0;
                    const memberCount = project.memberCount;

                    return (
                        <Link
                            key={project.id}
                            href={`/showcase-project/${project.id}`}
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
                                
                                {/* Progress Bar */}
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">Progress</span>
                                        <span className="text-sm font-medium text-card-foreground">{progress}%</span>
                                    </div>
                                    <div className="w-full bg-secondary rounded-full h-2">
                                        <div
                                            className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${progress}%` }}
                                        ></div>
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {completedTasks} of {taskCount} tasks completed
                                    </div>
                                </div>
                            </div>

                            {/* Project Stats */}
                            <div className="px-6 py-4 bg-muted/50">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                        <span className="text-sm text-muted-foreground">
                                            {memberCount} member{memberCount === 1 ? '' : 's'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                        </svg>
                                        <span className="text-sm text-muted-foreground">
                                            {taskCount} task{taskCount === 1 ? '' : 's'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>

            {/* Showcase Info */}
            <div className="mt-8 p-6 bg-muted/50 rounded-lg border border-border">
                <h3 className="text-lg font-semibold mb-3">About This Showcase</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                    <div>
                        <h4 className="font-medium text-card-foreground mb-2">What you can explore:</h4>
                        <ul className="space-y-1">
                            <li>• Task management with kanban boards</li>
                            <li>• Sprint planning and organization</li>
                            <li>• Team member assignment</li>
                            <li>• Project progress tracking</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-medium text-card-foreground mb-2">Showcase limitations:</h4>
                        <ul className="space-y-1">
                            <li>• All data is fictional and temporary</li>
                            <li>• Create/edit/delete functions are disabled</li>
                            <li>• Session expires after 30 minutes</li>
                            <li>• Perfect for exploring UI and features</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}