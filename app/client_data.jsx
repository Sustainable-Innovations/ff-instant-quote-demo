// client_data.jsx — marketplace data for the FlexFactory client/buyer experience

/* ---------------- Hero / promo slides ---------------- */
const HERO_SLIDES = [
  { tag: 'HEAVY EQUIPMENT', off: '10 machine classes', title: 'Rent site machinery.', sub: 'Forklifts, cranes, loaders and trucks from verified fleets', cta: 'Find equipment', image: 'assets/equipment/hero-heavy-equipment.jpg?v=industrial-20260628b', route: { name: 'browse', kind: 'equipment' } },
  { tag: 'RAW MATERIALS', off: '16 stock lines', title: 'Industrial materials.', sub: 'Metals, wood, plastics, rubber and structural stock', cta: 'Shop materials', image: 'assets/materials/aluminum-plate.jpg?v=industrial-20260628b', route: { name: 'browse', kind: 'material' } },
  { tag: 'MAKE', off: '13 shops', title: 'CNC, on demand.', sub: '5-axis milling, PCB fab and custom manufacturing quotes', cta: 'Start a quote', image: 'assets/hero/hero-cnc.jpg?v=perf-20260610', route: { name: 'browse', kind: 'job' } },
  { tag: 'WORK', off: '126 spaces', title: 'Book the shop floor.', sub: 'Benches, labs and bays available by the hour or day', cta: 'Book a workspace', image: 'assets/hero/hero-workshop.jpg?v=perf-20260610', route: { name: 'browse', kind: 'space' } },
];
const PROMO_IMAGE = 'assets/hero/promo-pcb.jpg?v=perf-20260610';

/* ---------------- Category chips ---------------- */
const JOB_CHIPS = ['Featured', '3D Printing', 'PCB Fab', 'Laser', 'CNC', 'Molding', 'Mailing'];
const SPACE_CHIPS = ['Featured', 'Wet Bench', 'Shop Floor Desk', 'Electrical Desk', 'Mechanical Desk', 'Lab'];
const EQUIPMENT_CHIPS = ['Featured', 'Lifting', 'Earthmoving', 'Trucks', 'Concrete', 'Access', 'Compaction'];
const MATERIAL_CHIPS = ['Featured', 'Metals', 'Wood', 'Plastics', 'Rubber', 'Glass', 'Structural', 'Fasteners'];

/* ---------------- Vertical config map (one place for label / nav / card CTA / route) ----------------
   Internal `kind` values stay as-is to avoid churn in the working quote/order flow;
   only user-facing labels change. Cards, nav, and browse all read from here. */
const KIND_META = {
  job:       { key: 'job',       label: 'Make',      browseTitle: 'Manufacturing services', plural: 'services',  route: 'job',       cta: 'GET QUOTE',   icon: 'tools',    source: 'JOBS',      chips: 'JOB_CHIPS',       blurb: 'Quote manufacturing services' },
  space:     { key: 'space',     label: 'Work',      browseTitle: 'Workspaces',             plural: 'spaces',    route: 'detail',    cta: 'BOOK NOW',    icon: 'building', source: 'SPACES',    chips: 'SPACE_CHIPS',     blurb: 'Book workspaces and labs' },
  equipment: { key: 'equipment', label: 'Rent',      browseTitle: 'Equipment rentals',       plural: 'items',     route: 'equipment', cta: 'RENT NOW',    icon: 'truck',    source: 'EQUIPMENT', chips: 'EQUIPMENT_CHIPS', blurb: 'Hire equipment and machinery' },
  material:  { key: 'material',  label: 'Shop',      browseTitle: 'Materials and supplies',  plural: 'products',  route: 'product',   cta: 'ADD TO CART', icon: 'box',      source: 'MATERIALS', chips: 'MATERIAL_CHIPS',  blurb: 'Buy materials and supplies' },
};
const KIND_ORDER = ['job', 'space', 'equipment', 'material'];

/* ---------------- Filter tree (browse sidebar) ---------------- */
const FILTER_TREE = [
  { label: '3D Printing', kids: ['FDM / FFF', 'SLA / Resin', 'SLS'] },
  { label: 'Sheet Fabrication', kids: ['Laser', 'Plasma', 'Waterjet'], open: true },
  { label: 'CNC Machining', kids: ['3-Axis', '5-Axis', 'Turning'] },
  { label: 'Electronics', kids: ['PCB Fab', 'Assembly', 'Reflow'] },
];
// Per-vertical category trees for the browse sidebar.
const FILTER_TREES = {
  job: FILTER_TREE,
  space: [
    { label: 'Desks', kids: ['Electrical Desk', 'Mechanical Desk'], open: true },
    { label: 'Labs', kids: ['Wet Bench', 'Resin Lab'] },
    { label: 'Shop Floor', kids: ['Workshop Bay', 'Studio'] },
  ],
  equipment: [
    { label: 'Lifting', kids: ['Forklifts', 'Telehandlers', 'Cranes'], open: true },
    { label: 'Earthmoving', kids: ['Skid steers', 'Excavators', 'Wheel loaders'] },
    { label: 'Trucks', kids: ['Dump trucks', 'Mixer trucks'] },
    { label: 'Access', kids: ['Scissor lifts'] },
    { label: 'Compaction', kids: ['Road rollers'] },
  ],
  material: [
    { label: 'Metals', kids: ['Aluminum', 'Steel', 'Stainless', 'Copper'], open: true },
    { label: 'Wood', kids: ['Plywood', 'MDF', 'Hardwood'] },
    { label: 'Plastics', kids: ['Acrylic', 'Polycarbonate', 'HDPE', 'Nylon'] },
    { label: 'Rubber & Glass', kids: ['Rubber sheet', 'Fiberglass', 'Foam'] },
    { label: 'Structural', kids: ['Strut channel', 'Threaded rod'] },
  ],
};
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
const EQUIP_IMG = (name) => `assets/equipment/${name}.jpg?v=industrial-20260628b`;
const MAT_IMG = (name) => `assets/materials/${name}.jpg?v=industrial-20260628b`;

/* ---------------- Listings — Jobs (services / products to quote) ---------------- */
// badge tones: lime (FEATURED/NEW), blue (TOP), red (% OFF)
const JOBS = [
  { id: 'J-1', kind: 'job', title: '6-Layer PCB · HASL Finish', vendor: 'Circuit Guild', city: 'Dammam', rating: 5.0, reviews: 137, tags: ['PCB Fab', 'Multilayer'], cat: 'PCB Fab', icon: 'grid', image: CARD_IMG(1), badge: { l: 'FEATURED', t: 'lime' }, off: 25, featured: true, blurb: 'Turnkey multilayer fabrication with controlled-impedance stack-ups and 24-hour express options.', instant: true },
  { id: 'J-2', kind: 'job', title: 'FDM Print · PLA / PETG / ABS', vendor: 'Vertex Fabrication', city: 'Riyadh', rating: 5.0, reviews: 137, tags: ['3D Print', 'FDM'], cat: '3D Printing', icon: 'box', image: CARD_IMG(2), badge: { l: 'TOP #1', t: 'blue' }, off: 0, featured: true, blurb: 'Industrial FDM farm — up to 300×300×400 mm, fast turnaround on functional prototypes.', instant: true },
  { id: 'J-3', kind: 'job', title: 'Prototype PCB · Quick-turn', vendor: 'Circuit Guild', city: 'Dammam', rating: 5.0, reviews: 137, tags: ['PCB Fab', 'Multilayer'], cat: 'PCB Fab', icon: 'grid', image: CARD_IMG(3), badge: { l: 'FEATURED', t: 'lime' }, off: 7, featured: true, blurb: 'Bare boards in 48 hours. ENIG or HASL, soldermask in six colors.', instant: true },
  { id: 'J-4', kind: 'job', title: 'Bandsaw Cutting · Metal & Wood', vendor: 'Forge & Form', city: 'Riyadh', rating: 5.0, reviews: 137, tags: ['Cutting', 'Sheet'], cat: 'Laser', icon: 'tools', image: CARD_IMG(4), badge: { l: 'NEW', t: 'lime' }, off: 18, blurb: 'Precision stock cutting to length with deburring included.' },
  { id: 'J-5', kind: 'job', title: 'Resin (SLA) High-Detail Prints', vendor: 'Vertex Fabrication', city: 'Riyadh', rating: 5.0, reviews: 137, tags: ['3D Print', 'SLA'], cat: '3D Printing', icon: 'box', image: CARD_IMG(5), off: 0, blurb: '8K resin detail for miniatures, jewelry masters and dental masters with fast parametric quoting.', instant: true },
  { id: 'J-6', kind: 'job', title: 'Flex PCB · Polyimide', vendor: 'Circuit Guild', city: 'Dammam', rating: 5.0, reviews: 137, tags: ['PCB Fab', 'Flex'], cat: 'PCB Fab', icon: 'grid', image: CARD_IMG(6), off: 7, blurb: 'Single and double-sided flex circuits with stiffeners.' },
  { id: 'J-7', kind: 'job', title: 'Laser Cut · Sheet Metal', vendor: 'Atlas Makerworks', city: 'Jeddah', rating: 5.0, reviews: 137, tags: ['Laser', 'Sheet'], cat: 'Laser', icon: 'layers', image: CARD_IMG(7), badge: { l: 'NEW', t: 'lime' }, off: 0, blurb: 'Fiber laser cutting for mild steel, stainless and aluminium — upload a DXF for an instant nested price.', instant: true },
  { id: 'J-8', kind: 'job', title: '5-Axis CNC Milling', vendor: 'Northgate Labs', city: 'Khobar', rating: 5.0, reviews: 137, tags: ['CNC', 'Aluminium'], cat: 'CNC', icon: 'tools', image: CARD_IMG(8), badge: { l: 'TOP #5', t: 'blue' }, off: 0, blurb: 'Tight-tolerance machined parts in aluminium, brass and POM.' },
  { id: 'J-9', kind: 'job', title: 'Bandsaw Cutting · Heavy Stock', vendor: 'Forge & Form', city: 'Riyadh', rating: 5.0, reviews: 137, tags: ['Cutting', 'Metal'], cat: 'Laser', icon: 'tools', image: CARD_IMG(9), off: 18, blurb: 'Horizontal bandsaw for bar and tube up to 250 mm.' },
  { id: 'J-10', kind: 'job', title: 'SMT Assembly · Reflow', vendor: 'Circuit Guild', city: 'Dammam', rating: 5.0, reviews: 137, tags: ['Assembly', 'SMT'], cat: 'PCB Fab', icon: 'grid', image: CARD_IMG(10), off: 0, blurb: 'Stencil, pick-and-place and reflow for small to medium runs.' },
  { id: 'J-11', kind: 'job', title: 'Anodizing & Finishing', vendor: 'Northgate Labs', city: 'Khobar', rating: 5.0, reviews: 137, tags: ['Finishing', 'Metal'], cat: 'CNC', icon: 'layers', image: CARD_IMG(11), off: 0, blurb: 'Type-II anodize in eight colours, bead-blast and passivation.' },
  { id: 'J-12', kind: 'job', title: 'Silicone & Resin Molding', vendor: 'Atlas Makerworks', city: 'Jeddah', rating: 5.0, reviews: 137, tags: ['Molding', 'Casting'], cat: 'Molding', icon: 'box', image: CARD_IMG(12), off: 0, blurb: 'Low-volume vacuum casting from your master or our print.' },
  { id: 'J-13', kind: 'job', title: 'SLS Nylon 12 Prints', vendor: 'Vertex Fabrication', city: 'Riyadh', rating: 4.9, reviews: 86, tags: ['3D Print', 'SLS', 'Nylon'], cat: '3D Printing', icon: 'box', image: CARD_IMG(18), badge: { l: 'NEW', t: 'lime' }, off: 0, blurb: 'Powder-bed nylon parts for durable prototypes, brackets and small batches with no support scars.', instant: true },
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

/* ---------------- Listings — Equipment (heavy machinery rental) ---------------- */
const EQUIPMENT = [
  { id: 'E-1', kind: 'equipment', title: 'Diesel Forklift - 3 Ton', vendor: 'Gulf Lift Rentals', city: 'Riyadh', rating: 5.0, reviews: 84, tags: ['Lifting', 'Warehouse'], cat: 'Lifting', icon: 'truck', image: EQUIP_IMG('forklift'), badge: { l: 'FEATURED', t: 'lime' }, off: 10, featured: true, from: 420, deposit: 2500, lease: true, capacity: '3,000 kg lift - 4.5 m mast', operator: 'Certified operator +SAR 180/day', delivery: 'Flatbed delivery within Riyadh +SAR 250', fuel: 'Diesel supplied full; return full or refuel fee applies', training: 'Forklift license required for self-drive', blurb: 'Counterbalance diesel forklift for pallets, crates and yard loading. Includes inspected forks, beacon, reverse alarm and daily pre-start checklist.', specs: [['Lift capacity', '3,000 kg'], ['Max lift height', '4.5 m'], ['Power', 'Diesel'], ['Fork length', '1,220 mm'], ['Site need', 'Level compacted surface'], ['Min rental', '1 day']] },
  { id: 'E-2', kind: 'equipment', title: 'Telehandler - 14 m Reach', vendor: 'Desert Plant Hire', city: 'Dammam', rating: 4.9, reviews: 61, tags: ['Lifting', 'Rough Terrain'], cat: 'Lifting', icon: 'truck', image: EQUIP_IMG('telehandler'), badge: { l: 'TOP RENTAL', t: 'blue' }, off: 0, featured: true, from: 980, deposit: 6000, lease: true, capacity: '3,500 kg - 14 m reach', operator: 'Operator +SAR 260/day', delivery: 'Lowbed transport quoted by distance', fuel: 'Diesel excluded', training: 'Telehandler ticket required for self-drive', blurb: 'Rough-terrain telehandler for elevated material handling, slab work and site logistics where forklifts cannot reach.', specs: [['Lift capacity', '3,500 kg'], ['Reach', '14 m'], ['Drive', '4x4x4 steering'], ['Attachments', 'Forks included'], ['Ground', 'Outdoor rough terrain'], ['Min rental', '2 days']] },
  { id: 'E-3', kind: 'equipment', title: 'Skid Steer Loader', vendor: 'Forge & Form Plant', city: 'Riyadh', rating: 4.9, reviews: 49, tags: ['Earthmoving', 'Compact'], cat: 'Earthmoving', icon: 'gear', image: EQUIP_IMG('skid-steer-loader'), off: 0, from: 620, deposit: 3500, lease: true, capacity: '0.4 m3 bucket - compact access', operator: 'Operator +SAR 220/day', delivery: 'Tilt-bed delivery +SAR 220', fuel: 'Diesel excluded', training: 'Site induction required', blurb: 'Compact loader for backfilling, grading and moving aggregate in constrained yards and warehouse aprons.', specs: [['Bucket', '0.4 m3'], ['Rated load', '900 kg'], ['Width', '1.7 m'], ['Attachments', 'Bucket included'], ['Best for', 'Tight access earthworks'], ['Min rental', '1 day']] },
  { id: 'E-4', kind: 'equipment', title: 'Mini Excavator - 3.5 Ton', vendor: 'MODON Equipment Pool', city: 'Dammam', rating: 5.0, reviews: 58, tags: ['Earthmoving', 'Excavation'], cat: 'Earthmoving', icon: 'tools', image: EQUIP_IMG('mini-excavator'), badge: { l: 'NEW', t: 'lime' }, off: 0, from: 760, deposit: 4500, lease: true, capacity: '3.5 ton - 3.2 m dig depth', operator: 'Operator +SAR 240/day', delivery: 'Lowbed delivery +SAR 350 within city', fuel: 'Diesel excluded', training: 'Excavator operator card required for self-drive', blurb: 'Compact excavator with digging bucket for trenches, footings, landscaping and utility preparation.', specs: [['Operating weight', '3.5 ton'], ['Dig depth', '3.2 m'], ['Bucket', '450 mm trench'], ['Tail swing', 'Compact'], ['Ground', 'Outdoor soil/sub-base'], ['Min rental', '1 day']] },
  { id: 'E-5', kind: 'equipment', title: 'Wheel Loader - 2 m3 Bucket', vendor: 'Northgate Plant', city: 'Khobar', rating: 4.8, reviews: 37, tags: ['Earthmoving', 'Aggregate'], cat: 'Earthmoving', icon: 'truck', image: EQUIP_IMG('wheel-loader'), off: 5, from: 1250, deposit: 8000, lease: true, capacity: '2 m3 general purpose bucket', operator: 'Operator included for first shift', delivery: 'Lowbed transport quoted by route', fuel: 'Diesel excluded', training: 'Operator supplied unless approved account', blurb: 'Production loader for aggregate yards, concrete plants and high-volume material movement.', specs: [['Bucket capacity', '2 m3'], ['Operating weight', '11 ton'], ['Dump height', '2.8 m'], ['Power', 'Diesel'], ['Best for', 'Bulk loading'], ['Min rental', '2 days']] },
  { id: 'E-6', kind: 'equipment', title: 'Cement Mixer Truck - 8 m3', vendor: 'Saudi ReadyMix Fleet', city: 'Riyadh', rating: 4.9, reviews: 42, tags: ['Concrete', 'Truck'], cat: 'Concrete', icon: 'truck', image: EQUIP_IMG('cement-mixer-truck'), badge: { l: 'CONCRETE', t: 'blue' }, off: 0, from: 1450, deposit: 9000, lease: false, capacity: '8 m3 drum - driver included', operator: 'Driver included', delivery: 'Concrete route scheduling required', fuel: 'Included in rate for city jobs', training: 'Supplier-operated only', blurb: 'Mixer truck rental for ready-mix transport, site pours and batching operations. Rate includes driver and washout handling.', specs: [['Drum capacity', '8 m3'], ['Included', 'Driver'], ['Use', 'Concrete transport'], ['Washout', 'Required onsite area'], ['Notice', '24 hours'], ['Min rental', 'Half day']] },
  { id: 'E-7', kind: 'equipment', title: 'Dump Truck - 20 m3', vendor: 'Atlas Haulage', city: 'Jeddah', rating: 4.8, reviews: 55, tags: ['Trucks', 'Hauling'], cat: 'Trucks', icon: 'truck', image: EQUIP_IMG('dump-truck'), off: 0, from: 1180, deposit: 7000, lease: true, capacity: '20 m3 tipper body - driver included', operator: 'Driver included', delivery: 'Haul route priced by zone', fuel: 'Included for contracted haul', training: 'Supplier-operated only', blurb: 'Tipper truck for sand, aggregate, demolition spoil and site-to-site hauling with licensed driver.', specs: [['Body volume', '20 m3'], ['Payload', 'Approx. 26 ton'], ['Included', 'Driver'], ['Best for', 'Bulk haulage'], ['Permits', 'By route'], ['Min rental', '1 shift']] },
  { id: 'E-8', kind: 'equipment', title: 'Mobile Crane - 50 Ton', vendor: 'Red Sea Crane Co.', city: 'Jeddah', rating: 5.0, reviews: 46, tags: ['Lifting', 'Crane'], cat: 'Lifting', icon: 'tools', image: EQUIP_IMG('mobile-crane'), badge: { l: 'LIFT PLAN', t: 'blue' }, off: 0, from: 2850, deposit: 15000, lease: false, capacity: '50 ton class - certified operator', operator: 'Operator and rigger quoted together', delivery: 'Mobilization priced by site', fuel: 'Included for standard shift', training: 'Lift plan and site permit required', blurb: 'Certified mobile crane for machinery placement, steel erection and heavy lifts. Requires lift plan review before dispatch.', specs: [['Capacity class', '50 ton'], ['Boom', 'Up to 40 m'], ['Included', 'Operator'], ['Required', 'Lift plan'], ['Site need', 'Outrigger pad area'], ['Min rental', '1 shift']] },
  { id: 'E-9', kind: 'equipment', title: 'Scissor Lift - 12 m Electric', vendor: 'Access Pro Rentals', city: 'Riyadh', rating: 4.9, reviews: 73, tags: ['Access', 'Indoor'], cat: 'Access', icon: 'arrowUp', image: EQUIP_IMG('scissor-lift'), off: 12, from: 360, deposit: 1800, lease: true, capacity: '12 m working height - electric', operator: 'Self-drive after familiarization', delivery: 'Delivery +SAR 180 within Riyadh', fuel: 'Battery charger included', training: 'IPAF-style familiarization on handover', blurb: 'Electric scissor lift for MEP installation, warehouse maintenance and indoor fit-out work on flat slabs.', specs: [['Working height', '12 m'], ['Platform capacity', '320 kg'], ['Power', 'Electric'], ['Surface', 'Flat slab only'], ['Width', '1.2 m'], ['Min rental', '1 day']] },
  { id: 'E-10', kind: 'equipment', title: 'Compact Road Roller - 3 Ton', vendor: 'Forge & Form Plant', city: 'Riyadh', rating: 4.8, reviews: 34, tags: ['Compaction', 'Roadwork'], cat: 'Compaction', icon: 'gear', image: EQUIP_IMG('compact-roller'), off: 0, from: 540, deposit: 3000, lease: true, capacity: '3 ton vibratory roller', operator: 'Operator +SAR 200/day', delivery: 'Tilt-bed delivery +SAR 220', fuel: 'Diesel excluded', training: 'Operator card required for self-drive', blurb: 'Vibratory roller for asphalt patching, sub-base compaction, yards and small roadwork areas.', specs: [['Operating weight', '3 ton'], ['Drum width', '1.2 m'], ['Vibration', 'Single drum'], ['Best for', 'Patching and sub-base'], ['Water system', 'Included'], ['Min rental', '1 day']] },
];

/* ---------------- Listings — Materials (industrial catalog stock) ---------------- */
const MATERIALS = [
  { id: 'M-1', kind: 'material', title: 'Aluminum 6061 Plate', vendor: 'Gulf Metals Supply', city: 'Riyadh', rating: 5.0, reviews: 186, tags: ['Metals', 'Aluminum'], cat: 'Metals', icon: 'layers', image: MAT_IMG('aluminum-plate'), badge: { l: 'BESTSELLER', t: 'blue' }, off: 0, featured: true, price: 95, unit: 'plate', stock: 92, dimensions: '300 x 300 x 6 mm', grade: '6061-T6', finish: 'Mill finish', cutToSize: true, variants: { label: 'Thickness', options: ['3 mm', '6 mm', '10 mm', '12 mm'] }, blurb: 'General-purpose aluminum plate for fixtures, machine guards, brackets and CNC machining.' },
  { id: 'M-2', kind: 'material', title: 'Mild Steel Angle', vendor: 'Atlas Industrial Supply', city: 'Jeddah', rating: 4.9, reviews: 112, tags: ['Metals', 'Structural'], cat: 'Structural', icon: 'tools', image: MAT_IMG('steel-angle'), off: 0, featured: true, price: 42, unit: 'length', stock: 160, dimensions: '40 x 40 x 4 mm - 1 m', grade: 'S275 mild steel', finish: 'Black mill finish', cutToSize: true, variants: { label: 'Size', options: ['25 x 25 mm', '40 x 40 mm', '50 x 50 mm'] }, blurb: 'Hot-rolled angle for frames, guards, shelves and welded shop structures.' },
  { id: 'M-3', kind: 'material', title: 'Stainless Steel Round Rod', vendor: 'Gulf Metals Supply', city: 'Riyadh', rating: 4.9, reviews: 98, tags: ['Metals', 'Stainless'], cat: 'Metals', icon: 'tools', image: MAT_IMG('stainless-rod'), badge: { l: '304', t: 'lime' }, off: 0, price: 58, unit: 'rod', stock: 120, dimensions: '12 mm dia x 1 m', grade: '304 stainless', finish: 'Polished drawn', cutToSize: true, variants: { label: 'Diameter', options: ['8 mm', '12 mm', '16 mm', '20 mm'] }, blurb: 'Corrosion-resistant round rod for shafts, pins, standoffs and food-safe fixtures.' },
  { id: 'M-4', kind: 'material', title: 'Copper Sheet Roll', vendor: 'Circuit Guild', city: 'Dammam', rating: 4.8, reviews: 74, tags: ['Metals', 'Copper'], cat: 'Metals', icon: 'layers', image: MAT_IMG('copper-sheet'), off: 5, price: 135, unit: 'roll', stock: 48, dimensions: '300 mm x 1 m x 0.5 mm', grade: 'C110 copper', finish: 'Bright annealed', cutToSize: false, variants: { label: 'Thickness', options: ['0.3 mm', '0.5 mm', '1.0 mm'] }, blurb: 'Conductive copper sheet for bus bars, shielding, prototypes and electrical fabrication.' },
  { id: 'M-5', kind: 'material', title: 'Birch Plywood Sheet', vendor: 'Timber Yard KSA', city: 'Riyadh', rating: 4.9, reviews: 132, tags: ['Wood', 'Plywood'], cat: 'Wood', icon: 'image', image: MAT_IMG('birch-plywood'), badge: { l: 'CUT READY', t: 'blue' }, off: 0, price: 68, unit: 'sheet', stock: 210, dimensions: '600 x 400 x 9 mm', grade: 'BB/BB birch', finish: 'Sanded', cutToSize: true, variants: { label: 'Thickness', options: ['6 mm', '9 mm', '12 mm', '18 mm'] }, blurb: 'Stable birch plywood for jigs, enclosures, furniture prototypes and CNC router work.' },
  { id: 'M-6', kind: 'material', title: 'MDF Panel', vendor: 'Timber Yard KSA', city: 'Riyadh', rating: 4.8, reviews: 88, tags: ['Wood', 'MDF'], cat: 'Wood', icon: 'image', image: MAT_IMG('mdf-panel'), off: 0, price: 32, unit: 'panel', stock: 260, dimensions: '600 x 400 x 12 mm', grade: 'Moisture-resistant MDF', finish: 'Raw', cutToSize: true, variants: { label: 'Thickness', options: ['6 mm', '12 mm', '18 mm'] }, blurb: 'Smooth MDF panel for templates, signage, fixtures, routing tests and painted prototypes.' },
  { id: 'M-7', kind: 'material', title: 'Hardwood Plank - Oak', vendor: 'Timber Yard KSA', city: 'Jeddah', rating: 4.9, reviews: 57, tags: ['Wood', 'Hardwood'], cat: 'Wood', icon: 'layers', image: MAT_IMG('hardwood-plank'), off: 0, price: 85, unit: 'plank', stock: 64, dimensions: '90 x 20 mm - 1 m', grade: 'Kiln-dried oak', finish: 'Planed two sides', cutToSize: true, variants: { label: 'Species', options: ['Oak', 'Beech', 'Ash'] }, blurb: 'Hardwood stock for handles, fixtures, furniture details and visible prototype parts.' },
  { id: 'M-8', kind: 'material', title: 'Clear Acrylic Sheet', vendor: 'Atlas Industrial Supply', city: 'Jeddah', rating: 5.0, reviews: 151, tags: ['Plastics', 'Acrylic'], cat: 'Plastics', icon: 'image', image: MAT_IMG('acrylic-sheet'), badge: { l: 'LASER READY', t: 'lime' }, off: 8, price: 38, unit: 'sheet', stock: 170, dimensions: '600 x 400 x 3 mm', grade: 'Cast PMMA', finish: 'Clear gloss', cutToSize: true, variants: { label: 'Thickness', options: ['2 mm', '3 mm', '5 mm', '8 mm'] }, blurb: 'Cast acrylic sheet for laser-cut panels, windows, guards and display fixtures.' },
  { id: 'M-9', kind: 'material', title: 'Polycarbonate Sheet', vendor: 'Atlas Industrial Supply', city: 'Dammam', rating: 4.8, reviews: 69, tags: ['Plastics', 'Impact'], cat: 'Plastics', icon: 'image', image: MAT_IMG('polycarbonate-sheet'), off: 0, price: 72, unit: 'sheet', stock: 86, dimensions: '600 x 400 x 4 mm', grade: 'UV-stabilized PC', finish: 'Clear', cutToSize: true, variants: { label: 'Thickness', options: ['3 mm', '4 mm', '6 mm'] }, blurb: 'Tough transparent sheet for machine guards, protective covers and outdoor fixtures.' },
  { id: 'M-10', kind: 'material', title: 'HDPE Machining Block', vendor: 'Northgate Plastics', city: 'Khobar', rating: 4.9, reviews: 52, tags: ['Plastics', 'HDPE'], cat: 'Plastics', icon: 'box', image: MAT_IMG('hdpe-block'), off: 0, price: 64, unit: 'block', stock: 73, dimensions: '150 x 100 x 50 mm', grade: 'Natural HDPE', finish: 'Matte white', cutToSize: true, variants: { label: 'Size', options: ['150 x 100 x 25 mm', '150 x 100 x 50 mm', '300 x 150 x 50 mm'] }, blurb: 'Low-friction HDPE block for guides, wear pads, fixtures and wet-area components.' },
  { id: 'M-11', kind: 'material', title: 'Nylon Round Rod', vendor: 'Northgate Plastics', city: 'Khobar', rating: 4.8, reviews: 44, tags: ['Plastics', 'Nylon'], cat: 'Plastics', icon: 'tools', image: MAT_IMG('nylon-rod'), off: 0, price: 46, unit: 'rod', stock: 91, dimensions: '25 mm dia x 500 mm', grade: 'PA6 nylon', finish: 'Natural white', cutToSize: true, variants: { label: 'Diameter', options: ['16 mm', '25 mm', '40 mm'] }, blurb: 'Machinable nylon rod for bushings, rollers, spacers and low-noise mechanical parts.' },
  { id: 'M-12', kind: 'material', title: 'Neoprene Rubber Sheet', vendor: 'Atlas Industrial Supply', city: 'Jeddah', rating: 4.8, reviews: 76, tags: ['Rubber', 'Gasket'], cat: 'Rubber', icon: 'layers', image: MAT_IMG('rubber-sheet'), off: 0, price: 55, unit: 'sheet', stock: 118, dimensions: '500 x 500 x 3 mm', grade: '60A neoprene', finish: 'Smooth black', cutToSize: true, variants: { label: 'Thickness', options: ['1.5 mm', '3 mm', '6 mm'] }, blurb: 'Oil-resistant rubber sheet for gaskets, pads, vibration isolation and seals.' },
  { id: 'M-13', kind: 'material', title: 'Rigid Foam Board', vendor: 'Prototype Supply Co.', city: 'Riyadh', rating: 4.7, reviews: 63, tags: ['Foam', 'Modeling'], cat: 'Rubber', icon: 'image', image: MAT_IMG('foam-board'), off: 0, price: 24, unit: 'board', stock: 190, dimensions: '600 x 400 x 10 mm', grade: 'PVC foam board', finish: 'White matte', cutToSize: true, variants: { label: 'Thickness', options: ['5 mm', '10 mm', '20 mm'] }, blurb: 'Lightweight board for mockups, signage, templates and quick router-friendly prototypes.' },
  { id: 'M-14', kind: 'material', title: 'Fiberglass Sheet', vendor: 'Gulf Composites', city: 'Dammam', rating: 4.8, reviews: 39, tags: ['Glass', 'Composite'], cat: 'Glass', icon: 'layers', image: MAT_IMG('fiberglass-sheet'), off: 0, price: 88, unit: 'sheet', stock: 58, dimensions: '500 x 500 x 2 mm', grade: 'G10/FR4 glass epoxy', finish: 'Natural green', cutToSize: true, variants: { label: 'Thickness', options: ['1 mm', '2 mm', '3 mm'] }, blurb: 'Rigid insulating fiberglass sheet for electrical panels, fixtures and structural prototypes.' },
  { id: 'M-15', kind: 'material', title: 'Galvanized Strut Channel', vendor: 'Atlas Industrial Supply', city: 'Jeddah', rating: 4.9, reviews: 105, tags: ['Structural', 'Channel'], cat: 'Structural', icon: 'tools', image: MAT_IMG('strut-channel'), badge: { l: 'STRUCTURAL', t: 'blue' }, off: 0, price: 52, unit: 'length', stock: 130, dimensions: '41 x 41 mm - 1 m', grade: 'Galvanized steel', finish: 'Pre-galvanized', cutToSize: true, variants: { label: 'Length', options: ['1 m', '2 m', '3 m'] }, blurb: 'Slotted strut channel for machine frames, supports, cable trays and adjustable fixtures.' },
  { id: 'M-16', kind: 'material', title: 'Threaded Steel Rod', vendor: 'Gulf Fasteners', city: 'Riyadh', rating: 4.8, reviews: 117, tags: ['Fasteners', 'Rod'], cat: 'Fasteners', icon: 'tools', image: MAT_IMG('threaded-rod'), off: 0, price: 18, unit: 'rod', stock: 340, dimensions: 'M10 x 1 m', grade: 'Class 4.8 steel', finish: 'Zinc plated', cutToSize: true, variants: { label: 'Thread', options: ['M6', 'M8', 'M10', 'M12'] }, blurb: 'Fully threaded rod for brackets, hangers, jigs, clamping fixtures and structural tie-ins.' },
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

const JOB_DETAIL_SLA = Object.assign({}, JOB_DETAIL_FIXED, {
  id: 'J-5',
  fixed: false,
  title: 'Resin (SLA) High-Detail Prints',
  crumb: ['Home', 'Jobs', '3D Printing', 'SLA Resin'],
  available: 'Quoting instantly',
  badges: [{ l: 'Instant Quote', t: 'blue' }, { l: 'Fine Detail', t: 'pos' }],
  gallery: ['Resin detail', 'Supports', 'Clear resin', 'Dental model', 'Miniature', 'Finish'],
  galleryImages: [CARD_IMG(5), CARD_IMG(18), CARD_IMG(17), CARD_IMG(13), CARD_IMG(2), CARD_IMG(4)],
  blurb: 'High-detail SLA and MSLA resin printing for presentation models, miniatures, dental masters and small intricate parts. Upload STL or STEP and calculate a fast resin exposure quote.',
  specs: [
    ['Technology', 'SLA / MSLA resin'], ['Build volume', 'up to Form 3L class for larger parts'],
    ['Layer height', '0.025 mm - 0.10 mm'], ['Materials', 'Standard resin - Tough resin'],
    ['Supports', 'Generated and removed after print'], ['Post-processing', 'Wash and UV cure included'],
    ['Best for', 'Fine features and smooth surfaces'], ['Lead time', '2-5 working days'],
  ],
  materials: ['Standard resin', 'Tough resin'],
  colours: [['Grey', '#9E9E9E'], ['White', '#F5F5F5'], ['Black', '#212121'], ['Clear', '#DDEAF0']],
  fileTypes: ['STL', 'STEP / STP'],
  finishes: ['Standard support removal', 'Fine sanding +SAR 35/part', 'Primer-ready +SAR 50/part'],
});

const JOB_DETAIL_SLS = Object.assign({}, JOB_DETAIL_FIXED, {
  id: 'J-13',
  fixed: false,
  title: 'SLS Nylon 12 Prints',
  crumb: ['Home', 'Jobs', '3D Printing', 'SLS Nylon'],
  available: 'Quoting instantly',
  badges: [{ l: 'Instant Quote', t: 'blue' }, { l: 'No Supports', t: 'pos' }],
  gallery: ['Nylon parts', 'Powder bed', 'Functional bracket', 'Batch nest', 'Finish', 'Scale'],
  galleryImages: [CARD_IMG(18), CARD_IMG(12), CARD_IMG(8), CARD_IMG(2), CARD_IMG(11), CARD_IMG(4)],
  blurb: 'SLS Nylon 12 powder-bed printing for durable functional parts and small batches. The quote model accounts for chamber occupancy, packing density and powder refresh allocation.',
  specs: [
    ['Technology', 'SLS powder bed'], ['Material', 'Nylon 12 powder'],
    ['Build chamber', 'Fuse 1+ and EOS-class profiles'], ['Supports', 'None required'],
    ['Layer height', '0.11 mm - 0.12 mm typical'], ['Finish', 'Depowdered matte white/grey'],
    ['Best for', 'Durable prototypes and nested batches'], ['Lead time', '4-7 working days'],
  ],
  materials: ['Nylon 12 powder'],
  colours: [['Natural white', '#E7E4DC'], ['Dyed black', '#242424']],
  fileTypes: ['STL', 'STEP / STP'],
  finishes: ['Depowdered standard', 'Tumbled +SAR 30/part', 'Dyed black +SAR 45/part'],
});

const JOB_DETAIL_AM_BY_ID = { 'J-2': JOB_DETAIL_FIXED, 'J-5': JOB_DETAIL_SLA, 'J-13': JOB_DETAIL_SLS };

/* ---------------- Rich job detail - laser instant quote ---------------- */
const JOB_DETAIL_LASER = {
  id: 'J-7',
  fixed: false,
  title: 'Laser Cut · Sheet Metal',
  crumb: ['Home', 'Jobs', 'Laser', 'Laser Cut · Sheet Metal'],
  vendor: 'Atlas Makerworks', city: 'Jeddah', rating: 5.0, orders: 137,
  available: 'Quoting instantly',
  badges: [{ l: 'Instant Quote', t: 'blue' }, { l: 'Sheet Metal', t: 'pos' }],
  gallery: ['Flat pattern', 'Nested sheet', 'Cut edge', 'Stainless', 'Aluminium', 'Deburring'],
  galleryImages: [CARD_IMG(7), CARD_IMG(4), CARD_IMG(9), CARD_IMG(11), CARD_IMG(12), CARD_IMG(8)],
  blurb: 'Fiber-laser flat-pattern cutting in mild steel, stainless and aluminium. Upload a DXF and calculate an indicative sheet-cutting price from material, thickness, cut length, pierces and nest yield.',
  specs: [
    ['Technology', 'Fiber laser cutting'], ['Materials', 'Mild steel - Stainless 304 - Aluminium'],
    ['Thickness', '1 - 10 mm material-dependent'], ['Sheet size', 'up to 2500 x 1250 mm'],
    ['Edge quality', 'Standard - fine / fusion edge'], ['Secondary ops', 'Deburring and bend review available'],
    ['Best for', 'Flat brackets, panels, guards and profiles'], ['Lead time', '3-7 working days'],
  ],
  tiers: [
    { qty: 1, label: '1 part', price: 65, unit: '/ part', note: 'Minimum instant order' },
    { qty: 5, label: '5 parts', price: 220, unit: '/ batch', note: 'Small batch' },
    { qty: 10, label: '10 parts', price: 390, unit: '/ batch', note: 'Save with nesting', save: 'SAVE 12%', popular: true },
    { qty: 25, label: '25 parts', price: 820, unit: '/ batch', note: 'Production run', save: 'SAVE 20%' },
  ],
  materials: ['Mild steel', 'Stainless 304', 'Aluminium 5052'],
  colours: [['Raw metal', '#B9B7AD'], ['Brushed', '#D5D7DA'], ['Black powder coat', '#202124']],
  fileTypes: ['DXF', 'DWG', 'SVG', 'STEP / STP'],
  finishes: ['Raw cut edge', 'Deburred +SAR 15/part', 'Powder-coat review'],
};

const JOB_DETAIL_LASER_BY_ID = { 'J-7': JOB_DETAIL_LASER };

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
    quoteDefaults: { layers: '6' },
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
    quoteDefaults: { layers: '2' },
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
  'J-7': {
    id: 'J-7',
    crumb: ['Home', 'Jobs', 'Laser', 'Laser Cut · Sheet Metal'],
    location: 'Industrial Area, Jeddah',
    available: 'Quoting instantly',
    quote: true,                 // embed the instant-quote engine
    quoteEngine: 'laser',        // laser / sheet-metal engine
    quoteProcess: 'laser',
    summary: 'Fiber-laser flat-pattern cutting in mild steel, stainless and aluminium. Upload a DXF for an instant, indicative price — material, thickness, quantity and nest yield update live. Atlas Makerworks confirms a firm quote before anything is charged.',
    specs: [
      { k: 'Materials',   v: 'Mild steel · Stainless 304 · Aluminium', icon: 'layers' },
      { k: 'Thickness',   v: '1 – 10 mm (material-dependent)', icon: 'filter' },
      { k: 'Sheet size',  v: 'up to 2500 × 1250 mm', icon: 'box' },
      { k: 'Edge',        v: 'Standard · fine / fusion edge', icon: 'gear' },
      { k: 'Lead time',   v: '3 days express · 7 standard', icon: 'truck' },
      { k: 'Tolerance',   v: '± 0.1 mm typical', icon: 'wallet' },
    ],
    steps: [
      { ic: 'upload', t: 'Upload your DXF', s: 'Flat pattern — parsed and nested in your browser' },
      { ic: 'gear',   t: 'Pick material, thickness & quantity', s: 'Live indicative price as you change options' },
      { ic: 'send',   t: 'Request supplier match', s: 'Atlas Makerworks confirms a firm quote' },
    ],
  },
  'J-5': {
    id: 'J-5',
    crumb: ['Home', 'Jobs', '3D Printing', 'SLA Resin'],
    location: 'Industrial City 2, Riyadh',
    available: 'Quoting instantly',
    quote: true,
    quoteEngine: '3d',
    quoteProcess: 'sla',
    summary: 'High-detail resin printing for presentation models, miniatures and dental masters. Upload STL or STEP and calculate a fast resin exposure quote.',
    specs: [
      { k: 'Technology', v: 'SLA / MSLA resin', icon: 'layers' },
      { k: 'Layer height', v: '0.025 - 0.10 mm', icon: 'filter' },
      { k: 'Materials', v: 'Standard resin - Tough resin', icon: 'box' },
      { k: 'Supports', v: 'Generated and removed', icon: 'tools' },
      { k: 'Post-process', v: 'Wash and UV cure included', icon: 'gear' },
      { k: 'Lead time', v: '2-5 working days', icon: 'truck' },
    ],
    steps: [
      { ic: 'upload', t: 'Upload your model', s: 'STL or STEP - analysed in your browser' },
      { ic: 'gear', t: 'Pick resin and quality', s: 'Layer exposure model calculates time and support resin' },
      { ic: 'send', t: 'Request supplier match', s: 'Vertex Fabrication confirms manufacturability' },
    ],
  },
  'J-13': {
    id: 'J-13',
    crumb: ['Home', 'Jobs', '3D Printing', 'SLS Nylon'],
    location: 'Industrial City 2, Riyadh',
    available: 'Quoting instantly',
    quote: true,
    quoteEngine: '3d',
    quoteProcess: 'sls',
    summary: 'SLS Nylon 12 powder-bed printing for durable functional parts and small batches. The quote accounts for chamber occupancy, packing density and powder refresh allocation.',
    specs: [
      { k: 'Technology', v: 'SLS powder bed', icon: 'layers' },
      { k: 'Material', v: 'Nylon 12 powder', icon: 'box' },
      { k: 'Supports', v: 'None required', icon: 'check' },
      { k: 'Packing', v: 'Build-share model', icon: 'grid' },
      { k: 'Finish', v: 'Depowdered matte surface', icon: 'gear' },
      { k: 'Lead time', v: '4-7 working days', icon: 'truck' },
    ],
    steps: [
      { ic: 'upload', t: 'Upload your model', s: 'STL or STEP - analysed in your browser' },
      { ic: 'gear', t: 'Pick nylon quality and quantity', s: 'Powder packing model estimates chamber share' },
      { ic: 'send', t: 'Request supplier match', s: 'Vertex Fabrication confirms nesting and delivery' },
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
  HERO_SLIDES, PROMO_IMAGE, JOB_CHIPS, SPACE_CHIPS, EQUIPMENT_CHIPS, MATERIAL_CHIPS, KIND_META, KIND_ORDER,
  FILTER_TREE, FILTER_TREES, LOCATIONS, RATING_OPTS, DEAL_OPTS,
  VENDORS, JOBS, SPACES, EQUIPMENT, MATERIALS, SPACE_DETAIL, JOB_DETAIL, JOB_DETAIL_FIXED,
  JOB_DETAIL_SLA, JOB_DETAIL_SLS, JOB_DETAIL_AM_BY_ID,
  JOB_DETAIL_LASER, JOB_DETAIL_LASER_BY_ID,
  JOB_DETAIL_PCB, JOB_DETAIL_PCB6, JOB_DETAIL_PCB_BY_ID, JOB_DETAILS, MOCK_ORDERS, MOCK_QUOTES, CLIENT,
  REWARD_TIERS, getRewardStatus, MARKET_STATS,
});
