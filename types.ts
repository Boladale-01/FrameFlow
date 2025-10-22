export type ContentType = "short" | "vlog" | "cinematic" | "tutorial";
export type Platform = "youtube" | "instagram" | "tiktok" | "x" | "facebook" | "other";

export type ThemeMode = 'light' | 'dark';
export type ThemePalette = 'indigo' | 'slate' | 'rose-pine' | 'forest' | 'crimson' | 'blue';
export type ThemeDarkness = 'dim' | 'lights-out';
export interface ThemeSettings {
  mode: ThemeMode;
  palette: ThemePalette;
  darkness: ThemeDarkness;
}

export interface Shot {
  id: string;
  scene: string;
  angle: string;
  location: string;
  gear: string[];
  notes: string;
}

export interface EditingStep {
  id:string;
  step: string;
  tools: string[];
  notes: string;
}

export interface ScheduleItem {
  id: string;
  date: string; // Full ISO8601 string with time
  segment: string;
  durationMin?: number;
  platform?: string;
}

export interface Strategy {
  script: string;
  shots: Shot[];
  editingPlan: EditingStep[];
}

export interface Progress {
  idea: boolean;
  script: boolean;
  filming: boolean;
  editing: boolean;
  publishing: boolean;
  percent: number;
}

export interface Project {
  id: string;
  title: string;
  idea: string;
  contentType: ContentType;
  platform: Platform;
  deadline: string | null;
  strategy: Strategy;
  schedule: {
    filming: ScheduleItem[];
    editing: ScheduleItem[];
    publishing: ScheduleItem[];
  };
  progress: Progress;
  badges: string[];
  createdAt: string; // ISO8601
  updatedAt: string; // ISO8601
  archived: boolean;
}