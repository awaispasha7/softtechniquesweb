'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import VideoUploader from '@/components/football/VideoUploader';
import ProcessingStatus from '@/components/football/ProcessingStatus';
import VideoPlayer from '@/components/football/VideoPlayer';
import ErrorDisplay from '@/components/football/ErrorDisplay';
import { useAuth } from "@/components/AuthProvider";

type AppState = 'upload' | 'processing' | 'result' | 'error';

export default function FootballAnalysisPage() {
    const router = useRouter();
    const { user, userData, loading: authLoading } = useAuth();
    const [appState, setAppState] = useState<AppState>('upload');
    const [jobId, setJobId] = useState<string | null>(null);
    const [resultUrl, setResultUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleUploadComplete = (newJobId: string) => {
        setJobId(newJobId);
        setAppState('processing');
        setError(null);
    };

    const handleError = (errorMessage: string) => {
        setError(errorMessage);
        setAppState('error');
    };

    const handleProcessingComplete = (url: string) => {
        console.log('[Football Analysis] Processing complete callback called with URL:', url);
        setResultUrl(url);
        setAppState('result');
    };

    const handleReset = () => {
        setAppState('upload');
        setJobId(null);
        setResultUrl(null);
        setError(null);
    };

    return (
        <div className="min-h-screen bg-[#050816] text-white flex flex-col relative overflow-hidden">
            <Navbar />
            
            {/* Enhanced Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#44559e]/20 via-[#050816] to-[#2a3360]/20 pointer-events-none"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)] pointer-events-none"></div>
            
            {/* Subtle Grid Pattern */}
            <div className="absolute inset-0 opacity-[0.03]">
                <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <pattern id="field" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                        <rect x="0" y="0" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="0.5" />
                    </pattern>
                    <rect x="0" y="0" width="100%" height="100%" fill="url(#field)" className="text-blue-400" />
                </svg>
            </div>

            {/* Content */}
            <main className="flex-1 pt-28 pb-16 relative z-10">
                <div className="max-w-6xl mx-auto px-6 lg:px-8 space-y-10">
                    {/* Enhanced Header */}
                    <header className="space-y-6">
                        <div className="flex flex-col items-center text-center space-y-4">
                            {/* Enhanced Icon with Glow */}
                            <div className="relative">
                                <div className="absolute inset-0 bg-blue-600/30 blur-2xl rounded-full animate-pulse"></div>
                                <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 via-blue-500 to-purple-500 
                                    flex items-center justify-center shadow-2xl shadow-blue-500/50">
                                    <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
                                        <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.3"/>
                                    </svg>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold">
                                    <span className="bg-gradient-to-r from-blue-300 via-purple-300 to-blue-300 bg-clip-text text-transparent">
                                        Football Analysis
                                    </span>
                                    <span className="block text-2xl md:text-3xl lg:text-4xl mt-2 text-blue-400/80 font-semibold">
                                        AI-Powered Player & Ball Tracking
                                    </span>
                                </h1>
                                <p className="text-lg md:text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
                                    Upload a football match video and our advanced AI will automatically detect and track
                                    players and the ball in real-time using cutting-edge YOLO technology. Get professional-grade
                                    analysis in minutes.
                                </p>
                            </div>

                            {/* Enhanced Feature Tags */}
                            <div className="flex flex-wrap justify-center gap-3 mt-6">
                                {[
                                    { name: 'Player Detection', icon: '👥' },
                                    { name: 'Ball Tracking', icon: '⚽' },
                                    { name: 'Real-time Analysis', icon: '⚡' },
                                    { name: 'HD Output', icon: '🎬' }
                                ].map((feature) => (
                                    <span
                                        key={feature.name}
                                        className="px-4 py-2 text-sm bg-gradient-to-r from-blue-600/10 to-purple-600/10 
                                            border border-blue-400/30 rounded-full text-blue-300 font-medium
                                            hover:bg-blue-600/20 hover:border-blue-400/50 transition-all duration-300
                                            backdrop-blur-sm shadow-lg shadow-blue-500/10"
                                    >
                                        <span className="mr-2">{feature.icon}</span>
                                        {feature.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </header>

                    {/* Enhanced Authentication Status */}
                    {!authLoading && (
                        <div className="bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-blue-600/10 
                            border border-blue-400/30 rounded-2xl p-4 sm:p-6 backdrop-blur-md
                            shadow-xl shadow-blue-500/10">
                            {user ? (
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                                    <div className="text-sm sm:text-base text-white/90">
                                        Signed in as <span className="font-semibold text-blue-300 break-words">{userData?.displayName || user.email}</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                                    <p className="text-sm sm:text-base text-white/90 font-medium">Sign in to analyze football videos</p>
                                    <Link
                                        href={`/auth/login?returnUrl=${encodeURIComponent('/football-analysis')}`}
                                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 
                                            text-white rounded-lg transition-all text-sm font-bold text-center
                                            shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105"
                                    >
                                        Sign In →
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Main Content Area */}
                    <section>
                        {user ? (
                            <>
                                {appState === 'upload' && (
                                    <VideoUploader
                                        onUploadComplete={handleUploadComplete}
                                        onError={handleError}
                                        isProcessing={false}
                                        userId={user.uid}
                                    />
                                )}

                                {appState === 'processing' && jobId && (
                                    <ProcessingStatus
                                        jobId={jobId}
                                        onComplete={handleProcessingComplete}
                                        onError={handleError}
                                    />
                                )}

                                {appState === 'result' && resultUrl && (
                                    <VideoPlayer
                                        resultUrl={resultUrl}
                                        onReset={handleReset}
                                    />
                                )}

                                {appState === 'error' && error && (
                                    <ErrorDisplay
                                        error={error}
                                        onDismiss={handleReset}
                                    />
                                )}
                            </>
                        ) : null}
                    </section>

                    {/* Enhanced "How It Works" Section */}
                    <footer className="mt-20">
                        <div className="bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-blue-600/10 
                            border border-blue-400/30 rounded-2xl p-8 sm:p-10 max-w-4xl mx-auto backdrop-blur-md
                            shadow-xl shadow-blue-500/10">
                            <div className="text-center mb-8">
                                <h3 className="text-2xl md:text-3xl font-bold mb-2">
                                    <span className="bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
                                        How It Works
                                    </span>
                                </h3>
                                <p className="text-white/70 text-sm md:text-base">Simple steps to get professional football analysis</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {[
                                    { 
                                        step: '1', 
                                        title: 'Upload Video', 
                                        description: 'Upload your football match video (MP4, AVI, MOV, MKV, WebM)',
                                        icon: '📤'
                                    },
                                    { 
                                        step: '2', 
                                        title: 'AI Analysis', 
                                        description: 'Our YOLO AI analyzes each frame to detect players and track the ball',
                                        icon: '🤖'
                                    },
                                    { 
                                        step: '3', 
                                        title: 'Get Results', 
                                        description: 'Download your annotated video with player and ball tracking overlays',
                                        icon: '🎯'
                                    }
                                ].map((item) => (
                                    <div 
                                        key={item.step}
                                        className="p-6 rounded-xl bg-gradient-to-br from-black/40 to-black/20 
                                            border border-blue-400/20 hover:border-blue-400/40
                                            transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/20
                                            backdrop-blur-sm"
                                    >
                                        <div className="flex flex-col items-center text-center space-y-3">
                                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600/30 to-purple-600/30 
                                                border-2 border-blue-400/50 flex items-center justify-center
                                                shadow-lg shadow-blue-500/20">
                                                <span className="text-2xl">{item.icon}</span>
                                            </div>
                                            <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center">
                                                <span className="text-blue-400 font-bold text-sm">{item.step}</span>
                                            </div>
                                            <h4 className="text-lg font-bold text-blue-300">{item.title}</h4>
                                            <p className="text-sm text-white/70 leading-relaxed">{item.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mt-8 text-center">
                            <p className="text-sm md:text-base text-white/60">
                                <span className="text-blue-400 font-semibold">Powered by YOLO Object Detection</span>
                                {' • '}
                                <span>Max 5 min video</span>
                                {' • '}
                                <span>HD MP4 output</span>
                            </p>
                        </div>
                    </footer>
                </div>
            </main>
            
            <Footer />
        </div>
    );
}
