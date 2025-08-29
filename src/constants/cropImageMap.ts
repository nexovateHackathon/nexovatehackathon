// Central map of crop names to local images placed under public/crops/
// Add or edit entries as you collect better photos.

const map: Record<string, string> = {
  'Groundnut': '/crops/groundnut.jpg',
  'Sugarcane': '/crops/sugarcane.jpg',
  'Red Gram (Tur)': '/crops/red-gram.jpg',
  'Pearl Millet (Bajra)': '/crops/pearl-millet.jpg',
  'Ragi (Finger Millet)': '/crops/ragi.jpg',
  'Jowar (Sorghum)': '/crops/jowar.jpg',
  'Cotton': '/crops/cotton.jpg',
  'Sunflower': '/crops/sunflower.jpg',
  'Castor': '/crops/castor.jpg',
  'Mustard': '/crops/mustard.jpg',
  'Coconut': '/crops/coconut.jpg',
  'Arecanut': '/crops/arecanut.jpg',
  'Cashew': '/crops/cashew.jpg',
  'Coffee': '/crops/coffee.jpg',
  'Tea': '/crops/tea.jpg',
  'Rubber': '/crops/rubber.jpg',
  'Banana': '/crops/banana.jpg',
  'Mango': '/crops/mango.jpg',
  'Papaya': '/crops/papaya.jpg',
  'Pomegranate': '/crops/pomegranate.jpg',
  'Onion': '/crops/onion.jpg',
  'Tomato': '/crops/tomato.jpg',
  'Chillies': '/crops/chillies.jpg',
  'Potato': '/crops/potato.jpg',
  'Grapes': '/crops/grapes.jpg',
  'Black Gram (Urad)': '/crops/black-gram.jpg',
  'Green Gram (Moong)': '/crops/green-gram.jpg',
  'Horse Gram': '/crops/horse-gram.jpg',
  'Okra' : '/crops/okra.jpg',
  'Brinjal' : '/crops/brinjal.jpg',
  'Bitter Gourd' : '/crops/bitter-gourd.jpg',
  'Bengal Gram (Chana)': '/crops/bengal-gram.jpg',
  'Chickpea (Besan)': '/crops/chickpea.jpg',
  'Cucumber': '/crops/cucumber.jpg',
  'Pigeon Pea (Kabuli Chana)': '/crops/pigeon-pea.jpg',
  'Peas': '/crops/peas.jpg',
  'Peanuts': '/crops/peanuts.jpg',
  'Pumpkin': '/crops/pumpkin.jpg',
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


