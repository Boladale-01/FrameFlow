import React, { useState } from 'react';
import { Project, ContentType, Platform } from '../types';
import { generateStrategy } from '../services/geminiService';

type Step = 'idea' | 'type' | 'platform' | 'generating' | 'done';

const Message: React.FC<{ text: string; isUser?: boolean }> = ({ text, isUser }) => (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
        <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-xl ${isUser ? 'bg-accent text-accent-foreground' : 'bg-surface'}`}>
            {text}
        </div>
    </div>
);

export const AiQuickAdd: React.FC<{ onProjectCreate: (p: Project) => void; onCancel: () => void; }> = ({ onProjectCreate, onCancel }) => {
    const [step, setStep] = useState<Step>('idea');
    const [conversation, setConversation] = useState<{ text: string; isUser?: boolean }[]>([{ text: "Hello! Just give me your video idea, and I'll handle the rest." }]);
    const [idea, setIdea] = useState('');
    const [contentType, setContentType] = useState<ContentType | null>(null);
    const [platform, setPlatform] = useState<Platform | null>(null);
    const [userInput, setUserInput] = useState('');

    const addMessage = (text: string, isUser?: boolean) => {
        setConversation(prev => [...prev, { text, isUser }]);
    };
    
    const handleIdeaSubmit = () => {
        if (!userInput) return;
        setIdea(userInput);
        addMessage(userInput, true);
        setUserInput('');
        setTimeout(() => {
            addMessage("Great idea! What type of content is this? (e.g., vlog, tutorial, short)");
            setStep('type');
        }, 500);
    };

    const handleTypeSubmit = () => {
        const input = userInput.toLowerCase();
        // A real implementation would use NLP to extract this
        const foundType = ['vlog', 'tutorial', 'short', 'cinematic'].find(t => input.includes(t)) as ContentType;
        if (!foundType) {
            addMessage("Sorry, I didn't catch that. Please choose from: vlog, tutorial, short, or cinematic.");
            return;
        }
        setContentType(foundType);
        addMessage(userInput, true);
        setUserInput('');
        setTimeout(() => {
            addMessage(`Got it, a ${foundType}. Which platform is this for? (e.g., YouTube, TikTok)`);
            setStep('platform');
        }, 500);
    };

    const handlePlatformSubmit = async () => {
        const input = userInput.toLowerCase();
        const foundPlatform = ['youtube', 'tiktok', 'instagram', 'x', 'facebook', 'other'].find(p => input.includes(p)) as Platform;
        if (!foundPlatform) {
            addMessage("Sorry, I didn't recognize that platform. Try YouTube, TikTok, etc.");
            return;
        }
        setPlatform(foundPlatform);
        addMessage(userInput, true);
        setUserInput('');
        setStep('generating');
        setTimeout(() => addMessage(`Perfect. Generating a full project plan for a ${contentType} on ${foundPlatform}. One moment...`), 500);

        try {
            const strategy = await generateStrategy(idea.slice(0, 50), idea, contentType!, foundPlatform);
            const newProject: Project = {
                id: `proj_${Date.now()}`, title: idea.slice(0, 50), idea, contentType: contentType!, platform: foundPlatform,
                deadline: null, strategy, schedule: { filming: [], editing: [], publishing: [] },
                progress: { idea: true, script: false, filming: false, editing: false, publishing: false, percent: 20 },
                badges: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), archived: false,
            };
            setTimeout(() => {
                addMessage("All done! Your project has been created.");
                setStep('done');
                onProjectCreate(newProject);
            }, 2000);
        } catch (e) {
            addMessage("I'm sorry, there was an error generating the plan. Please try again later.");
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (step === 'idea') handleIdeaSubmit();
        else if (step === 'type') handleTypeSubmit();
        else if (step === 'platform') handlePlatformSubmit();
    };

    const isInputDisabled = step === 'generating' || step === 'done';

    return (
        <div className="container mx-auto p-4 md:p-6 lg:p-8 max-w-2xl">
            <div className="bg-surface p-6 rounded-xl shadow-2xl border border-subtle-border">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">AI Quick Add</h2>
                    <button onClick={onCancel} className="text-sm font-semibold text-muted hover:text-foreground">Cancel</button>
                </div>
                <div className="h-96 bg-input rounded-lg p-4 space-y-4 overflow-y-auto">
                    {conversation.map((msg, i) => <Message key={i} text={msg.text} isUser={msg.isUser} />)}
                </div>
                <div className="mt-4">
                    <form onSubmit={handleSubmit} className="flex gap-2">
                        <input type="text" value={userInput} onChange={e => setUserInput(e.target.value)} disabled={isInputDisabled} placeholder={isInputDisabled ? '' : 'Type your response...'} className="w-full px-4 py-2 bg-surface border border-default-border rounded-lg focus:ring-2 focus:ring-accent transition disabled:opacity-50" />
                        <button type="submit" disabled={isInputDisabled} className="px-4 py-2 bg-accent text-accent-foreground font-semibold rounded-lg hover:bg-accent-hover transition disabled:opacity-50">Send</button>
                    </form>
                </div>
            </div>
        </div>
    );
};