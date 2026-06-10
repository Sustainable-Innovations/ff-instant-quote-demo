// client_pages_browse.jsx — filtering / results page
const { useState: usePBrowse } = React;

/* ---------- Collapsible filter group ---------- */
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

/* ---------- Radio / check rows ---------- */
function RadioRow({ label, checked, onClick }) {
  return (
    <button onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 10, border: 'none', background: 'transparent', padding: '2px 0', fontSize: 14, color: 'var(--ink-2)', fontWeight: 500, textAlign: 'left' }}>
      <span style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid ' + (checked ? 'var(--ff-blue)' : 'var(--line-strong)'), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {checked && <span style={{ width: 9, height: 9, borderRadius: '50%', background: 'var(--ff-blue)' }} />}
      </span>
      {label}
    </button>
  );
}
function CheckRow({ label, checked, onClick }) {
  return (
    <button onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 10, border: 'none', background: 'transparent', padding: '2px 0', fontSize: 14, color: 'var(--ink-2)', fontWeight: 500, textAlign: 'left' }}>
      <span className="chamfer-sm" style={{ width: 18, height: 18, border: '2px solid ' + (checked ? 'var(--ff-blue)' : 'var(--line-strong)'), background: checked ? 'var(--ff-blue)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {checked && <Icon name="check" size={12} stroke={3} style={{ color: '#fff' }} />}
      </span>
      {label}
    </button>
  );
}

/* ---------- Category tree node ---------- */
function TreeNode({ node }) {
  const [open, setOpen] = usePBrowse(!!node.open);
  return (
    <div>
      <button onClick={() => setOpen(o => !o)} style={{ display: 'flex', alignItems: 'center', gap: 8, border: 'none', background: 'transparent', padding: '3px 0', fontSize: 14, fontWeight: 600, color: 'var(--ink)', textAlign: 'left' }}>
        <span style={{ width: 14, color: 'var(--ff-blue)', fontWeight: 700, fontSize: 16, lineHeight: 1 }}>{open ? '–' : '+'}</span>
        {node.label}
      </button>
      {open && <div style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingLeft: 22, marginTop: 4 }}>
        {node.kids.map(k => <button key={k} style={{ display: 'flex', alignItems: 'center', gap: 6, border: 'none', background: 'transparent', padding: '1px 0', fontSize: 13.5, color: 'var(--ink-2)', fontWeight: 500, textAlign: 'left' }}><span style={{ color: 'var(--ink-3)', fontWeight: 700 }}>+</span>{k}</button>)}
      </div>}
    </div>
  );
}

/* ---------- Filter sidebar ---------- */
function FilterRail({ kind, setKind, onClear }) {
  const [loc, setLoc] = usePBrowse([]);
  const [rating, setRating] = usePBrowse('4.5 & up');
  const [deals, setDeals] = usePBrowse([]);
  const toggle = (arr, set, v) => set(arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v]);
  return (
    <aside className="browse-side chamfer" style={{ width: 260, flexShrink: 0, background: 'var(--surface)', border: '1px solid var(--line)', alignSelf: 'flex-start', position: 'sticky', top: 88 }}>
      <div style={{ padding: '4px 20px 20px' }}>
        <FilterGroup label="Sort by">
          {['Recommended', 'Top rated', 'Price: low to high', 'Newest'].map((s, k) => <RadioRow key={s} label={s} checked={k === 0} onClick={() => {}} />)}
        </FilterGroup>
        <FilterGroup label="Category" open>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 6 }}>
            <RadioRow label="Jobs" checked={kind === 'job'} onClick={() => setKind('job')} />
            <RadioRow label="Spaces" checked={kind === 'space'} onClick={() => setKind('space')} />
          </div>
          <div style={{ height: 1, background: 'var(--line)', margin: '4px 0 8px' }} />
          {window.FILTER_TREE.map(n => <TreeNode key={n.label} node={n} />)}
        </FilterGroup>
        <FilterGroup label="Location">
          {window.LOCATIONS.map(l => <CheckRow key={l} label={l} checked={loc.includes(l)} onClick={() => toggle(loc, setLoc, l)} />)}
        </FilterGroup>
        <FilterGroup label="Price">
          <div style={{ padding: '6px 2px 2px' }}>
            <input type="range" min="0" max="100" defaultValue="60" style={{ width: '100%' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: 'var(--ink-3)', marginTop: 8, fontWeight: 600 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}><Riyal size={11} />0</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}><Riyal size={11} />750+</span>
            </div>
          </div>
        </FilterGroup>
        <FilterGroup label="Rating">
          {window.RATING_OPTS.map(r => <RadioRow key={r} label={r} checked={rating === r} onClick={() => setRating(r)} />)}
        </FilterGroup>
        <FilterGroup label="Deals">
          {window.DEAL_OPTS.map(d => <CheckRow key={d} label={d} checked={deals.includes(d)} onClick={() => toggle(deals, setDeals, d)} />)}
        </FilterGroup>
        <div style={{ paddingTop: 18 }}>
          <button onClick={() => { setLoc([]); setRating('4.5 & up'); setDeals([]); onClear && onClear(); }} className="chamfer-sm focus-lime" style={{ width: '100%', height: 44, border: '1px solid var(--ff-blue)', background: 'var(--surface)', color: 'var(--ff-blue)', fontWeight: 700, fontSize: 13.5, letterSpacing: '0.06em' }}>CLEAR ALL</button>
        </div>
      </div>
    </aside>
  );
}

/* ---------- Mini promo strip ---------- */
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

function BrowsePage({ route, go, query }) {
  const [kind, setKind] = usePBrowse(route.kind || 'job');
  const all = kind === 'job' ? window.JOBS : window.SPACES;
  const q = (query || '').trim().toLowerCase();
  const items = q ? all.filter(i => (i.title + i.vendor + i.tags.join(' ')).toLowerCase().includes(q)) : all;
  return (
    <div style={{ maxWidth: 1240, margin: '0 auto', padding: '28px 28px 0' }}>
      <div className="browse-grid" style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 30, alignItems: 'flex-start' }}>
        <FilterRail kind={kind} setKind={setKind} />
        <div style={{ minWidth: 0 }}>
          <MiniPromo />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
            <h1 style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 30, letterSpacing: '-0.025em' }}>Results <span style={{ fontSize: 16, color: 'var(--ink-3)', fontWeight: 500 }}>· {items.length} {kind === 'job' ? 'jobs' : 'spaces'}</span></h1>
            <Button kind="accent" size="lg" icon="send" onClick={() => go({ name: 'browse', kind })} style={{ fontWeight: 700, letterSpacing: '0.04em' }}>BID YOUR JOB</Button>
          </div>
          {items.length === 0
            ? <div className="chamfer" style={{ background: 'var(--surface)', border: '1px solid var(--line)' }}><Empty icon="search" title="No matches" sub="Try a different search or clear filters." /></div>
            : <div className="results-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 22, alignItems: 'stretch' }}>
                {items.map((it, k) => <ListingCard key={it.id} item={it} featured={k === 0} onOpen={() => go({ name: it.kind === 'job' ? 'job' : 'detail', id: it.id, kind: it.kind })} />)}
              </div>}
          <div style={{ padding: '52px 0 8px' }}><SubBanner go={go} /></div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { BrowsePage, FilterGroup, FilterRail, MiniPromo });
