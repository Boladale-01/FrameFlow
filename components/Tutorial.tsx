import React, { useState } from 'react';

interface TutorialProps {
    onComplete: () => void;
}

const tutorialSteps = [
    {
        title: "Welcome to FrameFlow!",
        content: "This quick tour will guide you through the main features. Let's get you started on creating your next masterpiece."
    },
    {
        title: "The Dashboard",
        content: "This is your command center. All your active projects will appear here. You can create new projects using the buttons at the top."
    },
    {
        title: "Project Details",
        content: "Clicking on a project brings you here. You can manage your script, shot list, and schedule. Use the 'Edit Project' button to make changes."
    },
    {
        title: "AI-Powered Tools",
        content: "FrameFlow has a suite of powerful tools, like an AI Title Generator and a Teleprompter. Access them anytime from the 'Tools' button in the header."
    },
    {
        title: "You're All Set!",
        content: "That's it for the basics. Feel free to explore and start creating. Happy filming!"
    }
];

export const Tutorial: React.FC<TutorialProps> = ({ onComplete }) => {
    const [step, setStep] = useState(0);
    const currentStep = tutorialSteps[step];

    const handleNext = () => {
        if (step < tutorialSteps.length - 1) {
            setStep(s => s + 1);
        } else {
            onComplete();
        }
    };

    const handlePrev = () => {
        if (step > 0) {
            setStep(s => s - 1);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-surface rounded-xl shadow-2xl p-6 max-w-sm w-full border border-default-border animate-fade-in">
                <h2 className="text-xl font-bold text-accent-text mb-2">{currentStep.title}</h2>
                <p className="text-muted mb-6">{currentStep.content}</p>

                <div className="flex justify-between items-center">
                    <div className="text-sm text-muted">
                        {step + 1} / {tutorialSteps.length}
                    </div>
                    <div className="flex gap-2">
                        {step > 0 && (
                            <button onClick={handlePrev} className="px-4 py-2 text-sm bg-subtle-bg hover:bg-hover-bg rounded-md">
                                Back
                            </button>
                        )}
                        <button onClick={handleNext} className="px-4 py-2 text-sm bg-accent text-accent-foreground hover:bg-accent-hover font-semibold rounded-md">
                            {step === tutorialSteps.length - 1 ? "Finish" : "Next"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
