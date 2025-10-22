import React, { useState } from 'react';
import { Project } from '../types';

interface CalendarViewProps {
  projects: Project[];
  onBack: () => void;
}

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const CalendarView: React.FC<CalendarViewProps> = ({ projects, onBack }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getEventsForDay = (day: Date) => {
    const events = [];
    for (const project of projects) {
        if (project.archived) continue;
        for (const type of ['filming', 'editing', 'publishing'] as const) {
            for (const item of project.schedule[type]) {
                if (item.date && new Date(item.date).toDateString() === day.toDateString()) {
                    events.push({
                        type,
                        title: project.title,
                        segment: item.segment
                    });
                }
            }
        }
    }
    return events;
  };

  const renderCalendarGrid = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const grid = [];
    let dayCounter = 1;

    for (let i = 0; i < 6; i++) { // Max 6 weeks in a month view
      const week = [];
      for (let j = 0; j < 7; j++) {
        if ((i === 0 && j < firstDayOfMonth) || dayCounter > daysInMonth) {
          week.push(<div key={`empty-${i}-${j}`} className="border-r border-b border-subtle-border h-24"></div>);
        } else {
          const date = new Date(year, month, dayCounter);
          const events = getEventsForDay(date);
          const isToday = date.toDateString() === new Date().toDateString();

          week.push(
            <div key={`day-${dayCounter}`} className="border-r border-b border-subtle-border p-1.5 h-24 flex flex-col">
              <span className={`text-xs font-semibold ${isToday ? 'bg-accent text-accent-foreground rounded-full h-5 w-5 flex items-center justify-center' : ''}`}>
                {dayCounter}
              </span>
              <div className="mt-1 space-y-1 overflow-y-auto text-xs">
                 {events.map((event, index) => (
                    <div key={index} className={`p-1 rounded-sm ${
                        event.type === 'filming' ? 'bg-accent-blue/20 text-blue-300' :
                        event.type === 'editing' ? 'bg-accent-orange/20 text-orange-300' :
                        'bg-accent-green/20 text-green-300'
                    }`}>
                        <p className="truncate font-semibold">{event.segment}</p>
                        <p className="truncate opacity-80">{event.title}</p>
                    </div>
                 ))}
              </div>
            </div>
          );
          dayCounter++;
        }
      }
      grid.push(<div key={`week-${i}`} className="grid grid-cols-7">{week}</div>);
      if (dayCounter > daysInMonth) break;
    }
    return grid;
  };

  const changeMonth = (delta: number) => {
      setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
  }

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <button onClick={onBack} className="mb-6 flex items-center text-sm font-medium text-accent-text hover:underline">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Back to Dashboard
      </button>

      <div className="bg-surface rounded-xl shadow-lg p-6 border border-subtle-border">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h2>
          <div className="flex gap-2">
            <button onClick={() => changeMonth(-1)} className="p-2 rounded-md hover:bg-hover-bg">&lt;</button>
            <button onClick={() => changeMonth(1)} className="p-2 rounded-md hover:bg-hover-bg">&gt;</button>
          </div>
        </div>

        <div className="border border-subtle-border">
          <div className="grid grid-cols-7 bg-subtle-bg">
            {daysOfWeek.map(day => <div key={day} className="text-center font-semibold text-sm py-2 border-r border-subtle-border">{day}</div>)}
          </div>
          <div className="border-t border-subtle-border">
            {renderCalendarGrid()}
          </div>
        </div>
      </div>
      
      <div className="bg-surface rounded-xl shadow-lg p-6 border border-subtle-border mt-8">
        <h3 className="font-bold text-lg mb-2">Use as a Widget</h3>
        <p className="text-muted text-sm">For quick access, add FrameFlow to your home screen! In your browser's menu (usually three dots or the share icon), look for and tap the "Add to Home Screen" or "Install App" option. This will let you launch FrameFlow like a native app.</p>
      </div>

    </div>
  );
};
