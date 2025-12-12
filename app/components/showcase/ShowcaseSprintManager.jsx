'use client';

import PropTypes from 'prop-types';

// Main Sprint Manager component for showcase mode
const ShowcaseSprintManager = ({ sprints = [], tasks = [] }) => {
    const getSprintStatusStyles = (status) => {
        if (status === 'ACTIVE') return 'bg-green-600 text-white';
        if (status === 'PLANNING') return 'bg-yellow-600 text-white';
        return 'bg-gray-600 text-white';
    };

    const getTaskStatusStyles = (status) => {
        if (status === 'COMPLETED') return 'bg-green-600 text-white';
        if (status === 'IN_PROGRESS') return 'bg-blue-600 text-white';
        return 'bg-orange-600 text-white';
    };
    return (
        <div className="w-full">
            {/* Header Section */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <h1 className="text-white text-xl font-semibold">Sprint Management</h1>
                    </div>
                    <button className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm transition-colors cursor-not-allowed opacity-60">
                        + New Sprint
                    </button>
                </div>
                <p className="text-gray-400 text-sm">Organize tasks into sprints and track progress</p>
            </div>

            {/* Sprint Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {sprints.length === 0 ? (
                    <div className="col-span-full text-center py-12">
                        <div className="text-6xl mb-4 opacity-50">🏃‍♂️</div>
                        <h3 className="text-xl font-medium text-gray-400 mb-2">No Sprints Created</h3>
                        <p className="text-gray-500">Create your first sprint to organize your tasks</p>
                    </div>
                ) : (
                    sprints.map(sprint => {
                        const sprintTasks = tasks.filter(task => task.sprint?.id === sprint.id);
                        const completedTasks = sprintTasks.filter(task => task.status === 'COMPLETED');
                        const progressPercentage = sprintTasks.length > 0 ? Math.round((completedTasks.length / sprintTasks.length) * 100) : 0;

                        return (
                            <div key={sprint.id} className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                                {/* Sprint Header */}
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="text-white font-semibold text-lg">{sprint.name}</h3>
                                            <p className="text-gray-400 text-sm">{sprint.description}</p>
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getSprintStatusStyles(sprint.status)}`}>
                                        {sprint.status}
                                    </span>
                                </div>

                                {/* Progress Section */}
                                <div className="mb-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-gray-300 text-sm">Progress</span>
                                        <span className="text-white font-medium">{progressPercentage}%</span>
                                    </div>
                                    <div className="w-full bg-slate-700 rounded-full h-2">
                                        <div
                                            className="bg-green-600 h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${progressPercentage}%` }}
                                        ></div>
                                    </div>
                                </div>

                                {/* Task Stats */}
                                <div className="grid grid-cols-3 gap-3 mb-4">
                                    <div className="bg-slate-700 rounded-lg p-3 text-center">
                                        <div className="text-white font-bold text-lg">{sprintTasks.length}</div>
                                        <div className="text-gray-400 text-xs">Total Tasks</div>
                                    </div>
                                    <div className="bg-slate-700 rounded-lg p-3 text-center">
                                        <div className="text-blue-400 font-bold text-lg">
                                            {sprintTasks.filter(task => task.status === 'IN_PROGRESS').length}
                                        </div>
                                        <div className="text-gray-400 text-xs">In Progress</div>
                                    </div>
                                    <div className="bg-slate-700 rounded-lg p-3 text-center">
                                        <div className="text-green-400 font-bold text-lg">{completedTasks.length}</div>
                                        <div className="text-gray-400 text-xs">Completed</div>
                                    </div>
                                </div>

                                {/* Sprint Dates */}
                                <div className="flex items-center justify-between text-sm">
                                    <div className="text-gray-400">
                                        <span className="font-medium">Start:</span> {new Date(sprint.startDate).toLocaleDateString()}
                                    </div>
                                    <div className="text-gray-400">
                                        <span className="font-medium">End:</span> {new Date(sprint.endDate).toLocaleDateString()}
                                    </div>
                                </div>

                                {/* Task Preview */}
                                {sprintTasks.length > 0 && (
                                    <div className="mt-4 pt-4 border-t border-slate-700">
                                        <h4 className="text-white font-medium text-sm mb-3">Recent Tasks</h4>
                                        <div className="space-y-2">
                                            {sprintTasks.slice(0, 3).map(task => (
                                                <div key={task.id} className="flex items-center justify-between bg-slate-700 rounded p-2">
                                                    <span className="text-gray-300 text-xs truncate flex-1 mr-2">{task.title}</span>
                                                    <span className={`px-2 py-1 rounded text-xs font-medium ${getTaskStatusStyles(task.status)}`}>
                                                        {task.status.replace('_', ' ')}
                                                    </span>
                                                </div>
                                            ))}
                                            {sprintTasks.length > 3 && (
                                                <div className="text-gray-500 text-xs text-center">
                                                    +{sprintTasks.length - 3} more tasks
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

ShowcaseSprintManager.propTypes = {
    sprints: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        description: PropTypes.string,
        status: PropTypes.string.isRequired,
        startDate: PropTypes.string.isRequired,
        endDate: PropTypes.string.isRequired
    })),
    tasks: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        status: PropTypes.string.isRequired,
        sprint: PropTypes.shape({
            id: PropTypes.string.isRequired
        })
    }))
};

export default ShowcaseSprintManager;