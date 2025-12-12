'use client';

import PropTypes from 'prop-types';

// Task card component
const TaskCard = ({ task }) => {
    const assigneeName = task.assignee?.name || 'Unassigned';

    return (
        <div className="bg-slate-700 border border-slate-600 rounded-lg p-4 mb-3 hover:bg-slate-600 transition-colors">
            <div className="mb-2">
                <h4 className="text-white font-medium text-sm mb-1">{task.title}</h4>
                <p className="text-gray-300 text-xs">{task.description}</p>
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-medium">
                            {assigneeName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </span>
                    </div>
                    <span className="text-gray-300 text-xs">{assigneeName}</span>
                </div>
                {task.sprint && (
                    <div className="flex items-center gap-1">
                        <span className="text-green-400 text-xs">Status:</span>
                        <span className="text-blue-400 text-xs">{task.sprint.name}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

TaskCard.propTypes = {
    task: PropTypes.shape({
        id: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        description: PropTypes.string,
        status: PropTypes.string.isRequired,
        assignee: PropTypes.shape({
            name: PropTypes.string
        }),
        sprint: PropTypes.shape({
            name: PropTypes.string
        })
    }).isRequired
};

// Main TaskBoard component for showcase mode
const ShowcaseTaskBoard = ({ tasks = [] }) => {
    // Team members data
    const teamMembers = [
        {
            id: '1',
            name: 'Cristina Labrador Ordóñez',
            email: 'cristina.555@gmail.com',
            role: 'Admin',
            avatar: 'CL'
        },
        {
            id: '2',
            name: 'Cristina Labrador',
            email: 'labradoricristina@gmail.com',
            role: 'Member',
            avatar: 'CL'
        }
    ];

    // Group tasks by status
    const todoTasks = tasks.filter(task => task.status === 'TODO');
    const inProgressTasks = tasks.filter(task => task.status === 'IN_PROGRESS');
    const completedTasks = tasks.filter(task => task.status === 'COMPLETED');

    return (
        <div className="w-full">
            {/* Header Section */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-purple-600 rounded flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                        <h1 className="text-white text-xl font-semibold">Task Board</h1>
                    </div>
                    <button className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm transition-colors cursor-not-allowed opacity-60">
                        + New Task
                    </button>
                </div>
                <p className="text-gray-400 text-sm">Manage and organize project tasks efficiently</p>
            </div>

            {/* Team Members Section */}
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </div>
                    <span className="text-green-400 text-sm font-medium">Team Members</span>
                </div>
                <p className="text-gray-400 text-sm mb-3">2 members in the project</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {teamMembers.map(member => (
                        <div key={member.id} className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                                    <span className="text-white text-sm font-medium">{member.avatar}</span>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-white font-medium text-sm">{member.name}</h3>
                                    <div className="flex items-center gap-4 mt-1">
                                        <div className="flex items-center gap-1">
                                            <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                            <span className="text-gray-400 text-xs">{member.email}</span>
                                        </div>
                                    </div>
                                </div>
                                <span className={`px-2 py-1 rounded text-xs font-medium ${member.role === 'Admin'
                                        ? 'bg-purple-600 text-white'
                                        : 'bg-blue-600 text-white'
                                    }`}>
                                    {member.role}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Kanban Board */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* To Do Column */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg">
                    <div className="p-4 border-b border-slate-700">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 bg-orange-600 rounded flex items-center justify-center">
                                    <span className="text-white text-xs font-bold">E</span>
                                </div>
                                <span className="text-white font-medium">To Do's</span>
                                <span className="text-gray-400 text-sm">Pending tasks to start</span>
                            </div>
                            <div className="bg-orange-600 text-white px-2 py-1 rounded text-sm font-medium">
                                {todoTasks.length}
                            </div>
                        </div>
                    </div>
                    <div className="p-4">
                        {todoTasks.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">No tasks</p>
                        ) : (
                            todoTasks.map(task => <TaskCard key={task.id} task={task} />)
                        )}
                    </div>
                </div>

                {/* In Progress Column */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg">
                    <div className="p-4 border-b border-slate-700">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                                    <span className="text-white text-xs font-bold">I</span>
                                </div>
                                <span className="text-white font-medium">In Progress</span>
                                <span className="text-gray-400 text-sm">Tasks in active development</span>
                            </div>
                            <div className="bg-blue-600 text-white px-2 py-1 rounded text-sm font-medium">
                                {inProgressTasks.length}
                            </div>
                        </div>
                    </div>
                    <div className="p-4">
                        {inProgressTasks.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">No tasks</p>
                        ) : (
                            inProgressTasks.map(task => <TaskCard key={task.id} task={task} />)
                        )}
                    </div>
                </div>

                {/* Completed Column */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg">
                    <div className="p-4 border-b border-slate-700">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 bg-green-600 rounded flex items-center justify-center">
                                    <span className="text-white text-xs font-bold">✓</span>
                                </div>
                                <span className="text-white font-medium">Completed</span>
                                <span className="text-gray-400 text-sm">Successfully completed tasks</span>
                            </div>
                            <div className="bg-green-600 text-white px-2 py-1 rounded text-sm font-medium">
                                {completedTasks.length}
                            </div>
                        </div>
                    </div>
                    <div className="p-4">
                        {completedTasks.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">No tasks</p>
                        ) : (
                            completedTasks.map(task => (
                                <div key={task.id} className="bg-slate-700 border border-slate-600 rounded-lg p-4 mb-3">
                                    <div className="mb-2">
                                        <h4 className="text-white font-medium text-sm mb-1">{task.title}</h4>
                                        <p className="text-gray-300 text-xs">{task.description}</p>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-400 text-xs">View more</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-400 text-xs">Unassigned</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

ShowcaseTaskBoard.propTypes = {
    tasks: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        description: PropTypes.string,
        status: PropTypes.string.isRequired,
        estimatedHours: PropTypes.number,
        assignee: PropTypes.shape({
            id: PropTypes.string.isRequired,
            name: PropTypes.string.isRequired,
            email: PropTypes.string
        }),
        sprint: PropTypes.shape({
            id: PropTypes.string.isRequired,
            name: PropTypes.string.isRequired
        })
    }))
};

export default ShowcaseTaskBoard;