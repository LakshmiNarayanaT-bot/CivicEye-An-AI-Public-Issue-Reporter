import React, { useRef, useState, useEffect } from 'react';
import {
  UploadCloud,
  Camera,
  Trash2,
  RefreshCw,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Image as ImageIcon,
} from 'lucide-react';
import { SAMPLE_IMAGES, SampleImageOption } from '../utils/sampleImages.js';
import { validateImageFile } from '../utils/validation.js';

interface ReportIssueSectionProps {
  onAnalysisComplete: (analysisData: any, imageBase64: string, sampleInfo?: SampleImageOption) => void;
  initialSampleId?: string;
  isAnalyzing: boolean;
  setIsAnalyzing: (analyzing: boolean) => void;
}

export const ReportIssueSection: React.FC<ReportIssueSectionProps> = ({
  onAnalysisComplete,
  initialSampleId,
  isAnalyzing,
  setIsAnalyzing,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageMeta, setImageMeta] = useState<{ name: string; size: number; type: string } | null>(null);
  const [selectedSample, setSelectedSample] = useState<SampleImageOption | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Camera capture state
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Pre-load initial sample if specified
  useEffect(() => {
    if (initialSampleId) {
      const match = SAMPLE_IMAGES.find((s) => s.id === initialSampleId);
      if (match) {
        handleSelectSample(match);
      }
    }
  }, [initialSampleId]);

  // Clean up camera stream on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const startCamera = async () => {
    setErrorMessage(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setErrorMessage('Camera access is not supported by your browser environment. Please upload an image file.');
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsCameraActive(true);
      }
    } catch (err: any) {
      console.warn('Camera error:', err);
      setErrorMessage(
        'Could not access camera. Please check camera permissions or upload a photograph from your device.'
      );
      setIsCameraActive(false);
    }
  };

  const captureCameraPhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        setSelectedImage(dataUrl);
        setImageMeta({
          name: `Camera_Capture_${Date.now()}.jpg`,
          size: Math.round((dataUrl.length * 3) / 4),
          type: 'image/jpeg',
        });
        setSelectedSample(null);
        stopCamera();
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file.size, file.type);
    if (!validation.valid) {
      setErrorMessage(validation.error || 'Invalid file format or size.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setSelectedImage(result);
      setImageMeta({
        name: file.name,
        size: file.size,
        type: file.type,
      });
      setSelectedSample(null);
      stopCamera();
    };
    reader.readAsDataURL(file);
  };

  const handleSelectSample = (sample: SampleImageOption) => {
    setErrorMessage(null);
    stopCamera();
    setSelectedImage(sample.dataUrl);
    setImageMeta({
      name: `${sample.name}.png`,
      size: 45000,
      type: 'image/png',
    });
    setSelectedSample(sample);
  };

  const rasterizeImageIfSvg = async (src: string): Promise<{ dataUrl: string; mimeType: string }> => {
    if (!src.includes('svg')) {
      return { dataUrl: src, mimeType: imageMeta?.type || 'image/jpeg' };
    }
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || 600;
        canvas.height = img.naturalHeight || 400;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
          const pngUrl = canvas.toDataURL('image/jpeg', 0.92);
          resolve({ dataUrl: pngUrl, mimeType: 'image/jpeg' });
        } else {
          resolve({ dataUrl: src, mimeType: 'image/jpeg' });
        }
      };
      img.onerror = () => {
        resolve({ dataUrl: src, mimeType: 'image/jpeg' });
      };
      img.src = src;
    });
  };

  const handleAnalyze = async () => {
    if (!selectedImage) {
      setErrorMessage('Please capture or upload a photograph of the civic issue first.');
      return;
    }

    setErrorMessage(null);
    setIsAnalyzing(true);

    try {
      const { dataUrl, mimeType } = await rasterizeImageIfSvg(selectedImage);

      const payload = {
        imageBase64: dataUrl,
        mimeType: mimeType || 'image/jpeg',
      };

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with HTTP ${response.status}`);
      }

      const analysisResult = await response.json();
      onAnalysisComplete(analysisResult, dataUrl, selectedSample || undefined);
    } catch (err: any) {
      console.error('Analysis error:', err);
      setErrorMessage(
        err.message || 'Failed to complete Gemma 4 image analysis. Please try again or select another image.'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-6">
      {/* Title */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-semibold border border-teal-200">
          <Sparkles className="w-3.5 h-3.5 text-teal-600" />
          Step 1: Evidence Capture & Gemma 4 Analysis
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Document the Civic Hazard
        </h2>
        <p className="text-sm text-slate-600 max-w-xl mx-auto">
          Photograph road damage, overflowing waste, open manholes, or broken streetlights. Gemma 4 will
          inspect the evidence and classify the issue.
        </p>
      </div>

      {/* Preset Realistic Samples for 1-Click Testing */}
      <div className="bg-slate-100/80 rounded-2xl p-4 sm:p-5 border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-teal-500"></span>
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Quick Test Presets (Instant Demo)
            </span>
          </div>
          <span className="text-[11px] text-slate-500">Click any preset to test without taking a photo</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {SAMPLE_IMAGES.map((sample) => {
            const isChosen = selectedSample?.id === sample.id;
            return (
              <button
                key={sample.id}
                onClick={() => handleSelectSample(sample)}
                className={`flex flex-col items-center text-center p-2.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                  isChosen
                    ? 'bg-teal-600 text-white border-teal-700 shadow-sm scale-102'
                    : 'bg-white hover:bg-teal-50/60 text-slate-700 border-slate-200 hover:border-teal-300'
                }`}
              >
                <span className="font-semibold text-[11px] truncate w-full">{sample.name}</span>
                <span className={`text-[10px] mt-0.5 ${isChosen ? 'text-teal-100' : 'text-slate-400'}`}>
                  {sample.category.replace('_', ' ')}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Image Upload / Camera Area */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        {errorMessage && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold">Analysis Notice</p>
              <p className="text-xs">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Live Camera View if Active */}
        {isCameraActive ? (
          <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 aspect-video flex items-center justify-center">
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
            <canvas ref={canvasRef} className="hidden" />
            <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-4">
              <button
                onClick={captureCameraPhoto}
                className="px-6 py-3 rounded-full bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm shadow-lg flex items-center gap-2 cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                Capture Photo
              </button>
              <button
                onClick={stopCamera}
                className="px-4 py-3 rounded-full bg-slate-800/80 hover:bg-slate-700 text-white text-sm font-medium backdrop-blur-md cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : selectedImage ? (
          /* Preview Selected Image */
          <div className="space-y-4">
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900/5 aspect-video max-h-[380px] flex items-center justify-center">
              <img
                src={selectedImage}
                alt="Civic Issue Preview"
                className="w-full h-full object-contain"
              />
              {selectedSample && (
                <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-slate-950/80 text-teal-300 text-xs font-semibold backdrop-blur-md border border-teal-500/30 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                  Preset: {selectedSample.name}
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2 truncate">
                <ImageIcon className="w-4 h-4 text-teal-600 shrink-0" />
                <span className="font-semibold text-slate-900 truncate">
                  {imageMeta?.name || 'Evidence Image'}
                </span>
                <span className="text-slate-400">
                  ({(imageMeta?.size ? imageMeta.size / 1024 : 0).toFixed(1)} KB)
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-teal-700 hover:text-teal-800 font-medium flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Replace
                </button>
                <button
                  onClick={() => {
                    setSelectedImage(null);
                    setImageMeta(null);
                    setSelectedSample(null);
                  }}
                  className="text-red-600 hover:text-red-700 font-medium flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Remove
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Dropzone / Upload Action */
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 hover:border-teal-500 rounded-3xl p-8 sm:p-12 text-center bg-slate-50/50 hover:bg-teal-50/20 transition-all cursor-pointer space-y-4"
          >
            <div className="w-16 h-16 mx-auto rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center">
              <UploadCloud className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <p className="font-bold text-slate-800 text-base">
                Click to browse or drag & drop photograph
              </p>
              <p className="text-xs text-slate-500">Supports JPEG, PNG, and WebP (up to 10MB)</p>
            </div>
            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  startCamera();
                }}
                className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:border-teal-400 text-slate-700 text-xs font-semibold shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Camera className="w-4 h-4 text-teal-600" />
                Use Device Camera
              </button>
              <span className="text-xs text-slate-400">or choose file</span>
            </div>
          </div>
        )}

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileUpload}
          className="hidden"
        />

        {/* Action Button: Analyze with Gemma 4 */}
        <div className="pt-2">
          <button
            onClick={handleAnalyze}
            disabled={!selectedImage || isAnalyzing}
            className={`w-full py-4 rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg transition-all ${
              !selectedImage || isAnalyzing
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                : 'bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white shadow-teal-500/25 active:scale-98 cursor-pointer'
            }`}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Gemma 4 is Analyzing Image Evidence...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Analyze with Gemma 4
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
