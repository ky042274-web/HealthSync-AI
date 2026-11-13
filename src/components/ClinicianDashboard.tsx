import React, { useState } from 'react';
import {
  Stethoscope,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  UserCheck,
  Search,
  Filter,
  Eye,
  Shield,
  Activity,
  PlusCircle,
  Award,
} from 'lucide-react';
import { MedicalReport, UserProfile, Language } from '../types';

interface ClinicianDashboardProps {
  reports: MedicalReport[];
  currentUser: UserProfile;
  language: Language;
  onSelectReportToInspect: (report: MedicalReport) => void;
  onVerifyReport: (reportId: string, clinicalNotes: string) => void;
}

export const ClinicianDashboard: React.FC<ClinicianDashboardProps> = ({
  reports,
  currentUser,
  language,
  onSelectReportToInspect,
  onVerifyReport,
}) => {
  const isHindi = language === 'hi';
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedReportForSign, setSelectedReportForSign] = useState<MedicalReport | null>(null);
  const [clinicalComment, setClinicalComment] = useState<string>('');

  const pendingReports = reports.filter((r) => r.status !== 'Clinically Verified');
  const verifiedReports = reports.filter((r) => r.status === 'Clinically Verified');

  const displayedReports = reports.filter((r) => {
    if (filterStatus === 'pending') return r.status !== 'Clinically Verified';
    if (filterStatus === 'verified') return r.status === 'Clinically Verified';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Clinician Header with Credential Stamps */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.name}
              className="w-16 h-16 rounded-2xl object-cover ring-2 ring-teal-500/30"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold text-slate-900">{currentUser.name}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-teal-50 text-teal-800 border border-teal-200">
                  {currentUser.regNumber || 'NMC / MCI Certified'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {currentUser.specialty} • {currentUser.hospitalAffiliation}
              </p>
              <div className="flex items-center gap-2 mt-2 text-xs text-emerald-700 font-semibold">
                <Shield className="w-3.5 h-3.5 text-emerald-600" />
                <span>Authorized Digital Diagnostic Sign-Off Privileges Active</span>
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200">
              <span className="text-xl font-black text-amber-700 font-mono">
                {pendingReports.length}
              </span>
              <span className="text-[10px] text-amber-900 uppercase font-bold block">
                Pending Review
              </span>
            </div>
            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200">
              <span className="text-xl font-black text-emerald-700 font-mono">
                {verifiedReports.length}
              </span>
              <span className="text-[10px] text-emerald-900 uppercase font-bold block">
                Verified Reports
              </span>
            </div>
            <div className="p-3 bg-teal-50 rounded-2xl border border-teal-200">
              <span className="text-xl font-black text-teal-700 font-mono">100%</span>
              <span className="text-[10px] text-teal-900 uppercase font-bold block">
                Consent Verified
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Review Queue Table */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-teal-600" />
              {isHindi ? 'मरीज़ रिपोर्ट एवं AI अवलोकन समीक्षा कतार' : 'Patient Diagnostic & AI Triage Review Queue'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Review AI preliminary findings, verify structural biomarkers, and add authorized clinical impressions.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                filterStatus === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              All Reports ({reports.length})
            </button>
            <button
              onClick={() => setFilterStatus('pending')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                filterStatus === 'pending'
                  ? 'bg-amber-500 text-white'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              Pending Verification ({pendingReports.length})
            </button>
            <button
              onClick={() => setFilterStatus('verified')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                filterStatus === 'verified'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              Verified ({verifiedReports.length})
            </button>
          </div>
        </div>

        {/* Table of Queue */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Patient / Exam</th>
                <th className="py-3 px-4">Modality & Facility</th>
                <th className="py-3 px-4">AI Preliminary Observation</th>
                <th className="py-3 px-4">Confidence</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayedReports.map((report) => {
                const isVerified = report.status === 'Clinically Verified';
                const confidence = report.aiAnalysis?.confidenceScore || 88;

                return (
                  <tr key={report.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{report.patientName}</div>
                      <span className="text-[11px] text-slate-500 font-mono">{report.title}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <span className="font-semibold text-slate-800">{report.category}</span>
                      <span className="block text-[10px] text-slate-400">{report.laboratoryName}</span>
                    </td>
                    <td className="py-3 px-4">
                      {report.aiAnalysis ? (
                        <div>
                          <span className="font-semibold text-teal-900 block line-clamp-1">
                            {report.aiAnalysis.primaryFinding}
                          </span>
                          <span className="text-[10px] text-slate-500 line-clamp-1">
                            {report.aiAnalysis.anatomicalRegion}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400">Quantitative Panel (Laboratory)</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">
                      {report.aiAnalysis ? `${confidence}%` : 'Standard'}
                    </td>
                    <td className="py-3 px-4">
                      {isVerified ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                          <Clock className="w-3 h-3 text-amber-600" />
                          Review Needed
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onSelectReportToInspect(report)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] flex items-center gap-1 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-500" />
                          <span>Inspect</span>
                        </button>

                        {!isVerified && (
                          <button
                            onClick={() => {
                              setSelectedReportForSign(report);
                              setClinicalComment(
                                report.aiAnalysis?.primaryFinding
                                  ? `Clinically concurred with AI preliminary findings: ${report.aiAnalysis.primaryFinding}. Standard therapeutic protocol initiated.`
                                  : 'Biomarkers verified and clinically correlated.'
                              );
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-[11px] flex items-center gap-1 shadow-xs transition-colors"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Sign-off</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Clinician Sign-off Modal */}
      {selectedReportForSign && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center gap-2 text-teal-800 font-bold text-base mb-1">
              <Stethoscope className="w-5 h-5 text-teal-600" />
              <h3>Clinician Verification & Impression</h3>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              Report: <span className="font-bold text-slate-800">{selectedReportForSign.title}</span> ({selectedReportForSign.patientName})
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Physician / Pathologist Impression:
                </label>
                <textarea
                  value={clinicalComment}
                  onChange={(e) => setClinicalComment(e.target.value)}
                  rows={4}
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-950 flex items-start gap-2">
                <Award className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Digital Certification Stamp:</span>
                  <p className="text-[11px] text-emerald-900/90 mt-0.5">
                    Will be stamped with: <strong>{currentUser.name}</strong> ({currentUser.regNumber}) • {currentUser.specialty}.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                onClick={() => setSelectedReportForSign(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onVerifyReport(selectedReportForSign.id, clinicalComment);
                  setSelectedReportForSign(null);
                }}
                className="px-5 py-2.5 text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-xs"
              >
                Certify & Sign Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
