import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Team data
const teams = [
  { id: 'rcb', name: 'RCB', primaryColor: '#e63946', secondaryColor: '#ffffff' },
  { id: 'mi', name: 'MI', primaryColor: '#005fcc', secondaryColor: '#fdb913' },
  { id: 'pbks', name: 'PBKS', primaryColor: '#ed1c24', secondaryColor: '#ffffff' },
  { id: 'kkr', name: 'KKR', primaryColor: '#430d58', secondaryColor: '#edb234' },
  { id: 'gt', name: 'GT', primaryColor: '#1c1c1c', secondaryColor: '#e8b842' },
  { id: 'dc', name: 'DC', primaryColor: '#17479e', secondaryColor: '#e63946' },
  { id: 'srh', name: 'SRH', primaryColor: '#ff9933', secondaryColor: '#000000' },
  { id: 'lsg', name: 'LSG', primaryColor: '#41bdd5', secondaryColor: '#ea1628' },
  { id: 'rr', name: 'RR', primaryColor: '#ea1a8e', secondaryColor: '#1a479e' },
  { id: 'csk', name: 'CSK', primaryColor: '#ffff00', secondaryColor: '#0066ff' }
];

// Create logos directory if it doesn't exist
const logosDir = path.join(__dirname, '..', 'public', 'logos');
if (!fs.existsSync(logosDir)) {
  fs.mkdirSync(logosDir, { recursive: true });
}

// Generate SVG logos
teams.forEach(team => {
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad-${team.id}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${team.primaryColor};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${team.secondaryColor};stop-opacity:1" />
    </linearGradient>
    <filter id="shadow-${team.id}">
      <feDropShadow dx="2" dy="2" stdDeviation="3" flood-opacity="0.3"/>
    </filter>
  </defs>
  
  <!-- Outer circle with gradient -->
  <circle cx="100" cy="100" r="90" fill="url(#grad-${team.id})" filter="url(#shadow-${team.id})"/>
  
  <!-- Inner white circle border -->
  <circle cx="100" cy="100" r="85" fill="none" stroke="#ffffff" stroke-width="3"/>
  
  <!-- Team name text -->
  <text x="100" y="110" font-family="Arial, sans-serif" font-size="48" font-weight="bold" 
        text-anchor="middle" fill="#ffffff" stroke="#000000" stroke-width="1">
    ${team.name}
  </text>
</svg>`;

  // Write SVG file
  const svgPath = path.join(logosDir, `${team.id}.svg`);
  fs.writeFileSync(svgPath, svg);
  console.log(`Generated logo: ${svgPath}`);
  
  // Also create a simplified PNG placeholder using HTML (instructions)
  const pngInstructions = `To convert ${team.id}.svg to ${team.id}.png:
1. Open ${team.id}.svg in a browser
2. Take a screenshot or use an online SVG to PNG converter
3. Save as ${team.id}.png in this directory
`;
  
  const instructionsPath = path.join(logosDir, `${team.id}_convert_instructions.txt`);
  fs.writeFileSync(instructionsPath, pngInstructions);
});

console.log('\nAll SVG logos generated successfully!');
console.log('To use PNG logos, convert the SVG files to PNG format.');
console.log('\nAlternatively, you can:');
console.log('1. Open public/logos/generate-logos.html in a browser');
console.log('2. Click "Download All Logos" to get PNG versions');
