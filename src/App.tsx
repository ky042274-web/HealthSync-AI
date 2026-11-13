/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  MOCK_USERS,
  MOCK_PATIENT,
  MOCK_REPORTS,
  MOCK_DEVICES,
  MOCK_FACILITIES,
} from './data/mockData';
import { UserRole, Language, MedicalReport } from './types';
import { MedicalSafetyBanner } from './components/MedicalSafetyBanner';
import { Header } from './components/Header';
import { PatientPortal } from './components/PatientPortal';
import { MedicalImageViewer } from './components/MedicalImageViewer';
import { ImageAnalysisModal } from './components/ImageAnalysisModal';
import { ReportDetailModal } from './components/ReportDetailModal';
import { DeviceIntegration } from './components/DeviceIntegration';
import { DirectoryMap } from './components/DirectoryMap';
import { ClinicianDashboard } from './components/ClinicianDashboard';
import { AiAssistant } from './components/AiAssistant';
import { ShieldCheck, Heart, Activity, AlertTriangle, PhoneCall, Sparkles } from 'lucide-react';

export default function App() {
  const [currentRole, setCurrentRole] = useState<UserRole>('patient');
  const [language, setLanguage] = useState<Language>('en');
  const [activeTab, setActiveTab] = useState<string>('patient_portal');

  // Application data states
  const [reports, setReports] = useState<MedicalReport[]>(MOCK_REPORTS);
  const [activeImagingReport, setActiveImagingReport] = useState<MedicalReport>(
    MOCK_REPORTS[1] // Default Chest X-Ray with AI analysis
  );
  const [selectedDetailReport, setSelectedDetailReport] = useState<MedicalReport | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);

  const currentUser = MOCK_USERS[currentRole];
  const pendingReviewCount = reports.filter((r) => r.status !== 'Clinically Verified').length;

  // Clinician verification handler
  const handleVerifyReport = (reportId: string, clinicalNotes: string) => {
    setReports((prev) =>
      prev.map((rep) => {
        if (rep.id === reportId) {
          return {
            ...rep,
            status: 'Clinically Verified',
            aiAnalysis: rep.aiAnalysis
              ? {
                  ...rep.aiAnalysis,
                  reviewedBy: {
                    doctorName: currentUser.name,
                    regNumber: currentUser.regNumber || 'MCI-REG-VERIFIED',
                    clinicalImpression: clinicalNotes,
                    reviewedAt: new Date().toLocaleDateString('en-IN') + ' ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) + ' IST',
                    verificationStatus: 'confirmed',
                  },
                }
              : undefined,
          };
        }
        return rep;
      })
    );

    // Update active imaging report if modified
    if (activeImagingReport.id === reportId) {
      setActiveImagingReport((prev) => ({
        ...prev,
        status: 'Clinically Verified',
        aiAnalysis: prev.aiAnalysis
          ? {
              ...prev.aiAnalysis,
              reviewedBy: {
                doctorName: currentUser.name,
                regNumber: currentUser.regNumber || 'MCI-REG-VERIFIED',
                clinicalImpression: clinicalNotes,
                reviewedAt: new Date().toLocaleDateString('en-IN') + ' ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) + ' IST',
                verificationStatus: 'confirmed',
              },
            }
          : undefined,
      }));
    }
  };

  // Toggle patient consent for doctor access
  const handleToggleConsent = (reportId: string) => {
    setReports((prev) =>
      prev.map((r) => (r.id === reportId ? { ...r, doctorConsentGranted: !r.doctorConsentGranted } : r))
    );
  };

  // Open diagnostic image viewer
  const handleSelectReport = (report: MedicalReport) => {
    if (report.imageUrl) {
      setActiveImagingReport(report);
      setActiveTab('ai_imaging');
    } else {
      setSelectedDetailReport(report);
      setIsDetailModalOpen(true);
    }
  };

  // Plain-language report explainer
  const handleExplainReportWithAi = (report: MedicalReport) => {
    setSelectedDetailReport(report);
    setIsDetailModalOpen(true);
  };

  // New report added via AI Image modal
  const handleNewReportCreated = (newReport: MedicalReport) => {
    setReports((prev) => [newReport, ...prev]);
    setActiveImagingReport(newReport);
    setActiveTab('ai_imaging');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-teal-500 selection:text-white">
      {/* 1. Medical Safety Banner (Top-level Regulatory Notice) */}
      <MedicalSafetyBanner language={language} />

      {/* 2. Platform Navigation & Switchers */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentRole={currentRole}
        setCurrentRole={setCurrentRole}
        currentUser={currentUser}
        language={language}
        setLanguage={setLanguage}
        pendingReviewCount={pendingReviewCount}
      />

      {/* 3. Main Body Tabs */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'patient_portal' && (
          <PatientPortal
            patient={MOCK_PATIENT}
            reports={reports}
            language={language}
            onOpenUploadModal={() => setIsUploadModalOpen(true)}
            onSelectReport={handleSelectReport}
            onExplainReportWithAi={handleExplainReportWithAi}
            onToggleConsent={handleToggleConsent}
          />
        )}

        {activeTab === 'ai_imaging' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-3xl border border-slate-200">
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-teal-600 animate-pulse" />
                  {language === 'hi' ? 'AI मेडिकल इमेजिंग स्टूडियो' : 'AI Medical Image Diagnostic Studio'}
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Computer vision lesion detection, confidence scoring, DICOM-level contrast controls, and clinician review.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsUploadModalOpen(true)}
                  className="px-4 py-2 text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{language === 'hi' ? 'नया स्कैन प्रोसेस करें' : 'Upload & Analyze Scan'}</span>
                </button>
              </div>
            </div>

            {/* Diagnostic Image Viewer Component */}
            <MedicalImageViewer
              report={activeImagingReport}
              language={language}
              currentRole={currentRole}
              onVerifyReport={handleVerifyReport}
            />

            {/* Quick Switcher among image scans */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 space-y-3">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Select Medical Scan to Inspect:
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {reports
                  .filter((r) => r.imageUrl)
                  .map((rep) => {
                    const isSelected = rep.id === activeImagingReport.id;
                    return (
                      <button
                        key={rep.id}
                        onClick={() => setActiveImagingReport(rep)}
                        className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-3 ${
                          isSelected
                            ? 'bg-teal-50 border-teal-500 shadow-xs ring-1 ring-teal-500'
                            : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                        }`}
                      >
                        <img
                          src={rep.imageUrl}
                          alt={rep.title}
                          className="w-12 h-12 rounded-lg object-cover bg-black shrink-0"
                        />
                        <div className="overflow-hidden">
                          <span className="text-[10px] font-mono text-teal-700 font-bold block">
                            {rep.category}
                          </span>
                          <span className="font-semibold text-xs text-slate-900 block truncate">
                            {rep.title}
                          </span>
                          <span className="text-[10px] text-slate-500 truncate block">
                            {rep.status}
                          </span>
                        </div>
                      </button>
                    );
                  })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'clinician_queue' && (
          <ClinicianDashboard
            reports={reports}
            currentUser={currentUser}
            language={language}
            onSelectReportToInspect={(rep) => {
              if (rep.imageUrl) {
                setActiveImagingReport(rep);
                setActiveTab('ai_imaging');
              } else {
                setSelectedDetailReport(rep);
                setIsDetailModalOpen(true);
              }
            }}
            onVerifyReport={handleVerifyReport}
          />
        )}

        {activeTab === 'devices' && (
          <DeviceIntegration devices={MOCK_DEVICES} language={language} />
        )}

        {activeTab === 'directory' && (
          <DirectoryMap facilities={MOCK_FACILITIES} language={language} />
        )}

        {activeTab === 'ai_chat' && (
          <AiAssistant language={language} setLanguage={setLanguage} />
        )}
      </main>

      {/* 4. Modals */}
      <ImageAnalysisModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        language={language}
        onAnalysisComplete={handleNewReportCreated}
      />

      <ReportDetailModal
        report={selectedDetailReport}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        language={language}
      />

      {/* 5. Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-8 border-t border-slate-800 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-white">
              <div className="w-6 h-6 rounded-lg bg-teal-500 flex items-center justify-center text-slate-950 font-black">
                +
              </div>
              <span className="font-bold text-sm tracking-tight">
                HealthPulse AI • Smart Diagnostic System
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs">
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                ABDM & CDSCO Approved Standards
              </span>
              <span>•</span>
              <span>NABL (ISO 15189) Partner Network</span>
              <span>•</span>
              <a href="tel:108" className="text-rose-400 font-bold hover:underline flex items-center gap-1">
                <PhoneCall className="w-3.5 h-3.5" />
                Emergency Hotline: 108 / 112
              </a>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 leading-relaxed border-t border-slate-800/80 pt-3">
            <strong>Medical Disclaimer & Regulatory Notice:</strong> HealthPulse AI is a preliminary digital triage and decision-support architecture. Algorithmic outputs, computer vision detections, and conversational assistant replies do not establish a doctor-patient relationship, prescribe pharmaceuticals, or substitute for formal examination by a licensed medical practitioner. Patient health data is governed by strict user consent and cryptographic access controls.
          </p>
        </div>
      </footer>
    </div>
  );
}
