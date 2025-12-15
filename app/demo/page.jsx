'use client';

import { useRouter } from 'next/navigation';

// Pre-loaded demo projects
const DEMO_PROJECTS = [
  {
    id: 'demo-1',
    name: 'E-commerce Platform',
    description: 'Building a modern online shopping platform with React and Node.js',
    tasks: 8,
    members: 3
  },
  {
    id: 'demo-2',
    name: 'Mobile App Design',
    description: 'UI/UX design for a fitness tracking mobile application',
    tasks: 6,
    members: 2
  },
  {
    id: 'demo-3',
    name: 'API Development',
    description: 'RESTful API for customer management system',
    tasks: 7,
    members: 4
  }
];

export default function DemoPage() {
  const router = useRouter();

  const handleProjectClick = (projectId) => {
    router.push(`/demo/${projectId}`);
  };

  return (
    <div className="bg-background min-h-screen">
      {/* Demo Banner */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 text-center">
        <div className="flex items-center justify-center gap-3">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          <span className="font-semibold text-lg">DEMO MODE - Explore without signing up</span>
        </div>
      </div>

      {/* Demo Dashboard */}
      <div className="w-full max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="font-semibold text-blue-900 dark:text-blue-100">Welcome to Projettia Demo</h3>
          </div>
          <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
            Explore our project management platform with pre-loaded sample projects. Click on any project to see tasks, sprints, and team collaboration features.
          </p>
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Note:</strong> This is a read-only demo. To create and manage your own projects, please sign up for a free account.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Demo Projects</h1>
          <button
            onClick={() => router.push('/')}
            className="bg-primary text-primary-foreground rounded-lg font-medium text-sm px-6 py-3 hover:opacity-90 transition-opacity shadow-lg"
          >
            Sign Up to Create Your Own
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {DEMO_PROJECTS.map((project) => (
            <div
              key={project.id}
              onClick={() => handleProjectClick(project.id)}
              className="bg-card border border-border rounded-lg p-6 cursor-pointer hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <h2 className="text-xl font-semibold text-card-foreground mb-2">
                {project.name}
              </h2>
              {project.description && (
                <p className="text-muted-foreground mb-4 text-sm">
                  {project.description}
                </p>
              )}
              <div className="flex justify-between items-center text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                  </svg>
                  <span>{project.tasks} tasks</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                  </svg>
                  <span>{project.members} members</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-12 text-center max-w-2xl mx-auto">
          <div className="bg-card border border-border rounded-lg p-8">
            <h3 className="text-2xl font-bold mb-4 text-foreground">Ready to manage your own projects?</h3>
            <p className="text-muted-foreground mb-6">
              Sign up for free to create unlimited projects, collaborate with your team, and unlock all features.
            </p>
            <button
              onClick={() => router.push('/')}
              className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white font-semibold py-3 px-8 rounded-lg text-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              Get Started Free
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
