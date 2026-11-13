export type UserRole = 'patient' | 'doctor' | 'pathologist' | 'lab_admin';

export type Language = 'en' | 'hi';

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  phone: string;
  avatarUrl: string;
  abhaId?: string; // Ayushman Bharat Health Account ID
  regNumber?: string; // For doctors/pathologists (NMC/MCI)
  specialty?: string;
  hospitalAffiliation?: string;
}

export interface PatientRecord {
  id: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  bloodGroup: string;
  abhaId: string;
  phone: string;
  emergencyContact: {
    name: string;
    relation: string;
    phone: string;
  };
  chronicConditions: string[];
  allergies: string[];
  currentMedications: string[];
  lastVisitDate: string;
}

export type ReportCategory =
  | 'Radiology'
  | 'Pathology'
  | 'Cardiology'
  | 'Biochemistry'
  | 'Hematology'
  | 'Dermatology';

export type ReportStatus =
  | 'Uploaded'
  | 'AI Analyzed'
  | 'Under Review'
  | 'Clinically Verified'
  | 'Needs Re-scan';

export interface LabParameter {
  name: string;
  value: number;
  unit: string;
  referenceRange: string;
  status: 'normal' | 'low' | 'high' | 'critical';
  description?: string;
}

export interface RegionOfInterest {
  label: string;
  location: string;
  box: [number, number, number, number]; // [ymin, xmin, ymax, xmax] in 0-1000 scale
  severity: 'normal' | 'low' | 'moderate' | 'urgent';
}

export interface MedicalImageAnalysis {
  primaryFinding: string;
  anatomicalRegion: string;
  confidenceScore: number; // 0 - 100
  severity: 'normal' | 'low' | 'moderate' | 'urgent';
  preliminaryObservations: string;
  findingsList: string[];
  regionsOfInterest: RegionOfInterest[];
  technicalQuality: 'diagnostic_quality' | 'suboptimal' | 'uninterpretable';
  statedLimitations: string[];
  recommendedNextSteps: string[];
  medicalDisclaimer: string;
  analyzedAt: string;
  reviewedBy?: {
    doctorName: string;
    regNumber: string;
    clinicalImpression: string;
    reviewedAt: string;
    verificationStatus: 'confirmed' | 'modified' | 'rejected';
  };
}

export interface MedicalReport {
  id: string;
  patientId: string;
  patientName: string;
  title: string;
  category: ReportCategory;
  testDate: string;
  uploadedAt: string;
  laboratoryName: string;
  isVerifiedLab: boolean;
  status: ReportStatus;
  fileUrl?: string;
  imageUrl?: string;
  imageType?: string;
  labParameters?: LabParameter[];
  aiAnalysis?: MedicalImageAnalysis;
  doctorConsentGranted: boolean;
  allowedDoctors: string[];
  clinicalNotes?: string;
}

export interface MedicalDevice {
  id: string;
  name: string;
  type: 'pulse_oximeter' | 'bp_monitor' | 'glucometer' | 'spirometer' | 'ecg_patch';
  manufacturer: string;
  model: string;
  serialNumber: string;
  regulatoryStatus: 'CDSCO Approved' | 'FDA Cleared' | 'CE Certified';
  connectivity: 'Bluetooth 5.2 BLE' | 'USB WebHID' | 'Cloud Sync';
  batteryLevel: number;
  isConnected: boolean;
  lastSyncTime: string;
  currentReading: {
    primaryValue: string | number;
    primaryUnit: string;
    secondaryValue?: string | number;
    secondaryUnit?: string;
    waveformType?: 'ppg' | 'ecg' | 'spirometry';
    status: 'normal' | 'warning' | 'alert';
    recordedAt: string;
  };
  historicalReadings: Array<{
    timestamp: string;
    value: string | number;
    secondary?: string | number;
  }>;
}

export interface HealthcareFacility {
  id: string;
  name: string;
  type: 'Hospital' | 'Diagnostic Lab' | 'Pathology Center' | 'Specialist Clinic';
  isVerifiedPartner: boolean;
  accreditations: string[]; // NABH, NABL, JCI, ISO
  rating: number;
  reviewCount: number;
  distanceKm: number;
  address: string;
  city: string;
  state: string;
  phone: string;
  emergency24x7: boolean;
  homeCollectionAvailable: boolean;
  availableServices: string[];
  operatingHours: string;
  latitude: number;
  longitude: number;
  doctorCount: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  emergencyAlert?: boolean;
}
