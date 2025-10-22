import React from 'react';
import { ThemeSettings, ThemeMode, ThemePalette, ThemeDarkness } from '../types';
import { THEME_OPTIONS, ThemeOption } from '../constants';

interface SettingsProps {
  onBack: () => void;
  themeSettings: ThemeSettings;
  onThemeSettingsChange: (settings: ThemeSettings) => void;
}

const ThemePaletteCard: React.FC<{ theme: ThemeOption; isActive: boolean; onClick: () => void; }> = ({ theme, isActive, onClick }) => (
  <div onClick={onClick} className={`cursor-pointer rounded-lg border-2 p-3 transition ${isActive ? 'border-accent' : 'border-default-border hover:border-muted'}`}>
    <div className="flex items-center justify-between mb-2">
      <p className="font-semibold text-foreground">{theme.name}</p>
      {isActive && <div className="w-5 h-5 rounded-full bg-accent flex items-center justify-center"><svg className="w-3 h-3 text-accent-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg></div>}
    </div>
    <div className="flex h-8 rounded-md overflow-hidden">
      <div className="w-1/2" style={{ backgroundColor: theme.lightColor }}></div>
      <div className="w-1/2" style={{ backgroundColor: theme.darkColor }}></div>
    </div>
  </div>
);

const SectionHeader: React.FC<{title: string, subtitle: string}> = ({title, subtitle}) => (
    <div>
        <h3 className="text-lg font-bold text-foreground">{title}</h3>
        <p className="text-muted text-sm">{subtitle}</p>
    </div>
);

const SegmentedControl: React.FC<{ options: {id: string, label: string}[], activeId: string, onSelect: (id: string) => void }> = ({options, activeId, onSelect}) => (
    <div className="bg-input p-1 rounded-lg flex">
        {options.map(opt => (
            <button key={opt.id} onClick={() => onSelect(opt.id)} className={`flex-1 text-center text-sm font-semibold py-1.5 rounded-md transition ${activeId === opt.id ? 'bg-accent text-accent-foreground shadow' : 'text-muted hover:bg-hover-bg'}`}>
                {opt.label}
            </button>
        ))}
    </div>
);

export const Settings: React.FC<SettingsProps> = ({ onBack, themeSettings, onThemeSettingsChange }) => {
  const handleSettingChange = (key: keyof ThemeSettings, value: string) => {
    onThemeSettingsChange({ ...themeSettings, [key]: value });
  };

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <button onClick={onBack} className="mb-6 flex items-center text-sm font-medium text-accent-text hover:underline">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Back to Dashboard
      </button>

      <div className="bg-surface rounded-xl shadow-lg p-6 max-w-2xl mx-auto border border-subtle-border">
        <h2 className="text-2xl font-extrabold text-foreground mb-8">Settings</h2>
        
        <div className="space-y-8">
          <div className="space-y-4">
             <SectionHeader title="Appearance" subtitle="Personalize your FrameFlow experience." />
             <div className="p-4 bg-subtle-bg rounded-lg space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted mb-2 block">Mode</label>
                  <SegmentedControl options={[{id: 'light', label: 'Light'}, {id: 'dark', label: 'Dark'}]} activeId={themeSettings.mode} onSelect={(id) => handleSettingChange('mode', id)} />
                </div>

                {themeSettings.mode === 'dark' && (
                  <div>
                    <label className="text-sm font-medium text-muted mb-2 block">Darkness Level</label>
                    <SegmentedControl options={[{id: 'dim', label: 'Dim'}, {id: 'lights-out', label: 'Lights Out'}]} activeId={themeSettings.darkness} onSelect={(id) => handleSettingChange('darkness', id)} />
                  </div>
                )}
                
                <div>
                   <label className="text-sm font-medium text-muted mb-2 block">Theme</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {THEME_OPTIONS.map(theme => (
                            <ThemePaletteCard key={theme.id} theme={theme} isActive={themeSettings.palette === theme.id} onClick={() => handleSettingChange('palette', theme.id)} />
                        ))}
                    </div>
                </div>
             </div>
          </div>

          <div className="space-y-4">
            <SectionHeader title="Integrations" subtitle="Connect with other services." />
            <div className="flex justify-between items-center bg-subtle-bg p-4 rounded-lg">
              <div>
                <p className="font-semibold">Google Calendar</p>
                <p className="text-sm text-muted">Sync your project schedules automatically.</p>
              </div>
              <button onClick={() => alert('Calendar connection flow would start here.')} className="bg-accent hover:bg-accent-hover text-accent-foreground font-bold py-2 px-4 rounded-lg transition">Connect</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};