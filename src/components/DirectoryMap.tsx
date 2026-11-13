import React, { useState } from 'react';
import {
  MapPin,
  Building,
  ShieldCheck,
  AlertCircle,
  Phone,
  Clock,
  Navigation,
  CheckCircle2,
  Calendar,
  Search,
  Filter,
  ExternalLink,
  Truck,
  HeartPulse,
} from 'lucide-react';
import { HealthcareFacility, Language } from '../types';

interface DirectoryMapProps {
  facilities: HealthcareFacility[];
  language: Language;
}

export const DirectoryMap: React.FC<DirectoryMapProps> = ({ facilities, language }) => {
  const isHindi = language === 'hi';
  const [selectedFacility, setSelectedFacility] = useState<HealthcareFacility>(facilities[0]);
  const [filterType, setFilterType] = useState<string>('All');
  const [onlyVerified, setOnlyVerified] = useState<boolean>(false);
  const [emergencyOnly, setEmergencyOnly] = useState<boolean>(false);
  const [homeCollectionOnly, setHomeCollectionOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [bookingSuccessMsg, setBookingSuccessMsg] = useState<string | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState<boolean>(false);

  const filteredFacilities = facilities.filter((fac) => {
    if (filterType !== 'All' && fac.type !== filterType) return false;
    if (onlyVerified && !fac.isVerifiedPartner) return false;
    if (emergencyOnly && !fac.emergency24x7) return false;
    if (homeCollectionOnly && !fac.homeCollectionAvailable) return false;
    if (
      searchQuery &&
      !fac.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !fac.city.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !fac.availableServices.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()))
    ) {
      return false;
    }
    return true;
  });

  const handleBookTest = (e: React.FormEvent) => {
    e.preventDefault();
    setBookingSuccessMsg(
      `Appointment requested at ${selectedFacility.name}. A representative will contact you shortly with your sample collection details.`
    );
    setIsBookingModalOpen(false);
    setTimeout(() => setBookingSuccessMsg(null), 6000);
  };

  return (
    <div className="space-y-6">
      {/* Directory Title & Problem Vision Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-teal-50 text-teal-700 border border-teal-200">
                <Building className="w-5 h-5 text-teal-600" />
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900">
                {isHindi ? 'सत्यापित अस्पताल एवं प्रयोगशाला डायरेक्टरी' : 'Verified Hospital & Diagnostic Laboratory Directory'}
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {isHindi
                ? 'नजदीकी अस्पताल, NABL एक्रिडिटेड लैब खोजें और 20-30 किमी की दूरी तय करने से बचने के लिए होम सैंपल कलेक्शन बुक करें।'
                : 'Connect with NABH hospitals, NABL accredited diagnostic centers, and schedule home sample collection to avoid 20-30 km journeys.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              NABL & NABH Partner Verification System
            </span>
          </div>
        </div>

        {bookingSuccessMsg && (
          <div className="mt-4 p-3.5 bg-emerald-50 border border-emerald-300 rounded-2xl text-xs text-emerald-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold">{bookingSuccessMsg}</span>
            </div>
            <button
              onClick={() => setBookingSuccessMsg(null)}
              className="text-xs font-bold text-emerald-800 hover:underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Filter Controls Bar */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder={isHindi ? 'अस्पताल, टेस्ट या स्थान खोजें...' : 'Search facility, test, city...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="text-xs py-2 px-3 pl-8 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500 w-52 sm:w-64"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>

            {/* Type selector */}
            <select
              aria-label="Filter by facility type"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="text-xs p-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden font-medium text-slate-700"
            >
              <option value="All">All Facility Types</option>
              <option value="Hospital">Hospitals (NABH)</option>
              <option value="Diagnostic Lab">Diagnostic & Pathology Labs (NABL)</option>
              <option value="Specialist Clinic">Rural Outreach & Tele-clinics</option>
            </select>
          </div>

          {/* Verification & Service Checkboxes */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-700">
            <label className="flex items-center gap-1.5 cursor-pointer font-medium">
              <input
                type="checkbox"
                checked={onlyVerified}
                onChange={(e) => setOnlyVerified(e.target.checked)}
                className="rounded text-teal-600 focus:ring-teal-500 accent-teal-600"
              />
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Verified Partners Only
              </span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer font-medium">
              <input
                type="checkbox"
                checked={homeCollectionOnly}
                onChange={(e) => setHomeCollectionOnly(e.target.checked)}
                className="rounded text-teal-600 focus:ring-teal-500 accent-teal-600"
              />
              <span className="flex items-center gap-1 text-slate-800">
                <Truck className="w-3.5 h-3.5 text-teal-600" />
                Home Sample Pickup
              </span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer font-medium">
              <input
                type="checkbox"
                checked={emergencyOnly}
                onChange={(e) => setEmergencyOnly(e.target.checked)}
                className="rounded text-teal-600 focus:ring-teal-500 accent-teal-600"
              />
              <span className="text-red-700 font-semibold">24x7 Emergency</span>
            </label>
          </div>
        </div>
      </div>

      {/* Main Grid: Facilities Directory List (5 cols) + OpenStreetMap Interactive View (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Facilities List */}
        <div className="lg:col-span-5 space-y-3 max-h-[720px] overflow-y-auto pr-1">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1 flex items-center justify-between">
            <span>{filteredFacilities.length} Facilities Found</span>
            <span className="text-[11px] text-teal-700 font-semibold">Sorted by Proximity</span>
          </div>

          {filteredFacilities.map((fac) => {
            const isSelected = selectedFacility.id === fac.id;
            return (
              <div
                key={fac.id}
                onClick={() => setSelectedFacility(fac)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer relative ${
                  isSelected
                    ? 'bg-teal-50/90 border-teal-500 shadow-md ring-1 ring-teal-500'
                    : 'bg-white hover:bg-slate-50 border-slate-200'
                }`}
              >
                {/* Header: Verified Partner vs Public Listing */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  {fac.isVerifiedPartner ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-full border border-emerald-300">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      Verified Healthcare Partner
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-300">
                      <AlertCircle className="w-3 h-3 text-slate-400" />
                      Public Directory Listing
                    </span>
                  )}

                  <span className="text-xs font-bold font-mono text-teal-800 bg-white px-2 py-0.5 rounded border border-teal-200 shadow-2xs">
                    {fac.distanceKm} km
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-sm leading-snug">{fac.name}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{fac.address}</p>

                {/* Accreditations & Key Perks */}
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {fac.accreditations.map((acc, i) => (
                    <span key={i} className="text-[10px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                      {acc}
                    </span>
                  ))}
                  {fac.homeCollectionAvailable && (
                    <span className="text-[10px] font-semibold bg-cyan-50 text-cyan-800 px-2 py-0.5 rounded border border-cyan-200 flex items-center gap-1">
                      <Truck className="w-3 h-3 text-cyan-600" />
                      Home Pickup
                    </span>
                  )}
                  {fac.emergency24x7 && (
                    <span className="text-[10px] font-semibold bg-rose-50 text-rose-800 px-2 py-0.5 rounded border border-rose-200">
                      24x7 Emergency
                    </span>
                  )}
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-600">
                  <span className="flex items-center gap-1 font-mono text-[11px]">
                    <Phone className="w-3 h-3 text-teal-600" />
                    {fac.phone}
                  </span>
                  <span className="font-semibold text-teal-700">View Map & Services →</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: OpenStreetMap Visualizer & Facility Detail Panel (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden space-y-4 p-5">
          {/* Interactive OpenStreetMap Container */}
          <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 h-80 shadow-inner">
            {/* OpenStreetMap iframe with live tile navigation focused on Delhi NCR coordinates */}
            <iframe
              title="OpenStreetMap Healthcare Facilities Map"
              width="100%"
              height="100%"
              frameBorder="0"
              scrolling="no"
              marginHeight={0}
              marginWidth={0}
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${selectedFacility.longitude - 0.04}%2C${selectedFacility.latitude - 0.03}%2C${selectedFacility.longitude + 0.04}%2C${selectedFacility.latitude + 0.03}&layer=mapnik&marker=${selectedFacility.latitude}%2C${selectedFacility.longitude}`}
              className="w-full h-full border-none"
            />

            {/* Map Overlay Badge */}
            <div className="absolute top-3 left-3 bg-slate-900/90 text-white text-xs px-3 py-1.5 rounded-xl shadow-lg backdrop-blur-xs flex items-center gap-2 border border-slate-700">
              <MapPin className="w-3.5 h-3.5 text-teal-400 animate-bounce" />
              <span>
                <strong>{selectedFacility.name}</strong> ({selectedFacility.distanceKm} km away)
              </span>
            </div>

            <div className="absolute bottom-2 right-2 bg-white/90 text-[10px] text-slate-600 px-2 py-0.5 rounded shadow-xs">
              © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer" className="underline">OpenStreetMap</a> contributors
            </div>
          </div>

          {/* Selected Facility In-Depth Information */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900">{selectedFacility.name}</h2>
                  {selectedFacility.isVerifiedPartner ? (
                    <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                      Verified Partner
                    </span>
                  ) : (
                    <span className="text-[11px] font-medium text-slate-600 bg-slate-200 px-2 py-0.5 rounded-full">
                      Public Directory
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{selectedFacility.address}</p>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-500 block">Distance from Patient</span>
                <span className="text-lg font-black text-teal-700 font-mono">
                  {selectedFacility.distanceKm} km
                </span>
              </div>
            </div>

            {/* Operating Hours & Staff */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Hours</span>
                <span className="font-semibold text-slate-800">{selectedFacility.operatingHours}</span>
              </div>
              <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Contact</span>
                <a href={`tel:${selectedFacility.phone}`} className="font-semibold text-teal-700 hover:underline">
                  {selectedFacility.phone}
                </a>
              </div>
              <div className="p-2.5 bg-white rounded-xl border border-slate-200 col-span-2 sm:col-span-1">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Accreditation</span>
                <span className="font-bold text-slate-800">{selectedFacility.accreditations[0]}</span>
              </div>
            </div>

            {/* Available Diagnostic & Medical Services */}
            <div>
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Available Clinical & Diagnostic Services:
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-slate-700">
                {selectedFacility.availableServices.map((service, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-1.5 bg-white rounded-lg border border-slate-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <span className="truncate">{service}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons: Home Pickup / Appointment Booking */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-2">
              <a
                href={`https://www.openstreetmap.org/?mlat=${selectedFacility.latitude}&mlon=${selectedFacility.longitude}#map=16/${selectedFacility.latitude}/${selectedFacility.longitude}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 bg-white hover:bg-slate-100 rounded-xl border border-slate-200"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Open in OpenStreetMap</span>
              </a>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsBookingModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-xs transition-colors"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>
                    {selectedFacility.homeCollectionAvailable
                      ? (isHindi ? 'होम सैंपल पिकअप बुक करें' : 'Book Home Sample Pickup')
                      : (isHindi ? 'अपॉइंटमेंट बुक करें' : 'Book Appointment')}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Appointment / Home Pickup Booking Modal */}
      {isBookingModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Book Test / Sample Pickup at {selectedFacility.name}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Select your required tests and preferred time slot. A phlebotomist or clinical coordinator will be dispatched.
            </p>

            <form onSubmit={handleBookTest} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Required Diagnostic Tests:
                </label>
                <input
                  type="text"
                  defaultValue="Fasting Blood Sugar + HbA1c + Chest X-Ray"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Preferred Date:</label>
                  <input
                    type="date"
                    defaultValue="2026-11-04"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label htmlFor="pref-slot-select" className="block text-xs font-bold text-slate-700 mb-1">Preferred Slot:</label>
                  <select id="pref-slot-select" aria-label="Preferred Slot" className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white">
                    <option>07:00 AM - 09:00 AM (Fasting)</option>
                    <option>09:00 AM - 11:00 AM</option>
                    <option>02:00 PM - 04:00 PM</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Sample Pickup / Patient Address:
                </label>
                <textarea
                  rows={2}
                  defaultValue="House #42, Lane 3, Greater Kailash 1, New Delhi (Pin: 110048)"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-hidden"
                />
              </div>

              <div className="p-3 bg-teal-50 rounded-xl border border-teal-200 text-teal-900 text-xs flex items-center gap-2">
                <Truck className="w-4 h-4 text-teal-700 shrink-0" />
                <span>
                  NABL temperature-controlled cold chain transport will be utilized for biological specimens.
                </span>
              </div>

              <div className="mt-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsBookingModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-xs"
                >
                  Confirm Diagnostic Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
