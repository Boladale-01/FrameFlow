import React, { useState } from 'react';
import { ContentType, Platform, Project } from '../types';
import { CONTENT_TYPES, PLATFORMS } from '../constants';
import { generateStrategy } from '../services/geminiService';

interface NewProjectFormProps {
  onProjectCreate: (project: Project) => void;
  onCancel: () => void;
}

export const NewProjectForm: React.FC<NewProjectFormProps> = ({ onProjectCreate, onCancel }) => {
  const [title, setTitle] = useState('');
  const [idea, setIdea] = useState('');
  const [contentType, setContentType] = useState<ContentType>('vlog');
  const [platform, setPlatform] = useState<Platform>('youtube');
  const [deadline, setDeadline] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !idea) {
      setError("Title and Idea are required.");
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      const strategy = await generateStrategy(title, idea, contentType, platform);
      
      const newProject: Project = {
        id: `proj_${Date.now()}`,
        title,
        idea,
        contentType,
        platform,
        deadline,
// FIX: The strategy object from the service already contains shots and editingPlan with IDs. No need to regenerate them.
        strategy: strategy,
        schedule: { filming: [], editing: [], publishing: [] }, // Auto-scheduling can be a next step
        progress: { idea: true, script: false, filming: false, editing: false, publishing: false, percent: 20 },
        badges: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        archived: false,
      };
      
      onProjectCreate(newProject);
    } catch (err: any) {
      setError(err.message || "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const commonInputClasses = "w-full px-4 py-2 bg-surface border border-default-border rounded-lg focus:ring-2 focus:ring-accent focus:border-accent transition";
  const commonLabelClasses = "block text-sm font-medium text-muted mb-1";

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 max-w-2xl">
      <div className="bg-surface p-8 rounded-xl shadow-2xl border border-subtle-border">
        <h2 className="text-2xl font-bold text-center mb-6">New Project Idea</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className={commonLabelClasses}>Title</label>
            <input type="text" id="title" value={title} onChange={e => setTitle(e.target.value)} className={commonInputClasses} placeholder="e.g., Ultimate Productivity Hacks" />
          </div>
          <div>
            <label htmlFor="idea" className={commonLabelClasses}>Short Idea</label>
            <textarea id="idea" value={idea} onChange={e => setIdea(e.target.value)} rows={4} className={commonInputClasses} placeholder="A short video covering three simple techniques to boost daily productivity..."></textarea>
          </div>
          <div>
             <label className={commonLabelClasses}>Content Type</label>
             <div className="flex flex-wrap gap-2">
                {CONTENT_TYPES.map(type => (
                    <button type="button" key={type} onClick={() => setContentType(type)} className={`px-4 py-2 text-sm font-medium rounded-full transition-colors capitalize ${contentType === type ? 'bg-accent text-accent-foreground' : 'bg-subtle-bg hover:bg-hover-bg'}`}>
                        {type}
                    </button>
                ))}
             </div>
          </div>
           <div>
             <label className={commonLabelClasses}>Platform</label>
             <div className="flex flex-wrap gap-2">
                {PLATFORMS.map(p => (
                    <button type="button" key={p} onClick={() => setPlatform(p)} className={`px-4 py-2 text-sm font-medium rounded-full transition-colors capitalize ${platform === p ? 'bg-accent text-accent-foreground' : 'bg-subtle-bg hover:bg-hover-bg'}`}>
                        {p}
                    </button>
                ))}
             </div>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button type="button" onClick={onCancel} className="w-full px-6 py-3 bg-subtle-bg text-foreground font-semibold rounded-lg hover:bg-hover-bg transition">
              Cancel
            </button>
            <button type="submit" disabled={isLoading} className="w-full px-6 py-3 bg-accent text-accent-foreground font-semibold rounded-lg hover:bg-accent-hover transition disabled:opacity-50 flex items-center justify-center">
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </>
              ) : "Generate Strategy with AI"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};