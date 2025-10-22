import React from 'react';
import { Project } from '../types';

interface ProjectCardProps {
  project: Project;
  onSelect: () => void;
}

const ProgressBar: React.FC<{ percent: number }> = ({ percent }) => (
    <div className="w-full bg-input rounded-full h-1.5">
        <div className="bg-accent h-1.5 rounded-full" style={{ width: `${percent}%` }}></div>
    </div>
);

const PlatformIcon: React.FC<{ platform: Project['platform'] }> = ({ platform }) => {
    // A simple mapping to represent icons, in a real app these would be SVG components
    const iconMap: Record<Project['platform'], string> = {
        youtube: 'YT',
        instagram: 'IG',
        tiktok: 'TT',
        x: 'X',
        facebook: 'FB',
        other: 'O',
    };
    return <div className="text-xs font-bold text-muted">{iconMap[platform]}</div>
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onSelect }) => {
  const { title, contentType, platform, progress, deadline } = project;

  const getDeadlineInfo = () => {
    if (!deadline) return null;
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const diffTime = deadlineDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
        return <span className="text-sm text-red-500">Overdue</span>
    }
    if (diffDays <= 7) {
        return <span className="text-sm text-yellow-500">{diffDays} days left</span>
    }
    return <span className="text-sm text-muted">{deadlineDate.toLocaleDateString()}</span>
  }

  return (
    <div onClick={onSelect} className="bg-surface rounded-xl shadow-lg border border-subtle-border p-5 flex flex-col justify-between cursor-pointer hover:border-accent transition group">
      <div>
        <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-lg group-hover:text-accent-text transition">{title}</h3>
            <PlatformIcon platform={platform} />
        </div>
        <p className="text-sm text-muted capitalize mb-4">{contentType}</p>
      </div>
      <div>
        <div className="flex justify-between items-center text-sm text-muted mb-1">
            <span>Progress</span>
            <span>{progress.percent}%</span>
        </div>
        <ProgressBar percent={progress.percent} />
        <div className="text-right mt-3">
            {getDeadlineInfo()}
        </div>
      </div>
    </div>
  );
};
