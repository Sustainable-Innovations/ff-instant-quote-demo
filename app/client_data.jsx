// client_data.jsx — marketplace data for the FlexFactory client/buyer experience

/* ---------------- Hero / promo slides ---------------- */
const HERO_SLIDES = [
  { tag: 'Q2 PROMO', off: '-100 % OFF', title: 'First PCB order free.', sub: 'SAR 500 credit on 2-layer boards', cta: 'Claim offer', image: 'assets/hero/hero-pcb.jpg?v=perf-20260610' },
  { tag: 'NEW VENDORS', off: '12 shops', title: 'CNC, on demand.', sub: '5-axis milling from 9 verified shops in Riyadh', cta: 'Browse CNC', image: 'assets/hero/hero-cnc.jpg?v=perf-20260610' },
  { tag: 'MEMBER PERK', off: 'Save 15%', title: 'One pass, every shop.', sub: 'Subscriber pricing across the whole platform', cta: 'View plans', image: 'assets/hero/hero-workshop.jpg?v=perf-20260610' },
];
const PROMO_IMAGE = 'assets/hero/promo-pcb.jpg?v=perf-20260610';

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

const CARD_IMG = (n) => `assets/cards/optimized/card-${String(n).padStart(2, '0')}.jpg?v=perf-20260610`;

/* ---------------- Listings — Jobs (services / products to quote) ---------------- */
// badge tones: lime (FEATURED/NEW), blue (TOP), red (% OFF)
const JOBS = [
  { id: 'J-1', kind: 'job', title: '6-Layer PCB · HASL Finish', vendor: 'Circuit Guild', city: 'Dammam', rating: 5.0, reviews: 137, tags: ['PCB Fab', 'Multilayer'], cat: 'PCB Fab', icon: 'grid', image: CARD_IMG(1), badge: { l: 'FEATURED', t: 'lime' }, off: 25, featured: true, blurb: 'Turnkey multilayer fabrication with controlled-impedance stack-ups and 24-hour express options.', instant: true },
  { id: 'J-2', kind: 'job', title: 'FDM Print · PLA / PETG / ABS', vendor: 'Vertex Fabrication', city: 'Riyadh', rating: 5.0, reviews: 137, tags: ['3D Print', 'FDM'], cat: '3D Printing', icon: 'box', image: CARD_IMG(2), badge: { l: 'TOP #1', t: 'blue' }, off: 0, featured: true, blurb: 'Industrial FDM farm — up to 300×300×400 mm, fast turnaround on functional prototypes.', instant: true },
  { id: 'J-3', kind: 'job', title: 'Prototype PCB · Quick-turn', vendor: 'Circuit Guild', city: 'Dammam', rating: 5.0, reviews: 137, tags: ['PCB Fab', 'Multilayer'], cat: 'PCB Fab', icon: 'grid', image: CARD_IMG(3), badge: { l: 'FEATURED', t: 'lime' }, off: 7, featured: true, blurb: 'Bare boards in 48 hours. ENIG or HASL, soldermask in six colors.', instant: true },
  { id: 'J-4', kind: 'job', title: 'Bandsaw Cutting · Metal & Wood', vendor: 'Forge & Form', city: 'Riyadh', rating: 5.0, reviews: 137, tags: ['Cutting', 'Sheet'], cat: 'Laser', icon: 'tools', image: CARD_IMG(4), badge: { l: 'NEW', t: 'lime' }, off: 18, blurb: 'Precision stock cutting to length with deburring included.', fixed: true, from: 28 },
  { id: 'J-5', kind: 'job', title: 'Resin (SLA) High-Detail Prints', vendor: 'Vertex Fabrication', city: 'Riyadh', rating: 5.0, reviews: 137, tags: ['3D Print', 'SLA'], cat: '3D Printing', icon: 'box', image: CARD_IMG(5), off: 0, blurb: '8K resin detail for miniatures, jewelry masters and dental.', fixed: true, from: 60 },
  { id: 'J-6', kind: 'job', title: 'Flex PCB · Polyimide', vendor: 'Circuit Guild', city: 'Dammam', rating: 5.0, reviews: 137, tags: ['PCB Fab', 'Flex'], cat: 'PCB Fab', icon: 'grid', image: CARD_IMG(6), off: 7, blurb: 'Single and double-sided flex circuits with stiffeners.' },
  { id: 'J-7', kind: 'job', title: 'Laser Cut · Acrylic & Ply', vendor: 'Atlas Makerworks', city: 'Jeddah', rating: 5.0, reviews: 137, tags: ['Laser', 'Sheet'], cat: 'Laser', icon: 'layers', image: CARD_IMG(7), off: 0, blurb: 'CO₂ laser cutting and engraving up to 1200×900 mm beds.', fixed: true, from: 35 },
  { id: 'J-8', kind: 'job', title: '5-Axis CNC Milling', vendor: 'Northgate Labs', city: 'Khobar', rating: 5.0, reviews: 137, tags: ['CNC', 'Aluminium'], cat: 'CNC', icon: 'tools', image: CARD_IMG(8), badge: { l: 'TOP #5', t: 'blue' }, off: 0, blurb: 'Tight-tolerance machined parts in aluminium, brass and POM.' },
  { id: 'J-9', kind: 'job', title: 'Bandsaw Cutting · Heavy Stock', vendor: 'Forge & Form', city: 'Riyadh', rating: 5.0, reviews: 137, tags: ['Cutting', 'Metal'], cat: 'Laser', icon: 'tools', image: CARD_IMG(9), off: 18, blurb: 'Horizontal bandsaw for bar and tube up to 250 mm.' },
  { id: 'J-10', kind: 'job', title: 'SMT Assembly · Reflow', vendor: 'Circuit Guild', city: 'Dammam', rating: 5.0, reviews: 137, tags: ['Assembly', 'SMT'], cat: 'PCB Fab', icon: 'grid', image: CARD_IMG(10), off: 0, blurb: 'Stencil, pick-and-place and reflow for small to medium runs.' },
  { id: 'J-11', kind: 'job', title: 'Anodizing & Finishing', vendor: 'Northgate Labs', city: 'Khobar', rating: 5.0, reviews: 137, tags: ['Finishing', 'Metal'], cat: 'CNC', icon: 'layers', image: CARD_IMG(11), off: 0, blurb: 'Type-II anodize in eight colours, bead-blast and passivation.' },
  { id: 'J-12', kind: 'job', title: 'Silicone & Resin Molding', vendor: 'Atlas Makerworks', city: 'Jeddah', rating: 5.0, reviews: 137, tags: ['Molding', 'Casting'], cat: 'Molding', icon: 'box', image: CARD_IMG(12), off: 0, blurb: 'Low-volume vacuum casting from your master or our print.' },
];

/* ---------------- Listings — Spaces (bookable desks / labs) ---------------- */
const SPACES = [
  { id: 'S-1', kind: 'space', title: 'Shared Workshop Bay', vendor: 'Forge & Form', city: 'Riyadh', rating: 5.0, reviews: 137, tags: ['Maker Space', 'Tools'], cat: 'Shop Floor Desk', icon: 'tools', image: CARD_IMG(13), badge: { l: 'FEATURED', t: 'lime' }, off: 30, featured: true, from: 86.25, blurb: 'Fully-equipped bay with rolling tool chest, bench and Wi-Fi.' },
  { id: 'S-2', kind: 'space', title: 'Electrical Desk · Bay 04', vendor: 'Northgate Labs', city: 'Riyadh', rating: 4.9, reviews: 127, tags: ['Electronics', 'ESD-safe'], cat: 'Electrical Desk', icon: 'grid', image: CARD_IMG(14), badge: { l: 'FEATURED', t: 'lime' }, sub: true, from: 25, blurb: 'ESD-safe electronics workbench with scope, supply and rework station.' },
  { id: 'S-3', kind: 'space', title: 'Wet Bench · Chemistry', vendor: 'Northgate Labs', city: 'Khobar', rating: 5.0, reviews: 137, tags: ['Lab', 'Ventilated'], cat: 'Wet Bench', icon: 'building', image: CARD_IMG(15), badge: { l: 'NEW', t: 'lime' }, off: 5, from: 86.25, blurb: 'Ventilated wet bench with fume extraction and PPE.' },
  { id: 'S-4', kind: 'space', title: 'Mechanical Desk · Assembly', vendor: 'Atlas Makerworks', city: 'Jeddah', rating: 5.0, reviews: 137, tags: ['Assembly', 'Bench'], cat: 'Mechanical Desk', icon: 'tools', image: CARD_IMG(16), badge: { l: 'NEW', t: 'lime' }, off: 10, from: 86.25, blurb: 'Heavy assembly bench with vice, press and air line.' },
  { id: 'S-5', kind: 'space', title: 'Photo / Product Studio', vendor: 'Vertex Fabrication', city: 'Riyadh', rating: 5.0, reviews: 137, tags: ['Studio', 'Lighting'], cat: 'Shop Floor Desk', icon: 'image', image: CARD_IMG(17), off: 0, from: 120, blurb: 'Lighting rig, backdrops and tripods for product shots.' },
  { id: 'S-6', kind: 'space', title: 'Resin Lab · Ventilated', vendor: 'Vertex Fabrication', city: 'Riyadh', rating: 5.0, reviews: 137, tags: ['Lab', 'UV Cure'], cat: 'Lab', icon: 'building', image: CARD_IMG(18), off: 0, from: 64, blurb: 'Resin printing lab with UV cure station and extraction.' },
  { id: 'S-7', kind: 'space', title: 'Electronics Lab · Bay 02', vendor: 'Northgate Labs', city: 'Khobar', rating: 5.0, reviews: 137, tags: ['Electronics', 'ESD-safe'], cat: 'Electrical Desk', icon: 'grid', image: CARD_IMG(19), off: 0, from: 28, blurb: 'Second ESD bay — same kit, quieter corner.' },
  { id: 'S-8', kind: 'space', title: 'CNC Operator Station', vendor: 'Northgate Labs', city: 'Khobar', rating: 5.0, reviews: 137, tags: ['CNC', 'Supervised'], cat: 'Mechanical Desk', icon: 'tools', image: CARD_IMG(20), off: 0, from: 96, blurb: 'Supervised access to a 3-axis mill with operator on call.' },
];

/* ---------------- Rich space detail (Electrical Desk · Bay 04) ---------------- */
const SPACE_DETAIL = {
  id: 'S-2',
  title: 'Electrical Desk · Bay 04',
  crumb: ['Home', 'Spaces', 'Electronics Lab', 'Electrical Desk'],
  rating: 4.9, bookings: 127, location: 'King Fahd District, Riyadh', available: 'Available now',
  gallery: ['Workbench', 'Oscilloscope', 'Power supply', 'Storage', 'Soldering', 'Lighting', 'Wide view', 'Access'],
  galleryImages: [
    'assets/hero/detail-electrical.jpg?v=perf-20260610',
    CARD_IMG(14),
    CARD_IMG(19),
    CARD_IMG(2),
    CARD_IMG(10),
    CARD_IMG(13),
    'assets/hero/detail-workshop.jpg?v=perf-20260610',
    'assets/hero/detail-electronics.jpg?v=perf-20260610',
  ],
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

/* ---------------- Rich job detail (6-Layer PCB · HASL Finish) ---------------- */
const JOB_DETAIL = {
  id: 'J-1',
  title: '6-Layer PCB · HASL Finish',
  crumb: ['Home', 'Jobs', 'PCB Fab', '6-Layer PCB'],
  vendor: 'Circuit Guild', city: 'Dammam', rating: 5.0, orders: 137,
  available: 'Accepting orders',
  badges: [{ l: 'Instant Quote', t: 'blue' }, { l: 'IPC Class II', t: 'pos' }, { l: 'ISO 9001', t: 'warn' }],
  gallery: ['Stack-up', 'Drill detail', 'Surface finish', 'Edge plating', 'Soldermask', 'Silkscreen', 'Inspection', 'Packaged'],
  galleryImages: [CARD_IMG(1), CARD_IMG(3), CARD_IMG(6), CARD_IMG(10), CARD_IMG(11), CARD_IMG(7), 'assets/hero/promo-pcb.jpg?v=perf-20260610', CARD_IMG(12)],
  blurb: 'Turnkey multilayer PCB fabrication with controlled-impedance stack-ups and 24-hour express options. From Gerber to bare board — circuit guild handles every step in-house.',
  specs: [
    ['Layers', '6 (signal · power · ground)'], ['Min. track / space', '0.1 mm / 0.1 mm'],
    ['Board thickness', '1.6 mm standard (custom on request)'], ['Surface finish', 'HASL lead-free · ENIG +SAR 80'],
    ['Soldermask', '6 colours · both sides'], ['Silkscreen', 'Both sides'],
    ['Min. hole size', '0.2 mm (laser) · 0.3 mm (mechanical)'], ['Max. board size', '500 × 600 mm'],
    ['IPC standard', 'Class II production · Class III on request'], ['Lead time', '5 days standard · 24h express'],
  ],
  pricing: [
    { qty: '5 pcs', price: 185, unit: '/batch', note: 'Prototype run' },
    { qty: '25 pcs', price: 420, unit: '/batch', note: 'Small series', save: 'SAVE 12%' },
    { qty: '100 pcs', price: 1100, unit: '/batch', note: 'Pre-production', save: 'SAVE 28%', popular: true },
    { qty: '500 pcs+', price: null, unit: 'custom', note: 'Contact for volume pricing' },
  ],
  fileTypes: ['Gerber (.zip)', 'ODB++', 'IPC-2581', 'KiCad (.kicad_pcb)', 'Eagle (.brd)'],
  materials: ['FR4 Standard', 'FR4 High-Tg', 'Aluminium-backed', 'Flex (Polyimide)', 'Rogers RO4003C'],
  finishes: ['HASL Lead-free (incl.)', 'ENIG +SAR 80', 'Hard Gold +SAR 180', 'OSP +SAR 40', 'ENEPIG +SAR 220'],
};

/* ---------------- Mock orders ---------------- */
const MOCK_ORDERS = [
  {
    id: 'ORD-8821', service: '6-Layer PCB · HASL Finish', vendor: 'Circuit Guild', city: 'Dammam',
    cat: 'PCB Fab', icon: 'grid', qty: '100 pcs', specs: 'FR4 · HASL LF · 1.6mm · Green',
    files: ['gerber_v2.zip', 'stackup_notes.pdf'],
    submitted: 'Jun 02, 2026', total: 1100, status: 'in_production',
    timeline: [
      { key: 'requested',   label: 'Quote Requested',    date: 'Jun 02',  done: true },
      { key: 'reviewing',   label: 'Provider Reviewing',  date: 'Jun 02',  done: true },
      { key: 'quoted',      label: 'Quote Received',      date: 'Jun 03',  done: true },
      { key: 'approved',    label: 'Order Approved',      date: 'Jun 04',  done: true },
      { key: 'production',  label: 'In Production',       date: 'Jun 05',  done: true, active: true },
      { key: 'qc',          label: 'Quality Check',       date: 'Jun 09',  done: false },
      { key: 'ready',       label: 'Ready',               date: 'Jun 10',  done: false },
    ],
    quote: { breakdown: [['Board fab · 100 pcs', 980], ['HASL LF finish', 0], ['Electrical test', 80], ['Shipping (DHL Express)', 40]], total: 1100, note: 'Lead time 5 working days from artwork approval. DHL Express to your door.' },
    messages: [
      { from: 'Circuit Guild', time: 'Jun 3 · 9:14 AM', text: 'Hi Layla — quote attached. We can start as soon as you approve. Let us know if you need ENIG instead.' },
      { from: 'You', time: 'Jun 4 · 11:02 AM', text: 'HASL LF is fine. Approved — please go ahead.' },
      { from: 'Circuit Guild', time: 'Jun 5 · 8:30 AM', text: 'Artwork checked and panelised. Production starts today, estimated completion Jun 9.' },
    ],
  },
  {
    id: 'ORD-8654', service: 'FDM Print · PLA / PETG / ABS', vendor: 'Vertex Fabrication', city: 'Riyadh',
    cat: '3D Printing', icon: 'box', qty: '3 parts', specs: 'PETG · Black · 0.2mm layer',
    files: ['enclosure_v3.stl', 'bracket.stl'],
    submitted: 'May 28, 2026', total: 340, status: 'ready',
    timeline: [
      { key: 'requested',  label: 'Quote Requested',   date: 'May 28', done: true },
      { key: 'reviewing',  label: 'Provider Reviewing', date: 'May 28', done: true },
      { key: 'quoted',     label: 'Quote Received',    date: 'May 29', done: true },
      { key: 'approved',   label: 'Order Approved',    date: 'May 29', done: true },
      { key: 'production', label: 'In Production',     date: 'May 30', done: true },
      { key: 'qc',         label: 'Quality Check',     date: 'Jun 01', done: true },
      { key: 'ready',      label: 'Ready',             date: 'Jun 03', done: true, active: true },
    ],
    quote: { breakdown: [['FDM print · 3 parts · PETG', 290], ['Post-processing', 50]], total: 340, note: 'Parts are ready for pickup at Riyadh workshop. Collection Mon–Sat 9AM–6PM.' },
    messages: [
      { from: 'Vertex Fabrication', time: 'May 29 · 10:00 AM', text: 'Parts sliced and ready to print. Quote above — lead time 3 days.' },
      { from: 'You', time: 'May 29 · 12:30 PM', text: 'Looks good, approved!' },
      { from: 'Vertex Fabrication', time: 'Jun 3 · 2:00 PM', text: 'All 3 parts finished and QC passed. Ready for collection.' },
    ],
  },
  {
    id: 'ORD-8301', service: 'Laser Cut · Acrylic & Ply', vendor: 'Atlas Makerworks', city: 'Jeddah',
    cat: 'Laser', icon: 'layers', qty: '20 sheets', specs: 'Acrylic 3mm · Clear · Engrave + cut',
    files: ['panels_dxf.dxf'],
    submitted: 'May 10, 2026', total: 620, status: 'completed',
    timeline: [
      { key: 'requested',  label: 'Quote Requested',   date: 'May 10', done: true },
      { key: 'reviewing',  label: 'Provider Reviewing', date: 'May 10', done: true },
      { key: 'quoted',     label: 'Quote Received',    date: 'May 11', done: true },
      { key: 'approved',   label: 'Order Approved',    date: 'May 11', done: true },
      { key: 'production', label: 'In Production',     date: 'May 12', done: true },
      { key: 'qc',         label: 'Quality Check',     date: 'May 14', done: true },
      { key: 'ready',      label: 'Completed',         date: 'May 15', done: true },
    ],
    quote: { breakdown: [['Laser cut · 20 sheets', 480], ['Engraving', 100], ['Delivery', 40]], total: 620, note: 'Delivered May 15.' },
    messages: [
      { from: 'Atlas Makerworks', time: 'May 11 · 9:00 AM', text: 'DXF looks clean. Quote above — 3 day lead time.' },
      { from: 'You', time: 'May 11 · 9:45 AM', text: 'Approved.' },
    ],
  },
];

/* ---------------- Rich job detail — Fixed price (FDM Print) ---------------- */
const JOB_DETAIL_FIXED = {
  id: 'J-2', fixed: true,
  title: 'FDM Print · PLA / PETG / ABS',
  crumb: ['Home', 'Jobs', '3D Printing', 'FDM Print'],
  vendor: 'Vertex Fabrication', city: 'Riyadh', rating: 5.0, orders: 284,
  available: 'Accepting orders · ships in 3 days',
  badges: [{ l: 'Instant Order', t: 'blue' }, { l: 'TOP #1', t: 'pos' }],
  gallery: ['Print farm', 'Detail', 'Material', 'Finish', 'Packaging', 'Scale'],
  galleryImages: [CARD_IMG(2), CARD_IMG(5), CARD_IMG(18), CARD_IMG(17), CARD_IMG(13), CARD_IMG(4)],
  blurb: 'Industrial FDM farm with 40+ printers. PLA, PETG and ABS in 12 colours. Up to 300×300×400 mm per part. Upload your STL and get printed parts shipped to your door in 3 days.',
  specs: [
    ['Technology', 'FDM / FFF'], ['Build volume', '300 × 300 × 400 mm max'],
    ['Layer height', '0.1 mm – 0.3 mm'], ['Wall thickness', '0.4 mm min'],
    ['Tolerances', '±0.3 mm or ±0.3% (whichever is greater)'],
    ['Infill', '15% standard · 50% · 100% solid on request'],
    ['Supports', 'Auto-generated · removed before shipping'], ['Lead time', '3 days standard · 24h express'],
  ],
  materials: ['PLA', 'PETG', 'ABS', 'TPU (Flexible)', 'ASA (UV-stable)'],
  colours: [['White', '#F5F5F5'], ['Black', '#212121'], ['Grey', '#9E9E9E'], ['Red', '#C62828'], ['Blue', '#1565C0'], ['Green', '#2E7D32'], ['Yellow', '#F9A825'], ['Orange', '#E65100']],
  tiers: [
    { qty: 1,   label: '1 part',    price: 45,  unit: '/ part', note: 'Single prototype' },
    { qty: 3,   label: '3 parts',   price: 120, unit: '/ set',  note: 'Save 11%', save: 'SAVE 11%' },
    { qty: 5,   label: '5 parts',   price: 185, unit: '/ set',  note: 'Save 18%', save: 'SAVE 18%', popular: true },
    { qty: 10,  label: '10 parts',  price: 340, unit: '/ set',  note: 'Save 24%', save: 'SAVE 24%' },
  ],
  fileTypes: ['STL', 'OBJ', '3MF', 'STEP / STP', 'IGES'],
  finishes: ['Standard (layer lines visible)', 'Sanded smooth +SAR 25/part', 'Primed +SAR 35/part', 'Painted +SAR 80/part'],
};

/* ---------------- Rich job detail — PCB instant quote (Prototype PCB) ---------------- */
const JOB_DETAIL_PCB = {
  id: 'J-3', fixed: false,
  title: 'Prototype PCB · Quick-turn',
  crumb: ['Home', 'Jobs', 'PCB Fab', 'Prototype PCB'],
  vendor: 'Circuit Guild', city: 'Dammam', rating: 5.0, orders: 137,
  available: 'Quoting instantly',
  badges: [{ l: 'Instant Quote', t: 'blue' }, { l: 'FEATURED', t: 'lime' }],
  gallery: ['Bare board', 'Stack-up', 'Soldermask', 'Finish', 'Test', 'Panel'],
  galleryImages: [CARD_IMG(3), CARD_IMG(1), CARD_IMG(6), CARD_IMG(10), CARD_IMG(11), CARD_IMG(7)],
  blurb: 'Quick-turn bare-board fabrication — 1 to 6 layers on FR4, HASL LF / ENIG / OSP finishes, soldermask in six colours. Upload your Gerber or ODB++ package and get an instant, indicative price; Circuit Guild confirms a firm quote before anything is charged.',
  specs: [
    ['Layers', '1 – 6 layers'], ['Base material', 'FR4 · Tg 150 standard'],
    ['Board thickness', '0.6 – 2.0 mm'], ['Min track / gap', '0.1 mm / 0.1 mm'],
    ['Surface finish', 'HASL LF · ENIG · OSP'], ['Soldermask', 'Green · Red · Blue · Black · White · Yellow'],
    ['Electrical test', 'Flying probe · included'], ['Lead time', '48h express · 5–7 days standard'],
  ],
  tiers: [
    { qty: 5,   label: '5 pcs',   price: 180, unit: '/ set', note: 'Prototype batch' },
    { qty: 10,  label: '10 pcs',  price: 300, unit: '/ set', note: 'Save 17%', save: 'SAVE 17%' },
    { qty: 25,  label: '25 pcs',  price: 560, unit: '/ set', note: 'Save 30%', save: 'SAVE 30%', popular: true },
    { qty: 50,  label: '50 pcs',  price: 980, unit: '/ set', note: 'Save 39%', save: 'SAVE 39%' },
  ],
  fileTypes: ['Gerber (.zip)', 'ODB++', 'IPC-2581', 'KiCad (.kicad_pcb)', 'Eagle (.brd)'],
  finishes: ['HASL lead-free', 'ENIG +SAR 60/order', 'OSP', 'Immersion silver +SAR 90/order'],
};

/* PCB instant-quote body for the 6-Layer listing (reuses the rich J-1 content + tier shape) */
const JOB_DETAIL_PCB6 = Object.assign({}, JOB_DETAIL, {
  available: 'Quoting instantly',
  tiers: [
    { qty: 5,   label: '5 pcs',   price: 185,  unit: '/ set', note: 'Prototype run' },
    { qty: 25,  label: '25 pcs',  price: 420,  unit: '/ set', note: 'Save 12%', save: 'SAVE 12%' },
    { qty: 100, label: '100 pcs', price: 1100, unit: '/ set', note: 'Pre-production', save: 'SAVE 28%', popular: true },
    { qty: 250, label: '250 pcs', price: 2300, unit: '/ set', note: 'Save 40%', save: 'SAVE 40%' },
  ],
});

/* Map PCB-engine listings to the page body that frames the embedded engine */
const JOB_DETAIL_PCB_BY_ID = { 'J-1': JOB_DETAIL_PCB6, 'J-3': JOB_DETAIL_PCB };

/* ---------------- Mock quotes ---------------- */
const MOCK_QUOTES = [
  {
    id: 'QT-2241', service: '6-Layer PCB · HASL Finish', vendor: 'Circuit Guild', city: 'Dammam',
    cat: 'PCB Fab', icon: 'grid', qty: '25 pcs', specs: 'FR4 · HASL LF · Green soldermask',
    files: ['gerber_v1.zip'], submitted: 'Jun 06, 2026', status: 'quote_received',
    providerQuote: {
      amount: 420, validUntil: 'Jun 13, 2026',
      breakdown: [['Board fab · 25 pcs', 360], ['HASL LF finish', 0], ['Electrical test', 60]],
      note: '5 working days from artwork approval. Price valid 7 days.',
      leadTime: '5 working days',
    },
    messages: [
      { from: 'Circuit Guild', time: 'Jun 7 · 10:00 AM', text: 'Hi Layla — quote is ready. Please review and approve to start production. Happy to answer any questions.' },
    ],
  },
  {
    id: 'QT-2198', service: '5-Axis CNC Milling', vendor: 'Northgate Labs', city: 'Khobar',
    cat: 'CNC', icon: 'tools', qty: '2 parts', specs: 'Aluminium 6061 · ±0.05mm tolerance',
    files: ['bracket_step.stp', 'drawing.pdf'], submitted: 'Jun 04, 2026', status: 'pending_review',
    providerQuote: null,
    messages: [],
  },
  {
    id: 'QT-2041', service: 'Silicone & Resin Molding', vendor: 'Atlas Makerworks', city: 'Jeddah',
    cat: 'Molding', icon: 'box', qty: '50 units', specs: 'Shore 40A silicone · clear',
    files: ['master_model.stl'], submitted: 'May 20, 2026', status: 'approved',
    providerQuote: {
      amount: 1850, validUntil: 'May 30, 2026',
      breakdown: [['Master & mould making', 600], ['50 cast units', 1100], ['Post-processing', 150]],
      note: 'Approved and converted to order ORD-8112.',
      leadTime: '10 working days',
    },
    messages: [
      { from: 'Atlas Makerworks', time: 'May 21 · 9:00 AM', text: 'Quote attached. Mould-making starts the same day you approve.' },
      { from: 'You', time: 'May 21 · 11:00 AM', text: 'Approved. Please start.' },
    ],
  },
];

/* ---------------- Rich job detail (keyed by listing id) ---------------- */
// Jobs in the "3D Printing" category render the live instant-quote engine embedded
// in the page; the spec/vendor content below frames it.
const JOB_DETAILS = {
  'J-1': {
    id: 'J-1',
    crumb: ['Home', 'Jobs', 'PCB Fab', '6-Layer PCB'],
    location: 'Second Industrial City, Dammam',
    available: 'Quoting instantly',
    quote: true,                 // embed the instant-quote engine
    quoteEngine: 'pcb',          // PCB/PCBA engine
    quoteProcess: 'pcb',
    summary: 'Turnkey multilayer PCB fabrication with controlled-impedance stack-ups and 24-hour express options. Upload your Gerber package for an instant, indicative price — layers, board area, finish and quantity update live. Circuit Guild confirms a firm quote before anything is charged.',
    specs: [
      { k: 'Layers',         v: 'up to 6 · signal / power / ground', icon: 'layers' },
      { k: 'Base material',  v: 'FR4 · High-Tg · Rogers on request', icon: 'grid' },
      { k: 'Surface finish', v: 'HASL LF · ENIG · OSP · ENEPIG', icon: 'filter' },
      { k: 'Min track/gap',  v: '0.1 mm / 0.1 mm', icon: 'gear' },
      { k: 'Lead time',      v: '24h express · 5 days standard', icon: 'truck' },
      { k: 'Max board',      v: '500 × 600 mm', icon: 'box' },
    ],
    steps: [
      { ic: 'upload', t: 'Upload your design', s: 'Gerber, ODB++ or IPC-2581 — parsed in your browser' },
      { ic: 'gear',   t: 'Pick layers, finish & quantity', s: 'Live indicative price as you change options' },
      { ic: 'send',   t: 'Request supplier match', s: 'Circuit Guild confirms a firm quote' },
    ],
  },
  'J-2': {
    id: 'J-2',
    crumb: ['Home', 'Jobs', '3D Printing', 'FDM / FFF'],
    location: 'Industrial City 2, Riyadh',
    available: 'Quoting instantly',
    quote: true,                 // embed the instant-quote engine
    quoteEngine: '3d',           // checked-in additive/CNC reference engine
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
  'J-3': {
    id: 'J-3',
    crumb: ['Home', 'Jobs', 'PCB Fab', 'Prototype PCB'],
    location: 'Second Industrial City, Dammam',
    available: 'Quoting instantly',
    quote: true,                 // embed the instant-quote engine
    quoteEngine: 'pcb',          // live PCB fabrication engine
    quoteProcess: 'pcb',
    summary: 'Quick-turn bare-board fabrication. Upload your Gerber or ODB++ package for an instant, indicative price — layer count, board area, finish and quantity update live. Circuit Guild confirms a firm quote before anything is charged.',
    specs: [
      { k: 'Layers',         v: '1 – 6 layers', icon: 'layers' },
      { k: 'Base material',  v: 'FR4 · Tg 150 standard', icon: 'grid' },
      { k: 'Surface finish', v: 'HASL LF · ENIG · OSP', icon: 'filter' },
      { k: 'Min track/gap',  v: '0.1 mm / 0.1 mm', icon: 'gear' },
      { k: 'Lead time',      v: '48h express · 5–7 standard', icon: 'truck' },
      { k: 'Board size',     v: 'up to 400 × 500 mm', icon: 'box' },
    ],
    steps: [
      { ic: 'upload', t: 'Upload your design', s: 'Gerber, ODB++ or IPC-2581 — parsed in your browser' },
      { ic: 'gear',   t: 'Pick layers, finish & quantity', s: 'Live indicative price as you change options' },
      { ic: 'send',   t: 'Request supplier match', s: 'Circuit Guild confirms a firm quote' },
    ],
  },
};

/* ---------------- Account (buyer) ---------------- */
const CLIENT = {
  fullName: 'Layla Hariri', email: 'layla@studio.sa', phone: '+966 55 220 1184',
  city: 'Riyadh, SA', subscriber: true,
};

/* ---------------- Rewards (loyalty tiers) ---------------- */
const REWARD_TIERS = [
  { id: 'bronze', name: 'Bronze', min: 1,  discount: 0,  color: '#B5793F',        fg: '#fff' },
  { id: 'silver', name: 'Silver', min: 5,  discount: 5,  color: '#B9C0CC',        fg: 'var(--ff-navy)' },
  { id: 'gold',   name: 'Gold',   min: 10, discount: 10, color: 'var(--ff-lime)', fg: 'var(--ff-navy)' },
];

function getRewardStatus(count) {
  const current = [...REWARD_TIERS].reverse().find(t => count >= t.min) || null;
  const next = REWARD_TIERS.find(t => count < t.min) || null;
  const floor = current ? current.min : 0;
  const remaining = next ? next.min - count : 0;
  const progress = next ? Math.round(((count - floor) / (next.min - floor)) * 100) : 100;
  return { count, current, next, remaining, progress };
}

/* ---------------- Landing-page marketing stats ---------------- */
const MARKET_STATS = [
  { id: 'network', value: 500,  suffix: '+', label: 'Suppliers & spaces' },
  { id: 'orders',  value: 1900, suffix: '+', label: 'Orders fulfilled' },
  { id: 'cities',  value: 5,    label: 'Cities across KSA' },
  { id: 'rating',  value: 4.9,  decimals: 1, label: 'Average rating' },
];

Object.assign(window, {
  HERO_SLIDES, PROMO_IMAGE, JOB_CHIPS, SPACE_CHIPS, FILTER_TREE, LOCATIONS, RATING_OPTS, DEAL_OPTS,
  VENDORS, JOBS, SPACES, SPACE_DETAIL, JOB_DETAIL, JOB_DETAIL_FIXED, JOB_DETAIL_PCB, JOB_DETAIL_PCB6, JOB_DETAIL_PCB_BY_ID, JOB_DETAILS, MOCK_ORDERS, MOCK_QUOTES, CLIENT,
  REWARD_TIERS, getRewardStatus, MARKET_STATS,
});
