'use client';

import React, { useEffect, useState } from 'react';
import { FOOTBALL_API_URL, API_ENDPOINTS } from '@/config/api';

interface ProcessingStatusProps {
    jobId: string;
    onComplete: (resultUrl: string) => void;
    onError: (error: string) => void;
}

interface JobStatus {
    job_id: string;
    status: 'queued' | 'processing' | 'done' | 'failed';
    progress: number;
    error: string | null;
    result_url: string | null;
}

export default function ProcessingStatus({
    jobId,
    onComplete,
    onError
}: ProcessingStatusProps) {
    const [status, setStatus] = useState<JobStatus | null>(null);
    const errorCountRef = React.useRef(0);

    useEffect(() => {
        let intervalId: NodeJS.Timeout;
        let isMounted = true;

        const pollStatus = async () => {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => {
                    console.log(`[Frontend] Poll timeout for job ${jobId}`);
                    controller.abort();
                }, 8000);
                
                console.log(`[Frontend] Polling job status for: ${jobId}`);
                
                const response = await fetch(API_ENDPOINTS.FOOTBALL_JOB_STATUS(jobId), {
                    signal: controller.signal,
                    cache: 'no-store',
                    headers: {
                        'Cache-Control': 'no-cache',
                    },
                });
                
                clearTimeout(timeoutId);
                
                if (!response.ok) {
                    if (response.status === 404 && errorCountRef.current < 10) {
                        errorCountRef.current += 1;
                        console.log(`Job ${jobId} not found yet, retrying... (${errorCountRef.current}/10)`);
                        return;
                    }
                    
                    if (response.status === 503) {
                        throw new Error(`Backend server is not running. Please start the backend server on ${FOOTBALL_API_URL}`);
                    }
                    
                    if (response.status === 504 && errorCountRef.current < 20) {
                        errorCountRef.current += 1;
                        console.log(`Gateway timeout for job ${jobId}, retrying... (${errorCountRef.current}/20)`);
                        return;
                    }
                    
                    let errorMessage = `Failed to fetch job status: ${response.status}`;
                    try {
                        const errorData = await response.json();
                        errorMessage = errorData.detail || errorData.error || errorMessage;
                    } catch {
                        errorMessage = response.statusText || errorMessage;
                    }
                    
                    if (errorCountRef.current >= 20) {
                        throw new Error(errorMessage);
                    }
                    return;
                }

                const data: JobStatus = await response.json();
                
                console.log(`[Frontend] Received job status for ${jobId}:`, data);
                
                if (!isMounted) return;
                
                setStatus(data);
                errorCountRef.current = 0;

                // IMPORTANT FIX: Always call onComplete when status is 'done', even if result_url is missing
                // Generate the URL ourselves if it's not provided by the backend
                if (data.status === 'done') {
                    clearInterval(intervalId);
                    
                    // Generate the full video URL - use result_url if available, otherwise construct it
                    let fullResultUrl: string;
                    if (data.result_url) {
                        fullResultUrl = data.result_url;
                        // If it's a relative URL, make it absolute
                        if (fullResultUrl.startsWith('/')) {
                            fullResultUrl = `${FOOTBALL_API_URL}${fullResultUrl}`;
                        }
                        console.log(`[Frontend] Using backend result_url: ${fullResultUrl}`);
                    } else {
                        // Generate URL ourselves using jobId (fallback if backend doesn't provide it)
                        console.warn(`[Frontend] result_url is missing for done job ${jobId}, generating URL ourselves`);
                        fullResultUrl = API_ENDPOINTS.FOOTBALL_RESULT(jobId);
                        console.log(`[Frontend] Generated result_url: ${fullResultUrl}`);
                    }
                    
                    console.log(`[Frontend] Processing complete! Video URL: ${fullResultUrl}`);
                    onComplete(fullResultUrl);
                } else if (data.status === 'failed') {
                    clearInterval(intervalId);
                    onError(data.error || 'Processing failed');
                }
            } catch (error: unknown) {
                const err = error instanceof Error ? error : new Error('Unknown error');
                if (err.name === 'AbortError') {
                    console.log(`[Frontend] Request aborted for job ${jobId}, will retry...`);
                    return;
                }
                
                console.error(`[Frontend] Status poll error for job ${jobId}:`, err);
                errorCountRef.current += 1;
                
                if (errorCountRef.current > 50) {
                    console.error(`[Frontend] Too many errors (${errorCountRef.current}) for job ${jobId}, giving up`);
                    clearInterval(intervalId);
                    if (isMounted) {
                        onError(`Lost connection to server. The backend may be slow or unavailable. Please check if the backend is running at ${FOOTBALL_API_URL} and try refreshing the page.`);
                    }
                }
            }
        };

        setTimeout(() => {
            pollStatus();
        }, 500);

        intervalId = setInterval(pollStatus, 2000);

        return () => {
            isMounted = false;
            clearInterval(intervalId);
        };
    }, [jobId, onComplete, onError]);

    const getStatusText = () => {
        if (!status) return 'Connecting to server...';

        switch (status.status) {
            case 'queued':
                return 'Queued for processing...';
            case 'processing':
                if (status.progress < 5) return 'Initializing...';
                if (status.progress < 10) return 'Loading YOLO model...';
                if (status.progress < 90) return `Detecting players & ball... (${status.progress}%)`;
                return 'Encoding video...';
            case 'done':
                return 'Complete!';
            case 'failed':
                return 'Failed';
            default:
                return 'Processing...';
        }
    };

    const progress = status?.progress || 0;

    return (
        <div className="w-full max-w-2xl mx-auto">
            <div className="glass rounded-2xl p-8">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-gray-200">
                        Processing Video
                    </h3>
                    <span className="text-white font-bold text-2xl">
                        {progress}%
                    </span>
                </div>

                <div className="relative h-4 bg-gray-700 rounded-full overflow-hidden mb-4">
                    <div
                        className="absolute inset-0 bg-white 
                       transition-all duration-500 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                    <div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent
                       animate-pulse"
                        style={{
                            width: `${progress}%`,
                            animation: progress < 100 ? 'shimmer 2s infinite' : 'none'
                        }}
                    />
                </div>

                <div className="flex items-center space-x-3">
                    {status?.status !== 'done' && status?.status !== 'failed' && (
                        <div className="relative w-6 h-6">
                            <div className="absolute inset-0 border-2 border-white/30 rounded-full" />
                            <div className="absolute inset-0 border-2 border-transparent border-t-white rounded-full animate-spin" />
                        </div>
                    )}

                    {status?.status === 'done' && (
                        <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                    )}

                    <span className="text-gray-300">
                        {getStatusText()}
                    </span>
                </div>

                <div className="mt-8 grid grid-cols-4 gap-2">
                    {[
                        { label: 'Upload', threshold: 0 },
                        { label: 'Analyze', threshold: 10 },
                        { label: 'Detect', threshold: 50 },
                        { label: 'Encode', threshold: 90 },
                    ].map((stage) => (
                        <div key={stage.label} className="text-center">
                            <div
                                className={`
                  w-full h-1 rounded-full mb-2 transition-colors duration-500
                  ${progress >= stage.threshold ? 'bg-white' : 'bg-gray-700'}
                `}
                            />
                            <span className={`
                text-xs transition-colors duration-300
                ${progress >= stage.threshold ? 'text-white' : 'text-gray-500'}
              `}>
                                {stage.label}
                            </span>
                        </div>
                    ))}
                </div>

                <div className="mt-6 pt-4 border-t border-gray-700">
                    <p className="text-xs text-gray-500">
                        Job ID: <span className="font-mono text-gray-400">{jobId}</span>
                    </p>
                </div>
            </div>
        </div>
    );
}
