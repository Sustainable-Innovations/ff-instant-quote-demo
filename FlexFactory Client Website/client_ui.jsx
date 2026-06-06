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
function Stars({ value = 5, reviews, size = 13, gap = 6 }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap }}>
      <span style={{ fontSize: size + 0.5, fontWeight: 700, color: 'var(--ink)', fontVariantNumeric: 'tabular-nums' }}>{value.toFixed(1)}</span>
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
function Thumb({ icon = 'box', label, tone = 'blue', h = 200, image, alt = '', dark, style, children }) {
  const palettes = {
    blue: ['#0C3997', '#0135F4'], navy: ['#070F41', '#152255'], slate: ['#2A3050', '#3A4170'],
    teal: ['#0E5C6B', '#127E92'], green: ['#0E5E3C', '#13794E'],
  };
  const [a, b] = palettes[tone] || palettes.blue;
  return (
    <div style={{ position: 'relative', height: h, background: `linear-gradient(135deg, ${a}, ${b})`, overflow: 'hidden', ...style }}>
      <svg width="100%" height="100%" viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0, opacity: 0.5 }} aria-hidden="true">
        <path d="M0 200 L120 90 L240 200 Z" fill="rgba(255,255,255,0.05)" />
        <path d="M180 240 L320 70 L460 240 Z" fill="rgba(255,255,255,0.05)" />
        <path d="M300 0 L400 0 L400 110 Z" fill="rgba(1,53,244,0.25)" />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={icon} size={Math.min(54, h * 0.3)} stroke={1.4} style={{ color: 'rgba(255,255,255,0.62)' }} />
      </div>
      {image && <img src={image} alt={alt} loading="lazy" onError={e => { e.currentTarget.style.display = 'none'; }} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}
      {label && <span className="chamfer-sm" style={{ position: 'absolute', bottom: 10, left: 10, height: 22, padding: '0 9px', display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(7,15,65,0.55)', backdropFilter: 'blur(4px)', color: 'rgba(255,255,255,0.9)', fontSize: 11, fontWeight: 600 }}><Icon name="image" size={12} />{label}</span>}
      {children}
    </div>
  );
}

/* ---------------- Public header ---------------- */
const NAV_LINKS = [{ id: 'jobs', label: 'Jobs' }, { id: 'spaces', label: 'Spaces' }, { id: 'subscription', label: 'Subscription' }];
function PublicHeader({ route, go, authed, onSignIn, onMenu, query, setQuery }) {
  return (
    <header style={{ height: 72, background: 'var(--surface)', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 22, padding: '0 28px', flexShrink: 0, position: 'sticky', top: 0, zIndex: 50 }}>
      <button onClick={() => go({ name: 'home' })} style={{ border: 'none', background: 'transparent', padding: 0, display: 'flex', alignItems: 'center' }}><Wordmark /></button>
      <nav className="desktop-only" style={{ display: 'flex', gap: 30, marginLeft: 14 }}>
        {NAV_LINKS.map(l => (
          <button key={l.id}
            onClick={() => l.id === 'subscription' ? go({ name: 'home', anchor: 'sub' }) : go({ name: 'browse', kind: l.id === 'jobs' ? 'job' : 'space' })}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--ff-blue)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--ink)'}
            style={{ border: 'none', background: 'transparent', fontSize: 15, fontWeight: 600, color: 'var(--ink)', padding: '4px 0', transition: 'color .15s', cursor: 'pointer' }}>{l.label}</button>
        ))}
      </nav>
      <div className="desktop-only" style={{ flex: 1, display: 'flex', maxWidth: 640, margin: '0 auto' }}>
        <div className="chamfer-sm" style={{ display: 'flex', alignItems: 'center', gap: 10, height: 44, padding: '0 16px', background: 'var(--surface)', border: '1px solid var(--line-strong)', width: '100%' }}>
          <Icon name="search" size={18} style={{ color: 'var(--ink-3)' }} />
          <input value={query || ''} onChange={e => setQuery && setQuery(e.target.value)} placeholder="Search jobs, spaces, vendors…"
            onKeyDown={e => { if (e.key === 'Enter') go({ name: 'browse', kind: 'job' }); }}
            style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 14.5, width: '100%', color: 'var(--ink)' }} />
        </div>
      </div>
      <button className="mobile-only" onClick={onMenu} style={{ border: 'none', background: 'transparent', display: 'none', padding: 4, color: 'var(--ink)', marginLeft: 'auto' }}><Icon name="menu" size={24} /></button>
      <button className="desktop-only focus-lime" title="Language" style={{ width: 40, height: 40, border: 'none', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ff-blue)' }}><Icon name="external" size={20} stroke={2} /></button>
      {authed
        ? <button className="desktop-only" onClick={() => go({ name: 'account' })} style={{ border: 'none', background: 'transparent', padding: 0, display: 'flex' }}><Avatar name={window.CLIENT.fullName} size={38} /></button>
        : <Button kind="lime" size="md" className="desktop-only" onClick={onSignIn} style={{ fontWeight: 700, letterSpacing: '0.03em' }}>SIGN IN</Button>}
    </header>
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
    <footer style={{ background: '#05060F', color: '#fff', padding: '52px 28px 30px' }}>
      <div style={{ maxWidth: 1240, margin: '0 auto', display: 'flex', justifyContent: 'space-between', gap: 40, flexWrap: 'wrap' }}>
        <div style={{ maxWidth: 320 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <FFMarkLime size={30} />
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: '#fff' }}>Flex<span style={{ color: 'var(--ff-lime)' }}>Factory</span></span>
          </div>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.92)' }}>The on-demand shop floor for KSA.</div>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>248 machines, 126 spaces, one subscription.</div>
        </div>
        <div style={{ display: 'flex', gap: 64, flexWrap: 'wrap' }}>
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
      <div className="chamfer" style={{ position: 'relative', background: 'linear-gradient(120deg, #070F41 0%, #0C1A5C 60%, #0C3997 100%)', padding: '46px 56px', overflow: 'hidden', '--chamfer': '22px' }}>
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 40, background: 'var(--ff-lime)', clipPath: 'polygon(0 0, 100% 0, 0 100%)' }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 30, flexWrap: 'wrap' }}>
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
const TONE_FOR = { 'PCB Fab': 'green', '3D Printing': 'blue', 'CNC': 'slate', 'Laser': 'teal', 'Molding': 'navy' };
function ListingCard({ item, featured, onOpen }) {
  const [hover, setHover] = usePCU(false);
  const isSpace = item.kind === 'space';
  const cta = isSpace ? 'BOOK NOW' : 'GET QUOTE';
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
      <Stars value={item.rating} reviews={item.reviews} />
    </div>
  );

  // FEATURED: dark navy card
  if (featured) {
    return (
      <article onClick={onOpen} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
        className="chamfer" style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', background: 'var(--ff-blue-deep)', cursor: 'pointer', boxShadow: hover ? 'var(--shadow-lg)' : 'var(--shadow-sm)', transition: 'box-shadow .18s', overflow: 'hidden' }}>
        <div style={{ position: 'relative' }}>
          <Thumb icon={item.icon} tone={tone} h={230} image={item.image} alt={item.title} label={!item.image ? (isSpace ? 'Space photo' : 'Product photo') : null} />
          <CornerBadge label={item.badge ? item.badge.l : 'FEATURED'} tone={item.badge ? item.badge.t : 'lime'} corner="tl" />
          {item.off > 0 && <CornerBadge label={`${item.off}% OFF`} tone="red" corner="tr" />}
        </div>
        <div style={{ padding: '20px 22px 22px', display: 'flex', flexDirection: 'column', gap: 14, flex: 1 }}>
          {tagsRow(true)}
          {meta(true)}
          <div style={{ flex: 1 }} />
          {isSpace && <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, color: '#fff' }}><span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', color: 'rgba(255,255,255,0.6)' }}>FROM</span><Price value={item.from} unit="/hour" size={24} color="var(--ff-lime)" decimals /></div>}
          <button onClick={e => { e.stopPropagation(); onOpen(); }} className="chamfer-sm focus-lime" style={{ height: 48, border: 'none', background: '#fff', color: 'var(--ff-navy)', fontWeight: 700, fontSize: 14, letterSpacing: '0.04em', transition: 'background .15s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--ff-lime)'} onMouseLeave={e => e.currentTarget.style.background = '#fff'}>{cta}</button>
        </div>
      </article>
    );
  }

  // REGULAR: white card
  return (
    <article onClick={onOpen} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      className="chamfer" style={{ display: 'flex', flexDirection: 'column', background: 'var(--surface)', border: '1px solid var(--line)', cursor: 'pointer', boxShadow: hover ? 'var(--shadow-md)' : 'var(--shadow-sm)', transform: hover ? 'translateY(-2px)' : 'none', transition: 'box-shadow .18s, transform .18s', overflow: 'hidden' }}>
      <div style={{ position: 'relative' }}>
        <Thumb icon={item.icon} tone={tone} h={172} image={item.image} alt={item.title} />
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
      </div>
      <div style={{ padding: '0 16px 16px' }}>
        <button onClick={e => { e.stopPropagation(); onOpen(); }} className="chamfer-sm focus-lime" style={{ width: '100%', height: 44, border: 'none', background: 'var(--ff-blue)', color: '#fff', fontWeight: 700, fontSize: 13.5, letterSpacing: '0.04em', transition: 'background .15s' }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--ff-blue-deep)'} onMouseLeave={e => e.currentTarget.style.background = 'var(--ff-blue)'}>{cta}</button>
      </div>
    </article>
  );
}

Object.assign(window, { Riyal, SAR, SAR2, Price, Stars, CornerBadge, Thumb, PublicHeader, PublicFooter, FFMarkLime, SubBanner, NAV_LINKS, CardTag, ListingCard });
