import React, { useState, useEffect } from 'react';
import {
  X,
  FileText,
  Sparkles,
  Printer,
  Download,
  Share2,
  CheckCircle,
  AlertTriangle,
  UserCheck,
  Building,
  Calendar,
  Layers,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { MedicalReport, Language } from '../types';

interface ReportDetailModalProps {
  report: MedicalReport | null;
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export const ReportDetailModal: React.FC<ReportDetailModalProps> = ({
  report,
  isOpen,
  onClose,
  language,
}) => {
  const isHindi = language === 'hi';
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [isLoadingExplanation, setIsLoadingExplanation] = useState<boolean>(false);

  useEffect(() => {
    if (report && isOpen) {
      fetchExplanation();
    } else {
      setAiExplanation(null);
    }
  }, [report, isOpen, language]);

  const fetchExplanation = async () => {
    if (!report) return;
    setIsLoadingExplanation(true);
    try {
      const response = await fetch('/api/gemini/explain-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testName: report.title,
          reportSummary: report.clinicalNotes || report.aiAnalysis?.preliminaryObservations || '',
          values: report.labParameters || [],
          language,
        }),
      });
      const data = await response.json();
      if (data.explanation) {
        setAiExplanation(data.explanation);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingExplanation(false);
    }
  };

  if (!isOpen || !report) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto print:p-0 print:bg-white">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in duration-150 print:shadow-none print:border-none">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 to-teal-950 text-white flex items-center justify-between print:bg-none print:text-black print:border-b">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-mono text-teal-300 font-bold uppercase tracking-wider">
                {report.category} • {report.id}
              </span>
              <h2 className="text-base sm:text-lg font-bold text-white">{report.title}</h2>
            </div>
          </div>
          <div className="flex items-center gap-2 print:hidden">
            <button
              onClick={handlePrint}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="Print Diagnostic Report"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
            <div>
              <span className="text-slate-400 block font-semibold text-[10px] uppercase">Patient</span>
              <span className="font-bold text-slate-800">{report.patientName}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-semibold text-[10px] uppercase">Exam Date</span>
              <span className="font-bold text-slate-800">{report.testDate}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-semibold text-[10px] uppercase">Laboratory</span>
              <span className="font-bold text-teal-800">{report.laboratoryName}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-semibold text-[10px] uppercase">Status</span>
              <span className="font-bold text-emerald-700">{report.status}</span>
            </div>
          </div>

          {/* Biomarkers Table if quantitative parameters exist */}
          {report.labParameters && report.labParameters.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                Quantitative Biomarker Findings
              </h3>
              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Test Parameter</th>
                      <th className="py-2.5 px-3">Result</th>
                      <th className="py-2.5 px-3">Biological Reference Range</th>
                      <th className="py-2.5 px-3 text-right">Interpretation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {report.labParameters.map((param, i) => (
                      <tr key={i} className="hover:bg-slate-50/70">
                        <td className="py-2.5 px-3 font-semibold text-slate-800">
                          {param.name}
                          {param.description && (
                            <span className="block text-[10px] text-slate-400 font-normal">
                              {param.description}
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                          {param.value} <span className="text-[11px] font-normal text-slate-500">{param.unit}</span>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600">
                          {param.referenceRange}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              param.status === 'critical'
                                ? 'bg-red-100 text-red-800'
                                : param.status === 'high'
                                ? 'bg-amber-100 text-amber-800'
                                : param.status === 'low'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {param.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* AI Plain-Language Explainer (Multilingual EN/HI) */}
          <div className="p-5 rounded-2xl bg-teal-50/70 border border-teal-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-600" />
                <h3 className="text-xs font-bold text-teal-900 uppercase tracking-wider">
                  {isHindi ? 'AI सरल भाषा व्याख्या (Arogya Mitra)' : 'AI Plain-Language Interpretation (Arogya Mitra)'}
                </h3>
              </div>
              <span className="text-[10px] font-semibold text-teal-700 bg-white px-2 py-0.5 rounded-md border border-teal-200">
                {isHindi ? 'हिन्दी में अनुवादित' : 'Gemini 3.8 Flash'}
              </span>
            </div>

            {isLoadingExplanation ? (
              <div className="py-4 flex items-center justify-center gap-2 text-xs text-teal-700">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Translating medical terminology into plain patient language...</span>
              </div>
            ) : aiExplanation ? (
              <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-line space-y-2">
                {aiExplanation}
              </div>
            ) : (
              <p className="text-xs text-slate-500">
                Click explain to generate patient-friendly insights for this report.
              </p>
            )}
          </div>

          {/* Clinician Signature Block */}
          {report.aiAnalysis?.reviewedBy && (
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-emerald-200 text-emerald-900 shrink-0">
                <UserCheck className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <span className="font-bold text-emerald-950 block">
                  Pathologist / Clinician Digital Verification
                </span>
                <p className="font-semibold text-slate-800 mt-0.5">
                  {report.aiAnalysis.reviewedBy.doctorName} ({report.aiAnalysis.reviewedBy.regNumber})
                </p>
                <p className="text-slate-600 italic mt-1 bg-white p-2 rounded-lg border border-emerald-200">
                  "{report.aiAnalysis.reviewedBy.clinicalImpression}"
                </p>
                <span className="text-[10px] text-emerald-700 block mt-1">
                  Verified timestamp: {report.aiAnalysis.reviewedBy.reviewedAt}
                </span>
              </div>
            </div>
          )}

          {/* Safety Disclaimer */}
          <div className="p-3 bg-slate-100 rounded-xl text-[11px] text-slate-500 italic">
            This digital document is generated through the HealthPulse Smart Diagnostic Network. All AI interpretations are designed as patient literacy and triage aids. Please consult your physician for clinical diagnosis and treatment plans.
          </div>
        </div>
      </div>
    </div>
  );
};
