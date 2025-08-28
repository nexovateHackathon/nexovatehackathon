// Central map of crop names to local images placed under public/crops/
// Add or edit entries as you collect better photos.

const map: Record<string, string> = {
  'Paddy Rice': '/crops/paddy-rice.jpg',
  'Rice': '/crops/rice.jpg',
  'Wheat': '/crops/wheat.jpg',
  'Maize': '/crops/maize.jpg',
  'Corn': '/crops/maize.jpg',
  'Soybean': '/crops/soybean.jpg',
  'Groundnut': '/crops/groundnut.jpg',
  'Sugarcane': '/crops/sugarcane.jpg',
  'Red Gram (Tur)': '/crops/red-gram.jpg',
  'Pearl Millet (Bajra)': '/crops/pearl-millet.jpg',
};

function normalize(name: string): string {
  return name.replace(/\([^)]*\)/g, '').trim().toLowerCase();
}

// Optional aliases for better matching
const aliases: Record<string, string> = {
    'tur': 'red gram (tur)',
    'arhar': 'red gram (tur)',
    'bajra': 'pearl millet (bajra)',
    'corn': 'maize',
    'paddy': 'paddy rice',
  };

export function getCropImage(cropName: string): string | null {
  if (!cropName) return null;
  // exact key
  if (map[cropName]) return map[cropName];
  const n = normalize(cropName);
  // normalized exact
  const foundKey = Object.keys(map).find(k => normalize(k) === n);
  if (foundKey) return map[foundKey];
  // alias lookup
  const aliasKey = aliases[n];
  if (aliasKey) {
    const original = Object.keys(map).find(k => normalize(k) === aliasKey);
    if (original) return map[original];
  }
  return null;
}


