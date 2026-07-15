// client_pages_browse.jsx - filtering / results page
const { useState: usePBrowse } = React;

const PRICE_LIMIT = 3000;
const EMPTY_FILTERS = {
  sort: 'Recommended',
  categories: [],
  locations: [],
  rating: '4.5 & up',
  deals: [],
  priceMax: PRICE_LIMIT,
};

const normFilter = (v) => String(v || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const itemText = (i) => normFilter([i.title, i.vendor, i.city, i.cat, ...(i.tags || [])].join(' '));
const itemPrice = (i) => Number.isFinite(Number(i.price)) ? Number(i.price) : Number.isFinite(Number(i.from)) ? Number(i.from) : null;

function itemMatchesCategory(item, cat) {
  const text = itemText(item);
  const c = normFilter(cat);
  if (!c) return true;
  const aliases = {
    'fdm fff': ['fdm', 'fff'],
    'sla resin': ['sla', 'resin'],
    'sls': ['sls'],
    'sheet fabrication': ['laser', 'sheet', 'cutting'],
    'cnc machining': ['cnc', 'milling', 'turning'],
    electronics: ['pcb', 'assembly', 'reflow', 'smt'],
    desks: ['desk'],
    labs: ['lab'],
    'shop floor': ['shop floor', 'workshop', 'studio'],
    forklifts: ['forklift'],
    telehandlers: ['telehandler'],
    cranes: ['crane'],
    'skid steers': ['skid steer'],
    excavators: ['excavator'],
    'wheel loaders': ['wheel loader'],
    'dump trucks': ['dump truck'],
    'mixer trucks': ['mixer truck'],
    'scissor lifts': ['scissor lift'],
    aluminum: ['aluminum', 'aluminium'],
    'rubber glass': ['rubber', 'glass', 'fiberglass', 'foam'],
  };
  return (aliases[c] || [c]).some(t => text.includes(t));
}

function applyBrowseFilters(items, query, filters) {
  const q = normFilter(query);
  const ratingMin = filters.rating === 'Any' ? 0 : parseFloat(filters.rating) || 0;
  let out = items.filter(i => {
    if (q && !itemText(i).includes(q)) return false;
    if (filters.categories.length && !filters.categories.some(c => itemMatchesCategory(i, c))) return false;
    if (filters.locations.length && !filters.locations.includes(i.city)) return false;
    if ((i.rating || 0) < ratingMin) return false;
    const price = itemPrice(i);
    if (price != null && price > filters.priceMax) return false;
    if (filters.deals.length) {
      const ok = filters.deals.every(d => {
        if (d === 'On sale') return (i.off || 0) > 0;
        if (d === 'Featured') return !!i.featured || (i.badge && /featured/i.test(i.badge.l || ''));
        if (d === 'New this week') return i.badge && /new/i.test(i.badge.l || '');
        if (d === 'Subscriber-only') return !!i.sub;
        return true;
      });
      if (!ok) return false;
    }
    return true;
  });
  if (filters.sort === 'Top rated') out = [...out].sort((a, b) => (b.rating || 0) - (a.rating || 0) || (b.reviews || 0) - (a.reviews || 0));
  if (filters.sort === 'Price: low to high') out = [...out].sort((a, b) => (itemPrice(a) ?? Number.MAX_SAFE_INTEGER) - (itemPrice(b) ?? Number.MAX_SAFE_INTEGER));
  if (filters.sort === 'Newest') out = [...out].sort((a, b) => ((b.badge && /new/i.test(b.badge.l || '')) ? 1 : 0) - ((a.badge && /new/i.test(a.badge.l || '')) ? 1 : 0) || String(b.id).localeCompare(String(a.id)));
  return out;
}

function FilterGroup({ label, children, open: openInit = false }) {
  const [open, setOpen] = usePBrowse(openInit);
  return (
    <div style={{ borderBottom: '1px solid var(--line)', padding: '4px 0' }}>
      <button onClick={() => setOpen(o => !o)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: 'none', background: 'transparent', padding: '14px 0', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 16, color: 'var(--ink)', letterSpacing: '-0.01em' }}>
        {label}
        <Icon name={open ? 'chevD' : 'chevR'} size={17} style={{ color: 'var(--ink-3)' }} />
      </button>
      {open && <div style={{ paddingBottom: 16, display: 'flex', flexDirection: 'column', gap: 11, animation: 'ff-fade .2s ease' }}>{children}</div>}
    </div>
  );
}

function RadioRow({ label, checked, onClick }) {
  return (
    <button onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 10, border: 'none', background: 'transparent', padding: '2px 0', fontSize: 14, color: checked ? 'var(--ff-blue)' : 'var(--ink-2)', fontWeight: checked ? 700 : 500, textAlign: 'left' }}>
      <span style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid ' + (checked ? 'var(--ff-blue)' : 'var(--line-strong)'), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {checked && <span style={{ width: 9, height: 9, borderRadius: '50%', background: 'var(--ff-blue)' }} />}
      </span>
      {label}
    </button>
  );
}

function CheckRow({ label, checked, onClick }) {
  return (
    <button onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 10, border: 'none', background: 'transparent', padding: '2px 0', fontSize: 14, color: checked ? 'var(--ff-blue)' : 'var(--ink-2)', fontWeight: checked ? 700 : 500, textAlign: 'left' }}>
      <span className="chamfer-sm" style={{ width: 18, height: 18, border: '2px solid ' + (checked ? 'var(--ff-blue)' : 'var(--line-strong)'), background: checked ? 'var(--ff-blue)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {checked && <Icon name="check" size={12} stroke={3} style={{ color: '#fff' }} />}
      </span>
      {label}
    </button>
  );
}

function TreeNode({ node, selected, onToggle }) {
  const [open, setOpen] = usePBrowse(!!node.open);
  const parentOn = selected.includes(node.label);
  return (
    <div>
      <button onClick={() => { onToggle(node.label); setOpen(true); }} style={{ display: 'flex', alignItems: 'center', gap: 8, border: 'none', background: 'transparent', padding: '3px 0', fontSize: 14, fontWeight: 600, color: parentOn ? 'var(--ff-blue)' : 'var(--ink)', textAlign: 'left' }}>
        <span onClick={e => { e.stopPropagation(); setOpen(o => !o); }} style={{ width: 14, color: 'var(--ff-blue)', fontWeight: 700, fontSize: 16, lineHeight: 1 }}>{open ? '-' : '+'}</span>
        {node.label}
      </button>
      {open && <div style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingLeft: 22, marginTop: 4 }}>
        {node.kids.map(k => {
          const on = selected.includes(k);
          return <button key={k} onClick={() => onToggle(k)} style={{ display: 'flex', alignItems: 'center', gap: 6, border: 'none', background: 'transparent', padding: '1px 0', fontSize: 13.5, color: on ? 'var(--ff-blue)' : 'var(--ink-2)', fontWeight: on ? 700 : 500, textAlign: 'left' }}><span style={{ color: on ? 'var(--ff-blue)' : 'var(--ink-3)', fontWeight: 700 }}>{on ? '✓' : '+'}</span>{k}</button>;
        })}
      </div>}
    </div>
  );
}

function FilterRail({ kind, setKind, filters, setFilters, onClear }) {
  const patch = (next) => setFilters(f => ({ ...f, ...next }));
  const toggleField = (field, value) => setFilters(f => ({ ...f, [field]: f[field].includes(value) ? f[field].filter(x => x !== value) : [...f[field], value] }));
  return (
    <aside className="browse-side chamfer" style={{ width: 260, flexShrink: 0, background: 'var(--surface)', border: '1px solid var(--line)', alignSelf: 'flex-start', position: 'sticky', top: 88 }}>
      <div style={{ padding: '4px 20px 20px' }}>
        <FilterGroup label="Sort by">
          {['Recommended', 'Top rated', 'Price: low to high', 'Newest'].map(s => <RadioRow key={s} label={s} checked={filters.sort === s} onClick={() => patch({ sort: s })} />)}
        </FilterGroup>
        <FilterGroup label="Category" open>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 6 }}>
            {(window.KIND_ORDER || ['job', 'space', 'equipment', 'material']).map(k => (
              <RadioRow key={k} label={window.KIND_META[k].label} checked={kind === k} onClick={() => { setKind(k); patch({ categories: [] }); }} />
            ))}
          </div>
          <div style={{ height: 1, background: 'var(--line)', margin: '4px 0 8px' }} />
          {((window.FILTER_TREES && window.FILTER_TREES[kind]) || window.FILTER_TREE).map(n => <TreeNode key={kind + n.label} node={n} selected={filters.categories} onToggle={v => toggleField('categories', v)} />)}
        </FilterGroup>
        <FilterGroup label="Location">
          {window.LOCATIONS.map(l => <CheckRow key={l} label={l} checked={filters.locations.includes(l)} onClick={() => toggleField('locations', l)} />)}
        </FilterGroup>
        <FilterGroup label="Price">
          <div style={{ padding: '6px 2px 2px' }}>
            <input type="range" min="0" max={PRICE_LIMIT} step="25" value={filters.priceMax} onChange={e => patch({ priceMax: Number(e.target.value) })} style={{ width: '100%' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: 'var(--ink-3)', marginTop: 8, fontWeight: 600 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}><Riyal size={11} />0</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}><Riyal size={11} />{filters.priceMax >= PRICE_LIMIT ? `${PRICE_LIMIT}+` : window.SAR(filters.priceMax)}</span>
            </div>
          </div>
        </FilterGroup>
        <FilterGroup label="Rating">
          {window.RATING_OPTS.map(r => <RadioRow key={r} label={r} checked={filters.rating === r} onClick={() => patch({ rating: r })} />)}
        </FilterGroup>
        <FilterGroup label="Deals">
          {window.DEAL_OPTS.map(d => <CheckRow key={d} label={d} checked={filters.deals.includes(d)} onClick={() => toggleField('deals', d)} />)}
        </FilterGroup>
        <div style={{ paddingTop: 18 }}>
          <button onClick={onClear} className="chamfer-sm focus-lime" style={{ width: '100%', height: 44, border: '1px solid var(--ff-blue)', background: 'var(--surface)', color: 'var(--ff-blue)', fontWeight: 700, fontSize: 13.5, letterSpacing: '0.06em' }}>CLEAR ALL</button>
        </div>
      </div>
    </aside>
  );
}

function MiniPromo() {
  return (
    <div className="chamfer" style={{ position: 'relative', background: 'var(--ff-blue)', overflow: 'hidden', height: 132, marginBottom: 26 }}>
      <svg width="100%" height="132" viewBox="0 0 1000 132" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0 }} aria-hidden="true">
        <path d="M520 0 L1000 0 L1000 132 L420 132 Z" fill="#012ED1" />
        <path d="M560 0 L760 0 L640 132 L520 60 Z" fill="rgba(255,255,255,0.05)" />
      </svg>
      <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '34%', clipPath: 'polygon(28% 0, 100% 0, 100% 100%, 0 100%)' }} className="desktop-only">
        <Thumb icon="grid" tone="navy" h={132} image={window.PROMO_IMAGE} alt="PCB manufacturing promotion" style={{ height: '100%' }} />
      </div>
      <div style={{ position: 'relative', padding: '24px 30px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <span className="chamfer-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, height: 24, padding: '0 11px', background: 'rgba(255,255,255,0.14)', color: '#fff', fontSize: 11.5, fontWeight: 700 }}><span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--ff-lime)' }} />Q2 PROMO</span>
          <span style={{ color: 'var(--ff-lime)', fontWeight: 700, fontSize: 13 }}>-100 % OFF</span>
        </div>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 30, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1 }}>First PCB order free.</div>
        <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', fontWeight: 600, marginTop: 6, display: 'inline-flex', alignItems: 'center', gap: 5 }}><Riyal size={13} color="rgba(255,255,255,0.85)" />500 credit on 2-layer boards</div>
        <div style={{ display: 'flex', gap: 7, marginTop: 12 }}>
          {[0, 1, 2].map(k => <span key={k} style={{ width: k === 0 ? 18 : 8, height: 8, borderRadius: 4, background: k === 0 ? '#fff' : 'rgba(255,255,255,0.4)' }} />)}
        </div>
      </div>
    </div>
  );
}

function BrowsePage({ route, go, query, onAddToCart }) {
  const [kind, setKind] = usePBrowse(route.kind || 'job');
  const [filters, setFilters] = usePBrowse(EMPTY_FILTERS);
  const meta = window.KIND_META[kind];
  const all = window[meta.source] || [];
  const items = applyBrowseFilters(all, query, filters);
  return (
    <div style={{ maxWidth: 1240, margin: '0 auto', padding: '28px 28px 0' }}>
      <div className="browse-grid" style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 30, alignItems: 'flex-start' }}>
        <FilterRail kind={kind} setKind={setKind} filters={filters} setFilters={setFilters} onClear={() => setFilters(EMPTY_FILTERS)} />
        <div style={{ minWidth: 0 }}>
          <MiniPromo />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22, gap: 12, flexWrap: 'wrap' }}>
            <h1 style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 30, letterSpacing: '-0.025em' }}>{meta.label} <span style={{ fontSize: 16, color: 'var(--ink-3)', fontWeight: 500 }}>- {items.length} {meta.plural}</span></h1>
            {kind === 'job' && <Button kind="accent" size="lg" icon="send" onClick={() => go({ name: 'browse', kind })} style={{ fontWeight: 700, letterSpacing: '0.04em' }}>BID YOUR JOB</Button>}
          </div>
          {items.length === 0
            ? <div className="chamfer" style={{ background: 'var(--surface)', border: '1px solid var(--line)' }}><Empty icon="search" title="No matches" sub="Try a different search or clear filters." /></div>
            : <div className="results-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 22, alignItems: 'stretch' }}>
                {items.map((it, k) => <ListingCard key={it.id} item={it} featured={k === 0} onOpen={() => go({ name: meta.route, id: it.id, kind: it.kind })} onAdd={onAddToCart} />)}
              </div>}
          <div style={{ padding: '52px 0 8px' }}><SubBanner go={go} /></div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { BrowsePage, FilterGroup, FilterRail, MiniPromo, applyBrowseFilters, itemMatchesCategory });
