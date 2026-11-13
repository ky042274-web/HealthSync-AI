import React from 'react';
import {
  Activity,
  FileText,
  Scan,
  Stethoscope,
  Radio,
  MapPin,
  Bot,
  UserCheck,
  Globe2,
  ShieldCheck,
  Bell,
} from 'lucide-react';
import { UserRole, Language, UserProfile } from '../types';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  currentUser: UserProfile;
  language: Language;
  setLanguage: (lang: Language) => void;
  pendingReviewCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  currentRole,
  setCurrentRole,
  currentUser,
  language,
  setLanguage,
  pendingReviewCount,
}) => {
  const isHindi = language === 'hi';

  const navItems = [
    {
      id: 'patient_portal',
      label: isHindi ? 'मरीज़ रिकॉर्ड' : 'Patient Records',
      icon: FileText,
      badge: null,
    },
    {
      id: 'ai_imaging',
      label: isHindi ? 'AI इमेज डायग्नोस्टिक्स' : 'AI Medical Imaging',
      icon: Scan,
      badge: 'Vision AI',
    },
    {
      id: 'clinician_queue',
      label: isHindi ? 'डॉक्टर / पैथोलॉजिस्ट' : 'Clinician Review',
      icon: Stethoscope,
      badge: pendingReviewCount > 0 ? `${pendingReviewCount}` : null,
      badgeColor: 'bg-amber-500 text-white',
    },
    {
      id: 'devices',
      label: isHindi ? 'चिकित्सा उपकरण' : 'Medical Devices',
      icon: Radio,
      badge: 'Live',
      badgeColor: 'bg-emerald-500 text-white',
    },
    {
      id: 'directory',
      label: isHindi ? 'सत्यापित अस्पताल व लैब' : 'Verified Directory',
      icon: MapPin,
      badge: null,
    },
    {
      id: 'ai_chat',
      label: isHindi ? 'आरोग्य AI सहायक' : 'AI Assistant',
      icon: Bot,
      badge: 'Multilingual',
      badgeColor: 'bg-teal-600 text-white',
    },
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      {/* Top Bar with Branding, Switchers, and Profiles */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Tagline */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-teal-500/20">
              <Activity className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900">
                  Health<span className="text-teal-600">Pulse</span> <span className="text-cyan-600 text-sm font-semibold uppercase tracking-wider px-1.5 py-0.5 bg-teal-50 rounded border border-teal-200">AI</span>
                </span>
                <span className="hidden lg:inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  ABDM & CDSCO Compliant
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                {isHindi
                  ? 'अस्पतालों, डॉक्टरों, प्रयोगशालाओं और मरीज़ों को जोड़ने वाली स्मार्ट प्रणाली'
                  : 'AI-Powered Healthcare & Smart Diagnostic System'}
              </p>
            </div>
          </div>

          {/* Right Controls: Role Switcher, Language Toggle, and Active User Badge */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Selector */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button
                onClick={() => setLanguage('en')}
                className={`px-2 py-1 text-xs font-semibold rounded-md transition-all ${
                  language === 'en'
                    ? 'bg-white text-teal-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Switch to English"
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('hi')}
                className={`px-2 py-1 text-xs font-semibold rounded-md transition-all ${
                  language === 'hi'
                    ? 'bg-white text-teal-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="हिन्दी में बदलें"
              >
                हिन्दी
              </button>
            </div>

            {/* Role Switcher Demo Dropdown */}
            <div className="flex items-center gap-1.5 bg-teal-50/70 border border-teal-200 rounded-lg px-2.5 py-1 text-xs text-teal-900">
              <UserCheck className="w-3.5 h-3.5 text-teal-700" />
              <label htmlFor="role-select" className="hidden sm:inline font-medium text-teal-800">
                {isHindi ? 'भूमिका (Role):' : 'Active Role:'}
              </label>
              <select
                id="role-select"
                aria-label={isHindi ? 'भूमिका (Role)' : 'Active Role'}
                value={currentRole}
                onChange={(e) => {
                  const role = e.target.value as UserRole;
                  setCurrentRole(role);
                  if (role === 'doctor' || role === 'pathologist') {
                    setActiveTab('clinician_queue');
                  } else if (role === 'patient') {
                    setActiveTab('patient_portal');
                  }
                }}
                className="bg-transparent font-bold text-teal-900 focus:outline-hidden cursor-pointer"
              >
                <option value="patient">👤 Patient (Rameshwar)</option>
                <option value="doctor">🩺 Dr. Sharma (Pulmonologist)</option>
                <option value="pathologist">🔬 Dr. Ananya (Pathologist)</option>
                <option value="lab_admin">🏥 Lab Ops (Metropolis)</option>
              </select>
            </div>

            {/* User Profile Avatar Pill */}
            <div className="hidden md:flex items-center gap-2 pl-2 border-l border-slate-200">
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-teal-500/30"
              />
              <div className="text-left text-xs leading-tight">
                <div className="font-semibold text-slate-800">{currentUser.name}</div>
                <div className="text-[10px] text-slate-500">
                  {currentUser.regNumber || currentUser.abhaId ? (
                    <span className="font-mono text-teal-700 font-medium">
                      {currentUser.regNumber ? `Reg: ${currentUser.regNumber}` : `ABHA: ${currentUser.abhaId?.slice(0, 7)}...`}
                    </span>
                  ) : (
                    currentUser.role
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto py-1.5 scrollbar-none border-t border-slate-100">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className={`text-[10px] font-semibold px-1.5 py-0.2 rounded-full ${
                      item.badgeColor || (isActive ? 'bg-teal-500 text-white' : 'bg-slate-200 text-slate-700')
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
