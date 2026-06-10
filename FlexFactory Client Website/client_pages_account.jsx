// client_pages_account.jsx — account shell: sidebar, bookings list, booking detail + access pass
const { useState: useAcct } = React;

/* ---------- mock bookings ---------- */
const MOCK_BOOKINGS = [
  { id: 'BK-43876', space: 'Bay 3', type: 'Hourly · 2 hrs',
    dateLabel: 'Wednesday – 04/06/2026', timeRange: '2:00 PM – 4:00 PM', duration: '2 hours',
    location: 'MODON, Sustainable Innovations, Ground Floor, Room 201',
    address: '7XJ8+V98, Dammam 2nd Industrial City (MODON), Dammam 34324',
    total: 140.50, status: 'confirmed',
    addons: ['Reflow oven (T962A)', 'Hot-air rework station', 'Hand tools & consumables', 'Stereo microscope', 'ESD-safe bench + mat', 'On-site supervisor'],
    host: 'Sustainable Innovations', hostRating: 5.0, hostReviews: 137 },
  { id: 'BK-42210', space: 'Electrical Desk · Bay 04', type: 'Day Pass',
    dateLabel: 'Tuesday – 28/04/2026', timeRange: '8:00 AM – 6:00 PM', duration: 'Full day',
    location: 'MODON, Sustainable Innovations, Ground Floor, Room 201',
    address: '7XJ8+V98, Dammam 2nd Industrial City',
    total: 150.00, status: 'upcoming',
    addons: ['3D Printer Access', 'Component Starter Kit'],
    host: 'Sustainable Innovations', hostRating: 5.0, hostReviews: 137 },
  { id: 'BK-39541', space: 'Resin Lab · Ventilated', type: 'Hourly · 2 hrs',
    dateLabel: 'Thursday – 12/03/2026', timeRange: '10:00 AM – 12:00 PM', duration: '2 hours',
    location: 'TechCraft Studios, Level 2, Riyadh 2nd Industrial Zone',
    address: 'TechCraft Studios · Riyadh 2nd Industrial Zone',
    total: 50.00, status: 'completed',
    addons: ['Ventilation system', 'UV curing lamp'],
    host: 'TechCraft Studios', hostRating: 4.8, hostReviews: 89 },
];

/* ---------- decorative QR ---------- */
function QRMark({ size = 80 }) {
  const px = size / 21;
  const finders = [
    [0,0,7,7,'#fff'],[1,1,5,5,'#0135F4'],[2,2,3,3,'#fff'],
    [14,0,7,7,'#fff'],[15,1,5,5,'#0135F4'],[16,2,3,3,'#fff'],
    [0,14,7,7,'#fff'],[1,15,5,5,'#0135F4'],[2,16,3,3,'#fff'],
  ];
  const data = [];
  for (let x = 8; x <= 20; x++) for (let y = 8; y <= 20; y++) if ((x * 3 + y * 7 + 11) % 3 !== 0) data.push([x, y]);
  for (let i = 8; i <= 20; i++) { if ((i * 2 + 5) % 3 !== 0) data.push([7, i]); if ((i * 4 + 3) % 3 !== 0) data.push([i, 7]); }
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block' }} aria-hidden="true">
      {finders.map(([x,y,w,h,c],i) => <rect key={i} x={x*px} y={y*px} width={w*px} height={h*px} fill={c} />)}
      {data.map(([x,y],i) => <rect key={`d${i}`} x={x*px} y={y*px} width={px*0.9} height={px*0.9} fill="#fff" />)}
    </svg>
  );
}

/* ---------- map placeholder ---------- */
function MapPlaceholder() {
  return (
    <div style={{ width: '100%', height: 210, background: '#e4e8f0', position: 'relative', overflow: 'hidden' }}>
      <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0 }} preserveAspectRatio="xMidYMid slice">
        {/* road grid */}
        {[28,58,90,125,160,190].map(y => <line key={`h${y}`} x1="0" y1={y} x2="800" y2={y} stroke="#fff" strokeWidth="7" />)}
        {[60,140,230,330,440,560].map(x => <line key={`v${x}`} x1={x} y1="0" x2={x} y2="250" stroke="#fff" strokeWidth="7" />)}
        {/* city blocks */}
        {[[10,10,42,15],[72,10,58,15],[72,35,58,20],[170,10,50,25],[170,60,50,25],[280,10,40,15],[280,35,40,48],[350,10,75,35],[350,60,75,26],[10,32,42,53],[10,100,42,55],[72,100,145,55],[10,170,310,15]].map(([x,y,w,h],i) => (
          <rect key={`blk${i}`} x={x} y={y} width={w} height={h} fill="#d8dce8" rx="1" />
        ))}
        {/* highlight block */}
        <rect x="280" y="35" width="40" height="48" fill="#bfc5d8" rx="1" />
        {/* pin */}
        <g transform="translate(310, 58)">
          <circle cx="0" cy="-15" r="12" fill="#C8302A" stroke="#fff" strokeWidth="2" />
          <circle cx="0" cy="-15" r="5" fill="#fff" />
          <path d="M0 0 L-7 -10 L7 -10 Z" fill="#C8302A" />
        </g>
      </svg>
      {/* subtle label */}
      <div style={{ position: 'absolute', bottom: 8, right: 10, fontSize: 10, color: '#888', background: 'rgba(255,255,255,0.8)', padding: '2px 6px', borderRadius: 3 }}>© OpenStreetMap</div>
    </div>
  );
}

/* ---------- access pass card ---------- */
function AccessPass({ bk }) {
  return (
    <div className="chamfer access-pass-grid" style={{ background: 'var(--ff-navy)', color: '#fff', padding: '28px 32px', display: 'grid', gridTemplateColumns: '1fr auto', gap: 28, alignItems: 'start', position: 'relative', overflow: 'hidden' }}>
      {/* watermark */}
      <div style={{ position: 'absolute', right: -10, bottom: -20, opacity: 0.05, pointerEvents: 'none', transform: 'scale(5.5)', transformOrigin: 'bottom right' }}>
        <FFMark size={50} accent />
      </div>
      {/* left */}
      <div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(255,255,255,0.1)', padding: '5px 14px', borderRadius: 20, marginBottom: 16 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--ff-lime)', display: 'inline-block', flexShrink: 0 }} />
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em' }}>ACCESS PASS</span>
        </div>
        <h2 className="access-pass-title" style={{ margin: '0 0 22px', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 46, letterSpacing: '-0.03em', lineHeight: 1 }}>{bk.space}</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px 36px' }}>
          {[['DATE', bk.dateLabel.split('–')[1]?.trim() || bk.dateLabel],
            ['TIME', bk.timeRange],
            ['LOCATION', bk.location]].map(([label, val]) => (
            <div key={label}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.45)', marginBottom: 4 }}>{label}</div>
              <div style={{ fontSize: label === 'LOCATION' ? 13 : 15, fontWeight: 700, color: 'var(--ff-lime)', maxWidth: label === 'LOCATION' ? 340 : 'none' }}>{val}</div>
            </div>
          ))}
        </div>
      </div>
      {/* right: QR */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, paddingTop: 4 }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', color: 'rgba(255,255,255,0.5)', alignSelf: 'flex-start', marginBottom: 4 }}>{bk.id}</div>
        <div style={{ background: 'var(--ff-blue)', padding: 10, borderRadius: 3 }}>
          <QRMark size={82} />
        </div>
        <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.05em', fontWeight: 600 }}>Scan at reception</div>
      </div>
    </div>
  );
}

/* ---------- booking detail ---------- */
function BookingDetail({ bk, onBack }) {
  const toast = useToast();
  const statusTone = { confirmed: 'navy', upcoming: 'blue', completed: 'gray' };
  return (
    <div>
      {/* breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--ink-3)', marginBottom: 22, flexWrap: 'wrap' }}>
        <button onClick={onBack} style={{ border: 'none', background: 'transparent', padding: 0, color: 'var(--ink-3)', cursor: 'pointer', fontSize: 13 }}>Account</button>
        <Icon name="chevR" size={13} />
        <button onClick={onBack} style={{ border: 'none', background: 'transparent', padding: 0, color: 'var(--ink-3)', cursor: 'pointer', fontSize: 13 }}>Bookings</button>
        <Icon name="chevR" size={13} />
        <span style={{ color: 'var(--ink)', fontWeight: 600 }}>{bk.id}</span>
      </div>
      <div className="booking-detail-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 316px', gap: 22, alignItems: 'start' }}>
        {/* main col */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <AccessPass bk={bk} />
          {/* location */}
          <div className="chamfer" style={{ background: 'var(--surface)', border: '1px solid var(--line)', overflow: 'hidden' }}>
            <div style={{ padding: '20px 22px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, letterSpacing: '0.08em', color: 'var(--ff-blue)' }}>LOCATION</h3>
              <Button kind="primary" size="sm" icon="pin">GET DIRECTIONS</Button>
            </div>
            <div style={{ padding: '0 22px 18px', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <Icon name="pin" size={16} style={{ color: 'var(--ff-blue)', marginTop: 2, flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{bk.host}</div>
                <div style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 2 }}>{bk.address}</div>
              </div>
            </div>
            <MapPlaceholder />
          </div>
          {/* equipment */}
          <div className="chamfer" style={{ background: 'var(--surface)', border: '1px solid var(--line)', padding: '20px 22px' }}>
            <h3 style={{ margin: '0 0 18px', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, letterSpacing: '0.08em', color: 'var(--ff-blue)' }}>EQUIPMENT &amp; ADD-ONS</h3>
            <div className="booking-addons-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '11px 24px' }}>
              {bk.addons.map(a => (
                <div key={a} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13.5 }}>
                  <span style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--ff-lime)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon name="check" size={11} style={{ color: 'var(--ff-navy)' }} stroke={3} />
                  </span>
                  {a}
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* right rail */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* summary */}
          <div className="chamfer" style={{ background: 'var(--surface)', border: '1px solid var(--line)', padding: '20px 22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, letterSpacing: '0.08em' }}>BOOKING SUMMARY</h3>
              <Tag tone={statusTone[bk.status]}>{bk.status.toUpperCase()}</Tag>
            </div>
            {[['Date', bk.dateLabel], ['Time', bk.timeRange], ['Duration', bk.duration]].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '10px 0', borderTop: '1px solid var(--line)', fontSize: 14 }}>
                <span style={{ color: 'var(--ink-3)', flexShrink: 0 }}>{k}</span>
                <span style={{ fontWeight: 700, textAlign: 'right', marginLeft: 12 }}>{v}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderTop: '1px solid var(--line)' }}>
              <span style={{ fontSize: 14, color: 'var(--ink-3)' }}>Total Paid</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 28, color: 'var(--ff-blue)', letterSpacing: '-0.03em' }}>
                <Riyal size={20} color="var(--ff-blue)" />{window.SAR2(bk.total)}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
              <Button kind="lime" full icon="download" onClick={() => toast('Gate pass downloaded')}>DOWNLOAD PASS</Button>
              <Button kind="ghost" full style={{ color: 'var(--neg)', border: '1px solid var(--neg)' }} onClick={() => toast('Cancellation requested')}>CANCEL BOOKING</Button>
              <div style={{ fontSize: 11.5, color: 'var(--ink-3)', textAlign: 'center', marginTop: 2 }}>Free cancellation until Jun 3, 2026</div>
            </div>
          </div>
          {/* host */}
          <div className="chamfer" style={{ background: 'var(--surface)', border: '1px solid var(--line)', padding: '18px 20px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.09em', color: 'var(--ink-3)', marginBottom: 14 }}>HOST</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div className="chamfer-sm" style={{ width: 46, height: 46, background: 'var(--ff-blue)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 19, flexShrink: 0 }}>{bk.host[0]}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{bk.host}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 3 }}>
                  <Stars value={bk.hostRating} size={13} />
                  <span style={{ fontSize: 12.5, color: 'var(--ink-3)' }}>{bk.hostRating.toFixed(1)} ({bk.hostReviews})</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- bookings list ---------- */
function BookingsList({ onSelect }) {
  const toneMap = { confirmed: 'navy', upcoming: 'blue', completed: 'gray' };
  return (
    <div>
      <h2 style={{ margin: '0 0 22px', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, letterSpacing: '-0.02em' }}>My Bookings</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {MOCK_BOOKINGS.map(bk => (
          <button key={bk.id} onClick={() => onSelect(bk)}
            className="chamfer"
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--ff-blue)'; e.currentTarget.style.boxShadow = 'var(--shadow)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--line)'; e.currentTarget.style.boxShadow = 'none'; }}
            style={{ background: 'var(--surface)', border: '1px solid var(--line)', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 16, textAlign: 'left', cursor: 'pointer', width: '100%', transition: 'border-color .15s, box-shadow .15s' }}>
            <div className="chamfer-sm" style={{ width: 48, height: 48, background: 'var(--ff-fog)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ff-blue)', flexShrink: 0 }}>
              <Icon name="calendar" size={22} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{bk.space}</div>
              <div style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 2 }}>{bk.dateLabel} · {bk.timeRange}</div>
              <div style={{ fontSize: 12.5, color: 'var(--ink-3)', marginTop: 1 }}>{bk.id} · {bk.type}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
              <Tag tone={toneMap[bk.status]}>{bk.status}</Tag>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16 }}>
                <Riyal size={12} />{window.SAR2(bk.total)}
              </span>
            </div>
            <Icon name="chevR" size={16} style={{ color: 'var(--ink-3)', flexShrink: 0 }} />
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------- rewards tier badge ---------- */
function TierBadge({ tier, size = 'sm' }) {
  if (!tier) return null;
  const lg = size === 'lg';
  return (
    <span className="chamfer-sm" style={{ height: lg ? 34 : 28, padding: lg ? '0 15px' : '0 12px', display: 'inline-flex', alignItems: 'center', gap: 6, background: tier.color, color: tier.fg, fontSize: lg ? 13.5 : 12.5, fontWeight: 700, flexShrink: 0 }}>
      <Icon name="star" size={lg ? 14 : 12} fill />{tier.name}
    </span>
  );
}

/* ---------- rewards card ---------- */
function RewardsCard({ count = MOCK_BOOKINGS.length }) {
  const r = window.getRewardStatus(count);
  return (
    <div className="chamfer" style={{ background: 'var(--ff-navy)', color: '#fff', padding: '24px 28px', position: 'relative', overflow: 'hidden' }}>
      {/* watermark */}
      <div style={{ position: 'absolute', right: -10, bottom: -20, opacity: 0.05, pointerEvents: 'none', transform: 'scale(5.5)', transformOrigin: 'bottom right' }}>
        <FFMark size={50} accent />
      </div>
      {/* header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, position: 'relative' }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--ff-lime)', marginBottom: 6 }}>REWARDS</div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 28, letterSpacing: '-0.03em', lineHeight: 1 }}>
            {r.current ? `${r.current.name} member` : 'Start earning'}
          </div>
        </div>
        <TierBadge tier={r.current} size="lg" />
      </div>
      {/* stats */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px 36px', margin: '18px 0 20px', position: 'relative' }}>
        {[['TOTAL BOOKINGS', String(r.count)],
          ['CURRENT PERK', r.current && r.current.discount > 0 ? `${r.current.discount}% off bookings` : 'Member status'],
          ...(r.next ? [['NEXT TIER', `${r.next.name} · ${r.next.discount}% off`]] : []),
        ].map(([label, val]) => (
          <div key={label}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.45)', marginBottom: 4 }}>{label}</div>
            <div className={label === 'TOTAL BOOKINGS' ? 'mono-fig' : undefined} style={{ fontSize: label === 'TOTAL BOOKINGS' ? 22 : 15, fontWeight: 700, color: 'var(--ff-lime)' }}>{val}</div>
          </div>
        ))}
      </div>
      {/* progress */}
      <div style={{ position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, fontSize: 12.5, marginBottom: 8, flexWrap: 'wrap' }}>
          {r.next ? (
            <React.Fragment>
              <span><strong>{r.remaining} more booking{r.remaining === 1 ? '' : 's'}</strong> to {r.next.name}</span>
              <span style={{ color: 'var(--ff-lime)', fontWeight: 700 }}>unlocks {r.next.discount}% off</span>
            </React.Fragment>
          ) : (
            <span style={{ fontWeight: 700 }}>Top tier reached — {r.current.discount}% off every booking</span>
          )}
        </div>
        <div style={{ height: 8, background: 'rgba(255,255,255,0.15)' }}>
          <div style={{ height: '100%', width: `${r.progress}%`, background: 'var(--ff-lime)', transition: 'width .6s cubic-bezier(.2,.7,.3,1)' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 7, fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em', color: 'rgba(255,255,255,0.45)' }}>
          {REWARD_TIERS.map(t => <span key={t.id}>{t.name.toUpperCase()} · {t.min}</span>)}
        </div>
      </div>
    </div>
  );
}

/* ---------- profile page ---------- */
function ProfilePage({ onSignOut }) {
  const c = window.CLIENT;
  const tier = window.getRewardStatus(MOCK_BOOKINGS.length).current;
  return (
    <div>
      <h2 style={{ margin: '0 0 22px', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, letterSpacing: '-0.02em' }}>Profile</h2>
      <div className="chamfer" style={{ background: 'var(--surface)', border: '1px solid var(--line)', padding: '28px 28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 24 }}>
          <Avatar name={c.fullName} size={64} />
          <div>
            <div style={{ fontWeight: 700, fontSize: 20 }}>{c.fullName}</div>
            <div style={{ fontSize: 13.5, color: 'var(--ink-3)', marginTop: 4 }}>{c.email}</div>
            <div style={{ fontSize: 13, color: 'var(--ink-3)' }}>{c.city}</div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <TierBadge tier={tier} />
            {c.subscriber && <span className="chamfer-sm" style={{ height: 28, padding: '0 12px', display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--ff-lime)', color: 'var(--ff-navy)', fontSize: 12.5, fontWeight: 700 }}><Icon name="star" size={12} fill />Subscriber</span>}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Button kind="secondary" icon="edit">Edit profile</Button>
          <div style={{ flex: 1 }} />
          <Button kind="ghost" icon="logout" onClick={onSignOut}>Sign out</Button>
        </div>
      </div>
      <div style={{ marginTop: 16 }}>
        <RewardsCard />
      </div>
    </div>
  );
}

/* ---------- mobile account tab bar ---------- */
function MobileAcctTabs({ active, setActive }) {
  return (
    <div className="mobile-acct-tabs" style={{ display: 'none', overflowX: 'auto', background: 'var(--surface)', borderBottom: '1px solid var(--line)', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', flexShrink: 0 }}>
      <div style={{ display: 'flex', minWidth: 'max-content', padding: '0 4px' }}>
        {ACCT_NAV.map(item => {
          const on = active === item.id;
          return (
            <button key={item.id} onClick={() => setActive(item.id)}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '10px 16px 8px', border: 'none', borderBottom: on ? '2px solid var(--ff-blue)' : '2px solid transparent', background: 'transparent', color: on ? 'var(--ff-blue)' : 'var(--ink-3)', fontWeight: on ? 700 : 500, fontSize: 10.5, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0, letterSpacing: '0.03em', transition: 'color .15s' }}>
              <Icon name={item.icon} size={20} />
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- sidebar ---------- */
const ACCT_NAV = [
  { id: 'profile',  label: 'Profile',   icon: 'users'    },
  { id: 'security', label: 'Security',  icon: 'eye'      },
  { id: 'quotes',   label: 'Quotes',    icon: 'file'     },
  { id: 'orders',   label: 'Orders',    icon: 'box'      },
  { id: 'bookings', label: 'Bookings',  icon: 'calendar' },
  { id: 'support',  label: 'Support',   icon: 'phone'    },
];

function AccountSidebar({ active, setActive }) {
  return (
    <aside className="acct-sidebar" style={{ width: 220, flexShrink: 0, background: '#0C3997', borderRight: 'none', height: 'calc(100vh - 72px - 32px)', display: 'flex', flexDirection: 'column', position: 'sticky', top: 88, margin: '16px 0 16px 16px', alignSelf: 'flex-start', overflow: 'hidden', clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 36px), calc(100% - 36px) 100%, 0 100%)' }}>
      {/* watermark */}
      <div style={{ position: 'absolute', bottom: 40, left: -40, opacity: 0.07, pointerEvents: 'none', transform: 'scale(5)', transformOrigin: 'bottom left' }}>
        <FFMark size={70} accent />
      </div>
      <nav style={{ padding: '18px 0', flex: 1, position: 'relative' }}>
        {ACCT_NAV.map(item => {
          const on = active === item.id;
          return (
            <button key={item.id} onClick={() => setActive(item.id)}
              style={{ width: '100%', border: 'none', borderLeft: on ? '3px solid var(--ff-lime)' : '3px solid transparent', background: on ? 'rgba(255,255,255,0.13)' : 'transparent', display: 'flex', alignItems: 'center', gap: 13, padding: '13px 20px', fontSize: 14.5, fontWeight: on ? 700 : 500, color: on ? '#fff' : 'rgba(255,255,255,0.6)', textAlign: 'left', cursor: 'pointer', transition: 'all .15s' }}>
              <Icon name={item.icon} size={18} />
              {item.label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

/* ---------- account shell (exported) ---------- */
function AccountShell({ go, onSignOut, initialSub, initialBooking, initialOrder, initialQuote }) {
  const [sub, setSub] = useAcct(initialSub || 'bookings');
  const [booking, setBooking] = useAcct(initialBooking || null);
  const [order, setOrder] = useAcct(initialOrder || null);
  const [quote, setQuote] = useAcct(initialQuote || null);

  const setActive = (id) => { setSub(id); setBooking(null); setOrder(null); setQuote(null); };

  let content;
  if (sub === 'bookings' && booking) {
    content = <BookingDetail bk={booking} onBack={() => setBooking(null)} />;
  } else if (sub === 'bookings') {
    content = <BookingsList onSelect={bk => setBooking(bk)} />;
  } else if (sub === 'orders' && order) {
    content = <OrderDetail order={order} onBack={() => setOrder(null)} />;
  } else if (sub === 'orders') {
    content = <OrdersList onSelect={ord => setOrder(ord)} />;
  } else if (sub === 'quotes' && quote) {
    content = <QuoteDetail quote={quote} onBack={() => setQuote(null)} />;
  } else if (sub === 'quotes') {
    content = <QuotesList onSelect={q => setQuote(q)} />;
  } else {
    content = <ProfilePage onSignOut={onSignOut} />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 72px)' }}>
      <MobileAcctTabs active={sub} setActive={setActive} />
      <div style={{ display: 'flex', alignItems: 'flex-start', flex: 1 }}>
        <AccountSidebar active={sub} setActive={setActive} />
        <div key={sub + (booking ? booking.id : '') + (order ? order.id : '') + (quote ? quote.id : '')} className="acct-content" style={{ flex: 1, minWidth: 0, padding: '32px 38px 72px', animation: 'ff-fade .2s ease' }}>
          {content}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { AccountShell, MOCK_BOOKINGS, TierBadge, RewardsCard });
