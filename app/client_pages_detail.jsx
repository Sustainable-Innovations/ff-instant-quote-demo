// client_pages_detail.jsx — space detail + multi-step booking
const { useState: usePDet, useRef: useRefDet, useEffect: useEffDet } = React;

/* ---------- numbered step with vertical rail ---------- */
function Step({ n, title, pill, pillTone, last, children }) {
  return (
    <section style={{ position: 'relative', paddingLeft: 50, paddingBottom: last ? 0 : 48 }}>
      {!last && <span style={{ position: 'absolute', left: 14, top: 36, bottom: 0, width: 0, borderLeft: '2px dotted var(--line-strong)' }} />}
      <div style={{ position: 'absolute', left: 0, top: 0, width: 30, height: 30, borderRadius: '50%', background: 'var(--ff-navy)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, zIndex: 2 }}>{n}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minHeight: 30, marginBottom: 4 }}>
        <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 21, letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>{title}</h2>
        {pill && <span className="chamfer-sm" style={{ height: 22, padding: '0 9px', display: 'inline-flex', alignItems: 'center', background: pillTone === 'pos' ? 'var(--pos-bg)' : 'var(--ff-fog)', color: pillTone === 'pos' ? 'var(--pos)' : 'var(--ink-3)', fontSize: 11, fontWeight: 700, letterSpacing: '0.04em' }}>{pill}</span>}
      </div>
      <div style={{ paddingTop: 8 }}>{children}</div>
    </section>
  );
}

/* ---------- gallery ---------- */
function Gallery({ d }) {
  const [i, setI] = usePDet(0);
  const images = d.galleryImages || [];
  return (
    <div className="chamfer" style={{ overflow: 'hidden', border: '1px solid var(--line)' }}>
      <div style={{ position: 'relative' }}>
        <Thumb icon="grid" tone="navy" h={368} image={images[i]} alt={d.gallery[i] || d.title} loading="eager" />
        <span className="chamfer-sm" style={{ position: 'absolute', top: 14, left: 14, height: 26, padding: '0 11px', display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(7,15,65,0.6)', color: '#fff', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' }}><span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--ff-lime)' }} />Space · Electronics</span>
        <span className="chamfer-sm" style={{ position: 'absolute', bottom: 14, right: 14, height: 24, padding: '0 10px', display: 'inline-flex', alignItems: 'center', background: 'rgba(7,15,65,0.6)', color: '#fff', fontSize: 12, fontWeight: 700 }}>{i + 1} / {d.gallery.length}</span>
      </div>
      <div style={{ display: 'flex', gap: 8, padding: 10, background: 'var(--surface)' }}>
        {d.gallery.map((g, k) => (
          <button key={g} onClick={() => setI(k)} className="chamfer-sm" style={{ width: 56, height: 40, flexShrink: 0, border: '2px solid ' + (k === i ? 'var(--ff-blue)' : 'transparent'), padding: 0, overflow: 'hidden' }}>
            <Thumb icon="grid" tone={k % 2 ? 'slate' : 'navy'} h={36} image={images[k]} alt={g} style={{ height: 36 }} />
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------- general info card ---------- */
function InfoCard({ d }) {
  return (
    <div className="chamfer" style={{ background: 'var(--surface)', border: '1px solid var(--line)', padding: 24, display: 'flex', flexDirection: 'column' }}>
      <h3 style={{ margin: '0 0 18px', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 17 }}>General info</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px 20px', flex: 1 }}>
        {d.info.map(([k, v]) => (
          <div key={k}>
            <div style={{ fontSize: 12, color: 'var(--ink-3)', fontWeight: 600, marginBottom: 4 }}>{k}</div>
            <div style={{ fontSize: 13.5, color: 'var(--ink)', fontWeight: 600 }}>{v}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 20, paddingTop: 18, borderTop: '1px solid var(--line)' }}>
        {d.badges.map(b => {
          const tones = { blue: ['rgba(1,53,244,0.08)', 'var(--ff-blue)'], pos: ['var(--pos-bg)', 'var(--pos)'], warn: ['var(--warn-bg)', 'var(--warn)'] }[b.t];
          return <span key={b.l} className="chamfer-sm" style={{ height: 26, padding: '0 11px', display: 'inline-flex', alignItems: 'center', gap: 6, background: tones[0], color: tones[1], fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap' }}><Icon name="check" size={13} stroke={3} />{b.l}</span>;
        })}
      </div>
    </div>
  );
}

/* ---------- pricing card (right rail) ---------- */
function PriceCard({ d, onBook }) {
  const p = d.pricing;
  return (
    <div className="chamfer" style={{ background: 'var(--surface)', border: '1px solid var(--line)', padding: 24, position: 'sticky', top: 88 }}>
      <div style={{ fontSize: 12.5, color: 'var(--ink-3)', fontWeight: 600 }}>Starting from</div>
      <div style={{ marginTop: 6 }}><Price value={p.hour} size={38} /></div>
      <div style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 6, fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 3 }}>per hour · or <Riyal size={11} color="var(--ink-3)" style={{ margin: '0 1px' }} />{p.day}/day · <Riyal size={11} color="var(--ink-3)" style={{ margin: '0 1px' }} />{p.week}/wk</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, margin: '20px 0', paddingTop: 18, borderTop: '1px solid var(--line)' }}>
        {[['Avg. occupancy', p.occupancy + '%'], ['Repeat bookers', p.repeat + '%'], ['Subscriber discount', '−' + p.discount + '%', 'pos']].map(([k, v, t]) => (
          <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5 }}>
            <span style={{ color: 'var(--ink-3)', fontWeight: 500, whiteSpace: 'nowrap' }}>{k}</span>
            <span style={{ fontWeight: 700, color: t === 'pos' ? 'var(--pos)' : 'var(--ink)' }}>{v}</span>
          </div>
        ))}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5 }}>
          <span style={{ color: 'var(--ink-3)', fontWeight: 500, whiteSpace: 'nowrap' }}>Next available</span>
          <span style={{ fontWeight: 700, color: 'var(--ff-blue)' }}>{p.next}</span>
        </div>
      </div>
      <Button kind="accent" size="lg" full iconRight="chevR" onClick={onBook} style={{ fontWeight: 700 }}>Book this Desk</Button>
    </div>
  );
}

/* ---------- included items ---------- */
function IncludedGrid({ d }) {
  return (
    <div className="incl-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
      {d.included.map(it => (
        <div key={it.name} className="chamfer-sm" style={{ background: 'var(--surface)', border: '1px solid var(--line)', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="chamfer-sm" style={{ width: 46, height: 46, background: it.tone, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ff-navy)' }}><Icon name={it.icon} size={22} /></div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14.5, color: 'var(--ink)' }}>{it.name}</div>
            <div style={{ fontSize: 12.5, color: 'var(--ink-3)', marginTop: 3 }}>{it.spec}</div>
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: 'var(--pos)', fontWeight: 600, marginTop: 'auto' }}><Icon name="check" size={13} stroke={3} />{it.note}</div>
        </div>
      ))}
    </div>
  );
}

/* ---------- tier picker ---------- */
function TierCards({ d, tier, setTier }) {
  return (
    <div className="tier-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
      {d.tiers.map(t => {
        const on = tier === t.id;
        return (
          <button key={t.id} onClick={() => setTier(t.id)} className="chamfer" style={{ position: 'relative', textAlign: 'left', padding: 22, background: on ? 'rgba(1,53,244,0.04)' : 'var(--surface)', border: '2px solid ' + (on ? 'var(--ff-blue)' : 'var(--line)'), display: 'flex', flexDirection: 'column', gap: 14, transition: 'all .15s' }}>
            {t.popular && <span className="chamfer-sm" style={{ position: 'absolute', top: -11, right: 18, height: 22, padding: '0 11px', background: 'var(--ff-navy)', color: '#fff', fontSize: 10.5, fontWeight: 700, letterSpacing: '0.05em', display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap' }}>MOST POPULAR</span>}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                <span className="chamfer-sm" style={{ width: 40, height: 40, background: on ? 'var(--ff-blue)' : 'var(--ff-fog)', color: on ? '#fff' : 'var(--ink-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name={t.icon} size={20} /></span>
                <div>
                  <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.05em', color: 'var(--ink-3)' }}>{t.kicker}</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 19 }}>{t.name}</div>
                </div>
              </div>
              <span style={{ width: 24, height: 24, borderRadius: '50%', background: on ? 'var(--ff-navy)' : 'transparent', border: '2px solid ' + (on ? 'var(--ff-navy)' : 'var(--line-strong)'), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{on && <Icon name="check" size={13} stroke={3} style={{ color: '#fff' }} />}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 9, flexWrap: 'wrap' }}>
              <Price value={t.price} unit={t.unit} size={30} />
              {t.save && <span className="chamfer-sm" style={{ height: 22, padding: '0 9px', display: 'inline-flex', alignItems: 'center', background: t.saveTone === 'purple' ? 'rgba(108,70,200,0.12)' : 'var(--pos-bg)', color: t.saveTone === 'purple' ? '#6C46C8' : 'var(--pos)', fontSize: 11.5, fontWeight: 700 }}>{t.save}</span>}
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--ink-3)', lineHeight: 1.5 }}>{t.note}</div>
          </button>
        );
      })}
    </div>
  );
}

/* ---------- calendar + time slots ---------- */
const SLOTS = ['8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM'];
const SLOT_DISABLED = ['5:00 PM', '6:00 PM'];
function DateTime({ date, setDate, slot, setSlot, duration, setDuration }) {
  const first = new Date(2026, 3, 1).getDay(); // April 2026
  const days = new Date(2026, 4, 0).getDate();
  const unavailable = [22, 23, 24];
  const cells = [];
  for (let i = 0; i < first; i++) cells.push({ pad: true, n: 31 - first + i + 1 });
  for (let n = 1; n <= days; n++) cells.push({ n });
  return (
    <div className="pick-grid" style={{ display: 'grid', gridTemplateColumns: '1.15fr 1fr', gap: 20 }}>
      {/* calendar */}
      <div className="chamfer" style={{ background: 'var(--surface)', border: '1px solid var(--line)', padding: 22 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 17 }}>April 2026</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {['l', 'r'].map(dir => <button key={dir} className="chamfer-sm" style={{ width: 34, height: 34, border: '1px solid var(--line-strong)', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-2)' }}><Icon name="chevR" size={16} style={{ transform: dir === 'l' ? 'rotate(180deg)' : 'none' }} /></button>)}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 8 }}>
          {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(d => <div key={d} style={{ textAlign: 'center', fontSize: 10.5, fontWeight: 700, color: 'var(--ink-3)', letterSpacing: '0.04em' }}>{d}</div>)}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
          {cells.map((c, k) => {
            const on = !c.pad && c.n === date;
            const today = !c.pad && c.n === 25;
            const off = c.pad || unavailable.includes(c.n);
            return (
              <button key={k} disabled={off} onClick={() => !off && setDate(c.n)} style={{
                height: 40, border: 'none', background: on ? 'var(--ff-navy)' : 'transparent', color: c.pad ? 'var(--line-strong)' : off ? 'var(--ink-3)' : on ? '#fff' : 'var(--ink)',
                borderRadius: '50%', fontSize: 13.5, fontWeight: on ? 700 : 500, cursor: off ? 'default' : 'pointer', position: 'relative',
                textDecoration: (!c.pad && off) ? 'line-through' : 'none', outline: today ? '1.5px solid var(--ff-blue)' : 'none', outlineOffset: -2,
                fontVariantNumeric: 'tabular-nums',
              }}>{c.n}</button>
            );
          })}
        </div>
        <div style={{ display: 'flex', gap: 18, marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--line)', fontSize: 11.5, color: 'var(--ink-3)', fontWeight: 600 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><span style={{ width: 9, height: 9, borderRadius: '50%', background: 'var(--ff-navy)' }} />Selected</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><span style={{ width: 9, height: 9, borderRadius: '50%', border: '1.5px solid var(--ff-blue)' }} />Today</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><span style={{ textDecoration: 'line-through' }}>26</span>Unavailable</span>
        </div>
      </div>
      {/* time slots */}
      <div className="chamfer" style={{ background: 'var(--surface)', border: '1px solid var(--line)', padding: 22 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15 }}>Time Slots — Tue, Apr 28</div>
        <div style={{ fontSize: 12.5, color: 'var(--ink-3)', margin: '5px 0 16px' }}>Day pass: full access 8 AM – 10 PM. Slots below show what others have reserved.</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          {SLOTS.map(s => {
            const dis = SLOT_DISABLED.includes(s);
            const on = slot === s;
            return <button key={s} disabled={dis} onClick={() => setSlot(s)} className="chamfer-sm" style={{ height: 42, border: '1px solid ' + (on ? 'var(--ff-navy)' : 'var(--line-strong)'), background: on ? 'var(--ff-navy)' : 'var(--surface)', color: dis ? 'var(--ink-3)' : on ? '#fff' : 'var(--ink)', fontSize: 12.5, fontWeight: 600, textDecoration: dis ? 'line-through' : 'none', cursor: dis ? 'default' : 'pointer' }}>{s}</button>;
          })}
          <div style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11.5, color: 'var(--ink-3)', fontStyle: 'italic' }}>After-hours by request only</div>
        </div>
        <div style={{ marginTop: 18 }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.06em', color: 'var(--ink-3)', marginBottom: 8 }}>DURATION</div>
          <input type="range" min="1" max="10" value={duration} onChange={e => setDuration(+e.target.value)} style={{ width: '100%' }} />
        </div>
        <div className="chamfer-sm" style={{ marginTop: 14, padding: '11px 14px', background: 'var(--ff-fog)', fontSize: 12.5, color: 'var(--ink-2)' }}>Arrive at <strong>{slot}</strong> · stay <strong>{duration} hours</strong> (covered by day pass)</div>
      </div>
    </div>
  );
}

/* ---------- add-ons ---------- */
function AddonGrid({ d, picked, toggle }) {
  return (
    <div className="addon-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
      {d.addons.map(a => {
        const on = picked.has(a.id);
        return (
          <button key={a.id} onClick={() => toggle(a.id)} className="chamfer" style={{ position: 'relative', textAlign: 'left', padding: 18, background: on ? 'rgba(1,53,244,0.04)' : 'var(--surface)', border: '2px solid ' + (on ? 'var(--ff-blue)' : 'var(--line)'), display: 'flex', flexDirection: 'column', gap: 12, transition: 'all .15s' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <span className="chamfer-sm" style={{ width: 42, height: 42, background: 'var(--ff-fog)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ff-navy)' }}><Icon name={a.icon} size={20} /></span>
              <span style={{ width: 24, height: 24, borderRadius: '50%', background: on ? 'var(--ff-navy)' : 'transparent', border: '2px solid ' + (on ? 'var(--ff-navy)' : 'var(--line-strong)'), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{on && <Icon name="check" size={13} stroke={3} style={{ color: '#fff' }} />}</span>
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontWeight: 700, fontSize: 14.5 }}>{a.name}</span>
                {a.premium && <span className="chamfer-sm" style={{ height: 18, padding: '0 7px', display: 'inline-flex', alignItems: 'center', background: 'var(--warn-bg)', color: 'var(--warn)', fontSize: 9.5, fontWeight: 700, letterSpacing: '0.04em' }}>PREMIUM</span>}
              </div>
              <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 4, lineHeight: 1.5 }}>{a.desc}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 'auto', paddingTop: 6 }}>
              <span style={{ fontSize: 12.5, fontWeight: 600, color: on ? 'var(--ff-blue)' : 'var(--ink-3)' }}>{on ? 'Added' : 'Add'}</span>
              <Price value={a.price} unit={a.unit} size={18} gap={4} />
            </div>
          </button>
        );
      })}
    </div>
  );
}

/* ---------- location ---------- */
function LocationBlock({ d }) {
  const L = d.place;
  return (
    <div className="pick-grid" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 20 }}>
      <div className="chamfer" style={{ position: 'relative', border: '1px solid var(--line)', overflow: 'hidden', minHeight: 280, background: '#EAF1ED' }}>
        <svg width="100%" height="100%" viewBox="0 0 600 320" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0 }} aria-hidden="true">
          <rect width="600" height="320" fill="#EAF1ED" />
          {[60, 160, 260].map(y => <line key={'h' + y} x1="0" y1={y} x2="600" y2={y} stroke="#D3E2D8" strokeWidth="2" />)}
          {[120, 280, 440].map(x => <line key={'v' + x} x1={x} y1="0" x2={x} y2="320" stroke="#D3E2D8" strokeWidth="2" />)}
          {[[40, 80, 120, 50], [200, 200, 90, 60], [430, 60, 130, 70], [320, 230, 110, 50], [80, 240, 80, 40]].map((b, i) => <rect key={i} x={b[0]} y={b[1]} width={b[2]} height={b[3]} fill="#CBE6D4" rx="3" />)}
        </svg>
        <div style={{ position: 'absolute', left: '46%', top: '42%', transform: 'translate(-50%,-100%)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div className="chamfer-sm" style={{ background: 'var(--surface)', boxShadow: 'var(--shadow-md)', padding: '7px 12px', whiteSpace: 'nowrap' }}>
            <div style={{ fontSize: 12.5, fontWeight: 700 }}>{L.name}</div>
            <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>King Fahd District, Riyadh</div>
          </div>
          <Icon name="pin" size={28} fill style={{ color: 'var(--ff-blue)', marginTop: 2 }} />
        </div>
        <div style={{ position: 'absolute', top: 14, right: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {['plus', 'x'].map((ic, i) => <button key={i} className="chamfer-sm" style={{ width: 34, height: 34, border: '1px solid var(--line)', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-2)' }}><Icon name={i === 0 ? 'plus' : 'filter'} size={16} /></button>)}
        </div>
      </div>
      <div className="chamfer" style={{ background: 'var(--surface)', border: '1px solid var(--line)', padding: 24, display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', color: 'var(--ink-3)', marginBottom: 6 }}>ADDRESS</div>
          <div style={{ fontSize: 14.5, fontWeight: 700 }}>{L.name}</div>
          <div style={{ fontSize: 13, color: 'var(--ink-2)', marginTop: 2 }}>{L.address}</div>
        </div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', color: 'var(--ink-3)', marginBottom: 6 }}>HOURS</div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>{L.hours}</div>
          <div style={{ fontSize: 12.5, color: 'var(--pos)', fontWeight: 600, marginTop: 2 }}>{L.hoursNote}</div>
        </div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', color: 'var(--ink-3)', marginBottom: 8 }}>HOW TO GET IN</div>
          <ol style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {L.steps.map((s, i) => <li key={i} style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.5 }}>{s}</li>)}
          </ol>
        </div>
      </div>
    </div>
  );
}

/* ---------- review & confirm ---------- */
function ReviewBlock({ d, tier, date, slot, picked, onConfirm }) {
  const t = d.tiers.find(x => x.id === tier);
  const addonItems = d.addons.filter(a => picked.has(a.id));
  const base = t.price;
  const addonsTotal = addonItems.reduce((s, a) => s + a.price, 0);
  const discount = window.CLIENT.subscriber ? Math.round((base + addonsTotal) * d.pricing.discount) / 100 : 0;
  const total = base + addonsTotal - discount;
  return (
    <div className="chamfer" style={{ background: 'var(--surface)', border: '1px solid var(--line)', padding: 26, display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 30, alignItems: 'center' }} >
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', color: 'var(--ink-3)', marginBottom: 8 }}>YOUR BOOKING</div>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 19, letterSpacing: '-0.02em' }}>{t.name} Pass · Tue, April {date}, 2026 · arrive {slot}</div>
        <div style={{ fontSize: 13.5, color: 'var(--ink-3)', marginTop: 5 }}>{d.title} · {d.place.name}</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 16 }}>
          {addonItems.map(a => <span key={a.id} className="chamfer-sm" style={{ height: 26, padding: '0 11px', display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(1,53,244,0.08)', color: 'var(--ff-blue)', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' }}><Icon name="plus" size={12} stroke={2.6} />{a.name.replace(' Access', '').replace(' Assistance', '')}</span>)}
          {addonItems.length === 0 && <span style={{ fontSize: 13, color: 'var(--ink-3)' }}>No add-ons selected</span>}
        </div>
      </div>
      <div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          <PriceRow label={`${t.name} pass`} value={base} />
          {addonItems.map(a => <PriceRow key={a.id} label={a.name} value={a.price} />)}
          {discount > 0 && <PriceRow label={`Subscriber discount (${d.pricing.discount}%)`} value={-discount} pos />}
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--line)' }}>
          <span style={{ fontWeight: 700, fontSize: 15 }}>Total</span>
          <Price value={total} size={26} decimals />
        </div>
        <div style={{ marginTop: 18 }}>
          <button onClick={onConfirm} className="chamfer-sm focus-lime" style={{ width: '100%', minHeight: 64, border: 'none', background: 'var(--ff-navy)', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, transition: 'background .15s' }}
            onMouseEnter={e => e.currentTarget.style.background = '#0b133a'} onMouseLeave={e => e.currentTarget.style.background = 'var(--ff-navy)'}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 15, whiteSpace: 'nowrap' }}>Confirm Booking <Icon name="check" size={17} stroke={3} /></span>
            <span style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.6)' }}>Pay nothing now</span>
          </button>
        </div>
        <div style={{ fontSize: 11.5, color: 'var(--ink-3)', textAlign: 'center', marginTop: 8 }}>Charged on arrival · free cancel up to 4h before</div>
      </div>
    </div>
  );
}
function PriceRow({ label, value, pos }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', fontSize: 13.5 }}>
      <span style={{ color: 'var(--ink-2)', whiteSpace: 'nowrap' }}>{label}</span>
      <span style={{ fontWeight: 600, color: pos ? 'var(--pos)' : 'var(--ink)', fontVariantNumeric: 'tabular-nums', display: 'inline-flex', alignItems: 'center', gap: 4 }}>{value < 0 ? '−' : ''}<Riyal size={13} color={pos ? 'var(--pos)' : 'var(--ink)'} />{window.SAR2(Math.abs(value))}</span>
    </div>
  );
}

/* ---------- sign-in gate (auth happens before the booking steps) ---------- */
function BookingGate({ authed, onStart }) {
  const upcoming = [
    { ic: 'tag', label: 'Choose your pass', sub: 'Hourly, day or week' },
    { ic: 'calendar', label: 'Pick date & time', sub: 'Live availability' },
    { ic: 'plus', label: 'Optional add-ons', sub: 'Tools & extras' },
    { ic: 'check', label: 'Review & confirm', sub: 'Pay on arrival' },
  ];
  return (
    <section style={{ position: 'relative', paddingLeft: 50 }}>
      <div style={{ position: 'absolute', left: 0, top: 0, width: 30, height: 30, borderRadius: '50%', background: 'var(--ff-navy)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}><Icon name="users" size={15} /></div>
      <div className="chamfer" style={{ position: 'relative', overflow: 'hidden', background: 'var(--ff-blue-deep)', color: '#fff', padding: '32px 34px', '--chamfer': '20px' }}>
        <svg width="240" height="210" viewBox="0 0 240 210" style={{ position: 'absolute', right: -6, top: -16, opacity: 0.1 }} aria-hidden="true">
          <path d="M40 20 H120 V72 L92 98 H64 V200 H40 Z" fill="#070F41" />
          <path d="M150 20 H220 V72 L192 98 H160 V200 H150 V72 L160 62 H192 V36 H150 Z" fill="#070F41" />
        </svg>
        <div className="gate-grid" style={{ position: 'relative', display: 'grid', gridTemplateColumns: '1.05fr 1fr', gap: 30, alignItems: 'center' }}>
          <div>
            <div style={{ height: 4, width: 56, background: 'var(--ff-lime)', marginBottom: 16 }} />
            <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 26, letterSpacing: '-0.02em' }}>Sign in to start your booking</h2>
            <p style={{ margin: '12px 0 0', fontSize: 14.5, color: 'rgba(255,255,255,0.72)', lineHeight: 1.6, maxWidth: 400 }}>Create a free FlexFactory account or sign in to choose your pass, lock a time slot for Bay 04, and confirm — you only pay on arrival.</p>
            <div style={{ display: 'flex', gap: 14, marginTop: 24, flexWrap: 'wrap', alignItems: 'center' }}>
              <Button kind="lime" size="lg" iconRight="chevR" onClick={onStart} style={{ fontWeight: 700 }}>{authed ? 'START BOOKING' : 'SIGN IN TO BOOK'}</Button>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'rgba(255,255,255,0.6)' }}><Icon name="clock" size={15} /> Takes under a minute</div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {upcoming.map((u, i) => (
              <div key={u.label} className="chamfer-sm" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', padding: '14px 15px', display: 'flex', flexDirection: 'column', gap: 9 }}>
                <span className="chamfer-sm" style={{ width: 34, height: 34, background: 'rgba(225,255,5,0.15)', color: 'var(--ff-lime)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name={u.ic} size={17} stroke={2.4} /></span>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.06em' }}>STEP {i + 2}</div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, marginTop: 1 }}>{u.label}</div>
                  <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.55)', marginTop: 1 }}>{u.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- space detail page (booking flow) ---------- */
function SpaceDetailPage({ route, go, authed, requireAuth }) {
  const d = window.SPACE_DETAIL;
  const [tier, setTier] = usePDet('day');
  const [date, setDate] = usePDet(28);
  const [slot, setSlot] = usePDet('2:00 PM');
  const [duration, setDuration] = usePDet(8);
  const [picked, setPicked] = usePDet(new Set(['printer']));
  const [booking, setBooking] = usePDet(false);
  const toast = useToast();
  const bookingRef = useRefDet(null);

  const toggle = (id) => setPicked(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const scrollToBooking = () => bookingRef.current && window.scrollTo({ top: bookingRef.current.getBoundingClientRect().top + window.scrollY - 90, behavior: 'smooth' });
  const startBooking = () => requireAuth(() => { setBooking(true); setTimeout(scrollToBooking, 60); });
  const confirm = () => go({ name: 'account', sub: 'bookings', booking: window.MOCK_BOOKINGS[0] });

  return (
    <div style={{ maxWidth: 1240, margin: '0 auto', padding: '24px 28px 64px' }} className="anim-page">
      {/* breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--ink-3)', marginBottom: 16, flexWrap: 'wrap' }}>
        {d.crumb.map((c, i) => (
          <React.Fragment key={c}>
            {i > 0 && <span style={{ color: 'var(--line-strong)' }}>·</span>}
            <span onClick={() => i === 0 && go({ name: 'home' })} style={{ cursor: i === 0 ? 'pointer' : 'default', color: i === d.crumb.length - 1 ? 'var(--ink)' : 'var(--ink-3)', fontWeight: i === d.crumb.length - 1 ? 700 : 500 }}>{c}</span>
          </React.Fragment>
        ))}
      </div>
      {/* header */}
      <h1 style={{ margin: '0 0 10px', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(28px, 4vw, 40px)', letterSpacing: '-0.03em' }}>{d.title}</h1>
      <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap', marginBottom: 24, fontSize: 13.5 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, whiteSpace: 'nowrap' }}><Icon name="star" size={16} fill style={{ color: '#F5A623' }} /><strong>{d.rating}</strong> <span style={{ color: 'var(--ink-3)' }}>({d.bookings} bookings)</span></div>
        <span style={{ color: 'var(--line-strong)' }}>·</span>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--ink-2)' }}><Icon name="pin" size={15} style={{ color: 'var(--ink-3)' }} />{d.location}</div>
        <span style={{ color: 'var(--line-strong)' }}>·</span>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, color: 'var(--pos)', fontWeight: 600, whiteSpace: 'nowrap' }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--pos)' }} />{d.available}</div>
      </div>
      {/* top grid */}
      <div className="detail-grid" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1.15fr 0.95fr', gap: 20, marginBottom: 48, alignItems: 'start' }}>
        <Gallery d={d} />
        <InfoCard d={d} />
        <PriceCard d={d} onBook={startBooking} />
      </div>
      {/* steps */}
      <Step n={1} title="What's Included at the Desk" pill="FREE · 8 ITEMS" pillTone="pos"><IncludedGrid d={d} /></Step>
      <div ref={bookingRef}>
        {booking ? (
          <React.Fragment>
            <Step n={2} title="Choose Booking Type"><div style={{ marginBottom: 4 }}><p style={{ margin: '0 0 16px', fontSize: 13.5, color: 'var(--ink-3)' }}>Pay by the hour for quick sessions, or save with a day or week pass.</p><TierCards d={d} tier={tier} setTier={setTier} /></div></Step>
            <Step n={3} title="Pick Date & Time"><p style={{ margin: '0 0 16px', fontSize: 13.5, color: 'var(--ink-3)' }}>Day pass selected — pick the date you want. Bay 04 stays yours from 8:00 AM until close.</p><DateTime date={date} setDate={setDate} slot={slot} setSlot={setSlot} duration={duration} setDuration={setDuration} /></Step>
            <Step n={4} title="Optional Add-ons" pill="OPTIONAL"><p style={{ margin: '0 0 16px', fontSize: 13.5, color: 'var(--ink-3)' }}>Add anything you might need during your booking. You can also add these on arrival.</p><AddonGrid d={d} picked={picked} toggle={toggle} /></Step>
            <Step n={5} title="Location & Access"><p style={{ margin: '0 0 16px', fontSize: 13.5, color: 'var(--ink-3)' }}>{d.place.name} · Bay 04. Free parking on site.</p><LocationBlock d={d} /></Step>
            <Step n={6} title="Review & Confirm" last><ReviewBlock d={d} tier={tier} date={date} slot={slot} picked={picked} onConfirm={confirm} /></Step>
          </React.Fragment>
        ) : (
          <BookingGate authed={authed} onStart={startBooking} />
        )}
      </div>
      <RelatedRail title="Pairs well with equipment" items={(window.EQUIPMENT || []).slice(0, 4)} go={go} />
    </div>
  );
}

/* ---------- job spec tile ---------- */
function JobSpec({ icon, k, v }) {
  return (
    <div className="chamfer-sm" style={{ background: 'var(--surface)', border: '1px solid var(--line)', padding: '14px 16px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
      <span className="chamfer-sm" style={{ width: 38, height: 38, flexShrink: 0, background: 'var(--ff-fog)', color: 'var(--ff-navy)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name={icon} size={18} /></span>
      <div>
        <div style={{ fontSize: 11.5, color: 'var(--ink-3)', fontWeight: 600 }}>{k}</div>
        <div style={{ fontSize: 13.5, color: 'var(--ink)', fontWeight: 700, marginTop: 2 }}>{v}</div>
      </div>
    </div>
  );
}

/* ---------- job detail page (embeds the instant-quote engine) ---------- */
function JobDetailPage({ item, go, requireAuth }) {
  const toast = useToast();
  const quoteRef = useRefDet(null);
  const jd = (window.JOB_DETAILS || {})[item.id] || null;
  const hasQuote = !!(jd && jd.quote);
  const crumb = (jd && jd.crumb) || ['Home', 'Jobs', item.cat, item.title];
  const summary = (jd && jd.summary) || item.blurb;
  const ENGINE_URLS = { '3d': '../engines/quote-3d/index.html', 'pcb': '../engines/quote-pcb/index.html', 'laser': '../engines/quote-laser/index.html' };
  const engineKey = (jd && jd.quoteEngine) || '3d';
  const quoteUrl = ENGINE_URLS[engineKey] || ENGINE_URLS['3d'];
  const quoteVersion = 'am-machines-20260630';
  const embedUrl = quoteUrl + '?embed=1&v=' + quoteVersion + (jd && jd.quoteProcess ? '&process=' + jd.quoteProcess : '');
  // Engines report content height (ffQuoteHeight; ffPcbHeight alias) so the iframe never clips.
  const [engineH, setEngineH] = usePDet(engineKey === 'pcb' ? 1180 : 820);
  useEffDet(() => {
    const onMsg = (e) => {
      if (!e.data || !e.data.height) return;
      if (e.data.type === 'ffQuoteHeight' || e.data.type === 'ffPcbHeight') setEngineH(Math.max(560, Math.min(3000, e.data.height)));
    };
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, [engineKey]);
  const badgeTone = item.badge && ({ lime: ['var(--ff-lime)', 'var(--ff-navy)'], blue: ['rgba(1,53,244,0.10)', 'var(--ff-blue)'], red: ['var(--neg-bg)', 'var(--neg)'] }[item.badge.t] || ['var(--ff-fog)', 'var(--ink-2)']);
  const scrollToQuote = () => quoteRef.current && window.scrollTo({ top: quoteRef.current.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });

  return (
    <div style={{ maxWidth: 1240, margin: '0 auto', padding: '24px 28px 64px' }} className="anim-page">
      {/* breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--ink-3)', marginBottom: 16, flexWrap: 'wrap' }}>
        {crumb.map((c, i) => {
          const clickable = i === 0 || i === 1;
          return (
            <React.Fragment key={c}>
              {i > 0 && <span style={{ color: 'var(--line-strong)' }}>·</span>}
              <span onClick={() => i === 0 ? go({ name: 'home' }) : i === 1 ? go({ name: 'browse', kind: 'job' }) : null}
                style={{ cursor: clickable ? 'pointer' : 'default', color: i === crumb.length - 1 ? 'var(--ink)' : 'var(--ink-3)', fontWeight: i === crumb.length - 1 ? 700 : 500 }}>{c}</span>
            </React.Fragment>
          );
        })}
      </div>

      {/* badge + title */}
      {item.badge && (
        <span className="chamfer-sm" style={{ display: 'inline-flex', alignItems: 'center', height: 24, padding: '0 11px', background: badgeTone[0], color: badgeTone[1], fontSize: 11.5, fontWeight: 700, letterSpacing: '0.04em', marginBottom: 12 }}>{item.badge.l}</span>
      )}
      <h1 style={{ margin: '0 0 10px', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(28px, 4vw, 40px)', letterSpacing: '-0.03em' }}>{item.title}</h1>
      <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap', marginBottom: 18, fontSize: 13.5 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, whiteSpace: 'nowrap' }}><Icon name="star" size={16} fill style={{ color: '#F5A623' }} /><strong>{item.rating.toFixed(1)}</strong> <span style={{ color: 'var(--ink-3)' }}>({item.reviews} reviews)</span></div>
        <span style={{ color: 'var(--line-strong)' }}>·</span>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--ink-2)' }}><Icon name="building" size={15} style={{ color: 'var(--ink-3)' }} />{item.vendor}</div>
        <span style={{ color: 'var(--line-strong)' }}>·</span>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--ink-2)' }}><Icon name="pin" size={15} style={{ color: 'var(--ink-3)' }} />{item.city}</div>
        {jd && jd.available && (<><span style={{ color: 'var(--line-strong)' }}>·</span>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, color: 'var(--pos)', fontWeight: 600, whiteSpace: 'nowrap' }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--pos)' }} />{jd.available}</div></>)}
      </div>
      <p style={{ maxWidth: 760, fontSize: 15, lineHeight: 1.6, color: 'var(--ink-2)', margin: '0 0 22px' }}>{summary}</p>
      {hasQuote && <div style={{ marginBottom: 36 }}><Button kind="lime" size="lg" iconRight="arrowDn" onClick={scrollToQuote} style={{ fontWeight: 700, letterSpacing: '0.03em' }}>GET INSTANT QUOTE</Button></div>}

      {/* spec grid */}
      {jd && jd.specs && (
        <div className="incl-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 44 }}>
          {jd.specs.map(s => <JobSpec key={s.k} icon={s.icon} k={s.k} v={s.v} />)}
        </div>
      )}

      {/* instant-quote engine */}
      {hasQuote ? (
        <section ref={quoteRef}>
          <div style={{ height: 4, width: 56, background: 'var(--ff-lime)', marginBottom: 14 }} />
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
            <div>
              <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 24, letterSpacing: '-0.02em' }}>Instant quote</h2>
              <p style={{ margin: '5px 0 0', fontSize: 13.5, color: 'var(--ink-3)' }}>Upload your part — the price updates live as you change process, material and quantity. No account needed.</p>
            </div>
            <a href={quoteUrl} target="_blank" rel="noreferrer" className="focus-lime" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: 'var(--ff-blue)', textDecoration: 'none', whiteSpace: 'nowrap' }}>Open full screen <Icon name="external" size={15} stroke={2.2} /></a>
          </div>
          <div className="chamfer" style={{ border: '1px solid var(--line)', boxShadow: 'var(--shadow-md)', overflow: 'hidden', background: 'var(--surface)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '10px 16px', borderBottom: '1px solid var(--line)', background: 'var(--surface-2)' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--ff-lime)' }} />
              <span style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--ink-2)' }}>FF Instant-Quote Engine · Live</span>
            </div>
            <iframe src={embedUrl} title="FlexFactory Instant Quote" loading="lazy" style={{ width: '100%', height: engineH, border: 0, display: 'block' }} />
          </div>
          <p style={{ fontSize: 12.5, color: 'var(--ink-3)', marginTop: 12, lineHeight: 1.5 }}>Prices are indicative, generated in your browser from the uploaded geometry. {item.vendor} confirms a firm quote — covering manufacturability, finish and tolerances — before anything is charged.</p>
        </section>
      ) : (
        <section className="chamfer" style={{ background: 'var(--ff-blue-deep)', color: '#fff', padding: '32px 34px', position: 'relative', overflow: 'hidden', '--chamfer': '20px' }}>
          <div style={{ height: 4, width: 56, background: 'var(--ff-lime)', marginBottom: 16 }} />
          <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 24, letterSpacing: '-0.02em' }}>Request a quote</h2>
          <p style={{ margin: '10px 0 22px', fontSize: 14.5, color: 'rgba(255,255,255,0.72)', maxWidth: 460, lineHeight: 1.6 }}>Send {item.vendor} your specs and files — they'll reply with a firm quote and lead time.</p>
          <Button kind="lime" size="lg" iconRight="chevR" onClick={() => requireAuth(() => toast('Quote request sent to ' + item.vendor))} style={{ fontWeight: 700 }}>REQUEST QUOTE</Button>
        </section>
      )}

      {/* how it works + vendor */}
      <div className="detail-grid" style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 20, marginTop: 44, alignItems: 'start' }}>
        <div className="chamfer" style={{ background: 'var(--surface)', border: '1px solid var(--line)', padding: 24 }}>
          <h3 style={{ margin: '0 0 18px', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 17 }}>How it works</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {((jd && jd.steps) || []).map((s, i) => (
              <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <span className="chamfer-sm" style={{ width: 40, height: 40, flexShrink: 0, background: 'var(--ff-fog)', color: 'var(--ff-navy)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name={s.ic} size={19} /></span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14.5 }}>{s.t}</div>
                  <div style={{ fontSize: 12.5, color: 'var(--ink-3)', marginTop: 2 }}>{s.s}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="chamfer" style={{ background: 'var(--surface)', border: '1px solid var(--line)', padding: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', color: 'var(--ink-3)', marginBottom: 12 }}>VENDOR</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Avatar name={item.vendor} size={46} />
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{item.vendor}</div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: 'var(--ink-3)', marginTop: 2 }}><Icon name="star" size={13} fill style={{ color: '#F5A623' }} />{item.rating.toFixed(1)} · {item.city}</div>
            </div>
          </div>
          <div style={{ marginTop: 18 }}>
            <Button kind="secondary" full icon="mail" onClick={() => toast('Messaging is coming soon')}>Message vendor</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- detail dispatcher: jobs get the quote page, spaces get the booking flow ---------- */
function findListing(route) {
  const id = route && route.id;
  return (window.JOBS || []).find(j => j.id === id) || (window.SPACES || []).find(s => s.id === id) || null;
}
function DetailPage(props) {
  const item = findListing(props.route);
  if (item && item.kind === 'job') return <JobDetailPage item={item} go={props.go} requireAuth={props.requireAuth} />;
  return <SpaceDetailPage {...props} />;
}

Object.assign(window, { DetailPage, JobDetailPage, SpaceDetailPage });
