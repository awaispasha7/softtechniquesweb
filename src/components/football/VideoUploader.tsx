'use client';

import React, { useCallback, useState, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { API_ENDPOINTS } from '@/config/api';

interface VideoUploaderProps {
    onUploadComplete: (jobId: string) => void;
    onError: (error: string) => void;
    isProcessing: boolean;
    userId: string | null;
}

const ALLOWED_TYPES = ['.mp4', '.avi', '.mov', '.mkv', '.webm'];
const MAX_SIZE_MB = 500;

export default function VideoUploader({
    onUploadComplete,
    onError,
    isProcessing,
    userId
}: VideoUploaderProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);

    const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
        if (rejectedFiles.length > 0) {
            const rejection = rejectedFiles[0];
            if (rejection.errors[0]?.code === 'file-too-large') {
                onError(`File too large. Maximum size: ${MAX_SIZE_MB}MB`);
            } else if (rejection.errors[0]?.code === 'file-invalid-type') {
                onError(`Invalid file type. Allowed: ${ALLOWED_TYPES.join(', ')}`);
            } else {
                onError('Invalid file selected');
            }
            return;
        }

        if (acceptedFiles.length > 0) {
            setSelectedFile(acceptedFiles[0]);
        }
    }, [onError]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'video/*': ALLOWED_TYPES,
        },
        maxSize: MAX_SIZE_MB * 1024 * 1024,
        multiple: false,
        disabled: isUploading || isProcessing,
    });

    const handleFileUpload = async () => {
        if (!selectedFile) return;

        // Check authentication
        if (!userId) {
            onError('Please sign in to upload videos');
            return;
        }

        setIsUploading(true);
        setUploadProgress(0);

        try {
            // No credit checks - unlimited uploads for all users

            // Upload directly to Python backend
            // This avoids Next.js HTTP/2 protocol errors with large files
            // Use Railway backend in production, localhost in development
            const getBackendUrl = () => {
                if (typeof window !== 'undefined') {
                    const hostname = window.location.hostname;
                    // Local development - use localhost:8000
                    if (hostname === 'localhost' || hostname === '127.0.0.1') {
                        return 'http://localhost:8000';
                    }
                    // Production deployment on softtechniques.com - use Railway backend
                    if (hostname === 'softtechniques.com' || hostname.includes('softtechniques')) {
                        return 'https://web-production-608ab4.up.railway.app';
                    }
                }
                // Fallback: use env var, Railway URL, or default
                return process.env.NEXT_PUBLIC_FOOTBALL_API_URL || 'https://web-production-608ab4.up.railway.app';
            };
            
            const backendUrl = getBackendUrl();
            const uploadUrl = `${backendUrl}/api/videos/upload`;
            
            console.log('[VideoUploader] Uploading to:', uploadUrl);

            const formData = new FormData();
            formData.append('file', selectedFile);

            const xhr = new XMLHttpRequest();

            xhr.upload.addEventListener('progress', (event) => {
                if (event.lengthComputable) {
                    const progress = Math.round((event.loaded / event.total) * 100);
                    setUploadProgress(progress);
                }
            });

            const response = await new Promise<any>((resolve, reject) => {
                xhr.onload = () => {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        try {
                            const responseText = xhr.responseText.trim();
                            if (!responseText) {
                                reject(new Error('Empty response from server'));
                                return;
                            }
                            const parsed = JSON.parse(responseText);
                            if (!parsed.job_id) {
                                reject(new Error('Invalid response: missing job_id'));
                                return;
                            }
                            resolve(parsed);
                        } catch (parseError: any) {
                            console.error('Error parsing upload response:', parseError, 'Response:', xhr.responseText);
                            reject(new Error(`Failed to parse server response: ${parseError.message}`));
                        }
                    } else {
                        try {
                            const error = JSON.parse(xhr.responseText);
                            reject(new Error(error.detail || error.error || 'Upload failed'));
                        } catch {
                            reject(new Error(`Upload failed with status ${xhr.status}: ${xhr.statusText}`));
                        }
                    }
                };
                xhr.onerror = () => reject(new Error('Network error during upload'));
                xhr.ontimeout = () => reject(new Error('Upload timeout - the file may be too large'));
                xhr.timeout = 300000; // 5 minute timeout for large files
                xhr.open('POST', uploadUrl);
                xhr.send(formData);
            });

            onUploadComplete(response.job_id);
        } catch (error: any) {
            // Handle authentication errors
            const errorMessage = error.message || 'Upload failed';
            if (errorMessage.includes('401') || errorMessage.includes('Authentication')) {
                onError('Please sign in to upload videos');
            } else {
                onError(errorMessage);
            }
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

    const handleRemoveFile = () => {
        setSelectedFile(null);
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024 * 1024) {
            return `${(bytes / 1024).toFixed(1)} KB`;
        }
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    return (
        <div className="w-full max-w-2xl mx-auto">
            {/* Enhanced File Upload Dropzone */}
            <div
                {...getRootProps()}
                className={`
                    relative p-12 rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer
                    bg-white/5 backdrop-blur-sm
                    ${isDragActive
                        ? 'border-white/60 bg-white/20 scale-[1.02] shadow-2xl shadow-white/30'
                        : 'border-white/30 hover:border-white/50 hover:bg-white/10 hover:shadow-xl hover:shadow-white/20'
                    }
                    ${(isUploading || isProcessing) ? 'opacity-50 cursor-not-allowed' : ''}
                `}
            >
                <input {...getInputProps()} />

                <div className="flex flex-col items-center justify-center space-y-6">
                    <div className="relative">
                        {isDragActive && (
                            <div className="absolute inset-0 bg-white/20 blur-2xl rounded-full animate-pulse"></div>
                        )}
                        <div className={`
                            relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300
                            ${isDragActive 
                                ? 'bg-white/20 scale-110 shadow-2xl shadow-white/50 border-2 border-white/40' 
                                : 'bg-white/10 border-2 border-white/20'
                            }
                        `}>
                            <svg
                                className={`w-12 h-12 text-white`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                />
                            </svg>
                        </div>
                    </div>

                    <div className="text-center space-y-2">
                        <p className={`text-xl md:text-2xl font-bold mb-2 transition-colors ${
                            isDragActive 
                                ? 'text-white' 
                                : 'text-white'
                        }`}>
                            {isDragActive
                                ? 'Drop your video here...'
                                : 'Upload Football Match Video'
                            }
                        </p>
                        <p className="text-sm md:text-base text-white/70 mb-1">
                            Drag & drop your video file or click to browse
                        </p>
                        <p className="text-xs md:text-sm text-white/50 mt-3 px-4 py-2 rounded-lg bg-black/30 border border-white/20 inline-block">
                            📹 Supported: {ALLOWED_TYPES.join(', ')} • Max {MAX_SIZE_MB}MB • Max 5 minutes
                        </p>
                    </div>
                </div>
            </div>

            {/* Enhanced Selected File Preview */}
            {selectedFile && !isUploading && !isProcessing && (
                <div className="mt-6 p-6 rounded-2xl bg-white/10 
                    border border-white/20 backdrop-blur-md shadow-xl shadow-white/10">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 rounded-xl bg-white/10 
                                border border-white/20 flex items-center justify-center shadow-lg shadow-white/10">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                            </div>

                            <div>
                                <p className="text-white font-semibold truncate max-w-xs">
                                    {selectedFile.name}
                                </p>
                                <p className="text-sm text-white/80 font-medium">
                                    {formatFileSize(selectedFile.size)}
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={handleRemoveFile}
                            className="p-2 rounded-lg hover:bg-red-500/20 text-white/60 hover:text-red-400 transition-colors
                                border border-transparent hover:border-red-400/30"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <button
                        onClick={handleFileUpload}
                        disabled={isUploading || isProcessing}
                        className="w-full py-4 px-6 rounded-xl font-bold text-base
                            bg-white text-[#44559e] hover:bg-white/90 transform hover:scale-[1.02] active:scale-[0.98] 
                            shadow-xl shadow-white/40 hover:shadow-white/60 disabled:opacity-60 disabled:hover:scale-100
                            transition-all duration-300"
                    >
                        <span className="flex items-center justify-center space-x-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Analyze Video Now →</span>
                        </span>
                    </button>
                </div>
            )}

            {/* Enhanced Upload Progress */}
            {isUploading && (
                <div className="mt-6 p-6 rounded-2xl bg-white/10 
                    border border-white/20 backdrop-blur-md shadow-xl shadow-white/10">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-white font-semibold flex items-center gap-2">
                            <svg className="w-5 h-5 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Uploading video...
                        </span>
                        <span className="text-white font-bold text-lg">{uploadProgress}%</span>
                    </div>
                    <div className="w-full h-4 bg-black/40 rounded-full overflow-hidden border border-white/20">
                        <div
                            className="h-full bg-white transition-all duration-300 
                                shadow-lg shadow-white/50"
                            style={{ width: `${uploadProgress}%` }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
