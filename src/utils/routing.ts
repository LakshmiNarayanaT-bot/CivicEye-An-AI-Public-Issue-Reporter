import { IssueCategory, OfficialChannel } from '../types/civic.js';

export const VERIFIED_CHANNELS: OfficialChannel[] = [
  {
    id: 'ghmc-mycure',
    name: 'GHMC MyCURE / Citizen Grievance Portal (Hyderabad)',
    category: ['road_damage', 'garbage', 'open_drain', 'damaged_streetlight', 'other'],
    coverageArea: 'Greater Hyderabad Municipal Corporation (GHMC), Telangana',
    type: 'web',
    url: 'https://www.ghmc.gov.in',
    phone: '040-21111111',
    instructions: 'Copy your CivicEye prepared complaint text and photo evidence to submit via GHMC MyCURE app or the online grievance portal. You will receive a GHMC grievance token number.',
    verificationNotice: 'Verified Municipal Reporting Channel for Hyderabad citizens.',
  },
  {
    id: 'swachhata-app',
    name: 'Swachhata - MoHUA Official Portal',
    category: ['garbage', 'open_drain', 'water_issue'],
    coverageArea: 'All Municipalities across India (Ministry of Housing and Urban Affairs)',
    type: 'app',
    url: 'https://swachhata.co.in',
    phone: '1969',
    instructions: 'Upload your photo and paste the CivicEye generated complaint to register the sanitation issue directly with your urban local body ward inspector.',
    verificationNotice: 'Official Central Government Urban Sanitation Initiative.',
  },
  {
    id: 'hmwssb-water',
    name: 'HMWSSB Water Supply & Sewerage Grievance',
    category: ['water_issue', 'open_drain'],
    coverageArea: 'Hyderabad Metropolitan Area',
    type: 'web',
    url: 'https://www.hyderabadwater.gov.in',
    phone: '155313',
    instructions: 'For pipeline leaks, contaminated drinking water, or major sewer overflows, file a complaint on HMWSSB Customer Care portal or call the 24/7 dial-a-water service.',
    verificationNotice: 'Verified Water & Sewerage Board Channel.',
  },
  {
    id: 'tssspdcl-power',
    name: 'TGSPDCL / Electricity Board Streetlight Helpline',
    category: ['damaged_streetlight'],
    coverageArea: 'Telangana Southern Power Distribution Area',
    type: 'helpline',
    url: 'https://www.tgspdcl.com',
    phone: '1912',
    instructions: 'Call 1912 toll-free or file online with the pole number, colony landmark, and CivicEye complaint text.',
    verificationNotice: 'Verified Power Distribution Grievance Cell.',
  },
  {
    id: 'cpgrams-central',
    name: 'CPGRAMS Central Public Grievance Redress System',
    category: ['road_damage', 'other'],
    coverageArea: 'National Highways & Central Government Infrastructure across India',
    type: 'web',
    url: 'https://pgportal.gov.in',
    phone: '1800-11-0031',
    instructions: 'Log in to CPGRAMS portal and lodge grievance under Ministry of Road Transport and Highways (MoRTH) or relevant department.',
    verificationNotice: 'Government of India National Grievance Portal.',
  },
];

export function getRecommendedChannels(category: IssueCategory, cityOrArea?: string): OfficialChannel[] {
  const isHyderabad = (cityOrArea || '').toLowerCase().includes('hyderabad') ||
                      (cityOrArea || '').toLowerCase().includes('secunderabad') ||
                      (cityOrArea || '').toLowerCase().includes('telangana');

  return VERIFIED_CHANNELS.filter((ch) => {
    const categoryMatches = ch.category.includes(category) || ch.category.includes('other');
    if (!categoryMatches) return false;

    if (ch.id === 'ghmc-mycure' || ch.id === 'hmwssb-water' || ch.id === 'tssspdcl-power') {
      // Prioritize for Hyderabad or if no city specified
      return isHyderabad || !cityOrArea || cityOrArea.trim().length === 0;
    }
    return true;
  });
}
