'use client';

import React from 'react';

interface ErrorDisplayProps {
    error: string;
    onDismiss: () => void;
}

export default function ErrorDisplay({ error, onDismiss }: ErrorDisplayProps) {
    return (
        <div className="w-full max-w-2xl mx-auto">
            <div className="p-6 bg-red-500/10 border border-red-500/30 rounded-2xl">
                <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>

                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-red-400 mb-1">
                            Processing Error
                        </h3>
                        <p className="text-gray-300">
                            {error}
                        </p>
                    </div>
                </div>

                <div className="mt-6 flex items-center space-x-3">
                    <button
                        onClick={onDismiss}
                        className="flex items-center space-x-2 px-4 py-2 rounded-lg 
                       bg-gray-700 hover:bg-gray-600 text-gray-200 
                       transition-all duration-300"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <span>Try Again</span>
                    </button>
                </div>

                <div className="mt-4 pt-4 border-t border-red-500/20">
                    <p className="text-sm text-gray-500">
                        Common issues:
                    </p>
                    <ul className="mt-2 text-sm text-gray-400 list-disc list-inside space-y-1">
                        <li>Video file is corrupted or in an unsupported format</li>
                        <li>Video exceeds the 5-minute duration limit</li>
                        <li>File size exceeds the 500MB limit</li>
                        <li>Server is temporarily unavailable</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
