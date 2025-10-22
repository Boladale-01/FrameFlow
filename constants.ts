import { ContentType, Platform, Project, ThemePalette } from './types';

export const CONTENT_TYPES: ContentType[] = ["short", "vlog", "cinematic", "tutorial"];
export const PLATFORMS: Platform[] = ["youtube", "instagram", "tiktok", "x", "facebook", "other"];

export const MILESTONES: (keyof Project['progress'])[] = ['idea', 'script', 'filming', 'editing', 'publishing'];

export const SCRIPT_TEMPLATE_SHORT_FORM = `HOOK: (A captivating sentence to grab attention in the first 3 seconds)

SELLING THE SOLUTION: (Briefly describe the problem and hint at the solution you'll provide)

GIVING THE PRINCIPLE: (Explain the core concept or 'how-to' part of the video)

MAKING IT APPLICABLE: (Give a concrete example or show how the viewer can apply it themselves)

CTA: (Tell the viewer what to do next - like, follow, comment, etc.)`;


export interface ThemeOption {
  id: ThemePalette;
  name: string;
  lightColor: string;
  darkColor: string;
}

export const THEME_OPTIONS: ThemeOption[] = [
    { id: 'indigo', name: 'Indigo', lightColor: '#4f46e5', darkColor: '#6366f1' },
    { id: 'slate', name: 'Slate', lightColor: '#334155', darkColor: '#22d3ee' },
    { id: 'rose-pine', name: 'Rosé', lightColor: '#d45c7c', darkColor: '#ebbc6c' },
    { id: 'forest', name: 'Forest', lightColor: '#166534', darkColor: '#4ade80' },
    { id: 'crimson', name: 'Crimson', lightColor: '#be123c', darkColor: '#f472b6' },
    { id: 'blue', name: 'Blue', lightColor: '#3b82f6', darkColor: '#60a5fa' },
];


export const INITIAL_PROJECTS: Project[] = [
  {
    id: "proj_1",
    title: "My First Vlog",
    idea: "A day in the life of a React developer, showing my setup, coding session, and how I relax.",
    contentType: "vlog",
    platform: "youtube",
    deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    strategy: {
      script: "HOOK: Ever wondered what a developer REALLY does all day?\n\nSELLING THE SOLUTION: It's not just code! I'll show you how I structure my day for maximum productivity and fun.\n\nGIVING THE PRINCIPLE: We'll cover my morning routine, deep work setup, and how I decompress.\n\nMAKING IT APPLICABLE: You can steal these exact techniques to improve your own work-from-home life.\n\nCTA: If you found this helpful, hit the subscribe button for more!",
      shots: [
        { id: 'shot_1', scene: 'Intro', angle: 'Medium Close-up', location: 'Office', gear: ['iPhone 15', 'Ring Light'], notes: 'Speak directly to camera.'},
        { id: 'shot_2', scene: 'Workspace Tour', angle: 'Wide Angle', location: 'Office', gear: ['iPhone 15'], notes: 'Use smooth panning shots.'},
      ],
      editingPlan: [
        { id: 'edit_1', step: 'Rough Cut', tools: ['DaVinci Resolve'], notes: 'Assemble all clips in order.'},
        { id: 'edit_2', step: 'Color Grading', tools: ['DaVinci Resolve'], notes: 'Apply a consistent LUT.'},
      ],
    },
    schedule: {
      filming: [{ id: 'film_1', date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), segment: 'Intro & Office shots', durationMin: 120 }],
      editing: [{ id: 'edit_sched_1', date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), segment: 'Full Edit', durationMin: 240 }],
      publishing: [{ id: 'pub_1', date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), platform: 'youtube', segment: 'Final Upload' }],
    },
    progress: { idea: true, script: true, filming: false, editing: false, publishing: false, percent: 40 },
    badges: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    archived: false,
  }
];