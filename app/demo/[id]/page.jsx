'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TaskBoard from '../../../components/projects/TaskBoard';
import SprintManager from '../../../components/projects/SprintManager';
import { toast } from 'react-toastify';

// Pre-loaded demo data
const DEMO_DATA = {
    'demo-1': {
        id: 'demo-1',
        name: 'E-commerce Platform',
        description: 'Building a modern online shopping platform with React and Node.js',
        ownerId: 'demo_user',
        members: [
            {
                id: '1',
                userId: 'demo_user',
                user: { id: 'demo_user', name: 'Demo User', email: 'demo@projettia.com' },
                role: 'OWNER'
            },
            {
                id: '2',
                userId: 'demo_user_2',
                user: { id: 'demo_user_2', name: 'Sarah Johnson', email: 'sarah@example.com' },
                role: 'MEMBER'
            },
            {
                id: '3',
                userId: 'demo_user_3',
                user: { id: 'demo_user_3', name: 'Mike Chen', email: 'mike@example.com' },
                role: 'MEMBER'
            }
        ],
        tasks: [
            {
                id: 1,
                title: 'Setup React Project Structure',
                description: 'Initialize the React project with proper folder structure and dependencies',
                status: 'COMPLETED',
                priority: 'HIGH',
                assigneeId: 'demo_user',
                assignee: { id: 'demo_user', name: 'Demo User', email: 'demo@projettia.com' },
                sprintId: 1,
                sprint: { id: 1, name: 'Sprint 1 - Foundation' },
                projectId: 'demo-1'
            },
            {
                id: 2,
                title: 'Design Product Catalog UI',
                description: 'Create responsive product catalog with search and filter functionality',
                status: 'IN_PROGRESS',
                priority: 'HIGH',
                assigneeId: 'demo_user_2',
                assignee: { id: 'demo_user_2', name: 'Sarah Johnson', email: 'sarah@example.com' },
                sprintId: 1,
                sprint: { id: 1, name: 'Sprint 1 - Foundation' },
                projectId: 'demo-1'
            },
            {
                id: 3,
                title: 'Implement Shopping Cart',
                description: 'Add shopping cart functionality with add/remove items and quantity management',
                status: 'IN_PROGRESS',
                priority: 'MEDIUM',
                assigneeId: 'demo_user_3',
                assignee: { id: 'demo_user_3', name: 'Mike Chen', email: 'mike@example.com' },
                sprintId: 2,
                sprint: { id: 2, name: 'Sprint 2 - Features' },
                projectId: 'demo-1'
            },
            {
                id: 4,
                title: 'Setup Payment Integration',
                description: 'Integrate with Stripe for secure payment processing',
                status: 'PENDING',
                priority: 'HIGH',
                assigneeId: null,
                assignee: null,
                sprintId: null,
                sprint: null,
                projectId: 'demo-1'
            },
            {
                id: 5,
                title: 'Create Product Detail Pages',
                description: 'Design and implement individual product detail pages with images and specs',
                status: 'PENDING',
                priority: 'MEDIUM',
                assigneeId: null,
                assignee: null,
                sprintId: 2,
                sprint: { id: 2, name: 'Sprint 2 - Features' },
                projectId: 'demo-1'
            },
            {
                id: 6,
                title: 'Add User Reviews System',
                description: 'Allow users to leave reviews and ratings for products',
                status: 'PENDING',
                priority: 'LOW',
                assigneeId: null,
                assignee: null,
                sprintId: null,
                sprint: null,
                projectId: 'demo-1'
            },
            {
                id: 7,
                title: 'Implement Order Tracking',
                description: 'Create order tracking system for customers to monitor their purchases',
                status: 'PENDING',
                priority: 'MEDIUM',
                assigneeId: null,
                assignee: null,
                sprintId: null,
                sprint: null,
                projectId: 'demo-1'
            },
            {
                id: 8,
                title: 'Setup Email Notifications',
                description: 'Configure email notifications for order confirmations and updates',
                status: 'PENDING',
                priority: 'LOW',
                assigneeId: null,
                assignee: null,
                sprintId: null,
                sprint: null,
                projectId: 'demo-1'
            }
        ],
        sprints: [
            {
                id: 1,
                name: 'Sprint 1 - Foundation',
                description: 'Basic setup and core UI components',
                status: 'ACTIVE',
                startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                projectId: 'demo-1'
            },
            {
                id: 2,
                name: 'Sprint 2 - Features',
                description: 'Core e-commerce features and functionality',
                status: 'PLANNED',
                startDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
                endDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
                projectId: 'demo-1'
            }
        ]
    },
    'demo-2': {
        id: 'demo-2',
        name: 'Mobile App Design',
        description: 'UI/UX design for a fitness tracking mobile application',
        ownerId: 'demo_user',
        members: [
            {
                id: '1',
                userId: 'demo_user',
                user: { id: 'demo_user', name: 'Demo User', email: 'demo@projettia.com' },
                role: 'OWNER'
            },
            {
                id: '2',
                userId: 'demo_user_4',
                user: { id: 'demo_user_4', name: 'Emma Davis', email: 'emma@example.com' },
                role: 'MEMBER'
            }
        ],
        tasks: [
            {
                id: 9,
                title: 'Create User Personas',
                description: 'Research and define target user personas for the fitness app',
                status: 'COMPLETED',
                priority: 'HIGH',
                assigneeId: 'demo_user',
                assignee: { id: 'demo_user', name: 'Demo User', email: 'demo@projettia.com' },
                sprintId: 3,
                sprint: { id: 3, name: 'Design Sprint 1' },
                projectId: 'demo-2'
            },
            {
                id: 10,
                title: 'Design Workout Tracking Interface',
                description: 'Create wireframes and mockups for workout tracking screens',
                status: 'IN_PROGRESS',
                priority: 'HIGH',
                assigneeId: 'demo_user_4',
                assignee: { id: 'demo_user_4', name: 'Emma Davis', email: 'emma@example.com' },
                sprintId: 3,
                sprint: { id: 3, name: 'Design Sprint 1' },
                projectId: 'demo-2'
            },
            {
                id: 11,
                title: 'Create Progress Dashboard',
                description: 'Design user dashboard with fitness progress visualization',
                status: 'IN_PROGRESS',
                priority: 'MEDIUM',
                assigneeId: 'demo_user',
                assignee: { id: 'demo_user', name: 'Demo User', email: 'demo@projettia.com' },
                sprintId: 3,
                sprint: { id: 3, name: 'Design Sprint 1' },
                projectId: 'demo-2'
            },
            {
                id: 12,
                title: 'Design Social Features',
                description: 'Create UI for social sharing and friend challenges',
                status: 'PENDING',
                priority: 'MEDIUM',
                assigneeId: null,
                assignee: null,
                sprintId: null,
                sprint: null,
                projectId: 'demo-2'
            },
            {
                id: 13,
                title: 'Create Onboarding Flow',
                description: 'Design user onboarding experience for new users',
                status: 'PENDING',
                priority: 'HIGH',
                assigneeId: null,
                assignee: null,
                sprintId: null,
                sprint: null,
                projectId: 'demo-2'
            },
            {
                id: 14,
                title: 'Design Settings Screen',
                description: 'Create settings and preferences interface',
                status: 'PENDING',
                priority: 'LOW',
                assigneeId: null,
                assignee: null,
                sprintId: null,
                sprint: null,
                projectId: 'demo-2'
            }
        ],
        sprints: [
            {
                id: 3,
                name: 'Design Sprint 1',
                description: 'Initial design research and wireframing',
                status: 'ACTIVE',
                startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
                endDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
                projectId: 'demo-2'
            }
        ]
    },
    'demo-3': {
        id: 'demo-3',
        name: 'API Development',
        description: 'RESTful API for customer management system',
        ownerId: 'demo_user',
        members: [
            {
                id: '1',
                userId: 'demo_user',
                user: { id: 'demo_user', name: 'Demo User', email: 'demo@projettia.com' },
                role: 'OWNER'
            },
            {
                id: '2',
                userId: 'demo_user_5',
                user: { id: 'demo_user_5', name: 'Alex Martinez', email: 'alex@example.com' },
                role: 'ADMIN'
            },
            {
                id: '3',
                userId: 'demo_user_6',
                user: { id: 'demo_user_6', name: 'Lisa Wang', email: 'lisa@example.com' },
                role: 'MEMBER'
            },
            {
                id: '4',
                userId: 'demo_user_7',
                user: { id: 'demo_user_7', name: 'Tom Brown', email: 'tom@example.com' },
                role: 'MEMBER'
            }
        ],
        tasks: [
            {
                id: 15,
                title: 'Setup Database Schema',
                description: 'Design and implement PostgreSQL database schema',
                status: 'COMPLETED',
                priority: 'HIGH',
                assigneeId: 'demo_user',
                assignee: { id: 'demo_user', name: 'Demo User', email: 'demo@projettia.com' },
                sprintId: 4,
                sprint: { id: 4, name: 'Backend Sprint 1' },
                projectId: 'demo-3'
            },
            {
                id: 16,
                title: 'Create Customer CRUD Endpoints',
                description: 'Implement REST endpoints for customer management',
                status: 'IN_PROGRESS',
                priority: 'HIGH',
                assigneeId: 'demo_user_5',
                assignee: { id: 'demo_user_5', name: 'Alex Martinez', email: 'alex@example.com' },
                sprintId: 4,
                sprint: { id: 4, name: 'Backend Sprint 1' },
                projectId: 'demo-3'
            },
            {
                id: 17,
                title: 'Add Authentication Middleware',
                description: 'Implement JWT-based authentication and authorization',
                status: 'IN_PROGRESS',
                priority: 'HIGH',
                assigneeId: 'demo_user_6',
                assignee: { id: 'demo_user_6', name: 'Lisa Wang', email: 'lisa@example.com' },
                sprintId: 4,
                sprint: { id: 4, name: 'Backend Sprint 1' },
                projectId: 'demo-3'
            },
            {
                id: 18,
                title: 'API Documentation',
                description: 'Create comprehensive API documentation using Swagger',
                status: 'PENDING',
                priority: 'MEDIUM',
                assigneeId: null,
                assignee: null,
                sprintId: 4,
                sprint: { id: 4, name: 'Backend Sprint 1' },
                projectId: 'demo-3'
            },
            {
                id: 19,
                title: 'Implement Rate Limiting',
                description: 'Add rate limiting to prevent API abuse',
                status: 'PENDING',
                priority: 'MEDIUM',
                assigneeId: null,
                assignee: null,
                sprintId: null,
                sprint: null,
                projectId: 'demo-3'
            },
            {
                id: 20,
                title: 'Setup Error Handling',
                description: 'Implement consistent error handling across all endpoints',
                status: 'PENDING',
                priority: 'HIGH',
                assigneeId: null,
                assignee: null,
                sprintId: null,
                sprint: null,
                projectId: 'demo-3'
            },
            {
                id: 21,
                title: 'Add Unit Tests',
                description: 'Write comprehensive unit tests for all endpoints',
                status: 'PENDING',
                priority: 'MEDIUM',
                assigneeId: null,
                assignee: null,
                sprintId: null,
                sprint: null,
                projectId: 'demo-3'
            }
        ],
        sprints: [
            {
                id: 4,
                name: 'Backend Sprint 1',
                description: 'Core API development and database setup',
                status: 'ACTIVE',
                startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
                endDate: new Date(Date.now()).toISOString(),
                projectId: 'demo-3'
            }
        ]
    }
};

export default function DemoProjectPage({ params }) {
    const router = useRouter();
    const [project, setProject] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [sprints, setSprints] = useState([]);
    const [members, setMembers] = useState([]);
    const [activeTab, setActiveTab] = useState('kanban');
    const user = { id: 'demo_user', name: 'Demo User', email: 'demo@projettia.com' };

    useEffect(() => {
        // Load demo data based on project ID
        const demoData = DEMO_DATA[params.id];

        if (demoData) {
            setProject(demoData);
            setTasks(demoData.tasks);
            setSprints(demoData.sprints);
            setMembers(demoData.members);
        } else {
            // Invalid demo project ID
            router.push('/demo');
        }
    }, [params.id, router]);

    // Read-only handlers that show toast messages
    const handleReadOnlyAction = (action) => {
        toast.info(`Sign up to unlock ${action} functionality!`, {
            position: 'top-right',
            autoClose: 3000,
        });
    };

    if (!project) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="flex flex-col items-center space-y-4">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-foreground text-lg">Loading demo project...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-background min-h-screen">
            {/* Demo Banner */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-3 text-center">
                <div className="flex items-center justify-center gap-4">
                    <div className="flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span className="font-semibold">DEMO MODE - Read Only</span>
                    </div>
                    <button
                        onClick={() => router.push('/demo')}
                        className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded transition-colors text-sm"
                    >
                        Back to Demo Dashboard
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                {/* Project Header */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-3xl font-bold text-foreground mb-2">{project.name}</h1>
                            {project.description && (
                                <p className="text-muted-foreground">{project.description}</p>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handleReadOnlyAction('member management')}
                                className="px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors"
                            >
                                <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                Members ({members.length})
                            </button>
                        </div>
                    </div>

                    {/* Demo Notice */}
                    <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <h3 className="font-semibold text-blue-900 dark:text-blue-100">Demo Project - Read Only</h3>
                        </div>
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                            You're viewing a sample project with pre-loaded data. To create and manage your own projects, tasks, and sprints, please sign up for a free account.
                        </p>
                    </div>
                </div>

                {/* Tabs */}
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

                {/* Content */}
                {activeTab === 'kanban' && (
                    <TaskBoard
                        initialTasks={tasks}
                        members={members}
                        sprints={sprints}
                        isAdmin={false}
                        currentUserId={user.id}
                        projectId={project.id}
                        onUpdateTask={() => handleReadOnlyAction('task editing')}
                        refreshTasks={() => { }}
                        onDeleteTask={() => handleReadOnlyAction('task deletion')}
                        onViewTask={() => handleReadOnlyAction('task editing')}
                        onCreateTask={() => handleReadOnlyAction('task creation')}
                        isDemo={true}
                        readOnly={true}
                    />
                )}

                {activeTab === 'sprints' && (
                    <SprintManager
                        sprints={sprints}
                        tasks={tasks}
                        members={members}
                        isAdmin={false}
                        currentUserId={user.id}
                        projectId={project.id}
                        refreshSprints={() => { }}
                        refreshTasks={() => { }}
                        onCreateSprint={() => handleReadOnlyAction('sprint creation')}
                        onUpdateSprint={() => handleReadOnlyAction('sprint editing')}
                        isDemo={true}
                        readOnly={true}
                    />
                )}

                {/* Call to Action */}
                <div className="mt-12 text-center">
                    <div className="bg-card border border-border rounded-lg p-6">
                        <h3 className="text-xl font-bold mb-3 text-foreground">Want to create your own projects?</h3>
                        <p className="text-muted-foreground mb-4">
                            Sign up for free to unlock all features including task creation, sprint management, and team collaboration.
                        </p>
                        <button
                            onClick={() => router.push('/')}
                            className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
                        >
                            Sign Up Free
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
