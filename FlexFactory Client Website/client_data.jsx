// client_data.jsx — marketplace data for the FlexFactory client/buyer experience

/* ---------------- Hero / promo slides ---------------- */
const HERO_SLIDES = [
  { tag: 'Q2 PROMO', off: '-100 % OFF', title: 'First PCB order free.', sub: 'SAR 500 credit on 2-layer boards', cta: 'Claim offer' },
  { tag: 'NEW VENDORS', off: '12 shops', title: 'CNC, on demand.', sub: '5-axis milling from 9 verified shops in Riyadh', cta: 'Browse CNC' },
  { tag: 'MEMBER PERK', off: 'Save 15%', title: 'One pass, every shop.', sub: 'Subscriber pricing across the whole platform', cta: 'View plans' },
];

/* ---------------- Category chips ---------------- */
const JOB_CHIPS = ['Featured', '3D Printing', 'PCB Fab', 'Laser', 'CNC', 'Molding', 'Mailing'];
const SPACE_CHIPS = ['Featured', 'Wet Bench', 'Shop Floor Desk', 'Electrical Desk', 'Mechanical Desk', 'Lab'];

/* ---------------- Filter tree (browse sidebar) ---------------- */
const FILTER_TREE = [
  { label: '3D Printing', kids: ['FDM / FFF', 'SLA / Resin', 'SLS'] },
  { label: 'Sheet Fabrication', kids: ['Laser', 'Plasma', 'Waterjet'], open: true },
  { label: 'CNC Machining', kids: ['3-Axis', '5-Axis', 'Turning'] },
  { label: 'Electronics', kids: ['PCB Fab', 'Assembly', 'Reflow'] },
];
const LOCATIONS = ['Riyadh', 'Jeddah', 'Dammam', 'Khobar', 'Mecca'];
const RATING_OPTS = ['4.5 & up', '4.0 & up', '3.5 & up', 'Any'];
const DEAL_OPTS = ['On sale', 'Featured', 'New this week', 'Subscriber-only'];

/* ---------------- Vendors ---------------- */
// reused across listings for believable repetition
const VENDORS = [
  { name: 'Circuit Guild', city: 'Dammam' },
  { name: 'Vertex Fabrication', city: 'Riyadh' },
  { name: 'Atlas Makerworks', city: 'Jeddah' },
  { name: 'Northgate Labs', city: 'Khobar' },
  { name: 'Forge & Form', city: 'Riyadh' },
];

/* ---------------- Listings — Jobs (services / products to quote) ---------------- */
// badge tones: lime (FEATURED/NEW), blue (TOP), red (% OFF)
const JOBS = [
  { id: 'J-1', kind: 'job', title: '6-Layer PCB · HASL Finish', vendor: 'Circuit Guild', city: 'Dammam', rating: 5.0, reviews: 137, tags: ['PCB Fab', 'Multilayer'], cat: 'PCB Fab', icon: 'grid', badge: { l: 'FEATURED', t: 'lime' }, off: 25, featured: true, blurb: 'Turnkey multilayer fabrication with controlled-impedance stack-ups and 24-hour express options.' },
  { id: 'J-2', kind: 'job', title: 'FDM Print · PLA / PETG / ABS', vendor: 'Vertex Fabrication', city: 'Riyadh', rating: 5.0, reviews: 137, tags: ['3D Print', 'FDM'], cat: '3D Printing', icon: 'box', badge: { l: 'TOP #1', t: 'blue' }, off: 0, featured: true, blurb: 'Industrial FDM farm — up to 300×300×400 mm, fast turnaround on functional prototypes.' },
  { id: 'J-3', kind: 'job', title: 'Prototype PCB · Quick-turn', vendor: 'Circuit Guild', city: 'Dammam', rating: 5.0, reviews: 137, tags: ['PCB Fab', 'Multilayer'], cat: 'PCB Fab', icon: 'grid', badge: { l: 'FEATURED', t: 'lime' }, off: 7, featured: true, blurb: 'Bare boards in 48 hours. ENIG or HASL, soldermask in six colors.' },
  { id: 'J-4', kind: 'job', title: 'Bandsaw Cutting · Metal & Wood', vendor: 'Forge & Form', city: 'Riyadh', rating: 5.0, reviews: 137, tags: ['Cutting', 'Sheet'], cat: 'Laser', icon: 'tools', badge: { l: 'NEW', t: 'lime' }, off: 18, blurb: 'Precision stock cutting to length with deburring included.' },
  { id: 'J-5', kind: 'job', title: 'Resin (SLA) High-Detail Prints', vendor: 'Vertex Fabrication', city: 'Riyadh', rating: 5.0, reviews: 137, tags: ['3D Print', 'SLA'], cat: '3D Printing', icon: 'box', off: 0, blurb: '8K resin detail for miniatures, jewelry masters and dental.' },
  { id: 'J-6', kind: 'job', title: 'Flex PCB · Polyimide', vendor: 'Circuit Guild', city: 'Dammam', rating: 5.0, reviews: 137, tags: ['PCB Fab', 'Flex'], cat: 'PCB Fab', icon: 'grid', off: 7, blurb: 'Single and double-sided flex circuits with stiffeners.' },
  { id: 'J-7', kind: 'job', title: 'Laser Cut · Acrylic & Ply', vendor: 'Atlas Makerworks', city: 'Jeddah', rating: 5.0, reviews: 137, tags: ['Laser', 'Sheet'], cat: 'Laser', icon: 'layers', off: 0, blurb: 'CO₂ laser cutting and engraving up to 1200×900 mm beds.' },
  { id: 'J-8', kind: 'job', title: '5-Axis CNC Milling', vendor: 'Northgate Labs', city: 'Khobar', rating: 5.0, reviews: 137, tags: ['CNC', 'Aluminium'], cat: 'CNC', icon: 'tools', badge: { l: 'TOP #5', t: 'blue' }, off: 0, blurb: 'Tight-tolerance machined parts in aluminium, brass and POM.' },
  { id: 'J-9', kind: 'job', title: 'Bandsaw Cutting · Heavy Stock', vendor: 'Forge & Form', city: 'Riyadh', rating: 5.0, reviews: 137, tags: ['Cutting', 'Metal'], cat: 'Laser', icon: 'tools', off: 18, blurb: 'Horizontal bandsaw for bar and tube up to 250 mm.' },
  { id: 'J-10', kind: 'job', title: 'SMT Assembly · Reflow', vendor: 'Circuit Guild', city: 'Dammam', rating: 5.0, reviews: 137, tags: ['Assembly', 'SMT'], cat: 'PCB Fab', icon: 'grid', off: 0, blurb: 'Stencil, pick-and-place and reflow for small to medium runs.' },
  { id: 'J-11', kind: 'job', title: 'Anodizing & Finishing', vendor: 'Northgate Labs', city: 'Khobar', rating: 5.0, reviews: 137, tags: ['Finishing', 'Metal'], cat: 'CNC', icon: 'layers', off: 0, blurb: 'Type-II anodize in eight colours, bead-blast and passivation.' },
  { id: 'J-12', kind: 'job', title: 'Silicone & Resin Molding', vendor: 'Atlas Makerworks', city: 'Jeddah', rating: 5.0, reviews: 137, tags: ['Molding', 'Casting'], cat: 'Molding', icon: 'box', off: 0, blurb: 'Low-volume vacuum casting from your master or our print.' },
];

/* ---------------- Listings — Spaces (bookable desks / labs) ---------------- */
const SPACES = [
  { id: 'S-1', kind: 'space', title: 'Shared Workshop Bay', vendor: 'Forge & Form', city: 'Riyadh', rating: 5.0, reviews: 137, tags: ['Maker Space', 'Tools'], cat: 'Shop Floor Desk', icon: 'tools', badge: { l: 'FEATURED', t: 'lime' }, off: 30, featured: true, from: 86.25, blurb: 'Fully-equipped bay with rolling tool chest, bench and Wi-Fi.' },
  { id: 'S-2', kind: 'space', title: 'Electrical Desk · Bay 04', vendor: 'Northgate Labs', city: 'Riyadh', rating: 4.9, reviews: 127, tags: ['Electronics', 'ESD-safe'], cat: 'Electrical Desk', icon: 'grid', badge: { l: 'FEATURED', t: 'lime' }, sub: true, from: 25, blurb: 'ESD-safe electronics workbench with scope, supply and rework station.' },
  { id: 'S-3', kind: 'space', title: 'Wet Bench · Chemistry', vendor: 'Northgate Labs', city: 'Khobar', rating: 5.0, reviews: 137, tags: ['Lab', 'Ventilated'], cat: 'Wet Bench', icon: 'building', badge: { l: 'NEW', t: 'lime' }, off: 5, from: 86.25, blurb: 'Ventilated wet bench with fume extraction and PPE.' },
  { id: 'S-4', kind: 'space', title: 'Mechanical Desk · Assembly', vendor: 'Atlas Makerworks', city: 'Jeddah', rating: 5.0, reviews: 137, tags: ['Assembly', 'Bench'], cat: 'Mechanical Desk', icon: 'tools', badge: { l: 'NEW', t: 'lime' }, off: 10, from: 86.25, blurb: 'Heavy assembly bench with vice, press and air line.' },
  { id: 'S-5', kind: 'space', title: 'Photo / Product Studio', vendor: 'Vertex Fabrication', city: 'Riyadh', rating: 5.0, reviews: 137, tags: ['Studio', 'Lighting'], cat: 'Shop Floor Desk', icon: 'image', off: 0, from: 120, blurb: 'Lighting rig, backdrops and tripods for product shots.' },
  { id: 'S-6', kind: 'space', title: 'Resin Lab · Ventilated', vendor: 'Vertex Fabrication', city: 'Riyadh', rating: 5.0, reviews: 137, tags: ['Lab', 'UV Cure'], cat: 'Lab', icon: 'building', off: 0, from: 64, blurb: 'Resin printing lab with UV cure station and extraction.' },
  { id: 'S-7', kind: 'space', title: 'Electronics Lab · Bay 02', vendor: 'Northgate Labs', city: 'Khobar', rating: 5.0, reviews: 137, tags: ['Electronics', 'ESD-safe'], cat: 'Electrical Desk', icon: 'grid', off: 0, from: 28, blurb: 'Second ESD bay — same kit, quieter corner.' },
  { id: 'S-8', kind: 'space', title: 'CNC Operator Station', vendor: 'Northgate Labs', city: 'Khobar', rating: 5.0, reviews: 137, tags: ['CNC', 'Supervised'], cat: 'Mechanical Desk', icon: 'tools', off: 0, from: 96, blurb: 'Supervised access to a 3-axis mill with operator on call.' },
];

/* ---------------- Rich space detail (Electrical Desk · Bay 04) ---------------- */
const SPACE_DETAIL = {
  id: 'S-2',
  title: 'Electrical Desk · Bay 04',
  crumb: ['Home', 'Spaces', 'Electronics Lab', 'Electrical Desk'],
  rating: 4.9, bookings: 127, location: 'King Fahd District, Riyadh', available: 'Available now',
  gallery: ['Workbench', 'Oscilloscope', 'Power supply', 'Storage', 'Soldering', 'Lighting', 'Wide view', 'Access'],
  badges: [{ l: 'Instant Book', t: 'blue' }, { l: 'ESD-Certified', t: 'pos' }, { l: '24/7 Member Pass', t: 'warn' }],
  info: [
    ['Capacity', '1 person · solo desk'], ['Bench size', '180 × 75 cm · ESD-safe'],
    ['Power', '8× 220V outlets · grounded'], ['Network', 'Gigabit Ethernet · Wi-Fi 6'],
    ['Lighting', '5000K task lamp · dimmable'], ['Ventilation', 'Fume extractor on-bench'],
    ['Min. booking', '1 hour'], ['Cancellation', 'Free up to 4h before'],
    ['Operating hours', '8:00 AM – 10:00 PM · 7 days'], ['Access', 'Keypad code via SMS'],
  ],
  pricing: { hour: 25, day: 150, week: 750, occupancy: 68, repeat: 82, discount: 15, next: 'Today, 2:00 PM' },
  included: [
    { name: 'Soldering Station', spec: 'Hakko FX-888D · 350°C', note: 'Tip cleaner included', icon: 'tools', tone: '#FBF1D8' },
    { name: 'Oscilloscope', spec: 'Rigol DS1054Z · 4-ch · 50 MHz', note: 'Probes included (×4)', icon: 'chart', tone: 'rgba(1,53,244,0.10)' },
    { name: 'DC Power Supply', spec: 'Bench · 0–30V · 0–5A', note: 'Banana leads included', icon: 'wallet', tone: 'var(--neg-bg)' },
    { name: 'Digital Multimeter', spec: 'Fluke 117 · True-RMS', note: 'Test leads included', icon: 'gear', tone: '#FBF1D8' },
    { name: 'Hot Air Rework Station', spec: 'Atten 858D · SMD-friendly', note: '3 nozzle sizes', icon: 'tools', tone: '#FBE3D8' },
    { name: 'Stereo Microscope', spec: '7×–45× zoom · LED ring', note: 'Articulating arm', icon: 'eye', tone: 'rgba(91,107,214,0.16)' },
    { name: 'ESD Mat & Wrist Strap', spec: 'Grounded · ANSI/ESD compliant', note: 'Daily resistance check', icon: 'layers', tone: 'var(--pos-bg)' },
    { name: 'Hand Tool Kit', spec: 'Pliers, cutters, drivers, tweezers', note: 'Sealed kit per booking', icon: 'box', tone: 'rgba(91,107,214,0.16)' },
  ],
  tiers: [
    { id: 'hour', kicker: 'FLEXIBLE', name: 'Hourly', price: 25, unit: '/ hour', note: 'Min 1 hour · cancel up to 4h before', icon: 'clock' },
    { id: 'day', kicker: 'DAY PASS · 8 HOURS', name: 'Day', price: 150, unit: '/ day', save: 'SAVE 25%', popular: true, note: 'Equivalent of 6 hours · enter/exit any time same day', icon: 'calendar' },
    { id: 'week', kicker: 'WEEK PASS · 5 DAYS', name: 'Week', price: 750, unit: '/ week', save: 'SAVE 38%', saveTone: 'purple', note: '5 consecutive days · includes locker & storage', icon: 'calendar' },
  ],
  addons: [
    { id: 'printer', name: '3D Printer Access', desc: 'PLA prints up to 220 mm cubed · Prusa MK4 in adjacent bay', price: 50, unit: '/ session', icon: 'box', on: true },
    { id: 'kit', name: 'Component Starter Kit', desc: 'Resistors, caps, LEDs, headers, jumpers, breadboard', price: 75, unit: '/ kit', icon: 'grid' },
    { id: 'locker', name: 'Storage Locker', desc: 'Leave a project between visits · 40 × 30 × 30 cm · keypad lock', price: 15, unit: '/ day', icon: 'box' },
    { id: 'expert', name: 'Expert Assistance', desc: 'On-call electrical engineer for debugging, design review, layout', price: 120, unit: '/ hour', premium: true, icon: 'users' },
  ],
  place: {
    name: 'FLEX Factory Maker Hub', address: 'Building 4, King Fahd District, Riyadh 12251',
    hours: '8:00 AM – 10:00 PM · 7 days/wk', hoursNote: 'After-hours access available for week-pass holders',
    steps: ['Park in Lot B (free for members)', 'Enter via main door using your unique keypad code', 'Bay 04 is on the left, second from the entrance'],
  },
};

/* ---------------- Rich job detail (keyed by listing id) ---------------- */
// Jobs in the "3D Printing" category render the live instant-quote engine embedded
// in the page; the spec/vendor content below frames it.
const JOB_DETAILS = {
  'J-2': {
    id: 'J-2',
    crumb: ['Home', 'Jobs', '3D Printing', 'FDM / FFF'],
    location: 'Industrial City 2, Riyadh',
    available: 'Quoting instantly',
    quote: true,                 // embed the instant-quote engine
    quoteProcess: 'fdm',
    summary: 'Industrial FDM farm running 18 machines. Upload an STL or STEP file for an instant, indicative price — material, machine time and lead time update live. Vertex confirms a firm quote before anything is charged.',
    specs: [
      { k: 'Build volume',   v: '300 × 300 × 400 mm', icon: 'box' },
      { k: 'Materials',      v: 'PLA · PETG · ABS · ASA · TPU · Nylon', icon: 'layers' },
      { k: 'Layer height',   v: '0.10 – 0.40 mm', icon: 'filter' },
      { k: 'Tolerance',      v: '± 0.3 mm typical', icon: 'gear' },
      { k: 'Lead time',      v: '2–3 days express · 7–10 standard', icon: 'truck' },
      { k: 'Max part',       v: '≈ 2.5 kg per part', icon: 'wallet' },
    ],
    steps: [
      { ic: 'upload', t: 'Upload your model', s: 'STL or STEP — analysed in your browser, never uploaded' },
      { ic: 'gear',   t: 'Pick process & material', s: 'Live indicative price as you change options' },
      { ic: 'send',   t: 'Request supplier match', s: 'Vertex Fabrication confirms a firm quote' },
    ],
  },
};

/* ---------------- Account (buyer) ---------------- */
const CLIENT = {
  fullName: 'Layla Hariri', email: 'layla@studio.sa', phone: '+966 55 220 1184',
  city: 'Riyadh, SA', subscriber: true,
};

Object.assign(window, {
  HERO_SLIDES, JOB_CHIPS, SPACE_CHIPS, FILTER_TREE, LOCATIONS, RATING_OPTS, DEAL_OPTS,
  VENDORS, JOBS, SPACES, SPACE_DETAIL, JOB_DETAILS, CLIENT,
});
