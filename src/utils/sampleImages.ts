import { IssueCategory } from '../types/civic.js';

export interface SampleImageOption {
  id: string;
  category: IssueCategory;
  name: string;
  description: string;
  locationHint: string;
  dataUrl: string;
}

// Generate realistic SVG photographic mockups as data URLs
function createCivicSvgDataUrl(title: string, category: string, primaryColor: string, detailSvg: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#334155" />
        <stop offset="60%" stop-color="#1e293b" />
        <stop offset="100%" stop-color="#0f172a" />
      </linearGradient>
      <linearGradient id="pavement" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#475569" />
        <stop offset="50%" stop-color="#334155" />
        <stop offset="100%" stop-color="#475569" />
      </linearGradient>
    </defs>
    <!-- Background Road / Street Scene -->
    <rect width="600" height="400" fill="url(#bg)" />
    <polygon points="0,220 600,220 600,400 0,400" fill="url(#pavement)" />
    <!-- Road Markings -->
    <line x1="300" y1="230" x2="300" y2="290" stroke="#f1f5f9" stroke-width="6" stroke-dasharray="20,15" opacity="0.6" />
    <line x1="300" y1="320" x2="300" y2="390" stroke="#f1f5f9" stroke-width="8" stroke-dasharray="25,20" opacity="0.6" />
    <!-- Specific Civic Issue Graphic -->
    ${detailSvg}
    <!-- Official Civic Timestamp & Camera Overlay Banner -->
    <rect x="16" y="16" width="300" height="52" rx="8" fill="#0f172acc" stroke="#334155" stroke-width="1.5" />
    <circle cx="34" cy="42" r="6" fill="${primaryColor}" />
    <text x="50" y="36" fill="#f8fafc" font-family="system-ui, sans-serif" font-size="13" font-weight="bold">CIVIC EVIDENCE CAPTURE</text>
    <text x="50" y="52" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="11">${title} • Category: ${category}</text>
  </svg>`;

  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
}

export const SAMPLE_IMAGES: SampleImageOption[] = [
  {
    id: 'sample-pothole',
    category: 'road_damage',
    name: 'Severe Road Pothole',
    description: 'Deep asphalt depression with jagged edges on primary lane',
    locationHint: 'Road No. 36, Jubilee Hills, Hyderabad',
    dataUrl: createCivicSvgDataUrl(
      'Deep Carriageway Pothole',
      'Road Damage',
      '#ef4444',
      `<!-- Pothole Hole -->
      <ellipse cx="320" cy="310" rx="90" ry="42" fill="#020617" stroke="#1e293b" stroke-width="8" />
      <ellipse cx="310" cy="315" rx="70" ry="30" fill="#090d16" />
      <!-- Cracks in asphalt -->
      <path d="M220,310 L160,280 M240,340 L190,370 M410,310 L480,330 M390,280 L440,250" stroke="#0f172a" stroke-width="4" stroke-linecap="round" />
      <!-- Loose gravel debris -->
      <circle cx="210" cy="320" r="5" fill="#64748b" />
      <circle cx="430" cy="300" r="4" fill="#64748b" />
      <circle cx="350" cy="360" r="6" fill="#475569" />
      <circle cx="280" cy="270" r="4" fill="#94a3b8" />`
    ),
  },
  {
    id: 'sample-garbage',
    category: 'garbage',
    name: 'Overflowing Waste Dump',
    description: 'Unattended municipal bin overflowing onto pedestrian pathway',
    locationHint: 'Near Ameerpet Metro Station, Hyderabad',
    dataUrl: createCivicSvgDataUrl(
      'Unattended Municipal Garbage Pile',
      'Solid Waste Accumulation',
      '#f59e0b',
      `<!-- Green Municipal Bin -->
      <polygon points="180,180 280,180 260,330 200,330" fill="#15803d" stroke="#166534" stroke-width="4" />
      <rect x="170" y="165" width="120" height="18" rx="4" fill="#14532d" />
      <!-- Overflowing trash bags and waste -->
      <ellipse cx="230" cy="160" rx="45" ry="30" fill="#0f172a" />
      <ellipse cx="260" cy="170" rx="40" ry="25" fill="#334155" />
      <!-- Spill on the road -->
      <path d="M250,290 C290,270 380,310 420,340 C380,380 270,370 210,340 Z" fill="#475569" opacity="0.85" />
      <circle cx="330" cy="320" r="18" fill="#e2e8f0" />
      <rect x="290" y="330" width="40" height="25" rx="5" fill="#f87171" transform="rotate(15 290 330)" />
      <rect x="350" y="325" width="35" height="30" rx="4" fill="#fbbf24" transform="rotate(-20 350 325)" />`
    ),
  },
  {
    id: 'sample-drain',
    category: 'open_drain',
    name: 'Broken Open Manhole',
    description: 'Exposed concrete drainage manhole without safety lid',
    locationHint: 'Gachibowli Outer Ring Road Link, Hyderabad',
    dataUrl: createCivicSvgDataUrl(
      'Open Drain / Missing Manhole Lid',
      'Drainage Hazard',
      '#dc2626',
      `<!-- Broken Manhole Outer Rim -->
      <ellipse cx="300" cy="300" rx="85" ry="50" fill="#1e293b" stroke="#64748b" stroke-width="12" />
      <!-- Abyss Interior -->
      <ellipse cx="300" cy="303" rx="72" ry="40" fill="#020617" />
      <!-- Water Reflection line -->
      <path d="M260,315 Q300,325 340,315" stroke="#0ea5e9" stroke-width="3" fill="none" opacity="0.7" />
      <!-- Displaced Concrete Cover fragment -->
      <polygon points="380,270 470,250 490,290 400,310" fill="#475569" stroke="#334155" stroke-width="4" />
      <!-- Danger outline warning ring -->
      <ellipse cx="300" cy="300" rx="100" ry="60" stroke="#ef4444" stroke-width="3" stroke-dasharray="10,8" fill="none" />`
    ),
  },
  {
    id: 'sample-water',
    category: 'water_issue',
    name: 'Freshwater Pipeline Leakage',
    description: 'High-volume drinking water pipeline burst causing road waterlogging',
    locationHint: 'Madhapur Main Road, Near Cyber Towers, Hyderabad',
    dataUrl: createCivicSvgDataUrl(
      'Water Pipeline Burst & Road Flooding',
      'Water Hazard',
      '#0284c7',
      `<!-- Flooded Road Pool -->
      <ellipse cx="320" cy="320" rx="160" ry="65" fill="#0284c7" opacity="0.6" />
      <ellipse cx="310" cy="325" rx="130" ry="45" fill="#38bdf8" opacity="0.4" />
      <!-- Water Spring Spurt -->
      <path d="M280,310 Q290,210 300,200 Q310,210 320,310" fill="#e0f2fe" opacity="0.8" />
      <circle cx="300" cy="195" r="14" fill="#bae6fd" />
      <path d="M260,260 Q300,240 340,260" stroke="#f0f9ff" stroke-width="4" fill="none" />
      <!-- Ripple rings -->
      <ellipse cx="300" cy="315" rx="40" ry="15" stroke="#bae6fd" stroke-width="2.5" fill="none" />
      <ellipse cx="300" cy="315" rx="75" ry="25" stroke="#7dd3fc" stroke-width="2" fill="none" />`
    ),
  },
  {
    id: 'sample-light',
    category: 'damaged_streetlight',
    name: 'Damaged & Dangling Streetlight',
    description: 'Broken streetlight casing with exposed wiring on unlit colony stretch',
    locationHint: 'Kukatpally Housing Board Colony (KPHB), Hyderabad',
    dataUrl: createCivicSvgDataUrl(
      'Damaged Streetlight & Exposed Wires',
      'Electrical Infrastructure',
      '#eab308',
      `<!-- Pole Body -->
      <rect x="220" y="80" width="16" height="280" fill="#64748b" />
      <!-- Pole Arm -->
      <path d="M228,80 C230,40 320,40 360,60" stroke="#64748b" stroke-width="12" fill="none" stroke-linecap="round" />
      <!-- Broken Hanging Lamp fixture tilted -->
      <polygon points="340,55 390,70 380,100 330,85" fill="#1e293b" stroke="#ef4444" stroke-width="3" />
      <!-- Shattered Glass Lens -->
      <path d="M340,90 L380,105" stroke="#cbd5e1" stroke-width="4" stroke-dasharray="4,4" />
      <!-- Dangling dangerous wires -->
      <path d="M360,95 Q370,140 355,160" stroke="#ef4444" stroke-width="3" fill="none" />
      <path d="M370,98 Q385,135 380,170" stroke="#eab308" stroke-width="3" fill="none" />
      <!-- Dark warning cone -->
      <polygon points="360,100 240,360 480,360" fill="#f8fafc" opacity="0.04" />`
    ),
  },
];
