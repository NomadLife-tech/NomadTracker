// Default allowed days for common visa types
// This maps visa type patterns to their typical duration limits

export const VISA_TYPE_DEFAULTS: { [pattern: string]: number } = {
  // Visa Free entries
  'Visa Free (180 days)': 180,
  'Visa Free (90 days)': 90,
  'Visa Free (30 days)': 30,
  'Visa Free (60 days)': 60,
  'Visa Free (120 days)': 120,
  'Visa Free (365 days)': 365,
  
  // Schengen
  'Schengen C (Short Stay)': 90,
  'Schengen Required': 90,
  
  // e-Visas and VOA
  'e-Visa': 30,
  'e-Visa (30 days)': 30,
  'e-Visa (90 days)': 90,
  'eVisa (14 days)': 14,
  'Visa on Arrival': 30,
  'Visa on Arrival (30 days)': 30,
  'Visa on Arrival (60 days)': 60,
  
  // Tourist Visas
  'Tourist Visa': 30,
  'Tourist Visa (T)': 30,
  'Tourist Visa (TR)': 60,
  'Tourist Card (30 days)': 30,
  'Visitor Visa (TRV)': 180,
  'Visitor (600)': 90,
  
  // Short Stay
  'Type C (Short Stay)': 90,
  'Short Stay Visa': 90,
  
  // Long Stay / Work / Student
  'Type D (Long Stay)': 365,
  'National D Visa': 365,
  'Work Visa': 365,
  'Work Permit': 365,
  'Student Visa': 365,
  'Study Permit': 365,
  'Employment Pass': 365,
  'EU Blue Card': 365,
  
  // Digital Nomad / Remote Work
  'Digital Nomad Visa': 365,
  'Remote Working Visa': 365,
  'Remotely from Georgia': 365,
  'DE Rantau (Nomad)': 365,
  'Nomad Residence Permit': 365,
  'DTV (Nomad)': 180,
  
  // Business
  'Business Visa': 30,
  'Business Visa (E)': 90,
  'M Visa (Business)': 30,
  
  // Transit
  'Transit Visa': 7,
  'Transit Visa (G)': 7,
  
  // Special Programs
  'ESTA (VWP)': 90,
  'eTA': 180,
  'ETA (601)': 90,
  'eVisitor (651)': 90,
  'K-ETA': 90,
  'NZeTA': 90,
  'Working Holiday (417)': 365,
  'Working Holiday': 365,
  'Welcome Stamp (12 months)': 365,
  'Elite Visa': 365,
  'LTR Visa': 365,
  'Golden Visa': 365,
  'Premium Visa (12 months)': 365,
  'Second Home Visa': 365,
  'Retirement Visa': 365,
  
  // Long-term / Residence
  'Residence Permit': 365,
  'Temporary Residence': 365,
  'Permanent Resident': 365,
  
  // Specific country visas
  'B1/B2 (Tourist/Business)': 180,
  'F-1 (Student)': 365,
  'H-1B (Work)': 365,
  'L-1 (Transfer)': 365,
  'O-1 (Extraordinary)': 365,
  'L Visa (Tourist)': 30,
  'Z Visa (Work)': 365,
  'X Visa (Student)': 365,
  'Visa Exempt (30/45 days)': 45,
  'Non-Immigrant B': 90,
  'B211A (60 days)': 60,
  'KITAS (Work)': 365,
  
  // Default for Custom
  'Custom': 90,
};

// Get default allowed days for a visa type
export function getDefaultAllowedDays(visaType: string): number {
  // Check exact match first
  if (VISA_TYPE_DEFAULTS[visaType]) {
    return VISA_TYPE_DEFAULTS[visaType];
  }
  
  // Check for partial matches
  const lowerType = visaType.toLowerCase();
  
  // Extract days from pattern like "Visa Free (X days)" or "e-Visa (X days)"
  const daysMatch = visaType.match(/\((\d+)\s*days?\)/i);
  if (daysMatch) {
    return parseInt(daysMatch[1]);
  }
  
  // Extract months pattern
  const monthsMatch = visaType.match(/\((\d+)\s*months?\)/i);
  if (monthsMatch) {
    return parseInt(monthsMatch[1]) * 30;
  }
  
  // Pattern-based defaults
  if (lowerType.includes('visa free') || lowerType.includes('visa exempt')) return 90;
  if (lowerType.includes('transit')) return 7;
  if (lowerType.includes('tourist') || lowerType.includes('visitor')) return 30;
  if (lowerType.includes('business')) return 30;
  if (lowerType.includes('work') || lowerType.includes('employment')) return 365;
  if (lowerType.includes('student') || lowerType.includes('study')) return 365;
  if (lowerType.includes('residence') || lowerType.includes('resident')) return 365;
  if (lowerType.includes('nomad') || lowerType.includes('remote')) return 365;
  if (lowerType.includes('schengen')) return 90;
  if (lowerType.includes('long stay') || lowerType.includes('type d')) return 365;
  if (lowerType.includes('short stay') || lowerType.includes('type c')) return 90;
  if (lowerType.includes('e-visa') || lowerType.includes('evisa')) return 30;
  if (lowerType.includes('eta') || lowerType.includes('esta')) return 90;
  
  // Default fallback
  return 90;
}

// Check if visa type is custom (user can edit allowed days)
export function isCustomVisaType(visaType: string): boolean {
  return visaType === 'Custom';
}

// The custom visa type option to add to all countries
export const CUSTOM_VISA_TYPE = 'Custom';
