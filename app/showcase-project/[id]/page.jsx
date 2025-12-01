'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ShowcaseTaskBoard from '../../components/showcase/ShowcaseTaskBoard';
import ShowcaseSprintManager from '../../components/showcase/ShowcaseSprintManager';

export default function ShowcaseProjectPage({ params }) {
    const router = useRouter();
    const [timeLeft, setTimeLeft] = useState(null);
    const [activeTab, setActiveTab] = useState('tasks');

    useEffect(() => {
        // Check if showcase session exists and is valid
        const showcaseStart = localStorage.getItem('showcaseStartTime');
        if (!showcaseStart) {
            router.push('/');
            return;
        }

        const updateTimer = () => {
            const start = Number.parseInt(showcaseStart);
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
    }, [router]);

    const formatTime = (ms) => {
        const minutes = Math.floor(ms / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    // Get project data based on ID
    const getProjectData = (id) => {
        const projectsData = {
            'showcase-1': {
                id: 'showcase-1',
                name: 'E-commerce Platform',
                description: 'Complete online shopping platform with modern UI/UX design and advanced features',
                memberCount: 5,
                taskCount: 15,
                completedTasks: 8
            },
            'showcase-2': {
                id: 'showcase-2',
                name: 'Mobile Banking App',
                description: 'Secure mobile application for banking operations with biometric authentication',
                memberCount: 4,
                taskCount: 12,
                completedTasks: 4
            },
            'showcase-3': {
                id: 'showcase-3',
                name: 'AI Analytics Dashboard',
                description: 'Business intelligence dashboard with machine learning insights and real-time data visualization',
                memberCount: 3,
                taskCount: 8,
                completedTasks: 6
            }
        };
        return projectsData[id] || projectsData['showcase-1'];
    };

    // Get fictional data for showcase
    const getFictionalData = (projectId) => {
        const data = {
            'showcase-1': {
                tasks: [
                    {
                        id: 'task-1',
                        title: 'User Authentication System',
                        description: 'Implement secure user login and registration with JWT tokens',
                        status: 'COMPLETED',
                        estimatedHours: 8,
                        assignee: { id: '1', name: 'John Smith' },
                        sprint: { id: 'sprint-1', name: 'MVP Sprint' }
                    },
                    {
                        id: 'task-2',
                        title: 'Product Catalog UI',
                        description: 'Create responsive product listing and detail pages',
                        status: 'COMPLETED',
                        estimatedHours: 12,
                        assignee: { id: '2', name: 'Sarah Johnson' },
                        sprint: { id: 'sprint-1', name: 'MVP Sprint' }
                    },
                    {
                        id: 'task-3',
                        title: 'Shopping Cart Functionality',
                        description: 'Implement add to cart, remove items, and cart persistence',
                        status: 'IN_PROGRESS',
                        estimatedHours: 6,
                        assignee: { id: '1', name: 'John Smith' },
                        sprint: { id: 'sprint-1', name: 'MVP Sprint' }
                    },
                    {
                        id: 'task-4',
                        title: 'Payment Integration',
                        description: 'Integrate Stripe payment processing for checkout',
                        status: 'IN_PROGRESS',
                        estimatedHours: 10,
                        assignee: { id: '3', name: 'Mike Chen' },
                        sprint: { id: 'sprint-2', name: 'Payment Sprint' }
                    },
                    {
                        id: 'task-5',
                        title: 'Admin Dashboard',
                        description: 'Create admin panel for managing products and orders',
                        status: 'TODO',
                        estimatedHours: 16,
                        assignee: { id: '4', name: 'Emma Wilson' },
                        sprint: null
                    },
                    {
                        id: 'task-6',
                        title: 'Search & Filters',
                        description: 'Implement product search and filtering functionality',
                        status: 'TODO',
                        estimatedHours: 8,
                        assignee: { id: '2', name: 'Sarah Johnson' },
                        sprint: null
                    }
                ],
                sprints: [
                    {
                        id: 'sprint-1',
                        name: 'MVP Sprint',
                        description: 'Core e-commerce functionality',
                        startDate: '2024-01-01',
                        endDate: '2024-01-14',
                        status: 'ACTIVE'
                    },
                    {
                        id: 'sprint-2',
                        name: 'Payment Sprint',
                        description: 'Payment processing and checkout',
                        startDate: '2024-01-15',
                        endDate: '2024-01-28',
                        status: 'PLANNING'
                    }
                ]
            },
            'showcase-2': {
                tasks: [
                    {
                        id: 'task-7',
                        title: 'Biometric Authentication',
                        description: 'Implement fingerprint and face ID authentication',
                        status: 'COMPLETED',
                        estimatedHours: 12,
                        assignee: { id: '5', name: 'Lisa Park' },
                        sprint: { id: 'sprint-3', name: 'Security Sprint' }
                    },
                    {
                        id: 'task-8',
                        title: 'Account Balance View',
                        description: 'Display user account balances and transaction history',
                        status: 'IN_PROGRESS',
                        estimatedHours: 8,
                        assignee: { id: '6', name: 'Tom Anderson' },
                        sprint: { id: 'sprint-3', name: 'Security Sprint' }
                    },
                    {
                        id: 'task-9',
                        title: 'Money Transfer Feature',
                        description: 'Enable secure money transfers between accounts',
                        status: 'TODO',
                        estimatedHours: 15,
                        assignee: { id: '7', name: 'Anna Kim' },
                        sprint: { id: 'sprint-4', name: 'Transfer Sprint' }
                    },
                    {
                        id: 'task-10',
                        title: 'Push Notifications',
                        description: 'Real-time notifications for transactions and alerts',
                        status: 'TODO',
                        estimatedHours: 6,
                        assignee: { id: '8', name: 'Robert Brown' },
                        sprint: null
                    }
                ],
                sprints: [
                    {
                        id: 'sprint-3',
                        name: 'Security Sprint',
                        description: 'Authentication and security features',
                        startDate: '2024-01-01',
                        endDate: '2024-01-14',
                        status: 'ACTIVE'
                    },
                    {
                        id: 'sprint-4',
                        name: 'Transfer Sprint',
                        description: 'Money transfer functionality',
                        startDate: '2024-01-15',
                        endDate: '2024-01-28',
                        status: 'PLANNING'
                    }
                ]
            },
            'showcase-3': {
                tasks: [
                    {
                        id: 'task-11',
                        title: 'Data Visualization Charts',
                        description: 'Create interactive charts for business metrics',
                        status: 'COMPLETED',
                        estimatedHours: 10,
                        assignee: { id: '9', name: 'Jennifer Lee' },
                        sprint: { id: 'sprint-5', name: 'Dashboard Sprint' }
                    },
                    {
                        id: 'task-12',
                        title: 'ML Model Integration',
                        description: 'Integrate machine learning models for predictions',
                        status: 'COMPLETED',
                        estimatedHours: 16,
                        assignee: { id: '10', name: 'Alex Garcia' },
                        sprint: { id: 'sprint-5', name: 'Dashboard Sprint' }
                    },
                    {
                        id: 'task-13',
                        title: 'Real-time Data Streaming',
                        description: 'Implement live data updates and streaming',
                        status: 'IN_PROGRESS',
                        estimatedHours: 12,
                        assignee: { id: '11', name: 'Maria Santos' },
                        sprint: { id: 'sprint-5', name: 'Dashboard Sprint' }
                    }
                ],
                sprints: [
                    {
                        id: 'sprint-5',
                        name: 'Dashboard Sprint',
                        description: 'Core analytics dashboard features',
                        startDate: '2024-01-01',
                        endDate: '2024-01-14',
                        status: 'ACTIVE'
                    }
                ]
            }
        };

        return data[projectId] || data['showcase-1'];
    };

    const project = getProjectData(params.id);
    const { tasks, sprints } = getFictionalData(params.id);

    if (timeLeft === null) {
        return (
            <div className="flex items-center justify-center py-20 bg-background">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Showcase Timer Banner */}
            <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                        <h2 className="text-lg font-bold">🚀 Showcase Mode Active</h2>
                        <p className="text-sm opacity-90">Exploring project: {project.name}</p>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-mono font-bold">{formatTime(timeLeft)}</div>
                        <div className="text-xs opacity-90">Time remaining</div>
                    </div>
                </div>
            </div>

            {/* Project Header */}
            <div className="bg-card border-b border-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => router.push('/showcase')}
                                className="text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{project.name}</h1>
                                <p className="text-muted-foreground mt-1">{project.description}</p>
                            </div>
                        </div>
                    </div>

                    {/* Tab Navigation */}
                    <div className="flex space-x-1 bg-muted p-1 rounded-lg">
                        <button
                            onClick={() => setActiveTab('tasks')}
                            className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all ${activeTab === 'tasks'
                                    ? 'bg-background text-foreground shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            Task Board
                        </button>
                        <button
                            onClick={() => setActiveTab('sprints')}
                            className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all ${activeTab === 'sprints'
                                    ? 'bg-background text-foreground shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            Sprint Management
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {activeTab === 'tasks' && (
                    <ShowcaseTaskBoard tasks={tasks} sprints={sprints} />
                )}
                {activeTab === 'sprints' && (
                    <ShowcaseSprintManager sprints={sprints} tasks={tasks} />
                )}
            </div>
        </div>
    );
}