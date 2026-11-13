import React, { useState, useRef } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sliders,
  Eye,
  EyeOff,
  Maximize2,
  Ruler,
  AlertTriangle,
  CheckCircle2,
  Info,
  Clock,
  UserCheck,
  Stethoscope,
  Share2,
  Download,
  Crosshair,
} from 'lucide-react';
import { MedicalReport, Language, UserRole } from '../types';

interface MedicalImageViewerProps {
  report: MedicalReport;
  language: Language;
  currentRole: UserRole;
  onVerifyReport?: (reportId: string, clinicalNotes: string) => void;
}

export const MedicalImageViewer: React.FC<MedicalImageViewerProps> = ({
  report,
  language,
  currentRole,
  onVerifyReport,
}) => {
  const isHindi = language === 'hi';
  const analysis = report.aiAnalysis;

  // Image manipulation states
  const [zoom, setZoom] = useState(1);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [invert, setInvert] = useState(false);
  const [showOverlays, setShowOverlays] = useState(true);
  const [isRulerActive, setIsRulerActive] = useState(false);
  const [measuredDistance, setMeasuredDistance] = useState<number | null>(null);

  // Clinician sign-off form state
  const [clinicianNote, setClinicianNote] = useState('');
  const [isSignoffModalOpen, setIsSignoffModalOpen] = useState(false);

  const imageRef = useRef<HTMLImageElement>(null);

  const resetControls = () => {
    setZoom(1);
    setBrightness(100);
    setContrast(100);
    setInvert(false);
    setMeasuredDistance(null);
  };

  const handleZoom = (delta: number) => {
    setZoom((prev) => Math.min(Math.max(0.6, prev + delta), 3.5));
  };

  const handleRulerClick = () => {
    setIsRulerActive(!isRulerActive);
    if (!isRulerActive) {
      // Simulate calibrated measurement
      setMeasuredDistance(34.8); // e.g. 34.8 mm lesion diameter or transverse thoracic index
    } else {
      setMeasuredDistance(null);
    }
  };

  if (!report.imageUrl && !analysis) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500">
        <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
        <p className="font-semibold text-slate-700">No medical image attached to this report.</p>
        <p className="text-xs text-slate-400 mt-1">Please select an imaging exam (X-Ray, MRI, CT, or Dermoscopy).</p>
      </div>
    );
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'moderate':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Top Header of the Diagnostic Viewer */}
      <div className="p-4 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 text-xs font-mono font-bold tracking-wider border border-teal-500/30">
              {report.imageType || 'Radiological DICOM'}
            </span>
            <h2 className="text-sm sm:text-base font-bold text-white">{report.title}</h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Patient: <span className="text-slate-200 font-semibold">{report.patientName}</span> • Exam Date: {report.testDate} • Facility: {report.laboratoryName}
          </p>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2">
          {report.status === 'Clinically Verified' ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              {isHindi ? 'डॉक्टर द्वारा सत्यापित' : 'Clinically Verified'}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              {isHindi ? 'सत्यापन लंबित (Preliminary AI)' : 'Preliminary AI (Pending Verification)'}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
        {/* Left Column: Image Canvas & Radiological Controls (7 Cols) */}
        <div className="lg:col-span-7 bg-slate-950 p-4 flex flex-col justify-between select-none relative min-h-[480px]">
          {/* Medical Toolbar */}
          <div className="bg-slate-900/90 backdrop-blur-md rounded-xl p-2 border border-slate-800 flex flex-wrap items-center justify-between gap-2 z-10 shadow-lg mb-3">
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleZoom(0.2)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleZoom(-0.2)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={resetControls}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                title="Reset View"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <div className="h-5 w-px bg-slate-800 mx-1" />
              <button
                onClick={() => setInvert(!invert)}
                className={`p-1.5 rounded-lg transition-colors text-xs font-mono font-medium flex items-center gap-1 ${
                  invert ? 'bg-teal-500 text-slate-950 font-bold' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                }`}
                title="Toggle Inverted Negative Mode"
              >
                INV
              </button>
              <button
                onClick={() => setShowOverlays(!showOverlays)}
                className={`p-1.5 rounded-lg transition-colors flex items-center gap-1 text-xs font-medium ${
                  showOverlays ? 'bg-teal-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
                title="Toggle AI Region of Interest Overlays"
              >
                {showOverlays ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">AI Overlay</span>
              </button>
              <button
                onClick={handleRulerClick}
                className={`p-1.5 rounded-lg transition-colors flex items-center gap-1 text-xs font-medium ${
                  isRulerActive ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
                title="Digital Caliper / Measurement Tool"
              >
                <Ruler className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Caliper</span>
              </button>
            </div>

            {/* Brightness & Contrast Popover Sliders */}
            <div className="flex items-center gap-3 text-xs text-slate-300">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-slate-400">B:</span>
                <input
                  type="range"
                  min="60"
                  max="150"
                  value={brightness}
                  onChange={(e) => setBrightness(Number(e.target.value))}
                  className="w-16 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-400"
                  title="Brightness"
                />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-slate-400">C:</span>
                <input
                  type="range"
                  min="60"
                  max="160"
                  value={contrast}
                  onChange={(e) => setContrast(Number(e.target.value))}
                  className="w-16 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-400"
                  title="Contrast"
                />
              </div>
            </div>
          </div>

          {/* Caliper Measurement Tag if active */}
          {measuredDistance && (
            <div className="absolute top-16 left-6 z-20 bg-cyan-950/90 text-cyan-200 border border-cyan-400 px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-2 shadow-lg backdrop-blur-xs">
              <Crosshair className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
              <span>Digital Caliper Distance: <strong>{measuredDistance} mm</strong></span>
            </div>
          )}

          {/* Interactive Medical Canvas */}
          <div className="flex-1 flex items-center justify-center overflow-hidden relative rounded-xl border border-slate-900 bg-black min-h-[360px]">
            <div
              className="relative transition-transform duration-200 ease-out origin-center"
              style={{
                transform: `scale(${zoom})`,
                filter: `brightness(${brightness}%) contrast(${contrast}%) ${invert ? 'invert(1)' : ''}`,
              }}
            >
              <img
                ref={imageRef}
                src={report.imageUrl}
                alt={report.title}
                className="max-h-[460px] max-w-full object-contain rounded-md select-none pointer-events-none"
              />

              {/* AI Bounding Boxes Overlays */}
              {showOverlays &&
                analysis?.regionsOfInterest?.map((roi, idx) => {
                  // Box coordinates [ymin, xmin, ymax, xmax] in 0-1000 scale
                  const [ymin, xmin, ymax, xmax] = roi.box;
                  const top = `${ymin / 10}%`;
                  const left = `${xmin / 10}%`;
                  const height = `${(ymax - ymin) / 10}%`;
                  const width = `${(xmax - xmin) / 10}%`;

                  return (
                    <div
                      key={idx}
                      style={{ top, left, width, height }}
                      className="absolute border-2 border-amber-400 bg-amber-400/15 rounded-md pointer-events-auto transition-all hover:bg-amber-400/30 group animate-pulse"
                    >
                      <div className="absolute -top-7 left-0 bg-slate-950/90 text-amber-300 font-mono text-[10px] px-2 py-0.5 rounded border border-amber-400/60 whitespace-nowrap shadow-md flex items-center gap-1">
                        <Crosshair className="w-2.5 h-2.5 text-amber-400" />
                        <span>{roi.label}</span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Footer of the Image Screen: Medical Grid Scale & Tech Quality */}
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <div>
              <span>Scale: 1.0mm/pixel</span> • <span>Zoom: {Math.round(zoom * 100)}%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-teal-400">Quality: {analysis?.technicalQuality || 'Diagnostic Grade'}</span>
              <span>• DICOM Grayscale 16-bit</span>
            </div>
          </div>
        </div>

        {/* Right Column: AI Preliminary Observations & Clinician Review (5 Cols) */}
        <div className="lg:col-span-5 p-5 bg-white flex flex-col justify-between space-y-4 max-h-[620px] overflow-y-auto">
          <div className="space-y-4">
            {/* Confidence & Severity Header */}
            <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold block">
                  {isHindi ? 'AI मॉडल विश्वास स्तर' : 'AI Confidence Score'}
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-slate-900 font-mono">
                    {analysis?.confidenceScore || 88}%
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    (Gemini Vision Core)
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold block">
                  {isHindi ? 'गंभीरता ग्रेड' : 'Triage Severity'}
                </span>
                <span
                  className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${getSeverityBadge(
                    analysis?.severity || 'moderate'
                  )}`}
                >
                  {analysis?.severity || 'Moderate'}
                </span>
              </div>
            </div>

            {/* Primary Finding */}
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {isHindi ? 'प्राथमिक अवलोकन' : 'Primary AI Observation'}
              </h3>
              <p className="text-base font-bold text-slate-900 mt-1 leading-snug">
                {analysis?.primaryFinding || 'Awaiting preliminary analysis'}
              </p>
              <p className="text-xs text-teal-700 font-medium mt-0.5">
                Target Zone: {analysis?.anatomicalRegion || 'Specified anatomical field'}
              </p>
            </div>

            {/* Preliminary Observations Paragraph */}
            <div className="p-3 bg-teal-50/50 rounded-xl border border-teal-100 text-xs text-slate-700 leading-relaxed">
              <p className="font-semibold text-teal-900 mb-1 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-teal-700" />
                {isHindi ? 'विस्तृत AI सारांश' : 'Preliminary Morphological Analysis'}
              </p>
              <p>{analysis?.preliminaryObservations}</p>
            </div>

            {/* Detailed Findings List */}
            {analysis?.findingsList && analysis.findingsList.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  {isHindi ? 'प्रमुख निष्कर्ष' : 'Key Structural Observations'}
                </h4>
                <ul className="space-y-1 text-xs text-slate-600">
                  {analysis.findingsList.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-teal-600 font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Stated Model Limitations (Mandatory Medical Safety) */}
            {analysis?.statedLimitations && (
              <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200 text-xs text-amber-950">
                <p className="font-bold text-amber-900 flex items-center gap-1.5 mb-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                  {isHindi ? 'मॉडल की ज्ञात सीमाएं' : 'Algorithm Stated Limitations'}
                </p>
                <ul className="list-disc list-inside space-y-0.5 text-amber-900/90 text-[11px]">
                  {analysis.statedLimitations.map((lim, idx) => (
                    <li key={idx}>{lim}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Clinician Digital Verification Section */}
            {analysis?.reviewedBy ? (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-emerald-700" />
                    Verified by Attending Clinician
                  </span>
                  <span className="text-[10px] text-emerald-700 font-mono">
                    {analysis.reviewedBy.reviewedAt}
                  </span>
                </div>
                <p className="font-semibold text-slate-800 mt-1">
                  {analysis.reviewedBy.doctorName}{' '}
                  <span className="text-slate-500 font-normal">
                    ({analysis.reviewedBy.regNumber})
                  </span>
                </p>
                <div className="mt-2 p-2 bg-white rounded border border-emerald-200 text-slate-700 italic">
                  "{analysis.reviewedBy.clinicalImpression}"
                </div>
              </div>
            ) : (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
                <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  Clinician Review Pending
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Assigned to Dr. Rajesh Sharma (Pulmonology) & Dr. Ananya Sen (Pathology).
                </p>
              </div>
            )}
          </div>

          {/* Clinician Sign-off Action Bar (Visible to Doctors/Pathologists) */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
            {(currentRole === 'doctor' || currentRole === 'pathologist') && !analysis?.reviewedBy && (
              <button
                onClick={() => setIsSignoffModalOpen(true)}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
              >
                <Stethoscope className="w-4 h-4" />
                <span>{isHindi ? 'समीक्षा व हस्ताक्षर दर्ज करें' : 'Sign-Off & Clinically Verify'}</span>
              </button>
            )}

            {currentRole === 'patient' && (
              <div className="w-full text-center text-[11px] text-slate-400 italic">
                Logged in as Patient. Digital sign-off is restricted to certified physicians & pathologists.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Clinician Review Sign-off Modal */}
      {isSignoffModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center gap-2 text-teal-800 font-bold text-base mb-1">
              <Stethoscope className="w-5 h-5 text-teal-600" />
              <h3>Clinician Verification & Clinical Impression</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Add your clinical sign-off, confirm or modify the AI triage observation, and digitally certify this report.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Clinical Impression / Final Assessment:
                </label>
                <textarea
                  value={clinicianNote}
                  onChange={(e) => setClinicianNote(e.target.value)}
                  placeholder="e.g. Concur with right lower lobe bacterial pneumonia. Air bronchogram noted. Prescribing oral amoxicillin-clavulanate. Repeat chest film in 3 weeks."
                  rows={4}
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs">
                <p className="font-bold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  Regulatory Digital Signature Note:
                </p>
                <p className="mt-0.5 text-[11px]">
                  By signing off, you affirm your registration with NMC/State Medical Council and take medical responsibility for the certified diagnosis.
                </p>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                onClick={() => setIsSignoffModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (onVerifyReport) {
                    onVerifyReport(report.id, clinicianNote || 'Clinically confirmed upon radiologic inspection.');
                  }
                  setIsSignoffModalOpen(false);
                }}
                className="px-5 py-2 text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-xs"
              >
                Confirm & Sign Digitally
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
