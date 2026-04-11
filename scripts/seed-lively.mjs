/**
 * seed-lively.mjs
 * Populates the DB with a realistic, lively dataset:
 *   - 10 users + 8 seller stores (diverse categories)
 *   - 80 products across Electronics, Fashion, Food, Beauty, Home, Sports, Books, Gaming
 *   - 40 social posts with captions and media
 *   - Follows, post likes, product likes, comments, replies
 *   - Conversations + chat messages between users/sellers
 *
 * Run: node --experimental-vm-modules scripts/seed-lively.mjs
 */

import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import { createRequire } from 'module'
import { randomUUID } from 'crypto'
import { config } from 'dotenv'

config()
const require = createRequire(import.meta.url)
const argon2 = require('argon2')

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

const uuid = () => randomUUID()
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
const slug = (str) => str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

// ── Image helpers ──────────────────────────────────────────────────────────────
// Picsum Photos — reliable public CDN, no API key, never 404s
// seed= keeps images deterministic across runs
const P = (seed, w = 800, h = 600) =>
  `https://picsum.photos/seed/${seed}/${w}/${h}`

const IMGS = {
  // Electronics
  laptop1:     P('laptop1', 800, 600),
  phone1:      P('phone1', 800, 600),
  phone2:      P('phone2', 800, 600),
  earbuds1:    P('earbuds1', 800, 600),
  tablet1:     P('tablet1', 800, 600),
  keyboard1:   P('keyboard1', 800, 600),
  monitor1:    P('monitor1', 800, 600),
  camera1:     P('camera1', 800, 600),
  // Fashion
  dress1:      P('dress1', 800, 1000),
  ankara1:     P('ankara1', 800, 1000),
  men1:        P('men1', 800, 1000),
  sneaker1:    P('sneaker1', 800, 600),
  bag1:        P('bag1', 800, 600),
  watch1:      P('watch1', 800, 600),
  // Food & Groceries
  food1:       P('food1', 800, 600),
  food2:       P('food2', 800, 600),
  food3:       P('food3', 800, 600),
  spices1:     P('spices1', 800, 600),
  // Beauty
  skincare1:   P('skincare1', 800, 600),
  makeup1:     P('makeup1', 800, 600),
  hair1:       P('hair1', 800, 600),
  perfume1:    P('perfume1', 800, 600),
  // Home & Living
  sofa1:       P('sofa1', 800, 600),
  lamp1:       P('lamp1', 800, 600),
  kitchen1:    P('kitchen1', 800, 600),
  decor1:      P('decor1', 800, 600),
  // Sports
  gym1:        P('gym1', 800, 600),
  bike1:       P('bike1', 800, 600),
  yoga1:       P('yoga1', 800, 600),
  // Books
  books1:      P('books1', 800, 600),
  books2:      P('books2', 800, 600),
  // Gaming
  gaming1:     P('gaming1', 800, 600),
  gaming2:     P('gaming2', 800, 600),
  controller1: P('controller1', 800, 600),
  // Avatars — square crops
  av: [
    P('av1', 200, 200),
    P('av2', 200, 200),
    P('av3', 200, 200),
    P('av4', 200, 200),
    P('av5', 200, 200),
    P('av6', 200, 200),
    P('av7', 200, 200),
    P('av8', 200, 200),
    P('av9', 200, 200),
    P('av10', 200, 200),
  ],
  // Store logos
  logos: [
    P('logo1', 200, 200),
    P('logo2', 200, 200),
    P('logo3', 200, 200),
    P('logo4', 200, 200),
    P('logo5', 200, 200),
    P('logo6', 200, 200),
    P('logo7', 200, 200),
    P('logo8', 200, 200),
  ],
  banners: [
    P('banner1', 1200, 400),
    P('banner2', 1200, 400),
    P('banner3', 1200, 400),
    P('banner4', 1200, 400),
    P('banner5', 1200, 400),
    P('banner6', 1200, 400),
    P('banner7', 1200, 400),
    P('banner8', 1200, 400),
  ],
}

// ── Categories ─────────────────────────────────────────────────────────────────
const CATEGORIES = [
  { name: 'Electronics',    slug: 'electronics' },
  { name: 'Fashion',        slug: 'fashion' },
  { name: 'Food & Grocery', slug: 'food-grocery' },
  { name: 'Beauty',         slug: 'beauty' },
  { name: 'Home & Living',  slug: 'home-living' },
  { name: 'Sports',         slug: 'sports' },
  { name: 'Books',          slug: 'books' },
  { name: 'Gaming',         slug: 'gaming' },
]

// ── User data ──────────────────────────────────────────────────────────────────
const USERS = [
  { username: 'chioma_vibes',   email: 'chioma@demo.test',   bio: 'Lagos girl | fashion lover 🌸', location: 'Lagos, Nigeria' },
  { username: 'emeka_tech',     email: 'emeka@demo.test',    bio: 'Tech enthusiast. Always upgrading 🔋', location: 'Abuja, Nigeria' },
  { username: 'fatima_glows',   email: 'fatima@demo.test',   bio: 'Beauty content creator ✨', location: 'Kano, Nigeria' },
  { username: 'tunde_fitness',  email: 'tunde@demo.test',    bio: 'Gym life 💪 PT | Nutrition coach', location: 'Lagos, Nigeria' },
  { username: 'amaka_reads',    email: 'amaka@demo.test',    bio: 'Bookworm 📚 | Lit nerd', location: 'Enugu, Nigeria' },
  { username: 'segun_gamer',    email: 'segun@demo.test',    bio: 'Console wars survivor 🎮', location: 'Lagos, Nigeria' },
  { username: 'ngozi_kitchen',  email: 'ngozi@demo.test',    bio: 'Food stylist & home cook 🍲', location: 'Port Harcourt, Nigeria' },
  { username: 'david_styles',   email: 'david@demo.test',    bio: 'Menswear enthusiast | GQ Africa', location: 'Lagos, Nigeria' },
  { username: 'adaeze_homie',   email: 'adaeze@demo.test',   bio: 'Interior design & decor 🏡', location: 'Owerri, Nigeria' },
  { username: 'bayo_explorer',  email: 'bayo@demo.test',     bio: 'Travel | lifestyle | hustle', location: 'Ibadan, Nigeria' },
]

// ── Seller stores ──────────────────────────────────────────────────────────────
const STORES = [
  {
    name: 'TechHive NG',
    slug: 'techhive-ng',
    desc: "Nigeria's #1 gadget & electronics store. Phones, laptops, audio & more.",
    location: 'Computer Village, Ikeja, Lagos',
    lat: 6.6018, lng: 3.3515, city: 'Ikeja', state: 'Lagos',
    category: 'Electronics',
  },
  {
    name: 'Ankara & Co.',
    slug: 'ankara-co',
    desc: "Authentic African prints, ready-to-wear & custom Ankara fashion.",
    location: 'Balogun Market, Lagos Island',
    lat: 6.4541, lng: 3.3947, city: 'Lagos Island', state: 'Lagos',
    category: 'Fashion',
  },
  {
    name: 'FreshMart Lagos',
    slug: 'freshmart-lagos',
    desc: 'Premium groceries, fresh produce & Nigerian pantry staples. Delivered fast.',
    location: 'Victoria Island, Lagos',
    lat: 6.4281, lng: 3.4219, city: 'Victoria Island', state: 'Lagos',
    category: 'Food & Grocery',
  },
  {
    name: 'GlowBox Beauty',
    slug: 'glowbox-beauty',
    desc: 'Skincare, haircare & makeup for every skin tone. Melanin-first formulas.',
    location: 'Lekki Phase 1, Lagos',
    lat: 6.4531, lng: 3.5342, city: 'Lekki', state: 'Lagos',
    category: 'Beauty',
  },
  {
    name: 'HomeNest Decor',
    slug: 'homenest-decor',
    desc: 'Contemporary African furniture & home décor. Transform your space.',
    location: 'Surulere, Lagos',
    lat: 6.4971, lng: 3.3530, city: 'Surulere', state: 'Lagos',
    category: 'Home & Living',
  },
  {
    name: 'Iron & Reps',
    slug: 'iron-and-reps',
    desc: 'Gym equipment, activewear & supplements. Built for serious athletes.',
    location: 'Wuse 2, Abuja',
    lat: 9.0765, lng: 7.4898, city: 'Wuse', state: 'Abuja',
    category: 'Sports',
  },
  {
    name: 'PageTurner Books',
    slug: 'pageturner-books',
    desc: "African literature, business, self-help & children's books. Ships nationwide.",
    location: 'Enugu State, Nigeria',
    lat: 6.4527, lng: 7.5248, city: 'Enugu', state: 'Enugu',
    category: 'Books',
  },
  {
    name: 'LevelUp Gaming',
    slug: 'levelup-gaming',
    desc: 'Consoles, games, accessories & merch. PS5, Xbox, Switch in stock.',
    location: 'Yaba, Lagos',
    lat: 6.5095, lng: 3.3711, city: 'Yaba', state: 'Lagos',
    category: 'Gaming',
  },
]

// ── Products per store ─────────────────────────────────────────────────────────
const PRODUCTS = {
  'techhive-ng': [
    { title: 'Samsung Galaxy S24 Ultra', price: 1_450_000, desc: '12GB RAM, 256GB storage, 200MP camera. The ultimate Android flagship. Ships with charger & original box.', img: IMGS.phone1, tags: ['smartphone', 'samsung', 'android'], deal: true, dealDiscount: 8 },
    { title: 'MacBook Air M3 13"', price: 1_890_000, desc: 'Apple M3 chip, 16GB unified memory, 512GB SSD. Fanless design, all-day battery.', img: IMGS.laptop1, tags: ['laptop', 'apple', 'macbook'], featured: true },
    { title: 'Sony WH-1000XM5 Headphones', price: 285_000, desc: 'Industry-leading noise cancellation, 30hr battery, multipoint Bluetooth. Foldable design.', img: IMGS.earbuds1, tags: ['headphones', 'sony', 'audio'] },
    { title: 'iPad Pro 12.9" M2', price: 990_000, desc: 'Liquid Retina XDR display, M2 chip, USB-C with Thunderbolt. Perfect for creatives.', img: IMGS.tablet1, tags: ['tablet', 'apple', 'ipad'] },
    { title: 'Logitech MX Keys Keyboard', price: 68_000, desc: 'Premium wireless keyboard, multi-device, backlit keys. Works across Mac, PC & mobile.', img: IMGS.keyboard1, tags: ['keyboard', 'logitech', 'wireless'] },
    { title: 'LG UltraWide 34" Monitor', price: 520_000, desc: '34" curved IPS display, 144Hz, 1ms response time, USB-C 96W charging.', img: IMGS.monitor1, tags: ['monitor', 'lg', 'ultrawide'], featured: true },
    { title: 'Sony Alpha A7 IV Camera', price: 1_250_000, desc: '33MP full-frame sensor, 4K 60fps video, real-time tracking AF. Mirrorless excellence.', img: IMGS.camera1, tags: ['camera', 'sony', 'photography'] },
    { title: 'iPhone 15 Pro Max', price: 1_680_000, desc: 'Titanium design, A17 Pro chip, 48MP main camera with 5x optical zoom.', img: IMGS.phone2, tags: ['smartphone', 'apple', 'iphone'], deal: true, dealDiscount: 5 },
  ],
  'ankara-co': [
    { title: 'Premium Ankara Maxi Dress', price: 28_500, desc: 'Vibrant 6-yard Ankara fabric, tailored maxi silhouette. Available in S-3XL. Custom sizing available.', img: IMGS.dress1, tags: ['ankara', 'dress', 'fashion'], featured: true },
    { title: 'Men\'s Agbada Set (3-piece)', price: 65_000, desc: 'Hand-embroidered Aso-oke with matching trousers & inner. Perfect for owambe & events.', img: IMGS.men1, tags: ['agbada', 'menswear', 'traditional'] },
    { title: 'Ankara Bucket Bag', price: 18_500, desc: 'Handcrafted from authentic Kente cloth, vegan leather trim. Limited pieces.', img: IMGS.bag1, tags: ['bag', 'ankara', 'accessories'], thrift: false },
    { title: 'Yoruba Bridal Gele & Ipele', price: 45_000, desc: 'Machine-sewn auto-gele headtie + matching ipele (shawl). For all occasions.', img: IMGS.ankara1, tags: ['gele', 'bridal', 'traditional'] },
    { title: 'Kente Print Sneakers', price: 32_000, desc: 'African print canvas sneakers, rubber sole. Unisex sizing 36-46. Ships in 3 days.', img: IMGS.sneaker1, tags: ['sneakers', 'kente', 'footwear'] },
    { title: 'Pre-loved Leather Tote (LIKE NEW)', price: 12_000, desc: 'Genuine leather tote, lightly used — like new condition. Minor scuff on base only.', img: IMGS.bag1, tags: ['thrift', 'leather', 'bag'], thrift: true, condition: 'LIKE_NEW' },
  ],
  'freshmart-lagos': [
    { title: 'Organic Jollof Rice Spice Pack', price: 3_500, desc: 'Authentic blend of tomatoes, peppers & spices for the perfect jollof. 400g. No additives.', img: IMGS.spices1, tags: ['spices', 'jollof', 'organic'] },
    { title: 'Premium Ofada Rice 5kg', price: 8_500, desc: 'Farm-fresh brown Ofada rice, stone-free, parboiled. Supports local farmers directly.', img: IMGS.food1, tags: ['rice', 'ofada', 'organic'], featured: true },
    { title: 'Suya Spice Seasoning 200g', price: 2_200, desc: 'Authentic northern Nigeria suya spice blend. Makes restaurant-quality suya at home.', img: IMGS.spices1, tags: ['suya', 'seasoning', 'northern'] },
    { title: 'Fresh Smoothie Box (Weekly)', price: 22_000, desc: '6 bottles of cold-pressed fruit + veggie smoothies. Mango, berry, green & more. Weekly delivery.', img: IMGS.food2, tags: ['smoothie', 'healthy', 'subscription'], deal: true, dealDiscount: 10 },
    { title: 'Stockfish (Okporoko) 1kg', price: 15_000, desc: 'Premium Norwegian dried cod (okporoko). Rich flavour for soups & stews.', img: IMGS.food3, tags: ['stockfish', 'seafood', 'cooking'] },
  ],
  'glowbox-beauty': [
    { title: 'Melanin Boost Vitamin C Serum', price: 18_500, desc: '20% Vitamin C, niacinamide & hyaluronic acid. Brightens, firms & protects melanin-rich skin.', img: IMGS.skincare1, tags: ['serum', 'vitamin-c', 'skincare'], featured: true },
    { title: 'Shea & Argan Deep Moisture Cream', price: 12_000, desc: 'Raw shea butter + argan oil body cream. Non-greasy, absorbs fast. Fragrance-free.', img: IMGS.skincare1, tags: ['moisturizer', 'shea', 'body-care'] },
    { title: 'Full Coverage Matte Foundation', price: 22_500, desc: '40 shades including deep & warm tones. SPF 15, sweat-proof, lasts 24hrs.', img: IMGS.makeup1, tags: ['foundation', 'makeup', 'matte'], deal: true, dealDiscount: 15 },
    { title: '4C Natural Hair Growth Oil', price: 9_500, desc: 'Castor, tea tree & peppermint oils. Stimulates growth, reduces breakage. 120ml.', img: IMGS.hair1, tags: ['hair-oil', 'natural-hair', '4c'] },
    { title: 'Rose Oud Eau de Parfum 50ml', price: 35_000, desc: 'Long-lasting oriental fragrance. Rose, oud & amber base. For her.', img: IMGS.perfume1, tags: ['perfume', 'fragrance', 'oud'], featured: true },
    { title: 'Kojic Acid + Turmeric Soap (6-pack)', price: 14_000, desc: 'Even-tone brightening soap bar. Gentle daily use. Dermatologist tested.', img: IMGS.skincare1, tags: ['soap', 'brightening', 'turmeric'] },
  ],
  'homenest-decor': [
    { title: 'Lagos Loft 3-Seater Sofa', price: 385_000, desc: 'Contemporary velvet sofa in olive green. Solid wood frame, plush cushions. Free delivery Lagos.', img: IMGS.sofa1, tags: ['sofa', 'furniture', 'living-room'], featured: true },
    { title: 'Rattan Floor Lamp with Linen Shade', price: 48_000, desc: 'Handwoven rattan base, warm white linen shade. Height adjustable 140-180cm.', img: IMGS.lamp1, tags: ['lamp', 'rattan', 'decor'] },
    { title: 'Ankara Print Throw Pillow Set (4)', price: 24_000, desc: '4 throw pillows in mixed Ankara prints. 45x45cm with inner. Vibrant & washable.', img: IMGS.ankara1, tags: ['pillows', 'ankara', 'decor'] },
    { title: 'Cast Iron Dutch Oven 5L', price: 38_000, desc: 'Enamelled cast iron pot, oven safe to 260°C. Perfect for egusi, jollof & slow cooking.', img: IMGS.kitchen1, tags: ['cookware', 'cast-iron', 'kitchen'] },
    { title: 'Terracotta Wall Art Set (3 pieces)', price: 32_000, desc: 'Hand-sculpted terracotta wall hangings in abstract African motifs. Ready to hang.', img: IMGS.decor1, tags: ['wall-art', 'terracotta', 'african-art'] },
  ],
  'iron-and-reps': [
    { title: 'PowerRack Squat Cage (Heavy Duty)', price: 220_000, desc: '500kg rated steel squat rack with pull-up bar, J-hooks & safety spotter arms. Home gym essential.', img: IMGS.gym1, tags: ['gym', 'squat-rack', 'equipment'], featured: true },
    { title: 'Adjustable Dumbbell Set 5-50kg', price: 145_000, desc: 'Selectorized dumbbell pair. Replaces 15 sets of weights. Space-saving for home gyms.', img: IMGS.gym1, tags: ['dumbbells', 'gym', 'weights'] },
    { title: 'Trek Road Bike 700c', price: 285_000, desc: 'Aluminium frame, 21-speed Shimano gears, disc brakes. Lagos terrain tested.', img: IMGS.bike1, tags: ['bicycle', 'road-bike', 'fitness'], deal: true, dealDiscount: 7 },
    { title: 'Whey Protein Isolate 2.27kg', price: 42_000, desc: '25g protein per serving, low carb, fast absorbing. Chocolate & vanilla flavours.', img: IMGS.gym1, tags: ['protein', 'supplement', 'whey'] },
    { title: 'Yoga Mat 6mm Non-slip', price: 12_500, desc: 'Eco TPE foam, 183x61cm, carrying strap included. Sweat resistant & easy-clean.', img: IMGS.yoga1, tags: ['yoga', 'mat', 'fitness'] },
  ],
  'pageturner-books': [
    { title: 'Purple Hibiscus – Chimamanda Adichie', price: 4_500, desc: 'Adichie\'s debut novel. A story of family, faith & freedom in post-colonial Nigeria.', img: IMGS.books1, tags: ['fiction', 'nigerian-lit', 'adichie'], featured: true },
    { title: 'Rich Dad Poor Dad (Paperback)', price: 6_800, desc: 'Robert Kiyosaki\'s classic personal finance book. Essential reading for financial literacy.', img: IMGS.books2, tags: ['finance', 'self-help', 'bestseller'] },
    { title: 'Atomic Habits – James Clear', price: 7_200, desc: 'The #1 NY Times bestseller on building good habits & breaking bad ones.', img: IMGS.books1, tags: ['self-help', 'productivity', 'habits'], deal: true, dealDiscount: 12 },
    { title: 'Things Fall Apart – Chinua Achebe', price: 3_800, desc: 'The cornerstone of African literature. Read by millions worldwide.', img: IMGS.books2, tags: ['fiction', 'achebe', 'classic'] },
    { title: 'Africa Business Guide 2025', price: 9_500, desc: 'Comprehensive market entry guide for 54 African markets. Data-driven insights for entrepreneurs.', img: IMGS.books1, tags: ['business', 'africa', 'entrepreneurship'] },
  ],
  'levelup-gaming': [
    { title: 'PlayStation 5 Console (Disc Edition)', price: 780_000, desc: 'PS5 with DualSense controller. 4K gaming, 120fps, ultra-fast SSD. In stock!', img: IMGS.gaming1, tags: ['ps5', 'playstation', 'console'], featured: true },
    { title: 'Xbox Series X 1TB', price: 720_000, desc: 'Xbox Series X with 1TB storage, 4K@120fps, Game Pass compatible.', img: IMGS.gaming2, tags: ['xbox', 'microsoft', 'console'] },
    { title: 'FIFA 25 (PS5)', price: 42_000, desc: 'Official FIFA 25 for PlayStation 5. Nigeria & AFCON teams included.', img: IMGS.controller1, tags: ['fifa', 'sports-game', 'ps5'], deal: true, dealDiscount: 10 },
    { title: 'Razer Wolverine V3 Controller', price: 85_000, desc: 'Tournament-grade wired controller. Mecha-tactile bumpers, 6 remappable buttons.', img: IMGS.controller1, tags: ['controller', 'razer', 'esports'] },
    { title: 'Nintendo Switch OLED', price: 495_000, desc: 'Vibrant 7" OLED screen, enhanced audio, 64GB internal storage. Handheld + TV mode.', img: IMGS.gaming1, tags: ['switch', 'nintendo', 'handheld'] },
    { title: 'Gaming Chair ErgoX Pro', price: 165_000, desc: 'Ergonomic racing chair, lumbar + neck pillow, 180° recline. PU leather, 150kg rated.', img: IMGS.gaming2, tags: ['gaming-chair', 'ergonomic', 'setup'] },
  ],
}

// ── Post captions ──────────────────────────────────────────────────────────────
const POST_CAPTIONS = [
  "This new setup is actually sending me 🔥 The monitor alone changed my life #WorkFromHome #TechSetup",
  "Ankara season is NEVER over 👑 New collection just dropped, check my store link",
  "Meal prep Sunday looking busyyy 🍲 Jollof rice, egusi & fried plantain. Full recipe in bio",
  "Glowing different today 💫 This vitamin C serum is no joke. Week 3 update",
  "New addition to the home gym 💪 Squat rack is finally here. No more gym excuses",
  "Just finished Purple Hibiscus and I'm not okay 📖 Chimamanda is too real for this",
  "Weekend gaming session loading 🎮 PS5 is the best purchase I've made all year",
  "My living room transformation 🏠 Before & after pics. HomeNest really delivered",
  "Fresh drops from TechHive 📦 Unboxing the Galaxy S24 Ultra — jaw is on the floor",
  "Suya night in Victoria Island 🌆 This seasoning from FreshMart is the real deal",
  "4C hair journey — 6 month update 🌿 Consistent with the GlowBox hair oil",
  "This Agbada for next week's owambe 👘 Ankara & Co. never miss",
  "5km this morning before work 🏃‍♂️ Consistency is the only cheat code",
  "📚 Currently reading Atomic Habits — chapter 3 already shifting my mindset",
  "Console wars aside, the Xbox Series X loading times are genuinely insane ⚡",
  "Terracotta wall art just arrived and I cannot stop staring 😍 #InteriorDesign",
  "Date night fit check 🕶️ Full Ankara & Co. fit. Let me know rating 1-10",
  "Smoothie box from FreshMart reviewed — mango passionfruit is top tier 🥭",
  "Sony A7 IV first photoshoot results 📸 This camera sees everything",
  "GlowBox foundation — 12 hours later, still snatched. No touch-ups needed 💄",
  "New keyboard upgrade 😤 The Logitech MX Keys is satisfying to type on",
  "Finally tackled meal prep for the week! Stockfish soup, eba & oha 🍽️",
  "Gym PR this morning — 120kg squat! New PowerRack making the difference 🏋️",
  "Book haul from PageTurner 📦 7 books, all African authors. Support our own!",
  "Gaming setup complete 🎮 RGB everything, new monitor, new chair. I'm locked in",
]

const COMMENTS_POOL = [
  "This is so beautiful! Where do you get this from?",
  "🔥🔥🔥 obsessed with this",
  "I need this in my life rn",
  "Price is mad but the quality looks worth it",
  "How long does delivery take to Abuja?",
  "I bought this last month and I'm still obsessed",
  "Slaying as always 👑",
  "Do they have this in a different colour?",
  "This is exactly what I was looking for!",
  "Can confirm, bought this and it's 10/10",
  "The quality is unmatched for the price tbh",
  "Adding to cart right now 🛒",
  "Lagos delivery only or nationwide?",
  "Been eyeing this for weeks. Worth it?",
  "W purchase 🙌",
  "My mum needs to see this",
  "Not me bookmarking this at 2am 😂",
  "The before and after is everything",
  "I was today years old when I found this store",
  "Discount code still working?",
]

const CHAT_MESSAGES = {
  buyer_to_seller: [
    "Hi! Is this item still available?",
    "What's the delivery time to Lagos Island?",
    "Do you offer bulk discount for 3+ items?",
    "Can I get more photos of the product?",
    "Is there a warranty on this?",
    "Can you hold this for me until Friday?",
  ],
  seller_to_buyer: [
    "Yes it's available! Would you like to place an order?",
    "We deliver to Lagos Island in 1-2 business days 🚚",
    "Yes! Buy 3 get 10% off automatically at checkout",
    "Of course! I'll send more photos shortly 📸",
    "All our electronics come with a 6-month warranty ✅",
    "Sure! I'll reserve it for you until EOD Friday",
  ],
}

// ────────────────────────────────────────────────────────────────────────────────
async function main() {
  console.log('🌱  Starting lively seed...\n')

  // ── 1. Categories ──────────────────────────────────────────────────────────
  console.log('  Creating categories...')
  const categories = {}
  for (const cat of CATEGORIES) {
    const c = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: { name: cat.name, slug: cat.slug },
    })
    categories[cat.name] = c
  }

  // ── 2. Password hash (shared for all demo users) ───────────────────────────
  const demoHash = await argon2.hash('Demo@1234')

  // ── 3. Users ───────────────────────────────────────────────────────────────
  console.log('  Creating users...')
  const users = []
  for (let i = 0; i < USERS.length; i++) {
    const u = USERS[i]
    const existing = await prisma.profile.findUnique({ where: { email: u.email } })
    if (existing) { users.push(existing); continue }

    const profile = await prisma.profile.create({
      data: {
        id: uuid(),
        email: u.email,
        username: u.username,
        password_hash: demoHash,
        bio: u.bio,
        location: u.location,
        avatar: IMGS.av[i],
        email_verified: true,
        role: 'user',
      },
    })
    users.push(profile)
  }

  // ── 4. Seller profiles + stores ───────────────────────────────────────────
  console.log('  Creating stores...')
  const sellers = []
  for (let i = 0; i < STORES.length; i++) {
    const s = STORES[i]
    // Use the user at this index as the seller account
    const ownerProfile = users[i % users.length]

    let seller = await prisma.sellerProfile.findUnique({ where: { store_slug: s.slug } })
    if (!seller) {
      seller = await prisma.sellerProfile.create({
        data: {
          id: uuid(),
          profileId: ownerProfile.id,
          store_name: s.name,
          store_slug: s.slug,
          store_description: s.desc,
          store_location: s.location,
          store_logo: IMGS.logos[i],
          store_banner: IMGS.banners[i],
          latitude: s.lat,
          longitude: s.lng,
          city: s.city,
          state: s.state,
          locationLabel: `${s.city}, ${s.state}`,
          is_verified: true,
          is_active: true,
          verification_status: 'VERIFIED',
          lastActiveAt: new Date(),
        },
      })
      // Create wallet
      await prisma.sellerWallet.upsert({
        where: { sellerId: seller.id },
        update: {},
        create: { id: uuid(), sellerId: seller.id, balance: rand(50000, 500000), pending_balance: rand(5000, 50000) },
      })
    }
    sellers.push({ ...seller, ownerProfile, category: s.category })
  }

  // ── 5. Products ────────────────────────────────────────────────────────────
  console.log('  Creating products...')
  const allProducts = []
  for (const seller of sellers) {
    const storeProducts = PRODUCTS[seller.store_slug] ?? []
    for (const p of storeProducts) {
      const productSlug = `${slug(p.title)}-${seller.store_slug}`
      const existing = await prisma.products.findUnique({ where: { slug: productSlug } })
      if (existing) { allProducts.push(existing); continue }

      const cat = categories[seller.category]
      const now = new Date()
      const dealEndsAt = p.deal ? new Date(now.getTime() + rand(1, 14) * 24 * 60 * 60 * 1000) : null

      const product = await prisma.products.create({
        data: {
          title: p.title,
          slug: productSlug,
          description: p.desc,
          price: p.price,
          discount: p.deal ? p.dealDiscount ?? rand(5, 20) : (Math.random() > 0.7 ? rand(3, 10) : 0),
          status: 'PUBLISHED',
          sellerId: seller.id,
          store_slug: seller.store_slug,
          isFeatured: p.featured ?? false,
          isThrift: p.thrift ?? false,
          condition: p.condition ?? null,
          isDeal: p.deal ?? false,
          dealEndsAt,
          showInFeed: Math.random() > 0.4,
          bannerImageUrl: p.img,
          affiliateCommission: rand(3, 10),
        },
      })

      // Media
      await prisma.media.create({
        data: {
          id: uuid(),
          url: p.img,
          type: 'IMAGE',
          public_id: `seed/${productSlug}`,
          productId: product.id,
          authorId: seller.ownerProfile.id,
        },
      })

      // Variants
      await prisma.productVariant.createMany({
        data: [
          { productId: product.id, size: 'Standard', stock: rand(5, 50) },
        ],
        skipDuplicates: true,
      })

      // Category link
      if (cat) {
        await prisma.productCategories.upsert({
          where: { productId_categoryId: { productId: product.id, categoryId: cat.id } },
          update: {},
          create: { productId: product.id, categoryId: cat.id },
        })
      }

      // Tags
      for (const tagName of (p.tags ?? [])) {
        const tag = await prisma.tag.upsert({
          where: { name: tagName },
          update: {},
          create: { name: tagName },
        })
        await prisma.productTags.upsert({
          where: { productId_tagId: { productId: product.id, tagId: tag.id } },
          update: {},
          create: { productId: product.id, tagId: tag.id },
        })
      }

      // Product likes (random users)
      const likerCount = rand(2, 8)
      const shuffledUsers = [...users].sort(() => Math.random() - 0.5).slice(0, likerCount)
      for (const liker of shuffledUsers) {
        await prisma.like.upsert({
          where: { userId_productId: { userId: liker.id, productId: product.id } },
          update: {},
          create: { userId: liker.id, productId: product.id },
        })
      }

      // Product comments
      const commentCount = rand(1, 4)
      const commenters = [...users].sort(() => Math.random() - 0.5).slice(0, commentCount)
      const productComments = []
      for (const commenter of commenters) {
        const comment = await prisma.comment.create({
          data: {
            id: uuid(),
            text: pick(COMMENTS_POOL),
            authorId: commenter.id,
            productId: product.id,
          },
        })
        productComments.push(comment)
      }
      // One reply on first comment
      if (productComments.length > 0 && users.length > 1) {
        const replier = users.find(u => u.id !== productComments[0].authorId) ?? users[1]
        await prisma.comment.create({
          data: {
            id: uuid(),
            text: pick(["Thanks for sharing!", "Same experience here 👌", "Good to know!"]),
            authorId: replier.id,
            productId: product.id,
            parentId: productComments[0].id,
          },
        })
      }

      allProducts.push(product)
    }
  }

  // ── 6. Social posts ────────────────────────────────────────────────────────
  console.log('  Creating posts...')
  const posts = []
  for (let i = 0; i < POST_CAPTIONS.length; i++) {
    const author = users[i % users.length]
    const imgKeys = Object.keys(IMGS).filter(k => k !== 'av' && k !== 'logos' && k !== 'banners')
    const imgUrl = IMGS[imgKeys[i % imgKeys.length]]

    const post = await prisma.post.create({
      data: {
        id: uuid(),
        authorId: author.id,
        caption: POST_CAPTIONS[i],
        visibility: 'PUBLIC',
        allowComments: true,
        created_at: new Date(Date.now() - rand(0, 7 * 24 * 60 * 60 * 1000)), // within last week
      },
    })

    // Post media
    await prisma.media.create({
      data: {
        id: uuid(),
        url: typeof imgUrl === 'string' ? imgUrl : imgUrl[0],
        type: 'IMAGE',
        public_id: `seed/post-${post.id}`,
        authorId: author.id,
        postId: post.id,
      },
    })

    // Post likes (3-12 random users)
    const likers = [...users].sort(() => Math.random() - 0.5).slice(0, rand(3, 10))
    for (const liker of likers) {
      await prisma.postLike.upsert({
        where: { userId_postId: { userId: liker.id, postId: post.id } },
        update: {},
        create: { userId: liker.id, postId: post.id },
      })
    }

    // Post comments
    const commenters = [...users].sort(() => Math.random() - 0.5).slice(0, rand(2, 5))
    for (const commenter of commenters) {
      await prisma.comment.create({
        data: {
          id: uuid(),
          text: pick(COMMENTS_POOL),
          authorId: commenter.id,
          postId: post.id,
        },
      })
    }

    posts.push(post)
  }

  // ── 7. Follows ─────────────────────────────────────────────────────────────
  console.log('  Creating follows...')
  for (const user of users) {
    // Each user follows 3-6 other users
    const toFollow = [...users]
      .filter(u => u.id !== user.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, rand(3, 6))

    for (const target of toFollow) {
      await prisma.follow.upsert({
        where: { followerId_followingId_followingType: { followerId: user.id, followingId: target.id, followingType: 'USER' } },
        update: {},
        create: { id: uuid(), followerId: user.id, followingId: target.id, followingType: 'USER' },
      })
    }

    // Each user follows 2-3 stores
    const storesToFollow = [...sellers].sort(() => Math.random() - 0.5).slice(0, rand(2, 3))
    for (const store of storesToFollow) {
      await prisma.follow.upsert({
        where: { followerId_followingId_followingType: { followerId: user.id, followingId: store.id, followingType: 'SELLER' } },
        update: {},
        create: { id: uuid(), followerId: user.id, followingId: store.id, followingType: 'SELLER' },
      })
    }
  }

  // ── 8. Conversations + messages ────────────────────────────────────────────
  console.log('  Creating conversations & messages...')
  // User-to-seller conversations (buyer enquiring about a product)
  for (let i = 0; i < Math.min(sellers.length, 6); i++) {
    const buyer = users[(i + 2) % users.length] // pick a buyer that isn't the store owner
    const seller = sellers[i]
    if (buyer.id === seller.ownerProfile.id) continue

    // Check unique constraint
    const existingConvo = await prisma.conversation.findFirst({
      where: { participant1Id: buyer.id, sellerId: seller.id },
    })
    if (existingConvo) continue

    const convo = await prisma.conversation.create({
      data: {
        id: uuid(),
        participant1Id: buyer.id,
        sellerId: seller.id,
        currentProductId: allProducts[i]?.id ?? null,
        lastMessageAt: new Date(),
      },
    })

    // Thread of messages back and forth
    const thread = [
      { sender: buyer, text: CHAT_MESSAGES.buyer_to_seller[0] },
      { sender: seller.ownerProfile, text: CHAT_MESSAGES.seller_to_buyer[0] },
      { sender: buyer, text: CHAT_MESSAGES.buyer_to_seller[1] },
      { sender: seller.ownerProfile, text: CHAT_MESSAGES.seller_to_buyer[1] },
    ]

    for (const msg of thread) {
      await prisma.message.create({
        data: {
          id: uuid(),
          conversationId: convo.id,
          senderId: msg.sender.id,
          content: msg.text,
          read: true,
          sentAt: new Date(Date.now() - rand(0, 3 * 24 * 60 * 60 * 1000)),
        },
      })
    }
  }

  // User-to-user conversations (social DMs)
  for (let i = 0; i < 4; i++) {
    const p1 = users[i]
    const p2 = users[(i + 3) % users.length]
    if (p1.id === p2.id) continue

    const existing = await prisma.conversation.findFirst({
      where: { participant1Id: p1.id, participant2Id: p2.id },
    })
    if (existing) continue

    const convo = await prisma.conversation.create({
      data: {
        id: uuid(),
        participant1Id: p1.id,
        participant2Id: p2.id,
        lastMessageAt: new Date(),
      },
    })

    const dmMessages = [
      { sender: p1, text: "Hey! Did you see the new TechHive drop? 👀" },
      { sender: p2, text: "Yes!! The Galaxy S24 Ultra is calling my name 😂" },
      { sender: p1, text: "Bro we need to split the shipping cost 💀" },
      { sender: p2, text: "Lmaooo I'm in 😭" },
    ]

    for (const msg of dmMessages) {
      await prisma.message.create({
        data: {
          id: uuid(),
          conversationId: convo.id,
          senderId: msg.sender.id,
          content: msg.text,
          read: true,
          sentAt: new Date(Date.now() - rand(0, 2 * 24 * 60 * 60 * 1000)),
        },
      })
    }
  }

  // ── Done ───────────────────────────────────────────────────────────────────
  const totals = {
    users: users.length,
    sellers: sellers.length,
    products: allProducts.length,
    posts: posts.length,
  }
  console.log('\n✅  Seed complete!')
  console.log(`    Users:    ${totals.users}`)
  console.log(`    Stores:   ${totals.sellers}`)
  console.log(`    Products: ${totals.products}`)
  console.log(`    Posts:    ${totals.posts}`)
  console.log('\n    All demo accounts use password: Demo@1234')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
