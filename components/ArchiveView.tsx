import React from 'react';
import { Project } from '../types';

interface ArchiveViewProps {
  projects: Project[];
  onBack: () => void;
  onUpdateProject: (project: Project) => void;
}

const UnarchiveIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5zm3 3a1 1 0 00-2 0v2a1 1 0 102 0V6zm2-1a1 1 0 011 1v2a1 1 0 11-2 0V6a1 1 0 011-1zm3 1a1 1 0 10-2 0v2a1 1 0 102 0V6z" clipRule="evenodd" /></svg>;

export const ArchiveView: React.FC<ArchiveViewProps> = ({ projects, onBack, onUpdateProject }) => {
  const handleUnarchive = (project: Project) => {
    onUpdateProject({ ...project, archived: false });
  };

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <button onClick={onBack} className="mb-6 flex items-center text-sm font-medium text-accent-text hover:underline">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Back to Dashboard
      </button>
      
      <div className="bg-surface rounded-xl shadow-lg p-6 max-w-4xl mx-auto border border-subtle-border">
        <h2 className="text-2xl font-extrabold text-foreground mb-6">Archived Projects</h2>
        
        {projects.length > 0 ? (
          <div className="space-y-3">
            {projects.map(project => (
              <div key={project.id} className="bg-subtle-bg p-4 rounded-lg flex justify-between items-center">
                <div>
                  <p className="font-semibold text-foreground">{project.title}</p>
                  <p className="text-sm text-muted">Archived on: {new Date(project.updatedAt).toLocaleDateString()}</p>
                </div>
                <button onClick={() => handleUnarchive(project)} className="flex items-center gap-2 px-3 py-2 bg-surface hover:bg-hover-bg rounded-lg text-sm font-semibold">
                  <UnarchiveIcon />
                  Unarchive
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted">No archived projects yet.</p>
        )}
      </div>
    </div>
  );
};