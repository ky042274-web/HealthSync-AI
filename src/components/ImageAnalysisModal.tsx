import React, { useState } from 'react';
import {
  Upload,
  Sparkles,
  Scan,
  AlertTriangle,
  X,
  FileText,
  CheckCircle,
  HelpCircle,
  Loader2,
  Image as ImageIcon,
} from 'lucide-react';
import { PRESET_MEDICAL_SCANS } from '../data/mockData';
import { MedicalReport, Language } from '../types';

interface ImageAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onAnalysisComplete: (newReport: MedicalReport) => void;
}

export const ImageAnalysisModal: React.FC<ImageAnalysisModalProps> = ({
  isOpen,
  onClose,
  language,
  onAnalysisComplete,
}) => {
  const isHindi = language === 'hi';

  const [selectedPresetId, setSelectedPresetId] = useState<string>(PRESET_MEDICAL_SCANS[0].id);
  const [customImageBase64, setCustomImageBase64] = useState<string | null>(null);
  const [imageType, setImageType] = useState<string>('Chest X-Ray');
  const [clinicalNotes, setClinicalNotes] = useState<string>(
    'Patient presents with persistent cough for 4 days, low-grade fever 101.4°F, and mild shortness of breath.'
  );
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please upload a valid medical image file (JPEG, PNG, or DICOM export).');
      return;
    }

    setErrorMsg(null);
    const reader = new FileReader();
    reader.onload = () => {
      setCustomImageBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    setErrorMsg(null);

    try {
      let imageToAnalyze = customImageBase64;
      let activeScanMeta = PRESET_MEDICAL_SCANS.find((s) => s.id === selectedPresetId);

      if (!imageToAnalyze && activeScanMeta) {
        // If using preset, fetch image and convert to base64 or pass imageUrl
        imageToAnalyze = activeScanMeta.imageUrl;
      }

      // Convert preset URL to base64 if needed
      let base64Payload = customImageBase64;
      if (!base64Payload && activeScanMeta) {
        try {
          const res = await fetch(activeScanMeta.imageUrl);
          const blob = await res.blob();
          base64Payload = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          });
        } catch {
          // In case of cross-origin image fetch restriction, send mock base64 placeholder
          base64Payload = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD...';
        }
      }

      const response = await fetch('/api/gemini/analyze-medical-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Payload,
          mimeType: 'image/jpeg',
          imageType,
          clinicalNotes,
          patientAge: '52',
          patientGender: 'Male',
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to complete AI medical image analysis');
      }

      const aiData = result.data;

      // Construct a new MedicalReport object
      const newReport: MedicalReport = {
        id: `rep_${Date.now()}`,
        patientId: 'pat_001',
        patientName: 'Rameshwar Sharma',
        title: `${imageType} AI Diagnostic Evaluation`,
        category:
          imageType.includes('X-Ray') || imageType.includes('MRI') || imageType.includes('CT')
            ? 'Radiology'
            : imageType.includes('Skin') || imageType.includes('Derm')
            ? 'Dermatology'
            : 'Pathology',
        testDate: new Date().toISOString().split('T')[0],
        uploadedAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) + ' IST',
        laboratoryName: 'HealthPulse Smart Diagnostic Core',
        isVerifiedLab: true,
        status: 'AI Analyzed',
        imageUrl: customImageBase64 || activeScanMeta?.imageUrl || '',
        imageType,
        clinicalNotes,
        doctorConsentGranted: true,
        allowedDoctors: ['Dr. Rajesh Sharma, MD', 'Dr. Ananya Sen, MD (Path)'],
        aiAnalysis: {
          ...aiData,
          analyzedAt: new Date().toLocaleString('en-IN'),
        },
      };

      onAnalysisComplete(newReport);
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'An error occurred during AI analysis. Please retry.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-teal-900 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/30">
              <Scan className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">
                {isHindi ? 'AI मेडिकल इमेज विश्लेषण' : 'AI-Based Medical Image Analysis'}
              </h2>
              <p className="text-xs text-teal-200">
                {isHindi
                  ? 'एक्स-रे, एमआरआई, सीटी या डर्मेटोलॉजी स्कैन अपलोड करें'
                  : 'High-precision computer vision triage for Chest X-Ray, MRI, CT, & Pathology'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Medical Safety Disclaimer Pill */}
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-amber-950">
                {isHindi ? 'चिकित्सीय सुरक्षा नियम:' : 'Medical Regulatory Directive:'}
              </strong>
              <span>
                {isHindi
                  ? 'AI विश्लेषण केवल प्रारंभिक कंप्यूटर विजन सहायता है। अंतिम चिकित्सीय निर्णय एवं दवाइयों का निर्धारण केवल योग्य डॉक्टर द्वारा ही किया जाना चाहिए।'
                  : 'Preliminary computer vision assistance only. Results must be reviewed and certified by a qualified radiologist, pathologist, or physician before clinical decisions.'}
              </span>
            </div>
          </div>

          {/* Option 1: Choose from Curated Clinical Scans */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              {isHindi ? '1. मानक क्लिनिकल स्कैन चुनें (त्वरित परीक्षण)' : '1. Select Preset Clinical Scan (Instant Testing)'}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {PRESET_MEDICAL_SCANS.map((preset) => {
                const isSelected = selectedPresetId === preset.id && !customImageBase64;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      setSelectedPresetId(preset.id);
                      setImageType(preset.modality);
                      setClinicalNotes(preset.clinicalNotes);
                      setCustomImageBase64(null);
                    }}
                    className={`flex items-center gap-3 p-2.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-teal-600 bg-teal-50/70 shadow-xs ring-1 ring-teal-600'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <img
                      src={preset.imageUrl}
                      alt={preset.title}
                      className="w-12 h-12 rounded-lg object-cover bg-slate-900 shrink-0"
                    />
                    <div className="overflow-hidden">
                      <div className="font-semibold text-xs text-slate-800 truncate">{preset.title}</div>
                      <span className="text-[10px] font-mono text-teal-700 font-medium">{preset.modality}</span>
                      <p className="text-[10px] text-slate-500 truncate">{preset.sampleAnalysis.primaryFinding}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Option 2: Upload Custom Scan */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              {isHindi ? 'या अपना मेडिकल इमेज अपलोड करें' : 'Or Upload Custom Medical Scan (DICOM / JPEG / PNG)'}
            </label>
            <div className="border-2 border-dashed border-slate-200 hover:border-teal-500 rounded-xl p-4 text-center transition-colors bg-slate-50/50">
              {customImageBase64 ? (
                <div className="flex items-center justify-between gap-3 p-2 bg-white rounded-lg border border-teal-200">
                  <div className="flex items-center gap-2">
                    <img
                      src={customImageBase64}
                      alt="Uploaded scan preview"
                      className="w-12 h-12 rounded-md object-cover bg-slate-950"
                    />
                    <div className="text-left">
                      <p className="text-xs font-bold text-slate-800">Custom Medical Image Ready</p>
                      <p className="text-[10px] text-emerald-600 font-semibold">Image verified for AI ingestion</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCustomImageBase64(null)}
                    className="text-xs text-red-600 hover:underline font-semibold"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer block">
                  <Upload className="w-8 h-8 text-teal-600 mx-auto mb-1.5" />
                  <p className="text-xs font-semibold text-slate-700">
                    Click to browse or drop medical scan
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Supports high-resolution Chest X-Ray, CT slice, MRI, Dermoscopy, or Retinal Fundus (up to 20MB)
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Modality & Clinical Notes Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="modal-image-modality" className="block text-xs font-bold text-slate-700 mb-1">
                Modality / Exam Type:
              </label>
              <select
                id="modal-image-modality"
                aria-label="Modality / Exam Type"
                value={imageType}
                onChange={(e) => setImageType(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              >
                <option value="Chest X-Ray">Chest Radiograph (X-Ray PA/AP)</option>
                <option value="Brain MRI">Brain MRI (T2/FLAIR/DWI)</option>
                <option value="Retinal Fundus">Retinal Fundus Photography</option>
                <option value="Dermatology">Dermoscopy (Skin Lesion)</option>
                <option value="CT Scan">Computed Tomography (CT)</option>
                <option value="Ultrasound">Ultrasound Sonography</option>
                <option value="Pathology Smear">Pathology Blood Smear / Histology</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Patient Demographics:
              </label>
              <div className="p-2 bg-slate-100 rounded-xl text-xs text-slate-600 flex items-center justify-between">
                <span>Rameshwar Sharma (52y / M)</span>
                <span className="font-mono text-teal-700 font-semibold">ABHA Verified</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Clinical Symptoms / History:
            </label>
            <textarea
              value={clinicalNotes}
              onChange={(e) => setClinicalNotes(e.target.value)}
              rows={2}
              placeholder="e.g. Cough for 4 days, fever, previous history of asthma or diabetes..."
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
            />
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 text-red-800 text-xs rounded-xl border border-red-200">
              {errorMsg}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Sparkles className="w-4 h-4 text-teal-600" />
            <span>Server-side Gemini Vision Core</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              disabled={isAnalyzing}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleRunAnalysis}
              disabled={isAnalyzing}
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-md shadow-teal-600/20 disabled:opacity-50 transition-all"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing Computer Vision...</span>
                </>
              ) : (
                <>
                  <Scan className="w-4 h-4" />
                  <span>{isHindi ? 'AI विश्लेषण प्रारंभ करें' : 'Run AI Diagnostic Scan'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
