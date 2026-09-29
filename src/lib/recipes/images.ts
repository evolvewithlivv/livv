/**
 * Per-recipe banner images.
 * Maps food keywords in the title/id to curated Unsplash food photos.
 * Each recipe gets a related photo — not a category color block.
 */

const U = (id: string, w = 800, h = 480) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;

/** Curated Unsplash photo IDs — real food photography */
const PHOTOS = {
  // Breakfast
  oats: U("photo-1517673400264-472199dcf490"),
  yogurt: U("photo-1488477181946-6428a0291777"),
  eggs: U("photo-1525351484163-7529414344d8"),
  avocado: U("photo-1541519227354-08fa5d50c44d"),
  toast: U("photo-1525351484163-7529414344d8"),
  smoothie: U("photo-1505252585461-04db1eb84625"),
  chia: U("photo-1511690656952-34342bb7c2f2"),
  oatmeal: U("photo-1517673400264-472199dcf490"),
  muffin: U("photo-1607958996333-41aef7caefaa"),
  salmon: U("photo-1467003909585-2f8a72700288"),
  cottage: U("photo-1488477181946-6428a0291777"),
  pancake: U("photo-1567620905732-2d1ec7ab7445"),
  waffle: U("photo-1562376552-0d160a2f238d"),
  bagel: U("photo-1555507036-ab1f4038808a"),
  cereal: U("photo-1517673400264-472199dcf490"),
  // Proteins
  chicken: U("photo-1598103442097-8b74394b95c6"),
  steak: U("photo-1546833999-b9f581a1996d"),
  beef: U("photo-1588168333986-5078d3ae3976"),
  turkey: U("photo-1574672280600-4accfa113dee"),
  shrimp: U("photo-1565680018434-b513d5e5fd47"),
  tuna: U("photo-1579584425555-c3ce17fd4351"),
  cod: U("photo-1519707574798-751108f4ee29"),
  fish: U("photo-1519707574798-751108f4ee29"),
  pork: U("photo-1432139509613-5c4255815867"),
  lamb: U("photo-1607623814075-e51df1bdc82f"),
  tofu: U("photo-1546069901-ba9599a7e63c"),
  tempeh: U("photo-1546069901-ba9599a7e63c"),
  // Bowls / plates
  bowl: U("photo-1546069901-ba9599a7e63c"),
  rice: U("photo-1516684669134-de6f7c473a2a"),
  quinoa: U("photo-1505253758473-96b7015fcd40"),
  salad: U("photo-1512621776951-a57141f2eefd"),
  soup: U("photo-1547592166-23ac45744acd"),
  chili: U("photo-1455619452474-d2be8b1e70cd"),
  stew: U("photo-1604908176997-125f25cc6f3d"),
  curry: U("photo-1455619452474-d2be8b1e70cd"),
  // Mediterranean / sides
  hummus: U("photo-1505576399279-565b52d5ac1f"),
  falafel: U("photo-1593001874117-c99c800e3eb7"),
  olive: U("photo-1474979266404-7eaacbcd87c5"),
  tomato: U("photo-1592924357228-91a4daadcfea"),
  mozzarella: U("photo-1608897013039-887f21d8c804"),
  feta: U("photo-1626200419199-391ae4be7a41"),
  // Sandwiches / wraps
  wrap: U("photo-1626700051175-6818013e1d4f"),
  sandwich: U("photo-1528735602780-2552fd46c7af"),
  burger: U("photo-1568901346375-23c9450c58cd"),
  taco: U("photo-1565299585323-38d6b0865b47"),
  pizza: U("photo-1513104890138-7c749659a591"),
  pasta: U("photo-1621996346565-e3dbc646d9a9"),
  noodles: U("photo-1569718212165-3a8278d5f264"),
  // Vegetables
  broccoli: U("photo-1459411621453-7b03977f4bfc"),
  vegetable: U("photo-1540420773420-3366772f4999"),
  pepper: U("photo-1563565375-f3fdfdbefa83"),
  squash: U("photo-1570586437263-ab629fccc474"),
  zucchini: U("photo-1592419044706-39796d40f98c"),
  eggplant: U("photo-1615484477201-2a8e0b4e0f3a"),
  potato: U("photo-1518977676601-b53f82aba655"),
  sweet_potato: U("photo-1596097635769-35e2a4e5e5b7"),
  // Snacks
  almond: U("photo-1508747703725-719777637510"),
  nuts: U("photo-1599599810769-bcde5a160d32"),
  apple: U("photo-1560806887-1e4cd0b6cbd6"),
  banana: U("photo-1571771894821-ce9b6c11b08e"),
  berry: U("photo-1498557850523-fd3d11862fe6"),
  berries: U("photo-1498557850523-fd3d11862fe6"),
  carrot: U("photo-1598170845058-32b9d6a5da37"),
  celery: U("photo-1556801712-76c8eb07bbc9"),
  cheese: U("photo-1486297678162-eb2a19b0a32d"),
  popcorn: U("photo-1578849278619-2a350d4a4dba"),
  chickpea: U("photo-1615485925763-867862f78688"),
  edamame: U("photo-1603048588665-791ca8aea617"),
  jerky: U("photo-1529692236671-f1f6cf9683ba"),
  cracker: U("photo-1558961363-fa8fdf82db35"),
  // Dessert
  chocolate: U("photo-1511381939415-e44015466834"),
  cookie: U("photo-1499636136210-6f4ee915583e"),
  cake: U("photo-1578985545062-69928b1d9587"),
  pudding: U("photo-1488477181946-6428a0291777"),
  ice_cream: U("photo-1563805042-7684c019e1cb"),
  fruit: U("photo-1619566636858-adf3ef4644b9"),
  pear: U("photo-1514756331096-242fdeb70d4a"),
  peach: U("photo-1629828874514-d1e0f0a0f9e8"),
  mango: U("photo-1553279768-865429fa0078"),
  strawberry: U("photo-1464965911861-746a04b4bca6"),
  date: U("photo-1606313564200-e75d5e30476c"),
  // Default by category
  breakfast: U("photo-1533089860892-a7c6f0a88666"),
  lunch: U("photo-1546069901-ba9599a7e63c"),
  dinner: U("photo-1414235077428-338989a2e8c0"),
  quick: U("photo-1490645935967-10de6ba17061"),
  snacks: U("photo-1505576399279-565b52d5ac1f"),
  dessert: U("photo-1488477181946-6428a0291777"),
} as const;

/** Ordered keyword → photo key. First match wins. */
const KEYWORDS: [RegExp, keyof typeof PHOTOS][] = [
  [/overnight\s*oat|oat\s*meal|oats?\b|mug\s*oat/i, "oats"],
  [/yogurt|parfait|tzatziki/i, "yogurt"],
  [/scramble|fried\s*egg|soft\s*egg|hard.?boil|egg\s*muffin|egg\b/i, "eggs"],
  [/avocado/i, "avocado"],
  [/smoothie|shake|protein\s*milk/i, "smoothie"],
  [/chia/i, "chia"],
  [/pancake/i, "pancake"],
  [/waffle/i, "waffle"],
  [/bagel/i, "bagel"],
  [/muffin(?!\s*tin)/i, "muffin"],
  [/salmon|miso.?glaze/i, "salmon"],
  [/cottage\s*cheese/i, "cottage"],
  [/chicken|shawarma|fajita|tikka|cacciatore|mole/i, "chicken"],
  [/steak|ribeye/i, "steak"],
  [/beef(?!\s*jerky)|korean.?beef/i, "beef"],
  [/turkey/i, "turkey"],
  [/shrimp|scallop/i, "shrimp"],
  [/tuna/i, "tuna"],
  [/cod|trout|swordfish|fish\s*taco|white\s*fish|lemon\s*fish/i, "fish"],
  [/pork/i, "pork"],
  [/lamb/i, "lamb"],
  [/tofu/i, "tofu"],
  [/tempeh/i, "tempeh"],
  [/hummus/i, "hummus"],
  [/falafel/i, "falafel"],
  [/olive/i, "olive"],
  [/caprese|mozzarella|tomato.*toast|pan\s*con/i, "mozzarella"],
  [/feta/i, "feta"],
  [/wrap|roll.?up|nori/i, "wrap"],
  [/sandwich|club|melt|grilled\s*cheese/i, "sandwich"],
  [/burger/i, "burger"],
  [/taco|tostada|fajita/i, "taco"],
  [/pizza|quesadilla/i, "pizza"],
  [/pasta|ziti|lasagna|risotto|noodle|zoodle/i, "pasta"],
  [/soup|broth|miso\s*bowl|chowder|egg\s*drop/i, "soup"],
  [/chili|curry|stew/i, "chili"],
  [/salad|greens?/i, "salad"],
  [/rice\s*bowl|fried\s*rice|rice\b/i, "rice"],
  [/quinoa|nourish\s*bowl|bowl/i, "bowl"],
  [/broccoli/i, "broccoli"],
  [/pepper|stuffed\s*pepper/i, "pepper"],
  [/squash|acorn/i, "squash"],
  [/zucchini/i, "zucchini"],
  [/eggplant/i, "eggplant"],
  [/sweet\s*potato/i, "sweet_potato"],
  [/potato/i, "potato"],
  [/almond|nut\s*butter|peanut/i, "almond"],
  [/trail\s*mix|spiced\s*nuts|nuts?\b/i, "nuts"],
  [/apple/i, "apple"],
  [/banana/i, "banana"],
  [/berr(y|ies)|strawberry/i, "berries"],
  [/carrot/i, "carrot"],
  [/celery/i, "celery"],
  [/cheese\s*stick|string\s*cheese|cheese\b/i, "cheese"],
  [/popcorn/i, "popcorn"],
  [/chickpea/i, "chickpea"],
  [/edamame/i, "edamame"],
  [/jerky/i, "jerky"],
  [/cracker|pretzel|rice\s*cake/i, "cracker"],
  [/chocolate|cocoa|brownie|mousse|affogato/i, "chocolate"],
  [/cookie|macaroon/i, "cookie"],
  [/cake|mug\s*cake/i, "cake"],
  [/pudding|parfait/i, "pudding"],
  [/ice\s*cream|nice\s*cream|sorbet|frozen\s*yogurt|pops/i, "ice_cream"],
  [/pear/i, "pear"],
  [/peach/i, "peach"],
  [/mango/i, "mango"],
  [/date/i, "date"],
  [/fruit|watermelon|cantaloupe|orange|pineapple|grape/i, "fruit"],
  [/vegetable|veggie|stir.?fry/i, "vegetable"],
];

const CATEGORY_FALLBACK: Record<string, keyof typeof PHOTOS> = {
  Breakfast: "breakfast",
  Lunch: "lunch",
  Dinner: "dinner",
  Quick: "quick",
  Snacks: "snacks",
  Dessert: "dessert",
};

/** Resolve a food photo URL for a recipe from its title, id, and category. */
export function recipeImage(opts: {
  id: string;
  title: string;
  category: string;
}): string {
  const hay = `${opts.id} ${opts.title}`;
  for (const [re, key] of KEYWORDS) {
    if (re.test(hay)) return PHOTOS[key];
  }
  const fb = CATEGORY_FALLBACK[opts.category] ?? "bowl";
  return PHOTOS[fb];
}
