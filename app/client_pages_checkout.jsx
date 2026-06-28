// client_pages_checkout.jsx — multi-step materials checkout (Delivery → Payment → Review)
const { useState: useCo } = React;

const CO_STEPS = ['Delivery', 'Payment', 'Review'];

function StepBar({ step }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 26 }}>
      {CO_STEPS.map((label, i) => {
        const done = i < step, active = i === step;
        return (
          <React.Fragment key={label}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 30, height: 30, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: done || active ? 'var(--ff-blue)' : 'var(--bg)', border: active ? '2px solid var(--ff-blue)' : done ? 'none' : '2px solid var(--line-strong)', color: done || active ? '#fff' : 'var(--ink-3)', fontWeight: 700, fontSize: 13 }}>
                {done ? <Icon name="check" size={14} stroke={3} /> : i + 1}
              </span>
              <span style={{ fontSize: 13.5, fontWeight: active ? 700 : 600, color: active ? 'var(--ink)' : done ? 'var(--ink-2)' : 'var(--ink-3)' }}>{label}</span>
            </div>
            {i < CO_STEPS.length - 1 && <div style={{ flex: 1, height: 2, margin: '0 14px', background: i < step ? 'var(--ff-blue)' : 'var(--line)' }} />}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function CoField({ label, value, onChange, onBlur, error, placeholder, type = 'text', inputMode, autoComplete, required }) {
  return (
    <label style={{ display: 'block' }}>
      <span style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: 'var(--ink-2)', marginBottom: 6 }}>{label}{required && <span style={{ color: 'var(--neg)' }}> *</span>}</span>
      <input value={value} onChange={e => onChange(e.target.value)} onBlur={onBlur} placeholder={placeholder} type={type} inputMode={inputMode} autoComplete={autoComplete}
        className="chamfer-sm focus-lime"
        style={{ width: '100%', height: 44, padding: '0 14px', fontSize: 14.5, background: 'var(--surface)', color: 'var(--ink)', border: '1px solid ' + (error ? 'var(--neg)' : 'var(--line-strong)'), outline: 'none' }} />
      {error && <span role="alert" style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--neg)', marginTop: 5 }}><Icon name="alert" size={13} />{error}</span>}
    </label>
  );
}

function CheckoutPage({ cart, clearCart, go }) {
  const toast = useToast();
  const c = window.CLIENT || {};
  const [step, setStep] = useCo(0);
  const [pay, setPay] = useCo('card');
  const [f, setF] = useCo({ name: c.fullName || '', phone: c.phone || '', address: '', city: (c.city || 'Riyadh').replace(', SA', ''), card: '', exp: '', cvc: '' });
  const [err, setErr] = useCo({});
  const set = (k, v) => setF(s => ({ ...s, [k]: v }));

  const subtotal = cart.reduce((s, x) => s + x.price * x.qty, 0);
  const vat = subtotal * 0.15;
  const total = subtotal + vat;
  const count = cart.reduce((s, x) => s + x.qty, 0);

  const rule = (k, v) => {
    if (k === 'name') return v.trim() ? '' : 'Enter your full name';
    if (k === 'phone') return /[0-9]{7,}/.test(v.replace(/\D/g, '')) ? '' : 'Enter a valid phone number';
    if (k === 'address') return v.trim().length >= 6 ? '' : 'Enter your delivery address';
    if (k === 'card') return /^[0-9 ]{12,}$/.test(v) ? '' : 'Enter a valid card number';
    if (k === 'exp') return /^[0-9]{2}\/[0-9]{2}$/.test(v) ? '' : 'MM/YY';
    if (k === 'cvc') return /^[0-9]{3,4}$/.test(v) ? '' : '3–4 digits';
    return '';
  };
  const blur = (k) => setErr(e => ({ ...e, [k]: rule(k, f[k]) }));

  const validateStep = () => {
    const keys = step === 0 ? ['name', 'phone', 'address'] : step === 1 && pay === 'card' ? ['card', 'exp', 'cvc'] : [];
    const next = {};
    keys.forEach(k => { const m = rule(k, f[k]); if (m) next[k] = m; });
    setErr(e => ({ ...e, ...next }));
    return Object.keys(next).length === 0;
  };

  const advance = () => { if (validateStep()) setStep(s => s + 1); else toast('Please fix the highlighted fields'); };

  const placeOrder = () => {
    const orders = window.MOCK_ORDERS || [];
    const id = 'ORD-' + (8830 + orders.length);
    const today = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    const order = {
      id, type: 'materials', service: count + ' material item' + (count === 1 ? '' : 's'),
      vendor: 'FlexFactory Store', city: f.city, cat: 'Materials', icon: 'cart',
      qty: count + ' items', specs: cart.map(x => x.qty + '× ' + x.title).join(', '),
      files: [], submitted: today, total,
      status: 'in_production',
      timeline: [
        { key: 'placed', label: 'Order placed', date: today, done: true },
        { key: 'packed', label: 'Packing', date: 'In progress', done: true, active: true },
        { key: 'shipped', label: 'Shipped', date: 'Pending', done: false },
        { key: 'delivered', label: 'Delivered', date: 'Pending', done: false },
      ],
      quote: { breakdown: [...cart.map(x => [x.qty + '× ' + x.title + (x.variant ? ' (' + x.variant + ')' : ''), x.price * x.qty]), ['VAT (15%)', vat], ['Delivery', 0]], total, note: 'Paid via ' + (pay === 'card' ? 'card ending ' + f.card.slice(-4) : 'cash on delivery') + ' · Deliver to ' + f.address + ', ' + f.city + '.' },
      messages: [],
    };
    orders.unshift(order);
    clearCart();
    toast('Order ' + id + ' placed — track it in Orders');
    go({ name: 'account', sub: 'orders' });
  };

  if (cart.length === 0) {
    return (
      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '28px 28px 64px' }}>
        <div className="chamfer" style={{ background: 'var(--surface)', border: '1px solid var(--line)', padding: 12 }}>
          <Empty icon="cart" title="Your cart is empty" sub="Add materials before checking out." />
          <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: 24 }}><Button kind="primary" onClick={() => go({ name: 'browse', kind: 'material' })}>SHOP MATERIALS</Button></div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '24px 28px 64px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--ink-3)', marginBottom: 18 }}>
        <button onClick={() => go({ name: 'cart' })} style={{ border: 'none', background: 'transparent', padding: 0, color: 'var(--ink-3)', cursor: 'pointer', fontSize: 13 }}>Cart</button>
        <Icon name="chevR" size={13} /><span style={{ color: 'var(--ink)', fontWeight: 600 }}>Checkout</span>
      </div>
      <h1 style={{ margin: '0 0 22px', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 30, letterSpacing: '-0.025em' }}>Checkout</h1>
      <div className="booking-detail-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 22, alignItems: 'start' }}>
        <div className="chamfer" style={{ background: 'var(--surface)', border: '1px solid var(--line)', padding: '24px 26px' }}>
          <StepBar step={step} />

          {step === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <CoField label="Full name" required value={f.name} onChange={v => set('name', v)} onBlur={() => blur('name')} error={err.name} autoComplete="name" />
              <CoField label="Phone" required type="tel" inputMode="tel" value={f.phone} onChange={v => set('phone', v)} onBlur={() => blur('phone')} error={err.phone} autoComplete="tel" />
              <CoField label="Delivery address" required value={f.address} onChange={v => set('address', v)} onBlur={() => blur('address')} error={err.address} placeholder="Building, street, district" autoComplete="street-address" />
              <label style={{ display: 'block' }}>
                <span style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: 'var(--ink-2)', marginBottom: 6 }}>City</span>
                <select value={f.city} onChange={e => set('city', e.target.value)} className="chamfer-sm focus-lime" style={{ width: '100%', height: 44, padding: '0 12px', fontSize: 14.5, background: 'var(--surface)', color: 'var(--ink)', border: '1px solid var(--line-strong)', outline: 'none' }}>
                  {(window.LOCATIONS || ['Riyadh']).map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </label>
            </div>
          )}

          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {[['card', 'Card'], ['cod', 'Cash on delivery']].map(([id, label]) => (
                  <button key={id} onClick={() => setPay(id)} className="chamfer-sm focus-lime" style={{ flex: 1, minWidth: 140, height: 46, border: '1.5px solid ' + (pay === id ? 'var(--ff-blue)' : 'var(--line-strong)'), background: pay === id ? 'rgba(1,53,244,0.05)' : 'var(--surface)', color: pay === id ? 'var(--ff-blue)' : 'var(--ink-2)', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>{label}</button>
                ))}
              </div>
              {pay === 'card' ? (
                <React.Fragment>
                  <CoField label="Card number" required inputMode="numeric" value={f.card} onChange={v => set('card', v)} onBlur={() => blur('card')} error={err.card} placeholder="4242 4242 4242 4242" autoComplete="cc-number" />
                  <div style={{ display: 'flex', gap: 14 }}>
                    <div style={{ flex: 1 }}><CoField label="Expiry" required value={f.exp} onChange={v => set('exp', v)} onBlur={() => blur('exp')} error={err.exp} placeholder="MM/YY" autoComplete="cc-exp" /></div>
                    <div style={{ flex: 1 }}><CoField label="CVC" required inputMode="numeric" value={f.cvc} onChange={v => set('cvc', v)} onBlur={() => blur('cvc')} error={err.cvc} placeholder="123" autoComplete="cc-csc" /></div>
                  </div>
                </React.Fragment>
              ) : (
                <div className="chamfer-sm" style={{ background: 'var(--ff-fog)', border: '1px solid var(--line)', padding: '16px 18px', fontSize: 13.5, color: 'var(--ink-2)', lineHeight: 1.6 }}>
                  Pay the courier on delivery. Please have the exact amount ready. A cash-handling fee may apply.
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="chamfer-sm" style={{ background: 'var(--ff-fog)', border: '1px solid var(--line)', padding: '14px 16px' }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--ink-3)', marginBottom: 8 }}>DELIVER TO</div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{f.name} · {f.phone}</div>
                <div style={{ fontSize: 13.5, color: 'var(--ink-2)', marginTop: 2 }}>{f.address}, {f.city}</div>
                <div style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 6 }}>Payment: {pay === 'card' ? 'Card ending ' + (f.card.slice(-4) || '••••') : 'Cash on delivery'}</div>
              </div>
              {cart.map(x => (
                <div key={x.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 14, padding: '6px 0' }}>
                  <span style={{ color: 'var(--ink-2)' }}>{x.qty}× {x.title}{x.variant ? ' · ' + x.variant : ''}</span>
                  <span className="mono-fig" style={{ fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}><Riyal size={11} />{window.SAR2(x.price * x.qty)}</span>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
            <Button kind="ghost" style={{ border: '1px solid var(--line-strong)' }} onClick={() => step === 0 ? go({ name: 'cart' }) : setStep(s => s - 1)}>{step === 0 ? 'Back to cart' : 'Back'}</Button>
            <div style={{ flex: 1 }} />
            {step < 2
              ? <Button kind="primary" iconRight="chevR" onClick={advance}>CONTINUE</Button>
              : <Button kind="lime" iconRight="check" onClick={placeOrder} style={{ fontWeight: 700 }}>PLACE ORDER</Button>}
          </div>
        </div>

        {/* summary */}
        <div className="chamfer" style={{ background: 'var(--surface)', border: '1px solid var(--line)', padding: '20px 22px', position: 'sticky', top: 88 }}>
          <h3 style={{ margin: '0 0 14px', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, letterSpacing: '0.08em' }}>SUMMARY <span style={{ color: 'var(--ink-3)', fontWeight: 500 }}>· {count} item{count === 1 ? '' : 's'}</span></h3>
          {[['Subtotal', subtotal], ['VAT (15%)', vat]].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderTop: '1px solid var(--line)', fontSize: 14 }}>
              <span style={{ color: 'var(--ink-3)' }}>{k}</span>
              <span className="mono-fig" style={{ fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}><Riyal size={11} />{window.SAR2(v)}</span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderTop: '1px solid var(--line)', fontSize: 14 }}>
            <span style={{ color: 'var(--ink-3)' }}>Delivery</span><span style={{ fontWeight: 700, color: 'var(--pos)' }}>FREE</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderTop: '2px solid var(--ff-blue)', marginTop: 4 }}>
            <span style={{ fontWeight: 700, fontSize: 15 }}>Total</span>
            <span className="mono-fig" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 24, color: 'var(--ff-blue)', letterSpacing: '-0.03em' }}><Riyal size={17} color="var(--ff-blue)" />{window.SAR2(total)}</span>
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--ink-3)', textAlign: 'center', marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 5, justifyContent: 'center', width: '100%' }}><Icon name="wallet" size={13} />Secure · escrow protected</div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { CheckoutPage });
