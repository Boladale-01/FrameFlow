import React from 'react';

interface HeaderProps {
  onTools: () => void;
  onArchive: () => void;
  onSettings: () => void;
  onCalendar: () => void;
}

const NotificationIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 00-5-5.917V5a1 1 0 00-2 0v.083A6 6 0 006 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
);


export const Header: React.FC<HeaderProps> = ({ onTools, onArchive, onSettings, onCalendar }) => {
  return (
    <header className="bg-surface border-b border-subtle-border sticky top-0 z-20">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Left side: Logo */}
          <div className="flex items-center">
            <div className="flex items-center gap-2 text-xl font-bold text-accent-text">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
          </div>

          {/* Right side: Navigations & Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
             {/* Text buttons for all screens */}
             <div className="flex items-center gap-3 sm:gap-4">
                 <button onClick={onCalendar} className="text-sm font-medium hover:text-accent-text transition whitespace-nowrap">Calendar</button>
                 <button onClick={onTools} className="text-sm font-medium hover:text-accent-text transition whitespace-nowrap">Tools</button>
                 <button onClick={onArchive} className="text-sm font-medium hover:text-accent-text transition whitespace-nowrap">Archive</button>
                 <button onClick={onSettings} className="text-sm font-medium hover:text-accent-text transition whitespace-nowrap">Settings</button>
             </div>

             {/* Separator */}
             <div className="w-px h-6 bg-default-border hidden sm:block"></div>

             {/* Notification Icon (always visible) */}
             <button onClick={() => alert('Notifications coming soon!')} className="p-2 rounded-full hover:bg-hover-bg text-muted hover:text-foreground transition">
                <NotificationIcon />
             </button>
          </div>
        </div>
      </div>
    </header>
  );
};