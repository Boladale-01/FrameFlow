import React, { useState, useEffect } from 'react';
import { Project, ThemeSettings } from './types';
import { INITIAL_PROJECTS } from './constants';
import { Header } from './components/Header';
import { ProjectCard } from './components/ProjectCard';
import { ProjectDetails } from './components/ProjectDetails';
import { NewProjectForm } from './components/NewProjectForm';
import { Settings } from './components/Settings';
import { Tools } from './components/Tools';
import { ArchiveView } from './components/ArchiveView';
import { AiQuickAdd } from './components/AiQuickAdd';
import { CompletedProjectItem } from './components/CompletedProjectItem';
import { CalendarView } from './components/CalendarView';
import { Tutorial } from './components/Tutorial';


type View = 'dashboard' | 'project-details' | 'new-project' | 'ai-quick-add' | 'settings' | 'tools' | 'archive' | 'calendar';

const App: React.FC = () => {
  // Try to load projects from localStorage, otherwise use initial projects
  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const savedProjects = localStorage.getItem('frameflow-projects');
      return savedProjects ? JSON.parse(savedProjects) : INITIAL_PROJECTS;
    } catch (error) {
      console.error("Could not parse projects from localStorage", error);
      return INITIAL_PROJECTS;
    }
  });

  // Save projects to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('frameflow-projects', JSON.stringify(projects));
  }, [projects]);

  const [view, setView] = useState<View>('dashboard');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  // Tutorial State
  const [showTutorial, setShowTutorial] = useState(false);
  useEffect(() => {
      const tutorialCompleted = localStorage.getItem('frameflow-tutorial-completed');
      if (!tutorialCompleted) {
          setShowTutorial(true);
      }
  }, []);

  const handleTutorialComplete = () => {
      localStorage.setItem('frameflow-tutorial-completed', 'true');
      setShowTutorial(false);
  }

  // Theme state management
  const [themeSettings, setThemeSettings] = useState<ThemeSettings>(() => {
    try {
      const savedSettings = localStorage.getItem('frameflow-theme');
      return savedSettings ? JSON.parse(savedSettings) : { mode: 'dark', palette: 'indigo', darkness: 'dim' };
    } catch (error) {
      return { mode: 'dark', palette: 'indigo', darkness: 'dim' };
    }
  });

  useEffect(() => {
    localStorage.setItem('frameflow-theme', JSON.stringify(themeSettings));
    const root = document.documentElement;
    root.setAttribute('data-mode', themeSettings.mode);
    root.setAttribute('data-theme', themeSettings.palette);
    root.setAttribute('data-darkness', themeSettings.darkness);
  }, [themeSettings]);


  const handleSelectProject = (id: string) => {
    setSelectedProjectId(id);
    setView('project-details');
  };

  const handleUpdateProject = (updatedProject: Project) => {
    setProjects(projects.map(p => p.id === updatedProject.id ? updatedProject : p));
  };
  
  const handleCreateProject = (newProject: Project) => {
    setProjects([newProject, ...projects]);
    setView('dashboard');
  };
  
  const handleDeleteProject = (id: string) => {
    setProjects(projects.filter(p => p.id !== id));
    setView('dashboard');
  };

  const selectedProject = projects.find(p => p.id === selectedProjectId);
  const activeProjects = projects.filter(p => !p.archived && p.progress.percent < 100);
  const completedProjects = projects.filter(p => !p.archived && p.progress.percent === 100);
  const archivedProjects = projects.filter(p => p.archived);

  const renderDashboard = () => (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-8">
        <div className="bg-surface p-4 rounded-lg border border-subtle-border flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
                <h1 className="text-xl font-bold">Welcome Back!</h1>
                <p className="text-sm text-muted">Ready to create your next masterpiece?</p>
            </div>
             <div className="flex items-center gap-2">
                <button onClick={() => setView('ai-quick-add')} className="px-4 py-2 text-sm font-semibold bg-subtle-bg hover:bg-hover-bg rounded-md transition whitespace-nowrap">AI Quick Add</button>
                <button onClick={() => setView('new-project')} className="px-4 py-2 text-sm font-semibold bg-accent text-accent-foreground hover:bg-accent-hover rounded-md transition whitespace-nowrap">New Project</button>
            </div>
        </div>
        
        <div>
            <h2 className="text-xl font-bold mb-4">Active Projects</h2>
            {activeProjects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {activeProjects.map(project => (
                        <ProjectCard key={project.id} project={project} onSelect={() => handleSelectProject(project.id)} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-surface rounded-lg border border-dashed border-default-border">
                    <h3 className="text-xl font-semibold">Ready, Set, Create!</h3>
                    <p className="text-muted mt-2">Your active projects will appear here.</p>
                </div>
            )}
        </div>

        {completedProjects.length > 0 && (
            <div>
                 <h2 className="text-xl font-bold mb-4">Completed Projects</h2>
                 <div className="bg-surface p-4 rounded-lg border border-subtle-border space-y-3">
                     {completedProjects.map(project => (
                         <CompletedProjectItem key={project.id} project={project} onSelect={() => handleSelectProject(project.id)} />
                     ))}
                 </div>
            </div>
        )}
    </div>
  );

  const renderContent = () => {
    switch (view) {
      case 'project-details':
        return selectedProject ? <ProjectDetails project={selectedProject} onUpdateProject={handleUpdateProject} onDeleteProject={handleDeleteProject} onBack={() => setView('dashboard')} /> : <div>Project not found</div>;
      case 'new-project':
        return <NewProjectForm onProjectCreate={handleCreateProject} onCancel={() => setView('dashboard')} />;
      case 'ai-quick-add':
        return <AiQuickAdd onProjectCreate={handleCreateProject} onCancel={() => setView('dashboard')} />;
      case 'settings':
        return <Settings onBack={() => setView('dashboard')} themeSettings={themeSettings} onThemeSettingsChange={setThemeSettings} />;
      case 'tools':
        return <Tools onBack={() => setView('dashboard')} themeSettings={themeSettings} />;
      case 'archive':
        return <ArchiveView projects={archivedProjects} onBack={() => setView('dashboard')} onUpdateProject={handleUpdateProject} />;
      case 'calendar':
        return <CalendarView projects={projects} onBack={() => setView('dashboard')} />;
      case 'dashboard':
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="bg-background text-foreground min-h-screen">
      <Header 
        onTools={() => setView('tools')}
        onArchive={() => setView('archive')}
        onSettings={() => setView('settings')}
        onCalendar={() => setView('calendar')}
      />
      <main>
        {renderContent()}
      </main>
      {showTutorial && <Tutorial onComplete={handleTutorialComplete} />}
    </div>
  );
};

export default App;