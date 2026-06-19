// client_pages_home.jsx — public landing page
const { useState: usePHome, useEffect: useEffHome, useRef: useRefHome } = React;

/* ---------- Hero carousel ---------- */
function Hero({ go }) {
  const slides = window.HERO_SLIDES;
  const [i, setI] = usePHome(0);
  useEffHome(() => {
    const t = setInterval(() => setI(p => (p + 1) % slides.length), 6000);
    return () => clearInterval(t);
  }, []);
  const s = slides[i];
  return (
    <div style={{ position: 'relative', background: 'var(--ff-blue)', overflow: 'hidden', minHeight: 420 }}>
      {/* faceted background */}
      <svg width="100%" height="100%" viewBox="0 0 1440 420" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0 }} aria-hidden="true">
        <path d="M0 0 L640 0 L420 420 L0 420 Z" fill="#0530E0" />
        <path d="M300 0 L560 0 L360 420 L120 420 Z" fill="rgba(255,255,255,0.04)" />
        <path d="M760 0 L1440 0 L1440 420 L560 420 Z" fill="#012ED1" />
        <path d="M820 0 L1080 0 L900 240 L760 120 Z" fill="rgba(255,255,255,0.05)" />
      </svg>
      {/* right image */}
      <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '46%', clipPath: 'polygon(22% 0, 100% 0, 100% 100%, 0 100%)' }} className="desktop-only">
        <Thumb icon={s.tag === 'NEW VENDORS' ? 'tools' : s.tag === 'MEMBER PERK' ? 'wallet' : 'grid'} tone="navy" h={420} image={s.image} alt={s.title} loading="eager" style={{ height: '100%' }} />
      </div>
      {/* content */}
      <div style={{ position: 'relative', maxWidth: 1240, margin: '0 auto', padding: '64px 28px', display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: 420 }} className="hero-content-pad">
        <div key={i} className="anim-page" style={{ maxWidth: 620 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22 }}>
            <span className="chamfer-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, height: 30, padding: '0 13px', background: 'rgba(255,255,255,0.14)', color: '#fff', fontSize: 12.5, fontWeight: 700, letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--ff-lime)' }} />{s.tag}
            </span>
            <span style={{ color: 'var(--ff-lime)', fontWeight: 700, fontSize: 14, letterSpacing: '0.02em' }}>{s.off}</span>
          </div>
          <h1 style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(40px, 6vw, 68px)', letterSpacing: '-0.035em', color: '#fff', lineHeight: 0.98 }}>{s.title}</h1>
          <p style={{ margin: '18px 0 0', fontSize: 'clamp(18px, 2vw, 22px)', fontWeight: 600, color: 'rgba(255,255,255,0.92)' }}>{s.sub}</p>
          <div style={{ marginTop: 30 }}>
            <Button kind="lime" size="lg" iconRight="chevR" onClick={() => go({ name: 'browse', kind: 'job' })} style={{ fontWeight: 700, letterSpacing: '0.04em', height: 52, fontSize: 15 }}>{s.cta.toUpperCase()}</Button>
          </div>
          <div style={{ display: 'flex', gap: 9, marginTop: 34 }}>
            {slides.map((_, k) => <button key={k} onClick={() => setI(k)} aria-label={`Slide ${k + 1}`} style={{ width: k === i ? 26 : 11, height: 11, borderRadius: 6, border: 'none', background: k === i ? '#fff' : 'rgba(255,255,255,0.4)', transition: 'all .25s', padding: 0 }} />)}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Count-up number ---------- */
function CountUp({ value, decimals = 0, suffix = '', duration = 1300 }) {
  const [n, setN] = usePHome(0);
  useEffHome(() => {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setN(value); return; }
    let raf; const t0 = performance.now();
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(value * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  const txt = decimals ? n.toFixed(decimals) : Math.round(n).toLocaleString('en-US');
  return <span className="mono-fig">{txt}{suffix}</span>;
}

/* ---------- Marketing stats band ---------- */
function StatsBand() {
  return (
    <section style={{ background: 'var(--ff-navy)', padding: '34px 0' }}>
      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 28px' }}>
        <div style={{ textAlign: 'center', fontSize: 11.5, fontWeight: 700, letterSpacing: '0.14em', color: 'rgba(255,255,255,0.45)', marginBottom: 22 }}>EXPLORE THE KINGDOM'S MAKER NETWORK</div>
        <div className="stats-band-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0 }}>
          {window.MARKET_STATS.map((s, i) => (
            <div key={s.id} style={{ padding: '6px 28px', borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.12)' : 'none', textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(30px, 3.6vw, 42px)', letterSpacing: '-0.03em', color: 'var(--ff-lime)', lineHeight: 1.05 }}>
                <CountUp value={s.value} decimals={s.decimals || 0} suffix={s.suffix || ''} />
              </div>
              <div style={{ marginTop: 6, fontSize: 12.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Section chips ---------- */
function SectionChips({ options, value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 9, flexWrap: 'wrap' }}>
      {options.map(o => {
        const on = value === o;
        return (
          <button key={o} onClick={() => onChange(o)} className="chamfer-sm" style={{
            height: 34, padding: '0 15px', fontSize: 12.5, fontWeight: 700, letterSpacing: '0.03em', textTransform: 'uppercase', whiteSpace: 'nowrap',
            border: '1px solid ' + (on ? 'var(--ff-lime)' : 'var(--line-strong)'),
            background: on ? 'var(--ff-lime)' : 'var(--surface)', color: on ? 'var(--ff-navy)' : 'var(--ink-3)', transition: 'all .15s',
          }}>{o}</button>
        );
      })}
    </div>
  );
}

/* ---------- Explore section ---------- */
function ExploreSection({ title, chips, items, go, dark }) {
  const [chip, setChip] = usePHome(chips[0]);
  return (
    <section style={{ background: dark ? 'var(--ff-fog)' : 'var(--surface)', padding: '52px 0' }}>
      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 28px' }}>
        <div className="explore-section-head" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 26, letterSpacing: '-0.025em', whiteSpace: 'nowrap' }}>{title}</h2>
          <button onClick={() => go({ name: 'browse', kind: items[0].kind })} style={{ border: 'none', background: 'transparent', display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 13, fontWeight: 700, letterSpacing: '0.04em', color: 'var(--ff-blue)', textDecoration: 'underline', textUnderlineOffset: 3, flexShrink: 0 }}>SEE ALL <Icon name="chevR" size={15} stroke={2.4} /></button>
        </div>
        <div style={{ marginBottom: 22 }}><SectionChips options={chips} value={chip} onChange={setChip} /></div>
        <div className="home-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 20, alignItems: 'stretch' }}>
          {items.map((it, k) => <ListingCard key={it.id} item={it} featured={k === 0} onOpen={() => go({ name: it.kind === 'job' ? 'job' : 'detail', id: it.id, kind: it.kind })} />)}
        </div>
      </div>
    </section>
  );
}

function HomePage({ go }) {
  return (
    <div>
      <Hero go={go} />
      <StatsBand />
      <ExploreSection title="Explore Jobs" chips={window.JOB_CHIPS} items={window.JOBS.slice(0, 4)} go={go} />
      <ExploreSection title="Explore Spaces" chips={window.SPACE_CHIPS} items={window.SPACES.slice(0, 4)} go={go} dark />
      <section id="sub" style={{ padding: '20px 0 64px', background: 'var(--surface)' }}><SubBanner go={go} /></section>
    </div>
  );
}

Object.assign(window, { HomePage, Hero, SectionChips, ExploreSection, StatsBand, CountUp });
