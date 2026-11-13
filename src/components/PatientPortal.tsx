import React, { useState } from 'react';
import {
  User,
  Heart,
  AlertCircle,
  FileText,
  Upload,
  Shield,
  CheckCircle,
  Clock,
  Scan,
  Download,
  Share2,
  Sparkles,
  ChevronRight,
  Filter,
  Plus,
  Stethoscope,
  Pill,
} from 'lucide-react';
import { PatientRecord, MedicalReport, Language, ReportCategory } from '../types';

interface PatientPortalProps {
  patient: PatientRecord;
  reports: MedicalReport[];
  language: Language;
  onOpenUploadModal: () => void;
  onSelectReport: (report: MedicalReport) => void;
  onExplainReportWithAi: (report: MedicalReport) => void;
  onToggleConsent: (reportId: string) => void;
}

export const PatientPortal: React.FC<PatientPortalProps> = ({
  patient,
  reports,
  language,
  onOpenUploadModal,
  onSelectReport,
  onExplainReportWithAi,
  onToggleConsent,
}) => {
  const isHindi = language === 'hi';
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const categories: Array<string> = ['All', 'Radiology', 'Pathology', 'Biochemistry', 'Hematology'];

  const filteredReports = reports.filter((rep) => {
    const matchesCategory = selectedCategory === 'All' || rep.category === selectedCategory;
    const matchesSearch =
      rep.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rep.laboratoryName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Patient Profile & Health Identity Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-teal-800/40">
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-teal-600/30 border-2 border-teal-400/50 p-1 flex items-center justify-center overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80"
                  alt={patient.name}
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-slate-950 p-1 rounded-full border-2 border-slate-900" title="Verified ABHA Identity">
                <Shield className="w-3.5 h-3.5 fill-current" />
              </div>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight">{patient.name}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-500/20 text-teal-300 border border-teal-400/30 font-mono">
                  ABHA: {patient.abhaId}
                </span>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  {patient.bloodGroup}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                {patient.age} years • {patient.gender} • Emergency Contact: {patient.emergencyContact.name} ({patient.emergencyContact.relation}) {patient.emergencyContact.phone}
              </p>
              
              {/* Chronic & Allergy Badges */}
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  {isHindi ? 'स्थिति / एलर्जी:' : 'Health Flags:'}
                </span>
                {patient.chronicConditions.map((cond, i) => (
                  <span key={i} className="text-xs bg-slate-800/80 text-amber-200 px-2.5 py-0.5 rounded-lg border border-amber-500/20 flex items-center gap-1">
                    <Heart className="w-3 h-3 text-amber-400" />
                    {cond}
                  </span>
                ))}
                {patient.allergies.map((all, i) => (
                  <span key={i} className="text-xs bg-rose-950/60 text-rose-200 px-2.5 py-0.5 rounded-lg border border-rose-500/30 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 text-rose-400" />
                    {all}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Action Button to Upload Document or AI Scan */}
          <div className="flex flex-col sm:flex-row items-stretch lg:items-center gap-3 shrink-0">
            <button
              onClick={onOpenUploadModal}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm shadow-lg shadow-teal-500/25 transition-all active:scale-98"
            >
              <Upload className="w-4 h-4" />
              <span>{isHindi ? 'नई रिपोर्ट या स्कैन जोड़ें' : 'Upload Report / Scan'}</span>
            </button>
          </div>
        </div>

        {/* Current Active Prescriptions Bar */}
        <div className="mt-5 pt-4 border-t border-teal-800/50 flex flex-wrap items-center justify-between text-xs text-slate-300 gap-3">
          <div className="flex items-center gap-2">
            <Pill className="w-4 h-4 text-teal-400 shrink-0" />
            <span className="font-semibold text-white">Active Prescriptions:</span>
            <span>{patient.currentMedications.join(' • ')}</span>
          </div>
          <div className="text-teal-300 font-medium">
            Last Consultation: {patient.lastVisitDate} (Apollo Healthcare)
          </div>
        </div>
      </div>

      {/* Reports Directory & Management Section */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-teal-600" />
              <h2 className="text-lg font-bold text-slate-900">
                {isHindi ? 'डिजिटल मेडिकल रिकॉर्ड व टेस्ट रिपोर्ट्स' : 'Diagnostic Records & Test History'}
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {isHindi
                ? 'सुरक्षित डिजिटल रिकॉर्ड, AI कंप्यूटर विजन अवलोकन, और डॉक्टर द्वारा सत्यापित रिपोर्ट्स'
                : 'Encrypted health records, AI triage observations, and pathologist-certified panels'}
            </p>
          </div>

          {/* Search & Category Filter */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <input
                type="text"
                placeholder={isHindi ? 'रिपोर्ट या लैब खोजें...' : 'Search reports or labs...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="text-xs py-2 px-3 pl-8 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500 w-48 sm:w-60"
              />
              <Filter className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                    selectedCategory === cat
                      ? 'bg-white text-teal-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Reports Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredReports.map((report) => {
            const hasImage = Boolean(report.imageUrl);
            const hasAi = Boolean(report.aiAnalysis);
            const isVerified = report.status === 'Clinically Verified';

            return (
              <div
                key={report.id}
                className="bg-slate-50/70 hover:bg-white rounded-2xl border border-slate-200 hover:border-teal-300 p-5 transition-all hover:shadow-md flex flex-col justify-between group"
              >
                <div>
                  {/* Category & Status Badges */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold bg-slate-200 text-slate-700 uppercase">
                      {report.category}
                    </span>

                    {isVerified ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-0.5 rounded-full border border-emerald-300">
                        <CheckCircle className="w-3 h-3 text-emerald-600" />
                        {isHindi ? 'सत्यापित' : 'Clinically Verified'}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-100/80 px-2.5 py-0.5 rounded-full border border-amber-300">
                        <Clock className="w-3 h-3 text-amber-600" />
                        {isHindi ? 'AI अवलोकन (समीक्षा लंबित)' : 'Preliminary AI Triage'}
                      </span>
                    )}
                  </div>

                  {/* Title & Facility */}
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug group-hover:text-teal-700 transition-colors">
                    {report.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                    <span>{report.laboratoryName}</span>
                    {report.isVerifiedLab && (
                      <span className="text-[10px] font-semibold text-teal-700 bg-teal-50 px-1.5 py-0.2 rounded border border-teal-200">
                        NABL / NABH
                      </span>
                    )}
                    <span>• {report.testDate}</span>
                  </p>

                  {/* Preview Image or Biomarkers snippet */}
                  {hasImage ? (
                    <div className="mt-3 relative rounded-xl overflow-hidden bg-slate-900 h-28 border border-slate-200">
                      <img
                        src={report.imageUrl}
                        alt={report.title}
                        className="w-full h-full object-cover opacity-85 hover:opacity-100 transition-opacity"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-2.5">
                        <span className="text-[11px] text-teal-300 font-mono font-semibold flex items-center gap-1">
                          <Scan className="w-3.5 h-3.5" />
                          {report.imageType || 'Clinical Scan'} • Confidence: {report.aiAnalysis?.confidenceScore || 88}%
                        </span>
                      </div>
                    </div>
                  ) : report.labParameters && report.labParameters.length > 0 ? (
                    <div className="mt-3 p-2.5 bg-white rounded-xl border border-slate-200 space-y-1 text-xs">
                      {report.labParameters.slice(0, 3).map((param, idx) => (
                        <div key={idx} className="flex items-center justify-between text-slate-600">
                          <span className="truncate pr-2 font-medium">{param.name}:</span>
                          <span
                            className={`font-mono font-bold ${
                              param.status === 'critical'
                                ? 'text-red-600'
                                : param.status === 'high'
                                ? 'text-amber-600'
                                : 'text-slate-800'
                            }`}
                          >
                            {param.value} {param.unit}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : null}

                  {/* Doctor Consent Status */}
                  <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">
                      {isHindi ? 'डॉक्टर सहमति:' : 'Doctor Consent:'}
                    </span>
                    <button
                      onClick={() => onToggleConsent(report.id)}
                      className={`font-semibold px-2 py-0.5 rounded-full transition-colors ${
                        report.doctorConsentGranted
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                          : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                      }`}
                    >
                      {report.doctorConsentGranted
                        ? (isHindi ? 'सहमति सक्रिय (Granted)' : 'Access Granted (Consented)')
                        : (isHindi ? 'निजी (Restricted)' : 'Private / Restricted')}
                    </button>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="mt-4 pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onExplainReportWithAi(report)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 transition-colors"
                      title="Generate plain-language explanation with AI"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                      <span>{isHindi ? 'AI से समझें' : 'Explain with AI'}</span>
                    </button>
                  </div>

                  <button
                    onClick={() => onSelectReport(report)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-slate-900 hover:bg-teal-700 transition-all shadow-xs"
                  >
                    <span>{hasImage ? (isHindi ? 'इमेज स्टूडियो खोलें' : 'Open Image Studio') : (isHindi ? 'विस्तार देखें' : 'View Full Details')}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
