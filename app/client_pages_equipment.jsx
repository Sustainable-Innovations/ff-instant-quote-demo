// client_pages_equipment.jsx — equipment rental detail (rent by day/week/month, or lease-as-quote)
const { useState: useEq } = React;

function RentTier({ tier, selected, onSelect }) {
  return (
    <button onClick={onSelect} className="chamfer-sm focus-lime" style={{
      textAlign: 'left', padding: '14px 16px', border: '2px solid ' + (selected ? 'var(--ff-blue)' : 'var(--line-strong)'),
      background: selected ? 'rgba(1,53,244,0.05)' : 'var(--surface)', cursor: 'pointer', transition: 'border-color .15s, background .15s', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
    }}>
      <span>
        <span style={{ display: 'block', fontWeight: 700, fontSize: 14.5 }}>{tier.name}</span>
        {tier.save && <span style={{ display: 'inline-block', marginTop: 4, fontSize: 11, fontWeight: 700, color: 'var(--pos)', background: 'var(--pos-bg)', padding: '2px 7px' }}>{tier.save}</span>}
      </span>
      <Price value={tier.price} unit={tier.unit} size={18} color={selected ? 'var(--ff-blue)' : 'var(--ink)'} gap={4} />
    </button>
  );
}

function EquipmentDetailPage({ route, go, authed, requireAuth }) {
  const toast = useToast();
  const item = (window.EQUIPMENT || []).find(e => e.id === route.id) || window.EQUIPMENT[0];
  const tiers = [
    { id: 'day', name: 'Daily', price: item.from, unit: '/ day' },
    { id: 'week', name: 'Weekly', price: item.from * 6, unit: '/ week', save: 'SAVE 14%' },
    { id: 'month', name: 'Monthly', price: item.from * 22, unit: '/ month', save: 'SAVE 27%' },
  ];
  const ADDONS = [
    { id: 'delivery', name: 'Site delivery coordination', price: 250, unit: 'flat' },
    { id: 'operator', name: 'Certified operator shift', price: 220, unit: '/ day' },
    { id: 'insurance', name: 'Damage waiver', price: 90, unit: '/ day' },
  ];
  const [tier, setTier] = useEq(tiers[0]);
  const [addons, setAddons] = useEq([]);
  const toggle = (id) => setAddons(a => a.includes(id) ? a.filter(x => x !== id) : [...a, id]);
  const addTotal = ADDONS.filter(a => addons.includes(a.id)).reduce((s, a) => s + a.price, 0);
  const total = tier.price + addTotal;

  const placeRental = () => requireAuth(() => {
    const bks = window.MOCK_BOOKINGS || [];
    const today = new Date();
    const chosen = ADDONS.filter(a => addons.includes(a.id)).map(a => a.name);
    bks.unshift({
      id: 'RNT-' + (43900 + bks.length), rental: true, space: item.title, type: 'Rental · ' + tier.name,
      dateLabel: today.toLocaleDateString('en-US', { weekday: 'long' }) + ' – ' + today.toLocaleDateString('en-GB'),
      timeRange: tier.name + ' rental', duration: tier.name, location: item.vendor + ' · ' + item.city,
      address: item.city, total, status: 'upcoming',
      addons: chosen.length ? chosen : ['Standard rental — no add-ons'],
      host: item.vendor, hostRating: item.rating, hostReviews: item.reviews,
    });
    toast('Rental booked — see Bookings & Rentals');
    go({ name: 'account', sub: 'bookings' });
  });

  const requestLease = () => requireAuth(() => {
    const qs = window.MOCK_QUOTES || [];
    qs.unshift({
      id: 'QT-' + (2300 + qs.length), service: 'Lease · ' + item.title, vendor: item.vendor, city: item.city,
      cat: 'Equipment', icon: 'truck', qty: '3+ months', specs: 'Long-term lease enquiry',
      files: [], submitted: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      status: 'pending_review', providerQuote: null, messages: [],
    });
    toast('Lease quote requested — see Account → Quotes');
    go({ name: 'account', sub: 'quotes' });
  });

  const related = (window.MATERIALS || []).slice(0, 4);

  return (
    <div style={{ maxWidth: 1240, margin: '0 auto', padding: '24px 28px 64px' }}>
      {/* breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--ink-3)', marginBottom: 18, flexWrap: 'wrap' }}>
        <button onClick={() => go({ name: 'home' })} style={{ border: 'none', background: 'transparent', padding: 0, color: 'var(--ink-3)', cursor: 'pointer', fontSize: 13 }}>Home</button>
        <Icon name="chevR" size={13} />
        <button onClick={() => go({ name: 'browse', kind: 'equipment' })} style={{ border: 'none', background: 'transparent', padding: 0, color: 'var(--ink-3)', cursor: 'pointer', fontSize: 13 }}>Rent</button>
        <Icon name="chevR" size={13} />
        <span style={{ color: 'var(--ink)', fontWeight: 600 }}>{item.title}</span>
      </div>

      <div className="detail-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 28, alignItems: 'start' }}>
        {/* main */}
        <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div className="chamfer" style={{ overflow: 'hidden', border: '1px solid var(--line)', background: 'var(--surface)' }}>
            <Thumb icon={item.icon} tone="slate" h={360} image={item.image} alt={item.title} imageFit="contain" />
          </div>
          <div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
              {item.tags.map(t => <Tag key={t} tone="blue">{t}</Tag>)}
              {item.lease && <Tag tone="purple">Lease available</Tag>}
            </div>
            <h1 style={{ margin: '0 0 8px', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 32, letterSpacing: '-0.03em' }}>{item.title}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <Stars value={item.rating} reviews={item.reviews} />
              <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--ink-3)' }} />
              <span style={{ fontSize: 13, color: 'var(--ink-3)' }}>{item.vendor} · {item.city}</span>
            </div>
          </div>
          <div className="chamfer" style={{ background: 'var(--surface)', border: '1px solid var(--line)', padding: '20px 24px' }}>
            <h2 style={{ margin: '0 0 12px', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, letterSpacing: '0.08em', color: 'var(--ff-blue)' }}>ABOUT THIS EQUIPMENT</h2>
            <p style={{ margin: 0, fontSize: 14.5, color: 'var(--ink-2)', lineHeight: 1.7 }}>{item.blurb}</p>
          </div>
          {item.specs && item.specs.length > 0 && (
            <div className="chamfer" style={{ background: 'var(--surface)', border: '1px solid var(--line)', padding: '20px 24px' }}>
              <h2 style={{ margin: '0 0 14px', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, letterSpacing: '0.08em', color: 'var(--ff-blue)' }}>MACHINE SPECS</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }} className="incl-grid">
                {item.specs.map(([k, v]) => (
                  <div key={k} className="chamfer-sm" style={{ background: 'var(--ff-fog)', border: '1px solid var(--line)', padding: '12px 14px' }}>
                    <div style={{ fontSize: 11.5, color: 'var(--ink-3)', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{k}</div>
                    <div style={{ fontSize: 13.5, color: 'var(--ink)', fontWeight: 700, marginTop: 4 }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="chamfer" style={{ background: 'var(--surface)', border: '1px solid var(--line)', padding: '20px 24px' }}>
            <h2 style={{ margin: '0 0 14px', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, letterSpacing: '0.08em', color: 'var(--ff-blue)' }}>LOGISTICS & REQUIREMENTS</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 18px' }} className="pick-grid">
              {[['Capacity', item.capacity], ['Operator', item.operator], ['Delivery', item.delivery], ['Fuel', item.fuel], ['Training', item.training], ['Deposit', 'Refundable deposit SAR ' + window.SAR(item.deposit)]].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <Icon name={k === 'Delivery' ? 'truck' : k === 'Deposit' ? 'wallet' : 'check'} size={16} style={{ color: 'var(--ff-blue)', flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-3)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>{k}</div>
                    <div style={{ fontSize: 13.5, color: 'var(--ink-2)', fontWeight: 600, marginTop: 2, lineHeight: 1.45 }}>{v}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* trust */}
          <div className="chamfer" style={{ background: 'var(--ff-fog)', border: '1px solid var(--line)', padding: '16px 20px', display: 'flex', flexWrap: 'wrap', gap: '12px 28px' }}>
            {[['check', 'Verified fleet'], ['wallet', 'Refundable deposit'], ['gear', 'Inspected before dispatch'], ['phone', 'Operator support']].map(([ic, t]) => (
              <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: 'var(--ink-2)' }}>
                <Icon name={ic} size={16} style={{ color: 'var(--ff-blue)' }} />{t}
              </span>
            ))}
          </div>
          {/* cross-sell */}
          <div>
            <h2 style={{ margin: '4px 0 14px', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, letterSpacing: '-0.02em' }}>Stock up on materials</h2>
            <div className="results-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, alignItems: 'stretch' }}>
              {related.map(it => <ListingCard key={it.id} item={it} onOpen={() => go({ name: 'product', id: it.id, kind: 'material' })} onAdd={window.__ffAddToCart} />)}
            </div>
          </div>
        </div>

        {/* rail */}
        <div className="detail-rail" style={{ position: 'sticky', top: 88, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="chamfer" style={{ background: 'var(--surface)', border: '1px solid var(--line)', padding: '20px 22px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.09em', color: 'var(--ink-3)', marginBottom: 12 }}>CHOOSE RENTAL PERIOD</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {tiers.map(t => <RentTier key={t.id} tier={t} selected={tier.id === t.id} onSelect={() => setTier(t)} />)}
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.09em', color: 'var(--ink-3)', margin: '18px 0 10px' }}>ADD-ONS</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {ADDONS.map(a => {
                const on = addons.includes(a.id);
                return (
                  <button key={a.id} onClick={() => toggle(a.id)} className="focus-lime" style={{ display: 'flex', alignItems: 'center', gap: 10, border: 'none', background: 'transparent', padding: '4px 0', textAlign: 'left', cursor: 'pointer' }}>
                    <span className="chamfer-sm" style={{ width: 20, height: 20, flexShrink: 0, border: '2px solid ' + (on ? 'var(--ff-blue)' : 'var(--line-strong)'), background: on ? 'var(--ff-blue)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {on && <Icon name="check" size={12} stroke={3} style={{ color: '#fff' }} />}
                    </span>
                    <span style={{ flex: 1, fontSize: 13.5, color: 'var(--ink-2)' }}>{a.name}</span>
                    <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--ink-3)', display: 'inline-flex', alignItems: 'center', gap: 3 }}><Riyal size={11} />{window.SAR(a.price)} {a.unit}</span>
                  </button>
                );
              })}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0 12px', borderTop: '1px solid var(--line)', marginTop: 16 }}>
              <span style={{ fontSize: 14, color: 'var(--ink-3)' }}>Est. total</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 26, color: 'var(--ff-blue)', letterSpacing: '-0.03em' }} className="mono-fig">
                <Riyal size={18} color="var(--ff-blue)" />{window.SAR(total)}
              </span>
            </div>
            <Button kind="lime" full iconRight="chevR" onClick={placeRental} style={{ fontWeight: 700 }}>RENT NOW</Button>
            <div style={{ fontSize: 12, color: 'var(--ink-3)', textAlign: 'center', marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 5, justifyContent: 'center', width: '100%' }}>
              <Icon name="wallet" size={13} />Refundable deposit <Riyal size={10} />{window.SAR(item.deposit)}
            </div>
          </div>
          {item.lease && (
            <div className="chamfer" style={{ background: 'var(--ff-navy)', color: '#fff', padding: '18px 20px' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Need it longer?</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 14, lineHeight: 1.5 }}>Lease this machine for 3+ months at a custom rate. We'll send a tailored quote.</div>
              <Button kind="secondary" full icon="file" onClick={requestLease} style={{ background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.4)' }}>REQUEST LEASE QUOTE</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { EquipmentDetailPage });
