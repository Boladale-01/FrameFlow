import React, { useState } from 'react';
import { Project, Shot, EditingStep, ScheduleItem } from '../types';
import { MILESTONES, SCRIPT_TEMPLATE_SHORT_FORM } from '../constants';
import { refineScript, analyzeScriptForShots } from '../services/geminiService';
import { produce } from 'immer';

interface ProjectDetailsProps {
    project: Project;
    onUpdateProject: (project: Project) => void;
    onDeleteProject: (id: string) => void;
    onBack: () => void;
}

type Tab = 'script' | 'shots' | 'editing' | 'schedule';

const MilestoneCheckbox: React.FC<{ label: string; checked: boolean; onChange: (checked: boolean) => void; }> = ({ label, checked, onChange }) => (
    <label className="flex items-center space-x-2 cursor-pointer">
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-accent focus:ring-accent" />
        <span className="capitalize text-sm font-medium">{label}</span>
    </label>
);

const commonInputClasses = "w-full px-3 py-2 bg-input border border-default-border rounded-md text-sm";
const commonLabelClasses = "block text-xs font-medium text-muted mb-1";


export const ProjectDetails: React.FC<ProjectDetailsProps> = ({ project, onUpdateProject, onDeleteProject, onBack }) => {
    const [activeTab, setActiveTab] = useState<Tab>('script');
    const [isEditing, setIsEditing] = useState(false);
    const [editableProject, setEditableProject] = useState<Project>(project);

    // State for AI helpers
    const [scriptRefinePrompt, setScriptRefinePrompt] = useState('');
    const [isRefining, setIsRefining] = useState(false);
    const [isGeneratingShots, setIsGeneratingShots] = useState(false);
    
    // FIX: Add handler for refining script with AI
    const handleRefineScript = async (formType: 'short' | 'long') => {
        if (!scriptRefinePrompt.trim()) {
            alert("Please enter a refinement prompt.");
            return;
        }
        setIsRefining(true);
        try {
            const newScript = await refineScript(editableProject.strategy.script, scriptRefinePrompt, formType);
            setEditableProject(p => produce(p, draft => {
                draft.strategy.script = newScript;
            }));
            setScriptRefinePrompt('');
        } catch (error) {
            console.error("Error refining script:", error);
            alert("There was an error refining the script. Please check the console for details.");
        } finally {
            setIsRefining(false);
        }
    };

    // FIX: Add handler for generating shots from script with AI
    const handleGenerateShotsFromScript = async () => {
        setIsGeneratingShots(true);
        try {
            const newShots = await analyzeScriptForShots(editableProject.strategy.script);
            setEditableProject(p => produce(p, draft => {
                draft.strategy.shots = newShots;
            }));
        } catch (error) {
            console.error("Error generating shots from script:", error);
            alert("There was an error generating shots from the script. Please check the console for details.");
        } finally {
            setIsGeneratingShots(false);
        }
    };

    const handleProgressChange = (key: keyof Project['progress'], value: boolean) => {
        const newProgress = { ...project.progress, [key]: value };
        const completedCount = MILESTONES.filter(m => newProgress[m]).length;
        const newPercent = Math.min(100, Math.round((completedCount / (MILESTONES.length)) * 100)); // Corrected denominator
        onUpdateProject({ ...project, progress: { ...newProgress, percent: newPercent }, updatedAt: new Date().toISOString() });
    };

    const handleEditToggle = () => {
        if (isEditing) {
            onUpdateProject({ ...editableProject, updatedAt: new Date().toISOString() });
        } else {
            setEditableProject(project);
        }
        setIsEditing(!isEditing);
    };

    const handleCancelEdit = () => {
        setEditableProject(project);
        setIsEditing(false);
    };
    
    const handleArchive = () => {
        if (window.confirm("Are you sure you want to archive this project?")) {
            onUpdateProject({ ...project, archived: true, updatedAt: new Date().toISOString() });
            onBack();
        }
    };
    
    const handleDelete = () => {
        if (window.confirm("Are you sure you want to permanently delete this project? This action cannot be undone.")) {
            onDeleteProject(project.id);
        }
    }

    const renderTabs = () => (
        <div className="border-b border-default-border">
            <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                {(['script', 'shots', 'editing', 'schedule'] as Tab[]).map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)}
                        className={`${
                            activeTab === tab
                            ? 'border-accent-text text-accent-text'
                            : 'border-transparent text-muted hover:text-foreground hover:border-gray-300'
                        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize transition`}
                    >
                        {tab}
                    </button>
                ))}
            </nav>
        </div>
    );
    
    const renderTabContent = () => {
        switch (activeTab) {
            case 'script': return <ScriptTab project={isEditing ? editableProject : project} isEditing={isEditing} setEditableProject={setEditableProject} isRefining={isRefining} handleRefineScript={handleRefineScript} scriptRefinePrompt={scriptRefinePrompt} setScriptRefinePrompt={setScriptRefinePrompt} />;
            case 'shots': return <ShotListTab project={isEditing ? editableProject : project} isEditing={isEditing} setEditableProject={setEditableProject} isGeneratingShots={isGeneratingShots} handleGenerateShotsFromScript={handleGenerateShotsFromScript} />;
            case 'editing': return <EditingPlanTab project={isEditing ? editableProject : project} isEditing={isEditing} setEditableProject={setEditableProject} />;
            case 'schedule': return <ScheduleTab project={isEditing ? editableProject : project} isEditing={isEditing} setEditableProject={setEditableProject} />;
            default: return null;
        }
    };

    return (
        <div className="container mx-auto p-4 md:p-6 lg:p-8">
            <button onClick={onBack} className="mb-6 flex items-center text-sm font-medium text-accent-text hover:underline">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                Back to Dashboard
            </button>

            <div className="space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
                     <div>
                        <h2 className="text-3xl font-extrabold text-foreground">{project.title}</h2>
                        <p className="text-muted capitalize">{project.contentType} for {project.platform}</p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                       {!isEditing ? (
                           <button onClick={handleEditToggle} className="px-4 py-2 text-sm bg-subtle-bg hover:bg-hover-bg rounded-lg font-semibold">Edit Project</button>
                       ) : (
                           <>
                            <button onClick={handleCancelEdit} className="px-4 py-2 text-sm bg-subtle-bg hover:bg-hover-bg rounded-lg">Cancel</button>
                            <button onClick={handleEditToggle} className="px-4 py-2 text-sm bg-accent text-accent-foreground hover:bg-accent-hover rounded-lg font-semibold">Save Project</button>
                           </>
                       )}
                    </div>
                </div>

                {/* Progress */}
                <div className="bg-surface p-6 rounded-xl border border-subtle-border">
                    <h3 className="font-bold mb-4">Progress Tracker</h3>
                    <div className="flex flex-wrap gap-x-6 gap-y-3">
                        {MILESTONES.map(milestone => (
                            <MilestoneCheckbox key={milestone} label={milestone} checked={!!project.progress[milestone]} onChange={(val) => handleProgressChange(milestone, val)} />
                        ))}
                    </div>
                </div>
                
                {renderTabs()}
                <div className="pt-4">{renderTabContent()}</div>


                 {/* Danger Zone */}
                <div className="bg-surface p-6 rounded-xl border border-red-500/30">
                     <h3 className="font-bold mb-2 text-red-500">Danger Zone</h3>
                     <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                        <p className="text-sm text-muted">Archiving will hide the project from the main dashboard. Deleting is permanent.</p>
                        <div className="flex gap-2 flex-shrink-0">
                            <button onClick={handleArchive} className="px-4 py-2 text-sm bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20 rounded-lg">Archive</button>
                            <button onClick={handleDelete} className="px-4 py-2 text-sm bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg">Delete</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


// Individual Tab Components
const ScriptTab: React.FC<{project:Project, isEditing: boolean, setEditableProject: React.Dispatch<React.SetStateAction<Project>>, isRefining: boolean, handleRefineScript: (f: 'short' | 'long') => void, scriptRefinePrompt: string, setScriptRefinePrompt: (s:string) => void}> = ({project, isEditing, setEditableProject, isRefining, handleRefineScript, scriptRefinePrompt, setScriptRefinePrompt}) => (
    <div className="bg-surface p-6 rounded-xl border border-subtle-border space-y-4">
        <h3 className="text-xl font-bold">Script</h3>
        {isEditing && (
            <div className="bg-subtle-bg p-4 rounded-lg space-y-3">
                <h4 className="text-sm font-bold">AI Script Helper</h4>
                <input type="text" value={scriptRefinePrompt} onChange={e => setScriptRefinePrompt(e.target.value)} placeholder="e.g., Make the tone more energetic" className={commonInputClasses} />
                <div className="flex gap-2">
                    <button onClick={() => handleRefineScript('short')} disabled={isRefining} className="text-xs px-3 py-1.5 bg-accent text-accent-foreground rounded-md disabled:opacity-50">{isRefining ? '...' : 'Refine Short-form'}</button>
                    <button onClick={() => handleRefineScript('long')} disabled={isRefining} className="text-xs px-3 py-1.5 bg-accent text-accent-foreground rounded-md disabled:opacity-50">{isRefining ? '...' : 'Refine Long-form'}</button>
                    <button onClick={() => setEditableProject(p => produce(p, d => { d.strategy.script = SCRIPT_TEMPLATE_SHORT_FORM }))} className="text-xs px-3 py-1.5 bg-surface rounded-md">Use Template</button>
                </div>
            </div>
        )}
        {isEditing ? (
// FIX: Use `project` prop which holds the editable project data, not `editableProject` which is out of scope.
             <textarea value={project.strategy.script} onChange={e => setEditableProject(p => produce(p, d => {d.strategy.script = e.target.value}))} rows={15} className={`${commonInputClasses} min-h-[300px] leading-relaxed`} />
        ) : (
            <div className="prose prose-sm max-w-none text-foreground prose-headings:text-foreground whitespace-pre-wrap">{project.strategy.script}</div>
        )}
    </div>
);

const ShotListTab: React.FC<{project:Project, isEditing: boolean, setEditableProject: React.Dispatch<React.SetStateAction<Project>>, isGeneratingShots: boolean, handleGenerateShotsFromScript: () => void}> = ({project, isEditing, setEditableProject, isGeneratingShots, handleGenerateShotsFromScript}) => (
     <div className="bg-surface p-6 rounded-xl border border-subtle-border space-y-4">
        <div className="flex justify-between items-center">
             <h3 className="text-xl font-bold">Shot List</h3>
             {isEditing && <button onClick={() => setEditableProject(p => produce(p, d => { d.strategy.shots.push({id: `shot_${Date.now()}`, scene: '', angle: '', location: '', gear: [], notes: ''}) }))} className="text-sm px-3 py-1.5 bg-accent text-accent-foreground rounded-md">Add Shot</button>}
        </div>
        {isEditing && (
            <div className="bg-subtle-bg p-4 rounded-lg">
                <button onClick={handleGenerateShotsFromScript} disabled={isGeneratingShots} className="w-full text-sm px-3 py-2 bg-surface rounded-md disabled:opacity-50">{isGeneratingShots ? 'Analyzing Script...' : 'AI: Analyze Script for Shots'}</button>
            </div>
        )}
        <div className="space-y-4">
            {project.strategy.shots.map((shot, index) => (
                <div key={shot.id} className="bg-subtle-bg p-4 rounded-lg">
                    {isEditing ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input value={shot.scene} onChange={e => setEditableProject(p => produce(p, d => {d.strategy.shots[index].scene = e.target.value}))} placeholder="Scene" className={commonInputClasses} />
                            <input value={shot.angle} onChange={e => setEditableProject(p => produce(p, d => {d.strategy.shots[index].angle = e.target.value}))} placeholder="Angle" className={commonInputClasses} />
                            <input value={shot.location} onChange={e => setEditableProject(p => produce(p, d => {d.strategy.shots[index].location = e.target.value}))} placeholder="Location" className={commonInputClasses} />
                             <input value={shot.gear.join(', ')} onChange={e => setEditableProject(p => produce(p, d => {d.strategy.shots[index].gear = e.target.value.split(',').map(s => s.trim())}))} placeholder="Gear (comma-separated)" className={commonInputClasses} />
                            <textarea value={shot.notes} onChange={e => setEditableProject(p => produce(p, d => {d.strategy.shots[index].notes = e.target.value}))} placeholder="Notes" className={`${commonInputClasses} md:col-span-2`} rows={2} />
                            <button onClick={() => setEditableProject(p => produce(p, d => { d.strategy.shots.splice(index, 1) }))} className="text-red-500 text-xs md:col-span-2 justify-self-end">Remove Shot</button>
                        </div>
                    ) : (
                        <div>
                            <p className="font-bold">{shot.scene} - {shot.angle}</p>
                            <p className="text-sm text-muted">{shot.location} | Gear: {shot.gear.join(', ')}</p>
                            <p className="text-sm mt-1">{shot.notes}</p>
                        </div>
                    )}
                </div>
            ))}
        </div>
    </div>
);

const EditingPlanTab: React.FC<{project:Project, isEditing: boolean, setEditableProject: React.Dispatch<React.SetStateAction<Project>>}> = ({project, isEditing, setEditableProject}) => (
     <div className="bg-surface p-6 rounded-xl border border-subtle-border space-y-4">
        <div className="flex justify-between items-center">
             <h3 className="text-xl font-bold">Editing Plan</h3>
             {isEditing && <button onClick={() => setEditableProject(p => produce(p, d => { d.strategy.editingPlan.push({id: `edit_${Date.now()}`, step: '', tools: [], notes: ''}) }))} className="text-sm px-3 py-1.5 bg-accent text-accent-foreground rounded-md">Add Step</button>}
        </div>
         <div className="space-y-4">
            {project.strategy.editingPlan.map((edit, index) => (
                <div key={edit.id} className="bg-subtle-bg p-4 rounded-lg">
                     {isEditing ? (
                        <div className="space-y-2">
                             <input value={edit.step} onChange={e => setEditableProject(p => produce(p, d => {d.strategy.editingPlan[index].step = e.target.value}))} placeholder="Step" className={commonInputClasses} />
                             <input value={edit.tools.join(', ')} onChange={e => setEditableProject(p => produce(p, d => {d.strategy.editingPlan[index].tools = e.target.value.split(',').map(s => s.trim())}))} placeholder="Tools (comma-separated)" className={commonInputClasses} />
                             <textarea value={edit.notes} onChange={e => setEditableProject(p => produce(p, d => {d.strategy.editingPlan[index].notes = e.target.value}))} placeholder="Notes" className={commonInputClasses} rows={2} />
                             <button onClick={() => setEditableProject(p => produce(p, d => { d.strategy.editingPlan.splice(index, 1) }))} className="text-red-500 text-xs justify-self-end w-full text-right">Remove Step</button>
                        </div>
                    ) : (
                        <div>
                            <p className="font-bold">{edit.step}</p>
                            <p className="text-sm text-muted">Tools: {edit.tools.join(', ')}</p>
                            <p className="text-sm mt-1">{edit.notes}</p>
                        </div>
                    )}
                </div>
            ))}
        </div>
    </div>
);

const ScheduleTab: React.FC<{project:Project, isEditing: boolean, setEditableProject: React.Dispatch<React.SetStateAction<Project>>}> = ({project, isEditing, setEditableProject}) => {
    const renderScheduleList = (type: keyof Project['schedule']) => (
        <div className="space-y-3">
             <h4 className="font-bold capitalize">{type}</h4>
            {project.schedule[type].map((item, index) => (
                <div key={item.id} className="bg-subtle-bg p-3 rounded-lg">
                    {isEditing ? (
                         <div className="space-y-2">
                            <input value={item.segment} onChange={e => setEditableProject(p => produce(p, d => {d.schedule[type][index].segment = e.target.value}))} placeholder="Segment/Task" className={commonInputClasses} />
                            <input type="datetime-local" value={item.date ? item.date.slice(0, 16) : ''} onChange={e => setEditableProject(p => produce(p, d => {d.schedule[type][index].date = new Date(e.target.value).toISOString()}))} className={commonInputClasses} />
                            <button onClick={() => setEditableProject(p => produce(p, d => { d.schedule[type].splice(index, 1) }))} className="text-red-500 text-xs w-full text-right">Remove</button>
                         </div>
                    ) : (
                        <div>
                             <p className="font-semibold">{item.segment}</p>
                             <p className="text-sm text-muted">{item.date ? new Date(item.date).toLocaleString() : 'Not scheduled'}</p>
                        </div>
                    )}
                </div>
            ))}
             {isEditing && <button onClick={() => setEditableProject(p => produce(p, d => { d.schedule[type].push({id: `sched_${type}_${Date.now()}`, segment: '', date: new Date().toISOString()}) }))} className="text-xs w-full bg-surface p-2 rounded-md">+ Add Item</button>}
        </div>
    );

    return (
        <div className="bg-surface p-6 rounded-xl border border-subtle-border">
             <h3 className="text-xl font-bold mb-4">Schedule</h3>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {renderScheduleList('filming')}
                {renderScheduleList('editing')}
                {renderScheduleList('publishing')}
             </div>
        </div>
    );
};
