import { Country } from '../types';

export const SCHENGEN_COUNTRIES = [
  'AT', 'BE', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU',
  'IS', 'IT', 'LV', 'LI', 'LT', 'LU', 'MT', 'NL', 'NO', 'PL',
  'PT', 'SK', 'SI', 'ES', 'SE', 'CH', 'HR', 'BG'
];

export const COUNTRIES: Country[] = [
  { code: 'AF', name: 'Afghanistan', flag: '🇦🇫', visaTypes: ['Tourist Visa', 'Business Visa', 'Work Visa', 'Transit Visa'] },
  { code: 'AL', name: 'Albania', flag: '🇦🇱', visaTypes: ['Visa Free (90 days)', 'Type C (Short Stay)', 'Type D (Long Stay)', 'Work Permit'] },
  { code: 'DZ', name: 'Algeria', flag: '🇩🇿', visaTypes: ['Tourist Visa', 'Business Visa', 'Work Visa', 'Transit Visa', 'Family Visa'] },
  { code: 'AD', name: 'Andorra', flag: '🇦🇩', visaTypes: ['Schengen Required', 'Residence Permit', 'Work Permit'] },
  { code: 'AO', name: 'Angola', flag: '🇦🇴', visaTypes: ['Tourist Visa', 'Business Visa', 'Work Visa', 'Transit Visa', 'Ordinary Visa'] },
  { code: 'AG', name: 'Antigua and Barbuda', flag: '🇦🇬', visaTypes: ['Visa Free (180 days)', 'Work Permit', 'Student Visa', 'Residence Permit'] },
  { code: 'AR', name: 'Argentina', flag: '🇦🇷', visaTypes: ['Visa Free (90 days)', 'Tourist Visa', 'Work Visa (Subclass 23A)', 'Student Visa', 'Rentista Visa'] },
  { code: 'AM', name: 'Armenia', flag: '🇦🇲', visaTypes: ['Visa Free (180 days)', 'e-Visa', 'Work Permit', 'Residence Permit'] },
  { code: 'AU', name: 'Australia', flag: '🇦🇺', visaTypes: ['ETA (601)', 'eVisitor (651)', 'Visitor (600)', 'Working Holiday (417)', 'Skilled Worker (482)', 'Student (500)'] },
  { code: 'AT', name: 'Austria', flag: '🇦🇹', visaTypes: ['Schengen C (Short Stay)', 'National D Visa', 'Red-White-Red Card', 'EU Blue Card', 'Student Visa'], isSchengen: true },
  { code: 'AZ', name: 'Azerbaijan', flag: '🇦🇿', visaTypes: ['e-Visa (30 days)', 'Tourist Visa', 'Business Visa', 'Work Permit', 'ASAN Visa'] },
  { code: 'BS', name: 'Bahamas', flag: '🇧🇸', visaTypes: ['Visa Free (90 days)', 'Work Permit', 'Residence Permit', 'Student Permit'] },
  { code: 'BH', name: 'Bahrain', flag: '🇧🇭', visaTypes: ['eVisa (14 days)', 'Tourist Visa', 'Business Visa', 'Work Visa', 'GCC Resident Entry'] },
  { code: 'BD', name: 'Bangladesh', flag: '🇧🇩', visaTypes: ['Visa on Arrival', 'Tourist Visa', 'Business Visa', 'Work Permit', 'Student Visa'] },
  { code: 'BB', name: 'Barbados', flag: '🇧🇧', visaTypes: ['Visa Free (180 days)', 'Welcome Stamp (12 months)', 'Work Permit', 'Student Visa'] },
  { code: 'BY', name: 'Belarus', flag: '🇧🇾', visaTypes: ['Visa Free (30 days)', 'Tourist Visa', 'Business Visa', 'Work Permit', 'Transit Visa'] },
  { code: 'BE', name: 'Belgium', flag: '🇧🇪', visaTypes: ['Schengen C (Short Stay)', 'National D Visa', 'Work Permit B', 'EU Blue Card', 'Student Visa'], isSchengen: true },
  { code: 'BZ', name: 'Belize', flag: '🇧🇿', visaTypes: ['Visa Free (30 days)', 'Tourist Visa', 'Work Permit', 'QRP (Retirement)'] },
  { code: 'BJ', name: 'Benin', flag: '🇧🇯', visaTypes: ['e-Visa', 'Tourist Visa', 'Business Visa', 'Transit Visa'] },
  { code: 'BT', name: 'Bhutan', flag: '🇧🇹', visaTypes: ['Tourist Visa (SDF Required)', 'Business Visa', 'Work Permit', 'Student Visa'] },
  { code: 'BO', name: 'Bolivia', flag: '🇧🇴', visaTypes: ['Visa Free (90 days)', 'Tourist Visa', 'Work Visa', 'Specific Purpose Visa'] },
  { code: 'BA', name: 'Bosnia and Herzegovina', flag: '🇧🇦', visaTypes: ['Visa Free (90 days)', 'Type C (Short Stay)', 'Type D (Long Stay)', 'Work Permit'] },
  { code: 'BW', name: 'Botswana', flag: '🇧🇼', visaTypes: ['Visa Free (90 days)', 'Tourist Visa', 'Business Visa', 'Work Permit', 'Student Permit'] },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷', visaTypes: ['Visa Free (90 days)', 'VIVIS (Tourist)', 'VITEM II (Business)', 'VITEM V (Work)', 'Digital Nomad Visa'] },
  { code: 'BN', name: 'Brunei', flag: '🇧🇳', visaTypes: ['Visa Free (90 days)', 'Tourist Visa', 'Business Visa', 'Employment Pass', 'Student Pass'] },
  { code: 'BG', name: 'Bulgaria', flag: '🇧🇬', visaTypes: ['Schengen C (Short Stay)', 'Type D (Long Stay)', 'Work Permit', 'EU Blue Card', 'Freelance Visa'], isSchengen: true },
  { code: 'BF', name: 'Burkina Faso', flag: '🇧🇫', visaTypes: ['Tourist Visa', 'Business Visa', 'Work Visa', 'Transit Visa'] },
  { code: 'BI', name: 'Burundi', flag: '🇧🇮', visaTypes: ['Visa on Arrival', 'Tourist Visa', 'Business Visa', 'Transit Visa'] },
  { code: 'CV', name: 'Cabo Verde', flag: '🇨🇻', visaTypes: ['Visa on Arrival', 'Tourist Visa', 'Business Visa', 'Work Permit', 'Remote Working Visa'] },
  { code: 'KH', name: 'Cambodia', flag: '🇰🇭', visaTypes: ['Visa on Arrival (30 days)', 'e-Visa', 'Tourist Visa (T)', 'Business Visa (E)', 'Long Stay ER Visa'] },
  { code: 'CM', name: 'Cameroon', flag: '🇨🇲', visaTypes: ['Tourist Visa', 'Business Visa', 'Work Visa', 'Transit Visa', 'Student Visa'] },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', visaTypes: ['eTA', 'Visitor Visa (TRV)', 'Work Permit', 'Study Permit', 'Super Visa', 'Express Entry'] },
  { code: 'CF', name: 'Central African Republic', flag: '🇨🇫', visaTypes: ['Tourist Visa', 'Business Visa', 'Work Visa', 'Transit Visa'] },
  { code: 'TD', name: 'Chad', flag: '🇹🇩', visaTypes: ['Tourist Visa', 'Business Visa', 'Work Visa', 'Transit Visa'] },
  { code: 'CL', name: 'Chile', flag: '🇨🇱', visaTypes: ['Visa Free (90 days)', 'Tourist Visa', 'Work Visa', 'Student Visa', 'Temporary Residence'] },
  { code: 'CN', name: 'China', flag: '🇨🇳', visaTypes: ['L Visa (Tourist)', 'M Visa (Business)', 'Z Visa (Work)', 'X Visa (Student)', 'Transit Visa (G)', 'F Visa (Non-Commercial)'] },
  { code: 'CO', name: 'Colombia', flag: '🇨🇴', visaTypes: ['Visa Free (90 days)', 'V Visa (Visitor)', 'M Visa (Migrant)', 'R Visa (Resident)', 'Digital Nomad Visa'] },
  { code: 'KM', name: 'Comoros', flag: '🇰🇲', visaTypes: ['Visa on Arrival', 'Tourist Visa', 'Business Visa'] },
  { code: 'CG', name: 'Congo', flag: '🇨🇬', visaTypes: ['Tourist Visa', 'Business Visa', 'Work Visa', 'Transit Visa'] },
  { code: 'CD', name: 'Congo (DRC)', flag: '🇨🇩', visaTypes: ['Tourist Visa', 'Business Visa', 'Work Visa', 'Transit Visa'] },
  { code: 'CR', name: 'Costa Rica', flag: '🇨🇷', visaTypes: ['Visa Free (90 days)', 'Tourist Visa', 'Rentista Visa', 'Pensionado Visa', 'Digital Nomad Visa'] },
  { code: 'CI', name: "Côte d'Ivoire", flag: '🇨🇮', visaTypes: ['e-Visa', 'Tourist Visa', 'Business Visa', 'Work Permit'] },
  { code: 'HR', name: 'Croatia', flag: '🇭🇷', visaTypes: ['Schengen C (Short Stay)', 'National D Visa', 'Work Permit', 'Digital Nomad Visa', 'EU Blue Card'], isSchengen: true },
  { code: 'CU', name: 'Cuba', flag: '🇨🇺', visaTypes: ['Tourist Card (30 days)', 'Business Visa', 'Work Visa', 'Student Visa', 'Family Visa'] },
  { code: 'CY', name: 'Cyprus', flag: '🇨🇾', visaTypes: ['Visa Free (90 days)', 'National Visa', 'Work Permit', 'Student Visa', 'Pink Slip'] },
  { code: 'CZ', name: 'Czech Republic', flag: '🇨🇿', visaTypes: ['Schengen C (Short Stay)', 'National D Visa', 'Employee Card', 'EU Blue Card', 'Zivno (Freelance)'], isSchengen: true },
  { code: 'DK', name: 'Denmark', flag: '🇩🇰', visaTypes: ['Schengen C (Short Stay)', 'National D Visa', 'Work Permit', 'Pay Limit Scheme', 'Startup Denmark'], isSchengen: true },
  { code: 'DJ', name: 'Djibouti', flag: '🇩🇯', visaTypes: ['e-Visa', 'Visa on Arrival', 'Tourist Visa', 'Business Visa'] },
  { code: 'DM', name: 'Dominica', flag: '🇩🇲', visaTypes: ['Visa Free (180 days)', 'Work Permit', 'Extended Stay Visa'] },
  { code: 'DO', name: 'Dominican Republic', flag: '🇩🇴', visaTypes: ['Tourist Card (30 days)', 'Business Visa', 'Work Visa', 'Residence Visa'] },
  { code: 'EC', name: 'Ecuador', flag: '🇪🇨', visaTypes: ['Visa Free (90 days)', 'Tourist Visa (12V)', 'Work Visa', 'Rentista Visa', 'Digital Nomad Visa'] },
  { code: 'EG', name: 'Egypt', flag: '🇪🇬', visaTypes: ['e-Visa', 'Visa on Arrival', 'Tourist Visa', 'Business Visa', 'Work Visa'] },
  { code: 'SV', name: 'El Salvador', flag: '🇸🇻', visaTypes: ['Visa Free (90 days)', 'Tourist Visa', 'Work Permit', 'Residence Visa'] },
  { code: 'GQ', name: 'Equatorial Guinea', flag: '🇬🇶', visaTypes: ['Tourist Visa', 'Business Visa', 'Work Visa', 'Transit Visa'] },
  { code: 'ER', name: 'Eritrea', flag: '🇪🇷', visaTypes: ['Tourist Visa', 'Business Visa', 'Transit Visa'] },
  { code: 'EE', name: 'Estonia', flag: '🇪🇪', visaTypes: ['Schengen C (Short Stay)', 'National D Visa', 'Digital Nomad Visa', 'Startup Visa', 'EU Blue Card'], isSchengen: true },
  { code: 'SZ', name: 'Eswatini', flag: '🇸🇿', visaTypes: ['Visa Free (30 days)', 'Tourist Visa', 'Business Visa', 'Work Permit'] },
  { code: 'ET', name: 'Ethiopia', flag: '🇪🇹', visaTypes: ['e-Visa', 'Visa on Arrival', 'Tourist Visa', 'Business Visa', 'Work Permit'] },
  { code: 'FJ', name: 'Fiji', flag: '🇫🇯', visaTypes: ['Visa Free (120 days)', 'Visitor Permit', 'Work Permit', 'Student Permit'] },
  { code: 'FI', name: 'Finland', flag: '🇫🇮', visaTypes: ['Schengen C (Short Stay)', 'National D Visa', 'Work Permit', 'Startup Permit', 'EU Blue Card'], isSchengen: true },
  { code: 'FR', name: 'France', flag: '🇫🇷', visaTypes: ['Schengen C (Short Stay)', 'VLS-TS (Long Stay)', 'Talent Passport', 'Student Visa', 'Working Holiday'], isSchengen: true },
  { code: 'GA', name: 'Gabon', flag: '🇬🇦', visaTypes: ['e-Visa', 'Tourist Visa', 'Business Visa', 'Work Visa'] },
  { code: 'GM', name: 'Gambia', flag: '🇬🇲', visaTypes: ['Visa Free (90 days)', 'Tourist Visa', 'Business Visa', 'Work Permit'] },
  { code: 'GE', name: 'Georgia', flag: '🇬🇪', visaTypes: ['Visa Free (365 days)', 'Work Permit', 'Residence Permit', 'Remotely from Georgia'] },
  { code: 'DE', name: 'Germany', flag: '🇩🇪', visaTypes: ['Schengen C (Short Stay)', 'National D Visa', 'Freelance Visa', 'Job Seeker Visa', 'EU Blue Card'], isSchengen: true },
  { code: 'GH', name: 'Ghana', flag: '🇬🇭', visaTypes: ['Tourist Visa', 'Business Visa', 'Work Permit', 'Right of Abode'] },
  { code: 'GR', name: 'Greece', flag: '🇬🇷', visaTypes: ['Schengen C (Short Stay)', 'National D Visa', 'Work Permit', 'Digital Nomad Visa', 'Golden Visa'], isSchengen: true },
  { code: 'GD', name: 'Grenada', flag: '🇬🇩', visaTypes: ['Visa Free (90 days)', 'Work Permit', 'Student Visa'] },
  { code: 'GT', name: 'Guatemala', flag: '🇬🇹', visaTypes: ['Visa Free (90 days)', 'Tourist Visa', 'Work Visa', 'Residence Visa'] },
  { code: 'GN', name: 'Guinea', flag: '🇬🇳', visaTypes: ['Tourist Visa', 'Business Visa', 'Work Visa', 'Transit Visa'] },
  { code: 'GW', name: 'Guinea-Bissau', flag: '🇬🇼', visaTypes: ['Visa on Arrival', 'Tourist Visa', 'Business Visa'] },
  { code: 'GY', name: 'Guyana', flag: '🇬🇾', visaTypes: ['Visa Free (90 days)', 'Tourist Visa', 'Work Permit'] },
  { code: 'HT', name: 'Haiti', flag: '🇭🇹', visaTypes: ['Visa Free (90 days)', 'Tourist Visa', 'Business Visa', 'Work Permit'] },
  { code: 'HN', name: 'Honduras', flag: '🇭🇳', visaTypes: ['Visa Free (90 days)', 'Tourist Visa', 'Work Permit', 'Residence Visa'] },
  { code: 'HU', name: 'Hungary', flag: '🇭🇺', visaTypes: ['Schengen C (Short Stay)', 'National D Visa', 'Work Permit', 'White Card (Digital Nomad)', 'EU Blue Card'], isSchengen: true },
  { code: 'IS', name: 'Iceland', flag: '🇮🇸', visaTypes: ['Schengen C (Short Stay)', 'National D Visa', 'Work Permit', 'Digital Nomad Visa'], isSchengen: true },
  { code: 'IN', name: 'India', flag: '🇮🇳', visaTypes: ['e-Visa (Tourist)', 'e-Visa (Business)', 'Employment Visa', 'Student Visa', 'Conference Visa', 'Medical Visa'] },
  { code: 'ID', name: 'Indonesia', flag: '🇮🇩', visaTypes: ['Visa Free (30 days)', 'Visa on Arrival (30 days)', 'B211A (60 days)', 'KITAS (Work)', 'Second Home Visa'] },
  { code: 'IR', name: 'Iran', flag: '🇮🇷', visaTypes: ['Visa on Arrival (30 days)', 'Tourist Visa', 'Business Visa', 'Work Visa', 'Transit Visa'] },
  { code: 'IQ', name: 'Iraq', flag: '🇮🇶', visaTypes: ['Tourist Visa', 'Business Visa', 'Work Visa', 'Transit Visa'] },
  { code: 'IE', name: 'Ireland', flag: '🇮🇪', visaTypes: ['Visa Free (90 days)', 'Short Stay Visa', 'Employment Permit', 'Stamp 1G', 'Startup Entrepreneur'] },
  { code: 'IL', name: 'Israel', flag: '🇮🇱', visaTypes: ['Visa Free (90 days)', 'B/1 (Work)', 'A/2 (Student)', 'Digital Nomad Visa'] },
  { code: 'IT', name: 'Italy', flag: '🇮🇹', visaTypes: ['Schengen C (Short Stay)', 'National D Visa', 'Elective Residence', 'Digital Nomad Visa', 'EU Blue Card'], isSchengen: true },
  { code: 'JM', name: 'Jamaica', flag: '🇯🇲', visaTypes: ['Visa Free (90 days)', 'Work Permit', 'Student Visa'] },
  { code: 'JP', name: 'Japan', flag: '🇯🇵', visaTypes: ['Visa Free (90 days)', 'Tourist Visa', 'Work Visa', 'Student Visa', 'Working Holiday', 'Highly Skilled Professional'] },
  { code: 'JO', name: 'Jordan', flag: '🇯🇴', visaTypes: ['Visa on Arrival', 'Tourist Visa', 'Business Visa', 'Work Permit', 'Jordan Pass'] },
  { code: 'KZ', name: 'Kazakhstan', flag: '🇰🇿', visaTypes: ['Visa Free (30 days)', 'e-Visa', 'Tourist Visa', 'Business Visa', 'Work Permit'] },
  { code: 'KE', name: 'Kenya', flag: '🇰🇪', visaTypes: ['eTA', 'Single Entry Visa', 'Transit Visa', 'Work Permit', 'Student Pass'] },
  { code: 'KI', name: 'Kiribati', flag: '🇰🇮', visaTypes: ['Visa on Arrival', 'Tourist Visa', 'Business Visa'] },
  { code: 'KP', name: 'North Korea', flag: '🇰🇵', visaTypes: ['Tourist Visa (Group Tour)', 'Business Visa'] },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷', visaTypes: ['K-ETA', 'Visa Free (90 days)', 'C-3 (Tourist)', 'D-8 (Business)', 'E-7 (Work)', 'F-1 (Visiting)'] },
  { code: 'KW', name: 'Kuwait', flag: '🇰🇼', visaTypes: ['e-Visa', 'Tourist Visa', 'Business Visa', 'Work Visa', 'Family Visa'] },
  { code: 'KG', name: 'Kyrgyzstan', flag: '🇰🇬', visaTypes: ['Visa Free (60 days)', 'Tourist Visa', 'Business Visa', 'Work Permit'] },
  { code: 'LA', name: 'Laos', flag: '🇱🇦', visaTypes: ['Visa on Arrival (30 days)', 'e-Visa', 'Tourist Visa', 'Business Visa', 'Work Permit'] },
  { code: 'LV', name: 'Latvia', flag: '🇱🇻', visaTypes: ['Schengen C (Short Stay)', 'National D Visa', 'Work Permit', 'Startup Visa', 'EU Blue Card'], isSchengen: true },
  { code: 'LB', name: 'Lebanon', flag: '🇱🇧', visaTypes: ['Visa on Arrival', 'Tourist Visa', 'Business Visa', 'Work Visa'] },
  { code: 'LS', name: 'Lesotho', flag: '🇱🇸', visaTypes: ['Visa Free (30 days)', 'Tourist Visa', 'Work Permit'] },
  { code: 'LR', name: 'Liberia', flag: '🇱🇷', visaTypes: ['Visa on Arrival', 'Tourist Visa', 'Business Visa', 'Work Permit'] },
  { code: 'LY', name: 'Libya', flag: '🇱🇾', visaTypes: ['Tourist Visa', 'Business Visa', 'Work Visa'] },
  { code: 'LI', name: 'Liechtenstein', flag: '🇱🇮', visaTypes: ['Schengen C (Short Stay)', 'Residence Permit', 'Work Permit'], isSchengen: true },
  { code: 'LT', name: 'Lithuania', flag: '🇱🇹', visaTypes: ['Schengen C (Short Stay)', 'National D Visa', 'Work Permit', 'Startup Visa', 'EU Blue Card'], isSchengen: true },
  { code: 'LU', name: 'Luxembourg', flag: '🇱🇺', visaTypes: ['Schengen C (Short Stay)', 'National D Visa', 'Work Permit', 'EU Blue Card'], isSchengen: true },
  { code: 'MG', name: 'Madagascar', flag: '🇲🇬', visaTypes: ['Visa on Arrival (30 days)', 'Tourist Visa', 'Business Visa', 'Work Permit'] },
  { code: 'MW', name: 'Malawi', flag: '🇲🇼', visaTypes: ['e-Visa', 'Tourist Visa', 'Business Visa', 'Work Permit'] },
  { code: 'MY', name: 'Malaysia', flag: '🇲🇾', visaTypes: ['Visa Free (90 days)', 'eNTRI', 'Social Visit Pass', 'Employment Pass', 'MM2H', 'DE Rantau (Nomad)'] },
  { code: 'MV', name: 'Maldives', flag: '🇲🇻', visaTypes: ['Visa on Arrival (30 days)', 'Tourist Visa', 'Work Visa', 'Business Visa'] },
  { code: 'ML', name: 'Mali', flag: '🇲🇱', visaTypes: ['Tourist Visa', 'Business Visa', 'Work Visa', 'Transit Visa'] },
  { code: 'MT', name: 'Malta', flag: '🇲🇹', visaTypes: ['Schengen C (Short Stay)', 'National D Visa', 'Nomad Residence Permit', 'Work Permit', 'EU Blue Card'], isSchengen: true },
  { code: 'MH', name: 'Marshall Islands', flag: '🇲🇭', visaTypes: ['Visa Free (90 days)', 'Tourist Visa', 'Business Visa'] },
  { code: 'MR', name: 'Mauritania', flag: '🇲🇷', visaTypes: ['Visa on Arrival', 'Tourist Visa', 'Business Visa'] },
  { code: 'MU', name: 'Mauritius', flag: '🇲🇺', visaTypes: ['Visa Free (90 days)', 'Premium Visa (12 months)', 'Occupation Permit', 'Student Visa'] },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽', visaTypes: ['Visa Free (180 days)', 'FMM (Tourist)', 'Temporary Resident', 'Permanent Resident', 'Work Visa'] },
  { code: 'FM', name: 'Micronesia', flag: '🇫🇲', visaTypes: ['Visa Free (30 days)', 'Tourist Entry Permit'] },
  { code: 'MD', name: 'Moldova', flag: '🇲🇩', visaTypes: ['Visa Free (90 days)', 'Tourist Visa', 'Work Permit', 'IT Park Visa'] },
  { code: 'MC', name: 'Monaco', flag: '🇲🇨', visaTypes: ['Schengen Required', 'Residence Card', 'Work Permit'] },
  { code: 'MN', name: 'Mongolia', flag: '🇲🇳', visaTypes: ['Visa Free (30 days)', 'Tourist Visa', 'Business Visa', 'Work Permit'] },
  { code: 'ME', name: 'Montenegro', flag: '🇲🇪', visaTypes: ['Visa Free (90 days)', 'Type C (Short Stay)', 'Type D (Long Stay)', 'Digital Nomad Permit'] },
  { code: 'MA', name: 'Morocco', flag: '🇲🇦', visaTypes: ['Visa Free (90 days)', 'Tourist Visa', 'Work Visa', 'Student Visa'] },
  { code: 'MZ', name: 'Mozambique', flag: '🇲🇿', visaTypes: ['Visa on Arrival', 'Tourist Visa', 'Business Visa', 'Work Visa'] },
  { code: 'MM', name: 'Myanmar', flag: '🇲🇲', visaTypes: ['e-Visa', 'Tourist Visa', 'Business Visa', 'Social Visa'] },
  { code: 'NA', name: 'Namibia', flag: '🇳🇦', visaTypes: ['Visa Free (90 days)', 'Tourist Visa', 'Work Permit', 'Study Permit'] },
  { code: 'NR', name: 'Nauru', flag: '🇳🇷', visaTypes: ['Visa Required', 'Tourist Visa', 'Business Visa'] },
  { code: 'NP', name: 'Nepal', flag: '🇳🇵', visaTypes: ['Visa on Arrival (15/30/90 days)', 'Tourist Visa', 'Business Visa', 'Work Permit', 'Study Visa'] },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱', visaTypes: ['Schengen C (Short Stay)', 'MVV (Long Stay)', 'Work Permit (TWV)', 'Highly Skilled Migrant', 'Startup Visa'], isSchengen: true },
  { code: 'NZ', name: 'New Zealand', flag: '🇳🇿', visaTypes: ['NZeTA', 'Visitor Visa', 'Working Holiday', 'Essential Skills Work', 'Student Visa'] },
  { code: 'NI', name: 'Nicaragua', flag: '🇳🇮', visaTypes: ['Visa Free (90 days)', 'Tourist Visa', 'Work Permit', 'Residence Visa'] },
  { code: 'NE', name: 'Niger', flag: '🇳🇪', visaTypes: ['Tourist Visa', 'Business Visa', 'Work Visa'] },
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬', visaTypes: ['e-Visa', 'Tourist Visa', 'Business Visa', 'Work Permit (STR)', 'Temporary Work Permit'] },
  { code: 'MK', name: 'North Macedonia', flag: '🇲🇰', visaTypes: ['Visa Free (90 days)', 'Type C (Short Stay)', 'Type D (Long Stay)', 'Work Permit'] },
  { code: 'NO', name: 'Norway', flag: '🇳🇴', visaTypes: ['Schengen C (Short Stay)', 'National D Visa', 'Skilled Worker Visa', 'Startup Visa'], isSchengen: true },
  { code: 'OM', name: 'Oman', flag: '🇴🇲', visaTypes: ['e-Visa', 'Tourist Visa', 'Business Visa', 'Work Visa', 'Express Visa'] },
  { code: 'PK', name: 'Pakistan', flag: '🇵🇰', visaTypes: ['e-Visa', 'Tourist Visa', 'Business Visa', 'Work Visa', 'Student Visa'] },
  { code: 'PW', name: 'Palau', flag: '🇵🇼', visaTypes: ['Visa on Arrival (30 days)', 'Tourist Visa', 'Work Permit'] },
  { code: 'PS', name: 'Palestine', flag: '🇵🇸', visaTypes: ['Israeli Permit Required', 'Tourist Permit', 'Business Permit'] },
  { code: 'PA', name: 'Panama', flag: '🇵🇦', visaTypes: ['Visa Free (180 days)', 'Tourist Visa', 'Friendly Nations Visa', 'Pensionado Visa', 'Digital Nomad Visa'] },
  { code: 'PG', name: 'Papua New Guinea', flag: '🇵🇬', visaTypes: ['Visa on Arrival (60 days)', 'Tourist Visa', 'Business Visa', 'Work Permit'] },
  { code: 'PY', name: 'Paraguay', flag: '🇵🇾', visaTypes: ['Visa Free (90 days)', 'Tourist Visa', 'Work Visa', 'Residence Visa'] },
  { code: 'PE', name: 'Peru', flag: '🇵🇪', visaTypes: ['Visa Free (183 days)', 'Tourist Visa', 'Work Visa', 'Student Visa', 'Digital Nomad Visa'] },
  { code: 'PH', name: 'Philippines', flag: '🇵🇭', visaTypes: ['Visa Free (30 days)', 'Tourist Visa (59 days)', '9(g) Work Visa', 'SRRV (Retirement)', 'Student Visa'] },
  { code: 'PL', name: 'Poland', flag: '🇵🇱', visaTypes: ['Schengen C (Short Stay)', 'National D Visa', 'Work Permit', 'EU Blue Card', 'Poland Business Harbour'], isSchengen: true },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹', visaTypes: ['Schengen C (Short Stay)', 'National D Visa', 'D7 (Passive Income)', 'Tech Visa', 'Golden Visa', 'Digital Nomad Visa'], isSchengen: true },
  { code: 'QA', name: 'Qatar', flag: '🇶🇦', visaTypes: ['Visa Free (30 days)', 'e-Visa', 'Tourist Visa', 'Business Visa', 'Work Visa', 'Hayya Card'] },
  { code: 'RO', name: 'Romania', flag: '🇷🇴', visaTypes: ['Visa Free (90 days)', 'Short Stay Visa', 'Long Stay Visa', 'Work Permit', 'Digital Nomad Visa'] },
  { code: 'RU', name: 'Russia', flag: '🇷🇺', visaTypes: ['e-Visa', 'Tourist Visa', 'Business Visa', 'Work Visa', 'Highly Qualified Specialist'] },
  { code: 'RW', name: 'Rwanda', flag: '🇷🇼', visaTypes: ['Visa on Arrival (30 days)', 'e-Visa', 'Tourist Visa', 'Business Visa', 'Work Permit'] },
  { code: 'KN', name: 'Saint Kitts and Nevis', flag: '🇰🇳', visaTypes: ['Visa Free (90 days)', 'Work Permit', 'Student Visa'] },
  { code: 'LC', name: 'Saint Lucia', flag: '🇱🇨', visaTypes: ['Visa Free (42 days)', 'Work Permit', 'Student Visa'] },
  { code: 'VC', name: 'Saint Vincent', flag: '🇻🇨', visaTypes: ['Visa Free (30 days)', 'Work Permit', 'Student Visa'] },
  { code: 'WS', name: 'Samoa', flag: '🇼🇸', visaTypes: ['Visa Free (60 days)', 'Tourist Visa', 'Work Permit'] },
  { code: 'SM', name: 'San Marino', flag: '🇸🇲', visaTypes: ['Schengen Required', 'Residence Permit', 'Work Permit'] },
  { code: 'ST', name: 'São Tomé and Príncipe', flag: '🇸🇹', visaTypes: ['Visa on Arrival', 'Tourist Visa', 'Business Visa'] },
  { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦', visaTypes: ['e-Visa (Tourist)', 'Business Visa', 'Work Visa', 'Umrah Visa', 'Hajj Visa', 'Premium Residency'] },
  { code: 'SN', name: 'Senegal', flag: '🇸🇳', visaTypes: ['Visa Free (90 days)', 'Tourist Visa', 'Business Visa', 'Work Permit'] },
  { code: 'RS', name: 'Serbia', flag: '🇷🇸', visaTypes: ['Visa Free (90 days)', 'Type C (Short Stay)', 'Type D (Long Stay)', 'Work Permit'] },
  { code: 'SC', name: 'Seychelles', flag: '🇸🇨', visaTypes: ['Visa Free (90 days)', 'Visitor Permit', 'GOP (Gainful Occupation)', 'Workation Visa'] },
  { code: 'SL', name: 'Sierra Leone', flag: '🇸🇱', visaTypes: ['Visa on Arrival', 'Tourist Visa', 'Business Visa', 'Work Permit'] },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬', visaTypes: ['Visa Free (90 days)', 'Tourist Visa', 'Employment Pass', 'S Pass', 'EntrePass', 'ONE Pass'] },
  { code: 'SK', name: 'Slovakia', flag: '🇸🇰', visaTypes: ['Schengen C (Short Stay)', 'National D Visa', 'Work Permit', 'EU Blue Card'], isSchengen: true },
  { code: 'SI', name: 'Slovenia', flag: '🇸🇮', visaTypes: ['Schengen C (Short Stay)', 'National D Visa', 'Work Permit', 'Digital Nomad Visa', 'EU Blue Card'], isSchengen: true },
  { code: 'SB', name: 'Solomon Islands', flag: '🇸🇧', visaTypes: ['Visa on Arrival', 'Tourist Visa', 'Business Visa', 'Work Permit'] },
  { code: 'SO', name: 'Somalia', flag: '🇸🇴', visaTypes: ['Visa on Arrival', 'Tourist Visa', 'Business Visa'] },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦', visaTypes: ['Visa Free (90 days)', 'Tourist Visa', 'General Work Visa', 'Critical Skills Visa', 'Business Visa'] },
  { code: 'SS', name: 'South Sudan', flag: '🇸🇸', visaTypes: ['Tourist Visa', 'Business Visa', 'Work Visa'] },
  { code: 'ES', name: 'Spain', flag: '🇪🇸', visaTypes: ['Schengen C (Short Stay)', 'National D Visa', 'Non-Lucrative Visa', 'Digital Nomad Visa', 'Golden Visa', 'Entrepreneur Visa'], isSchengen: true },
  { code: 'LK', name: 'Sri Lanka', flag: '🇱🇰', visaTypes: ['ETA (30 days)', 'Tourist Visa', 'Business Visa', 'Work Visa', 'Digital Nomad Visa'] },
  { code: 'SD', name: 'Sudan', flag: '🇸🇩', visaTypes: ['Tourist Visa', 'Business Visa', 'Work Visa', 'Transit Visa'] },
  { code: 'SR', name: 'Suriname', flag: '🇸🇷', visaTypes: ['e-Visa', 'Tourist Card', 'Business Visa', 'Work Permit'] },
  { code: 'SE', name: 'Sweden', flag: '🇸🇪', visaTypes: ['Schengen C (Short Stay)', 'National D Visa', 'Work Permit', 'EU Blue Card', 'Startup Visa'], isSchengen: true },
  { code: 'CH', name: 'Switzerland', flag: '🇨🇭', visaTypes: ['Schengen C (Short Stay)', 'National D Visa', 'L Permit (Short-term)', 'B Permit (Residence)', 'C Permit (Settlement)'], isSchengen: true },
  { code: 'SY', name: 'Syria', flag: '🇸🇾', visaTypes: ['Tourist Visa', 'Business Visa', 'Transit Visa'] },
  { code: 'TW', name: 'Taiwan', flag: '🇹🇼', visaTypes: ['Visa Free (90 days)', 'Visitor Visa', 'Resident Visa', 'Work Permit', 'Gold Card'] },
  { code: 'TJ', name: 'Tajikistan', flag: '🇹🇯', visaTypes: ['e-Visa', 'Tourist Visa', 'Business Visa', 'Work Permit'] },
  { code: 'TZ', name: 'Tanzania', flag: '🇹🇿', visaTypes: ['e-Visa', 'Visa on Arrival', 'Tourist Visa', 'Business Visa', 'Work Permit'] },
  { code: 'TH', name: 'Thailand', flag: '🇹🇭', visaTypes: ['Visa Exempt (30/45 days)', 'Tourist Visa (TR)', 'Non-Immigrant B', 'Elite Visa', 'LTR Visa', 'Retirement Visa', 'DTV (Nomad)'] },
  { code: 'TL', name: 'Timor-Leste', flag: '🇹🇱', visaTypes: ['Visa on Arrival (30 days)', 'Tourist Visa', 'Business Visa', 'Work Visa'] },
  { code: 'TG', name: 'Togo', flag: '🇹🇬', visaTypes: ['e-Visa', 'Visa on Arrival', 'Tourist Visa', 'Business Visa'] },
  { code: 'TO', name: 'Tonga', flag: '🇹🇴', visaTypes: ['Visa Free (31 days)', 'Tourist Visa', 'Work Permit'] },
  { code: 'TT', name: 'Trinidad and Tobago', flag: '🇹🇹', visaTypes: ['Visa Free (90 days)', 'Work Permit', 'Student Visa'] },
  { code: 'TN', name: 'Tunisia', flag: '🇹🇳', visaTypes: ['Visa Free (90 days)', 'Tourist Visa', 'Business Visa', 'Work Permit'] },
  { code: 'TR', name: 'Turkey', flag: '🇹🇷', visaTypes: ['e-Visa (90 days)', 'Tourist Visa', 'Work Permit', 'Turkuaz Card', 'Short-term Residence'] },
  { code: 'TM', name: 'Turkmenistan', flag: '🇹🇲', visaTypes: ['Letter of Invitation', 'Tourist Visa', 'Business Visa', 'Transit Visa'] },
  { code: 'TV', name: 'Tuvalu', flag: '🇹🇻', visaTypes: ['Visa on Arrival', 'Tourist Visa', 'Work Permit'] },
  { code: 'UG', name: 'Uganda', flag: '🇺🇬', visaTypes: ['e-Visa', 'Visa on Arrival', 'Tourist Visa', 'Business Visa', 'Work Permit'] },
  { code: 'UA', name: 'Ukraine', flag: '🇺🇦', visaTypes: ['Visa Free (90 days)', 'Type C (Short Stay)', 'Type D (Long Stay)', 'Work Permit', 'Diia.City'] },
  { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪', visaTypes: ['Visa on Arrival (30 days)', 'Tourist Visa', 'Visit Visa', 'Employment Visa', 'Freelance Visa', 'Golden Visa', 'Remote Work Visa'] },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', visaTypes: ['Visa Free (180 days)', 'Standard Visitor', 'Skilled Worker', 'Global Talent', 'Innovator Founder', 'Youth Mobility'] },
  { code: 'US', name: 'United States', flag: '🇺🇸', visaTypes: ['ESTA (VWP)', 'B1/B2 (Tourist/Business)', 'F-1 (Student)', 'H-1B (Work)', 'L-1 (Transfer)', 'O-1 (Extraordinary)', 'E-2 (Investor)'] },
  { code: 'UY', name: 'Uruguay', flag: '🇺🇾', visaTypes: ['Visa Free (90 days)', 'Tourist Visa', 'Work Visa', 'Residence Visa'] },
  { code: 'UZ', name: 'Uzbekistan', flag: '🇺🇿', visaTypes: ['Visa Free (30 days)', 'e-Visa', 'Tourist Visa', 'Business Visa', 'Work Permit'] },
  { code: 'VU', name: 'Vanuatu', flag: '🇻🇺', visaTypes: ['Visa Free (30 days)', 'Tourist Visa', 'Business Visa', 'Work Permit'] },
  { code: 'VA', name: 'Vatican City', flag: '🇻🇦', visaTypes: ['Schengen Required', 'Special Permission'] },
  { code: 'VE', name: 'Venezuela', flag: '🇻🇪', visaTypes: ['Tourist Visa', 'Business Visa', 'Work Visa', 'Transit Visa'] },
  { code: 'VN', name: 'Vietnam', flag: '🇻🇳', visaTypes: ['e-Visa (90 days)', 'Visa on Arrival', 'Tourist Visa', 'Business Visa', 'Work Permit', 'Temporary Residence Card'] },
  { code: 'YE', name: 'Yemen', flag: '🇾🇪', visaTypes: ['Tourist Visa', 'Business Visa', 'Transit Visa'] },
  { code: 'ZM', name: 'Zambia', flag: '🇿🇲', visaTypes: ['e-Visa', 'Visa on Arrival', 'Tourist Visa', 'Business Visa', 'Work Permit'] },
  { code: 'ZW', name: 'Zimbabwe', flag: '🇿🇼', visaTypes: ['Visa on Arrival', 'Tourist Visa', 'Business Visa', 'Work Permit'] },
];

export function getCountryByCode(code: string): Country | undefined {
  return COUNTRIES.find(c => c.code === code);
}

export function getCountryFlag(code: string): string {
  const country = getCountryByCode(code);
  return country?.flag || '🏳️';
}

export function searchCountries(query: string): Country[] {
  const lowerQuery = query.toLowerCase();
  return COUNTRIES.filter(c => 
    c.name.toLowerCase().includes(lowerQuery) ||
    c.code.toLowerCase().includes(lowerQuery)
  );
}

// Get visa types for a country with Custom option added
export function getVisaTypesWithCustom(countryCode: string): string[] {
  const country = getCountryByCode(countryCode);
  if (!country) return ['Custom'];
  // Add "Custom" at the end of the visa types list
  return [...country.visaTypes, 'Custom'];
}

// EU/EEA/Swiss countries (for EU Citizen visa type eligibility)
export const EU_COUNTRIES = [
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR',
  'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL',
  'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE',
  // EEA
  'IS', 'LI', 'NO',
  // EFTA
  'CH'
];

// Check if a country is in the EU/EEA/Swiss area
export function isEUCountry(countryCode: string): boolean {
  return EU_COUNTRIES.includes(countryCode);
}

// Get visa types including EU Citizen option when applicable
export function getVisaTypesForPassport(
  destinationCountryCode: string, 
  passportCountryCode: string | null
): string[] {
  const baseTypes = getVisaTypesWithCustom(destinationCountryCode);
  
  // If user has EU passport and destination is EU country, add EU Citizen option first
  if (passportCountryCode && isEUCountry(passportCountryCode) && isEUCountry(destinationCountryCode)) {
    return ['EU Citizen', ...baseTypes];
  }
  
  return baseTypes;
}