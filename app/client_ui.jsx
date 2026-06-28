// client_ui.jsx — shared marketplace UI: header, footer, listing cards, riyal symbol
const { useState: usePCU, useEffect: useEffPCU, useRef: useRefPCU } = React;

/* ---------------- Currency ---------------- */
// New Saudi Riyal symbol, drawn to match the reference comps.
function Riyal({ size = 14, color = 'currentColor', style }) {
  const w = Math.round(size * 0.895);
  return (
    <svg width={w} height={size} viewBox="0 0 1124.14 1256.39" style={{ display: 'inline-block', verticalAlign: '-0.12em', flexShrink: 0, ...style }} aria-hidden="true">
      <g fill={color}>
        <path d="M699.62,1113.02h0c-20.06,44.48-33.32,92.75-38.4,143.37l424.51-90.24c20.06-44.47,33.31-92.75,38.4-143.37l-424.51,90.24Z" />
        <path d="M1085.73,895.8c20.06-44.47,33.32-92.75,38.4-143.37l-330.68,70.33v-135.2l292.27-62.11c20.06-44.47,33.32-92.75,38.4-143.37l-330.68,70.27V66.13c-50.67,28.45-95.67,66.32-132.25,110.99v403.35l-132.25,28.11V0c-50.67,28.44-95.67,66.32-132.25,110.99v525.69l-295.91,62.88c-20.06,44.47-33.33,92.75-38.42,143.37l334.33-71.05v170.26l-358.3,76.14c-20.06,44.47-33.32,92.75-38.4,143.37l375.04-79.7c30.53-6.35,56.77-24.4,73.83-49.24l68.78-101.97v-.02c7.14-10.55,11.3-23.27,11.3-36.97v-149.98l132.25-28.11v270.4l424.53-90.28Z" />
      </g>
    </svg>
  );
}
const SAR = (n) => Number(n).toLocaleString('en-US', { maximumFractionDigits: 0 });
const SAR2 = (n) => Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
// price with riyal glyph: <Price value={150} unit="/ day" />
function Price({ value, unit, size = 30, color = 'var(--ink)', decimals = false, gap = 8 }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'baseline', gap, color }}>
      <Riyal size={size * 0.62} color={color} style={{ alignSelf: 'center' }} />
      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: size, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>{decimals ? SAR2(value) : SAR(value)}</span>
      {unit && <span style={{ fontSize: size * 0.4, color: 'var(--ink-3)', fontWeight: 500 }}>{unit}</span>}
    </span>
  );
}

/* ---------------- Star rating ---------------- */
function Stars({ value = 5, reviews, size = 13, gap = 6, light = false }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap }}>
      <span style={{ fontSize: size + 0.5, fontWeight: 700, color: light ? '#fff' : 'var(--ink)', fontVariantNumeric: 'tabular-nums' }}>{value.toFixed(1)}</span>
      <span style={{ display: 'inline-flex', gap: 1, color: '#F5A623' }}>
        {[0, 1, 2, 3, 4].map(i => <Icon key={i} name="star" size={size} fill={i < Math.round(value)} stroke={1.6} style={{ color: i < Math.round(value) ? '#F5A623' : 'var(--line-strong)' }} />)}
      </span>
      {reviews != null && <span style={{ fontSize: size - 0.5, color: 'var(--ink-3)', fontWeight: 500 }}>({reviews})</span>}
    </div>
  );
}

/* ---------------- Badge (corner tag on cards) ---------------- */
function CornerBadge({ label, tone = 'lime', corner = 'tr' }) {
  const tones = {
    lime: { bg: 'var(--ff-lime)', fg: 'var(--ff-navy)' },
    blue: { bg: 'var(--ff-blue)', fg: '#fff' },
    red: { bg: 'var(--neg)', fg: '#fff' },
    gray: { bg: 'var(--ink-3)', fg: '#fff' },
  }[tone];
  const pos = corner === 'tl' ? { left: 12 } : { right: 12 };
  return (
    <span className="chamfer-sm" style={{
      position: 'absolute', top: 12, ...pos, height: 24, padding: '0 10px', display: 'inline-flex', alignItems: 'center',
      background: tones.bg, color: tones.fg, fontSize: 11.5, fontWeight: 700, letterSpacing: '0.03em', zIndex: 2,
    }}>{label}</span>
  );
}

/* ---------------- Placeholder photo tile ---------------- */
// Branded placeholder standing in for a real product/space photo.
function Thumb({ icon = 'box', label, tone = 'blue', h = 200, image, alt = '', loading = 'lazy', imageFit = 'cover', dark, style, children }) {
  const [failed, setFailed] = usePCU(false);
  useEffPCU(() => setFailed(false), [image]);
  const palettes = {
    blue: ['#0C3997', '#0135F4'], navy: ['#070F41', '#152255'], slate: ['#2A3050', '#3A4170'],
    teal: ['#0E5C6B', '#127E92'], green: ['#0E5E3C', '#13794E'],
  };
  const [a, b] = palettes[tone] || palettes.blue;
  const hasImage = image && !failed;
  const cleanContain = hasImage && imageFit === 'contain';
  return (
    <div style={{ position: 'relative', height: h, background: cleanContain ? '#fff' : `linear-gradient(135deg, ${a}, ${b})`, overflow: 'hidden', ...style }}>
      {!cleanContain && (
        <React.Fragment>
          <svg width="100%" height="100%" viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0, opacity: 0.5, zIndex: 0 }} aria-hidden="true">
            <path d="M0 200 L120 90 L240 200 Z" fill="rgba(255,255,255,0.05)" />
            <path d="M180 240 L320 70 L460 240 Z" fill="rgba(255,255,255,0.05)" />
            <path d="M300 0 L400 0 L400 110 Z" fill="rgba(1,53,244,0.25)" />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 0 }}>
            <Icon name={icon} size={Math.min(54, h * 0.3)} stroke={1.4} style={{ color: 'rgba(255,255,255,0.62)' }} />
          </div>
        </React.Fragment>
      )}
      {hasImage && <img src={image} alt={alt} loading={loading} decoding="async" onError={() => setFailed(true)} style={{ position: 'absolute', inset: 0, zIndex: 1, width: '100%', height: '100%', objectFit: imageFit, display: 'block' }} />}
      {label && <span className="chamfer-sm" style={{ position: 'absolute', bottom: 10, left: 10, zIndex: 2, height: 22, padding: '0 9px', display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(7,15,65,0.55)', backdropFilter: 'blur(4px)', color: 'rgba(255,255,255,0.9)', fontSize: 11, fontWeight: 600 }}><Icon name="image" size={12} />{label}</span>}
      {children}
    </div>
  );
}

/* ---------------- Public header ---------------- */
const NAV_LINKS = [
  { id: 'job', kind: 'job', label: 'Services' },
  { id: 'space', kind: 'space', label: 'Spaces' },
  { id: 'equipment', kind: 'equipment', label: 'Equipment' },
  { id: 'material', kind: 'material', label: 'Materials' },
];
function PublicHeader({ route, go, authed, onSignIn, onMenu, query, setQuery, cartCount = 0, onCart }) {
  const [menuOpen, setMenuOpen] = usePCU(false);
  useEffPCU(() => { setMenuOpen(false); }, [route]);
  const close = () => setMenuOpen(false);
  return (
    <React.Fragment>
      <header className="header-pad" style={{ height: 72, background: 'var(--surface)', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 22, padding: '0 28px', flexShrink: 0, position: 'sticky', top: 0, zIndex: 50 }}>
        <button onClick={() => { go({ name: 'home' }); close(); }} style={{ border: 'none', background: 'transparent', padding: 0, display: 'flex', alignItems: 'center' }}><Wordmark /></button>
        <nav className="desktop-only" style={{ display: 'flex', gap: 26, marginLeft: 14 }}>
          {NAV_LINKS.map(l => {
            const active = route && route.name === 'browse' && l.kind && route.kind === l.kind;
            return (
              <button key={l.id}
                onClick={() => l.id === 'subscription' ? go({ name: 'home', anchor: 'sub' }) : go({ name: 'browse', kind: l.kind })}
                onMouseEnter={e => { if (!active) e.currentTarget.style.color = 'var(--ff-blue)'; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.color = 'var(--ink)'; }}
                className="focus-lime"
                style={{ border: 'none', background: 'transparent', fontSize: 15, fontWeight: active ? 700 : 600, color: active ? 'var(--ff-blue)' : 'var(--ink)', padding: '4px 0', borderBottom: active ? '2px solid var(--ff-blue)' : '2px solid transparent', transition: 'color .15s', cursor: 'pointer', whiteSpace: 'nowrap' }}>{l.label}</button>
            );
          })}
        </nav>
        <div className="desktop-only" style={{ flex: 1, display: 'flex', maxWidth: 640, margin: '0 auto' }}>
          <div className="chamfer-sm" style={{ display: 'flex', alignItems: 'center', gap: 10, height: 44, padding: '0 16px', background: 'var(--surface)', border: '1px solid var(--line-strong)', width: '100%' }}>
            <Icon name="search" size={18} style={{ color: 'var(--ink-3)' }} />
            <input value={query || ''} onChange={e => setQuery && setQuery(e.target.value)} placeholder="Search services, spaces, equipment, materials…"
              onKeyDown={e => { if (e.key === 'Enter') go({ name: 'browse', kind: 'job' }); }}
              style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 14.5, width: '100%', color: 'var(--ink)' }} />
          </div>
        </div>
        <button className="mobile-only" onClick={() => setMenuOpen(o => !o)} style={{ border: 'none', background: 'transparent', display: 'none', padding: 4, color: 'var(--ink)', marginLeft: 'auto', zIndex: 51 }}>
          <Icon name={menuOpen ? 'x' : 'menu'} size={26} />
        </button>
        <button onClick={() => onCart && onCart()} className="focus-lime" title="Cart" aria-label={`Cart, ${cartCount} item${cartCount === 1 ? '' : 's'}`} style={{ position: 'relative', width: 42, height: 42, border: 'none', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink)', cursor: 'pointer', flexShrink: 0 }}>
          <Icon name="cart" size={22} stroke={1.9} />
          {cartCount > 0 && <span className="mono-fig" style={{ position: 'absolute', top: 2, right: 0, minWidth: 18, height: 18, padding: '0 4px', borderRadius: 9, background: 'var(--ff-blue)', color: '#fff', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>{cartCount}</span>}
        </button>
        <button className="desktop-only focus-lime" title="Language" style={{ width: 40, height: 40, border: 'none', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ff-blue)' }}><Icon name="external" size={20} stroke={2} /></button>
        {authed
          ? <button className="desktop-only" onClick={() => go({ name: 'account' })} style={{ border: 'none', background: 'transparent', padding: 0, display: 'flex' }}><Avatar name={window.CLIENT.fullName} size={38} /></button>
          : <Button kind="lime" size="md" className="desktop-only" onClick={onSignIn} style={{ fontWeight: 700, letterSpacing: '0.03em' }}>SIGN IN</Button>}
      </header>
      {menuOpen && (
        <div style={{ position: 'fixed', top: 72, left: 0, right: 0, bottom: 0, background: 'var(--surface)', zIndex: 49, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--line)' }}>
            <div className="chamfer-sm" style={{ display: 'flex', alignItems: 'center', gap: 10, height: 48, padding: '0 16px', border: '1px solid var(--line-strong)', background: 'var(--bg)' }}>
              <Icon name="search" size={18} style={{ color: 'var(--ink-3)' }} />
              <input defaultValue={query || ''}
                onChange={e => setQuery && setQuery(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { go({ name: 'browse', kind: 'job' }); close(); } }}
                placeholder="Search services, spaces, equipment, materials…"
                style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 15, width: '100%', color: 'var(--ink)' }} autoFocus />
            </div>
          </div>
          <nav style={{ flex: 1 }}>
            {NAV_LINKS.map(l => (
              <button key={l.id} onClick={() => { l.id === 'subscription' ? go({ name: 'home', anchor: 'sub' }) : go({ name: 'browse', kind: l.kind }); close(); }}
                style={{ width: '100%', border: 'none', borderBottom: '1px solid var(--line)', background: 'transparent', display: 'flex', alignItems: 'center', gap: 14, padding: '18px 20px', fontSize: 16, fontWeight: 600, color: 'var(--ink)', textAlign: 'left', cursor: 'pointer' }}>
                {l.label}
                <Icon name="chevR" size={16} style={{ marginLeft: 'auto', color: 'var(--ink-3)' }} />
              </button>
            ))}
          </nav>
          <div style={{ padding: '20px 16px', borderTop: '1px solid var(--line)' }}>
            {authed
              ? <Button kind="primary" full icon="users" onClick={() => { go({ name: 'account' }); close(); }}>My Account</Button>
              : <Button kind="lime" full onClick={() => { onSignIn(); close(); }} style={{ fontWeight: 700 }}>SIGN IN</Button>}
          </div>
        </div>
      )}
    </React.Fragment>
  );
}

/* ---------------- Footer ---------------- */
function PublicFooter({ go }) {
  const cols = [
    { h: 'Company', items: ['About', 'Contact'] },
    { h: 'For makers', items: ['Subscription', 'Privacy Policy', 'Terms & Conditions'] },
    { h: 'For vendors', items: ['How it Works', 'Join as Provider'] },
  ];
  return (
    <footer className="footer-pad" style={{ background: '#05060F', color: '#fff', padding: '52px 28px 30px' }}>
      <div className="footer-inner" style={{ maxWidth: 1240, margin: '0 auto', display: 'flex', justifyContent: 'space-between', gap: 40, flexWrap: 'wrap' }}>
        <div style={{ maxWidth: 320 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <FFMarkLime size={30} />
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: '#fff' }}>Flex<span style={{ color: 'var(--ff-lime)' }}>Factory</span></span>
          </div>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.92)' }}>The on-demand shop floor for KSA.</div>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>248 machines, 126 spaces, one subscription.</div>
        </div>
        <div className="footer-cols" style={{ display: 'flex', gap: 64, flexWrap: 'wrap' }}>
          {cols.map(c => (
            <div key={c.h}>
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ff-lime)', marginBottom: 16 }}>{c.h}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
                {c.items.map(i => <a key={i} href="#" onClick={e => e.preventDefault()} style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', textDecoration: 'none', fontWeight: 500 }}>{i}</a>)}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ maxWidth: 1240, margin: '36px auto 0', borderTop: '1px solid rgba(255,255,255,0.12)', paddingTop: 22, textAlign: 'center', fontSize: 12.5, color: 'rgba(255,255,255,0.4)' }}>© 2026 FLEX FACTORY. All Copy rights reserved.</div>
    </footer>
  );
}
function FFMarkLime({ size = 30 }) {
  const w = Math.round(size * 49 / 40);
  return (
    <svg width={w} height={size} viewBox="0 0 49 40" aria-hidden="true" style={{ display: 'block' }}>
      <path d="M48.1774 0L42.6845 4.305L42.6439 4.32328L35.2543 39.9999H14.4441L9.68626 32.1535V32.1453H28.5349L30.2102 24.1385H4.84312L9.68626 32.1453H9.67814L9.68626 32.1535L8.08406 39.9999H0L7.4708 4.42481H26.425L24.7456 12.1941H7.38552L12.3809 20.1746H31.0387L35.3518 0H48.1774Z" fill="var(--ff-lime)" />
    </svg>
  );
}

/* ---------------- Subscription banner ---------------- */
function SubBanner({ go }) {
  return (
    <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 28px' }}>
      <div className="chamfer sub-banner-pad" style={{ position: 'relative', background: 'linear-gradient(120deg, #070F41 0%, #0C1A5C 60%, #0C3997 100%)', padding: '46px 56px', overflow: 'hidden', '--chamfer': '22px' }}>
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 40, background: 'var(--ff-lime)', clipPath: 'polygon(0 0, 100% 0, 0 100%)' }} />
        <div className="sub-banner-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 30, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--ff-lime)', marginBottom: 14 }}>Subscription required for quotes &amp; bookings</div>
            <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(34px, 4.4vw, 52px)', letterSpacing: '-0.03em', color: '#fff', lineHeight: 1 }}>One pass, every shop.</h2>
            <p style={{ margin: '14px 0 0', fontSize: 16, color: 'rgba(255,255,255,0.7)', fontWeight: 500, maxWidth: 560 }}>Unlock subscriber-only pricing across every vendor on the platform. Cancel anytime.</p>
          </div>
          <Button kind="lime" size="lg" iconRight="chevR" onClick={() => go && go({ name: 'home', anchor: 'sub' })} style={{ fontWeight: 700, minWidth: 130, flexShrink: 0 }}>VIEW PLANS</Button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Outlined tag (on cards) ---------------- */
function CardTag({ children, light }) {
  return (
    <span className="chamfer-sm" style={{
      display: 'inline-flex', alignItems: 'center', height: 24, padding: '0 10px', fontSize: 11.5, fontWeight: 600, whiteSpace: 'nowrap',
      border: '1px solid ' + (light ? 'rgba(255,255,255,0.35)' : 'var(--line-strong)'),
      color: light ? 'rgba(255,255,255,0.92)' : 'var(--ink-2)', letterSpacing: '0.02em',
    }}>{children}</span>
  );
}

/* ---------------- Listing card (jobs + spaces, regular + featured) ---------------- */
const TONE_FOR = {
  'PCB Fab': 'green', '3D Printing': 'blue', 'CNC': 'slate', 'Laser': 'teal', 'Molding': 'navy',
  Electronics: 'green', Metalwork: 'slate', Filament: 'blue', Resin: 'teal', 'Sheet Stock': 'navy', Metal: 'slate',
  Lifting: 'slate', Earthmoving: 'blue', Trucks: 'navy', Concrete: 'teal', Access: 'green', Compaction: 'slate',
  Metals: 'slate', Wood: 'green', Plastics: 'blue', Rubber: 'navy', Glass: 'teal', Structural: 'slate', Fasteners: 'blue',
};
function ListingCard({ item, featured, onOpen, onAdd }) {
  const [hover, setHover] = usePCU(false);
  const isSpace = item.kind === 'space';
  const isEquipment = item.kind === 'equipment';
  const isMaterial = item.kind === 'material';
  const isFixed = item.fixed;
  const isInstant = item.instant;
  // CTA: jobs have sub-variants; everything else reads from KIND_META.
  const km = (window.KIND_META && window.KIND_META[item.kind]) || {};
  const cta = item.kind === 'job'
    ? (isFixed ? 'ORDER NOW' : isInstant ? 'GET INSTANT QUOTE' : 'GET QUOTE')
    : (km.cta || 'VIEW');
  const lowStock = isMaterial && item.stock != null && item.stock <= 80;
  const toast = useToast();
  const handlePrimary = (e) => { e.stopPropagation(); if (isMaterial && onAdd) { onAdd(item); toast('Added to cart · ' + item.title); } else onOpen(); };
  const tone = TONE_FOR[item.cat] || 'blue';

  const tagsRow = (light) => (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {item.tags.map(t => <CardTag key={t} light={light}>{t}</CardTag>)}
    </div>
  );
  const meta = (light) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: featured ? 21 : 16.5, letterSpacing: '-0.02em', color: light ? 'var(--ff-lime)' : 'var(--ink)' }}>{item.title}</h3>
      <div style={{ fontSize: 13, color: light ? 'rgba(255,255,255,0.7)' : 'var(--ink-3)', fontWeight: 500 }}>{item.vendor}, {item.city}</div>
      <Stars value={item.rating} reviews={item.reviews} light={light} />
    </div>
  );

  // FEATURED: dark navy card
  if (featured) {
    return (
      <article onClick={onOpen} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
        className="chamfer" style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', background: 'var(--ff-blue-deep)', cursor: 'pointer', boxShadow: hover ? 'var(--shadow-lg)' : 'var(--shadow-sm)', transition: 'box-shadow .18s', overflow: 'hidden' }}>
        <div style={{ position: 'relative' }}>
          <Thumb icon={item.icon} tone={tone} h={230} image={item.image} alt={item.title} imageFit={isMaterial || isEquipment ? 'contain' : 'cover'} label={!item.image ? (isSpace ? 'Space photo' : 'Product photo') : null} />
          <CornerBadge label={item.badge ? item.badge.l : 'FEATURED'} tone={item.badge ? item.badge.t : 'lime'} corner="tl" />
          {item.off > 0 && <CornerBadge label={`${item.off}% OFF`} tone="red" corner="tr" />}
        </div>
        <div style={{ padding: '20px 22px 22px', display: 'flex', flexDirection: 'column', gap: 14, flex: 1 }}>
          {tagsRow(true)}
          {meta(true)}
          <div style={{ flex: 1 }} />
          {isSpace && <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, color: '#fff' }}><span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', color: 'rgba(255,255,255,0.6)' }}>FROM</span><Price value={item.from} unit="/hour" size={24} color="var(--ff-lime)" decimals /></div>}
          {isFixed && <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, color: '#fff' }}><span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', color: 'rgba(255,255,255,0.6)' }}>FROM</span><Price value={item.from} unit="/part" size={24} color="var(--ff-lime)" decimals={false} /></div>}
          {isEquipment && <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, color: '#fff' }}><span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', color: 'rgba(255,255,255,0.6)' }}>FROM</span><Price value={item.from} unit="/day" size={24} color="var(--ff-lime)" decimals={false} /></div>}
          {isMaterial && <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, color: '#fff' }}><Price value={item.price} unit={'/ ' + item.unit} size={24} color="var(--ff-lime)" decimals={false} /></div>}
          <button onClick={handlePrimary} className="chamfer-sm focus-lime" style={{ height: 48, border: 'none', background: '#fff', color: 'var(--ff-navy)', fontWeight: 700, fontSize: 14, letterSpacing: '0.04em', transition: 'background .15s', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--ff-lime)'} onMouseLeave={e => e.currentTarget.style.background = '#fff'}>{isMaterial && <Icon name="cart" size={16} />}{cta}</button>
        </div>
      </article>
    );
  }

  // REGULAR: white card
  return (
    <article onClick={onOpen} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      className="chamfer" style={{ display: 'flex', flexDirection: 'column', background: 'var(--surface)', border: '1px solid var(--line)', cursor: 'pointer', boxShadow: hover ? 'var(--shadow-md)' : 'var(--shadow-sm)', transform: hover ? 'translateY(-2px)' : 'none', transition: 'box-shadow .18s, transform .18s', overflow: 'hidden' }}>
      <div style={{ position: 'relative' }}>
        <Thumb icon={item.icon} tone={tone} h={172} image={item.image} alt={item.title} imageFit={isMaterial || isEquipment ? 'contain' : 'cover'} />
        {item.badge && <CornerBadge label={item.badge.l} tone={item.badge.t} corner="tl" />}
        {item.off > 0 && <CornerBadge label={`${item.off}% OFF`} tone="red" corner="tr" />}
        {item.sub && <CornerBadge label="SUBSCRIBER ONLY" tone="gray" corner="tr" />}
      </div>
      <div style={{ padding: '16px 16px 14px', display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
        {tagsRow(false)}
        {meta(false)}
        <div style={{ flex: 1 }} />
        {isSpace && <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 4 }}>
          <span style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '0.06em', color: 'var(--ink-3)' }}>FROM</span>
          <Price value={item.from} unit="/hour" size={19} color="var(--ff-blue)" decimals gap={5} />
        </div>}
        {isFixed && <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 4 }}>
          <span style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '0.06em', color: 'var(--ink-3)' }}>FROM</span>
          <Price value={item.from} unit="/part" size={19} color="var(--ff-blue)" decimals={false} gap={5} />
        </div>}
        {isEquipment && <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 4 }}>
          <span style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '0.06em', color: 'var(--ink-3)' }}>FROM</span>
          <Price value={item.from} unit="/day" size={19} color="var(--ff-blue)" decimals={false} gap={5} />
        </div>}
        {isMaterial && <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 4 }}>
          {lowStock ? <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.04em', color: 'var(--warn)' }}>LOW STOCK</span> : <span style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '0.06em', color: 'var(--ink-3)' }}>IN STOCK</span>}
          <Price value={item.price} unit={'/ ' + item.unit} size={19} color="var(--ff-blue)" decimals={false} gap={5} />
        </div>}
      </div>
      <div style={{ padding: '0 16px 16px' }}>
        <button onClick={handlePrimary} className="chamfer-sm focus-lime" style={{ width: '100%', height: 44, border: 'none', background: 'var(--ff-blue)', color: '#fff', fontWeight: 700, fontSize: 13.5, letterSpacing: '0.04em', transition: 'background .15s', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--ff-blue-deep)'} onMouseLeave={e => e.currentTarget.style.background = 'var(--ff-blue)'}>{isMaterial && <Icon name="cart" size={15} />}{cta}</button>
      </div>
    </article>
  );
}

/* ---------------- Category tiles (marketplace home) ---------------- */
function CategoryTiles({ go }) {
  const meta = window.KIND_META, order = window.KIND_ORDER || ['job', 'space', 'equipment', 'material'];
  return (
    <section style={{ background: 'var(--surface)', padding: '40px 0 8px' }}>
      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 28px' }}>
        <div className="cat-tiles-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {order.map(k => {
            const m = meta[k];
            return (
              <button key={k} onClick={() => go({ name: 'browse', kind: k })}
                className="chamfer focus-lime"
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--ff-blue)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--line)'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
                style={{ background: 'var(--surface)', border: '1px solid var(--line)', padding: '20px 20px', display: 'flex', alignItems: 'center', gap: 14, textAlign: 'left', cursor: 'pointer', transition: 'border-color .15s, box-shadow .18s, transform .18s' }}>
                <span className="chamfer-sm" style={{ width: 46, height: 46, flexShrink: 0, background: 'var(--ff-fog)', color: 'var(--ff-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name={m.icon} size={24} />
                </span>
                <span style={{ minWidth: 0 }}>
                  <span style={{ display: 'block', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, letterSpacing: '-0.01em' }}>{m.label}</span>
                  <span style={{ display: 'block', fontSize: 12.5, color: 'var(--ink-3)', marginTop: 2 }}>{m.blurb}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Trust & safety band ---------------- */
function TrustBand() {
  const items = [
    { icon: 'check', title: 'Verified vendors', sub: 'Every shop ID-checked & rated' },
    { icon: 'wallet', title: 'Secure checkout', sub: 'Protected payments, escrow on quotes' },
    { icon: 'star', title: 'Certified quality', sub: 'ESD, ISO & material certs on file' },
    { icon: 'phone', title: 'Local support', sub: 'KSA-based team, 7 days a week' },
  ];
  return (
    <section style={{ background: 'var(--surface)', padding: '20px 0 48px' }}>
      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 28px' }}>
        <div className="chamfer trust-band-grid" style={{ background: 'var(--ff-fog)', border: '1px solid var(--line)', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0 }}>
          {items.map((it, i) => (
            <div key={it.title} style={{ display: 'flex', alignItems: 'flex-start', gap: 13, padding: '22px 24px', borderLeft: i > 0 ? '1px solid var(--line)' : 'none' }}>
              <span className="chamfer-sm" style={{ width: 38, height: 38, flexShrink: 0, background: 'var(--ff-blue)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={it.icon} size={19} stroke={2.4} />
              </span>
              <span>
                <span style={{ display: 'block', fontWeight: 700, fontSize: 14 }}>{it.title}</span>
                <span style={{ display: 'block', fontSize: 12.5, color: 'var(--ink-3)', marginTop: 2, lineHeight: 1.4 }}>{it.sub}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Cross-sell rail (related listings on detail pages) ---------------- */
function RelatedRail({ title, items, go, onAdd }) {
  if (!items || !items.length) return null;
  const add = onAdd || ((m) => window.__ffAddToCart && window.__ffAddToCart(m));
  const routeFor = (it) => (window.KIND_META[it.kind] && window.KIND_META[it.kind].route) || 'detail';
  return (
    <section style={{ marginTop: 44 }}>
      <h2 style={{ margin: '0 0 16px', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, letterSpacing: '-0.02em' }}>{title}</h2>
      <div className="results-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, alignItems: 'stretch' }}>
        {items.map(it => <ListingCard key={it.id} item={it} onOpen={() => go({ name: routeFor(it), id: it.id, kind: it.kind })} onAdd={add} />)}
      </div>
    </section>
  );
}

Object.assign(window, { Riyal, SAR, SAR2, Price, Stars, CornerBadge, Thumb, PublicHeader, PublicFooter, FFMarkLime, SubBanner, NAV_LINKS, CardTag, ListingCard, CategoryTiles, TrustBand, RelatedRail });
