import React, { useState, useEffect, useRef } from 'react';
import { generateTitles, generateHashtags, generatePromptIdeas } from '../services/geminiService';
import { ThemeSettings } from '../types';

const ToolCard: React.FC<{ title: string; description: string; children: React.ReactNode; }> = ({ title, description, children }) => (
    <div className="bg-surface rounded-lg shadow-md border border-subtle-border p-4 flex flex-col">
        <h3 className="font-bold text-lg mb-1">{title}</h3>
        <p className="text-muted text-sm mb-4 flex-grow">{description}</p>
        <div className="mt-auto">{children}</div>
    </div>
);

const ColorPaletteGenerator: React.FC = () => {
    const [palette, setPalette] = useState<{ hex: string }[]>([]);
    const [copiedHex, setCopiedHex] = useState<string | null>(null);

    const hslToHex = (h: number, s: number, l: number) => {
        l /= 100;
        const a = s * Math.min(l, 1 - l) / 100;
        const f = (n: number) => {
            const k = (n + h / 30) % 12;
            const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
            return Math.round(255 * color).toString(16).padStart(2, '0');
        };
        return `#${f(0)}${f(8)}${f(4)}`;
    };

    const generatePalette = () => {
        const baseHue = Math.floor(Math.random() * 360);
        const newPalette = [0, 60, 120, 180, 240].map(offset => {
            const hue = (baseHue + offset) % 360;
            return { hex: hslToHex(hue, 70, 60) };
        });
        setPalette(newPalette);
    };
    
    const handleCopy = (hex: string) => {
        navigator.clipboard.writeText(hex);
        setCopiedHex(hex);
        setTimeout(() => setCopiedHex(null), 1500);
    }

    useEffect(() => { generatePalette(); }, []);

    return (
        <div>
            <div className="grid grid-cols-5 gap-2 mb-3">
                {palette.map(({ hex }) => (
                    <div key={hex} onClick={() => handleCopy(hex)} className="cursor-pointer group">
                        <div style={{ backgroundColor: hex }} className="h-12 w-full rounded-md" />
                        <p className="text-xs text-center mt-1 font-mono text-muted group-hover:text-foreground">
                            {copiedHex === hex ? 'Copied!' : hex}
                        </p>
                    </div>
                ))}
            </div>
            <button onClick={generatePalette} className="w-full bg-accent text-accent-foreground text-sm font-semibold py-2 rounded-md">Generate New</button>
        </div>
    );
};

const Stopwatch: React.FC = () => {
    const [time, setTime] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const intervalRef = useRef<number | null>(null);

    useEffect(() => {
        if (isActive) {
            intervalRef.current = window.setInterval(() => setTime(t => t + 10), 10);
        } else if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
        return () => { if (intervalRef.current) clearInterval(intervalRef.current) };
    }, [isActive]);
    
    const formatTime = (ms: number) => {
        const minutes = Math.floor(ms / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        const milliseconds = Math.floor((ms % 1000) / 10);
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
    };

    return (
        <div className="text-center">
            <p className="text-4xl font-mono font-bold mb-4">{formatTime(time)}</p>
            <div className="flex gap-2">
                <button onClick={() => setIsActive(!isActive)} className="w-full bg-accent text-accent-foreground text-sm font-semibold py-2 rounded-md">{isActive ? 'Pause' : 'Start'}</button>
                <button onClick={() => { setIsActive(false); setTime(0); }} className="w-full bg-subtle-bg text-sm font-semibold py-2 rounded-md">Reset</button>
            </div>
        </div>
    );
};

const CountdownTimer: React.FC = () => {
    const [minutes, setMinutes] = useState('5');
    const [seconds, setSeconds] = useState('0');
    const [timeLeft, setTimeLeft] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const intervalRef = useRef<number | null>(null);

    const startTimer = () => {
        const totalSeconds = parseInt(minutes || '0') * 60 + parseInt(seconds || '0');
        if (totalSeconds > 0) {
            setTimeLeft(totalSeconds * 1000);
            setIsActive(true);
        }
    };

    useEffect(() => {
        if (isActive && timeLeft > 0) {
            intervalRef.current = window.setInterval(() => setTimeLeft(t => t - 1000), 1000);
        } else if (timeLeft <= 0 && isActive) {
            setIsActive(false);
            if(intervalRef.current) clearInterval(intervalRef.current);
            alert("Time's up!");
        }
        return () => { if (intervalRef.current) clearInterval(intervalRef.current) };
    }, [isActive, timeLeft]);

    const formatTime = (ms: number) => {
        const mins = Math.floor(ms / 60000);
        const secs = Math.floor((ms % 60000) / 1000);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };
    
    const handleReset = () => {
        setIsActive(false);
        if(intervalRef.current) clearInterval(intervalRef.current);
        setTimeLeft(0);
    }

    return (
        <div className="text-center">
            {isActive || timeLeft > 0 ? (
                <p className="text-4xl font-mono font-bold mb-4">{formatTime(timeLeft)}</p>
            ) : (
                <div className="flex items-center justify-center gap-2 mb-4">
                    <input type="number" value={minutes} onChange={e => setMinutes(e.target.value)} className="w-20 text-center text-2xl font-mono bg-input rounded-md p-2" placeholder="MM" />
                    <span className="text-2xl font-mono">:</span>
                    <input type="number" value={seconds} onChange={e => setSeconds(e.target.value)} className="w-20 text-center text-2xl font-mono bg-input rounded-md p-2" placeholder="SS" />
                </div>
            )}
             <div className="flex gap-2">
                <button onClick={isActive ? () => setIsActive(false) : startTimer} className="w-full bg-accent text-accent-foreground text-sm font-semibold py-2 rounded-md">{isActive ? 'Pause' : 'Start'}</button>
                <button onClick={handleReset} className="w-full bg-subtle-bg text-sm font-semibold py-2 rounded-md">Reset</button>
            </div>
        </div>
    );
};

const AiTitleGenerator: React.FC = () => {
    const [topic, setTopic] = useState('');
    const [titles, setTitles] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerate = async () => {
        if (!topic) return;
        setIsLoading(true);
        setTitles([]);
        try {
            const result = await generateTitles(topic);
            setTitles(result);
        } catch (error) {
            console.error(error);
            alert("Failed to generate titles.");
        }
        setIsLoading(false);
    };

    return (
        <div className="space-y-3">
            <input type="text" value={topic} onChange={e => setTopic(e.target.value)} placeholder="Your video topic..." className="w-full px-3 py-1.5 bg-input border border-default-border rounded-md text-sm" />
            <button onClick={handleGenerate} disabled={isLoading} className="w-full bg-accent text-accent-foreground text-sm font-semibold py-2 rounded-md disabled:opacity-50">{isLoading ? 'Generating...' : 'Get Titles'}</button>
            {titles.length > 0 && (
                <ul className="text-sm list-disc list-inside bg-subtle-bg p-3 rounded-md">
                    {titles.map((title, i) => <li key={i} className="mb-1">{title}</li>)}
                </ul>
            )}
        </div>
    );
};

const HashtagGenerator: React.FC = () => {
    const [topic, setTopic] = useState('');
    const [hashtags, setHashtags] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerate = async () => {
        if (!topic) return;
        setIsLoading(true);
        setHashtags([]);
        try {
            const result = await generateHashtags(topic);
            setHashtags(result);
        } catch (error) {
            console.error(error);
            alert("Failed to generate hashtags.");
        }
        setIsLoading(false);
    };

    return (
        <div className="space-y-3">
            <input type="text" value={topic} onChange={e => setTopic(e.target.value)} placeholder="Video topic for hashtags..." className="w-full px-3 py-1.5 bg-input border border-default-border rounded-md text-sm" />
            <button onClick={handleGenerate} disabled={isLoading} className="w-full bg-accent text-accent-foreground text-sm font-semibold py-2 rounded-md disabled:opacity-50">{isLoading ? 'Generating...' : 'Get Hashtags'}</button>
            {hashtags.length > 0 && (
                <div className="text-sm bg-subtle-bg p-3 rounded-md">
                    <p className="flex flex-wrap gap-x-2 gap-y-1">
                        {hashtags.map((tag) => <span key={tag} className="font-mono text-accent-text">{tag}</span>)}
                    </p>
                </div>
            )}
        </div>
    );
};

const PromptGenerator: React.FC = () => {
    const [topic, setTopic] = useState('');
    const [prompts, setPrompts] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerate = async () => {
        if (!topic) return;
        setIsLoading(true);
        setPrompts([]);
        try {
            const result = await generatePromptIdeas(topic);
            setPrompts(result);
        } catch (error) {
            console.error(error);
            alert("Failed to generate prompt ideas.");
        }
        setIsLoading(false);
    };

    return (
        <div className="space-y-3">
            <input type="text" value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g., 'home cooking hacks'" className="w-full px-3 py-1.5 bg-input border border-default-border rounded-md text-sm" />
            <button onClick={handleGenerate} disabled={isLoading} className="w-full bg-accent text-accent-foreground text-sm font-semibold py-2 rounded-md disabled:opacity-50">{isLoading ? 'Generating...' : 'Get Ideas'}</button>
            {prompts.length > 0 && (
                <ul className="text-sm list-disc list-inside bg-subtle-bg p-3 rounded-md space-y-2">
                    {prompts.map((prompt, i) => <li key={i}>{prompt}</li>)}
                </ul>
            )}
        </div>
    );
};


const Teleprompter: React.FC<{ themeSettings: ThemeSettings }> = ({ themeSettings }) => {
    const [script, setScript] = useState('');
    const [isScrolling, setIsScrolling] = useState(false);
    const [speed, setSpeed] = useState(2); // 1 to 10
    const [fontSize, setFontSize] = useState(24); // in px
    const scrollRef = useRef<HTMLDivElement>(null);
    const animationRef = useRef<number | null>(null);

    const scrollLoop = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop += speed / 10;
            if (scrollRef.current.scrollTop < scrollRef.current.scrollHeight - scrollRef.current.clientHeight) {
                animationRef.current = requestAnimationFrame(scrollLoop);
            } else {
                setIsScrolling(false);
            }
        }
    };
    
    const handlePopOut = () => {
        const popoutWindow = window.open('', 'Teleprompter', 'width=800,height=400,scrollbars=no');
        if (popoutWindow) {
            const themeStyles = document.querySelector('style')?.innerText || '';
            const tailwindConfig = document.querySelector('script[src="https://cdn.tailwindcss.com"]');
            
            popoutWindow.document.write(`
                <html>
                    <head>
                        <title>FrameFlow Teleprompter</title>
                        <script src="https://cdn.tailwindcss.com"></script>
                        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
                        <style>
                            ${themeStyles}
                            body { font-family: 'Inter', sans-serif; overflow: hidden; }
                            .teleprompter-content { height: 100vh; overflow-y: scroll; scrollbar-width: none; -ms-overflow-style: none; }
                            .teleprompter-content::-webkit-scrollbar { display: none; }
                        </style>
                        <script>
                            // FIX: Cast window to any to access tailwind config which is loaded via script tag.
                            tailwind.config = ${JSON.stringify((window as any).tailwind.config)};
                        </script>
                    </head>
                    <body class="bg-background text-foreground p-8">
                        <div id="teleprompter-content" class="teleprompter-content whitespace-pre-wrap" style="font-size: ${fontSize}px; line-height: 1.6;">
                            ${script.replace(/\n/g, '<br />')}
                        </div>
                        <script>
                            let speed = ${speed};
                            const content = document.getElementById('teleprompter-content');
                            function scroll() {
                                content.scrollTop += speed / 10;
                                if (content.scrollTop < content.scrollHeight - content.clientHeight) {
                                    requestAnimationFrame(scroll);
                                }
                            }
                            requestAnimationFrame(scroll);
                        </script>
                    </body>
                </html>
            `);
            const root = popoutWindow.document.documentElement;
            root.setAttribute('data-mode', themeSettings.mode);
            root.setAttribute('data-theme', themeSettings.palette);
            root.setAttribute('data-darkness', themeSettings.darkness);
            popoutWindow.document.close();
        }
    };

    useEffect(() => {
        if (isScrolling) {
            animationRef.current = requestAnimationFrame(scrollLoop);
        } else {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        }
        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, [isScrolling, speed]);

    const handleReset = () => {
        setIsScrolling(false);
        if (scrollRef.current) scrollRef.current.scrollTop = 0;
    }

    return (
        <div className="space-y-3">
            {!isScrolling ? (
                 <textarea value={script} onChange={e => setScript(e.target.value)} placeholder="Paste your script here..." rows={6} className="w-full px-3 py-1.5 bg-input border border-default-border rounded-md text-sm" />
            ) : (
                <div ref={scrollRef} className="h-48 overflow-y-scroll bg-input p-3 rounded-md scrollbar-hide whitespace-pre-wrap" style={{ fontSize: `${fontSize}px`, lineHeight: 1.5 }}>
                    {script}
                </div>
            )}
            <div className="space-y-3">
                 <div className="flex items-center gap-2">
                    <label className="text-xs text-muted w-20">Font Size</label>
                    <input type="range" min="16" max="48" value={fontSize} onChange={e => setFontSize(Number(e.target.value))} className="w-full" />
                </div>
                <div className="flex items-center gap-2">
                    <label className="text-xs text-muted w-20">Speed</label>
                    <input type="range" min="0.5" max="5" step="0.1" value={speed} onChange={e => setSpeed(Number(e.target.value))} className="w-full" />
                </div>
            </div>
            <div className="flex gap-2">
                <button onClick={() => setIsScrolling(!isScrolling)} disabled={!script} className="w-full bg-accent text-accent-foreground text-sm font-semibold py-2 rounded-md disabled:opacity-50">{isScrolling ? 'Pause' : 'Start'}</button>
                <button onClick={handleReset} className="w-full bg-subtle-bg text-sm font-semibold py-2 rounded-md">Reset</button>
            </div>
            <button onClick={handlePopOut} disabled={!script} className="w-full bg-surface border border-default-border text-sm font-semibold py-2 rounded-md disabled:opacity-50 mt-2">Pop Out</button>
        </div>
    );
};

const AspectRatioCalculator: React.FC = () => {
    const [width, setWidth] = useState('1920');
    const [height, setHeight] = useState('1080');
    const [ratio, setRatio] = useState('16:9');

    const handleWidthChange = (w: string) => {
        setWidth(w);
        const [rw, rh] = ratio.split(':').map(Number);
        if (w && !isNaN(Number(w)) && rw > 0) {
            setHeight(Math.round(Number(w) * (rh / rw)).toString());
        }
    }
    
    const handleHeightChange = (h: string) => {
        setHeight(h);
        const [rw, rh] = ratio.split(':').map(Number);
        if (h && !isNaN(Number(h)) && rh > 0) {
            setWidth(Math.round(Number(h) * (rw / rh)).toString());
        }
    }

    const setPreset = (quality: '720p' | '1080p' | '1440p' | '2160p') => {
        const [rw, rh] = ratio.split(':').map(Number);
        const qualityMap = { '720p': 720, '1080p': 1080, '1440p': 1440, '2160p': 2160 };
        const base = qualityMap[quality];
        
        if (rw > rh) { // Landscape
            setHeight(base.toString());
            setWidth(Math.round(base * (rw / rh)).toString());
        } else { // Portrait or Square
            setWidth(base.toString());
            setHeight(Math.round(base * (rh / rw)).toString());
        }
    };
    
    useEffect(() => {
        handleWidthChange(width);
    }, [ratio]);


    return (
        <div className="space-y-3">
            <div className="flex gap-2 justify-center">
                {['16:9', '9:16', '4:3', '1:1'].map(r => (
                    <button key={r} onClick={() => setRatio(r)} className={`px-3 py-1 text-xs font-semibold rounded-full ${ratio === r ? 'bg-accent text-accent-foreground' : 'bg-subtle-bg'}`}>{r}</button>
                ))}
            </div>
            <div className="flex items-center gap-2">
                <input type="number" value={width} onChange={e => handleWidthChange(e.target.value)} placeholder="Width" className="w-full p-2 text-center bg-input rounded-md" />
                <span className="text-muted">x</span>
                <input type="number" value={height} onChange={e => handleHeightChange(e.target.value)} placeholder="Height" className="w-full p-2 text-center bg-input rounded-md" />
            </div>
            <div className="flex gap-2 justify-center">
                {(['720p', '1080p', '1440p', '2160p'] as const).map(q => (
                     <button key={q} onClick={() => setPreset(q)} className="px-3 py-1 text-xs font-semibold rounded-full bg-subtle-bg hover:bg-hover-bg">{q}</button>
                ))}
            </div>
        </div>
    );
}

export const Tools: React.FC<{ onBack: () => void; themeSettings: ThemeSettings; }> = ({ onBack, themeSettings }) => {
    return (
        <div className="container mx-auto p-4 md:p-6 lg:p-8">
            <button onClick={onBack} className="mb-6 flex items-center text-sm font-medium text-accent-text hover:underline">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                Back to Dashboard
            </button>
            <h2 className="text-2xl font-extrabold text-foreground mb-6">Creator Tools</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <ToolCard title="Teleprompter" description="Deliver lines flawlessly. Use the pop-out feature for recording with your camera app.">
                    <Teleprompter themeSettings={themeSettings} />
                </ToolCard>
                <ToolCard title="AI Prompt Generator" description="Stuck on an idea? Generate creative video prompts based on a topic.">
                    <PromptGenerator />
                </ToolCard>
                <ToolCard title="AI Title Generator" description="Get catchy and SEO-friendly video title ideas based on your script or idea.">
                    <AiTitleGenerator />
                </ToolCard>
                 <ToolCard title="AI Hashtag Generator" description="Generate relevant hashtags to improve your video's discoverability.">
                    <HashtagGenerator />
                </ToolCard>
                <ToolCard title="Color Palette" description="Generate beautiful color palettes for your branding, thumbnails, or edits.">
                    <ColorPaletteGenerator />
                </ToolCard>
                <ToolCard title="Countdown Timer" description="Set a timer for takes, breaks, or timed challenges.">
                    <CountdownTimer />
                </ToolCard>
                 <ToolCard title="Stopwatch" description="Keep track of recording times or how long a segment takes.">
                    <Stopwatch />
                </ToolCard>
                 <ToolCard title="Aspect Ratio Calculator" description="Quickly calculate resolutions for common video aspect ratios with quality presets.">
                    <AspectRatioCalculator />
                </ToolCard>
                <ToolCard title="QR Code Scanner" description="Quickly scan QR codes to import links, assets, or information.">
                    <button className="w-full bg-subtle-bg text-sm font-semibold py-2 rounded-md" onClick={() => alert('Camera would open here to scan a QR code.')}>Open Scanner</button>
                </ToolCard>
            </div>
        </div>
    );
};