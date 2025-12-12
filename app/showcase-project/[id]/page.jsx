'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import PropTypes from 'prop-types';
import ShowcaseTaskBoard from '../../components/showcase/ShowcaseTaskBoard';
import ShowcaseSprintManager from '../../components/showcase/ShowcaseSprintManager';

export default function ShowcaseProjectPage({ params }) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('tasks');

    // Get fictional data for showcase
    const getFictionalData = (projectId) => {
        const data = {
            'showcase-1': {
                tasks: [
                    {
                        id: 'task-1',
                        title: 'asdasdf',
                        description: 'asdasdf',
                        status: 'TODO',
                        estimatedHours: 8,
                        assignee: { id: '1', name: 'Cristina Labrador' },
                        sprint: { id: 'sprint-1', name: '✓ Platilla' }
                    },
                    {
                        id: 'task-2',
                        title: 'gerfgdf',
                        description: 'fgdfgfgh',
                        status: 'TODO',
                        estimatedHours: 12,
                        assignee: { id: '2', name: 'Cristina Labrador Ordóñez' },
                        sprint: null
                    },
                    {
                        id: 'task-3',
                        title: 'dfsdf',
                        description: 'dfsdfs',
                        status: 'TODO',
                        estimatedHours: 6,
                        assignee: { id: '2', name: 'Cristina Labrador Ordóñez' },
                        sprint: null
                    },
                    {
                        id: 'task-4',
                        title: 'fgdfsf',
                        description: 'fgdfgd',
                        status: 'IN_PROGRESS',
                        estimatedHours: 10,
                        assignee: { id: '2', name: 'Cristina Labrador Ordóñez' },
                        sprint: { id: 'sprint-1', name: '✓ Script' }
                    },
                    {
                        id: 'task-5',
                        title: 'dhsdf',
                        description: 'fghdfgh',
                        status: 'IN_PROGRESS',
                        estimatedHours: 16,
                        assignee: { id: '1', name: 'Cristina Labrador' },
                        sprint: { id: 'sprint-1', name: '✓ Script' }
                    },
                    {
                        id: 'task-6',
                        title: 'sgdfgdsfgdsfgdsfgfdgdsfgdsfgd sdgfdgfdg',
                        description: 'fgdfdghdfghdfghfdhgdfhgdfhdfhdfhd fhdfhdfhfgfhbvcbcxb',
                        status: 'COMPLETED',
                        estimatedHours: 8,
                        assignee: null,
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

    const { tasks, sprints } = getFictionalData(params.id);

    return (
        <div className="min-h-screen bg-[#0F172A]">
            {/* Navigation Header */}
            <div className="bg-slate-800/50 border-b border-slate-700/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => router.push('/showcase')}
                                className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                                Back to projects
                            </button>
                            <div className="text-sm text-gray-400">
                                WERTEAMWORK
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-blue-400">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                <span className="text-sm">Members (2)</span>
                            </div>
                            <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                                Delete Project
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="bg-slate-800/30 border-b border-slate-700/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex space-x-8">
                        <button
                            onClick={() => setActiveTab('tasks')}
                            className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${activeTab === 'tasks'
                                    ? 'border-purple-500 text-white'
                                    : 'border-transparent text-gray-400 hover:text-gray-300'
                                }`}
                        >
                            <div className="w-6 h-6 bg-purple-600 rounded flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                            Tablero Kanban
                        </button>
                        <button
                            onClick={() => setActiveTab('sprints')}
                            className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${activeTab === 'sprints'
                                    ? 'border-purple-500 text-white'
                                    : 'border-transparent text-gray-400 hover:text-gray-300'
                                }`}
                        >
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            Sprints Management
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

ShowcaseProjectPage.propTypes = {
    params: PropTypes.shape({
        id: PropTypes.string.isRequired
    }).isRequired
};