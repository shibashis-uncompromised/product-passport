/* Single source of truth for the product catalogue.
 * `n` is the short public number used in the /p/<n> link (looks random, is stable).
 * `slug` is the passport folder under /passports/<slug>/.
 * Both the landing grid (index.html) and the /p/ loader-router read this file,
 * so numbers and products never drift apart. */
window.PRODUCTS = [
  { n: 34, slug: 'turmeric',      name: 'Turmeric',      hindi: 'हल्दी',        farm: 'Bujra',   kind: 'Spice' },
  { n: 17, slug: 'kala-chana',    name: 'Kala Chana',    hindi: 'काला चना',     farm: 'Sarai 1', kind: 'Pulse' },
  { n: 58, slug: 'masoor-dal',    name: 'Masoor Dal',    hindi: 'मसूर दाल',     farm: 'Sarai 1', kind: 'Pulse' },
  { n: 23, slug: 'regular-wheat', name: 'Regular Wheat', hindi: 'गेहूँ',         farm: 'Sarai 1', kind: 'Cereal' },
  { n: 91, slug: 'bansi-wheat',   name: 'Bansi Wheat',   hindi: 'बंसी गेहूँ',    farm: 'Sarai 2', kind: 'Cereal' },
  { n: 42, slug: 'bhaliya-wheat', name: 'Bhaliya Wheat', hindi: 'भालिया गेहूँ',  farm: 'Bujra',   kind: 'Cereal' },
  { n: 76, slug: 'chia-seeds',    name: 'Chia Seeds',    hindi: 'चिया बीज',      farm: 'Sarai 1', kind: 'Oilseed' },
  { n: 29, slug: 'flaxseeds',     name: 'Flaxseeds',     hindi: 'अलसी',          farm: 'Sarai 1', kind: 'Oilseed' },
  { n: 60, slug: 'urad-dal',      name: 'Urad Dal',      hindi: 'उड़द दाल',      farm: 'Sarai 1', kind: 'Pulse' },
  { n: 85, slug: 'moong-dal',     name: 'Moong Dal',     hindi: 'मूंग दाल',      farm: 'Sarai 1', kind: 'Pulse' }
];

/* number -> product lookup */
window.PRODUCT_BY_N = window.PRODUCTS.reduce(function (map, p) {
  map[p.n] = p;
  return map;
}, {});
