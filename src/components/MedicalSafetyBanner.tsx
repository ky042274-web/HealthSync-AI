import React, { useState } from 'react';
import { AlertTriangle, ShieldCheck, ChevronDown, ChevronUp, PhoneCall, Info } from 'lucide-react';
import { Language } from '../types';

interface MedicalSafetyBannerProps {
  language: Language;
}

export const MedicalSafetyBanner: React.FC<MedicalSafetyBannerProps> = ({ language }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isHindi = language === 'hi';

  return (
    <aside aria-label="Medical Safety Advisory" className="bg-amber-50 border-b border-amber-200 text-amber-950 px-4 py-2.5 text-xs sm:text-sm">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <div className="flex items-start gap-2.5 flex-1">
          <div className="p-1 rounded bg-amber-200/80 text-amber-800 shrink-0 mt-0.5">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <p className="font-semibold text-amber-900 inline mr-1">
              {isHindi
                ? 'महत्वपूर्ण चिकित्सा सूचना (प्रारंभिक AI सहायता):'
                : 'Clinical Safety Notice (Preliminary AI Assistance):'}
            </p>
            <span className="text-amber-800">
              {isHindi
                ? 'प्लेटफॉर्म पर दिए गए सभी AI अवलोकन केवल प्रारंभिक सहायता हेतु हैं, अंतिम चिकित्सीय निदान नहीं। कोई भी उपचार शुरू करने से पूर्व पंजीकृत चिकित्सक से परामर्श अनिवार्य है।'
                : 'All AI observations and findings are assistive decision-support tools, not a certified clinical diagnosis. Always consult a registered medical practitioner.'}
            </span>
            {isExpanded && (
              <div className="mt-2 pt-2 border-t border-amber-200/80 text-xs text-amber-900 space-y-1">
                <p>
                  • <strong>Emergency Directives:</strong> If experiencing acute chest pain, sudden breathlessness, severe hemorrhage, or loss of consciousness, do NOT wait for online analysis. Immediately dial <strong>108 / 112</strong> or proceed to the nearest emergency room.
                </p>
                <p>
                  • <strong>Regulatory & Data Compliance:</strong> Health records are stored with role-based consent protocols adhering to Ayushman Bharat Digital Mission (ABDM) guidelines.
                </p>
                <p>
                  • <strong>Device Integration:</strong> Only validated, CE/FDA/CDSCO certified medical telemetry devices are compatible.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 text-xs text-amber-800 hover:text-amber-950 font-medium px-2 py-1 rounded hover:bg-amber-100 transition-colors"
          >
            <Info className="w-3.5 h-3.5" />
            <span>{isExpanded ? (isHindi ? 'कम देखें' : 'Less') : (isHindi ? 'सुरक्षा दिशानिर्देश' : 'Safety Rules')}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          <a
            href="tel:108"
            className="flex items-center gap-1 px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs rounded-full shadow-xs transition-colors"
          >
            <PhoneCall className="w-3 h-3 animate-pulse" />
            <span>108 / 112 Emergency</span>
          </a>
        </div>
      </div>
    </aside>
  );
};
