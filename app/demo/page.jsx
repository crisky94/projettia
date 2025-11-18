'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

const DEMO_DURATION = 5 * 60 * 1000; // 5 minutos en millisegundos

export default function DemoPage() {
  const [isDemo, setIsDemo] = useState(false);
  const [timeLeft, setTimeLeft] = useState(DEMO_DURATION);
  const [demoStartTime, setDemoStartTime] = useState(null);
  const [projects, setProjects] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const router = useRouter();

  // Datos demo pre-cargados
  const DEMO_PROJECTS = [
    {
      id: 'demo-1',
      name: 'E-commerce Platform',
      description: 'Building a modern online shopping platform with React and Node.js',
      tasks: 6,
      members: 3
    },
    {
      id: 'demo-2',
      name: 'Mobile App Design',
      description: 'UI/UX design for a fitness tracking mobile application',
      tasks: 4,
      members: 2
    },
    {
      id: 'demo-3',
      name: 'API Development',
      description: 'RESTful API for customer management system',
      tasks: 12,
      members: 2
    }
  ];

  useEffect(() => {
    // Verificar si ya existe una sesión demo activa
    const savedDemoTime = localStorage.getItem('demoStartTime');
    if (savedDemoTime) {
      const startTime = parseInt(savedDemoTime);
      const elapsed = Date.now() - startTime;

      if (elapsed < DEMO_DURATION) {
        setIsDemo(true);
        setDemoStartTime(startTime);
        setTimeLeft(DEMO_DURATION - elapsed);
        setProjects(DEMO_PROJECTS);
      } else {
        // Demo expirado, limpiar
        localStorage.removeItem('demoStartTime');
      }
    }
  }, []);

  useEffect(() => {
    if (isDemo && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1000) {
            // Demo terminado
            setIsDemo(false);
            localStorage.removeItem('demoStartTime');
            toast.info('El demo ha terminado. ¡Regístrate para continuar!');
            router.push('/');
            return 0;
          }
          return prev - 1000;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isDemo, timeLeft, router]);

  const startDemo = () => {
    const startTime = Date.now();
    setDemoStartTime(startTime);
    setIsDemo(true);
    setTimeLeft(DEMO_DURATION);
    setProjects(DEMO_PROJECTS);
    localStorage.setItem('demoStartTime', startTime.toString());
    toast.success('¡Demo activado! Tienes 5 minutos para explorar.');
  };

  const formatTime = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleCreateProject = (e) => {
    e.preventDefault();

    const newProject = {
      id: `demo-${Date.now()}`,
      name: projectName,
      description: projectDescription,
      tasks: 0,
      members: 1
    };

    setProjects([...projects, newProject]);
    setShowCreateModal(false);
    setProjectName('');
    setProjectDescription('');

    toast.success('¡Proyecto demo creado! (No se guardará)');
  };

  const handleProjectClick = (projectId) => {
    // En modo demo, navegar a una página de proyecto demo
    router.push(`/demo-project/${projectId}`);
  };

  if (isDemo) {
    return (
      <div className="bg-background min-h-screen">
        {/* Demo Timer Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-3 text-center">
          <div className="flex items-center justify-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
              <span className="font-semibold">MODO DEMO</span>
            </div>
            <div className="font-mono text-lg">
              {formatTime(timeLeft)} restantes
            </div>
            <button
              onClick={() => router.push('/')}
              className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded transition-colors text-sm"
            >
              Salir del Demo
            </button>
          </div>
        </div>

        {/* Demo Dashboard */}
        <div className="w-full max-w-7xl mx-auto py-4 px-4 sm:py-6 sm:px-6 lg:px-8">
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="font-semibold text-blue-900 dark:text-blue-100">Modo Demo Activo</h3>
            </div>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Estás viendo proyectos de ejemplo. ¡Intenta crear un nuevo proyecto o explorar las funciones!
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Proyectos Demo</h1>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-primary text-primary-foreground rounded-lg font-medium text-sm px-4 py-2 hover:opacity-90 transition-opacity"
            >
              + Crear Proyecto
            </button>
          </div>

          {projects.length === 0 ? (
            <div className="text-center py-12 px-4">
              <h3 className="text-lg sm:text-xl text-muted-foreground mb-4">Sin proyectos aún</h3>
              <button
                onClick={() => setShowCreateModal(true)}
                className="text-primary hover:opacity-80 transition-opacity text-sm sm:text-base"
              >
                Crear tu primer proyecto
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {projects.map((project) => (
                <div
                  key={project.id}
                  onClick={() => handleProjectClick(project.id)}
                  className="bg-card border border-border rounded-lg p-4 sm:p-6 cursor-pointer hover:shadow-lg transition-all duration-200 active:scale-95"
                >
                  <h2 className="text-lg sm:text-xl font-semibold text-card-foreground mb-2">
                    {project.name}
                  </h2>
                  {project.description && (
                    <p className="text-muted-foreground mb-3 sm:mb-4 text-sm sm:text-base">
                      {project.description}
                    </p>
                  )}
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0 text-xs sm:text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                      </svg>
                      <span>{project.tasks} tareas</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                      </svg>
                      <span>{project.members} miembros</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Modal Crear Proyecto */}
          {showCreateModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-card border border-border rounded-lg p-4 sm:p-6 w-full max-w-lg">
                <h2 className="text-lg sm:text-xl font-bold mb-4 text-card-foreground">Crear Nuevo Proyecto Demo</h2>
                <form onSubmit={handleCreateProject}>
                  <div className="mb-4">
                    <label htmlFor="projectName" className="block text-card-foreground text-sm font-bold mb-2">
                      Nombre del Proyecto
                    </label>
                    <input
                      id="projectName"
                      type="text"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      className="w-full p-3 border border-border rounded-lg bg-background text-foreground"
                      required
                    />
                  </div>
                  <div className="mb-6">
                    <label htmlFor="projectDescription" className="block text-card-foreground text-sm font-bold mb-2">
                      Descripción (opcional)
                    </label>
                    <textarea
                      id="projectDescription"
                      value={projectDescription}
                      onChange={(e) => setProjectDescription(e.target.value)}
                      className="w-full p-3 border border-border rounded-lg bg-background text-foreground resize-none"
                      rows={4}
                    />
                  </div>
                  <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 sm:gap-2">
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
                    >
                      Crear Proyecto Demo
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

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 py-8">
      <div className="text-center max-w-2xl mx-auto">
        <div className="mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
          Demo de Projettia
        </h1>

        <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
          Experimenta nuestra plataforma con una sesión demo de 5 minutos. ¡Sin registro necesario!
        </p>

        <div className="bg-card border border-border rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4 text-foreground">El Demo Incluye:</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <strong>Gestión de Proyectos</strong>
                <p className="text-sm text-muted-foreground">Crear y gestionar proyectos</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <strong>Tableros de Tareas</strong>
                <p className="text-sm text-muted-foreground">Organizar tareas con drag & drop</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <strong>Gestión de Sprints</strong>
                <p className="text-sm text-muted-foreground">Planificar y seguir sprints</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <strong>Chat en Tiempo Real</strong>
                <p className="text-sm text-muted-foreground">Comunicación del equipo</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <button
            onClick={startDemo}
            className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white font-semibold py-4 px-8 rounded-lg text-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            Iniciar Demo de 5 Minutos
          </button>

          <p className="text-sm text-muted-foreground">
            ¿Quieres la experiencia completa?
            <button
              onClick={() => router.push('/')}
              className="text-primary hover:underline ml-1"
            >
              Regístrate gratis
            </button>
          </p>
        </div>

        <div className="mt-8 p-4 bg-muted/50 rounded-lg text-sm text-muted-foreground">
          <p>⏰ Las sesiones demo duran 5 minutos e incluyen datos de muestra para pruebas.</p>
          <p>💾 No se guardará ningún dato después de que termine el demo.</p>
        </div>
      </div>
    </div>
  );
}
