import React, { useRef, useState, useEffect } from 'react';

interface PhotoStudioProps {
    onCapture: (imageUri: string) => void;
    onClose: () => void;
}

const PhotoStudio: React.FC<PhotoStudioProps> = ({ onCapture, onClose }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isCaptured, setIsCaptured] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    useEffect(() => {
        let activeStream: MediaStream | null = null;

        const startCamera = async () => {
            try {
                const mediaStream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        facingMode: 'user',
                        width: { ideal: 1280 },
                        height: { ideal: 720 }
                    },
                    audio: false
                });
                activeStream = mediaStream;
                setStream(mediaStream);
                if (videoRef.current) {
                    videoRef.current.srcObject = mediaStream;
                }
            } catch (err) {
                console.error("Error accessing camera:", err);
                setError("No pudimos acceder a tu cámara. Por favor, verifica los permisos.");
            }
        };

        startCamera();

        return () => {
            console.log("Cleaning up camera tracks...");
            if (activeStream) {
                activeStream.getTracks().forEach(track => {
                    track.stop();
                    console.log(`Track ${track.label} stopped`);
                });
            }
        };
    }, []);

    // Helper to stop camera manually if needed
    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    };


    const capturePhoto = () => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Official Biometric Ratio: 35mm wide x 45mm high (7:9 aspect ratio)
        // We want to crop the center of the video to this ratio
        const vWidth = video.videoWidth;
        const vHeight = video.videoHeight;
        
        // Target ratio 35:45 -> 7:9
        let cropWidth, cropHeight;
        if (vWidth / vHeight > 7/9) {
            // Video is wider than target ratio
            cropHeight = vHeight;
            cropWidth = vHeight * (7/9);
        } else {
            // Video is taller than target ratio
            cropWidth = vWidth;
            cropHeight = vWidth * (9/7);
        }

        const startX = (vWidth - cropWidth) / 2;
        const startY = (vHeight - cropHeight) / 2;

        // Set canvas to a decent size but maintaining the 35:45 ratio
        canvas.width = 700;
        canvas.height = 900;

        ctx.drawImage(
            video,
            startX, startY, cropWidth, cropHeight, // Source
            0, 0, canvas.width, canvas.height       // Destination
        );

        const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
        setPreviewUrl(dataUrl);
        setIsCaptured(true);
    };

    const handleConfirm = () => {
        if (previewUrl) {
            stopCamera();
            onCapture(previewUrl);
        }
    };

    const handleClose = () => {
        stopCamera();
        onClose();
    };


    const handleRetry = () => {
        setIsCaptured(false);
        setPreviewUrl(null);
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col font-display">
            {/* Header */}
            <div className="p-4 flex justify-between items-center bg-slate-900 border-b border-white/10">
                <button onClick={handleClose} className="p-2 text-white">
                    <span className="material-icons">close</span>
                </button>

                <h2 className="text-white font-bold text-sm uppercase tracking-widest">Estudio Fotográfico Go-Check</h2>
                <div className="w-10"></div>
            </div>

            {/* Camera / Preview Area */}
            <div className="flex-1 relative overflow-hidden flex items-center justify-center bg-black">
                {!isCaptured ? (
                    <>
                        <video 
                            ref={videoRef} 
                            autoPlay 
                            playsInline 
                            className="absolute inset-0 w-full h-full object-cover mirror"
                        />
                        
                        {/* Overlay: Biometric Guide */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            {/* Face Oval */}
                            <div className="w-[280px] h-[360px] border-4 border-cyan-400/50 rounded-[50%] relative">
                                <div className="absolute top-[25%] left-0 right-0 border-t border-cyan-400/30"></div> {/* Eyes guide */}
                                <div className="absolute bottom-[20%] left-0 right-0 border-t border-cyan-400/30"></div> {/* Chin guide */}
                            </div>
                            
                            {/* Frame Guides */}
                            <div className="absolute inset-0 border-[40px] border-black/40"></div>
                            <div className="mt-8 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                                <p className="text-white text-xs font-bold text-center">Ubica tu rostro dentro del óvalo</p>
                            </div>
                        </div>

                        {error && (
                            <div className="absolute inset-0 flex items-center justify-center p-8 text-center bg-black/80">
                                <div className="bg-slate-900 p-6 rounded-2xl border border-red-500/50">
                                    <span className="material-icons text-red-500 text-4xl mb-2">videocam_off</span>
                                    <p className="text-white font-bold">{error}</p>
                                    <button onClick={handleClose} className="mt-4 px-6 py-2 bg-slate-800 text-white rounded-xl">Volver</button>
                                </div>
                            </div>
                        )}

                    </>
                ) : (
                    <div className="flex flex-col items-center gap-4">
                        <img src={previewUrl!} className="w-[315px] h-[405px] object-cover rounded shadow-2xl border-2 border-white" alt="Preview" />
                        <div className="bg-cyan-500/10 border border-cyan-500/20 px-4 py-2 rounded-xl">
                            <p className="text-cyan-400 text-[10px] font-bold uppercase tracking-widest text-center">Formato 35x45mm (ICAO Standard)</p>
                        </div>
                    </div>
                )}

            </div>

            {/* Bottom Controls */}
            <div className="p-8 bg-slate-900 border-t border-white/10 flex flex-col items-center gap-6">
                {!isCaptured ? (
                    <div className="w-full max-w-sm flex flex-col gap-4">
                        <div className="flex items-start gap-3 bg-white/5 p-4 rounded-xl border border-white/10">
                            <span className="material-icons text-cyan-400">info</span>
                            <div className="flex flex-col">
                                <p className="text-white text-[11px] font-bold">REQUISITO BIOMÉTRICO</p>
                                <p className="text-slate-400 text-[10px]">Usa un fondo blanco liso (pared), retira lentes y mantén una expresión neutra.</p>
                            </div>
                        </div>
                        <button 
                            onClick={capturePhoto}
                            className="w-20 h-20 rounded-full bg-white border-8 border-slate-700 flex items-center justify-center active:scale-95 transition-transform mx-auto"
                        >
                            <div className="w-14 h-14 rounded-full border-2 border-slate-300"></div>
                        </button>
                    </div>
                ) : (
                    <div className="w-full max-w-sm flex flex-col gap-4">
                        <h3 className="text-white font-bold text-center mb-2">¿La foto está clara?</h3>
                        <div className="flex gap-4">
                            <button 
                                onClick={handleRetry}
                                className="flex-1 py-4 bg-slate-800 text-white font-bold rounded-2xl border border-white/10 flex items-center justify-center gap-2"
                            >
                                <span className="material-icons">refresh</span> REINTENTAR
                            </button>
                            <button 
                                onClick={handleConfirm}
                                className="flex-1 py-4 bg-primary text-white font-bold rounded-2xl shadow-lg flex items-center justify-center gap-2"
                            >
                                <span className="material-icons">check</span> USAR ESTA
                            </button>
                        </div>
                    </div>
                )}
            </div>
            
            <canvas ref={canvasRef} className="hidden" />
            
            <style>{`
                .mirror { transform: scaleX(-1); }
            `}</style>
        </div>
    );
};

export default PhotoStudio;
